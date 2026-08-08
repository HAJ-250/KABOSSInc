import { io, Socket } from 'socket.io-client';
import { getAuthToken } from '@/lib/firebase';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  return socket;
}

let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

export function connectSocket(): Socket | null {
  const token = getAuthToken();
  if (!token) return null;
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });

  socket.on('connect', () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  });

  socket.on('connect_error', (err) => {
    console.error('Socket connect error:', err.message);
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function joinConversation(conversationId: number | string) {
  getSocket()?.emit('conversation:join', { conversationId });
}

export function leaveConversation(conversationId: number | string) {
  getSocket()?.emit('conversation:leave', { conversationId });
}

export function emitTypingStart(conversationId: number | string) {
  getSocket()?.emit('typing:start', { conversationId });
}

export function emitTypingStop(conversationId: number | string) {
  getSocket()?.emit('typing:stop', { conversationId });
}

export function emitMessageRead(conversationId: number | string) {
  getSocket()?.emit('message:read', { conversationId });
}

