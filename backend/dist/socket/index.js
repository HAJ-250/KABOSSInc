import jwt from 'jsonwebtoken';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import Attachment from '../models/Attachment.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { sequelize } from '../config/database.js';
import { Op } from 'sequelize';
/**
 * In-memory presence map: userId -> Set of socket ids.
 * Admin is the single 'admin' user; customers are their own userId.
 */
const onlineUsers = new Map();
const typingUsers = new Map();
let ioInstance = null;
export function getIO() {
    return ioInstance;
}
function getAdminUserId() {
    return User.findOne({ where: { role: 'admin' } }).then((u) => (u ? u.id : null));
}
export function getOnlineUsers() {
    return Array.from(onlineUsers.keys()).map(Number);
}
export function isUserOnline(userId) {
    return onlineUsers.has(String(userId));
}
/**
 * Wire up Socket.IO.
 */
export function initSocket(io) {
    ioInstance = io;
    // JWT auth handshake
    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth?.token ||
                socket.handshake.query?.token ||
                '';
            if (!token)
                return next(new Error('Unauthorized: No token'));
            const JWT_SECRET = process.env.JWT_SECRET;
            if (!JWT_SECRET)
                return next(new Error('Server misconfigured'));
            const decoded = jwt.verify(token, JWT_SECRET);
            socket.kabossUser = {
                userId: parseInt(decoded.userId, 10),
                role: decoded.role,
                email: decoded.email,
            };
            next();
        }
        catch (e) {
            next(new Error('Unauthorized: Invalid token'));
        }
    });
    io.on('connection', async (socket) => {
        const user = socket.kabossUser;
        const uid = String(user.userId);
        // Register presence
        if (!onlineUsers.has(uid))
            onlineUsers.set(uid, new Set());
        onlineUsers.get(uid).add(socket.id);
        // Join user room
        socket.join(`user:${uid}`);
        // Fetch display name for richer presence payloads
        const dbUser = await User.findByPk(user.userId, { attributes: ['id', 'displayName', 'role'] });
        const displayName = dbUser?.displayName || 'User';
        user.displayName = displayName;
        // Broadcast online to everyone (admin sees customers; customers see admin)
        const onlineList = getOnlineUsers();
        io.emit('presence:online', { userId: user.userId, displayName, online: true, onlineUsers: onlineList });
        // Tell admin which conversations this user is part of (if customer), so admin sees typing/online.
        socket.on('conversation:join', (data) => {
            const conversationId = parseInt(data?.conversationId, 10);
            if (!conversationId)
                return;
            socket.join(`conversation:${conversationId}`);
            // Notify other participants in the conversation that we joined (delivered)
            socket.to(`conversation:${conversationId}`).emit('conversation:joined', {
                conversationId,
                userId: user.userId,
            });
        });
        socket.on('conversation:leave', (data) => {
            const conversationId = parseInt(data?.conversationId, 10);
            if (!conversationId)
                return;
            socket.leave(`conversation:${conversationId}`);
        });
        // ----- Message send (real-time fallback) -----
        socket.on('message:send', async (payload, ack) => {
            try {
                const conversationId = parseInt(payload?.conversationId, 10);
                const content = String(payload?.content || '').trim();
                const attachments = Array.isArray(payload?.attachments) ? payload.attachments : [];
                if (!conversationId || (!content && attachments.length === 0)) {
                    ack?.({ ok: false, error: 'Invalid payload' });
                    return;
                }
                const conv = await Conversation.findByPk(conversationId);
                if (!conv) {
                    ack?.({ ok: false, error: 'Conversation not found' });
                    return;
                }
                // Verify participant
                let participants = [];
                if (conv.participants) {
                    try {
                        participants = JSON.parse(conv.participants);
                    }
                    catch {
                        participants = [];
                    }
                }
                if (!participants.includes(uid) && user.role !== 'admin') {
                    ack?.({ ok: false, error: 'Forbidden' });
                    return;
                }
                // Admin can post to any conversation (participants may or may not include them)
                if (user.role !== 'admin' && !participants.includes(uid)) {
                    ack?.({ ok: false, error: 'Forbidden' });
                    return;
                }
                const message = await Message.create({
                    conversationId,
                    senderId: user.userId,
                    senderName: displayName,
                    content: content || (attachments.length ? '📎 Attachment' : ''),
                    isRead: false,
                    deliveredAt: null,
                    seenAt: null,
                });
                // Create attachments if provided (from upload flow)
                const createdAttachments = [];
                for (const att of attachments) {
                    const rec = await Attachment.create({
                        messageId: message.id,
                        conversationId,
                        senderId: user.userId,
                        fileName: att.fileName || 'file',
                        fileType: att.fileType || 'other',
                        mimeType: att.mimeType || 'application/octet-stream',
                        storagePath: att.storagePath || '',
                        size: att.size || 0,
                    });
                    createdAttachments.push(rec.toJSON());
                }
                await Conversation.update({ lastMessage: content || '📎 Attachment', lastMessageAt: new Date() }, { where: { id: conversationId } });
                const messageJson = { ...message.toJSON(), attachments: createdAttachments };
                // Emit to conversation room (excluding sender; sender already has it via REST)
                socket.to(`conversation:${conversationId}`).emit('message:new', {
                    conversationId,
                    message: messageJson,
                });
                // Also emit to each participant user room (so UI can update conversation list live)
                participants.forEach((pid) => {
                    if (pid !== uid) {
                        io.to(`user:${pid}`).emit('conversation:update', {
                            conversationId,
                            lastMessage: content || '📎 Attachment',
                            lastMessageAt: new Date(),
                        });
                    }
                });
                // Notify other participants (notifications)
                const otherIds = participants.filter((p) => p !== uid);
                for (const pid of otherIds) {
                    const pInt = parseInt(pid, 10);
                    if (!pInt)
                        continue;
                    await Notification.create({
                        userId: pInt,
                        type: 'message',
                        title: 'New message',
                        body: `${displayName}: ${content || 'Sent an attachment'}`,
                        isRead: false,
                    });
                    io.to(`user:${pid}`).emit('notification:new', {
                        id: Date.now() + Math.random(),
                        type: 'message',
                        title: 'New message',
                        body: `${displayName}: ${content || 'Sent an attachment'}`,
                        isRead: false,
                        createdAt: new Date(),
                    });
                }
                ack?.({ ok: true, message: messageJson });
            }
            catch (error) {
                console.error('socket message:send failed:', error);
                ack?.({ ok: false, error: 'Failed to send message' });
            }
        });
        // ----- Typing indicator -----
        socket.on('typing:start', (data) => {
            const conversationId = parseInt(data?.conversationId, 10);
            if (!conversationId)
                return;
            typingUsers.set(socket.id, {
                userId: user.userId,
                name: displayName,
                conversationId,
                expiresAt: Date.now() + 4000,
            });
            socket.to(`conversation:${conversationId}`).emit('typing:start', {
                conversationId,
                userId: user.userId,
                name: displayName,
            });
        });
        socket.on('typing:stop', (data) => {
            const conversationId = parseInt(data?.conversationId, 10);
            if (!conversationId)
                return;
            typingUsers.delete(socket.id);
            socket.to(`conversation:${conversationId}`).emit('typing:stop', {
                conversationId,
                userId: user.userId,
            });
        });
        // ----- Message read / seen -----
        socket.on('message:read', async (data) => {
            try {
                const conversationId = parseInt(data?.conversationId, 10);
                if (!conversationId)
                    return;
                // Mark all messages in this conversation (sent by others) as read
                const [updatedCount] = await Message.update({
                    isRead: true,
                    seenAt: new Date(),
                    deliveredAt: sequelize.literal('COALESCE(deliveredAt, NOW())'),
                }, {
                    where: {
                        conversationId,
                        senderId: { [Op.ne]: user.userId },
                        isRead: false,
                    },
                });
                if (updatedCount > 0) {
                    // Notify other participants that messages were seen
                    const conv = await Conversation.findByPk(conversationId);
                    let participants = [];
                    if (conv?.participants) {
                        try {
                            participants = JSON.parse(conv.participants);
                        }
                        catch {
                            participants = [];
                        }
                    }
                    participants.forEach((pid) => {
                        if (pid !== uid) {
                            io.to(`user:${pid}`).emit('message:seen', {
                                conversationId,
                                readerId: user.userId,
                                readerName: displayName,
                                seenAt: new Date(),
                            });
                        }
                    });
                }
            }
            catch (error) {
                console.error('socket message:read failed:', error);
            }
        });
        // ----- Message delivered (when recipient opens conversation) -----
        socket.on('message:delivered', async (data) => {
            try {
                const conversationId = parseInt(data?.conversationId, 10);
                if (!conversationId)
                    return;
                await Message.update({ deliveredAt: new Date() }, {
                    where: {
                        conversationId,
                        senderId: { [Op.ne]: user.userId },
                        deliveredAt: null,
                    },
                });
            }
            catch (error) {
                console.error('socket message:delivered failed:', error);
            }
        });
        socket.on('disconnect', () => {
            const set = onlineUsers.get(uid);
            if (set) {
                set.delete(socket.id);
                if (set.size === 0) {
                    onlineUsers.delete(uid);
                    typingUsers.delete(socket.id);
                    io.emit('presence:offline', { userId: user.userId, online: false, onlineUsers: getOnlineUsers() });
                }
            }
        });
    });
}
export default initSocket;
//# sourceMappingURL=index.js.map