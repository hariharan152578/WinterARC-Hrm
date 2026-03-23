"use client";

import { useState, useEffect, useRef } from "react";
import { Settings, Shield, MessageSquare, Send, ChevronRight } from "lucide-react";
import Link from "next/link";
import { User, useAuth } from "@/context/AuthContext";
import { getTenantMessages, sendTenantMessage } from "@/services/chat.service";
import { EventService, EventType } from "@/services/event.service";
import PremiumEfficiencyMeter from "@/components/dashboard/PremiumEfficiencyMeter";

interface RightPanelProps {
  user: User | null;
  profile: any;
  recentLogs: any[];
  efficiency?: any; // Changed to any to support the {day, week, month, overall} object
  efficiencyLogs?: any[];
}

export default function RightPanel({ user, profile, recentLogs, efficiency, efficiencyLogs }: RightPanelProps) {
  const { socket } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [events, setEvents] = useState<EventType[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const profileImage = profile?.profileImage
    ? `http://localhost:5000/${profile.profileImage}`
    : "/avatar.png";

  useEffect(() => {
    fetchMessages();
    fetchEvents();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("tenant:message", (msg: any) => {
        setMessages((prev) => [...prev, msg]);
      });
      return () => {
        socket.off("tenant:message");
      };
    }
  }, [socket]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await getTenantMessages();
      setMessages(res.data.messages);
    } catch (err) {
      console.error("Failed to fetch tenant messages", err);
    }
  };

  const fetchEvents = async () => {
    try {
      const data = await EventService.getEvents();
      setEvents(data);
    } catch (err) {
      console.error("Failed to fetch events", err);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const formData = new FormData();
      formData.append("content", newMessage);
      await sendTenantMessage(formData);
      setNewMessage("");
    } catch (err) {
      console.error("Failed to send message", err);
    } finally {
      setSending(false);
    }
  };

  // Get upcoming 3 events
  const upcomingEvents = [...events]
    .filter(e => new Date(e.date) >= new Date(new Date().setHours(0, 0, 0, 0)))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  return (
    <aside className="w-full xl:w-80 bg-white border-l border-gray-100 p-6 flex flex-col gap-8">

      {/* PREMIUM EFFICIENCY METER */}
      <PremiumEfficiencyMeter 
        efficiency={efficiency || 0} 
        logs={efficiencyLogs} 
      />

      {/* AURAGUARD MESSENGER (Tenant-wide chat) */}
      <div className="flex flex-col h-[500px]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <Shield size={16} />
            </div>
            <h4 className="text-sm font-black text-gray-900 tracking-tight">Tenant Messenger</h4>
          </div>
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
        </div>

        <div className="bg-[#1D2B53] rounded-4xl p-4 flex-1 flex flex-col shadow-xl shadow-indigo-100/50 overflow-hidden">
          <div
            ref={scrollRef}
            className="flex-1 space-y-4 overflow-y-auto mb-4 scrollbar-hide pr-1"
          >
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full opacity-20">
                <MessageSquare size={48} className="text-white mb-2" />
                <p className="text-[10px] text-white font-bold">No messages yet</p>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div
                  key={msg.id || i}
                  className={`flex flex-col ${msg.senderId === user?.id ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[9px] text-indigo-300 font-bold mb-1 ml-1 mr-1">
                    {msg.user?.name || 'Unknown'}
                  </span>
                  <div
                    className={`p-3 rounded-2xl border max-w-[90%] ${msg.senderId === user?.id
                      ? 'bg-indigo-500/20 border-indigo-400/20 text-white'
                      : 'bg-white/5 border-white/10 text-indigo-100'
                      }`}
                  >
                    <p className="text-[11px] leading-relaxed font-bold wrap-break-word">{msg.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleSendMessage} className="relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Message workspace..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-5 pr-12 text-[11px] text-white font-bold placeholder-white/20 focus:outline-none focus:border-indigo-400 transition-all"
            />
            <button
              type="submit"
              disabled={sending}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-all disabled:opacity-50"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      </div>

      {/* WEEKLY SCHEDULE */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-black text-gray-900 tracking-tight">Weekly Schedule</h4>
          <Link
            href="/dashboard/events"
            className="text-[11px] font-black text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            View All
          </Link>
        </div>
        <div className="space-y-4">
          {upcomingEvents.length === 0 ? (
            <p className="text-[11px] text-gray-400 font-bold italic py-4 text-center">No upcoming events</p>
          ) : (
            upcomingEvents.map((ev, i) => {
              const eventDate = new Date(ev.date);
              const dayName = eventDate.toLocaleDateString('en-US', { weekday: 'short' });
              const dayNum = eventDate.getDate().toString().padStart(2, '0');

              return (
                <div key={ev.id || i} className="flex items-center gap-3 group cursor-pointer">
                  <div className="flex flex-col items-center justify-center w-10 h-10 bg-white rounded-xl border border-gray-100 group-hover:border-indigo-100 transition-all shadow-xs shrink-0">
                    <span className="text-[8px] font-black text-gray-400 uppercase leading-none">
                      {dayName}
                    </span>
                    <span className="text-xs font-black text-gray-900 mt-1">
                      {dayNum}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-gray-900 truncate">{ev.title}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className={`w-1 h-1 rounded-full`} style={{ backgroundColor: ev.color || '#6366f1' }} />
                      <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest truncate">
                        {ev.startTime} - {ev.endTime}
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={12} className="text-gray-300 group-hover:translate-x-1 transition-transform shrink-0" />
                </div>
              );
            })
          )}
        </div>
      </div>

    </aside>
  );
}
