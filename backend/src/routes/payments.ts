import { Router, Response } from 'express';
import { verifyTokenMiddleware, requireAdmin, AuthenticatedRequest } from '../middleware/auth.js';
import type { NotificationType } from '../models/Notification.js';
import { z } from 'zod';
import Payment from '../models/Payment.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import {
  generateTransactionReference,
  normalizePhoneNumber,
  isValidMoMoNumber,
  requestToPay,
  getTransactionStatus,
  mapStatusToPaymentStatus,
  isSandbox,
  getSubscriptionKey,
} from '../lib/momoService.js';
import { getIO } from '../socket/index.js';

const router = Router();
router.use(verifyTokenMiddleware);

/**
 * Helper to create a notification and push it in real-time.
 */
async function notifyUser(userId: number, type: NotificationType, title: string, body: string) {
  const notif = await Notification.create({ userId, type, title, body, isRead: false });
  const io = getIO();
  if (io) {
    io.to(`user:${userId}`).emit('notification:new', {
      id: notif.id,
      type,
      title,
      body,
      isRead: false,
      createdAt: new Date(),
    });
  }
}

const initiateSchema = z.object({
  bookingId: z.number().or(z.string()),
  amount: z.number().positive(),
  phoneNumber: z.string().min(9),
  paymentMethod: z.enum(['MTN_MOMO']).default('MTN_MOMO'),
});

/**
 * POST /api/payments/initiate
 * Create a payment request for a booking and send a RequestToPay to MTN MoMo.
 */
router.post('/initiate', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parsed = initiateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors });
    }
    const data = parsed.data;

    const booking = await Booking.findByPk(data.bookingId);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (String(booking.userId) !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: You can only pay for your own bookings' });
    }

    // Prevent duplicate payments for an already-successful booking
    if (booking.paymentStatus === 'SUCCESS') {
      return res.status(409).json({ error: 'This booking has already been paid for' });
    }
    // Prevent duplicate active PENDING payments
    const existing = await Payment.findOne({
      where: { bookingId: booking.id, paymentStatus: 'PENDING' },
    });
    if (existing) {
      return res.status(409).json({ error: 'A payment is already pending for this booking' });
    }

    const phone = normalizePhoneNumber(data.phoneNumber);
    if (!isValidMoMoNumber(phone)) {
      return res.status(400).json({ error: 'Please enter a valid MTN Rwanda MoMo number (078... or 07...)' });
    }

    const externalReference = generateTransactionReference('KAB');
    const transactionId = externalReference;

    // Create the payment record first (PENDING)
    const payment = await Payment.create({
      bookingId: booking.id,
      userId: parseInt(req.userId!),
      transactionId,
      externalReference,
      amount: data.amount,
      currency: booking.amountCurrency || 'RWF',
      phoneNumber: phone,
      paymentMethod: data.paymentMethod,
      paymentStatus: 'PENDING',
    });

    // Update booking to pending-payment
    booking.status = 'pending-payment';
    booking.paymentStatus = 'PENDING';
    booking.amount = data.amount;
    booking.amountCurrency = booking.amountCurrency || 'RWF';
    await booking.save();

    // Send RequestToPay to MTN MoMo
    const payerMessage = `KABOSS Inc payment for ${booking.serviceName}`;
    const payeeNote = `Booking #${booking.id}`;
    const momo = await requestToPay(data.amount, phone, externalReference, payerMessage, payeeNote);

    // Store the MTN reference id
    payment.momoReferenceId = momo.referenceId;
    await payment.save();

    res.status(201).json({
      payment: payment.toJSON(),
      momoReferenceId: momo.referenceId,
      sandbox: isSandbox(),
      message: 'Payment request sent. Please approve the payment on your MTN MoMo phone.',
    });
  } catch (error) {
    console.error('Failed to initiate payment:', error);
    res.status(500).json({ error: 'Failed to initiate payment' });
  }
});

const confirmSchema = z.object({
  paymentId: z.number().or(z.string()),
});

/**
 * POST /api/payments/confirm
 * Check the status of a payment with MTN and update the booking.
 * In sandbox mode this simulates a successful transaction.
 */
