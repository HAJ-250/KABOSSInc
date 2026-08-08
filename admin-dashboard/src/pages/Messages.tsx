import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Send, Paperclip, Image as ImageIcon, Download, FileText, X,
  Check, CheckCheck, Smile, Trash2, Archive, CheckCircle2, Loader2,
  User, MessageSquare, Plus, ArrowLeft, ChevronUp,
} from 'lucide-react';
import { clsx } from 'clsx';
import { adminChatApi, getToken, attachmentUrl } from '../lib/api';
import {
  connectSocket, disconnectSocket, joinConversation, leaveConversation,
  emitTypingStart, emitTypingStop, emitMessageRead,
} from '../lib/socket';
import toast from 'react-hot-toast';

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
  seenAt?: string | null;
  attachments?: Attachment[];
};

type Conversation = {
  id: number;
  participants?: any;
  lastMessage?: string;
  lastMessageAt?: string;
  status?: string;
  unread?: number;
  customer?: { id: number; displayName: string; email?: string; phone?: string } | null;
};

const EMOJIS = ['😀', '😂', '😍', '😎', '👍', '❤️', '🎉', '🔥', '😊', '🤝', '🙏', '✨'];

function formatTime(iso?: string) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatConvDate(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  return sameDay ? formatTime(iso) : d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function fileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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

const PAGE_SIZE = 30;

export function MessagesPage() {
  const myId = useMemo(() => {
    const raw = localStorage.getItem('admin_user');
    if (!raw) return null;
    try { return Number(JSON.parse(raw).id); } catch { return null; }
  }, []);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<number | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [search, setSearch] = useState('');
  const [typing, setTyping] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [oldestId, setOldestId] = useState<number | null>(null);
const [preview, setPreview] = useState<Attachment | null>(null);
  const [showNewChat, setShowNewChat] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<any>(null);

  const loadConversations = useCallback(async (keepActive?: number) => {
    try {
      const data = await adminChatApi.getConversations();
      setConversations(data as any);
      if (!keepActive && data?.length && !activeConv) setActiveConv(data[0].id);
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
      const data = await adminChatApi.getMessages(String(conversationId), { limit: PAGE_SIZE });
      setMessages(data as any);
      if (data?.length) {
        setOldestId(data[0].id);
        setHasMore(data.length >= PAGE_SIZE);
      } else {
        setOldestId(null);
        setHasMore(false);
      }
      emitMessageRead(conversationId);
    } catch (e: any) {
      toast.error(e.message || 'Failed to load messages');
    } finally {
      setLoadingMsgs(false);
    }
  }, []);

  // Load older messages (scroll-up pagination)
  const loadOlderMessages = useCallback(async () => {
    if (!activeConv || !hasMore || loadingOlder || loadingMsgs) return;
    setLoadingOlder(true);
    const el = scrollRef.current;
    const prevHeight = el?.scrollHeight || 0;
    try {
      const older = await adminChatApi.getMessages(String(activeConv), { before: oldestId ?? undefined, limit: PAGE_SIZE });
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

  useEffect(() => {
    connectSocket();
    loadConversations();
    return () => disconnectSocket();
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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, uploading]);

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
      }
loadConversations(activeConv ?? undefined);
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

    socket.on('message:new', onNewMessage);
    socket.on('conversation:update', onConversationUpdate);
    socket.on('typing:start', onTypingStart);
    socket.on('typing:stop', onTypingStop);
    socket.on('message:seen', onMessageSeen);

    return () => {
      socket.off('message:new', onNewMessage);
      socket.off('conversation:update', onConversationUpdate);
      socket.off('typing:start', onTypingStart);
      socket.off('typing:stop', onTypingStop);
      socket.off('message:seen', onMessageSeen);
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

  const onSend = async () => {
    if (!activeConv || !newMsg.trim()) return;
    try {
      const sent = await adminChatApi.sendMessage(String(activeConv), newMsg);
      setMessages((prev) => [...prev, sent as any]);
      setNewMsg('');
      emitTypingStop(activeConv);
      await loadConversations(activeConv);
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
      const sent = await adminChatApi.uploadAttachments(String(activeConv), arr);
      setMessages((prev) => [...prev, sent as any]);
      await loadConversations(activeConv);
    } catch (e: any) {
      toast.error(e.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const downloadAttachment = async (att: Attachment) => {
    try {
      const token = getToken();
      const res = await fetch(`/api/admin/chat/attachments/${att.id}/download`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
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
    try {
      await adminChatApi.deleteMessage(String(msg.id));
      setMessages((prev) => prev.filter((m) => m.id !== msg.id));
      toast.success('Message deleted');
    } catch (e: any) {
      toast.error(e.message || 'Failed to delete message');
    }
  };

  const setStatus = async (status: 'active' | 'archived' | 'completed') => {
    if (!activeConv) return;
    try {
      await adminChatApi.setStatus(String(activeConv), status);
      setConversations((prev) =>
        prev.map((c) => (c.id === activeConv ? { ...c, status } : c))
      );
      toast.success(`Conversation marked ${status}`);
    } catch (e: any) {
      toast.error(e.message || 'Failed to update status');
    }
  };

const openNewChat = async () => {
    setShowNewChat(true);
    try {
      const data = await adminChatApi.getCustomers();
      setCustomers(data as any);
    } catch (e: any) {
      toast.error(e.message || 'Failed to load customers');
    }
  };

  const startChatWithCustomer = async (customerId: number) => {
    setShowNewChat(false);
    setCustomerSearch('');
    try {
      const conv = await adminChatApi.createConversation(String(customerId));
      // Add/update in the conversation list
      setConversations((prev) => {
        const idx = prev.findIndex((c) => c.id === conv.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], ...conv };
          return next;
        }
        return [conv, ...prev];
      });
      setActiveConv(conv.id);
      toast.success('Conversation started');
    } catch (e: any) {
      toast.error(e.message || 'Failed to start conversation');
    }
  };

  const filteredConversations = useMemo(() => {
    if (!search.trim()) return conversations;
    return conversations.filter((c) =>
      (c.customer?.displayName || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.customer?.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.lastMessage || '').toLowerCase().includes(search.toLowerCase())
    );
  }, [conversations, search]);

  const filteredCustomers = useMemo(() => {
    if (!customerSearch.trim()) return customers;
    return customers.filter((c) =>
      (c.displayName || '').toLowerCase().includes(customerSearch.toLowerCase()) ||
      (c.email || '').toLowerCase().includes(customerSearch.toLowerCase())
    );
  }, [customers, customerSearch]);

  const activeConversation = conversations.find((c) => c.id === activeConv);
  const activeCustomer = activeConversation?.customer;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Customer conversations</p>
        </div>
        <button
          onClick={openNewChat}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-kaboss-500 text-white text-sm font-medium hover:bg-kaboss-600 transition-colors"
        >
          <Plus className="h-4 w-4" /> New Chat
        </button>
      </div>

<div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] h-[calc(100vh-16rem)] rounded-2xl bg-white dark:bg-premium-dark/80 border border-gray-100 dark:border-gray-800 overflow-hidden">
        {/* Conversation list */}
        <div className={clsx('border-r border-gray-100 dark:border-gray-800 flex flex-col', showMobileChat && 'hidden lg:flex')}>
          <div className="p-4 border-b border-gray-100 dark:border-gray-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                placeholder="Search customers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-premium-dark/80 focus:outline-none focus:ring-2 focus:ring-kaboss-500/50"
              />
            </div>
          </div>
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="flex items-center justify-center p-8 text-gray-400">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-4 text-sm text-gray-500">No conversations yet.</div>
            ) : (
              filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => { setActiveConv(conv.id); setShowMobileChat(true); }}
                  className={clsx(
                    'w-full text-left p-4 border-b border-gray-50 dark:border-gray-800/50 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/30',
                    activeConv === conv.id && 'bg-kaboss-50 dark:bg-kaboss-950/30'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-kaboss-500 to-kaboss-700 flex items-center justify-center text-white text-sm font-medium shrink-0">
                      {conv.customer?.displayName?.charAt(0)?.toUpperCase() || 'C'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <p className="font-medium text-sm truncate">
                          {conv.customer?.displayName || 'Customer'}
                        </p>
                        <span className="text-xs text-gray-400 shrink-0 ml-2">
                          {formatConvDate(conv.lastMessageAt)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center gap-2">
                        <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
                        <div className="flex items-center gap-1 shrink-0">
                          {(conv.unread ?? 0) > 0 && (
                            <span className="h-5 min-w-5 px-1.5 rounded-full bg-kaboss-500 text-white text-[10px] font-bold flex items-center justify-center">
                              {conv.unread}
                            </span>
                          )}
                          {conv.status === 'completed' && <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}
                          {conv.status === 'archived' && <Archive className="h-3.5 w-3.5 text-gray-400" />}
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

{/* Chat window */}
        <div className={clsx('flex flex-col', !showMobileChat && 'hidden lg:flex')}>
          {/* Header */}
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowMobileChat(false)}
                className="lg:hidden p-2 -ml-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
                title="Back to conversations"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-kaboss-500 to-kaboss-700 flex items-center justify-center text-white text-sm font-medium">
                {activeCustomer?.displayName?.charAt(0)?.toUpperCase() || 'C'}
              </div>
              <div>
                <h3 className="font-semibold">{activeCustomer?.displayName || 'Customer'}</h3>
                <p className="text-xs text-gray-500">
                  {typing ? 'typing...' : activeCustomer?.email || 'Active conversation'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {activeConversation?.status === 'completed' && (
                <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-medium">Completed</span>
              )}
              {activeConversation?.status === 'archived' && (
                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 font-medium">Archived</span>
              )}
              <button
                onClick={() => setStatus('completed')}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-green-500 transition-colors"
                title="Mark completed"
              >
                <CheckCircle2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setStatus('archived')}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors"
                title="Archive"
              >
                <Archive className="h-4 w-4" />
              </button>
            </div>
          </div>

{/* Messages */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); onFiles(e.dataTransfer.files); }}
            className={clsx('flex-1 overflow-y-auto p-4 space-y-4 relative', dragOver && 'bg-kaboss-50/50 dark:bg-kaboss-950/30')}
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
                No messages yet. Send a greeting to this customer.
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isMe = myId != null && msg.senderId === myId;
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
                    className={clsx('flex flex-col', isMe ? 'items-end' : 'items-start')}
                  >
                    <div
                      className={clsx(
                        'max-w-[75%] p-3 rounded-2xl relative group',
                        isMe
                          ? 'bg-kaboss-500 text-white rounded-br-md'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-md'
                      )}
                    >
                      {msg.content && <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>}

                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mt-2 space-y-2">
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

                      <div className={clsx('flex items-center gap-1 mt-1', isMe ? 'justify-end' : 'justify-start')}>
                        <span className={clsx('text-[10px]', isMe ? 'text-white/70' : 'text-gray-400')}>
                          {formatTime(msg.createdAt)}
                        </span>
                        {isMe && (
                          msg.seenAt ? <CheckCheck className="h-3.5 w-3.5 text-white/80" />
                            : msg.isRead ? <CheckCheck className="h-3.5 w-3.5 text-white/50" />
                              : <Check className="h-3.5 w-3.5 text-white/50" />
                        )}
                      </div>

                      <button
                        onClick={() => deleteMessage(msg)}
                        className="absolute -top-2 -right-2 p-1 rounded-full bg-white dark:bg-premium-dark shadow border border-gray-100 dark:border-gray-800 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete message"
                      >
<Trash2 className="h-3 w-3 text-red-500" />
                      </button>
                    </div>
                    </motion.div>
                  </div>
                );
              })
            )}
            {typing && (
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
                className="flex-1 resize-none px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-premium-dark/80 focus:outline-none focus:ring-2 focus:ring-kaboss-500/50 max-h-32"
              />
              <button
                onClick={onSend}
                disabled={!newMsg.trim() || !activeConv}
                className="px-4 py-2.5 rounded-xl bg-kaboss-500 text-white hover:bg-kaboss-600 disabled:opacity-50 transition-colors"
              >
                <Send className="h-5 w-5" />
              </button>

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

      {/* New chat modal */}
      <AnimatePresence>
        {showNewChat && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4"
            onClick={() => setShowNewChat(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl bg-white dark:bg-premium-dark border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <h3 className="font-semibold">Start a new conversation</h3>
                <button onClick={() => setShowNewChat(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-4">
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    placeholder="Search customers..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-premium-dark/80 focus:outline-none focus:ring-2 focus:ring-kaboss-500/50"
                  />
                </div>
                <div className="max-h-80 overflow-y-auto space-y-1">
                  {filteredCustomers.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => startChatWithCustomer(c.id)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left"
                    >
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-kaboss-500 to-kaboss-700 flex items-center justify-center text-white text-sm font-medium shrink-0">
                        {c.displayName?.charAt(0)?.toUpperCase() || 'C'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm">{c.displayName}</p>
                        <p className="text-xs text-gray-500 truncate">{c.email || c.phone || ''}</p>
                      </div>
                    </button>
                  ))}
                  {filteredCustomers.length === 0 && (
                    <div className="text-sm text-gray-500 text-center py-6">No customers found</div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
