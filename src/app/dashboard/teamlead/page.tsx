"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getHierarchyUsers } from "@/services/user.service";
import { getUserProfile } from "@/services/profile.service";
import { getMyTasks, getEmployeeDashboardStats } from "@/services/dashboard.service";
import DashboardBanner from "@/components/dashboard/DashboardBanner";
import TaskOverviewWidget from "@/components/dashboard/TaskOverviewWidget";
import RightPanel from "@/components/dashboard/RightPanel";
import { Sparkles, RefreshCw, Users, Coffee, CheckCircle, Clock, CheckCircle2, TrendingUp } from "lucide-react";
import { toast } from "react-hot-toast";

const ChevronRight = ({ size, className }: { size: number, className: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m9 18 6-6-6-6" />
  </svg>
);

export default function TeamLeadDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [hierarchyRes, profileData, tasksData, statsData] = await Promise.all([
        getHierarchyUsers(),
        getUserProfile(Number(user?.id)),
        getMyTasks(),
        getEmployeeDashboardStats()
      ]);
      setUsers(hierarchyRes.data);
      setProfile(profileData);
      setTasks(tasksData);
      setStats(statsData);
    } catch (err) {
      console.error("❌ Failed to fetch teamlead dashboard data", err);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-10 h-10 text-[#00A884] animate-spin" />
          <p className="text-gray-500 font-bold animate-pulse">Initializing Team Console...</p>
        </div>
      </div>
    );
  }

  const employees = users.filter((u: any) => u.role === "EMPLOYEE");

  const statItems = [
    {
      label: "Attendance Hours",
      value: `${((stats?.attendance?.totalMinutesToday || 0) / 60).toFixed(2)} hrs`,
      icon: Clock,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
    },
    {
      label: "My Completed Tasks",
      value: stats?.taskCounts?.completed || 0,
      icon: CheckCircle2,
      color: "text-[#00A884]",
      bgColor: "bg-[#E0F2F1]"
    },
    {
      label: "Current Efficiency %",
      value: `${stats?.efficiency?.overall || 0}%`,
      icon: TrendingUp,
      color: "text-violet-600",
      bgColor: "bg-violet-50"
    },
    {
      label: "My Team",
      value: employees.length,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      label: "Team Attendance",
      value: "95%",
      icon: CheckCircle,
      color: "text-rose-600",
      bgColor: "bg-rose-50"
    },
  ];

  // Added missing TrendingUp import to icons if needed but it's in the statItems now
  // We already imported CheckCircle2 and Clock above.

  return (
    <div className="flex flex-col xl:flex-row min-h-screen bg-[#F9FBFB]">
      {/* MAIN CONTENT COLUMN */}
      <div className="flex-1 p-4 md:p-6 lg:p-7 space-y-7 max-w-[1400px]">

        {/* TOP SEARCH & ACTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="relative flex-1 max-w-sm">
            <input
              type="text"
              placeholder="Search team performance..."
              className="w-full pl-12 pr-6 py-4 bg-white rounded-2xl border border-gray-100 shadow-sm focus:ring-2 focus:ring-[#E0F2F1] focus:border-[#00A884] transition-all outline-none text-sm font-bold text-gray-500"
            />
            <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => { setLoading(true); fetchData(); }}
              className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all active:scale-95 group"
            >
              <RefreshCw className="w-5 h-5 text-gray-400 group-hover:text-[#00A884] group-hover:rotate-180 transition-all duration-500" />
            </button>
            <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
                {user?.name?.charAt(0)}
              </div>
              <div className="pr-4">
                <p className="text-xs font-black text-gray-900 leading-none">{user?.name}</p>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Lead {user?.role}</p>
              </div>
            </div>
          </div>
        </div>

        {/* TEAM LEAD BANNER */}
        <DashboardBanner
          userName={user?.name || "Team Lead"}
          isLoggedIn={stats?.attendance?.isLoggedIn}
          onToggleAttendance={() => { }}
          tasksCompleted={stats?.taskCounts?.completed || 0}
        />

        {/* QUICK STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {statItems.map((item, idx) => (
            <div key={idx} className="bg-white p-4 rounded-3xl border border-gray-100 shadow-xs hover:shadow-xl transition-all duration-300 group">
              <div className={`w-10 h-10 rounded-xl ${item.bgColor} ${item.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <item.icon size={18} />
              </div>
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5">{item.label}</p>
                <p className="text-xl font-black text-gray-900 tracking-tight">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* TASK OVERVIEW WIDGET */}
        <TaskOverviewWidget tasks={tasks} title="My Assignments" />

        {/* TEAM MEMBERS LIST */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Direct Reports</h3>
          <div className="space-y-4">
            {employees.map((e) => (
              <div key={e.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-blue-100 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-bold text-blue-300 shadow-sm border border-gray-100">
                    {e.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{e.name}</p>
                    <p className="text-xs text-gray-400 font-medium">{e.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest">Active</span>
                  <button className="p-2 hover:bg-white rounded-lg transition-colors">
                    <ChevronRight size={16} className="text-gray-300" />
                  </button>
                </div>
              </div>
            ))}
            {employees.length === 0 && (
              <div className="text-center py-10">
                <Coffee className="w-10 h-10 text-gray-100 mx-auto mb-3" />
                <p className="text-sm text-gray-400 font-bold">No direct reports found in your unit.</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 opacity-50">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Copyright © 2024 WinterArc TeamLead.</p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <RightPanel
        user={user}
        profile={profile}
        recentLogs={stats?.recentLogs || []}
        efficiency={stats?.efficiency}
        efficiencyLogs={stats?.efficiencyLogs || []}
      />
    </div>
  );
}
