"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getHierarchyUsers } from "@/services/user.service";
import { getUserProfile } from "@/services/profile.service";
import { getMyTasks, getEmployeeDashboardStats } from "@/services/dashboard.service";
import DashboardBanner from "@/components/dashboard/DashboardBanner";
import TaskOverviewWidget from "@/components/dashboard/TaskOverviewWidget";
import RightPanel from "@/components/dashboard/RightPanel";
import { Sparkles, RefreshCw, Users, Coffee, Briefcase, TrendingUp, Clock, CheckCircle2 } from "lucide-react";
import { toast } from "react-hot-toast";

export default function ManagerDashboardPage() {
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
      console.error("❌ Failed to fetch manager dashboard data", err);
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
          <p className="text-gray-500 font-bold animate-pulse">Syncing Manager Console...</p>
        </div>
      </div>
    );
  }

  const teamLeads = users.filter((u: any) => u.role === "TEAMLEAD");
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
      label: "Team Leads",
      value: teamLeads.length,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      label: "Department Size",
      value: employees.length,
      icon: Coffee,
      color: "text-rose-600",
      bgColor: "bg-rose-50"
    },
  ];

  return (
    <div className="flex flex-col xl:flex-row min-h-screen bg-[#F9FBFB]">
      {/* MAIN CONTENT COLUMN */}
      <div className="flex-1 p-4 md:p-6 lg:p-7 space-y-7 max-w-[1400px]">

        {/* TOP SEARCH & ACTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="relative flex-1 max-w-sm">
            <input
              type="text"
              placeholder="Search department reports..."
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
              <div className="w-10 h-10 rounded-xl bg-[#E0F2F1] text-[#00A884] flex items-center justify-center font-black">
                {user?.name?.charAt(0)}
              </div>
              <div className="pr-4">
                <p className="text-xs font-black text-gray-900 leading-none">{user?.name}</p>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Dept. {user?.role}</p>
              </div>
            </div>
          </div>
        </div>

        {/* GREETING BANNER */}
        <DashboardBanner
          userName={user?.name || "Manager"}
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

        {/* TEAM LEADERS OVERVIEW */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Team Leadership Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teamLeads.map((t) => (
              <div key={t.id} className="p-5 bg-gray-50 rounded-2xl border border-transparent hover:border-indigo-100 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-indigo-600 font-bold shadow-sm">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{t.name}</p>
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{t.department || 'General'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 opacity-50">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Copyright © 2024 WinterArc Manager.</p>
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
