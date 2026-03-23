"use client";

import { ChevronRight, MoreHorizontal, Filter, Users } from "lucide-react";

interface Task {
  id: number;
  title: string;
  status: string;
  priority: string;
  createdAt: string;
}

interface TaskLifecycleWidgetProps {
  tasks: Task[];
}

export default function TaskLifecycleWidget({ tasks }: TaskLifecycleWidgetProps) {
  const columns = [
    { title: "Yet to Start", status: "ASSIGNED", bgColor: "bg-indigo-50", textColor: "text-indigo-600", borderColor: "border-indigo-100" },
    { title: "In Process", status: "IN_PROGRESS", bgColor: "bg-amber-50", textColor: "text-amber-600", borderColor: "border-amber-100" },
    { title: "Completed", status: "COMPLETED", bgColor: "bg-emerald-50", textColor: "text-emerald-600", borderColor: "border-emerald-100" },
  ];

  const getTasksByStatus = (status: string) => tasks.filter(t => t.status === status);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black text-gray-900 tracking-tight">Task Lifecycle Widget</h3>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-100 rounded-xl text-[10px] font-bold text-gray-500 hover:bg-gray-50 transition-all shadow-sm">
            <Users size={12} />
            Ghost Assign
          </button>
          <button className="p-1.5 bg-white border border-gray-100 rounded-xl text-gray-400 hover:bg-gray-50 transition-all shadow-sm">
            <Filter size={12} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map((col, idx) => {
          const colTasks = getTasksByStatus(col.status);
          return (
            <div key={idx} className={`${col.bgColor} rounded-4xl p-4 border ${col.borderColor} flex flex-col min-h-[400px]`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className={`text-[13px] font-black ${col.textColor}`}>{col.title}</h4>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                    {colTasks.length} Tasks
                  </p>
                </div>
                <ChevronRight size={14} className={col.textColor} />
              </div>

              <div className="space-y-3 flex-1">
                {colTasks.map((task) => (
                  <div key={task.id} className="bg-white p-3.5 rounded-2xl shadow-sm border border-gray-100/50 group hover:shadow-md hover:border-indigo-100 transition-all cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-tighter ${task.priority === 'HIGH' ? 'bg-rose-50 text-rose-500' : 'bg-blue-50 text-blue-500'}`}>
                        {task.priority || 'NORMAL'}
                      </span>
                      <button className="text-gray-300 hover:text-gray-600"><MoreHorizontal size={12} /></button>
                    </div>
                    <h5 className="text-[13px] font-bold text-gray-900 leading-snug mb-2 group-hover:text-indigo-600 transition-colors">
                      {task.title}
                    </h5>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {new Date(task.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </p>
                      <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white overflow-hidden">
                        <img src="/avatar.png" alt="Assignee" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  </div>
                ))}
                {colTasks.length === 0 && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40 py-10">
                    <div className="w-12 h-12 border-2 border-dashed border-gray-300 rounded-xl mb-3" />
                    <p className="text-[11px] font-bold text-gray-400">No {col.title} Tasks</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
