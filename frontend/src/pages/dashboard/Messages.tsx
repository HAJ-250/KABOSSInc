import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Send, Paperclip, Image as ImageIcon, Download, FileText, X,
  Check, CheckCheck, Smile, Archive, Trash2, MessageSquare, Loader2,
  MessageCircle, RefreshCw, ArrowLeft, Bot, ChevronUp,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { api, attachmentUrl } from '@/services/api';
import { getApiUrl, getAuthToken } from '@/lib/firebase';
import {
  connectSocket, disconnectSocket, joinConversation, leaveConversation,
  emitTypingStart, emitTypingStop, emitMessageRead,
} from '@/services/socket';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

type Attachment = {
  id: number;
  fileName: string;
  fileType: 'image' | 'pdf' | 'zip' | 'document' | 'other';
  mimeType: string;
  size: number;
};

type Msg = {
  id: number;
  senderId: number;
  senderName?: string;
  content: string;
  createdAt?: string;
  isRead?: boolean;
  deliveredAt?: string | null;
  seenAt?: string | null;
  attachments?: Attachment[];
  isBot?: boolean;
};

type Conversation = {
  id: number;
  participants?: string | any;
  lastMessage?: string;
  lastMessageAt?: string;
  unread?: number;
  status?: string;
};

const EMOJIS = ['😀', '😂', '😍', '😎', '👍', '❤️', '🎉', '🔥', '😊', '🤝', '🙏', '✨'];

const BOT_SUGGESTIONS = [
  'What services do you offer?',
  'How do I book a session?',
  'What are your prices?',
  'Where are you located?',
  'What are your opening hours?',
  'Talk to a human',
];

