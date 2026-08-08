import { Router } from 'express';
import Quote from '../models/Quote.js';
import Service from '../models/Service.js';
import { verifyTokenMiddleware } from '../middleware/auth.js';
import { z } from 'zod';
const router = Router();
const quoteSchema = z.object({
    serviceId: z.number().or(z.string()),
    serviceName: z.string(),
    budget: z.string().optional(),
    details: z.string().min(10),
});
const statusSchema = z.object({ status: z.enum(['pending', 'reviewing', 'quoted', 'accepted', 'declined']) });
// Resolve a string service slug/id to a numeric serviceId from the Service table.
async function resolveServiceId(serviceId) {
    if (typeof serviceId === 'number')
        return serviceId;
    const slug = String(serviceId).trim();
    if (/^\d+$/.test(slug))
        return parseInt(slug, 10);
    const service = await Service.findOne({ where: { category: slug } });
    return service ? service.id : 0;
}
// GET /api/quotes — authenticated user's quote requests
router.get('/', verifyTokenMiddleware, async (req, res) => {
    try {
        const quotes = await Quote.findAll({ where: { userId: req.userId }, order: [['createdAt', 'DESC']] });
        res.json(quotes);
    }
    catch (error) {
        console.error('Failed to fetch quotes:', error);
        res.status(500).json({ error: 'Failed to fetch quotes' });
    }
});
// POST /api/quotes — authenticated user requests a quote
router.post('/', verifyTokenMiddleware, async (req, res) => {
    try {
        const data = quoteSchema.parse(req.body);
        const serviceId = await resolveServiceId(data.serviceId);
        const quote = await Quote.create({
            userId: parseInt(req.userId),
            serviceId,
            serviceName: data.serviceName,
            budget: data.budget,
            details: data.details,
            status: 'pending',
        });
        // Notify user + admins
        const { default: Notification } = await import('../models/Notification.js');
        const { default: User } = await import('../models/User.js');
        await Notification.create({
            userId: parseInt(req.userId),
            type: 'booking',
            title: 'Quote request submitted',
            body: `Your quote request for "${quote.serviceName}" has been submitted successfully.`,
            isRead: false,
        });
        const admins = await User.findAll({ where: { role: 'admin' }, attributes: ['id'] });
        await Promise.all(admins.map((a) => Notification.create({
            userId: Number(a.getDataValue('id')),
            type: 'booking',
            title: 'New quote request',
            body: `New quote request for "${quote.serviceName}" from user #${quote.userId}.`,
            isRead: false,
        })));
        res.status(201).json(quote);
    }
    catch (error) {
        if (error instanceof z.ZodError)
            return res.status(400).json({ error: error.errors });
        console.error('Failed to create quote:', error);
        res.status(500).json({ error: 'Failed to create quote' });
    }
});
// PATCH /api/quotes/:id/status — user or admin updates quote status
router.patch('/:id/status', verifyTokenMiddleware, async (req, res) => {
    try {
        const { status } = statusSchema.parse(req.body);
        const quote = await Quote.findByPk(req.params.id);
        if (!quote)
            return res.status(404).json({ error: 'Quote not found' });
        if (String(quote.userId) !== req.userId && req.userRole !== 'admin')
            return res.status(403).json({ error: 'Forbidden: You can only update your own quotes' });
        const prevStatus = quote.status;
        quote.status = status;
        await quote.save();
        const { default: Notification } = await import('../models/Notification.js');
        await Notification.create({
            userId: quote.userId,
            type: 'status_update',
            title: 'Quote status updated',
            body: `Your quote request ("${quote.serviceName}") status changed from ${prevStatus} to ${status}.`,
            isRead: false,
        });
        res.json({ message: 'Quote updated' });
    }
    catch (error) {
        if (error instanceof z.ZodError)
            return res.status(400).json({ error: error.errors });
        console.error('Failed to update quote:', error);
        res.status(500).json({ error: 'Failed to update quote' });
    }
});
export default router;
//# sourceMappingURL=quotes.js.map