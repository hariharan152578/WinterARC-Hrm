"use client";

import { Eye, Clock, Star, ChevronRight } from "lucide-react";
import Link from "next/link";

/* ================= TYPES ================= */
interface Task {
  id: number;
  taskId: string;
  title: string;
  description: string;
  status: "ASSIGNED" | "IN_PROGRESS" | "COMPLETED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | "CRITICAL";
  deadline?: string | Date;
}

interface TaskOverviewWidgetProps {
  tasks: Task[];
  title?: string;
}

/* ================= HELPER COMPONENTS ================= */

const PriorityBadge = ({ priority }: { priority: string }) => {
  const configs: Record<string, { bg: string, text: string, stars: number }> = {
    CRITICAL: { bg: "bg-[#1b3a34]", text: "text-white", stars: 5 },
    URGENT: { bg: "bg-[#1b3a34]", text: "text-white", stars: 4 },
    HIGH: { bg: "bg-[#2d6a4f]", text: "text-white", stars: 3 },
    MEDIUM: { bg: "bg-[#d8f3dc]", text: "text-[#1b3a34]", stars: 2 },
    LOW: { bg: "bg-[#fefae0]", text: "text-[#bc6c25]", stars: 1 },
  };

  const config = configs[priority.toUpperCase()] || configs.MEDIUM;

  return (
    <div className="flex items-center gap-2">
      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${config.bg} ${config.text} min-w-[70px] text-center shadow-sm`}>
        {priority}
      </span>
      <div className="flex items-center gap-0.5 text-slate-400">
        <Star size={10} className="fill-slate-900 text-slate-900" />
        <span className="text-[10px] font-bold text-slate-900">{config.stars}/5</span>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const getStyles = () => {
    switch (status) {
      case "ASSIGNED": return "bg-slate-100 text-slate-500";
      case "IN_PROGRESS": return "bg-[#e2e8e0] text-[#5040a1]";
      case "COMPLETED": return "bg-[#fefae0] text-[#dab14e]";
      default: return "bg-slate-100 text-slate-500";
    }
  };

  return (
    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${getStyles()} min-w-[75px] text-center shadow-sm`}>
      {status.replace("_", " ")}
    </span>
  );
};

const ProgressBar = ({ progress }: { progress: number }) => (
  <div className="flex items-center gap-2 w-full max-w-[80px]">
    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
      <div 
        className="h-full bg-[#4db6ac] rounded-full transition-all duration-500 ease-out" 
        style={{ width: `${progress}%` }} 
      />
    </div>
    <span className="text-[10px] font-bold text-slate-700 min-w-[25px]">{progress}%</span>
  </div>
);

/* ================= MAIN COMPONENT ================= */

export default function TaskOverviewWidget({ tasks, title = "Task Overview" }: TaskOverviewWidgetProps) {
  
  const getProgress = (status: string) => {
    if (status === "ASSIGNED") return 0;
    if (status === "IN_PROGRESS") return 40;
    return 100;
  };

  const getFormatDate = (dateString?: Date | string) => {
    if (!dateString) return "No Date";
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    return `${day} ${month}`;
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">{title}</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            Real-time activity nexus
          </p>
        </div>
        <Link 
          href="/dashboard/assign/mytask" 
          className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-600 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border border-slate-100"
        >
          View Full Board <ChevronRight size={14} />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-y-2.5">
          <thead>
            <tr className="text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              <th className="px-5 py-3">Task Brief</th>
              <th className="px-5 py-3">Priority</th>
              <th className="px-5 py-3">Phase</th>
              <th className="px-5 py-3 text-center">Timeline</th>
              <th className="px-5 py-3 text-right">Details</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length > 0 ? (
              tasks.slice(0, 5).map((task) => (
                <tr key={task.id} className="group bg-slate-50/50 hover:bg-white transition-all cursor-pointer">
                  <td className="px-5 py-4 rounded-l-2xl border-y border-l border-transparent group-hover:border-slate-100">
                    <div className="flex flex-col gap-1">
                      <span className="font-black text-slate-800 text-sm tracking-tight">{task.title}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">PULSE</span>
                        <ProgressBar progress={getProgress(task.status)} />
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 border-y border-transparent group-hover:border-slate-100">
                    <PriorityBadge priority={task.priority} />
                  </td>
                  <td className="px-5 py-4 border-y border-transparent group-hover:border-slate-100">
                    <StatusBadge status={task.status} />
                  </td>
                  <td className="px-5 py-4 border-y border-transparent group-hover:border-slate-100 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-slate-500 font-bold text-[11px]">
                      <Clock size={12} className="text-[#4db6ac]" />
                      {getFormatDate(task.deadline)}
                    </div>
                  </td>
                  <td className="px-5 py-4 rounded-r-2xl border-y border-r border-transparent group-hover:border-slate-100 text-right">
                    <Link 
                      href={`/dashboard/assign/mytask`}
                      className="inline-flex p-2 text-slate-300 hover:text-[#4db6ac] hover:bg-[#e8f5f4] rounded-xl transition-all"
                    >
                      <Eye size={18} />
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-5 py-16 text-center text-slate-400 font-bold text-xs italic bg-slate-50/30 rounded-3xl border border-dashed border-slate-100">
                  No active tasks found in the nexus.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