// ---------- Bot knowledge base (rule-based) ----------
function normalize(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function getBotReply(raw: string): string | null {
  const t = normalize(raw);
  if (!t) return null;

  const has = (...keys: string[]) => keys.some((k) => t.includes(k));

if (has('human', 'agent', 'real person', 'support team', 'talk to someone', 'customer service', 'representative', 'live agent')) {
    return 'Our support team is available during business hours and will reply to you shortly. In the meantime, feel free to leave any questions here and we\u0027ll get back to you as soon as possible!';
  }
  if (has('price', 'cost', 'rate', 'fee', 'how much', 'pricing', 'charges')) {
    return 'Our pricing depends on the type of shoot you\u0027re interested in. We offer flexible packages for portraits, events, and corporate sessions. You can see details on our Services page, or send us a message and our team will share a custom quote based on your needs.';
  }
  if (has('book', 'booking', 'booking a', 'schedule', 'appointment', 'reserve', 'reservation', 'session date')) {
    return 'You can book a session directly from your dashboard under the \u0022Bookings\u0022 tab \u2014 just pick a service, choose your preferred date, and submit the form. Our team will confirm your booking shortly after.';
  }
  if (has('service', 'what do you offer', 'offer', 'sessions', 'photography')) {
    return 'KABOSS Inc specializes in professional photography and videography. We offer portrait sessions, event coverage, corporate shoots, and more. Visit our Services page to explore all the packages we provide!';
  }
  if (has('gallery', 'portfolio', 'work', 'sample', 'previous', 'photos')) {
    return 'You can browse our latest work in the Gallery section of our website. It showcases a selection of our recent projects so you can get a feel for our style and quality.';
  }
  if (has('location', 'where are you', 'address', 'near', 'studio')) {
    return 'We are based in Abuja, Nigeria. For our exact studio address and directions, feel free to send us a message and our team will gladly share the details with you.';
  }
  if (has('hour', 'open', 'opening', 'close', 'time', 'when are you available', 'working day')) {
    return 'We are typically available Monday to Saturday, 9:00 AM \u2013 6:00 PM. For specific availability or weekend shoots, please reach out and we\u0027ll do our best to accommodate you.';
  }
  if (has('contact', 'email', 'phone', 'call', 'reach', 'number', 'whatsapp')) {
    return 'You can reach us through this chat, or use the contact form on our website. We\u0027d love to hear from you and will respond as quickly as possible!';
  }
  if (has('hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'howdy')) {
    return 'Hello! \uD83D\uDC4B Welcome to KABOSS Inc. How can I help you today? You can ask me about our services, pricing, bookings, or anything else!';
  }
  if (has('thank', 'thanks', 'appreciate')) {
    return 'You\u0027re very welcome! \uD83D\uDE0A If you need anything else, just let me know.';
  }
  if (has('bye', 'goodbye', 'see you', 'later')) {
    return 'Goodbye! Thanks for chatting with us. Have a great day! \uD83C\uDF89';
  }
  return null;
}

function formatTime(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function formatDayLabel(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}

function fileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const PAGE_SIZE = 30;

export function DashboardMessages() {
  const { user } = useAuth();
  const myId = user?.id ? Number(user.id) : null;

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<number | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [search, setSearch] = useState('');
  const [typing, setTyping] = useState(false);
  const [botTyping, setBotTyping] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [oldestId, setOldestId] = useState<number | null>(null);
  const [online, setOnline] = useState(false);
  const [preview, setPreview] = useState<Attachment | null>(null);
  const [showMobileChat, setShowMobileChat] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<any>(null);
  const botTimer = useRef<any>(null);

  const loadConversations = useCallback(async () => {
    try {
      const data = await api.getConversations();
      setConversations(data as any);
      if (!activeConv && data?.length) setActiveConv(data[0].id);
    } catch (e: any) {
      toast.error(e.message || 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConv]);

  const loadMessages = useCallback(async (conversationId: number) => {
    setLoadingMsgs(true);
    try {
      const data = await api.getMessages(String(conversationId), { limit: PAGE_SIZE });
      setMessages(data as any);
      if (data?.length) {
        setOldestId(data[0].id);
        setHasMore(data.length >= PAGE_SIZE);
      } else {
        setOldestId(null);
        setHasMore(false);
      }
      api.markConversationRead(String(conversationId)).catch(() => {});
      emitMessageRead(conversationId);
    } catch (e: any) {
      toast.error(e.message || 'Failed to load messages');
    } finally {
      setLoadingMsgs(false);
    }
  }, []);

  // Ensure a conversation exists with admin
  const ensureConversation = useCallback(async () => {
    try {
      const existing = await api.getConversations();
      if (existing?.length) {
        setConversations(existing as any);
        if (!activeConv) setActiveConv(existing[0].id);
        return;
      }
      const conv = await api.createConversation();
      setConversations([conv as any]);
      setActiveConv(conv.id);
    } catch (e: any) {
      toast.error(e.message || 'Failed to start conversation');
    } finally {
      setLoading(false);
    }
  }, [activeConv]);

  useEffect(() => {
    connectSocket();
    ensureConversation();
    return () => {
      disconnectSocket();
      if (botTimer.current) clearTimeout(botTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeConv) {
      loadMessages(activeConv);
      joinConversation(activeConv);
    }
    return () => {
      if (activeConv) leaveConversation(activeConv);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConv]);

  // Auto-scroll to bottom on new messages / bot replies
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, uploading, botTyping]);

  // Load older messages (scroll-up pagination)
  const loadOlderMessages = useCallback(async () => {
    if (!activeConv || !hasMore || loadingOlder || loadingMsgs) return;
    setLoadingOlder(true);
    const el = scrollRef.current;
    const prevHeight = el?.scrollHeight || 0;
    try {
      const older = await api.getMessages(String(activeConv), { before: oldestId ?? undefined, limit: PAGE_SIZE });
      if (older?.length) {
        setMessages((prev) => [...older, ...prev]);
        setOldestId(older[0].id);
        if (older.length < PAGE_SIZE) setHasMore(false);
      } else {
        setHasMore(false);
      }
      requestAnimationFrame(() => {
        if (el) el.scrollTop = el.scrollHeight - prevHeight;
      });
    } catch (e: any) {
      toast.error(e.message || 'Failed to load earlier messages');
    } finally {
      setLoadingOlder(false);
    }
  }, [activeConv, hasMore, loadingOlder, loadingMsgs, oldestId]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollTop < 80 && hasMore && !loadingOlder && !loadingMsgs) {
      loadOlderMessages();
    }
  };

  // Bot reply trigger (client-side)
  const triggerBotReply = (text: string) => {
    const reply = getBotReply(text);
    if (!reply) return;
    setBotTyping(true);
    if (botTimer.current) clearTimeout(botTimer.current);
    botTimer.current = setTimeout(() => {
      const botMsg: Msg = {
        id: -Date.now(),
        senderId: -1,
        senderName: 'KABOSS Assistant',
        content: reply,
        createdAt: new Date().toISOString(),
        isRead: true,
        isBot: true,
      };
      setMessages((prev) => [...prev, botMsg]);
      setBotTyping(false);
    }, 1200);
  };

  // Socket listeners
  useEffect(() => {
    const socket = connectSocket();
    if (!socket) return;

    const onNewMessage = (data: any) => {
      if (data?.conversationId === activeConv) {
        setMessages((prev) => {
          const exists = prev.some((m) => m.id === data.message?.id);
          if (exists) return prev;
          return [...prev, data.message];
        });
        emitMessageRead(data.conversationId);
        api.markConversationRead(String(data.conversationId)).catch(() => {});
      }
      loadConversations();
    };

    const onConversationUpdate = (data: any) => {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === data.conversationId
            ? { ...c, lastMessage: data.lastMessage, lastMessageAt: data.lastMessageAt }
            : c
        )
      );
    };

    const onTypingStart = (data: any) => {
      if (data.conversationId === activeConv && data.userId !== myId) setTyping(true);
    };
    const onTypingStop = (data: any) => {
      if (data.conversationId === activeConv) setTyping(false);
    };
    const onMessageSeen = (data: any) => {
      if (data.conversationId === activeConv) {
        setMessages((prev) =>
          prev.map((m) => (m.senderId !== myId ? { ...m, isRead: true, seenAt: data.seenAt } : m))
        );
      }
    };
    const onPresence = (data: any) => {
      if (data.online) setOnline(true);
      else setOnline(false);
    };

    socket.on('message:new', onNewMessage);
    socket.on('conversation:update', onConversationUpdate);
    socket.on('typing:start', onTypingStart);
    socket.on('typing:stop', onTypingStop);
    socket.on('message:seen', onMessageSeen);
    socket.on('presence:online', onPresence);
    socket.on('presence:offline', onPresence);

    return () => {
      socket.off('message:new', onNewMessage);
      socket.off('conversation:update', onConversationUpdate);
      socket.off('typing:start', onTypingStart);
      socket.off('typing:stop', onTypingStop);
      socket.off('message:seen', onMessageSeen);
      socket.off('presence:online', onPresence);
      socket.off('presence:offline', onPresence);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConv, myId]);

  const handleTyping = (val: string) => {
    setNewMsg(val);
    if (!activeConv) return;
    emitTypingStart(activeConv);
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => emitTypingStop(activeConv), 1500);
  };

  const onSend = async (overrideText?: string) => {
    const text = (overrideText !== undefined ? overrideText : newMsg).trim();
    if (!activeConv || !text) return;
    try {
      const sent = await api.sendMessage({ conversationId: activeConv, content: text, senderName: user?.displayName });
      setMessages((prev) => [...prev, sent as any]);
      setNewMsg('');
      emitTypingStop(activeConv);
      await loadConversations();
      triggerBotReply(text);
    } catch (e: any) {
      toast.error(e.message || 'Failed to send message');
    }
  };

  const onFiles = async (files: FileList | File[] | null) => {
    if (!files || !activeConv) return;
    const arr = Array.from(files);
    if (!arr.length) return;
    setUploading(true);
    try {
      const sent = await api.uploadAttachments(String(activeConv), arr);
      setMessages((prev) => [...prev, sent as any]);
      await loadConversations();
    } catch (e: any) {
      toast.error(e.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const downloadAttachment = async (att: Attachment) => {
    try {
      const token = getAuthToken();
      const res = await fetch(
        `${getApiUrl()}/messages/attachments/${att.id}/download`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Download failed');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = att.fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      toast.error(e.message || 'Download failed');
    }
  };

  const deleteMessage = async (msg: Msg) => {
    if (msg.isBot) {
      setMessages((prev) => prev.filter((m) => m.id !== msg.id));
      return;
    }
    try {
      await api.deleteMessage(String(msg.id));
      setMessages((prev) => prev.filter((m) => m.id !== msg.id));
      toast.success('Message deleted');
    } catch (e: any) {
      toast.error(e.message || 'Failed to delete message');
    }
  };

  const filteredConversations = useMemo(() => {
    if (!search.trim()) return conversations;
    return conversations.filter((c) => (c.lastMessage || '').toLowerCase().includes(search.toLowerCase()));
  }, [conversations, search]);

  const activeConversation = conversations.find((c) => c.id === activeConv);
  const recipientName = 'KABOSS Support';

  return (
    <div className="h-[calc(100vh-8rem)]">
      <h1 className="text-3xl font-bold mb-6">Messages</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] h-[calc(100%-4rem)] rounded-2xl bg-white dark:bg-premium-dark/80 border border-gray-100 dark:border-gray-800 overflow-hidden">
        {/* Conversation list */}
        <div className={cn('border-r border-gray-100 dark:border-gray-800 flex flex-col', showMobileChat && 'hidden lg:flex')}>
          <div className="p-4 border-b border-gray-100 dark:border-gray-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search conversations..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="p-4 text-sm text-gray-500">Loading...</div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-4 text-sm text-gray-500">No conversations yet.</div>
            ) : (
              filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => { setActiveConv(conv.id); setShowMobileChat(true); }}
                  className={cn(
                    'w-full text-left p-4 border-b border-gray-50 dark:border-gray-800/50 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/30',
                    activeConv === conv.id && 'bg-kaboss-50 dark:bg-kaboss-950/30'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-kaboss-500 to-kaboss-700 flex items-center justify-center text-white text-sm font-medium shrink-0">
                        K
                      </div>
                      <span className={cn('absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-premium-dark', online ? 'bg-green-500' : 'bg-gray-300')} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <p className="font-medium text-sm truncate">{recipientName}</p>
                        <span className="text-xs text-gray-400 shrink-0 ml-2">
                          {conv.lastMessageAt ? formatDate(conv.lastMessageAt) : ''}
                        </span>
                      </div>
                      <div className="flex justify-between items-center gap-2">
                        <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
                        {(conv.unread ?? 0) > 0 && (
                          <span className="shrink-0 h-5 min-w-5 px-1.5 rounded-full bg-kaboss-500 text-white text-[10px] font-bold flex items-center justify-center">
                            {conv.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat window */}
        <div className={cn('flex-col', showMobileChat ? 'flex' : 'hidden lg:flex')}>
          {/* Header */}
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {showMobileChat && (
                <button
                  onClick={() => setShowMobileChat(false)}
                  className="lg:hidden p-2 -ml-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
                  title="Back to conversations"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
              )}
              <div className="relative">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-kaboss-500 to-kaboss-700 flex items-center justify-center text-white text-sm font-medium">
                  K
                </div>
                <span className={cn('absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-premium-dark', online ? 'bg-green-500' : 'bg-gray-300')} />
              </div>
              <div>
                <h3 className="font-semibold">{recipientName}</h3>
                <p className="text-xs text-gray-500">
                  {botTyping ? 'KABOSS Assistant is typing...' : typing ? 'typing...' : online ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
            {activeConversation?.status && ['completed', 'archived'].includes(activeConversation.status) && (
              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 capitalize">
                {activeConversation.status}
              </span>
            )}
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); onFiles(e.dataTransfer.files); }}
            className={cn('flex-1 overflow-y-auto p-4 space-y-4 relative', dragOver && 'bg-kaboss-50/50 dark:bg-kaboss-950/30')}
          >
            {dragOver && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="p-6 rounded-2xl bg-white/90 dark:bg-premium-dark/90 border-2 border-dashed border-kaboss-500 text-kaboss-600 font-medium">
                  Drop files to upload
                </div>
              </div>
            )}

            {/* Load older button / spinner */}
            <div className="flex justify-center">
              {loadingOlder ? (
                <div className="flex items-center gap-2 text-xs text-gray-400 py-1">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading earlier messages...
                </div>
              ) : hasMore ? (
                <button
                  onClick={loadOlderMessages}
                  className="flex items-center gap-1.5 text-xs text-kaboss-600 dark:text-kaboss-400 hover:underline py-1"
                >
                  <ChevronUp className="h-3.5 w-3.5" /> Load earlier messages
                </button>
              ) : null}
            </div>

            {loadingMsgs ? (
              <div className="flex items-center justify-center text-gray-400">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-sm text-gray-500 text-center mt-10">
                <div className="mx-auto h-14 w-14 rounded-full bg-kaboss-50 dark:bg-kaboss-950/30 flex items-center justify-center mb-3">
                  <Bot className="h-7 w-7 text-kaboss-500" />
                </div>
<p className="font-medium text-gray-600 dark:text-gray-300">{'Hello! I\u2019m the KABOSS Assistant \uD83D\uDC4B'}</p>
                <p className="mt-1">I can help you with pricing, bookings, our services &amp; more — or connect you to a real person.</p>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {BOT_SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => onSend(s)}
                      className="px-3 py-1.5 rounded-full text-xs bg-kaboss-50 dark:bg-kaboss-950/30 text-kaboss-600 dark:text-kaboss-400 border border-kaboss-200 dark:border-kaboss-800 hover:bg-kaboss-100 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isMe = myId != null && msg.senderId === myId;
                const isBot = !!msg.isBot;
                const prev = messages[idx - 1];
                const showDateSep = !prev || formatDayLabel(prev.createdAt) !== formatDayLabel(msg.createdAt);
                return (
                  <div key={msg.id} className="space-y-4">
                    {showDateSep && (
                      <div className="flex justify-center">
                        <span className="text-[11px] px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500">
                          {formatDayLabel(msg.createdAt)}
                        </span>
                      </div>
                    )}
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn('flex flex-col', isMe ? 'items-end' : 'items-start')}
                    >
                      <div
                        className={cn(
                          'max-w-[75%] p-3 rounded-2xl relative group',
                          isMe
                            ? 'bg-kaboss-500 text-white rounded-br-md'
                            : isBot
                              ? 'bg-gradient-to-br from-kaboss-50 to-kaboss-100 dark:from-kaboss-950/40 dark:to-kaboss-900/30 text-gray-800 dark:text-gray-100 border border-kaboss-100 dark:border-kaboss-800/50 rounded-bl-md'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-md'
                        )}
                      >
                        {isBot && (
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <span className="h-5 w-5 rounded-full bg-kaboss-500 flex items-center justify-center">
                              <Bot className="h-3 w-3 text-white" />
                            </span>
                            <span className="text-[11px] font-semibold text-kaboss-600 dark:text-kaboss-400">KABOSS Assistant</span>
                          </div>
                        )}
                        {msg.content && <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>}

                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className={cn('mt-2 space-y-2', msg.content && 'mt-2')}>
                            {msg.attachments.map((att) => (
                              <div key={att.id} className="flex items-center gap-2">
                                {att.fileType === 'image' ? (
                                  <button
                                    onClick={() => setPreview(att)}
                                    className="block rounded-lg overflow-hidden border border-black/10"
                                  >
                                    <img
                                      src={attachmentUrl(att.id)}
                                      alt={att.fileName}
                                      className="h-24 w-24 object-cover"
                                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                    />
                                  </button>
                                ) : (
                                  <div className="flex items-center gap-2 p-2 rounded-lg bg-black/10 dark:bg-white/10">
                                    {att.fileType === 'pdf' ? <FileText className="h-5 w-5" /> : <ImageIcon className="h-5 w-5" />}
                                    <div className="min-w-0">
                                      <p className="text-xs truncate max-w-[120px]">{att.fileName}</p>
                                      <p className="text-[10px] opacity-70">{fileSize(att.size)}</p>
                                    </div>
                                  </div>
                                )}
                                <button
                                  onClick={() => downloadAttachment(att)}
                                  className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                                  title="Download"
                                >
                                  <Download className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className={cn('flex items-center gap-1 mt-1', isMe ? 'justify-end' : 'justify-start')}>
                          <span className={cn('text-[10px]', isMe ? 'text-white/70' : isBot ? 'text-kaboss-500/70' : 'text-gray-400')}>
                            {formatTime(msg.createdAt)}
                          </span>
                          {isMe && (
                            msg.seenAt ? <CheckCheck className="h-3.5 w-3.5 text-white/80" />
                              : msg.isRead ? <CheckCheck className="h-3.5 w-3.5 text-white/50" />
                                : <Check className="h-3.5 w-3.5 text-white/50" />
                          )}
                        </div>

                        {isMe && (
                          <button
                            onClick={() => deleteMessage(msg)}
                            className="absolute -top-2 -right-2 p-1 rounded-full bg-white dark:bg-premium-dark shadow border border-gray-100 dark:border-gray-800 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Delete message"
                          >
                            <Trash2 className="h-3 w-3 text-red-500" />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  </div>
                );
              })
            )}

            {botTyping && (
              <div className="flex items-center gap-2">
                <span className="h-6 w-6 rounded-full bg-kaboss-500 flex items-center justify-center shrink-0">
                  <Bot className="h-3 w-3 text-white" />
                </span>
                <div className="flex items-center gap-1 text-gray-400 text-sm px-3 py-2 rounded-2xl bg-kaboss-50 dark:bg-kaboss-950/30">
                  <span className="inline-block h-2 w-2 rounded-full bg-kaboss-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="inline-block h-2 w-2 rounded-full bg-kaboss-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="inline-block h-2 w-2 rounded-full bg-kaboss-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            {typing && !botTyping && (
              <div className="flex items-center gap-1 text-gray-400 text-sm">
                <span className="inline-block h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="inline-block h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="inline-block h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-100 dark:border-gray-800">
            {uploading && (
              <div className="flex items-center gap-2 text-sm text-kaboss-600 mb-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Uploading files...
              </div>
            )}
            <div className="flex gap-3 relative">
              <button
                onClick={() => setShowEmoji(!showEmoji)}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Smile className="h-5 w-5 text-gray-400" />
              </button>
              <label className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                <Paperclip className="h-5 w-5 text-gray-400" />
                <input type="file" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
              </label>
              <textarea
                value={newMsg}
                onChange={(e) => handleTyping(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    onSend();
                  }
                }}
                placeholder="Type your message..."
                rows={1}
                className="flex-1 resize-none px-4 py-2.5 rounded-xl border border-gray-200 bg-white/80 text-sm dark:border-gray-800 dark:bg-premium-dark/80 dark:text-white dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-kaboss-500/20 focus:border-kaboss-500 max-h-32"
              />
              <Button size="icon" disabled={!newMsg.trim() || !activeConv} onClick={() => onSend()}>
                <Send className="h-5 w-5" />
              </Button>

              <AnimatePresence>
                {showEmoji && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-full left-0 mb-2 p-3 rounded-2xl bg-white dark:bg-premium-dark border border-gray-100 dark:border-gray-800 shadow-2xl"
                  >
                    <div className="grid grid-cols-6 gap-2">
                      {EMOJIS.map((e) => (
                        <button
                          key={e}
                          onClick={() => { setNewMsg((prev) => prev + e); setShowEmoji(false); }}
                          className="text-2xl hover:scale-125 transition-transform"
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Image preview modal */}
      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4"
            onClick={() => setPreview(null)}
          >
            <div className="relative max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
              <img
                src={attachmentUrl(preview.id)}
                alt={preview.fileName}
                className="w-full max-h-[80vh] object-contain rounded-2xl"
              />
              <div className="absolute top-3 right-3 flex gap-2">
                <button
                  onClick={() => downloadAttachment(preview)}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white"
                >
                  <Download className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setPreview(null)}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
