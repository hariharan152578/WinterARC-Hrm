"use client";

import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Zap, Clock, Calendar, BarChart3, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface EfficiencyData {
  day: number;
  week: number;
  month: number;
  overall: number;
}

interface PremiumEfficiencyMeterProps {
  efficiency: EfficiencyData | number;
  logs?: any[];
}

export default function PremiumEfficiencyMeter({ efficiency, logs = [] }: PremiumEfficiencyMeterProps) {
  const [activeSegment, setActiveSegment] = useState<keyof EfficiencyData>("day");
  
  // Normalize efficiency data (in case it's still a single number from old API)
  const data: EfficiencyData = typeof efficiency === "number" 
    ? { day: efficiency, week: efficiency, month: efficiency, overall: efficiency }
    : efficiency;

  const currentValue = data[activeSegment] || 0;

  const segments = [
    { key: "day", label: "Day", icon: Clock },
    { key: "week", label: "Week", icon: Calendar },
    { key: "month", label: "Month", icon: BarChart3 },
    { key: "overall", label: "Total", icon: Zap },
  ];

  const getStatusColor = (val: number) => {
    if (val >= 90) return { stroke: "#10b981", bg: "bg-emerald-50", text: "text-emerald-600" };
    if (val >= 75) return { stroke: "#6366f1", bg: "bg-indigo-50", text: "text-indigo-600" };
    if (val >= 50) return { stroke: "#f59e0b", bg: "bg-amber-50", text: "text-amber-600" };
    return { stroke: "#ef4444", bg: "bg-rose-50", text: "text-rose-600" };
  };

  const status = getStatusColor(currentValue);
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (currentValue / 100) * circumference;

  return (
    <div className="bg-white rounded-[2.5rem] p-7 border border-slate-100 shadow-sm flex flex-col items-center w-full relative overflow-hidden group">
      {/* BACKGROUND DECOR */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 opacity-50 group-hover:bg-indigo-50 transition-colors" />
      
      <div className="flex items-center justify-between w-full mb-8 relative z-10">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-xl ${status.bg} ${status.text}`}>
            <Zap size={16} fill="currentColor" className="opacity-80" />
          </div>
          <div>
            <h4 className="text-[14px] font-black text-slate-800 tracking-tight">Efficiency Nexus</h4>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-0.5">Real-time Pulse</p>
          </div>
        </div>
      </div>

      {/* SEGMENT TABS */}
      <div className="flex items-center justify-between bg-slate-50/80 p-1.5 rounded-2xl w-full mb-8 border border-slate-100/50 relative z-10">
        {segments.map((seg) => (
          <button
            key={seg.key}
            onClick={() => setActiveSegment(seg.key as keyof EfficiencyData)}
            className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-all duration-300 relative ${
              activeSegment === seg.key 
                ? "bg-white text-slate-800 shadow-sm" 
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <seg.icon size={13} className={activeSegment === seg.key ? status.text : ""} />
            <span className="text-[9px] font-black uppercase tracking-widest">{seg.label}</span>
          </button>
        ))}
      </div>

      {/* GAUGE */}
      <div className="relative w-40 h-40 flex items-center justify-center z-10">
        <svg className="w-full h-full -rotate-90 drop-shadow-sm">
          {/* Background Path */}
          <circle 
            cx="80" 
            cy="80" 
            r={radius} 
            className="stroke-slate-100 fill-none" 
            strokeWidth="12" 
          />
          {/* Progress Path */}
          <motion.circle
            cx="80"
            cy="80"
            r={radius}
            className="fill-none transition-all duration-1000 ease-out"
            stroke={status.stroke}
            strokeWidth="12"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: strokeDashoffset }}
            strokeLinecap="round"
          />
        </svg>
        
        <div className="absolute flex flex-col items-center">
          <AnimatePresence mode="wait">
            <motion.span 
              key={activeSegment}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-4xl font-black text-slate-900 tracking-tighter"
            >
              {currentValue}%
            </motion.span>
          </AnimatePresence>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Velocity</span>
        </div>
      </div>

      {/* LOGS / INSIGHTS */}
      <div className="mt-8 w-full space-y-3 relative z-10">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Recent Adjustments</p>
        <div className="space-y-2.5">
          {logs?.slice(0, 2).map((log, i) => (
            <div key={i} className="flex items-center justify-between p-3.5 bg-slate-50/50 hover:bg-white rounded-[1.25rem] border border-transparent hover:border-slate-100 transition-all group/item">
              <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-lg ${log.changeType === 'INCREASE' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                  {log.changeType === 'INCREASE' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-700 leading-none">{log.reason.split('.')[0]}</span>
                  <span className="text-[8px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{log.logDate}</span>
                </div>
              </div>
              <ChevronRight size={14} className="text-slate-200 group-hover/item:text-slate-400 group-hover/item:translate-x-0.5 transition-all" />
            </div>
          ))}
          {(!logs || logs.length === 0) && (
             <div className="p-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-100 text-center">
                <p className="text-[10px] font-bold text-slate-400 italic">No recent pulse records.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
