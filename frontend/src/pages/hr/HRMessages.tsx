import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  MessageSquare,
  Send,
  Search,
  User,
  Clock,
  CheckCheck,
  Sparkles,
  Loader2,
  RefreshCw,
  Tag,
} from 'lucide-react';
import { messageService } from '../../services';
import { Conversation, Message } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';

export const HRMessages: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialConvId = searchParams.get('conv');

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(initialConvId);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [messageCategory, setMessageCategory] = useState('Workload Check-in');
  
  const [isLoadingConvs, setIsLoadingConvs] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = async () => {
    try {
      const data = await messageService.getConversations();
      setConversations(data.conversations);
      if (!selectedConvId && data.conversations.length > 0) {
        setSelectedConvId(data.conversations[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingConvs(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // Fetch thread messages when selectedConvId changes
  useEffect(() => {
    if (!selectedConvId) return;

    const fetchThread = async () => {
      setIsLoadingMessages(true);
      try {
        const data = await messageService.getConversation(selectedConvId);
        setSelectedConv(data.conversation);
        setMessages(data.messages);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    fetchThread();
  }, [selectedConvId]);

  // Scroll to bottom of message thread
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConvId || !newMessage.trim()) return;

    setIsSending(true);
    try {
      const res = await messageService.sendMessage({
        conversation_id: selectedConvId,
        content: newMessage.trim(),
        category: messageCategory,
      });

      setMessages((prev) => [...prev, res.message]);
      setNewMessage('');
      fetchConversations();
    } catch (err: any) {
      alert(err.message || 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const templatePrompts = [
    { label: 'Workload Check-in', text: 'Hi, I wanted to touch base regarding your current project pace and make sure you feel well-supported with sprint resources.' },
    { label: 'Career Alignment', text: 'Hi, I would love to schedule 15 minutes to discuss your growth goals and milestone trajectory for the upcoming quarter.' },
    { label: 'Compensation Sync', text: 'Hi, following our annual market calibration, I would like to schedule a quick sync to review your band progression.' },
  ];

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Messages & Retention Outreach</h1>
          <p className="text-xs text-slate-500 mt-1">
            Direct, confidential communication channels between HR Leadership and Employees.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchConversations}
          icon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Refresh Inbox
        </Button>
      </div>

      {/* Main Messaging Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
        {/* Left Column: Conversation List */}
        <div className="lg:col-span-4">
          <Card className="p-3 h-full flex flex-col">
            <div className="p-2 pb-3 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800">Active Threads</span>
              <span className="text-[11px] text-slate-400">{conversations.length} total</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 mt-2">
              {isLoadingConvs ? (
                <div className="space-y-2 p-2">
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No conversations yet. You can start one from the Employee Directory.
                </div>
              ) : (
                conversations.map((conv) => {
                  const isSelected = conv.id === selectedConvId;
                  return (
                    <div
                      key={conv.id}
                      onClick={() => setSelectedConvId(conv.id)}
                      className={`p-3 rounded-xl cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-brand-50 border border-brand-200 text-slate-900 shadow-2xs'
                          : 'hover:bg-slate-50 border border-transparent text-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                            {conv.employee_name.split(' ').map((n) => n[0]).join('')}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {conv.employee_name}
                            </p>
                            <p className="text-[11px] text-slate-500 font-medium truncate">
                              {conv.title}
                            </p>
                          </div>
                        </div>

                        {conv.unread_count ? (
                          <span className="w-2 h-2 rounded-full bg-brand-600 shrink-0 mt-1" />
                        ) : null}
                      </div>

                      <p className="text-[11px] text-slate-500 mt-2 line-clamp-1 italic">
                        "{conv.last_message_preview}"
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Chat Box */}
        <div className="lg:col-span-8">
          <Card className="p-0 h-full flex flex-col overflow-hidden">
            {selectedConv ? (
              <>
                {/* Thread Header */}
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      {selectedConv.employee_name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{selectedConv.employee_name}</h3>
                      <p className="text-[11px] text-slate-500">
                        Employee #{selectedConv.employee_id} • {selectedConv.topic}
                      </p>
                    </div>
                  </div>
                  <Badge variant="blue">{selectedConv.topic}</Badge>
                </div>

                {/* Messages Feed */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/30">
                  {isLoadingMessages ? (
                    <div className="py-12 text-center text-xs text-slate-400">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-600 mb-2" />
                      Loading message history...
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-400">
                      No messages in this thread yet. Send a note below.
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isHR = msg.sender_role === 'hr';
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isHR ? 'items-end' : 'items-start'}`}
                        >
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1 px-1">
                            <span className="font-semibold text-slate-600">{msg.sender_name}</span>
                            <span>•</span>
                            <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>

                          <div
                            className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                              isHR
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

                {/* Template Chips */}
                <div className="px-4 py-2 bg-white border-t border-slate-100 flex flex-wrap items-center gap-2">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Templates:</span>
                  {templatePrompts.map((tmpl) => (
                    <button
                      key={tmpl.label}
                      type="button"
                      onClick={() => {
                        setNewMessage(tmpl.text);
                        setMessageCategory(tmpl.label);
                      }}
                      className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] transition-colors"
                    >
                      {tmpl.label}
                    </button>
                  ))}
                </div>

                {/* Composer */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 bg-white">
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      required
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={`Write a message to ${selectedConv.employee_name}...`}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                    />
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      isLoading={isSending}
                      icon={<Send className="w-3.5 h-3.5" />}
                    >
                      Send
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400 space-y-3">
                <MessageSquare className="w-10 h-10 text-slate-300" />
                <h3 className="text-sm font-semibold text-slate-700">Select a conversation thread</h3>
                <p className="text-xs text-slate-400 max-w-sm">
                  Choose an active employee check-in from the list on the left to review message history or reply.
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
