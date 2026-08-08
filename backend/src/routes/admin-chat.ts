import { Router, Response } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { Op } from 'sequelize';
import { verifyTokenMiddleware, requireAdmin, AuthenticatedRequest } from '../middleware/auth.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import Attachment from '../models/Attachment.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { z } from 'zod';
import { getIO } from '../socket/index.js';

const router = Router();
router.use(verifyTokenMiddleware, requireAdmin);

const UPLOAD_ROOT = path.join(process.cwd(), 'uploads', 'chat');

function ensureDir(dirPath: string) {
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

function fileTypeFromMime(mime: string): 'image' | 'pdf' | 'zip' | 'document' | 'other' {
  if (mime.startsWith('image/')) return 'image';
  if (mime === 'application/pdf') return 'pdf';
  if (mime.includes('zip') || mime === 'application/octet-stream') return 'zip';
  return 'document';
}

function fileFilter(_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) {
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

function parseParticipants(conv: Conversation): string[] {
  if (!conv.participants) return [];
  try {
    const arr = JSON.parse(conv.participants);
    return Array.isArray(arr) ? arr.map(String) : [];
  } catch {
    return [];
  }
}

async function emitMessageToConversation(conversationId: number, payload: any) {
  const io = getIO();
  if (!io) return;
  const conv = await Conversation.findByPk(conversationId);
  if (!conv) return;
  const participants = parseParticipants(conv);
  participants.forEach((pid) => {
    io.to(`user:${pid}`).emit('conversation:update', {
      conversationId,
      lastMessage: payload.content || '📎 Attachment',
      lastMessageAt: new Date(),
    });
  });
  io.to(`conversation:${conversationId}`).emit('message:new', {
    conversationId,
    message: payload,
  });
}

function customerIdOf(conv: Conversation, adminId: string): string | null {
  const parts = parseParticipants(conv).filter((p) => p !== adminId);
  return parts[0] || null;
}

router.get('/conversations', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const adminId = String(req.userId);
    const conversations = await Conversation.findAll({ order: [['lastMessageAt', 'DESC']] });

    const results = [];
    for (const conv of conversations) {
      const parts = parseParticipants(conv);
      if (!parts.includes(adminId)) continue;
      const custId = customerIdOf(conv, adminId);
      const customer = custId
        ? await User.findByPk(parseInt(custId), {
            attributes: ['id', 'displayName', 'email', 'phone', 'role'],
          })
        : null;

      // unread count from customers
      const unread = await Message.count({
        where: { conversationId: conv.id, senderId: { [Op.ne]: parseInt(adminId) }, isRead: false },
      });

      results.push({
        ...conv.toJSON(),
        customer: customer
          ? { id: customer.id, displayName: customer.displayName, email: customer.email, phone: customer.phone }
          : null,
        unread,
      });
    }

    res.json(results);
  } catch (error) {
    console.error('Failed to fetch admin conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

router.get('/customers', async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const customers = await User.findAll({
      where: { role: 'customer' },
      attributes: ['id', 'displayName', 'email', 'phone'],
      order: [['createdAt', 'DESC']],
    });
    res.json(customers);
  } catch (error) {
    console.error('Failed to fetch customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// POST /admin/chat/customers/:customerId/conversation — find-or-create a conversation between admin and a specific customer
router.post('/customers/:customerId/conversation', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const adminId = String(req.userId);
    const customerId = req.params.customerId;

    if (!customerId || !parseInt(customerId, 10)) {
      return res.status(400).json({ error: 'Invalid customer id' });
    }

    const customer = await User.findByPk(parseInt(customerId, 10), {
      attributes: ['id', 'displayName', 'email', 'phone', 'role'],
    });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    if (customer.role !== 'customer') return res.status(400).json({ error: 'User is not a customer' });

    // Find an existing active/archived conversation between admin and this customer
    const all = await Conversation.findAll({ order: [['lastMessageAt', 'DESC']] });
    let conv = all.find((c) => {
      const parts = parseParticipants(c);
      return parts.includes(adminId) && parts.includes(String(customerId));
    }) || null;

    if (!conv) {
      conv = await Conversation.create({
        subject: 'KABOSS Support',
        participants: JSON.stringify([adminId, String(customerId)]),
        status: 'active',
        lastMessage: '',
        lastMessageAt: new Date(),
      });
    }

    const unread = await Message.count({
      where: { conversationId: conv.id, senderId: { [Op.ne]: parseInt(adminId) }, isRead: false },
    });

    res.status(201).json({
      ...conv.toJSON(),
      customer: {
        id: customer.id,
        displayName: customer.displayName,
        email: customer.email,
        phone: customer.phone,
      },
      unread,
    });
  } catch (error) {
    console.error('Failed to create admin conversation:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

router.get('/conversations/:conversationId/messages', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const adminId = String(req.userId);
    const conversationId = parseInt(req.params.conversationId, 10);
    if (!conversationId || Number.isNaN(conversationId)) {
      return res.status(400).json({ error: 'Invalid conversation id' });
    }
    const conv = await Conversation.findByPk(conversationId);
    if (!conv) return res.status(404).json({ error: 'Conversation not found' });
    if (!parseParticipants(conv).includes(adminId)) return res.status(403).json({ error: 'Forbidden' });

    // Pagination: newest-first ordered by id, then reversed to ascending for the client.
    const before = req.query.before ? parseInt(req.query.before as string, 10) : undefined;
    const limitRaw = parseInt((req.query.limit as string) || '100', 10);
    const limit = Number.isNaN(limitRaw) ? 100 : Math.min(Math.max(limitRaw, 1), 200);

    const where: any = { conversationId: conv.id };
    if (before) where.id = { [Op.lt]: before };

    const messages = await Message.findAll({
      where,
      order: [['id', 'DESC']],
      limit,
    });
    messages.reverse();

    const withAttachments = await Promise.all(
      messages.map(async (m) => {
        const atts = await Attachment.findAll({ where: { messageId: m.id } });
        return { ...m.toJSON(), attachments: atts.map((a) => a.toJSON()) };
      })
    );

    res.json(withAttachments);
  } catch (error) {
    console.error('Failed to fetch admin messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

router.post('/conversations/:conversationId/messages', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const adminId = String(req.userId);
    const { content } = req.body;
    const conv = await Conversation.findByPk(req.params.conversationId);
    if (!conv) return res.status(404).json({ error: 'Conversation not found' });
    if (!parseParticipants(conv).includes(adminId)) return res.status(403).json({ error: 'Forbidden' });

    const text = String(content || '').trim();
    if (!text) return res.status(400).json({ error: 'Message content is required' });

    const admin = await User.findByPk(parseInt(adminId), { attributes: ['displayName'] });
    const message = await Message.create({
      conversationId: conv.id,
      senderId: parseInt(adminId),
      senderName: admin?.displayName || 'Admin',
      content: text,
      isRead: false,
    });

    await Conversation.update(
      { lastMessage: text, lastMessageAt: new Date(), status: 'active' },
      { where: { id: conv.id } }
    );

const messageJson = { ...message.toJSON(), attachments: [] };

    // Emit real-time to conversation participants
    await emitMessageToConversation(conv.id, messageJson);

    // Notify customer
    const custId = customerIdOf(conv, adminId);
    if (custId) {
      await Notification.create({
        userId: parseInt(custId),
        type: 'message',
        title: 'New message from KABOSS',
        body: text,
        isRead: false,
      });
      const io = getIO();
      io?.to(`user:${custId}`).emit('notification:new', {
        id: Date.now() + Math.random(),
        type: 'message',
        title: 'New message from KABOSS',
        body: text,
        isRead: false,
        createdAt: new Date(),
      });
    }

    res.status(201).json(messageJson);
  } catch (error) {
    console.error('Failed to send admin message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

router.post(
  '/conversations/:conversationId/attachments',
  upload.array('files', 20),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const adminId = String(req.userId);
      const conv = await Conversation.findByPk(req.params.conversationId);
      if (!conv) return res.status(404).json({ error: 'Conversation not found' });
      if (!parseParticipants(conv).includes(adminId)) return res.status(403).json({ error: 'Forbidden' });

      const files = (req.files || []) as Express.Multer.File[];
      if (!files.length) return res.status(400).json({ error: 'No files provided' });

      const admin = await User.findByPk(parseInt(adminId), { attributes: ['displayName'] });

      const message = await Message.create({
        conversationId: conv.id,
        senderId: parseInt(adminId),
        senderName: admin?.displayName || 'Admin',
        content: files.length > 1 ? `📎 ${files.length} files` : '📎 Attachment',
        isRead: false,
      });

      const created = [];
      for (const f of files) {
        const rec = await Attachment.create({
          messageId: message.id,
          conversationId: conv.id,
          senderId: parseInt(adminId),
          fileName: f.originalname,
          fileType: fileTypeFromMime(f.mimetype),
          mimeType: f.mimetype,
          storagePath: f.filename,
          size: f.size,
        });
        created.push(rec.toJSON());
      }

await Conversation.update(
        { lastMessage: message.content, lastMessageAt: new Date(), status: 'active' },
        { where: { id: conv.id } }
      );

      const messageJson = { ...message.toJSON(), attachments: created };

      // Emit real-time to conversation participants
      await emitMessageToConversation(conv.id, messageJson);

      const custId = customerIdOf(conv, adminId);
      if (custId) {
        await Notification.create({
          userId: parseInt(custId),
          type: 'booking_file',
          title: 'KABOSS sent you photos',
          body: `${files.length} file(s) have been uploaded to your chat.`,
          isRead: false,
        });
        const io = getIO();
        io?.to(`user:${custId}`).emit('notification:new', {
          id: Date.now() + Math.random(),
          type: 'booking_file',
          title: 'KABOSS sent you photos',
          body: `${files.length} file(s) have been uploaded to your chat.`,
          isRead: false,
          createdAt: new Date(),
        });
      }

      res.status(201).json(messageJson);
    } catch (error: any) {
      console.error('Failed to upload chat attachment:', error);
      res.status(400).json({ error: error?.message || 'Failed to upload files' });
    }
  }
);

router.delete('/messages/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const message = await Message.findByPk(req.params.id);
    if (!message) return res.status(404).json({ error: 'Message not found' });

    const atts = await Attachment.findAll({ where: { messageId: message.id } });
    for (const a of atts) {
      const p = path.join(UPLOAD_ROOT, a.storagePath);
      if (fs.existsSync(p)) fs.unlinkSync(p);
    }
    await Attachment.destroy({ where: { messageId: message.id } });
    await message.destroy();

    res.json({ message: 'Message deleted' });
  } catch (error) {
    console.error('Failed to delete message:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

const statusSchema = z.object({ status: z.enum(['active', 'archived', 'completed']) });

router.patch('/conversations/:id/status', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status } = statusSchema.parse(req.body);
    const conv = await Conversation.findByPk(req.params.id);
    if (!conv) return res.status(404).json({ error: 'Conversation not found' });
    conv.status = status;
    await conv.save();
    res.json(conv);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });
    console.error('Failed to update conversation status:', error);
    res.status(500).json({ error: 'Failed to update conversation status' });
  }
});

// Download a protected attachment (only sender/receiver)
router.get('/attachments/:id/download', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const adminId = String(req.userId);
    const att = await Attachment.findByPk(req.params.id);
    if (!att) return res.status(404).json({ error: 'Attachment not found' });

    const conv = await Conversation.findByPk(att.conversationId);
    if (!conv) return res.status(404).json({ error: 'Conversation not found' });
    if (!parseParticipants(conv).includes(adminId)) return res.status(403).json({ error: 'Forbidden' });

    const absPath = path.join(UPLOAD_ROOT, att.storagePath);
    if (!fs.existsSync(absPath)) return res.status(404).json({ error: 'File missing on server' });

    res.setHeader('Content-Type', att.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(att.fileName)}"`);
    fs.createReadStream(absPath).pipe(res);
  } catch (error) {
    console.error('Failed to download attachment:', error);
    res.status(500).json({ error: 'Failed to download attachment' });
  }
});

export default router;
