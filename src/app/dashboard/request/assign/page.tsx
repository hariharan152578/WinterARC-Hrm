"use client";

import { useEffect, useState, useRef } from "react";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import { getHierarchyUsers } from "@/services/user.service";
import toast from "react-hot-toast";
import socketIOClient from "socket.io-client";
import gsap from "gsap";
import { 
  Search, Plus, MoreHorizontal, RefreshCcw, X, 
  Calendar, CheckCircle2, Clock, Layers, Filter
} from "lucide-react";

/* ================= TYPES ================= */

interface User {
  id: number;
  name: string;
  role: "ADMIN" | "MANAGER" | "TEAMLEAD" | "EMPLOYEE";
  createdBy: number;
}

interface AssignedTask {
  id: number;
  taskId: string;
  title: string;
  description: string;
  status: "ASSIGNED" | "IN_PROGRESS" | "COMPLETED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  deadline?: string;
  createdAt: string;
}

/* ================= HELPER COMPONENTS ================= */

function StatCard({ title, value, color, icon }: any) {
  return (
    <div className={`${color} p-6 rounded-[2rem] relative flex flex-col justify-between h-36 transition-transform hover:scale-[1.02] shadow-sm`}>
      <div className="p-2 bg-white/40 w-fit rounded-lg shadow-sm">
        {icon}
      </div>
      <div>
        <span className="text-xs font-semibold text-gray-700 block mb-1 uppercase tracking-wider">
          {title}
        </span>
        <span className="text-3xl font-bold text-gray-900">
          {value}
        </span>
      </div>
    </div>
  );
}

/* ================= MAIN COMPONENT ================= */

