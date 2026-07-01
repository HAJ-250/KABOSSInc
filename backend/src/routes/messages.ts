import { Router, Response } from 'express';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import { verifyTokenMiddleware, AuthenticatedRequest } from '../middleware/auth.js';
import { z } from 'zod';

const router = Router();
const messageSchema = z.object({ conversationId: z.number().or(z.string().transform(Number)), content: z.string().min(1) });

async function ensureParticipant(conversationId: number, userId: string | undefined): Promise<void> {
  if (!userId) throw new Error('Unauthorized');
  const conv = await Conversation.findByPk(conversationId);
  if (!conv) throw new Error('Conversation not found');
  let participants: string[] = [];
  if (conv.participants) {
    try { participants = JSON.parse(conv.participants); } catch { participants = []; }
  }
  if (!participants.includes(userId)) throw new Error('Forbidden: Not a conversation participant');
}

router.get('/conversations', verifyTokenMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const all = await Conversation.findAll({ order: [['lastMessageAt', 'DESC']] });
    const conversations = all.filter((c) => {
      if (!c.participants) return false;
      try { return JSON.parse(c.participants).includes(req.userId); } catch { return false; }
    });
    res.json(conversations);
  } catch (error) { console.error('Failed to fetch conversations:', error); res.status(500).json({ error: 'Failed to fetch conversations' }); }
});

router.get('/:conversationId', verifyTokenMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    await ensureParticipant(parseInt(req.params.conversationId), req.userId);
    const messages = await Message.findAll({
      where: { conversationId: parseInt(req.params.conversationId) },
      order: [['createdAt', 'ASC']],
    });
    res.json(messages);
  } catch (error) {
    if (error instanceof Error && ['Conversation not found', 'Forbidden: Not a conversation participant'].includes(error.message))
      return res.status(403).json({ error: error.message });
    console.error('Failed to fetch messages:', error); res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

router.post('/', verifyTokenMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = messageSchema.parse(req.body);
    await ensureParticipant(data.conversationId, req.userId);
    const message = await Message.create({
      conversationId: data.conversationId, content: data.content,
      senderId: parseInt(req.userId!), senderName: req.body.senderName || 'User',
    });
    await Conversation.update(
      { lastMessage: data.content, lastMessageAt: new Date() },
      { where: { id: data.conversationId } }
    );
    res.status(201).json(message);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });
    if (error instanceof Error && ['Conversation not found', 'Forbidden: Not a conversation participant'].includes(error.message))
      return res.status(403).json({ error: error.message });
    console.error('Failed to send message:', error); res.status(500).json({ error: 'Failed to send message' });
  }
});

export default router;
