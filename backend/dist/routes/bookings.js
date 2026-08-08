import { Router } from 'express';
import Booking from '../models/Booking.js';
import Service from '../models/Service.js';
import { verifyTokenMiddleware } from '../middleware/auth.js';
import { z } from 'zod';
const router = Router();
const bookingSchema = z.object({
    serviceId: z.number().or(z.string()),
    serviceName: z.string(),
    details: z.string().min(10),
    date: z.string(),
    time: z.string().optional(),
    location: z.string().optional(),
    amount: z.number().positive().optional(),
    amountCurrency: z.string().optional(),
});
const statusSchema = z.object({ status: z.enum(['pending', 'pending-payment', 'confirmed', 'approved', 'in-progress', 'completed', 'cancelled']) });
// Resolve a string service slug/id to a numeric serviceId from the Service table.
// If the service is a numeric id, use it directly. Otherwise, look up by slug/category.
async function resolveServiceId(serviceId) {
    if (typeof serviceId === 'number')
        return serviceId;
    const slug = String(serviceId).trim();
    // If it's already a numeric string, return it directly.
    if (/^\d+$/.test(slug))
        return parseInt(slug, 10);
    const service = await Service.findOne({ where: { category: slug } });
    return service ? service.id : 0; // fallback to 0 if no matching service
}
router.get('/', verifyTokenMiddleware, async (req, res) => {
    try {
        const bookings = await Booking.findAll({ where: { userId: req.userId }, order: [['createdAt', 'DESC']] });
        res.json(bookings);
    }
    catch (error) {
        console.error('Failed to fetch bookings:', error);
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
});
router.post('/', verifyTokenMiddleware, async (req, res) => {
    try {
        const data = bookingSchema.parse(req.body);
        const serviceId = await resolveServiceId(data.serviceId);
        const booking = await Booking.create({
            userId: parseInt(req.userId),
            serviceId,
            serviceName: data.serviceName,
            details: data.details,
            date: data.date,
            time: data.time,
            location: data.location,
            amount: data.amount,
            amountCurrency: data.amountCurrency || 'RWF',
            paymentStatus: 'NO_PAYMENT',
            status: 'pending',
        });
        // Notify admin + user
        const { default: Notification } = await import('../models/Notification.js');
        const { default: User } = await import('../models/User.js');
        // user notification
        await Notification.create({
            userId: parseInt(req.userId),
            type: 'booking',
            title: 'Booking submitted',
            body: `Your booking for "${booking.serviceName}" has been submitted and is pending approval.`,
            isRead: false,
        });
        // admin notification (notify all admins)
        const admins = await User.findAll({ where: { role: 'admin' }, attributes: ['id'] });
        await Promise.all(admins.map((a) => Notification.create({
            userId: Number(a.getDataValue('id')),
            type: 'booking',
            title: 'New booking request',
            body: `New booking for "${booking.serviceName}" from user #${booking.userId}.`,
            isRead: false,
        })));
        res.status(201).json(booking);
    }
    catch (error) {
        if (error instanceof z.ZodError)
            return res.status(400).json({ error: error.errors });
        console.error('Failed to create booking:', error);
        res.status(500).json({ error: 'Failed to create booking' });
    }
});
router.patch('/:id/status', verifyTokenMiddleware, async (req, res) => {
    try {
        const { status } = statusSchema.parse(req.body);
        const booking = await Booking.findByPk(req.params.id);
        if (!booking)
            return res.status(404).json({ error: 'Booking not found' });
        if (String(booking.userId) !== req.userId && req.userRole !== 'admin')
            return res.status(403).json({ error: 'Forbidden: You can only update your own bookings' });
        const prevStatus = booking.status;
        booking.status = status;
        await booking.save();
        const { default: Notification } = await import('../models/Notification.js');
        const { default: User } = await import('../models/User.js');
        // user notification
        await Notification.create({
            userId: booking.userId,
            type: 'status_update',
            title: 'Booking status updated',
            body: `Your booking ("${booking.serviceName}") status changed from ${prevStatus} to ${status}.`,
            isRead: false,
        });
        // admin notification (optional: only when admin changed)
        if (req.userRole === 'admin') {
            const admins = await User.findAll({ where: { role: 'admin' }, attributes: ['id'] });
            await Promise.all(admins.map((a) => Notification.create({
                userId: Number(a.getDataValue('id')),
                type: 'status_update',
                title: 'Booking updated',
                body: `Booking #${booking.id} status changed to ${status}.`,
                isRead: false,
            })));
        }
        res.json({ message: 'Booking updated' });
    }
    catch (error) {
        if (error instanceof z.ZodError)
            return res.status(400).json({ error: error.errors });
        console.error('Failed to update booking:', error);
        res.status(500).json({ error: 'Failed to update booking' });
    }
});
export default router;
//# sourceMappingURL=bookings.js.map