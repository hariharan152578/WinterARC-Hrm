"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { getUserProfile } from "@/services/profile.service";
import { ReportService } from "@/services/report.service";
import DailyReportModal from "@/components/dashboard/DailyReportModal";

import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Mail,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  ClipboardList,
  Gift,
  Briefcase,
  Calendar,
  ChevronRight,
  Clock,
} from "lucide-react";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    const fetchProfile = async () => {
      try {
        const data = await getUserProfile(user.id);
        setProfile(data);
      } catch (err) { console.error("Profile fetch failed"); }
    };
    fetchProfile();
  }, [user]);

  const profileImage = profile?.profileImage
    ? `http://localhost:5000/${profile.profileImage}`
    : "https://res.cloudinary.com/dlb52kdyx/image/upload/v1774179997/0185e4c0175af1347a02a9a814ede0e2-removebg-preview_b2rhgy.png";

  const allMenu = [
    // --- MAIN ---
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard, roles: ["SUPER_ADMIN", "MASTER_ADMIN", "ADMIN", "MANAGER", "TEAMLEAD", "EMPLOYEE"] },
    { name: "Chat", path: "/dashboard/chat", icon: MessageSquare, roles: ["SUPER_ADMIN", "MASTER_ADMIN", "ADMIN", "MANAGER", "TEAMLEAD", "EMPLOYEE"] },
    { name: "Inbox", path: "/dashboard/request", icon: Mail, roles: ["ADMIN", "MANAGER", "TEAMLEAD", "EMPLOYEE"] },

    // --- MANAGEMENT ---
    { name: "Masters", path: "/dashboard/super/masters", icon: Users, roles: ["SUPER_ADMIN"] },
    { name: "Admins", path: "/dashboard/masters/admins", icon: Users, roles: ["MASTER_ADMIN"] },
    { name: "Managers", path: "/dashboard/admin/managers", icon: Users, roles: ["ADMIN"] },
    { name: "TeamLeads", path: "/dashboard/manager/teamleads", icon: Users, roles: ["MANAGER"] },
    { name: "My Team", path: "/dashboard/teamlead/employees", icon: Users, roles: ["TEAMLEAD"] },
    { name: "Organization", path: "/dashboard/organization", icon: Briefcase, roles: ["ADMIN", "MANAGER", "TEAMLEAD"] },

    // --- WORKFLOW ---
    { name: "Tasks", path: "/dashboard/assign", icon: ClipboardList, roles: ["ADMIN", "MANAGER", "TEAMLEAD", "EMPLOYEE"] },
    { name: "Daily Reports", path: "/dashboard/daily-work", icon: ClipboardList, roles: ["ADMIN", "MANAGER", "TEAMLEAD", "EMPLOYEE"] },
    { name: "Leave Management", path: "/dashboard/leaves", icon: CalendarCheck, roles: ["ADMIN", "MANAGER", "TEAMLEAD", "EMPLOYEE"] },

    // --- TRACKING ---
    { name: "Performance", path: "/dashboard/efficiency", icon: Settings, roles: ["ADMIN", "MANAGER", "TEAMLEAD", "EMPLOYEE"] },
    { name: "Session Logs", path: "/dashboard/settings/session-logs", icon: Clock, roles: ["SUPER_ADMIN", "MASTER_ADMIN", "ADMIN", "MANAGER", "TEAMLEAD", "EMPLOYEE"] },
    { name: "Projects", path: "/dashboard/projects", icon: Briefcase, roles: ["ADMIN", "MANAGER", "TEAMLEAD", "EMPLOYEE"] },
    { name: "Event Planner", path: "/dashboard/events", icon: Calendar, roles: ["ADMIN", "MANAGER", "TEAMLEAD", "EMPLOYEE"] },
  ];

  const menu = allMenu.filter((item) => item.roles.includes(user?.role as string));

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* MOBILE TOP BAR */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 z-60 flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#00A884] rounded-lg flex items-center justify-center text-white font-bold">W</div>
          <span className="font-bold text-gray-900">WinterArc.</span>
        </div>
        <button onClick={toggleSidebar} className="p-2 text-gray-500">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
      )}

      {/* SIDEBAR CONTAINER */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-55
        h-screen w-64
        bg-white border-r border-gray-100
        transition-all duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        flex flex-col overflow-hidden
      `}>

        {/* TOP BRANDING */}
        <div className="p-5 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-[#00A884] rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-100/50">
              <span className="text-lg font-black">W</span>
            </div>
            <h1 className="text-lg font-black text-gray-900 tracking-tight">WinterArc.</h1>
          </div>
        </div>

        {/* USER PROFILE CARD (Top style) */}
        <div className="px-5 py-3">
          <div className="bg-[#F9FBFB] p-3 rounded-2xl border border-gray-50 flex items-center gap-3 relative group cursor-pointer hover:border-emerald-100 transition-all">
            <div className="relative shrink-0">
              <img src={profileImage} className="w-10 h-10 rounded-xl object-cover ring-2 ring-white" alt="Profile" />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-black text-gray-900 truncate">{profile?.name || user?.name}</p>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{user?.role}</p>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300 ml-auto group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 overflow-y-auto px-5 py-2 scrollbar-hide space-y-0.5">
          {menu.map((item) => {
            const active = pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-[12px] font-bold transition-all group
                  ${active
                    ? "bg-[#E0F2F1] text-[#00A884] border-l-4 border-[#00A884]"
                    : "text-gray-400 hover:bg-gray-50 hover:text-gray-900"}
                `}
              >
                <Icon className={`w-4.5 h-4.5 ${active ? "text-[#00A884]" : "text-gray-300 group-hover:text-gray-600"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* LEVEL UP PROMO CARD */}
        <div className="p-5 mt-auto">
          <div className="bg-linear-to-br from-[#E0F2F1] to-white p-5 rounded-3xl border border-emerald-50 relative overflow-hidden group shadow-sm">
            <div className="relative z-10 space-y-2">
              <h4 className="text-[12px] font-black text-emerald-900 leading-tight">Level up your HR System</h4>
              <p className="text-[9px] text-emerald-600 font-bold leading-relaxed">Boost your productivity and simplify workspace.</p>
              <button className="w-full py-2.5 bg-[#00A884] text-white font-black text-[9px] rounded-lg shadow-lg shadow-emerald-100/50 hover:bg-[#008F6F] transition-all active:scale-95">
                Start Quick Tech
              </button>
            </div>
            <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-200/20 rounded-full -mr-8 -mt-8 group-hover:scale-125 transition-transform duration-700" />
          </div>
        </div>

        {/* LOGOUT BUTTON */}
        <div className="px-5 pb-5 pt-1">
          <button
            onClick={async () => {
              if (!user) return;
              
              const rolesRequiringDailyReport = ["MANAGER", "TEAMLEAD", "EMPLOYEE", "MASTER_ADMIN"];
              const mustSubmit = rolesRequiringDailyReport.includes(user.role);

              if (mustSubmit) {
                try {
                  const reports = await ReportService.getMyReports();
                  const today = new Date().toDateString();
                  const submittedToday = reports.some((r: any) => new Date(r.createdAt).toDateString() === today);
                  
                  if (!submittedToday) {
                    setShowReportModal(true);
                    return;
                  }
                } catch (err) {
                  console.error("Failed to check daily reports", err);
                }
              }
              setShowLogoutModal(true);
            }}
            className="flex items-center gap-3.5 px-4 py-2.5 text-gray-400 font-bold hover:text-rose-500 transition-colors w-full group"
          >
            <LogOut size={18} className="group-hover:rotate-12 transition-transform" />
            <span className="text-[13px]">Logout</span>
          </button>
        </div>
      </aside>

      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-110 p-4">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <LogOut size={32} />
            </div>
            <h2 className="text-2xl font-black text-gray-900 text-center mb-2">Sign out?</h2>
            <p className="text-gray-500 text-center text-sm font-medium mb-8 leading-relaxed">
              Ready to wrap up for today? Ensure all your changes are saved.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  logout();
                  router.push("/login");
                }}
                className="w-full py-4 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl transition shadow-lg shadow-rose-100"
              >
                Yes, Sign Out
              </button>
              <button
                onClick={() => setShowLogoutModal(false)}
                className="w-full py-4 text-gray-400 font-bold hover:text-gray-600 transition"
              >
                Stay Logged In
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DAILY REPORT MODAL */}
      <DailyReportModal 
        isOpen={showReportModal} 
        onClose={() => setShowReportModal(false)} 
        onSuccess={() => {
          setShowReportModal(false);
          logout();
          router.push("/login");
        }}
      />
    </>
  );
}
