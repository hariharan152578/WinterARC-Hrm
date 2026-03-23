"use client";

import { useEffect, useState, useRef } from "react";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import { getHierarchyUsers } from "@/services/user.service";
import toast from "react-hot-toast";
import gsap from "gsap";
import { 
  Plus, 
  Search, 
  ChevronDown, 
  Calendar, 
  Filter, 
  MoreHorizontal, 
  X, 
  Star,
  ArrowUpDown,
  Wrench,
  Eye
} from "lucide-react";

/* ================= TYPES ================= */
interface User { id: number; name: string; role: string; }
interface AssignedTask {
  id: number;
  taskId: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  deadline?: string;
  progress?: number;
  assignedToUser?: { name: string; initials: string; color: string; profileImage?: string };
  files?: string[];
  statusHistory?: {
    status: string;
    comment: string;
    timestamp: string;
    updatedBy: number;
  }[];
}

/* ================= COMPONENTS ================= */

const Avatar = ({ name, initials, color, src }: { name: string, initials: string, color: string, src?: string }) => {
  const imgUrl = src ? (src.startsWith('http') ? src : `http://localhost:5000/${src}`) : null;
  
  return (
    <div className="flex items-center gap-3">
      {imgUrl ? (
        <img 
          src={imgUrl} 
          alt={name} 
          className="w-8 h-8 rounded-full object-cover shadow-sm border border-slate-100" 
        />
      ) : (
        <div className={`w-8 h-8 rounded-full ${color} flex items-center justify-center text-[10px] font-bold text-white shadow-sm`}>
          {initials}
        </div>
      )}
      <span className="text-sm font-medium text-slate-700">{name}</span>
    </div>
  );
};

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
    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
      <div 
        className="h-full bg-[#4db6ac] rounded-full transition-all duration-500 ease-out" 
        style={{ width: `${progress}%` }} 
      />
    </div>
    <span className="text-xs font-bold text-slate-700 min-w-[30px]">{progress}%</span>
  </div>
);

