"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getHierarchyUsers } from "@/services/user.service";
import { getUserProfile } from "@/services/profile.service";
import { getMyTasks } from "@/services/dashboard.service";
import DashboardBanner from "@/components/dashboard/DashboardBanner";
import TaskOverviewWidget from "@/components/dashboard/TaskOverviewWidget";
import RightPanel from "@/components/dashboard/RightPanel";
import { Sparkles, RefreshCw, Users, ShieldAlert, Coffee, LayoutGrid, ChevronRight } from "lucide-react";
import { toast } from "react-hot-toast";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [hierarchyRes, profileData, tasksData] = await Promise.all([
        getHierarchyUsers(),
        getUserProfile(Number(user?.id)),
        getMyTasks()
      ]);
      setUsers(hierarchyRes.data);
      setProfile(profileData);
      setTasks(tasksData);
    } catch (err) {
      console.error("❌ Failed to fetch admin dashboard data", err);
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
          <p className="text-gray-500 font-bold animate-pulse">Loading Admin Console...</p>
        </div>
      </div>
    );
  }

  const managers = users.filter((u) => u.role === "MANAGER");
  const teamLeads = users.filter((u) => u.role === "TEAMLEAD");
  const employees = users.filter((u) => u.role === "EMPLOYEE");

  const statItems = [
    {
      label: "Managers",
      value: managers.length,
      icon: ShieldAlert,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      label: "Team Leads",
      value: teamLeads.length,
      icon: Users,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      label: "Employees",
      value: employees.length,
      icon: Coffee,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50"
    },
    {
      label: "Total Staff",
      value: users.length,
      icon: LayoutGrid,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
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
              placeholder="Search assets or users..."
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
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
                {user?.name?.charAt(0)}
              </div>
              <div className="pr-4">
                <p className="text-xs font-black text-gray-900 leading-none">{user?.name}</p>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">System {user?.role}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ADMIN BANNER */}
        <DashboardBanner
          userName={user?.name || "Admin"}
          isLoggedIn={true}
          onToggleAttendance={() => { }}
          tasksCompleted={users.length} // Just a placeholder stat for now
        />

        {/* QUICK STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statItems.map((item, idx) => (
            <div key={idx} className="bg-white p-6 rounded-4xl border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full -mr-12 -mt-12 group-hover:bg-indigo-50 transition-colors" />
              <div className={`relative z-10 w-14 h-14 rounded-2xl ${item.bgColor} ${item.color} flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all shadow-sm`}>
                <item.icon size={26} fill={item.bgColor.replace('bg-', 'var(--') + '-600)' /* heuristic */} />
              </div>
              <div className="relative z-10">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-3">{item.label}</p>
                <div className="flex items-end gap-2">
                  <p className="text-3xl font-black text-slate-900 tracking-tight">{item.value}</p>
                  <span className="text-[10px] font-black text-emerald-500 mb-1.5 flex items-center gap-1">+12%</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* TASK OVERVIEW WIDGET */}
        <TaskOverviewWidget tasks={tasks} title="My Assignments" />

        {/* NEXUS PULSE (HIERARCHY OVERVIEW) */}
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
            <LayoutGrid size={200} />
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 relative z-10">
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Organization Nexus</h3>
              <p className="text-sm text-slate-400 font-bold mt-1.5 flex items-center gap-2">
                <Users size={16} className="text-indigo-600" />
                Monitoring {users.length} active nodes across 4 tiers
              </p>
            </div>
            <button className="flex items-center justify-center gap-3 bg-slate-900 hover:bg-black text-white px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-slate-200">
              View Full Topology <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
            {users.slice(0, 6).map((u) => (
              <div key={u.id} className="flex items-center justify-between p-5 bg-slate-50/50 hover:bg-white rounded-3xl border border-transparent hover:border-slate-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center font-black text-slate-400 shadow-sm border border-slate-100 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      {u.name.charAt(0)}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-800 tracking-tight">{u.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">{u.email}</p>
                  </div>
                </div>
                <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border shadow-xs
                       ${u.role === 'MANAGER' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                    u.role === 'TEAMLEAD' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                      'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 opacity-50">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Copyright © 2024 WinterArc Admin.</p>
        </div>
      </div>

      {/* RIGHT PANEL (Tenant Messenger) */}
      <RightPanel
        user={user}
        profile={profile}
        recentLogs={[]}
        efficiency={100}
        efficiencyLogs={[]}
      />
    </div>
  );
}
