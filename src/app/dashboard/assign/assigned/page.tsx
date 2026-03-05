"use client";

import { useEffect, useState, useRef } from "react";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import { getHierarchyUsers } from "@/services/user.service";
import toast from "react-hot-toast";
import gsap from "gsap";
import {
  Plus,
  Clock,
  Layers,
  CheckCircle2,
  Filter,
  MoreHorizontal,
  X
} from "lucide-react";

/* ================= TYPES ================= */

interface User {
  id: number;
  name: string;
  role: string;
}

interface AssignedTask {
  id: number;
  taskId: string;
  title: string;
  description: string;
  status: "ASSIGNED" | "IN_PROGRESS" | "COMPLETED";
  priority: "LOW" | "MEDIUM" | "HIGH";
}

/* ================= STAT CARD ================= */

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

/* ================= PAGE ================= */

export default function AssignedTasksPage() {

  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);

  const [tasks, setTasks] = useState<AssignedTask[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignedTo: "",
    priority: "MEDIUM",
    deadline: ""
  });

  /* ================= FETCH TASKS ================= */

  const fetchTasks = async () => {
    try {
      const res = await api.get("/requestassign/sent");
      setTasks(res.data);
    } catch {
      toast.error("Failed loading tasks");
    }
  };

  /* ================= FETCH USERS ================= */

  const fetchSubordinates = async () => {
    try {
      const res = await getHierarchyUsers();
      setUsers(res.data);
    } catch {
      toast.error("Failed loading users");
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchTasks(), fetchSubordinates()]);
      setLoading(false);
    };

    load();
  }, []);

  /* ================= GSAP ================= */

  useEffect(() => {
    if (!loading && containerRef.current) {
      gsap.from(".animate-section", {
        y: 20,
        opacity: 0,
        stagger: 0.1,
        duration: 0.6,
        ease: "power2.out"
      });
    }
  }, [loading]);

  /* ================= ROLE FILTER ================= */

  const getAssignableUsers = () => {

    if (!user) return [];

    const roleHierarchy: Record<string, string> = {
      ADMIN: "MANAGER",
      MANAGER: "TEAMLEAD",
      TEAMLEAD: "EMPLOYEE"
    };

    const allowedRole = roleHierarchy[user.role];

    return users.filter(u => u.role === allowedRole);
  };

  /* ================= ASSIGN TASK ================= */

  const handleAssignTask = async (e: any) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.assignedTo) {
      toast.error("Please fill all required fields");
      return;
    }

    try {

      await api.post("/requestassign", {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        deadline: formData.deadline || null,

        // Backend requires array
        assignedTo: [Number(formData.assignedTo)]
      });

      toast.success("Task Assigned 🚀");

      setIsModalOpen(false);

      setFormData({
        title: "",
        description: "",
        assignedTo: "",
        priority: "MEDIUM",
        deadline: ""
      });

      fetchTasks();

    } catch (err: any) {

      toast.error(err?.response?.data?.message || "Assignment failed");

    }
  };

  const getProgress = (status: string) => {
    if (status === "ASSIGNED") return 15;
    if (status === "IN_PROGRESS") return 60;
    return 100;
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-[#f8f9fa] font-bold text-slate-400">
        Loading tasks...
      </div>
    );

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#f8f9fa] p-4 md:p-8 space-y-8 max-w-[1600px] mx-auto text-slate-900"
    >

      {/* HEADER */}

      <div className="animate-section bg-white rounded-[2.5rem] p-8 md:p-10 flex flex-col md:flex-row justify-between items-center shadow-sm border border-gray-100">

        <div>
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-[0.2em] mb-2">
            Workspace Overview
          </h2>

          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            Assigned Tasks
          </h1>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-8 py-4 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-xl active:scale-95"
        >
          <Plus size={20} /> New Task
        </button>

      </div>

      {/* STATS */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-section">

        <StatCard title="Assigned" value={tasks.filter(t => t.status === "ASSIGNED").length} color="bg-[#E0D7FF]" icon={<Clock size={18} />} />

        <StatCard title="Active" value={tasks.filter(t => t.status === "IN_PROGRESS").length} color="bg-[#D1E9FF]" icon={<Layers size={18} />} />

        <StatCard title="Completed" value={tasks.filter(t => t.status === "COMPLETED").length} color="bg-[#D1FADF]" icon={<CheckCircle2 size={18} />} />

        <StatCard title="Total" value={tasks.length} color="bg-[#FDE2D1]" icon={<Filter size={18} />} />

      </div>

      {/* KANBAN */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-section">

        {[
          { title: "Assigned", filter: "ASSIGNED", color: "bg-[#E0D7FF]", dot: "bg-indigo-400" },
          { title: "In Progress", filter: "IN_PROGRESS", color: "bg-[#D1E9FF]", dot: "bg-blue-400" },
          { title: "Completed", filter: "COMPLETED", color: "bg-[#D1FADF]", dot: "bg-emerald-400" }
        ].map(col => (

          <div key={col.title} className={`${col.color} rounded-[2.5rem] p-6 min-h-[600px]`}>

            <div className="flex items-center justify-between mb-8 px-2">

              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${col.dot}`}></div>
                <h3 className="font-extrabold text-gray-800 text-lg uppercase tracking-wider">
                  {col.title}
                </h3>
              </div>

              <span className="text-xs font-black text-gray-400 bg-white px-3 py-1.5 rounded-xl shadow-sm">
                {tasks.filter(t => t.status === col.filter).length}
              </span>

            </div>

            <div className="space-y-6">

              {tasks
                .filter(t => t.status === col.filter)
                .map(task => (

                  <div key={task.id} className="bg-white p-7 rounded-[2.2rem] shadow-sm hover:shadow-xl transition-all duration-300">

                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">
                        TASK #{task.id}
                      </span>
                      <MoreHorizontal size={18} className="text-gray-300" />
                    </div>

                    <h4 className="font-bold text-lg text-gray-900 mb-2">
                      {task.title}
                    </h4>

                    <p className="text-sm text-gray-400 mb-6 line-clamp-2">
                      {task.description}
                    </p>

                    <div className="space-y-3 mb-6">

                      <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase">
                        <span>Progress</span>
                        <span className="text-black">
                          {getProgress(task.status)}%
                        </span>
                      </div>

                      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">

                        <div
                          className={`${task.status === "COMPLETED" ? "bg-emerald-500" : "bg-indigo-500"} h-full`}
                          style={{ width: `${getProgress(task.status)}%` }}
                        />

                      </div>

                    </div>

                    <span className={`text-[10px] px-3 py-1 rounded-full font-bold ${
                      task.priority === "HIGH"
                        ? "bg-red-50 text-red-500"
                        : task.priority === "MEDIUM"
                        ? "bg-amber-50 text-amber-600"
                        : "bg-emerald-50 text-emerald-600"
                    }`}>
                      {task.priority}
                    </span>

                  </div>

                ))}

            </div>

          </div>

        ))}

      </div>

      {/* CREATE TASK MODAL */}

    {isModalOpen && (

  <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">

    <div className="bg-white w-[500px] max-w-[90%] p-8 rounded-[2rem] shadow-2xl relative animate-section">

      <button
        onClick={() => setIsModalOpen(false)}
        className="absolute top-5 right-5 text-gray-400 hover:text-gray-900 transition"
      >
        <X size={20}/>
      </button>

      <h2 className="text-2xl font-bold mb-6 text-gray-900">
        Assign New Task
      </h2>

      <form onSubmit={handleAssignTask} className="space-y-5">

        {/* TITLE */}

        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-600">
            Task Title
          </label>

          <input
            placeholder="Enter task title"
            className="w-full p-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition"
            value={formData.title}
            onChange={(e)=>setFormData({...formData,title:e.target.value})}
          />
        </div>

        {/* DESCRIPTION */}

        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-600">
            Description
          </label>

          <textarea
            placeholder="Enter task description"
            rows={3}
            className="w-full p-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition resize-none"
            value={formData.description}
            onChange={(e)=>setFormData({...formData,description:e.target.value})}
          />
        </div>

        {/* ASSIGN USER */}

        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-600">
            Assign To
          </label>

          <select
            className="w-full p-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition"
            value={formData.assignedTo}
            onChange={(e)=>setFormData({...formData,assignedTo:e.target.value})}
          >
            <option value="">Select team member</option>

            {getAssignableUsers().map(u=>(
              <option key={u.id} value={u.id}>
                {u.name} ({u.role})
              </option>
            ))}
          </select>
        </div>

        {/* PRIORITY */}

        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-600">
            Priority
          </label>

          <select
            className="w-full p-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition"
            value={formData.priority}
            onChange={(e)=>setFormData({...formData,priority:e.target.value})}
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>

        {/* DEADLINE */}

        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-600">
            Deadline
          </label>

          <input
            type="date"
            className="w-full p-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition"
            value={formData.deadline}
            onChange={(e)=>setFormData({...formData,deadline:e.target.value})}
          />
        </div>

        {/* BUTTON */}

        <button
          className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition active:scale-95"
        >
          Assign Task
        </button>

      </form>

    </div>

  </div>

)}

    </div>
  );
}