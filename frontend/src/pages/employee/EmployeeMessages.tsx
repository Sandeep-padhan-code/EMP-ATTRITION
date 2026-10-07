import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Loader2,
  RefreshCw,
  ShieldCheck,
  User,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { messageService } from '../../services';
import { Conversation, Message } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export const EmployeeMessages: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const convRes = await messageService.getConversations();
      setConversations(convRes.conversations);

      if (convRes.conversations.length > 0) {
        const convId = convRes.conversations[0].id;
        setSelectedConv(convRes.conversations[0]);
        const msgRes = await messageService.getConversation(convId);
        setMessages(msgRes.messages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setIsSending(true);
    try {
      const res = await messageService.sendMessage({
        conversation_id: selectedConv?.id,
        content: newMessage.trim(),
        category: 'Employee Response',
      });

      setMessages((prev) => [...prev, res.message]);
      setNewMessage('');
    } catch (err: any) {
      alert(err.message || 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">HR Communications & Sync</h1>
          <p className="text-xs text-slate-500 mt-1">
            Direct, confidential communication channel with your People & Talent business partner.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchMessages}
          icon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Refresh Chat
        </Button>
      </div>

      {/* Main Chat Box */}
      <Card className="p-0 h-[600px] flex flex-col overflow-hidden shadow-subtle border border-slate-200">
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              HR
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">People & Talent Operations</h3>
              <p className="text-[11px] text-slate-500">Elena Rostova (VP People) • Confidential Channel</p>
            </div>
          </div>
          <Badge variant="emerald">Secure Thread</Badge>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/30">
          {isLoading ? (
            <div className="py-16 text-center text-xs text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-600 mb-2" />
              Loading messages...
            </div>
          ) : messages.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400 space-y-2">
              <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="font-semibold text-slate-700">No message history yet</p>
              <p className="max-w-sm mx-auto text-slate-400">
                You can write a question or schedule request to your HR representative below.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender_role === 'employee';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1 px-1">
                    <span className="font-semibold text-slate-600">{msg.sender_name}</span>
                    <span>•</span>
                    <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <div
                    className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                      isMe
                        ? 'bg-brand-600 text-white rounded-tr-xs'
                        : 'bg-white text-slate-900 border border-slate-200/90 rounded-tl-xs'
                    }`}
                  >
                    <p>{msg.content}</p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Reply Composer */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 bg-white">
          <div className="flex items-center gap-3">
            <input
              type="text"
              required
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message or response to HR..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSending}
              icon={<Send className="w-3.5 h-3.5" />}
            >
              Reply
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
