"use client";

import { useEffect, useState, useRef } from "react";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import socketIOClient from "socket.io-client";
import gsap from "gsap";
import {
  CheckCircle2,
  Clock,
  Layers,
  Filter,
  MoreHorizontal,
} from "lucide-react";

/* ================= TYPES ================= */

interface AssignedTask {
  id: number;
  taskId: string;
  title: string;
  description: string;
  status: "ASSIGNED" | "IN_PROGRESS" | "COMPLETED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  assignedBy: number;
}

/* ================= STAT CARD ================= */

function StatCard({ title, value, color, icon }: any) {
  return (
    <div
      className={`${color} p-6 rounded-[2rem] relative flex flex-col justify-between h-36 transition-transform hover:scale-[1.02] shadow-sm`}
    >
      <div className="p-2 bg-white/40 w-fit rounded-lg shadow-sm">{icon}</div>

      <div>
        <span className="text-xs font-semibold text-gray-700 block mb-1 uppercase tracking-wider">
          {title}
        </span>

        <span className="text-3xl font-bold text-gray-900">{value}</span>
      </div>
    </div>
  );
}

/* ================= PAGE ================= */

export default function MyTasksPage() {
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);

  const [tasks, setTasks] = useState<AssignedTask[]>([]);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH TASKS ================= */

  const fetchTasks = async () => {
    try {
      const res = await api.get("/requestassign/inbox");
      setTasks(res.data);
    } catch {
      toast.error("Failed to load tasks");
    }
  };

  /* ================= UPDATE STATUS ================= */

  const updateTaskStatus = async (
    taskId: number,
    status: "IN_PROGRESS" | "COMPLETED"
  ) => {
    try {
      await api.put(`/requestassign/${taskId}/status`, { status });

      toast.success("Status Updated");

      fetchTasks();
    } catch {
      toast.error("Only the assigned user can update this task.");
    }
  };

  /* ================= SOCKET ================= */

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

    return () => {
      socket.disconnect();
    };
  }, [user]);

  /* ================= GSAP ================= */

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

  const getProgress = (status: string) => {
    if (status === "ASSIGNED") return 15;
    if (status === "IN_PROGRESS") return 60;
    return 100;
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-[#f8f9fa] font-bold text-slate-400">
        Loading Tasks...
      </div>
    );

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#f8f9fa] p-4 md:p-8 space-y-8 max-w-[1600px] mx-auto text-slate-900"
    >
      {/* HEADER */}

      <div className="animate-section bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-gray-100">
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-[0.2em] mb-2">
          Workspace Overview
        </h2>

        <h1 className="text-4xl font-black text-gray-900 tracking-tight">
          My Tasks
        </h1>
      </div>

      {/* STATS */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-section">
        <StatCard
          title="Assigned"
          value={tasks.filter((t) => t.status === "ASSIGNED").length}
          color="bg-[#E0D7FF]"
          icon={<Clock size={18} />}
        />

        <StatCard
          title="Active"
          value={tasks.filter((t) => t.status === "IN_PROGRESS").length}
          color="bg-[#D1E9FF]"
          icon={<Layers size={18} />}
        />

        <StatCard
          title="Completed"
          value={tasks.filter((t) => t.status === "COMPLETED").length}
          color="bg-[#D1FADF]"
          icon={<CheckCircle2 size={18} />}
        />

        <StatCard
          title="Total"
          value={tasks.length}
          color="bg-[#FDE2D1]"
          icon={<Filter size={18} />}
        />
      </div>

      {/* KANBAN */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-section">
        {[
          {
            title: "New Tasks",
            filter: "ASSIGNED",
            color: "bg-[#E0D7FF]",
            dot: "bg-indigo-400",
          },

          {
            title: "In Progress",
            filter: "IN_PROGRESS",
            color: "bg-[#D1E9FF]",
            dot: "bg-blue-400",
          },

          {
            title: "Completed",
            filter: "COMPLETED",
            color: "bg-[#D1FADF]",
            dot: "bg-emerald-400",
          },
        ].map((col) => (
          <div
            key={col.title}
            className={`${col.color} rounded-[2.5rem] p-6 min-h-[600px]`}
          >
            {/* COLUMN HEADER */}

            <div className="flex items-center justify-between mb-8 px-2">
              <div className="flex items-center gap-3">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${col.dot}`}
                ></div>

                <h3 className="font-extrabold text-gray-800 text-lg uppercase tracking-wider">
                  {col.title}
                </h3>
              </div>

              <span className="text-xs font-black text-gray-400 bg-white px-3 py-1.5 rounded-xl shadow-sm">
                {tasks.filter((t) => t.status === col.filter).length}
              </span>
            </div>

            {/* TASKS */}

            <div className="space-y-6">
              {tasks
                .filter((t) => t.status === col.filter)
                .map((task) => (
                  <div
                    key={task.id}
                    className="bg-white p-7 rounded-[2.2rem] shadow-sm hover:shadow-xl transition-all duration-300 group"
                  >
                    {/* HEADER */}

                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">
                        TASK #{task.id}
                      </span>

                      <MoreHorizontal
                        size={18}
                        className="text-gray-300"
                      />
                    </div>

                    {/* TITLE */}

                    <h4 className="font-bold text-lg text-gray-900 mb-2">
                      {task.title}
                    </h4>

                    {/* DESCRIPTION */}

                    <p className="text-sm text-gray-400 mb-6 line-clamp-2">
                      {task.description}
                    </p>

                    {/* PROGRESS */}

                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase">
                        <span>Progress</span>

                        <span className="text-black">
                          {getProgress(task.status)}%
                        </span>
                      </div>

                      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full ${
                            task.status === "COMPLETED"
                              ? "bg-emerald-500"
                              : "bg-indigo-500"
                          }`}
                          style={{
                            width: `${getProgress(task.status)}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* FOOTER */}

                    <div className="flex items-center justify-between pt-5 border-t border-gray-50">
                      <span
                        className={`text-[10px] px-3 py-1 rounded-full font-bold ${
                          task.priority === "HIGH"
                            ? "bg-red-50 text-red-500"
                            : task.priority === "MEDIUM"
                            ? "bg-amber-50 text-amber-600"
                            : "bg-emerald-50 text-emerald-600"
                        }`}
                      >
                        {task.priority}
                      </span>

                      <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                        {user?.name?.charAt(0)}
                      </div>
                    </div>

                    {/* ACTION BUTTONS */}

                    <div className="mt-5 flex gap-2 overflow-hidden max-h-0 group-hover:max-h-20 transition-all duration-500">
                      {task.status === "ASSIGNED" && (
                        <button
                          onClick={() =>
                            updateTaskStatus(task.id, "IN_PROGRESS")
                          }
                          className="flex-1 py-3 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-black"
                        >
                          Start
                        </button>
                      )}

                      {task.status !== "COMPLETED" && (
                        <button
                          onClick={() =>
                            updateTaskStatus(task.id, "COMPLETED")
                          }
                          className="flex-1 py-3 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-600 hover:text-white"
                        >
                          Finish
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}