"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getSuperAdminDashboard, getMasterAdmins } from "@/services/user.service";
import DashboardBanner from "@/components/dashboard/DashboardBanner";
import { Sparkles, RefreshCw, Users, Globe, Activity } from "lucide-react";
import { toast } from "react-hot-toast";

export default function SuperDashboardPage() {
  const { user } = useAuth();
  const [masters, setMasters] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [mastersRes, statsRes] = await Promise.all([
        getMasterAdmins(),
        getSuperAdminDashboard()
      ]);
      setMasters(mastersRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error("❌ Failed to fetch super dashboard data", err);
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
          <RefreshCw className="w-10 h-10 text-purple-600 animate-spin" />
          <p className="text-gray-500 font-bold animate-pulse">Initializing Global Console...</p>
        </div>
      </div>
    );
  }

  const statItems = [
    {
      label: "Team Admins",
      value: stats?.totalAdmins || 0,
      icon: Globe,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      label: "Global Users",
      value: stats?.totalActiveUsers || 0,
      icon: Users,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50"
    },
    {
      label: "Server Load",
      value: "12%",
      icon: Activity,
      color: "text-rose-600",
      bgColor: "bg-rose-50"
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#F9FBFB]">
      {/* MAIN CONTENT COLUMN */}
      <div className="flex-1 p-4 md:p-6 lg:p-7 space-y-7 max-w-[1400px]">

        {/* TOP SEARCH & ACTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="relative flex-1 max-w-sm">
            <input
              type="text"
              placeholder="Search global network..."
              className="w-full pl-12 pr-6 py-4 bg-white rounded-2xl border border-gray-100 shadow-sm focus:ring-2 focus:ring-purple-100 focus:border-purple-400 transition-all outline-none text-sm font-bold text-gray-500"
            />
            <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => { setLoading(true); fetchData(); }}
              className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all active:scale-95 group"
            >
              <RefreshCw className="w-5 h-5 text-gray-400 group-hover:text-purple-600 group-hover:rotate-180 transition-all duration-500" />
            </button>
            <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-black">
                {user?.name?.charAt(0)}
              </div>
              <div className="pr-4">
                <p className="text-xs font-black text-gray-900 leading-none">{user?.name}</p>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Status: {user?.role}</p>
              </div>
            </div>
          </div>
        </div>

        {/* GLOBAL BANNER */}
        <DashboardBanner
          userName={user?.name || "Super Admin"}
          isLoggedIn={true}
          onToggleAttendance={() => { }}
          tasksCompleted={masters.length}
        />

        {/* QUICK STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {statItems.map((item, idx) => (
            <div key={idx} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs hover:shadow-xl transition-all duration-300 group">
              <div className={`w-12 h-12 rounded-2xl ${item.bgColor} ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <item.icon size={22} />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-2">{item.label}</p>
                <p className="text-2xl font-black text-gray-900 tracking-tight">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* GLOBAL NETWORK OVERVIEW */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Global Network Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {masters.map((master) => (
              <div key={master.id} className="p-5 bg-gray-50 rounded-2xl border border-transparent hover:border-purple-100 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-purple-600 font-bold shadow-sm">
                    {master.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{master.name}</p>
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Master Region: {master.region || 'Global'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 opacity-50">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Copyright © 2024 WinterArc SuperAdmin.</p>
        </div>
      </div>

    </div>
  );
}
