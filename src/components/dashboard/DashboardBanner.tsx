"use client";

import { Clock, CheckCircle2, Zap, LogIn, LogOut } from "lucide-react";

interface DashboardBannerProps {
  userName: string;
  isLoggedIn: boolean;
  onToggleAttendance: () => void;
  tasksCompleted: number;
}

export default function DashboardBanner({
  userName,
  isLoggedIn,
  onToggleAttendance,
  tasksCompleted
}: DashboardBannerProps) {
  return (
    <div className="relative bg-linear-to-br from-[#1A237E] to-[#3949AB] rounded-4xl p-7 overflow-hidden group shadow-2xl shadow-indigo-100/50">
      {/* DECORATIVE ELEMENTS */}
      <div className="absolute top-0 right-0 w-60 h-60 bg-white/5 rounded-full -mr-30 -mt-30 blur-3xl group-hover:bg-white/10 transition-colors duration-1000" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400/10 rounded-full -ml-24 -mb-24 blur-2xl animate-pulse" />

      {/* TOP BADGE */}
      <div className="relative z-10 flex items-center gap-2 mb-4">
        <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
          <span className="text-[9px] font-black text-white uppercase tracking-widest">Today's Goal: 80%</span>
        </div>
      </div>

      <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-8">
        <div className="space-y-5 max-w-2xl">
          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-black text-white leading-tight tracking-tight">
              Welcome back, <span className="text-[#00E5FF]">{userName}</span>.<br />
              <span className="text-indigo-100/80">Let's build a stronger workforce today.</span>
            </h2>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onToggleAttendance}
              disabled={isLoggedIn}
              className={`
                px-6 py-3 rounded-xl font-black text-[12px] flex items-center gap-2.5 transition-all active:scale-95 shadow-lg
                ${isLoggedIn ? "bg-white/10 text-white/50 cursor-not-allowed" : "bg-white text-indigo-900 hover:bg-indigo-50 shadow-white/10"}
              `}
            >
              <LogIn size={16} />
              Check In
            </button>
            <button
              onClick={onToggleAttendance}
              disabled={!isLoggedIn}
              className={`
                px-6 py-3 rounded-xl font-black text-[12px] flex items-center gap-2.5 transition-all active:scale-95 shadow-lg
                ${!isLoggedIn ? "bg-white/10 text-white/50 cursor-not-allowed" : "bg-indigo-900/40 text-white border border-white/20 hover:bg-indigo-900/60 shadow-indigo-900/20"}
              `}
            >
              <LogOut size={16} />
              Check Out
            </button>
            <button className="px-6 py-3 bg-[#00A884] text-white rounded-xl font-black text-[12px] flex items-center gap-2.5 transition-all active:scale-95 shadow-lg shadow-emerald-500/20 hover:bg-[#008F6F]">
              <Zap size={16} />
              Start Quick Tech
            </button>
          </div>
        </div>

        {/* ILLUSTRATION PLACEHOLDER (Right aligned like in design) */}
        <div className="hidden lg:block relative shrink-0">
          <div className="w-70 h-60 bg-white/5 rounded-4xl flex items-center justify-center group-hover:scale-105 transition-transform duration-700">
            <img src="https://res.cloudinary.com/dlb52kdyx/image/upload/v1774176324/fc75c643fd8826a3646c1cef0b27ccad-removebg-preview_ljhd49.png" className="w-[80%] h-[80%] object-cover drop-shadow-2xl" alt="Workforce" />
          </div>
        </div>
      </div>
    </div>
  );
}
