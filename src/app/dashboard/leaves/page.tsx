"use client";

import { useState, useEffect, useRef } from "react";
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  History,
  Users,
  ArrowRight,
  Info,
  CalendarCheck2,
  Search,
  ChevronDown,
  ArrowUpDown,
  Wrench,
  X,
  User as UserIcon,
  Trash2
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import LeaveService, { LeaveData, LeavePayload } from "@/services/leave.service";
import { RequestStatus } from "@/services/request.service";
import toast from "react-hot-toast";
import gsap from "gsap";

/* ================= COMPONENTS ================= */

const Avatar = ({ name, initials, color, src }: { name: string, initials: string, color: string, src?: string }) => {
  const imgUrl = src ? (src.startsWith('http') ? src : `${process.env.NEXT_PUBLIC_IMAGE_API_URL}/${src}`) : null;
  
  return (
    <div className="flex items-center gap-3">
      {imgUrl ? (
        <img 
          src={imgUrl} 
          alt={name} 
          className="w-8 h-8 rounded-full object-cover shadow-sm border border-slate-100" 
        />
      ) : (
        <div className={`w-8 h-8 rounded-full ${color} flex items-center justify-center text-[10px] font-bold text-white shadow-sm`}>
          {initials}
        </div>
      )}
      <span className="text-sm font-bold text-slate-700">{name}</span>
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const getStyles = () => {
    switch (status) {
      case "PENDING": return "bg-amber-50 text-amber-600 border border-amber-100";
      case "APPROVED": return "bg-[#fefae0] text-[#dab14e] border border-[#f9f3c5]";
      case "REJECTED": return "bg-rose-50 text-rose-600 border border-rose-100";
      default: return "bg-slate-50 text-slate-500 border border-slate-100";
    }
  };

  return (
    <span className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${getStyles()} min-w-[100px] text-center shadow-sm inline-block`}>
      {status}
    </span>
  );
};

const StatCard = ({ title, value, color, icon: Icon }: { title: string, value: string | number, color: string, icon: any }) => (
  <div className={`p-6 rounded-3xl ${color} border border-slate-100 shadow-sm transition-transform hover:scale-[1.02] flex items-center gap-5 h-28 animate-stat`}>
    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-slate-900 border border-slate-100">
      <Icon size={20} />
    </div>
    <div>
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{title}</span>
      <h3 className="text-2xl font-black text-slate-900 leading-none mt-1">{value}</h3>
    </div>
  </div>
);

/* ================= PAGE ================= */
export default function LeaveManagementPage() {
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<"my-leaves" | "team-requests">("my-leaves");
  const [myLeaves, setMyLeaves] = useState<LeaveData[]>([]);
  const [teamRequests, setTeamRequests] = useState<LeaveData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [viewingLeave, setViewingLeave] = useState<LeaveData | null>(null);
  const [selectedActionLeave, setSelectedActionLeave] = useState<LeaveData | null>(null);
  const [actionType, setActionType] = useState<"APPROVE" | "REJECT" | null>(null);
  const [adminNote, setAdminNote] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // Form state
  const [form, setForm] = useState<LeavePayload>({
    startDate: "",
    endDate: "",
    leaveType: "Casual",
    reason: "",
  });

  const leaveTypes = ["Casual", "Sick", "Earned", "Maternity", "Paternity", "Sabbatical"];

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const isManagerial = ["ADMIN", "MANAGER", "TEAMLEAD"].includes(user.role);

      const [leaves, inboxReqs] = await Promise.all([
        LeaveService.getMyLeaves().catch(() => []),
        isManagerial ? LeaveService.getTeamRequests().catch(() => []) : Promise.resolve([]),
      ]);

      setMyLeaves(leaves);
      setTeamRequests(inboxReqs);
    } catch (err) {
      console.error("Failed to fetch leaves", err);
      toast.error("Failed to load leave data");
    } finally {
      setLoading(false);
    }
  };

  /* ================= ANIMATION ================= */
  useEffect(() => {
    if (!loading && containerRef.current) {
      gsap.from(".animate-row", { 
        x: -20, 
        opacity: 0, 
        stagger: 0.05, 
        duration: 0.5, 
        ease: "power2.out" 
      });
      gsap.from(".animate-stat", {
        y: 20,
        opacity: 0,
        stagger: 0.1,
        duration: 0.5,
        ease: "back.out(1.7)"
      });
    }
  }, [loading, activeTab]);

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await LeaveService.createLeave(form);
      toast.success("Leave request submitted successfully ✅");
      setShowApplyModal(false);
      setForm({ ...form, reason: "", startDate: "", endDate: "" });
      fetchData();
    } catch (err) {
      toast.error("Failed to submit leave request");
    }
  };

  const handleAction = async (id: number, action: "APPROVE" | "REJECT", message?: string) => {
    try {
      await LeaveService.handleAction(id, action, message || "Processed via Dashboard");
      toast.success(`Request ${action === "APPROVE" ? "Approved" : "Rejected"} successfully ✅`);
      fetchData();
    } catch (err) {
      toast.error("Action failed");
    }
  };

  const handleDeleteLeave = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this leave request?")) return;
    try {
      await LeaveService.deleteLeave(id);
      toast.success("Leave request deleted successfully ✅");
      setViewingLeave(null);
      fetchData();
    } catch (err) {
      toast.error("Failed to delete request");
    }
  };

  // Filter Logic
  const getFilteredData = (data: LeaveData[]) => {
    return data.filter(item => {
      const searchStr = search.toLowerCase();
      const reasonMatch = item.reason?.toLowerCase().includes(searchStr) ?? (searchStr === "");
      const userMatch = item.user?.name.toLowerCase().includes(searchStr) ?? (searchStr === "");
      
      const matchesSearch = reasonMatch || userMatch;
      const matchesStatus = statusFilter ? item.status === statusFilter : true;
      
      let matchesDate = true;
      if (dateFilter) {
        const itemDate = new Date(item.startDate).toISOString().split('T')[0];
        matchesDate = itemDate === dateFilter;
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  };

  const displayData = activeTab === "my-leaves" ? getFilteredData(myLeaves) : getFilteredData(teamRequests);

  if (loading) return <div className="h-screen flex items-center justify-center font-bold text-slate-400">Loading Management...</div>;

  return (
    <div ref={containerRef} className="min-h-screen bg-white p-6 md:p-10 max-w-[1600px] mx-auto text-slate-900">
      
      {/* HEADER SECTION */}
      <div className="mb-10 animate-row">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Leave Management</h1>
            <p className="text-slate-500 font-medium text-sm">Request time off and track your team's availability</p>
          </div>
          <button
            onClick={() => setShowApplyModal(true)}
            className="flex items-center justify-center gap-2 bg-[#4db6ac] hover:bg-[#3d968e] text-white font-bold px-8 py-4 rounded-2xl shadow-lg shadow-[#4db6ac]/20 transition-all active:scale-95 text-sm"
          >
            <Plus size={20} /> Apply for Leave
          </button>
        </div>

        {/* QUICK STATS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          <StatCard 
            title="Balance Used" 
            value={myLeaves.filter(r => r.status === "APPROVED").length + " Days"} 
            color="bg-slate-50/50" 
            icon={CalendarCheck2}
          />
          <StatCard 
            title="Pending Requests" 
            value={myLeaves.filter(r => r.status === "PENDING").length} 
            color="bg-amber-50/50" 
            icon={Clock}
          />
          <StatCard 
            title="Approved Leaves" 
            value={myLeaves.filter(r => r.status === "APPROVED").length} 
            color="bg-[#fefae0]/30" 
            icon={CheckCircle2}
          />
          <StatCard 
            title="Rejected" 
            value={myLeaves.filter(r => r.status === "REJECTED").length} 
            color="bg-rose-50/50" 
            icon={XCircle}
          />
        </div>

        {/* TABS & FILTERS */}
        <div className="flex flex-col gap-6 bg-white p-1 pb-6 border-b border-slate-100 mb-8">
          <div className="flex items-center gap-6">
            <button
              onClick={() => { setActiveTab("my-leaves"); setSearch(""); setStatusFilter(""); setDateFilter(""); }}
              className={`flex items-center gap-2 py-3 text-sm font-bold transition-all relative ${activeTab === "my-leaves" ? "text-[#4db6ac]" : "text-slate-400 hover:text-slate-600"}`}
            >
              <History size={18} /> My History
              {activeTab === "my-leaves" && <div className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-[#4db6ac] rounded-full" />}
            </button>
            {(user?.role !== 'EMPLOYEE') && (
              <button
                onClick={() => { setActiveTab("team-requests"); setSearch(""); setStatusFilter(""); setDateFilter(""); }}
                className={`flex items-center gap-2 py-3 text-sm font-bold transition-all relative ${activeTab === "team-requests" ? "text-[#4db6ac]" : "text-slate-400 hover:text-slate-600"}`}
              >
                <Users size={18} /> Team Requests
                {teamRequests.filter(r => r.status === "PENDING").length > 0 && (
                  <span className="bg-[#4db6ac] text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1 font-black">
                    {teamRequests.filter(r => r.status === "PENDING").length}
                  </span>
                )}
                {activeTab === "team-requests" && <div className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-[#4db6ac] rounded-full" />}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-900 uppercase tracking-wider pl-1">Search Reason</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4db6ac]/20"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-900 uppercase tracking-wider pl-1">Status</label>
              <div className="relative">
                <select 
                  className="w-full appearance-none px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4db6ac]/20 text-slate-600 cursor-pointer"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-900 uppercase tracking-wider pl-1">Start Date</label>
              <div className="relative group/date">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/date:text-[#4db6ac]" size={16} />
                <input 
                  type="date" 
                  className="w-full pl-11 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4db6ac]/20 cursor-pointer"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
                {dateFilter && (
                  <button 
                    onClick={() => setDateFilter("")}
                    className="absolute right-10 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 p-1"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors">
                <ArrowUpDown size={14} />
                Sort
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#e8f5f4] rounded-xl text-xs font-bold text-[#2d6a4f] hover:bg-[#d1eae8] transition-colors">
                <Wrench size={14} />
                Manage
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT SECTION */}
      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-y-3">
          <thead>
            <tr className="text-left text-xs font-bold text-slate-900 uppercase tracking-widest ">
              <th className="px-6 py-4 bg-slate-50/50 rounded-l-2xl w-10 text-center">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[#4db6ac]" />
              </th>
              <th className="px-6 py-4 bg-slate-50/50">{activeTab === "my-leaves" ? "Type" : "Employee"}</th>
              <th className="px-6 py-4 bg-slate-50/50">Schedule</th>
              <th className="px-6 py-4 bg-slate-50/50">Reason</th>
              <th className="px-6 py-4 bg-slate-50/50 text-center">Status</th>
              <th className="px-6 py-4 bg-slate-50/50 text-center">Preview</th>
              <th className="px-6 py-4 bg-slate-50/50 rounded-r-2xl text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayData.length > 0 ? (
              displayData.map((req) => (
                <tr 
                  key={req.id} 
                  onClick={() => setViewingLeave(req)}
                  className="animate-row group bg-white hover:bg-slate-50/50 transition-colors border-y border-slate-100 cursor-pointer"
                >
                  <td className="px-6 py-6 border-y border-l border-slate-100 rounded-l-2xl text-center">
                    <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[#4db6ac]" />
                  </td>
                  <td className="px-6 py-6 border-y border-slate-100">
                    {activeTab === "my-leaves" ? (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-[#4db6ac] border border-slate-100">
                          <Calendar size={16} />
                        </div>
                        <span className="text-sm font-bold text-slate-900">{req.leaveType}</span>
                      </div>
                    ) : (
                      <Avatar 
                        name={req.user?.name || "Unknown"} 
                        initials={(req.user?.name || "U").split(" ").map(n => n[0]).join(".")} 
                        color="bg-indigo-500" 
                        src={req.user?.profileImage}
                      />
                    )}
                  </td>
                  <td className="px-6 py-6 border-y border-slate-100">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                      <span>{req.startDate}</span>
                      <ArrowRight size={14} className="text-slate-300" />
                      <span>{req.endDate}</span>
                    </div>
                  </td>
                  <td className="px-6 py-6 border-y border-slate-100 max-w-xs overflow-hidden">
                    <p className="text-xs text-slate-400 font-bold tracking-tight line-clamp-1 group-hover:line-clamp-none transition-all leading-relaxed">{req.reason}</p>
                  </td>
                  <td className="px-6 py-6 border-y border-slate-100 text-center">
                    <StatusBadge status={req.status} />
                  </td>
                  <td className="px-6 py-6 border-y border-slate-100 text-center">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setViewingLeave(req); }}
                      className="p-2 border border-slate-100 text-slate-400 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
                      title="View Details"
                    >
                      <Search size={18} />
                    </button>
                  </td>
                  <td className="px-6 py-6 border-y border-r border-slate-100 rounded-r-2xl text-right font-bold text-sm text-slate-600">
                    <div className="flex justify-end gap-2">
                      {activeTab === "team-requests" && req.status === "PENDING" && (
                        <>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setSelectedActionLeave(req); setActionType("APPROVE"); }}
                            className="p-2 border border-emerald-100 text-emerald-500 rounded-xl hover:bg-emerald-50 transition-colors shadow-sm"
                            title="Approve"
                          >
                            <CheckCircle2 size={18} />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setSelectedActionLeave(req); setActionType("REJECT"); }}
                            className="p-2 border border-rose-100 text-rose-500 rounded-xl hover:bg-rose-50 transition-colors shadow-sm"
                            title="Reject"
                          >
                            <XCircle size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-20 text-center text-slate-400 font-bold uppercase tracking-widest bg-slate-50 rounded-2xl">
                  No leave records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* APPLY MODAL */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-[550px] p-8 md:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#e8f5f4] blur-3xl opacity-50 -mr-16 -mt-16 pointer-events-none" />

            <button onClick={() => setShowApplyModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors z-10">
              <XCircle size={24} />
            </button>

            <div className="mb-8 pr-12">
              <h1 className="text-sm font-black text-[#2d6a4f] uppercase tracking-widest mb-1">Application</h1>
              <h2 className="text-3xl font-black text-slate-900 leading-tight">Apply for Leave</h2>
            </div>

            <form onSubmit={handleApplyLeave} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-900 uppercase tracking-wider pl-1">Leave Category</label>
                <div className="grid grid-cols-3 gap-2">
                  {leaveTypes.map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm({ ...form, leaveType: t })}
                      className={`py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl border transition-all ${
                        form.leaveType === t 
                        ? 'bg-[#4db6ac] text-white border-[#4db6ac] shadow-md shadow-[#4db6ac]/20 active:scale-95' 
                        : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300 active:scale-95'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-900 uppercase tracking-wider pl-1">Departure</label>
                  <input
                    type="date"
                    required
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full bg-slate-50 border-none p-4 rounded-2xl focus:ring-2 focus:ring-[#4db6ac]/20 text-sm font-bold transition-all cursor-pointer"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-900 uppercase tracking-wider pl-1">Return</label>
                  <input
                    type="date"
                    required
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full bg-slate-50 border-none p-4 rounded-2xl focus:ring-2 focus:ring-[#4db6ac]/20 text-sm font-bold transition-all cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-900 uppercase tracking-wider pl-1">Explain your reason</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Tell us why you need this time off..."
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  className="w-full bg-slate-50 border-none p-5 rounded-3xl focus:ring-2 focus:ring-[#4db6ac]/20 text-sm font-bold transition-all resize-none placeholder:text-slate-300 leading-relaxed"
                />
              </div>

              <div className="bg-slate-50 p-5 rounded-4xl flex gap-4 border border-slate-100/50">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shrink-0">
                  <Info className="text-[#4db6ac]" size={18} />
                </div>
                <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
                  Leave requests are processed by your direct reports or HR. You'll be notified once a decision is made.
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-[#4db6ac] text-white font-black py-5 rounded-2xl shadow-xl shadow-[#4db6ac]/10 transition-all flex items-center justify-center gap-2 group hover:bg-[#3d968e] active:scale-[0.98] uppercase tracking-widest text-xs"
              >
                Send Application <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* LEAVE DETAILS MODAL */}
      {viewingLeave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-[500px] rounded-4xl shadow-2xl relative overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
            {/* Background Accent */}
            <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-50 -mr-16 -mt-16 pointer-events-none ${viewingLeave.status === 'APPROVED' ? 'bg-emerald-100' : viewingLeave.status === 'REJECTED' ? 'bg-rose-100' : 'bg-[#e8f5f4]'}`} />

            <button onClick={() => setViewingLeave(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors z-10">
              <XCircle size={24} />
            </button>

            <div className="p-8">
              <div className="mb-6 pr-12">
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-[10px] font-bold text-[#2d6a4f] uppercase tracking-widest">Leave Details</h1>
                  <span className="text-[10px] text-slate-300 font-bold">#{viewingLeave.id}</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 leading-tight">
                  {viewingLeave.leaveType} Application
                </h2>
              </div>

              <div className="space-y-6">
                {/* USER INFO (for team requests) */}
                {activeTab === "team-requests" && viewingLeave.user && (
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100/50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar 
                        name={viewingLeave.user.name} 
                        initials={viewingLeave.user.name.split(" ").map(n => n[0]).join(".")} 
                        color="bg-indigo-500" 
                        src={viewingLeave.user.profileImage}
                      />
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{viewingLeave.user.role}</p>
                      </div>
                    </div>
                    <StatusBadge status={viewingLeave.status} />
                  </div>
                )}

                {/* SCHEDULE */}
                <div className="grid grid-cols-2 gap-4 bg-[#f8fafc] p-5 rounded-2xl border border-slate-100">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Calendar size={12} className="text-[#4db6ac]" /> Departure
                    </p>
                    <p className="text-base font-bold text-slate-900">{viewingLeave.startDate}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Calendar size={12} className="text-[#4db6ac]" /> Return
                    </p>
                    <p className="text-base font-bold text-slate-900">{viewingLeave.endDate}</p>
                  </div>
                </div>

                {/* REASON */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Reason for Leave</label>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100/50 min-h-[100px]">
                    <p className="text-sm text-slate-600 font-medium leading-relaxed">{viewingLeave.reason}</p>
                  </div>
                </div>

                {/* ADMIN MESSAGE (if any) */}
                {viewingLeave.adminMessage && (
                   <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-100/50 flex gap-4">
                      <Info className="text-amber-500 shrink-0" size={18} />
                      <div>
                        <p className="text-[10px] font-bold text-amber-900 uppercase tracking-widest mb-1">Approver Note</p>
                        <p className="text-xs text-amber-700 font-medium leading-relaxed">{viewingLeave.adminMessage}</p>
                      </div>
                   </div>
                )}

                {/* APPROVER NOTE INPUT (for pending team requests) */}
                {activeTab === "team-requests" && viewingLeave.status === "PENDING" && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Approver Note (Optional)</label>
                    <textarea 
                      placeholder="Add a message for the employee..." 
                      rows={3} 
                      className="w-full p-4 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4db6ac]/20 border border-slate-100 text-sm font-medium placeholder:text-slate-300 resize-none" 
                      value={adminNote} 
                      onChange={(e) => setAdminNote(e.target.value)} 
                    />
                  </div>
                )}

                {/* ACTIONS (for pending team requests) */}
                {activeTab === "team-requests" && viewingLeave.status === "PENDING" && (
                  <div className="flex gap-4 pt-2">
                    <button
                      onClick={() => { handleAction(viewingLeave.id, "APPROVE", adminNote); setViewingLeave(null); setAdminNote(""); }}
                      className="flex-1 bg-[#4db6ac] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-[#4db6ac]/10 transition-all flex items-center justify-center gap-2 hover:bg-[#3d968e] active:scale-[0.98] text-xs uppercase tracking-widest"
                    >
                      <CheckCircle2 size={16} /> Approve
                    </button>
                    <button
                      onClick={() => { handleAction(viewingLeave.id, "REJECT", adminNote); setViewingLeave(null); setAdminNote(""); }}
                      className="flex-1 bg-white border border-rose-100 text-rose-500 font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 hover:bg-rose-50 active:scale-[0.98] text-xs uppercase tracking-widest"
                    >
                      <XCircle size={16} /> Reject
                    </button>
                  </div>
                )}

                {/* CLOSE BUTTON (for history) */}
                {(activeTab === "my-leaves" || viewingLeave.status !== "PENDING") && (
                  <div className="flex gap-4 pt-2">
                    {activeTab === "my-leaves" && (
                      <button
                        onClick={() => handleDeleteLeave(viewingLeave.id)}
                        className="flex-1 bg-rose-50 text-rose-600 font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 hover:bg-rose-100 active:scale-[0.98] text-xs uppercase tracking-widest shadow-sm"
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                    )}
                    <button
                      onClick={() => setViewingLeave(null)}
                      className="flex-[2] bg-slate-900 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-slate-200 transition-all flex items-center justify-center gap-2 group hover:bg-black active:scale-[0.98] uppercase tracking-widest text-xs"
                    >
                      Close Preview
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ACTION MODAL (Same as Inbox Page) */}
      {selectedActionLeave && actionType && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-[450px] p-8 rounded-[2.5rem] shadow-2xl relative border border-slate-100 animate-in zoom-in-95 duration-200">
            <button onClick={() => { setSelectedActionLeave(null); setActionType(null); setAdminNote(""); }} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors">
              <X size={20} />
            </button>
            <h2 className="text-2xl font-bold mb-4 text-slate-900">{actionType === "APPROVE" ? "Approve" : "Reject"} Leave</h2>
            <p className="text-sm text-slate-500 mb-6 font-medium">
              Are you sure you want to {actionType.toLowerCase()} this leave request from <span className="text-slate-900 font-bold">{selectedActionLeave.user?.name}</span>?
            </p>
            
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Response Message</label>
                <textarea 
                  placeholder="Add a message for the employee (optional)" 
                  rows={4} 
                  className="w-full p-4 bg-slate-50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#4db6ac]/20 border border-slate-100 text-sm font-medium" 
                  value={adminNote} 
                  onChange={(e) => setAdminNote(e.target.value)} 
                />
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => { setSelectedActionLeave(null); setActionType(null); setAdminNote(""); }}
                  className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => { 
                    handleAction(selectedActionLeave.id, actionType, adminNote); 
                    setSelectedActionLeave(null); 
                    setActionType(null); 
                    setAdminNote(""); 
                  }}
                  className={`flex-1 py-4 text-white rounded-2xl font-bold text-sm shadow-lg transition-transform active:scale-95 ${
                    actionType === "APPROVE" ? "bg-emerald-500 shadow-emerald-500/20 hover:bg-emerald-600" : "bg-rose-500 shadow-rose-500/20 hover:bg-rose-600"
                  }`}
                >
                  Confirm {actionType === "APPROVE" ? "Approval" : "Rejection"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        input[type="checkbox"] { accent-color: #4db6ac; }
        ::-webkit-calendar-picker-indicator { cursor: pointer; filter: invert(0.5); }
      `}</style>
    </div>
  );
}
