import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Send, Paperclip, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const conversations = [
  { id: 1, name: 'KABOSS Support', lastMsg: 'Your invitations are ready for review!', unread: 2, time: '2h ago' },
  { id: 2, name: 'KABOSS Support', lastMsg: 'We received your booking request.', unread: 0, time: '1d ago' },
];

const messages = [
  { id: 1, sender: 'KABOSS Support', content: 'Hello! How can we help you today?', time: '10:30 AM', isMe: false },
  { id: 2, sender: 'You', content: 'Hi, I wanted to check on my wedding invitation order.', time: '10:32 AM', isMe: true },
  { id: 3, sender: 'KABOSS Support', content: 'Sure! Your invitations are being printed and will be ready by Friday.', time: '10:33 AM', isMe: false },
];

export function DashboardMessages() {
  const [activeConv, setActiveConv] = useState(1);
  const [newMsg, setNewMsg] = useState('');

  return (
    <div className="h-[calc(100vh-8rem)]">
      <h1 className="text-3xl font-bold mb-6">Messages</h1>
      <div className="grid grid-cols-[320px_1fr] h-[calc(100%-4rem)] rounded-2xl bg-white dark:bg-premium-dark/80 border border-gray-100 dark:border-gray-800 overflow-hidden">
        {/* Sidebar */}
        <div className="border-r border-gray-100 dark:border-gray-800">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search conversations..." className="pl-9" />
            </div>
          </div>
          <div className="overflow-y-auto h-[calc(100%-73px)]">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setActiveConv(conv.id)}
                className={cn(
                  'w-full text-left p-4 border-b border-gray-50 dark:border-gray-800/50 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/30',
                  activeConv === conv.id && 'bg-kaboss-50 dark:bg-kaboss-950/30'
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-kaboss-500 to-kaboss-700 flex items-center justify-center text-white text-sm font-medium shrink-0">
                    K
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <p className="font-medium text-sm truncate">{conv.name}</p>
                      <span className="text-xs text-gray-400">{conv.time}</span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{conv.lastMsg}</p>
                  </div>
                  {conv.unread > 0 && (
                    <div className="h-5 min-w-[20px] rounded-full bg-kaboss-500 text-white text-xs flex items-center justify-center px-1">
                      {conv.unread}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat */}
        <div className="flex flex-col">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800">
            <h3 className="font-semibold">KABOSS Support</h3>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={cn('flex', msg.isMe ? 'justify-end' : 'justify-start')}>
                <div className={cn(
                  'max-w-[70%] p-3 rounded-2xl',
                  msg.isMe
                    ? 'bg-kaboss-500 text-white rounded-br-md'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-md'
                )}>
                  <p className="text-sm">{msg.content}</p>
                  <p className={cn('text-xs mt-1', msg.isMe ? 'text-white/70' : 'text-gray-400')}>{msg.time}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-gray-100 dark:border-gray-800">
            <div className="flex gap-3">
              <button className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <Paperclip className="h-5 w-5 text-gray-400" />
              </button>
              <Input
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
              />
              <Button size="icon" disabled={!newMsg.trim()}>
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
