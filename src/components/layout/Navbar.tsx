// "use client";

// import Link from "next/link";
// import { usePathname, useRouter } from "next/navigation";
// import { useAuth } from "@/context/AuthContext";
// import { useState, useRef, useEffect } from "react";
// import api from "@/lib/axios";
// import { ReportService } from "@/services/report.service";
// import {
//   Search,
//   Bell,
//   ChevronDown,
//   LayoutDashboard,
//   Users,
//   CalendarCheck,
//   ClipboardList,
//   Gift,
//   Briefcase,
//   Mail,
//   Calendar,
//   Settings,
//   Paperclip,
//   X,
// } from "lucide-react";

// export default function Navbar() {
//   const { user, logout } = useAuth();
//   const pathname = usePathname();
//   const router = useRouter();

//   const [open, setOpen] = useState(false);
//   const [inboxCount, setInboxCount] = useState(0);
//   const [showLogoutModal, setShowLogoutModal] = useState(false);
//   const [showReportModal, setShowReportModal] = useState(false);

//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [files, setFiles] = useState<File[]>([]);
//   const [messageTypes, setMessageTypes] = useState<string[]>([]);

//   const dropdownRef = useRef<HTMLDivElement>(null);

//   /* ================= ROLES REQUIRING REPORT ================= */

//   const rolesRequiringReport = [
//     "MANAGER",
//     "TEAMLEAD",
//     "EMPLOYEE",
//     "MASTER_ADMIN",
//   ];

//   /* ================= MESSAGE TYPE OPTIONS ================= */

//   const MESSAGE_TYPE_OPTIONS = [
//     "TEXT",
//     "IMAGE",
//     "VIDEO",
//     "DOCUMENT",
//     "OTHER",
//   ];

//   const toggleMessageType = (type: string) => {
//     if (messageTypes.includes(type)) {
//       setMessageTypes(messageTypes.filter((t) => t !== type));
//     } else {
//       setMessageTypes([...messageTypes, type]);
//     }
//   };

//   /* ================= LOGOUT FLOW ================= */

//   const handleLogoutClick = async () => {
//     if (!user) return;

//     const mustSubmitReport = rolesRequiringReport.includes(user.role);

//     // If no report required → direct logout modal
//     if (!mustSubmitReport) {
//       setShowLogoutModal(true);
//       return;
//     }

//     try {
//       const reports = await ReportService.getMyReports();

//       const today = new Date();
//       today.setHours(0, 0, 0, 0);

//       const submittedToday = reports.find((r: any) => {
//         const created = new Date(r.createdAt);
//         created.setHours(0, 0, 0, 0);
//         return created.getTime() === today.getTime();
//       });

//       if (submittedToday) {
//         setShowLogoutModal(true);
//       } else {
//         setShowReportModal(true);
//       }
//     } catch {
//       setShowReportModal(true);
//     }
//   };

//   const confirmLogout = () => {
//     logout();
//     router.push("/login");
//   };

//   const submitReportAndLogout = async () => {
//     if (!title || !description) return;

//     const formData = new FormData();
//     formData.append("title", title);
//     formData.append("description", description);

//     messageTypes.forEach((type) => {
//       formData.append("messageTypes", type);
//     });

//     files.forEach((file) => {
//       formData.append("files", file);
//     });

//     await ReportService.submitReport(formData);

//     // Reset form
//     setTitle("");
//     setDescription("");
//     setFiles([]);
//     setMessageTypes([]);
//     setShowReportModal(false);

//     logout();
//     router.push("/login");
//   };

//   /* ================= FETCH INBOX COUNT ================= */

//   const fetchInboxCount = async () => {
//     try {
//       const res = await api.get("/requests/inbox");
//       setInboxCount(res.data.length);
//     } catch {
//       setInboxCount(0);
//     }
//   };

//   useEffect(() => {
//     if (
//       user?.role === "ADMIN" ||
//       user?.role === "MANAGER" ||
//       user?.role === "TEAMLEAD"
//     ) {
//       fetchInboxCount();
//       const interval = setInterval(fetchInboxCount, 20000);
//       return () => clearInterval(interval);
//     }
//   }, [user]);

