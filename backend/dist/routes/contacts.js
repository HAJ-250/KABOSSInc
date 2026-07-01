import { Router } from 'express';
import Contact from '../models/Contact.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { z } from 'zod';
const router = Router();
const contactSchema = z.object({
    name: z.string().min(2), email: z.string().email(),
    phone: z.string().optional(), subject: z.string().min(3), message: z.string().min(10),
});
router.post('/', authLimiter, async (req, res) => {
    try {
        const data = contactSchema.parse(req.body);
        const contact = await Contact.create(data);
        res.status(201).json({ id: contact.id, _id: String(contact.id), message: 'Message sent successfully' });
    }
    catch (error) {
        if (error instanceof z.ZodError)
            return res.status(400).json({ error: error.errors });
        console.error('Failed to send contact message:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});
export default router;
//# sourceMappingURL=contacts.js.map