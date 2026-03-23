"use client";

import { TrendingUp, TrendingDown, Info, AlertCircle, ExternalLink } from "lucide-react";
import Link from "next/link";

interface EfficiencyMeterProps {
  efficiency: number;
  logs?: any[];
}

export default function EfficiencyMeter({ efficiency, logs = [] }: EfficiencyMeterProps) {
  // Determine color and status based on efficiency
  const getStatus = (val: number) => {
    if (val >= 90) return { label: "Excellent", color: "text-green-600", bg: "bg-green-50", border: "border-green-200" };
    if (val >= 75) return { label: "Stable", color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-200" };
    return { label: "Needs Review", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" };
  };

  const status = getStatus(efficiency);
  const strokeDasharray = 251.2; // 2 * PI * 40
  const strokeDashoffset = strokeDasharray - (efficiency / 100) * strokeDasharray;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 flex flex-col h-full hover:shadow-2xl transition-all duration-300">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-emerald-500" />
          Efficiency Meter
        </h3>
        <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${status.bg} ${status.color} border ${status.border}`}>
          {status.label}
        </span>
      </div>

      <div className="flex flex-col items-center justify-center grow relative mb-6">
        {/* Simple SVG Gauge */}
        <svg className="w-40 h-40 md:w-48 md:h-48 transform -rotate-90">
          <circle
            cx="96"
            cy="96"
            r="80"
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            className="text-gray-100"
          />
          <circle
            cx="96"
            cy="96"
            r="80"
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            strokeDasharray="502.4"
            strokeDashoffset={502.4 - (efficiency / 100) * 502.4}
            strokeLinecap="round"
            className="text-indigo-600 transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-black text-gray-900">{efficiency}%</span>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Performance</span>
        </div>
      </div>

      {/* Point Reports (Recent Logs) */}
      <div className="mt-auto pt-6 border-t border-gray-50">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Info className="w-3 h-3" />
            Recent Point Reports
          </span>
          <Link href="/dashboard/efficiency" className="text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1 group">
            Detailed Report
            <ExternalLink className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </p>
        <div className="space-y-3">
          {logs.length > 0 ? logs.map((log: any) => (
            <div key={log.id} className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-start gap-3 group hover:bg-white transition-colors">
              <div className={`mt-0.5 p-1 rounded-md ${log.changeType === 'INCREASE' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {log.changeType === 'INCREASE' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              </div>
              <div className="grow min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <p className="text-[10.5px] font-bold text-gray-700 truncate">{log.changeType} ({log.efficiencyScore}%)</p>
                  <p className="text-[9px] font-medium text-gray-400 shrink-0">{log.logDate}</p>
                </div>
                <p className="text-[10px] text-gray-500 leading-relaxed line-clamp-2">{log.reason}</p>
              </div>
            </div>
          )) : (
            <div className="flex flex-col items-center justify-center py-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <AlertCircle className="w-5 h-5 text-gray-300 mb-2" />
              <p className="text-[10px] font-bold text-gray-400 uppercase">Initialize Activity for Reports</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
