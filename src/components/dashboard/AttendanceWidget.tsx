"use client";

import { useAuth } from "@/context/AuthContext";
import { LogIn, LogOut, Clock, MapPin } from "lucide-react";

interface AttendanceWidgetProps {
  stats: any;
  onRefresh: () => void;
}

export default function AttendanceWidget({ stats, onRefresh }: AttendanceWidgetProps) {
  const { logout } = useAuth();
  const attendance = stats?.attendance;

  const handleLogout = async () => {
    await logout();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const totalHours = attendance?.totalMinutesToday 
    ? (attendance.totalMinutesToday / 60).toFixed(1) 
    : "0.0";

  return (
    <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 flex flex-col h-full hover:shadow-2xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Clock className="w-6 h-6 text-indigo-600" />
          Attendance
        </h3>
        <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
          attendance?.isLoggedIn 
            ? "bg-green-100 text-green-700 border border-green-200" 
            : "bg-red-100 text-red-700 border border-red-200"
        }`}>
          {attendance?.isLoggedIn ? "Active Now" : "Logged Out"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
          <p className="text-xs text-indigo-600 font-bold uppercase mb-1">Today's Hours</p>
          <p className="text-3xl font-black text-indigo-900">{totalHours}h</p>
        </div>
        <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
          <p className="text-xs text-amber-600 font-bold uppercase mb-1">Last Login</p>
          <p className="text-sm font-bold text-amber-900">
            {attendance?.lastLogin ? formatTime(attendance.lastLogin) : "N/A"}
          </p>
        </div>
      </div>

      <div className="grow overflow-hidden mb-6">
        <p className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-widest">Recent Logs</p>
        <div className="space-y-3 overflow-y-auto max-h-48 pr-2 custom-scrollbar">
          {stats?.recentLogs?.map((log: any) => (
            <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 group hover:bg-white hover:border-indigo-200 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm group-hover:bg-indigo-50">
                  <LogIn className="w-4 h-4 text-indigo-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-700">{formatDate(log.loginAt)}</p>
                  <p className="text-xs text-gray-400 font-medium">{formatTime(log.loginAt)}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1.5 justify-end mb-0.5">
                  <MapPin className="w-3 h-3 text-gray-300" />
                  <p className="text-[10px] font-bold text-gray-400 uppercase">{log.isoffice || "Remote"}</p>
                </div>
                <p className="text-xs font-bold text-gray-600">
                  {log.logoutAt ? formatTime(log.logoutAt) : "---"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="w-full py-4 bg-linear-to-r from-red-500 to-rose-600 text-white rounded-2xl font-bold shadow-lg shadow-red-200 hover:scale-[1.02] transform transition-all active:scale-95 flex items-center justify-center gap-3"
      >
        <LogOut className="w-5 h-5" />
        Finish Day & Logout
      </button>
    </div>
  );
}
