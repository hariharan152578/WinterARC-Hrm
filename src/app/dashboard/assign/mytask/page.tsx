"use client";

import { useEffect, useState, useRef } from "react";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import socketIOClient from "socket.io-client";
import gsap from "gsap";
import {
  MoreHorizontal,
  Search,
  ChevronDown,
  Calendar,
  Plus,
  Trash2,
  CheckCircle2,
  Eye,
  X,
  Star
} from "lucide-react";

/* ================= TYPES ================= */
interface AssignedTask {
  id: number;
  taskId: string;
  title: string;
  description: string;
  status: "ASSIGNED" | "IN_PROGRESS" | "COMPLETED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | "CRITICAL";
  assignedBy: number;
  deadline?: Date;
  files?: string[];
  messageTypes?: string[];
  statusHistory?: {
    status: string;
    comment: string;
    timestamp: string;
    updatedBy: number;
  }[];
}

/* ================= COMPONENTS ================= */

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
      <span className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${config.bg} ${config.text} min-w-[80px] text-center shadow-sm`}>
        {priority}
      </span>
      <div className="flex items-center gap-0.5 text-slate-400">
        <Star size={12} className="fill-slate-900 text-slate-900" />
        <span className="text-xs font-bold text-slate-900">{config.stars}/5</span>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const getStyles = () => {
    switch (status) {
      case "ASSIGNED": return "bg-slate-100 text-slate-500";
      case "IN_PROGRESS": return "bg-[#e2e8e0] text-[#5040a1]"; // Light purple background, dark purple text
      case "COMPLETED": return "bg-[#fefae0] text-[#dab14e]"; // Light gold, gold text
      default: return "bg-slate-100 text-slate-500";
    }
  };

  return (
    <span className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${getStyles()} min-w-[80px] text-center shadow-sm`}>
      {status.replace("_", " ")}
    </span>
  );
};

const ProgressBar = ({ progress }: { progress: number }) => (
  <div className="flex items-center gap-3 w-full max-w-[120px]">
    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
      <div 
        className="h-full bg-[#4db6ac] rounded-full transition-all duration-500 ease-out" 
        style={{ width: `${progress}%` }} 
      />
    </div>
    <span className="text-[11px] font-bold text-slate-700 min-w-[30px]">{progress}%</span>
  </div>
);

/* ================= PAGE ================= */