router.post('/confirm', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parsed = confirmSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });
    const { paymentId } = parsed.data;

    const payment = await Payment.findByPk(paymentId);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    if (String(payment.userId) !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    if (payment.paymentStatus !== 'PENDING') {
      return res.json({ payment: payment.toJSON(), message: 'Payment already processed' });
    }

    const booking = await Booking.findByPk(payment.bookingId);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const momoReferenceId = payment.momoReferenceId || payment.transactionId;
    const status = await getTransactionStatus(momoReferenceId);
    const newStatus = mapStatusToPaymentStatus(status.status);

    payment.paymentStatus = newStatus;
    if (status.financialTransactionId) payment.financialTransactionId = status.financialTransactionId;
    if (status.reason) payment.failureReason = status.reason;
    await payment.save();

    if (newStatus === 'SUCCESS') {
      booking.status = 'confirmed';
      booking.paymentStatus = 'SUCCESS';
      await booking.save();

      // Notify customer
      await notifyUser(
        booking.userId,
        'payment',
        'Payment successful',
        'Your payment was successful. Your KABOSS Inc booking has been confirmed.'
      );

      // Notify admins
      const admins = await User.findAll({ where: { role: 'admin' }, attributes: ['id'] });
      await Promise.all(
        admins.map((a) =>
          notifyUser(
            Number(a.getDataValue('id')),
            'payment',
            'New payment received',
            `New payment received from customer for "${booking.serviceName}" (${payment.amount} RWF).`
          )
        )
      );
    } else if (newStatus === 'FAILED' || newStatus === 'CANCELLED') {
      booking.paymentStatus = newStatus;
      // Keep booking in pending-payment so the customer can retry
      await booking.save();
    }

    res.json({ payment: payment.toJSON(), booking: booking.toJSON() });
  } catch (error) {
    console.error('Failed to confirm payment:', error);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
});

/**
 * POST /api/payments/callback
 * MTN MoMo callback endpoint.
 * Verifies the MTN subscription key header and validates the reference
 * against pending payments before updating status.
 */
router.post('/callback', async (req, res) => {
  try {
    const subscriptionKey = req.headers['ocp-apim-subscription-key'];
    const expectedKey = getSubscriptionKey();

    if (!expectedKey || subscriptionKey !== expectedKey) {
      console.warn('MTN callback rejected: invalid or missing subscription key');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const body = req.body || {};
    const momoReferenceId =
      body?.referenceId || body?.externalId || body?.transaction?.referenceId || '';

    if (!momoReferenceId) {
      return res.status(400).json({ error: 'Missing reference' });
    }

    const payment = await Payment.findOne({
      where: { momoReferenceId, paymentStatus: 'PENDING' },
    });
    if (!payment) {
      return res.status(200).json({ message: 'Ignored' });
    }

    const booking = await Booking.findByPk(payment.bookingId);
    if (booking) {
      const status = await getTransactionStatus(momoReferenceId);
      const newStatus = mapStatusToPaymentStatus(status.status);
      payment.paymentStatus = newStatus;
      if (status.financialTransactionId) payment.financialTransactionId = status.financialTransactionId;
      if (status.reason) payment.failureReason = status.reason;
      await payment.save();

      if (newStatus === 'SUCCESS') {
        booking.status = 'confirmed';
        booking.paymentStatus = 'SUCCESS';
        await booking.save();

        await notifyUser(
          booking.userId,
          'payment',
          'Payment successful',
          'Your payment was successful. Your KABOSS Inc booking has been confirmed.'
        );

        const admins = await User.findAll({ where: { role: 'admin' }, attributes: ['id'] });
        await Promise.all(
          admins.map((a) =>
            notifyUser(
              Number(a.getDataValue('id')),
              'payment',
              'New payment received',
              `New payment received from customer for "${booking.serviceName}" (${payment.amount} RWF).`
            )
          )
        );
      }
    }

    res.status(200).json({ message: 'Callback processed' });
  } catch (error) {
    console.error('Payment callback error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/payments
 * Get the authenticated user's payment history.
 */
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const payments = await Payment.findAll({
      where: { userId: parseInt(req.userId!) },
      order: [['createdAt', 'DESC']],
    });
    res.json(payments);
  } catch (error) {
    console.error('Failed to fetch payments:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

/**
 * GET /api/payments/:id
 * Get a single payment (owner or admin only).
 */
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    if (String(payment.userId) !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    res.json(payment);
  } catch (error) {
    console.error('Failed to fetch payment:', error);
    res.status(500).json({ error: 'Failed to fetch payment' });
  }
});

/**
 * GET /api/payments/admin/all
 * Admin: list all payments.
 */
router.get('/admin/all', requireAdmin, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const payments = await Payment.findAll({ order: [['createdAt', 'DESC']] });
    res.json(payments);
  } catch (error) {
    console.error('Failed to fetch all payments:', error);
    res.status(500).json({ error: 'Failed to fetch all payments' });
  }
});

export default router;
