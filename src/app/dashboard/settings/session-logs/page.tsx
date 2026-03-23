"use client";

import { useEffect, useState, useRef } from "react";
import { getMySessions } from "@/services/user.service";
import { 
  Clock, 
  Calendar, 
  MapPin, 
  LogOut, 
  LogIn,
  Activity,
  ChevronRight,
  Monitor
} from "lucide-react";
import { gsap } from "gsap";

export default function SessionLogsPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const response = await getMySessions();
      setSessions(response.data || []);
    } catch (error) {
      console.error("Error loading sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && sessions.length > 0) {
      gsap.fromTo(
        ".session-row",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: "power2.out" }
      );
    }
  }, [loading, sessions]);

  const calculateDurationMs = (login: string, logout: string | null) => {
    const start = new Date(login).getTime();
    const end = logout ? new Date(logout).getTime() : new Date().getTime();
    return end - start;
  };

  const formatDuration = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getStats = () => {
    const today = new Date().toDateString();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    let todayMs = 0;
    let weekMs = 0;
    let overallMs = 0;

    sessions.forEach(s => {
      const duration = calculateDurationMs(s.loginAt, s.logoutAt);
      const sessionDate = new Date(s.loginAt);
      
      overallMs += duration;

      if (sessionDate.toDateString() === today) {
        todayMs += duration;
      }
      if (sessionDate >= oneWeekAgo) {
        weekMs += duration;
      }
    });

    return {
      today: formatDuration(todayMs),
      week: formatDuration(weekMs),
      overall: formatDuration(overallMs),
      total: sessions.length
    };
  };

  const stats = getStats();

  return (
    <div ref={containerRef} className="min-h-screen bg-white p-6 md:p-10 space-y-8 max-w-[1600px] mx-auto text-slate-900">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-[#e8f5f4] flex items-center justify-center">
              <Activity size={18} className="text-[#4db6ac]" />
            </div>
            <span className="text-[10px] font-black text-[#4db6ac] uppercase tracking-[0.2em]">Security & Activity</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">
            Session History
          </h1>
        </div>
        
        <div className="flex items-center gap-6 md:gap-12 relative z-10 pb-1">
          <div className="text-center">
            <span className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">Hours Today</span>
            <span className="text-xl md:text-2xl font-black text-[#4db6ac]">{stats.today}</span>
          </div>
          <div className="w-px h-8 bg-slate-100 hidden md:block" />
          <div className="text-center">
            <span className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">Weekly Total</span>
            <span className="text-xl md:text-2xl font-black text-slate-900">{stats.week}</span>
          </div>
          <div className="w-px h-8 bg-slate-100 hidden md:block" />
          <div className="text-center">
            <span className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">Overall Time</span>
            <span className="text-xl md:text-2xl font-black text-purple-600">{stats.overall}</span>
          </div>
          <div className="w-px h-8 bg-slate-100 hidden md:block" />
          <div className="text-center">
            <span className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">Total Sessions</span>
            <span className="text-xl md:text-2xl font-black text-slate-900">{stats.total}</span>
          </div>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden p-2">
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-y-3 px-4">
            <thead>
              <tr className="text-slate-400 capitalize text-xs">
                <th className="px-6 py-4 font-bold text-left tracking-widest uppercase text-[10px]">Session Status</th>
                <th className="px-6 py-4 font-bold text-left tracking-widest uppercase text-[10px]">Login Details</th>
                <th className="px-6 py-4 font-bold text-left tracking-widest uppercase text-[10px]">Logout Details</th>
                <th className="px-6 py-4 font-bold text-center tracking-widest uppercase text-[10px]">Work Mode</th>
                <th className="px-6 py-4 font-bold text-right tracking-widest uppercase text-[10px]">Session Duration</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-8 bg-slate-50 rounded-2xl"></td>
                  </tr>
                ))
              ) : sessions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-slate-400">
                      <Clock size={48} strokeWidth={1} />
                      <p className="font-bold text-sm tracking-widest uppercase">No session logs found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                sessions.map((session) => (
                  <tr key={session.id} className="session-row bg-white hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-6 border-y border-l border-slate-100 rounded-l-2xl">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-xs ring-2 ring-white transition-all ${!session.logoutAt ? 'bg-[#e8f5f4] text-[#4db6ac]' : 'bg-slate-100 text-slate-400'}`}>
                          {session.logoutAt ? <LogIn size={18} /> : <Activity size={18} className="animate-pulse" />}
                        </div>
                        <div>
                          <p className={`text-sm font-black ${!session.logoutAt ? 'text-[#4db6ac]' : 'text-slate-900'}`}>
                            {session.logoutAt ? "Completed" : "Active Now"}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {session.logoutAt ? "Closed Session" : "Tracking Time"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-6 border-y border-slate-100">
                      <div className="flex flex-col gap-1 w-full min-w-[150px]">
                        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                          <LogIn size={14} className="text-[#4db6ac]" />
                          {new Date(session.loginAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          <Calendar size={12} />
                          {new Date(session.loginAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-6 border-y border-slate-100">
                      <div className="flex flex-col gap-1 w-full min-w-[150px]">
                        {session.logoutAt ? (
                          <>
                            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                              <LogOut size={14} className="text-slate-400" />
                              {new Date(session.logoutAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              <Calendar size={12} />
                              {new Date(session.logoutAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                            </div>
                          </>
                        ) : (
                          <span className="inline-flex items-center gap-2 px-3 py-1 bg-[#e8f5f4] text-[#4db6ac] rounded-full text-[10px] font-bold w-fit uppercase tracking-widest">
                            <Monitor size={12} /> Live Session
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-6 border-y border-slate-100 text-center">
                      <div className="inline-flex items-center gap-1.5 bg-slate-50 text-slate-600 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-slate-100">
                        <MapPin size={12} className="text-[#4db6ac]" />
                        {session.isoffice || "Remote"}
                      </div>
                    </td>

                    <td className="px-6 py-6 border-y border-r border-slate-100 rounded-r-2xl text-right">
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-sm font-black text-slate-900 tracking-tight">
                          {formatDuration(calculateDurationMs(session.loginAt, session.logoutAt))}
                        </span>
                        <div className="h-1 w-12 bg-slate-100 rounded-full overflow-hidden">
                           <div className="h-full bg-[#4db6ac]" style={{ width: session.logoutAt ? '100%' : '30%' }} />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
