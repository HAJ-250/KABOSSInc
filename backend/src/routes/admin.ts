import { Router, Response } from 'express';
import { Op } from 'sequelize';
import User from '../models/User.js';
import Booking from '../models/Booking.js';
import Quote from '../models/Quote.js';
import Message from '../models/Message.js';
import Contact from '../models/Contact.js';
import Settings from '../models/Settings.js';
import Service from '../models/Service.js';
import Partner from '../models/Partner.js';
import Testimonial from '../models/Testimonial.js';
import FAQ from '../models/FAQ.js';
import Announcement from '../models/Announcement.js';
import Payment from '../models/Payment.js';
import { verifyTokenMiddleware, requireAdmin, AuthenticatedRequest } from '../middleware/auth.js';
import { z } from 'zod';

const router = Router();
router.use(verifyTokenMiddleware, requireAdmin);

const settingsSchema = z.object({
  heroTitle: z.string().optional(), heroSubtitle: z.string().optional(),
  mission: z.string().optional(), vision: z.string().optional(),
  coreValues: z.array(z.string()).optional(), businessHours: z.record(z.string()).optional(),
  contact: z.object({ phone: z.string().optional(), email: z.string().optional(), whatsapp: z.string().optional(), address: z.string().optional() }).optional(),
  socialMedia: z.record(z.string()).optional(),
  seo: z.object({ title: z.string().optional(), description: z.string().optional(), keywords: z.string().optional() }).optional(),
});

router.get('/stats', async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const [users, bookings, messages, contacts, services, partners, testimonials, faqs, announcements, payments, successfulPayments] = await Promise.all([
      User.count(), Booking.count(), Message.count(), Contact.count(),
      Service.count(), Partner.count(), Testimonial.count(), FAQ.count(), Announcement.count(),
      Payment.count(), Payment.count({ where: { paymentStatus: 'SUCCESS' } }),
    ]);

    // Count gallery images from settings
    let gallery = 0;
    const settingsRec = await Settings.findOne({ where: { key: 'general' } });
    if (settingsRec?.value) {
      try {
        const settings = JSON.parse(settingsRec.value);
        gallery = Array.isArray(settings.galleryImages) ? settings.galleryImages.length : 0;
      } catch {
        gallery = 0;
      }
    }

    res.json({ users, bookings, messages, contacts, services, partners, testimonials, faqs, announcements, gallery, payments, successfulPayments });
  } catch (error) { console.error('Failed to fetch stats:', error); res.status(500).json({ error: 'Failed to fetch stats' }); }
});

router.get('/users', async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const users = await User.findAll({ attributes: { exclude: ['password'] }, order: [['createdAt', 'DESC']] });
    res.json(users);
  } catch (error) { console.error('Failed to fetch users:', error); res.status(500).json({ error: 'Failed to fetch users' }); }
});

router.patch('/users/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { password, ...rest } = req.body;
    const update: any = { ...rest };
    if (password) update.password = await (await import('bcryptjs')).hash(password, 10);
    await User.update(update, { where: { id: req.params.id } });
    const user = await User.findByPk(req.params.id, { attributes: { exclude: ['password'] } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) { console.error('Failed to update user:', error); res.status(500).json({ error: 'Failed to update user' }); }
});

router.delete('/users/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    await User.destroy({ where: { id: req.params.id } });
    res.json({ message: 'User deleted' });
  } catch (error) { console.error('Failed to delete user:', error); res.status(500).json({ error: 'Failed to delete user' }); }
});

router.get('/bookings', async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const bookings = await Booking.findAll({ order: [['createdAt', 'DESC']] });
    res.json(bookings);
  } catch (error) { console.error('Failed to fetch bookings:', error); res.status(500).json({ error: 'Failed to fetch bookings' }); }
});

router.patch('/bookings/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    await Booking.update(req.body, { where: { id: req.params.id } });
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json(booking);
  } catch (error) { console.error('Failed to update booking:', error); res.status(500).json({ error: 'Failed to update booking' }); }
});

router.delete('/bookings/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    await Booking.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Booking deleted' });
  } catch (error) { console.error('Failed to delete booking:', error); res.status(500).json({ error: 'Failed to delete booking' }); }
});

