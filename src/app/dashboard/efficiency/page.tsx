"use client";

import { useState, useEffect } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  ArrowLeft, 
  ShieldCheck, 
  Clock, 
  Target,
  Zap,
  BarChart3,
  Filter
} from "lucide-react";
import Link from "next/link";
import { getEfficiencyLogs, getEmployeeDashboardStats } from "@/services/dashboard.service";
import { toast } from "react-hot-toast";

export default function EfficiencyLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [efficiency, setEfficiency] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [logsData, statsData] = await Promise.all([
          getEfficiencyLogs(),
          getEmployeeDashboardStats()
        ]);
        setLogs(logsData);
        setEfficiency(statsData.efficiency);
      } catch (error) {
        toast.error("Failed to load efficiency history");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const segments = [
    { label: "Daily Snapshot", value: efficiency?.day || 0, icon: Clock, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Weekly Average", value: efficiency?.week || 0, icon: Calendar, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Monthly Pulse", value: efficiency?.month || 0, icon: BarChart3, color: "text-violet-600", bg: "bg-violet-50" },
    { label: "Overall Rating", value: efficiency?.overall || 0, icon: Zap, color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link 
            href="/dashboard/employee" 
            className="group flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-indigo-600 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            Efficiency Insight
            <ShieldCheck className="w-8 h-8 text-indigo-600" />
          </h1>
          <p className="text-gray-500 font-medium">Segmented performance breakdown and deadline accuracy</p>
        </div>
        
        <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:border-indigo-200 hover:text-indigo-600 transition-all shadow-sm">
                <Filter className="w-4 h-4" />
                Filter History
            </button>
        </div>
      </div>

      {/* SEGMENTED SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {segments.map((seg, i) => (
          <div key={i} className="bg-white p-6 rounded-4xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
            <div className={`w-12 h-12 rounded-2xl ${seg.bg} ${seg.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <seg.icon size={20} />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{seg.label}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-gray-900">{seg.value}%</span>
              <span className={`text-[10px] font-bold ${seg.value >= 75 ? 'text-emerald-500' : 'text-amber-500'}`}>
                {seg.value >= 75 ? 'Optimal' : 'Active'}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Analytics Card */}
        <div className="lg:col-span-1 bg-linear-to-br from-indigo-700 to-violet-800 rounded-[2.5rem] p-8 shadow-xl text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                <Target className="w-32 h-32" />
            </div>
            <div className="relative z-10">
                <p className="text-indigo-100 text-xs font-black uppercase tracking-[0.2em] mb-4">Core Performance</p>
                <h2 className="text-6xl font-black mb-2">{efficiency?.overall || 0}%</h2>
                <p className="text-indigo-100/80 text-sm font-medium leading-relaxed mb-8">
                    Your efficiency is calculated based on attendance (min 5.5h) and task completion timing vs deadlines.
                </p>
                <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs font-bold">
                        <span>Attendance Target</span>
                        <span>5.5 Hours</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-emerald-400 h-full w-[85%] rounded-full shadow-[0_0_10px_rgba(52,211,153,0.5)]"></div>
                    </div>
                    <div className="flex items-center justify-between text-xs font-bold">
                        <span>Deadline Accuracy</span>
                        <span>92%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-indigo-300 h-full w-[92%] rounded-full shadow-[0_0_10px_rgba(165,180,252,0.5)]"></div>
                    </div>
                </div>
            </div>
        </div>

        {/* Activity Log Table */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-indigo-500" />
                    Performance Narrative
                </h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr>
                            <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Adjustment</th>
                            <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Pulse</th>
                            <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Context</th>
                            <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Timeline</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {logs.length > 0 ? logs.map((log) => (
                            <tr key={log.id} className="group hover:bg-slate-50 transition-colors">
                                <td className="px-8 py-5">
                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                                        log.changeType === 'INCREASE' 
                                        ? 'bg-emerald-50 text-emerald-600' 
                                        : 'bg-rose-50 text-rose-600'
                                    }`}>
                                        {log.changeType === 'INCREASE' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                        {log.changeType}
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <span className="text-sm font-black text-gray-900">{log.efficiencyScore}%</span>
                                </td>
                                <td className="px-8 py-5">
                                    <p className="text-[11px] text-gray-500 font-bold leading-relaxed max-w-xs">{log.reason}</p>
                                </td>
                                <td className="px-8 py-5 text-right">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{log.logDate}</span>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={4} className="px-8 py-20 text-center">
                                    <Zap className="w-8 h-8 text-gray-100 mx-auto mb-3" />
                                    <p className="text-xs font-bold text-gray-400">Initialize activity to generate insights.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
}
