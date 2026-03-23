"use client";

import { CheckCircle2, CircleDashed, Layout, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

interface TaskCountWidgetProps {
  counts: {
    yetToStart: number;
    inProcess: number;
    completed: number;
  };
}

export default function TaskCountWidget({ counts }: TaskCountWidgetProps) {
  const total = counts.yetToStart + counts.inProcess + counts.completed;

  const items = [
    {
      label: "Yet to Start",
      value: counts.yetToStart,
      icon: CircleDashed,
      color: "bg-gray-100 text-gray-600 border-gray-200",
      progress: (counts.yetToStart / (total || 1)) * 100,
    },
    {
      label: "In Process",
      value: counts.inProcess,
      icon: Loader2,
      color: "bg-blue-100 text-blue-700 border-blue-200",
      progress: (counts.inProcess / (total || 1)) * 100,
      animate: "animate-spin-slow",
    },
    {
      label: "Completed",
      value: counts.completed,
      icon: CheckCircle2,
      color: "bg-emerald-100 text-emerald-700 border-emerald-200",
      progress: (counts.completed / (total || 1)) * 100,
    },
  ];

  return (
    <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 h-full flex flex-col hover:shadow-2xl transition-all duration-300 group">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Layout className="w-6 h-6 text-blue-600" />
          Task Overview
        </h3>
        <Link 
          href="/dashboard/assign"
          className="text-sm font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-1.5 group/btn"
        >
          {total} Total Tasks
          <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      <div className="space-y-6 grow">
        {items.map((item, idx) => (
          <div key={idx} className="relative">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3 text-gray-700">
                <div className={`p-2.5 rounded-xl border ${item.color}`}>
                  <item.icon className={`w-5 h-5 ${item.animate || ""}`} />
                </div>
                <span className="font-bold">{item.label}</span>
              </div>
              <span className="text-2xl font-black text-gray-900">{item.value}</span>
            </div>
            
            <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-50">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ease-out ${
                  idx === 0 ? "bg-gray-400" : idx === 1 ? "bg-blue-500" : "bg-emerald-500"
                }`}
                style={{ width: `${item.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <Link 
        href="/dashboard/assign"
        className="mt-8 pt-6 border-t border-gray-50 bg-gray-50 -mx-6 px-6 -mb-6 rounded-b-3xl flex items-center justify-between hover:bg-blue-50 transition-colors group/footer"
      >
        <div className="flex items-center gap-2">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Productivity</p>
          <p className="text-sm font-black text-emerald-600">
            {total > 0 ? Math.round((counts.completed / total) * 100) : 0}% Done
          </p>
        </div>
        <div className="text-blue-600 text-xs font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 group-hover/footer:translate-x-1 transition-all">
          Manage Tasks
          <ArrowRight className="w-3 h-3" />
        </div>
      </Link>
    </div>
  );
}