router.get('/contacts', async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const contacts = await Contact.findAll({ order: [['createdAt', 'DESC']] });
    res.json(contacts);
  } catch (error) { console.error('Failed to fetch contacts:', error); res.status(500).json({ error: 'Failed to fetch contacts' }); }
});

router.patch('/contacts/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    await Contact.update(req.body, { where: { id: req.params.id } });
    const contact = await Contact.findByPk(req.params.id);
    if (!contact) return res.status(404).json({ error: 'Contact not found' });
    res.json(contact);
  } catch (error) { console.error('Failed to update contact:', error); res.status(500).json({ error: 'Failed to update contact' }); }
});

router.delete('/contacts/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    await Contact.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Contact deleted' });
  } catch (error) { console.error('Failed to delete contact:', error); res.status(500).json({ error: 'Failed to delete contact' }); }
});

router.get('/messages', async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const messages = await Message.findAll({ order: [['createdAt', 'DESC']] });
    res.json(messages);
  } catch (error) { console.error('Failed to fetch messages:', error); res.status(500).json({ error: 'Failed to fetch messages' }); }
});

router.delete('/messages/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    await Message.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Message deleted' });
  } catch (error) { console.error('Failed to delete message:', error); res.status(500).json({ error: 'Failed to delete message' }); }
});

router.get('/services', async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const services = await Service.findAll({ order: [['createdAt', 'DESC']] });
    res.json(services);
  } catch (error) { console.error('Failed to fetch services:', error); res.status(500).json({ error: 'Failed to fetch services' }); }
});

router.post('/services', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const service = await Service.create(req.body);
    res.status(201).json(service);
  } catch (error) { console.error('Failed to create service:', error); res.status(500).json({ error: 'Failed to create service' }); }
});

router.patch('/services/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    await Service.update(req.body, { where: { id: req.params.id } });
    const service = await Service.findByPk(req.params.id);
    if (!service) return res.status(404).json({ error: 'Service not found' });
    res.json(service);
  } catch (error) { console.error('Failed to update service:', error); res.status(500).json({ error: 'Failed to update service' }); }
});

router.delete('/services/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    await Service.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Service deleted' });
  } catch (error) { console.error('Failed to delete service:', error); res.status(500).json({ error: 'Failed to delete service' }); }
});

// --- Quotes ---
router.get('/quotes', async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const quotes = await Quote.findAll({ order: [['createdAt', 'DESC']] });
    res.json(quotes);
  } catch (error) { console.error('Failed to fetch quotes:', error); res.status(500).json({ error: 'Failed to fetch quotes' }); }
});

router.patch('/quotes/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    await Quote.update(req.body, { where: { id: req.params.id } });
    const quote = await Quote.findByPk(req.params.id);
    if (!quote) return res.status(404).json({ error: 'Quote not found' });
    res.json(quote);
  } catch (error) { console.error('Failed to update quote:', error); res.status(500).json({ error: 'Failed to update quote' }); }
});

router.delete('/quotes/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    await Quote.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Quote deleted' });
  } catch (error) { console.error('Failed to delete quote:', error); res.status(500).json({ error: 'Failed to delete quote' }); }
});

router.get('/partners', async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const partners = await Partner.findAll({ order: [['sortOrder', 'ASC']] });
    res.json(partners);
  } catch (error) { console.error('Failed to fetch partners:', error); res.status(500).json({ error: 'Failed to fetch partners' }); }
});

router.post('/partners', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const partner = await Partner.create(req.body);
    res.status(201).json(partner);
  } catch (error) { console.error('Failed to create partner:', error); res.status(500).json({ error: 'Failed to create partner' }); }
});

router.patch('/partners/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    await Partner.update(req.body, { where: { id: req.params.id } });
    const partner = await Partner.findByPk(req.params.id);
    if (!partner) return res.status(404).json({ error: 'Partner not found' });
    res.json(partner);
  } catch (error) { console.error('Failed to update partner:', error); res.status(500).json({ error: 'Failed to update partner' }); }
});

router.delete('/partners/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    await Partner.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Partner deleted' });
  } catch (error) { console.error('Failed to delete partner:', error); res.status(500).json({ error: 'Failed to delete partner' }); }
});

