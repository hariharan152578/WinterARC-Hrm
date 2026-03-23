"use client";

import { LucideIcon } from "lucide-react";

interface StatItem {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

interface QuickStatsProps {
  items: StatItem[];
}

export default function QuickStats({ items }: QuickStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
      {items.map((item, idx) => (
        <div 
          key={idx} 
          className="bg-white p-6 rounded-4xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-1 flex flex-col items-center text-center space-y-3"
        >
          <div className={`p-4 rounded-2xl ${item.bgColor} ${item.color} group-hover:scale-110 transition-transform`}>
            <item.icon size={24} />
          </div>
          <div className="space-y-1">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{item.label}</h4>
            <p className="text-xl font-black text-gray-900">{item.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