//   /* ================= CLICK OUTSIDE ================= */

//   useEffect(() => {
//     function handleClickOutside(event: MouseEvent) {
//       if (
//         dropdownRef.current &&
//         !dropdownRef.current.contains(event.target as Node)
//       ) {
//         setOpen(false);
//       }
//     }

//     document.addEventListener("mousedown", handleClickOutside);
//     return () =>
//       document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const allMenu = [
//     { name: "Overview", path: "/dashboard", icon: LayoutDashboard, roles: ["SUPER_ADMIN","MASTER_ADMIN","ADMIN","MANAGER","TEAMLEAD","EMPLOYEE"] },
//     { name: "Tasks", path: "/dashboard/assign", icon: Users, roles: ["ADMIN","MANAGER","TEAMLEAD","EMPLOYEE"] },
//     { name: "Event planner", path: "/dashboard/events", icon: CalendarCheck, roles: ["ADMIN","MANAGER","TEAMLEAD","EMPLOYEE"] },
//     { name: "To Do", path: "/dashboard/todo", icon: ClipboardList, roles: ["ADMIN","MANAGER","TEAMLEAD","EMPLOYEE"] },
//     { name: "Benefits", path: "/dashboard/benefits", icon: Gift, roles: ["ADMIN","MANAGER","TEAMLEAD","EMPLOYEE"] },
//     { name: "Projects", path: "/dashboard/projects", icon: Briefcase, roles: ["ADMIN","MANAGER","TEAMLEAD","EMPLOYEE"] },
//     { name: "Inbox", path: "/dashboard/request", icon: Mail, roles: ["ADMIN","MANAGER","TEAMLEAD","EMPLOYEE"] },
//     { name: "Leaves", path: "/dashboard/leaves", icon: Calendar, roles: ["ADMIN","MANAGER","TEAMLEAD"] },
//     { name: "Settings", path: "/dashboard/settings", icon: Settings, roles: ["ADMIN","MANAGER","TEAMLEAD","EMPLOYEE"] },
//     { name: "Organization", path: "/dashboard/organization", icon: Users, roles: ["ADMIN","MANAGER","TEAMLEAD"] },
//   ];

//   const menu = allMenu.filter((item) =>
//     item.roles.includes(user?.role as string)
//   );

//   return (
//     <>
//       {/* ===== HEADER ===== */}
//       <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
//         <div className="flex items-center justify-between px-8 py-4">
//           <h1 className="text-xl font-bold tracking-tight">
//             <span className="text-slate-900">HR</span>
//             <span className="text-purple-600">CONNEX.</span>
//           </h1>

//           <div className="flex items-center gap-4">
//             {/* <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full border">
//               <Search size={20} />
//             </button>

//             <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full border">
//               <Bell size={20} />
//               {inboxCount > 0 && (
//                 <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
//               )}
//             </button> */}

//             <div className="relative" ref={dropdownRef}>
//               <div
//                 onClick={() => setOpen(!open)}
//                 className="flex items-center gap-2 bg-gray-50 border border-gray-200 pl-1 pr-3 py-1 rounded-full cursor-pointer"
//               >
//                 <div className="w-8 h-8 bg-orange-200 rounded-full overflow-hidden">
//                   <img
//                     src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
//                     alt="avatar"
//                   />
//                 </div>
//                 <span className="text-sm font-semibold text-gray-700">
//                   {user?.name}
//                 </span>
//                 <ChevronDown size={14} />
//               </div>

//               {open && (
//                 <div className="absolute right-0 mt-3 w-44 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden">
//                   <button
//                     onClick={() => {
//                       handleLogoutClick();
//                       setOpen(false);
//                     }}
//                     className="block w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-gray-100"
//                   >
//                     Logout
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         <nav className="flex items-center gap-2 px-8 pb-4 overflow-x-auto">
//           {menu.map((item) => {
//             const active = pathname === item.path;
//             return (
//               <Link
//                 key={item.path}
//                 href={item.path}
//                 className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm ${
//                   active
//                     ? "bg-purple-100 text-purple-700"
//                     : "text-gray-500 hover:bg-gray-100"
//                 }`}
//               >
//                 <item.icon size={16} />
//                 {item.name}
//               </Link>
//             );
//           })}
//         </nav>
//       </header>