/* ================= PAGE ================= */
export default function AssignedTasksPage() {
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const [tasks, setTasks] = useState<AssignedTask[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: "", description: "", assignedTo: "", priority: "MEDIUM", deadline: "" });
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [selectedTask, setSelectedTask] = useState<AssignedTask | null>(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [memberFilter, setMemberFilter] = useState("");

  const fetchTasks = async (allUsers: User[] = users) => { 
    try { 
      const res = await api.get("/requestassign/sent"); 
      const enrichedTasks = res.data.map((t: any) => {
        // Find assigned user details from the users list
        let primaryUser = null;
        if (typeof t.assignedTo === 'number') {
          primaryUser = allUsers.find(u => u.id === t.assignedTo);
        } else if (Array.isArray(t.assignedTo) && t.assignedTo.length > 0) {
          primaryUser = typeof t.assignedTo[0] === 'object' ? t.assignedTo[0] : allUsers.find(u => u.id === t.assignedTo[0]);
        }
        
        if (!primaryUser && t.user) primaryUser = t.user;

        let derivedProgress = 0;
        if (t.status === 'COMPLETED') derivedProgress = 100;
        else if (t.status === 'IN_PROGRESS') derivedProgress = 50;

        return {
          ...t,
          progress: typeof t.progress === 'number' ? t.progress : derivedProgress,
          assignedToUser: {
            name: primaryUser?.name || "Unassigned",
            initials: (primaryUser?.name || "U").split(" ").map((n: string) => n[0]).join("."),
            color: ["bg-[#4db6ac]", "bg-[#2d6ab1]", "bg-[#e57373]", "bg-[#81c784]"][Math.floor(Math.random() * 4)],
            profileImage: primaryUser?.profileImage
          }
        };
      });
      setTasks(enrichedTasks); 
    } catch { 
      toast.error("Failed loading tasks"); 
    } 
  };
  
  const fetchSubordinates = async () => { 
    try { 
      const res = await getHierarchyUsers(); 
      setUsers(res.data); 
      return res.data;
    } catch { 
      toast.error("Failed loading users"); 
      return [];
    } 
  };

  useEffect(() => {
    const load = async () => { 
      setLoading(true); 
      const allUsers = await fetchSubordinates();
      await fetchTasks(allUsers); 
      setLoading(false); 
    };
    load();
  }, []);

  useEffect(() => {
    if (!loading && containerRef.current) {
      gsap.from(".animate-row", { 
        x: -20, 
        opacity: 0, 
        stagger: 0.05, 
        duration: 0.5, 
        ease: "power2.out" 
      });
    }
  }, [loading]);

  const handleAssignTask = async (e: any) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.assignedTo) { 
      toast.error("Fill required fields"); 
      return; 
    }
    
    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("assignedTo", JSON.stringify([Number(formData.assignedTo)]));
      data.append("priority", formData.priority);
      if (formData.deadline) data.append("deadline", formData.deadline);
      
      if (selectedFiles) {
        for (let i = 0; i < selectedFiles.length; i++) {
          data.append("files", selectedFiles[i]);
        }
      }

      await api.post("/requestassign", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      toast.success("Task Assigned 🚀");
      setIsModalOpen(false);
      setFormData({ title: "", description: "", assignedTo: "", priority: "MEDIUM", deadline: "" });
      setSelectedFiles(null);
      fetchTasks();
    } catch (err: any) { 
      toast.error(err?.response?.data?.message || "Assignment failed"); 
    }
  };

  const getAssignableUsers = () => {
    if (!user) return [];
    const roleHierarchy: Record<string, string> = { ADMIN: "MANAGER", MANAGER: "TEAMLEAD", TEAMLEAD: "EMPLOYEE" };
    return users.filter(u => u.role === roleHierarchy[user.role]);
  };

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter ? t.priority.toUpperCase() === priorityFilter.toUpperCase() : true;
    const matchesMember = memberFilter ? t.assignedToUser?.name === memberFilter : true;
    return matchesSearch && matchesPriority && matchesMember;
  });

  if (loading) return <div className="h-screen flex items-center justify-center font-bold text-slate-400">Loading...</div>;

  return (
    <div ref={containerRef} className="min-h-screen bg-white p-6 md:p-10 max-w-[1600px] mx-auto text-slate-900">
      
      {/* HEADER SECTION */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-8">Teck Management</h1>
        
        {/* FILTERS BAR */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">Task Name</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search all" 
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4db6ac]/20 placeholder:text-slate-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">Assigned To</label>
            <div className="relative">
              <select 
                className="w-full appearance-none px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4db6ac]/20 text-slate-600 cursor-pointer"
                value={memberFilter}
                onChange={(e) => setMemberFilter(e.target.value)}
              >
                <option value="">Member</option>
                {Array.from(new Set(tasks.map(t => t.assignedToUser?.name))).map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">Priority</label>
            <div className="relative">
              <select 
                className="w-full appearance-none px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4db6ac]/20 text-slate-600 cursor-pointer"
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
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">Date</label>
            <div className="relative group/date">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/date:text-[#4db6ac]" size={16} />
              <input 
                type="date" 
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4db6ac]/20 placeholder:text-slate-400 cursor-pointer"
              />
            </div>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full py-3.5 bg-[#4db6ac] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#4db6ac]/20 hover:bg-[#3d968e] transition-colors active:scale-[0.98]"
          >
            Create New Project
          </button>
        </div>
      </div>

      {/* SECONDARY ACTION BAR */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-900">Tasks</h2>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors">
            <Wrench size={14} />
            Claimed New Tools
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#e8f5f4] rounded-lg text-xs font-bold text-[#2d6a4f] hover:bg-[#d1eae8] transition-colors">
            <ArrowUpDown size={14} />
            Tasks
          </button>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-y-3">
          <thead>
            <tr className="text-left text-xs font-bold text-slate-900 uppercase tracking-wider">
              <th className="px-6 py-4 bg-slate-50/50 rounded-l-2xl w-10 text-center">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[#4db6ac] focus:ring-[#4db6ac]" />
              </th>
              <th className="px-6 py-4 bg-slate-50/50">Task Name</th>
              <th className="px-6 py-4 bg-slate-50/50">Assigned To</th>
              <th className="px-6 py-4 bg-slate-50/50">Priority</th>
              <th className="px-6 py-4 bg-slate-50/50">Due Date</th>
              <th className="px-6 py-4 bg-slate-50/50 text-center">Status</th>
              <th className="px-6 py-4 bg-slate-50/50">Progress</th>
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
                  <td className="px-6 py-4 border-y border-slate-100">
                    <span className="text-sm font-bold text-slate-900">{task.title}</span>
                  </td>
                  <td className="px-6 py-4 border-y border-slate-100">
                    {task.assignedToUser && (
                      <Avatar 
                        name={task.assignedToUser.name} 
                        initials={task.assignedToUser.initials} 
                        color={task.assignedToUser.color} 
                        src={task.assignedToUser.profileImage}
                      />
                    )}
                  </td>
                  <td className="px-6 py-4 border-y border-slate-100">
                    <PriorityBadge priority={task.priority} />
                  </td>
                  <td className="px-6 py-4 border-y border-slate-100 text-sm font-medium text-slate-600">
                    {task.deadline ? new Date(task.deadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "No date"}
                  </td>
                  <td className="px-6 py-4 border-y border-slate-100 min-w-[120px]">
                    <StatusBadge status={task.status} />
                  </td>
                  <td className="px-6 py-4 border-y border-slate-100">
                    <ProgressBar progress={task.progress || 0} />
                  </td>
                  <td className="px-6 py-4 border-y border-r border-slate-100 rounded-r-2xl text-center">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSelectedTask(task); }}
                      className="p-2 text-slate-400 hover:text-[#4db6ac] hover:bg-[#e8f5f4] rounded-xl transition-colors mx-auto block relative z-20"
                      title="Show Progress History"
                    >
                      <Eye size={18} />
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

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-[500px] p-8 rounded-[2rem] shadow-2xl relative border border-slate-100">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors">
              <X size={20} />
            </button>
            <h2 className="text-2xl font-bold mb-6 text-slate-900">Assign New Task</h2>
            <form onSubmit={handleAssignTask} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Task Title</label>
                <input 
                  placeholder="Enter task title" 
                  className="w-full p-4 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4db6ac]/20" 
                  value={formData.title} 
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Description</label>
                <textarea 
                  placeholder="Explain what needs to be done" 
                  rows={3} 
                  className="w-full p-4 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4db6ac]/20" 
                  value={formData.description} 
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Assign Member</label>
                  <select className="w-full p-4 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4db6ac]/20" value={formData.assignedTo} onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}>
                    <option value="">Select Member</option>
                    {getAssignableUsers().map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Task Priority</label>
                  <select className="w-full p-4 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4db6ac]/20" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Deadline Date</label>
                <input 
                  type="date" 
                  className="w-full p-4 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4db6ac]/20" 
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })} 
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Attachments (Optional)</label>
                <div className="relative group/file">
                  <input 
                    type="file" 
                    multiple 
                    className="w-full p-4 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4db6ac]/20 text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#4db6ac]/10 file:text-[#4db6ac] hover:file:bg-[#4db6ac]/20 file:cursor-pointer cursor-pointer" 
                    onChange={(e) => setSelectedFiles(e.target.files)} 
                  />
                </div>
              </div>

              <button className="w-full bg-[#4db6ac] text-white p-4 rounded-xl font-bold hover:bg-[#3d968e] transition shadow-lg shadow-[#4db6ac]/20 active:scale-95 mt-4">
                Assign Task
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DETAILS MODAL */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-[550px] p-8 rounded-[2.5rem] shadow-2xl relative border border-slate-100 flex flex-col max-h-[90vh]">
            <button onClick={() => setSelectedTask(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors bg-slate-100 hover:bg-slate-200 p-2 rounded-full">
              <X size={18} />
            </button>
            
            <div className="bg-[#e8f5f4] text-[#4db6ac] text-[10px] font-bold px-3 py-1 rounded-full w-fit mb-4 uppercase tracking-wider">
              Task Workspace
            </div>
            
            <h2 className="text-2xl font-bold mb-2 text-slate-900 leading-tight pr-10">{selectedTask.title}</h2>
            
            <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400 mb-6 pb-6 border-b border-slate-50 uppercase tracking-widest">
               <span>Assigned to <span className="text-slate-900">{selectedTask.assignedToUser?.name}</span></span>
               <span className="text-slate-200 md:block hidden">|</span>
               <span className={`${selectedTask.status === 'COMPLETED' ? 'text-[#dab14e]' : 'text-[#5040a1]'}`}>{selectedTask.status.replace("_", " ")}</span>
            </div>

            <div className="overflow-y-auto scrollbar-hide space-y-8 pr-2">
              
              {/* DESCRIPTION */}
              <div className="space-y-3">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Objective</h3>
                <div className="bg-slate-50 p-5 rounded-2xl text-sm text-slate-600 leading-relaxed border border-slate-100 italic shadow-sm shadow-slate-100/30">
                  {selectedTask.description}
                </div>
              </div>

              {/* TIMELINE */}
              {selectedTask.statusHistory && selectedTask.statusHistory.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Process Stages</h3>
                  <div className="space-y-0 flex flex-col">
                    {selectedTask.statusHistory.map((entry, idx) => (
                      <div key={idx} className="flex gap-4 group/step">
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full mt-1.5 ${
                            entry.status === 'COMPLETED' ? 'bg-[#dab14e]' : 
                            entry.status === 'IN_PROGRESS' ? 'bg-[#5040a1]' : 
                            'bg-slate-300'
                          } border-2 border-white ring-2 ring-slate-100 shadow-sm`} />
                          {idx !== (selectedTask.statusHistory?.length || 0) - 1 && (
                            <div className="w-0.5 min-h-[40px] flex-1 bg-slate-100" />
                          )}
                        </div>
                        <div className="flex-1 pb-6">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] font-black text-slate-900 uppercase tracking-wider">{entry.status.replace("_", " ")}</span>
                            <span className="text-[9px] font-bold text-slate-400">{new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(entry.timestamp).toLocaleDateString([], { day: '2-digit', month: 'short' })}</span>
                          </div>
                          <p className="text-[12px] text-slate-500 font-medium leading-relaxed italic border-l-2 border-slate-100 pl-3 py-1.5 bg-slate-50/50 rounded-r-xl">
                            "{entry.comment}"
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ATTACHMENTS */}
              {selectedTask.files && selectedTask.files.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Shared Documents</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {selectedTask.files.map((file, index) => {
                      const fileName = file.split('/').pop() || `Document ${index + 1}`;
                      const fileUrl = file.startsWith('http') ? file : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/${file}`;
                      return (
                        <a 
                          key={index}
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3.5 bg-white border border-slate-100 rounded-2xl hover:bg-[#e8f5f4] hover:border-[#4db6ac]/30 transition-all group/filelink shadow-sm"
                        >
                          <div className="p-2 bg-[#f8fcfb] rounded-xl text-slate-400 group-hover/filelink:text-[#4db6ac] transition-colors">
                             <Search size={14} />
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

            <button 
              onClick={() => setSelectedTask(null)}
              className="mt-8 bg-black text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-gray-800 transition shadow-xl active:scale-95"
            >
              Close Workspace
            </button>
          </div>
        </div>
      )}

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; } 
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        
        /* Custom checkbox style if needed */
        input[type="checkbox"] {
          accent-color: #4db6ac;
        }

        table {
          border-collapse: separate;
          border-spacing: 0 12px;
        }

        tr.group {
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05);
        }
      `}</style>
    </div>
  );
}