export default function CleverWorkspace() {
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [tasks, setTasks] = useState<AssignedTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignedTo: "",
    priority: "MEDIUM" as "LOW" | "MEDIUM" | "HIGH",
    deadline: ""
  });
  const [assignLoading, setAssignLoading] = useState(false);

  /* ================= FETCH DATA ================= */

  const fetchTasks = async () => {
    try {
      const res = await api.get("/reportassign/inbox");
      setTasks(res.data);
    } catch {
      toast.error("Failed to load tasks");
    }
  };

  const fetchSubordinates = async () => {
    if (!user || !["ADMIN", "MANAGER", "TEAMLEAD"].includes(user.role)) return;
    try {
      const res = await getHierarchyUsers();
      const roleHierarchy: Record<string, string> = {
        ADMIN: "MANAGER",
        MANAGER: "TEAMLEAD",
        TEAMLEAD: "EMPLOYEE",
      };
      const nextRole = roleHierarchy[user.role];
      const filtered = res.data.filter(
        (u: User) => u.role === nextRole && u.createdBy === user.id
      );
      setUsers(filtered);
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= EFFECTS ================= */

  useEffect(() => {
    if (!user) return;
    const socket = socketIOClient(`${process.env.NEXT_PUBLIC_API_URL}`, {
      auth: { token: localStorage.getItem("token") },
    });
    socket.on(`user:${user.id}`, () => fetchTasks());

    const loadInitialData = async () => {
      setLoading(true);
      await Promise.all([fetchTasks(), fetchSubordinates()]);
      setLoading(false);
    };

    loadInitialData();
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
    }
  }, [loading]);

  /* ================= HANDLERS ================= */

  const updateTaskStatus = async (taskId: number, status: "IN_PROGRESS" | "COMPLETED") => {
    try {
      await api.put(`/request-assign/${taskId}/status`, { status });
      toast.success("Status Updated");
      fetchTasks();
    } catch {
      toast.error("Update failed");
    }
  };

  const handleAssignTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.assignedTo) return toast.error("Missing fields");

    try {
      setAssignLoading(true);
      await api.post("/request-assign", {
        ...formData,
        assignedTo: Number(formData.assignedTo),
        deadline: formData.deadline || null,
      });
      toast.success("Task assigned successfully 🚀");
      setIsModalOpen(false);
      setFormData({ title: "", description: "", assignedTo: "", priority: "MEDIUM", deadline: "" });
      fetchTasks();
    } catch (err: any) {
      toast.error("Assignment failed");
    } finally {
      setAssignLoading(false);
    }
  };

  const getProgress = (status: string) => {
    if (status === "ASSIGNED") return 15;
    if (status === "IN_PROGRESS") return 60;
    return 100;
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#f8f9fa] font-bold">Initializing Workspace...</div>;

  return (
    <div ref={containerRef} className="min-h-screen bg-[#f8f9fa] p-4 md:p-8 space-y-8 max-w-[1600px] mx-auto text-slate-900">
      
      {/* HEADER SECTION - THEMED */}
      <div className="animate-section bg-white rounded-[2.5rem] p-8 md:p-10 flex flex-col md:flex-row justify-between items-center shadow-sm border border-gray-100">
        <div>
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-[0.2em] mb-2">Workspace Overview</h2>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Management Hub</h1>
        </div>
        
        <div className="flex items-center gap-4 mt-6 md:mt-0">
          {/* <div className="relative hidden lg:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Quick search tasks..." 
              className="pl-12 pr-6 py-4 bg-gray-50 rounded-2xl border-none text-sm w-72 focus:ring-2 ring-indigo-100 transition-all outline-none" 
            />
          </div> */}
          {["ADMIN", "MANAGER", "TEAMLEAD"].includes(user?.role || "") && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-8 py-4 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-xl active:scale-95"
            >
              <Plus size={20} /> New Task
            </button>
          )}
        </div>
      </div>

      {/* STATS SECTION */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-section">
        <StatCard title="Incoming" value={tasks.filter(t => t.status === "ASSIGNED").length} color="bg-[#E0D7FF]" icon={<Clock size={18} />} />
        <StatCard title="Active" value={tasks.filter(t => t.status === "IN_PROGRESS").length} color="bg-[#D1E9FF]" icon={<Layers size={18} />} />
        <StatCard title="Completed" value={tasks.filter(t => t.status === "COMPLETED").length} color="bg-[#D1FADF]" icon={<CheckCircle2 size={18} />} />
        <StatCard title="Total Assigned" value={tasks.length} color="bg-[#FDE2D1]" icon={<Filter size={18} />} />
      </div>
          
      {/* KANBAN BOARD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-section">
        {[
          { title: "New tasks", filter: "ASSIGNED", dot: "bg-indigo-400" ,color: "bg-[#E0D7FF]"},
          { title: "In progress", filter: "IN_PROGRESS", dot: "bg-blue-400" ,color: "bg-[#D1E9FF]"},
          { title: "Completed", filter: "COMPLETED", dot: "bg-emerald-400", color: "bg-[#D1FADF]" }
        ].map((col) => (
          <div key={col.title} className={`${col.color} rounded-[2.5rem] p-6 min-h-[600px]`}>
            <div className="flex items-center justify-between mb-8 px-2">
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${col.dot} shadow-[0_0_10px_rgba(0,0,0,0.1)]`}></div>
                <h3 className="font-extrabold text-gray-800 text-lg uppercase tracking-wider">{col.title}</h3>
              </div>
              <span className="text-xs font-black text-gray-400 bg-white px-3 py-1.5 rounded-xl shadow-sm">
                {tasks.filter(t => t.status === col.filter).length}
              </span>
            </div>

            <div className="space-y-6">
              {tasks.filter(t => t.status === col.filter).map((task) => (
                <div key={task.id} className="bg-white p-7 rounded-[2.2rem] shadow-sm hover:shadow-xl transition-all duration-300 group border border-transparent hover:border-indigo-100">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">#{task.id}</span>
                    <MoreHorizontal size={18} className="text-gray-300 hover:text-black cursor-pointer" />
                  </div>

                  <h4 className="font-bold text-lg text-gray-900 mb-2 leading-tight">{task.title}</h4>
                  <p className="text-sm text-gray-400 mb-6 line-clamp-2 leading-relaxed font-medium">
                    {task.description}
                  </p>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase">
                      <span>Progress</span>
                      <span className="text-black">{getProgress(task.status)}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ease-in-out ${task.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                        style={{ width: `${getProgress(task.status)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-5 border-t border-gray-50">
                    <span className={`text-[10px] px-3 py-1 rounded-full font-bold ${
                      task.priority === 'HIGH' ? 'bg-red-50 text-red-500' : 
                      task.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      {task.priority}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                      {user?.name.charAt(0)}
                    </div>
                  </div>

                  {/* HOVER ACTIONS */}
                  <div className="mt-5 flex gap-2 overflow-hidden max-h-0 group-hover:max-h-20 transition-all duration-500 ease-in-out">
                     {task.status === "ASSIGNED" && (
                       <button onClick={() => updateTaskStatus(task.id, "IN_PROGRESS")} className="flex-1 py-3 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-colors">Start</button>
                     )}
                     {task.status !== "COMPLETED" && (
                       <button onClick={() => updateTaskStatus(task.id, "COMPLETED")} className="flex-1 py-3 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-600 hover:text-white transition-colors">Finish</button>
                     )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* CREATE TASK MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden relative p-10">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-gray-400 hover:text-black"><X size={24} /></button>
            <h2 className="text-3xl font-black text-gray-900 mb-2">New Task</h2>
            <p className="text-gray-400 text-sm mb-8">Delegate responsibility to your team.</p>

            <form onSubmit={handleAssignTask} className="space-y-5">
              <input
                placeholder="Task Heading"
                className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 ring-indigo-50 outline-none"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
              <select
                className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 ring-indigo-50 outline-none"
                value={formData.assignedTo}
                onChange={(e) => setFormData({...formData, assignedTo: e.target.value})}
              >
                <option value="">Select Subordinate</option>
                {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-4">
                <select 
                  className="bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 ring-indigo-50 outline-none"
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value as any})}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
                <input
                  type="date"
                  className="bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 ring-indigo-50 outline-none"
                  value={formData.deadline}
                  onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                />
              </div>
              <textarea
                placeholder="Description..."
                className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm h-32 resize-none focus:ring-2 ring-indigo-50 outline-none"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
              <button
                type="submit"
                disabled={assignLoading}
                className="w-full bg-black text-white py-5 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-gray-800 transition-all disabled:opacity-50 shadow-lg shadow-gray-200"
              >
                {assignLoading ? "Processing..." : "Assign Task"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