//       {/* ===== LOGOUT CONFIRM MODAL ===== */}
//       {showLogoutModal && (
//         <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[110]">
//           <div className="bg-white rounded-xl p-6 w-[90%] max-w-md relative">
//             <button
//               onClick={() => setShowLogoutModal(false)}
//               className="absolute top-3 right-3 text-gray-500"
//             >
//               <X size={18} />
//             </button>

//             <h2 className="text-lg font-semibold mb-4">
//               Are you sure you want to logout?
//             </h2>

//             <div className="flex justify-end gap-3">
//               <button
//                 onClick={() => setShowLogoutModal(false)}
//                 className="px-4 py-2 bg-gray-200 rounded"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={confirmLogout}
//                 className="px-4 py-2 bg-red-500 text-white rounded"
//               >
//                 Logout
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ===== REPORT MODAL ===== */}
//       {showReportModal && (
//         <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[110]">
//           <div className="bg-white rounded-2xl p-6 w-[90%] max-w-lg shadow-2xl relative">

//             <button
//               onClick={() => setShowReportModal(false)}
//               className="absolute top-4 right-4 text-gray-500"
//             >
//               <X size={18} />
//             </button>

//             <h2 className="text-lg font-semibold mb-4">
//               Submit Daily Report Before Logout
//             </h2>

//             <input
//               type="text"
//               placeholder="Report Title"
//               className="w-full mb-3 p-2 border rounded"
//               value={title}
//               onChange={(e) => setTitle(e.target.value)}
//             />

//             <textarea
//               placeholder="Report Description"
//               className="w-full mb-4 p-2 border rounded"
//               rows={4}
//               value={description}
//               onChange={(e) => setDescription(e.target.value)}
//             />

//             <div className="mb-4">
//               <p className="text-sm font-semibold mb-2">Message Types</p>
//               <div className="flex flex-wrap gap-2">
//                 {MESSAGE_TYPE_OPTIONS.map((type) => (
//                   <button
//                     key={type}
//                     onClick={() => toggleMessageType(type)}
//                     className={`px-3 py-1 rounded-full text-xs border ${
//                       messageTypes.includes(type)
//                         ? "bg-purple-600 text-white"
//                         : "bg-gray-100"
//                     }`}
//                   >
//                     {type}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             <div className="mb-4">
//               <label className="text-sm font-semibold mb-2 flex items-center gap-2">
//                 <Paperclip size={14} />
//                 Attach Files
//               </label>

//               <input
//                 type="file"
//                 multiple
//                 onChange={(e) =>
//                   setFiles(Array.from(e.target.files || []))
//                 }
//               />
//             </div>

//             <button
//               onClick={submitReportAndLogout}
//               className="w-full py-2  bg-purple-600 text-white rounded-lg"
//             >
//               Submit & Logout
//             </button>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useState, useRef, useEffect } from "react";
import api from "@/lib/axios";
import { ReportService } from "@/services/report.service";
import { getUserProfile } from "@/services/profile.service";