export default function MyTasksPage() {
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const [tasks, setTasks] = useState<AssignedTask[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  
  // Selection
  const [selectedTask, setSelectedTask] = useState<AssignedTask | null>(null);
  const [statusModal, setStatusModal] = useState<{ 
    isOpen: boolean; 
    taskId: number | null; 
    nextStatus: "IN_PROGRESS" | "COMPLETED" | null;
  }>({ isOpen: false, taskId: null, nextStatus: null });
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [statusComment, setStatusComment] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchTasks = async () => {
    try {
      const res = await api.get("/requestassign/inbox");
      setTasks(res.data);
    } catch {
      toast.error("Failed to load tasks");
    }
  };

  const updateTaskStatus = async (taskId: number, status: "IN_PROGRESS" | "COMPLETED", files?: FileList | null, comment?: string) => {
    try {
      setIsUpdating(true);
      const data = new FormData();
      data.append("status", status);
      if (comment) data.append("comment", comment);
      
      if (files) {
        for (let i = 0; i < files.length; i++) {
          data.append("files", files[i]);
        }
      }

      await api.put(`/requestassign/${taskId}/status`, data, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      toast.success("Status Updated");
      setStatusModal({ isOpen: false, taskId: null, nextStatus: null });
      setSelectedFiles(null);
      setStatusComment("");
      fetchTasks();
    } catch {
      toast.error("Permission denied");
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    const socket = socketIOClient(`${process.env.NEXT_PUBLIC_API_URL}`, {
      auth: { token: localStorage.getItem("token") },
    });
    socket.on("task_update", () => fetchTasks());
    socket.on(`user:${user.id}`, () => fetchTasks());

    const load = async () => {
      setLoading(true);
      await fetchTasks();
      setLoading(false);
    };
    load();
    return () => { socket.disconnect(); };
  }, [user]);

  useEffect(() => {
    if (!loading && containerRef.current) {
      gsap.from(".animate-section", {
        y: 20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out",
      });
      gsap.from(".task-row", {
        y: 10,
        opacity: 0,
        duration: 0.4,
        stagger: 0.05,
        ease: "power1.out",
        delay: 0.2
      });
    }
  }, [loading]);

  const getProgress = (status: string) => {
    if (status === "ASSIGNED") return 0;
    if (status === "IN_PROGRESS") return 40;
    return 100;
  };

  const getPriorityStars = (priority: string) => {
    switch (priority) {
      case "CRITICAL": return 5;
      case "URGENT": return 4;
      case "HIGH": return 3;
      case "MEDIUM": return 2;
      case "LOW": return 1;
      default: return 0;
    }
  };

  const getFormatDate = (dateString?: Date | string) => {
    if (!dateString) return "No Date";
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
      <div className="w-10 h-10 border-4 border-[#4fa394] border-t-transparent rounded-full animate-spin" />
      <p className="font-bold text-slate-400">Loading your tasks...</p>
    </div>
  );

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter ? t.priority === priorityFilter : true;
    
    let matchesDate = true;
    if (dateFilter && t.deadline) {
      const taskDate = new Date(t.deadline).toLocaleDateString('en-CA'); // strict YYYY-MM-DD local
      matchesDate = taskDate === dateFilter;
    } else if (dateFilter && !t.deadline) {
      matchesDate = false;
    }

    return matchesSearch && matchesPriority && matchesDate;
  });

  return (
    <div ref={containerRef} className="min-h-screen bg-white p-6 md:p-10 space-y-8 max-w-[1600px] mx-auto text-slate-900">

      {/* HEADER */}
      <div className="animate-section flex flex-col md:flex-row md:items-end justify-between gap-6 relative mb-8">
        <div className="relative z-10">
          <h2 className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
            Workspace Overview
          </h2>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            My Tasks
          </h1>
        </div>
        
        <div className="flex items-center gap-6 md:gap-12 relative z-10 pb-1">
          <div className="text-center">
            <span className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">Assigned</span>
            <span className="text-2xl md:text-3xl font-black text-slate-900">{tasks.filter((t) => t.status === "ASSIGNED").length}</span>
          </div>
          <div className="w-px h-12 bg-slate-200 hidden md:block"></div>
          <div className="text-center">
            <span className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">Active</span>
            <span className="text-2xl md:text-3xl font-black text-slate-900">{tasks.filter((t) => t.status === "IN_PROGRESS").length}</span>
          </div>
          <div className="w-px h-12 bg-slate-200 hidden md:block"></div>
          <div className="text-center">
            <span className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">Done</span>
            <span className="text-2xl md:text-3xl font-black text-slate-900">{tasks.filter((t) => t.status === "COMPLETED").length}</span>
          </div>
          <div className="w-px h-12 bg-slate-200 hidden md:block"></div>
          <div className="text-center">
            <span className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">Total</span>
            <span className="text-2xl md:text-3xl font-black text-slate-900">{tasks.length}</span>
          </div>
        </div>
      </div>

      {/* FILTER BAR TOP */}
      <div className="animate-section flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1 w-full bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row overflow-hidden divide-y md:divide-y-0 md:divide-x divide-slate-100">
          
          {/* Search all */}
          <div className="flex-1 flex items-center bg-white px-5 py-3.5 relative">
            <input 
              type="text" 
              placeholder="Search all" 
              className="w-full bg-transparent text-slate-600 placeholder:text-slate-400 text-[15px] focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <ChevronDown className="absolute right-5 text-slate-400 pointer-events-none" size={16} />
          </div>

          {/* Priority */}
          <div className="flex-1 flex items-center bg-white px-5 py-3.5 relative">
            <select 
              className="w-full bg-transparent text-slate-600 appearance-none text-[15px] focus:outline-none cursor-pointer"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="">Set a priority</option>
              <option value="CRITICAL">Critical</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
            <ChevronDown className="absolute right-5 text-slate-400 pointer-events-none" size={16} />
          </div>

          {/* Date */}
          <div className="flex-1 flex items-center bg-white px-5 py-3.5 relative">
            <input 
              type="date" 
              className="w-full bg-transparent text-slate-600 placeholder:text-slate-400 text-[15px] focus:outline-none cursor-pointer" 
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="animate-section mt-10 overflow-x-auto">
        <table className="w-full border-separate border-spacing-y-3">
          <thead>
            <tr className="text-left text-xs font-bold text-slate-900 uppercase tracking-wider">
              <th className="px-6 py-4 bg-slate-50/50 rounded-l-2xl w-10 text-center">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[#4db6ac] focus:ring-[#4db6ac]" />
              </th>
              <th className="px-6 py-4 bg-slate-50/50">Task Name</th>
              <th className="px-6 py-4 bg-slate-50/50">Priority</th>
              <th className="px-6 py-4 bg-slate-50/50">Status</th>
              <th className="px-6 py-4 bg-slate-50/50 flex items-center gap-2">
                Due Date 
                <div className="flex flex-col -space-y-1"><span className="text-[9px] text-slate-300">▲</span><span className="text-[9px]">▼</span></div>
              </th>
              <th className="px-6 py-4 bg-slate-50/50 w-28 text-center">Action</th>
              <th className="px-6 py-4 bg-slate-50/50 rounded-r-2xl w-20 text-center">View</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <tr key={task.id} className="animate-row group bg-white hover:bg-slate-50/50 transition-colors cursor-pointer">
                  <td className="px-6 py-4 border-y border-l border-slate-100 rounded-l-2xl text-center">
                    <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[#4db6ac] focus:ring-[#4db6ac]" />
                  </td>
                  
                  {/* Task Name Column */}
                  <td className="px-6 py-4 border-y border-slate-100">
                    <div className="flex flex-col gap-1.5 w-full min-w-[200px]">
                      <span className="font-bold text-slate-900 text-sm">{task.title}</span>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">PROGRESS</span>
                        <ProgressBar progress={getProgress(task.status)} />
                      </div>
                    </div>
                  </td>

                  {/* Priority Column */}
                  <td className="px-6 py-4 border-y border-slate-100">
                    <PriorityBadge priority={task.priority} />
                  </td>

                  {/* Status Column */}
                  <td className="px-6 py-4 border-y border-slate-100 min-w-[140px]">
                    <div className="flex flex-col gap-3 items-start">
                      <StatusBadge status={task.status} />
                    </div>
                  </td>

                  {/* Due Date Column */}
                  <td className="px-6 py-4 border-y border-slate-100">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-slate-600 whitespace-nowrap">
                        {getFormatDate(task.deadline)}
                      </span>
                    </div>
                  </td>
                                 {/* Action Update Column */}
                  <td className="px-6 py-4 border-y border-slate-100">
                    <div className="flex flex-col gap-2 relative z-20 items-center">
                      {task.status === "ASSIGNED" && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); setStatusModal({ isOpen: true, taskId: task.id, nextStatus: "IN_PROGRESS" }); }}
                          className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all min-w-[100px] text-center shadow-sm"
                        >
                           ASSIGN
                        </button>
                      )}
                      {task.status === "IN_PROGRESS" && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); setStatusModal({ isOpen: true, taskId: task.id, nextStatus: "IN_PROGRESS" }); }}
                          className="px-4 py-1.5 bg-[#e2e8e0] hover:bg-[#d8e0d6] text-[#5040a1] rounded-full text-[11px] font-bold uppercase tracking-wider transition-all min-w-[100px] text-center shadow-sm"
                        >
                           UPDATE
                        </button>
                      )}
                      {task.status === "COMPLETED" && (
                        <span className="px-4 py-1.5 bg-[#fefae0] text-[#dab14e] rounded-full text-[11px] font-bold uppercase tracking-wider min-w-[100px] text-center shadow-sm opacity-60">
                           FINISH
                        </span>
                      )}
                    </div>
                  </td>
                  
                  {/* View Action Column */}
                  <td className="px-6 py-4 border-y border-r border-slate-100 rounded-r-2xl text-center">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSelectedTask(task); }}
                      className="p-2 text-slate-400 hover:text-[#4db6ac] hover:bg-[#e8f5f4] rounded-xl transition-colors mx-auto block relative z-20"
                      title="Show More Details"
                    >
                      <Eye size={20} />
                    </button>
                  </td>
                  
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-20 text-center text-slate-400 font-medium">
                  No tasks found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* DETAILS MODAL */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-[500px] p-8 rounded-4xl shadow-2xl relative border border-slate-100">
            <button onClick={() => setSelectedTask(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors bg-slate-100 hover:bg-slate-200 p-2 rounded-full">
              <X size={18} />
            </button>
            <div className="bg-[#e8f5f4] text-[#4db6ac] text-[10px] font-bold px-3 py-1 rounded-full w-fit mb-4 uppercase tracking-wider">
              Task Details
            </div>
            <h2 className="text-2xl font-bold mb-4 text-slate-900 leading-tight pr-8">{selectedTask.title}</h2>
            
            <div className="max-h-[calc(100vh-320px)] overflow-y-auto pr-2 -mr-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
              {/* PROGRESS STAGES - TIMELINE */}
              {selectedTask.statusHistory && selectedTask.statusHistory.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 pl-1">Process Stages</h3>
                  <div className="space-y-4 flex flex-col">
                    {selectedTask.statusHistory.map((entry, idx) => (
                      <div key={idx} className="flex gap-4 group/step">
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full mt-1 ${
                            entry.status === 'COMPLETED' ? 'bg-[#dab14e]' : 
                            entry.status === 'IN_PROGRESS' ? 'bg-[#5040a1]' : 
                            'bg-slate-300'
                          } border-2 border-white ring-2 ring-slate-100 shadow-sm`} />
                          {idx !== (selectedTask.statusHistory?.length || 0) - 1 && (
                            <div className="w-0.5 flex-1 bg-slate-100 group-hover/step:bg-[#4db6ac]/30 transition-colors" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-[11px] font-black text-slate-900 uppercase tracking-wider">{entry.status.replace("_", " ")}</span>
                            <span className="text-[9px] font-bold text-slate-400">{new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(entry.timestamp).toLocaleDateString([], { day: '2-digit', month: 'short' })}</span>
                          </div>
                          <p className="text-[12px] text-slate-500 font-medium leading-relaxed italic border-l-2 border-slate-50 pl-3 py-1 bg-slate-50/50 rounded-r-lg">
                            "{entry.comment}"
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-6 text-xs font-medium text-slate-500 mb-6 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                  <Calendar size={14} className="text-[#4db6ac]" />
                  <span className="pt-0.5">{getFormatDate(selectedTask.deadline)}</span>
                </div>
                <PriorityBadge priority={selectedTask.priority} />
              </div>
              
              <div className="space-y-3 mb-8">
                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Description</h3>
                <div className="bg-slate-50 p-5 rounded-2xl text-sm text-slate-600 leading-relaxed border border-slate-100 min-h-[120px] shadow-sm shadow-slate-100/50">
                  {selectedTask.description || "No description provided for this task."}
                </div>
              </div>

              {selectedTask.files && selectedTask.files.length > 0 && (
                <div className="space-y-3 mb-8">
                  <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Attachments</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {selectedTask.files.map((file, index) => {
                      const fileName = file.split('/').pop() || `Attachment ${index + 1}`;
                      const fileUrl = file.startsWith('http') ? file : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/${file}`;
                      return (
                        <a 
                          key={index}
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl hover:bg-[#e8f5f4] hover:border-[#4db6ac]/30 transition-all group/filelink"
                        >
                          <div className="p-2 bg-white rounded-lg shadow-sm group-hover/filelink:text-[#4db6ac]">
                             <Eye size={14} />
                          </div>
                          <span className="text-xs font-bold text-slate-600 group-hover/filelink:text-slate-900 truncate flex-1">
                            {fileName}
                          </span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-50">
              <div className="flex flex-col gap-3">
                {selectedTask.status === "ASSIGNED" && (
                  <button 
                    onClick={() => setStatusModal({ isOpen: true, taskId: selectedTask.id, nextStatus: "IN_PROGRESS" })}
                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full font-bold text-sm transition-all shadow-sm border border-slate-200"
                  >
                    START WORKING
                  </button>
                )}
                {selectedTask.status === "IN_PROGRESS" && (
                  <button 
                    onClick={() => setStatusModal({ isOpen: true, taskId: selectedTask.id, nextStatus: "IN_PROGRESS" })}
                    className="w-full py-2.5 bg-[#e2e8e0] hover:bg-[#d8e0d6] text-[#5040a1] rounded-full font-bold text-sm transition-all shadow-sm border border-[#5040a1]/10"
                  >
                    UPDATE STATUS
                  </button>
                )}
                {selectedTask.status === "COMPLETED" && (
                  <div className="w-full py-2.5 bg-[#fefae0] text-[#dab14e] rounded-full font-bold text-sm text-center border border-[#dab14e]/20 shadow-sm opacity-80">
                    MISSION ACCOMPLISHED
                  </div>
                )}
                <button 
                  onClick={() => setSelectedTask(null)}
                  className="w-full py-3.5 bg-slate-50 text-slate-400 hover:bg-slate-100 rounded-full font-black text-[11px] uppercase tracking-widest transition-all mt-2"
                >
                  CLOSE DETAILS
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STATUS UPDATE MODAL */}
      {statusModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-[450px] p-8 rounded-4xl shadow-2xl relative border border-slate-100">
            <button onClick={() => setStatusModal({ ...statusModal, isOpen: false })} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors bg-slate-100 hover:bg-slate-200 p-2 rounded-full">
              <X size={18} />
            </button>
            <h2 className="text-2xl font-bold mb-2 text-slate-900">Update Task Status</h2>
            <p className="text-[10px] text-slate-400 mb-6 font-black uppercase tracking-[0.2em] pl-1">
              Select Action
            </p>

            {/* STATUS SELECTION */}
            <div className="flex flex-col gap-4 mb-8">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setStatusModal({ ...statusModal, nextStatus: "IN_PROGRESS" })}
                  className={`flex-1 py-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border-2 flex items-center justify-center gap-2 ${statusModal.nextStatus === "IN_PROGRESS" ? "bg-[#e2e8e0] text-[#5040a1] border-[#5040a1]/30 shadow-md scale-[1.02]" : "bg-white text-slate-300 border-slate-100 opacity-60 hover:opacity-100"}`}
                >
                  <div className={`w-2 h-2 rounded-full ${statusModal.nextStatus === "IN_PROGRESS" ? "bg-[#5040a1] animate-pulse" : "bg-slate-200"}`} />
                  PROGRESS
                </button>

                <button 
                  onClick={() => setStatusModal({ ...statusModal, nextStatus: "COMPLETED" })}
                  className={`flex-1 py-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border-2 flex items-center justify-center gap-2 ${statusModal.nextStatus === "COMPLETED" ? "bg-[#fefae0] text-[#dab14e] border-[#dab14e]/30 shadow-md scale-[1.02]" : "bg-white text-slate-300 border-slate-100 opacity-60 hover:opacity-100"}`}
                >
                  <CheckCircle2 size={13} className={statusModal.nextStatus === "COMPLETED" ? "text-[#dab14e]" : "text-slate-200"} />
                  COMPLETE
                </button>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Update Note (Optional)</label>
                <textarea 
                  placeholder="Add a comment about this update..." 
                  className="w-full p-4 bg-slate-50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#4db6ac]/20 text-sm h-24 resize-none"
                  value={statusComment}
                  onChange={(e) => setStatusComment(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Attach Documents (Optional)</label>
                <div className="relative">
                  <input 
                    type="file" 
                    multiple 
                    className="w-full p-4 bg-slate-50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#4db6ac]/20 text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-[#4db6ac]/10 file:text-[#4db6ac] hover:file:bg-[#4db6ac]/20 cursor-pointer" 
                    onChange={(e) => setSelectedFiles(e.target.files)} 
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setStatusModal({ ...statusModal, isOpen: false })}
                className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-colors"
                disabled={isUpdating}
              >
                Cancel
              </button>
              <button 
                onClick={() => statusModal.taskId && statusModal.nextStatus && updateTaskStatus(statusModal.taskId, statusModal.nextStatus, selectedFiles, statusComment)}
                className="flex-1 py-4 bg-[#4db6ac] text-white rounded-2xl font-bold text-sm shadow-lg shadow-[#4db6ac]/20 hover:bg-[#3d968e] transition-all active:scale-95 disabled:opacity-50"
                disabled={isUpdating}
              >
                {isUpdating ? "Updating..." : "Confirm Update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}