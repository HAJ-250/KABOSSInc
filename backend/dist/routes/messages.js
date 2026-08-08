import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { Op } from 'sequelize';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import Attachment from '../models/Attachment.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { verifyTokenMiddleware } from '../middleware/auth.js';
import { z } from 'zod';
import { getIO } from '../socket/index.js';
const router = Router();
const UPLOAD_ROOT = path.join(process.cwd(), 'uploads', 'chat');
function ensureDir(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true });
}
ensureDir(UPLOAD_ROOT);
const allowedMime = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
    'application/zip',
    'application/x-zip-compressed',
    'application/octet-stream',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);
function fileTypeFromMime(mime) {
    if (mime.startsWith('image/'))
        return 'image';
    if (mime === 'application/pdf')
        return 'pdf';
    if (mime.includes('zip') || mime === 'application/octet-stream')
        return 'zip';
    return 'document';
}
function fileFilter(_req, file, cb) {
    if (!allowedMime.has(file.mimetype)) {
        return cb(new Error('Invalid file type. Allowed: JPG, PNG, WEBP, GIF, PDF, ZIP, DOC.'));
    }
    cb(null, true);
}
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_ROOT),
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname) || '';
        const safe = ext.toLowerCase().replace(/[^a-z0-9.]/g, '');
        cb(null, `${Date.now()}-${Math.random().toString(16).slice(2)}${safe}`);
    },
});
const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});
const messageSchema = z.object({
    conversationId: z.number().or(z.string().transform(Number)),
    content: z.string().min(1),
});
// Accept JWT from Authorization header OR ?token= query param (needed for <img>.
function extractToken(req) {
    const auth = req.headers?.authorization;
    if (auth && auth.startsWith('Bearer '))
        return auth.split('Bearer ')[1];
    if (req.query?.token)
        return String(req.query.token);
    return null;
}
function parseParticipants(conv) {
    if (!conv.participants)
        return [];
    try {
        const arr = JSON.parse(conv.participants);
        return Array.isArray(arr) ? arr.map(String) : [];
    }
    catch {
        return [];
    }
}
async function getAdminUserId() {
    const admin = await User.findOne({ where: { role: 'admin' } });
    return admin ? admin.id : null;
}
async function ensureParticipant(conversationId, userId) {
    if (!userId)
        throw new Error('Unauthorized');
    const conv = await Conversation.findByPk(conversationId);
    if (!conv)
        throw new Error('Conversation not found');
    if (!parseParticipants(conv).includes(userId))
        throw new Error('Forbidden: Not a conversation participant');
}
async function emitNewMessageToConversation(conversationId, payload) {
    const io = getIO();
    if (!io)
        return;
    const conv = await Conversation.findByPk(conversationId);
    if (!conv)
        return;
    const participants = parseParticipants(conv);
    participants.forEach((pid) => {
        io.to(`user:${pid}`).emit('conversation:update', {
            conversationId,
            lastMessage: payload.message?.content || '📎 Attachment',
            lastMessageAt: new Date(),
        });
    });
    io.to(`conversation:${conversationId}`).emit('message:new', {
        conversationId,
        message: payload.message,
    });
}
// GET /api/messages/conversations — list my conversations (customer)
router.get('/conversations', verifyTokenMiddleware, async (req, res) => {
    try {
        const all = await Conversation.findAll({ order: [['lastMessageAt', 'DESC']] });
        const conversations = all.filter((c) => parseParticipants(c).includes(req.userId));
        const results = await Promise.all(conversations.map(async (c) => {
            const unread = await Message.count({
                where: { conversationId: c.id, senderId: { [Op.ne]: parseInt(req.userId) }, isRead: false },
            });
            return { ...c.toJSON(), unread };
        }));
        res.json(results);
    }
    catch (error) {
        console.error('Failed to fetch conversations:', error);
        res.status(500).json({ error: 'Failed to fetch conversations' });
    }
});
// POST /api/messages/conversations — auto-create a conversation with the admin
router.post('/conversations', verifyTokenMiddleware, async (req, res) => {
    try {
        const userId = String(req.userId);
        const adminId = await getAdminUserId();
        if (!adminId)
            return res.status(500).json({ error: 'No admin configured' });
        let conv = await Conversation.findOne({
            where: { status: { [Op.ne]: 'completed' } },
        });
        // Find an existing active/archived conversation between this customer and admin
        const all = await Conversation.findAll({ where: { status: { [Op.ne]: 'completed' } } });
        conv = all.find((c) => {
            const parts = parseParticipants(c);
            return parts.includes(userId) && parts.includes(String(adminId));
        }) || null;
        if (!conv) {
            conv = await Conversation.create({
                subject: 'KABOSS Support',
                participants: JSON.stringify([userId, String(adminId)]),
                status: 'active',
            });
        }
        res.status(201).json(conv);
    }
    catch (error) {
        console.error('Failed to create conversation:', error);
        res.status(500).json({ error: 'Failed to create conversation' });
    }
});
// GET /api/messages/attachments/:id/download — protected download
// NOTE: This MUST be registered BEFORE the generic /:conversationId route, otherwise
// Express will match "attachments" as a conversationId and return 403 for every download.
router.get('/attachments/:id/download', verifyTokenMiddleware, async (req, res) => {
    try {
        const att = await Attachment.findByPk(req.params.id);
        if (!att)
            return res.status(404).json({ error: 'Attachment not found' });
        const conv = await Conversation.findByPk(att.conversationId);
        if (!conv)
            return res.status(404).json({ error: 'Conversation not found' });
        if (!parseParticipants(conv).includes(req.userId))
            return res.status(403).json({ error: 'Forbidden' });
        const absPath = path.join(UPLOAD_ROOT, att.storagePath);
        if (!fs.existsSync(absPath))
            return res.status(404).json({ error: 'File missing on server' });
        res.setHeader('Content-Type', att.mimeType || 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(att.fileName)}"`);
        res.setHeader('X-Download-Filename', encodeURIComponent(att.fileName));
        fs.createReadStream(absPath).pipe(res);
    }
    catch (error) {
        console.error('Failed to download attachment:', error);
        res.status(500).json({ error: 'Failed to download attachment' });
    }
});
// GET /api/messages/:conversationId — list messages with attachments
router.get('/:conversationId', verifyTokenMiddleware, async (req, res) => {
    try {
        const conversationId = parseInt(req.params.conversationId, 10);
        if (!conversationId || Number.isNaN(conversationId)) {
            return res.status(400).json({ error: 'Invalid conversation id' });
        }
        await ensureParticipant(conversationId, req.userId);
        // Pagination: newest-first ordered by id, then reversed to ascending for the client.
        const before = req.query.before ? parseInt(req.query.before, 10) : undefined;
        const limitRaw = parseInt(req.query.limit || '100', 10);
        const limit = Number.isNaN(limitRaw) ? 100 : Math.min(Math.max(limitRaw, 1), 200);
        const where = { conversationId };
        if (before)
            where.id = { [Op.lt]: before };
        const messages = await Message.findAll({
            where,
            order: [['id', 'DESC']],
            limit,
        });
        messages.reverse();
        const withAttachments = await Promise.all(messages.map(async (m) => {
            const atts = await Attachment.findAll({ where: { messageId: m.id } });
            return { ...m.toJSON(), attachments: atts.map((a) => a.toJSON()) };
        }));
        res.json(withAttachments);
    }
    catch (error) {
        if (error instanceof Error && ['Conversation not found', 'Forbidden: Not a conversation participant'].includes(error.message))
            return res.status(403).json({ error: error.message });
        console.error('Failed to fetch messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});
// POST /api/messages — send a text message
router.post('/', verifyTokenMiddleware, async (req, res) => {
    try {
        const data = messageSchema.parse(req.body);
        await ensureParticipant(data.conversationId, req.userId);
        const user = await User.findByPk(parseInt(req.userId), { attributes: ['displayName'] });
        const message = await Message.create({
            conversationId: data.conversationId,
            content: data.content,
            senderId: parseInt(req.userId),
            senderName: user?.displayName || req.body.senderName || 'User',
        });
        await Conversation.update({ lastMessage: data.content, lastMessageAt: new Date(), status: 'active' }, { where: { id: data.conversationId } });
        const messageJson = { ...message.toJSON(), attachments: [] };
        // Socket emits
        await emitNewMessageToConversation(data.conversationId, { message: messageJson });
        // Notify other participant(s)
        const conv = await Conversation.findByPk(data.conversationId);
        const participants = parseParticipants(conv);
        const otherParticipantIds = participants.filter((p) => p !== req.userId);
        await Promise.all(otherParticipantIds.map(async (pid) => {
            const pInt = parseInt(pid);
            if (!pInt)
                return;
            await Notification.create({
                userId: pInt,
                type: 'message',
                title: 'New message',
                body: `${message.senderName}: ${data.content}`,
                isRead: false,
            });
            const io = getIO();
            io?.to(`user:${pid}`).emit('notification:new', {
                id: Date.now() + Math.random(),
                type: 'message',
                title: 'New message',
                body: `${message.senderName}: ${data.content}`,
                isRead: false,
                createdAt: new Date(),
            });
        }));
        res.status(201).json(messageJson);
    }
    catch (error) {
        if (error instanceof z.ZodError)
            return res.status(400).json({ error: error.errors });
        if (error instanceof Error && ['Conversation not found', 'Forbidden: Not a conversation participant'].includes(error.message))
            return res.status(403).json({ error: error.message });
        console.error('Failed to send message:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});
// POST /api/messages/:conversationId/attachments — upload one or more files
router.post('/:conversationId/attachments', verifyTokenMiddleware, upload.array('files', 20), async (req, res) => {
    try {
        const conversationId = parseInt(req.params.conversationId);
        await ensureParticipant(conversationId, req.userId);
        const files = (req.files || []);
        if (!files.length)
            return res.status(400).json({ error: 'No files provided' });
        const user = await User.findByPk(parseInt(req.userId), { attributes: ['displayName'] });
        const message = await Message.create({
            conversationId,
            content: files.length > 1 ? `📎 ${files.length} files` : '📎 Attachment',
            senderId: parseInt(req.userId),
            senderName: user?.displayName || 'User',
        });
        const created = [];
        for (const f of files) {
            const rec = await Attachment.create({
                messageId: message.id,
                conversationId,
                senderId: parseInt(req.userId),
                fileName: f.originalname,
                fileType: fileTypeFromMime(f.mimetype),
                mimeType: f.mimetype,
                storagePath: f.filename,
                size: f.size,
            });
            created.push(rec.toJSON());
        }
        await Conversation.update({ lastMessage: message.content, lastMessageAt: new Date(), status: 'active' }, { where: { id: conversationId } });
        const messageJson = { ...message.toJSON(), attachments: created };
        await emitNewMessageToConversation(conversationId, { message: messageJson });
        // Notify other participants
        const conv = await Conversation.findByPk(conversationId);
        const participants = parseParticipants(conv);
        const otherParticipantIds = participants.filter((p) => p !== req.userId);
        await Promise.all(otherParticipantIds.map(async (pid) => {
            const pInt = parseInt(pid);
            if (!pInt)
                return;
            await Notification.create({
                userId: pInt,
                type: 'message',
                title: 'New attachment',
                body: `${message.senderName} sent ${files.length} file(s)`,
                isRead: false,
            });
            const io = getIO();
            io?.to(`user:${pid}`).emit('notification:new', {
                id: Date.now() + Math.random(),
                type: 'message',
                title: 'New attachment',
                body: `${message.senderName} sent ${files.length} file(s)`,
                isRead: false,
                createdAt: new Date(),
            });
        }));
        res.status(201).json(messageJson);
    }
    catch (error) {
        if (error instanceof Error && ['Conversation not found', 'Forbidden: Not a conversation participant'].includes(error.message))
            return res.status(403).json({ error: error.message });
        console.error('Failed to upload attachments:', error);
        res.status(400).json({ error: error?.message || 'Failed to upload files' });
    }
});
// DELETE /api/messages/:id — delete own message (customer)
router.delete('/:id', verifyTokenMiddleware, async (req, res) => {
    try {
        const message = await Message.findByPk(req.params.id);
        if (!message)
            return res.status(404).json({ error: 'Message not found' });
        if (String(message.senderId) !== req.userId)
            return res.status(403).json({ error: 'Forbidden' });
        const atts = await Attachment.findAll({ where: { messageId: message.id } });
        for (const a of atts) {
            const p = path.join(UPLOAD_ROOT, a.storagePath);
            if (fs.existsSync(p))
                fs.unlinkSync(p);
        }
        await Attachment.destroy({ where: { messageId: message.id } });
        await message.destroy();
        res.json({ message: 'Message deleted' });
    }
    catch (error) {
        console.error('Failed to delete message:', error);
        res.status(500).json({ error: 'Failed to delete message' });
    }
});
// PATCH /api/messages/:conversationId/read — mark messages as read
router.patch('/:conversationId/read', verifyTokenMiddleware, async (req, res) => {
    try {
        const conversationId = parseInt(req.params.conversationId);
        await ensureParticipant(conversationId, req.userId);
        await Message.update({ isRead: true, seenAt: new Date(), deliveredAt: new Date() }, {
            where: {
                conversationId,
                senderId: { [Op.ne]: parseInt(req.userId) },
                isRead: false,
            },
        });
        const { getIO } = await import('../socket/index.js');
        const io = getIO();
        const conv = await Conversation.findByPk(conversationId);
        const participants = parseParticipants(conv);
        participants.forEach((pid) => {
            if (pid !== req.userId) {
                io?.to(`user:${pid}`).emit('message:seen', {
                    conversationId,
                    readerId: req.userId,
                    seenAt: new Date(),
                });
            }
        });
        res.json({ message: 'Marked as read' });
    }
    catch (error) {
        console.error('Failed to mark messages as read:', error);
        res.status(500).json({ error: 'Failed to mark messages as read' });
    }
});
export default router;
//# sourceMappingURL=messages.js.map