import {
  ChevronDown,
  LayoutDashboard,
  Users,
  CalendarCheck,
  Mail,
  MessageSquare,
  Send,
  Settings,
  X,
  LogOut,
  Menu, // Added for potential mobile menu toggle
} from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

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
    : "/avatar.png";

  const confirmLogout = () => {
    logout();
    router.push("/login");
  };

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const allMenu = [
    { name: "Overview", path: "/dashboard", icon: LayoutDashboard, roles: ["SUPER_ADMIN", "MASTER_ADMIN", "ADMIN", "MANAGER", "TEAMLEAD", "EMPLOYEE"] },
    { name: "Chat", path: "/dashboard/chat", icon: MessageSquare, roles: ["SUPER_ADMIN", "MASTER_ADMIN", "ADMIN", "MANAGER", "TEAMLEAD", "EMPLOYEE"] },
    { name: "Tasks", path: "/dashboard/assign", icon: Users, roles: ["ADMIN", "MANAGER", "TEAMLEAD", "EMPLOYEE"] },
    { name: "Event planner", path: "/dashboard/events", icon: CalendarCheck, roles: ["ADMIN", "MANAGER", "TEAMLEAD", "EMPLOYEE"] },
    { name: "Inbox", path: "/dashboard/request", icon: Mail, roles: ["ADMIN", "MANAGER", "TEAMLEAD", "EMPLOYEE"] },
    { name: "Organization", path: "/dashboard/organization", icon: Users, roles: ["ADMIN", "MANAGER", "TEAMLEAD"] },
    { name: "Reports", path: "/dashboard/daily-work", icon: Settings, roles: ["ADMIN", "MANAGER", "TEAMLEAD", "EMPLOYEE"] },
  ];

  const menu = allMenu.filter((item) => item.roles.includes(user?.role as string));

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        {/* TOP BAR */}
        <div className="flex items-center justify-between px-4 md:px-8 py-3 md:py-4">
          <h1 className="text-lg md:text-xl font-bold tracking-tight shrink-0">
            <span className="text-slate-900">Winter</span>
            <span className="text-purple-600">Arc.</span>
          </h1>

          <div className="relative" ref={dropdownRef}>
            <div
              onClick={() => setOpen(!open)}
              className="flex items-center gap-2 bg-gray-50 border border-gray-200 p-1 md:pr-3 rounded-full cursor-pointer hover:bg-gray-100 transition-all"
            >
              <img src={profileImage} className="w-7 h-7 md:w-8 md:h-8 rounded-full object-cover" alt="Profile" />
              {/* Hide name on very small screens to prevent overlap */}
              <span className="hidden sm:inline text-xs md:text-sm font-semibold text-gray-700 max-w-[100px] truncate">
                {profile?.name || user?.name}
              </span>
              <ChevronDown size={14} className="text-gray-500 mr-1 md:mr-0" />
            </div>

            {/* PROFILE DROPDOWN */}
            {open && (
              <div className="absolute right-0 mt-3 w-64 md:w-72 bg-white border border-gray-200 rounded-2xl md:rounded-3xl shadow-2xl z-50 overflow-hidden p-4">
                <div className="flex flex-col items-center text-center py-2">
                  <img src={profileImage} className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover mb-3" alt="Large Profile" />
                  <p className="font-semibold text-sm md:text-base">{profile?.name || user?.name}</p>
                  <p className="text-xs text-gray-500 mb-4 truncate w-full px-2">{profile?.email || user?.email}</p>
                  <button
                    onClick={() => { router.push("/dashboard/profile"); setOpen(false); }}
                    className="w-full py-2 border border-gray-300 rounded-full text-xs md:text-sm font-medium hover:bg-gray-50 transition"
                  >
                    Manage Account
                  </button>
                </div>
                <div className="border-t border-gray-100 mt-4 pt-2">
                  <button
                    onClick={() => { setShowLogoutModal(true); setOpen(false); }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <LogOut size={18} />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM NAVIGATION - RESPONSIVE SCROLL */}
        <nav className="flex items-center gap-1 md:gap-2 px-4 md:px-8 pb-3 md:pb-4 overflow-x-auto no-scrollbar scroll-smooth">
          {menu.map((item) => {
            const active = pathname === item.path;
            return (
              <Link 
                key={item.path} 
                href={item.path} 
                className={`
                  flex items-center gap-2 px-3 md:px-4 py-2 rounded-full text-xs md:text-sm whitespace-nowrap transition-all
                  ${active ? "bg-purple-100 text-purple-700 font-medium" : "text-gray-500 hover:bg-gray-100"}
                `}
              >
                <item.icon size={16} className="shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </header>

      {/* MODAL - CENTERED FOR ALL SCREENS */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-[340px] md:max-w-md shadow-xl animate-in fade-in zoom-in duration-200">
            <h2 className="text-lg font-semibold mb-2">Sign out?</h2>
            <p className="text-gray-500 text-sm mb-6">Are you sure you want to log out of your session?</p>
            <div className="flex flex-col sm:flex-row justify-end gap-2 md:gap-3">
              <button 
                onClick={() => setShowLogoutModal(false)} 
                className="order-2 sm:order-1 px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button 
                onClick={confirmLogout} 
                className="order-1 sm:order-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}