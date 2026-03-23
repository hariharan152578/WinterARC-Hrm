"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getMasterAdminDashboard, getMyAdmins } from "@/services/user.service";
import { getUserProfile } from "@/services/profile.service";
import DashboardBanner from "@/components/dashboard/DashboardBanner";
import RightPanel from "@/components/dashboard/RightPanel";
import { Sparkles, RefreshCw, Users, Shield, Layout, Zap } from "lucide-react";
import { toast } from "react-hot-toast";

export default function MasterDashboardPage() {
  const { user } = useAuth();
  const [admins, setAdmins] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [adminsRes, statsRes, profileData] = await Promise.all([
        getMyAdmins(),
        getMasterAdminDashboard(),
        getUserProfile(Number(user?.id))
      ]);
      setAdmins(adminsRes.data);
      setStats(statsRes.data);
      setProfile(profileData);
    } catch (err) {
      console.error("❌ Failed to fetch master dashboard data", err);
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
          <RefreshCw className="w-10 h-10 text-indigo-600 animate-spin" />
          <p className="text-gray-500 font-bold animate-pulse">Initializing Master Console...</p>
        </div>
      </div>
    );
  }

  const statItems = [
    {
      label: "Total Admins",
      value: stats?.totalAdmins || 0,
      icon: Shield,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
    },
    {
      label: "Total Tenants",
      value: stats?.totalTenants || 0,
      icon: Layout,
      color: "text-amber-600",
      bgColor: "bg-amber-50"
    },
    {
      label: "Active Users",
      value: stats?.totalActiveUsers || 0,
      icon: Users,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50"
    },
    {
      label: "System Efficiency",
      value: "99.8%",
      icon: Zap,
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
              placeholder="Search ecosystem..."
              className="w-full pl-12 pr-6 py-4 bg-white rounded-2xl border border-gray-100 shadow-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none text-sm font-bold text-gray-500"
            />
            <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => { setLoading(true); fetchData(); }}
              className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all active:scale-95 group"
            >
              <RefreshCw className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 group-hover:rotate-180 transition-all duration-500" />
            </button>
            <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
                {user?.name?.charAt(0)}
              </div>
              <div className="pr-4">
                <p className="text-xs font-black text-gray-900 leading-none">{user?.name}</p>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Status: {user?.role}</p>
              </div>
            </div>
          </div>
        </div>

        {/* MASTER BANNER */}
        <DashboardBanner
          userName={user?.name || "Master"}
          isLoggedIn={true}
          onToggleAttendance={() => { }}
          tasksCompleted={admins.length}
        />

        {/* QUICK STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

        {/* ECOSYSTEM OVERVIEW */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Administrative Hierarchy</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {admins.map((admin) => (
              <div key={admin.id} className="p-5 bg-gray-50 rounded-2xl border border-transparent hover:border-indigo-100 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-indigo-600 font-bold shadow-sm">
                    {admin.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{admin.name}</p>
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{admin.companyName || 'Master Associate'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 opacity-50">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Copyright © 2024 WinterArc MasterAdmin.</p>
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