router.get('/testimonials', async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const testimonials = await Testimonial.findAll({ order: [['createdAt', 'DESC']] });
    res.json(testimonials);
  } catch (error) { console.error('Failed to fetch testimonials:', error); res.status(500).json({ error: 'Failed to fetch testimonials' }); }
});

router.post('/testimonials', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const testimonial = await Testimonial.create(req.body);
    res.status(201).json(testimonial);
  } catch (error) { console.error('Failed to create testimonial:', error); res.status(500).json({ error: 'Failed to create testimonial' }); }
});

router.patch('/testimonials/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    await Testimonial.update(req.body, { where: { id: req.params.id } });
    const testimonial = await Testimonial.findByPk(req.params.id);
    if (!testimonial) return res.status(404).json({ error: 'Testimonial not found' });
    res.json(testimonial);
  } catch (error) { console.error('Failed to update testimonial:', error); res.status(500).json({ error: 'Failed to update testimonial' }); }
});

router.delete('/testimonials/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    await Testimonial.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Testimonial deleted' });
  } catch (error) { console.error('Failed to delete testimonial:', error); res.status(500).json({ error: 'Failed to delete testimonial' }); }
});

router.get('/faqs', async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const faqs = await FAQ.findAll({ order: [['sortOrder', 'ASC']] });
    res.json(faqs);
  } catch (error) { console.error('Failed to fetch FAQs:', error); res.status(500).json({ error: 'Failed to fetch FAQs' }); }
});

router.post('/faqs', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const faq = await FAQ.create(req.body);
    res.status(201).json(faq);
  } catch (error) { console.error('Failed to create FAQ:', error); res.status(500).json({ error: 'Failed to create FAQ' }); }
});

router.patch('/faqs/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    await FAQ.update(req.body, { where: { id: req.params.id } });
    const faq = await FAQ.findByPk(req.params.id);
    if (!faq) return res.status(404).json({ error: 'FAQ not found' });
    res.json(faq);
  } catch (error) { console.error('Failed to update FAQ:', error); res.status(500).json({ error: 'Failed to update FAQ' }); }
});

router.delete('/faqs/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    await FAQ.destroy({ where: { id: req.params.id } });
    res.json({ message: 'FAQ deleted' });
  } catch (error) { console.error('Failed to delete FAQ:', error); res.status(500).json({ error: 'Failed to delete FAQ' }); }
});

router.get('/announcements', async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const announcements = await Announcement.findAll({ order: [['createdAt', 'DESC']] });
    res.json(announcements);
  } catch (error) { console.error('Failed to fetch announcements:', error); res.status(500).json({ error: 'Failed to fetch announcements' }); }
});

router.post('/announcements', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const announcement = await Announcement.create(req.body);
    res.status(201).json(announcement);
  } catch (error) { console.error('Failed to create announcement:', error); res.status(500).json({ error: 'Failed to create announcement' }); }
});

router.patch('/announcements/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    await Announcement.update(req.body, { where: { id: req.params.id } });
    const announcement = await Announcement.findByPk(req.params.id);
    if (!announcement) return res.status(404).json({ error: 'Announcement not found' });
    res.json(announcement);
  } catch (error) { console.error('Failed to update announcement:', error); res.status(500).json({ error: 'Failed to update announcement' }); }
});

router.delete('/announcements/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    await Announcement.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Announcement deleted' });
  } catch (error) { console.error('Failed to delete announcement:', error); res.status(500).json({ error: 'Failed to delete announcement' }); }
});

router.patch('/settings', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = settingsSchema.parse(req.body);
    const existing = await Settings.findOne({ where: { key: 'general' } });
    if (existing) {
      await Settings.update({ value: JSON.stringify(data) }, { where: { key: 'general' } });
    } else {
      await Settings.create({ key: 'general', value: JSON.stringify(data) });
    }
    res.json({ message: 'Settings updated' });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });
    console.error('Failed to update settings:', error); res.status(500).json({ error: 'Failed to update settings' });
  }
});

router.get('/settings', async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const settings = await Settings.findOne({ where: { key: 'general' } });
    if (settings?.value) {
      try { return res.json(JSON.parse(settings.value)); } catch { /* fall through */ }
    }
    res.json({});
  } catch (error) { console.error('Failed to fetch settings:', error); res.status(500).json({ error: 'Failed to fetch settings' }); }
});

export default router;
