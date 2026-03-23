"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import gsap from "gsap";
import { 
  Search, 
  ChevronDown, 
  Calendar, 
  MoreHorizontal, 
  CheckCircle, 
  XCircle,
  ArrowUpDown,
  Wrench,
  Eye,
  Clock,
  X
} from "lucide-react";

/* ================= TYPES ================= */
interface Request {
  id: number;
  subject: string;
  description: string;
  status: string;
  createdAt: string;
  creator: {
    id: number;
    name: string;
    role: string;
    profileImage?: string;
  };
}

/* ================= COMPONENTS ================= */

const Avatar = ({ name, initials, color, src }: { name: string, initials: string, color: string, src?: string }) => {
  const imgUrl = src ? (src.startsWith('http') ? src : `http://localhost:5000/${src}`) : null;
  
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

const StatCard = ({ title, value, color }: { title: string, value: string | number, color: string }) => (
  <div className={`p-6 rounded-3xl ${color} border border-slate-100 shadow-sm transition-transform hover:scale-[1.02] flex flex-col justify-between h-32`}>
    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{title}</span>
    <span className="text-3xl font-black text-slate-900">{value}</span>
  </div>
);

/* ================= PAGE ================= */
export default function InboxPage() {
  const { user } = useAuth();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [viewingRequest, setViewingRequest] = useState<Request | null>(null);
  const [actionType, setActionType] = useState<"APPROVE" | "REJECT" | null>(null);
  const [message, setMessage] = useState("");

  /* ================= ROLE REDIRECT ================= */
  useEffect(() => {
    if (!user) return;
    if (user.role === "EMPLOYEE") {
      router.replace("/dashboard/request/my-requests");
    }
  }, [user, router]);

  /* ================= FETCH ================= */
  const fetchInbox = async () => {
    try {
      setLoading(true);
      const res = await api.get("/requests/inbox");
      setRequests(res.data);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load inbox");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role !== "EMPLOYEE") fetchInbox();
  }, [user]);

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
    }
  }, [loading]);

  /* ================= ACTION ================= */
  const handleAction = async () => {
    if (!selectedRequest || !actionType) return;
    try {
      await api.put(`/requests/${selectedRequest.id}/action`, {
        action: actionType,
        message,
      });
      toast.success(`Request ${actionType}D successfully ✅`);
      setSelectedRequest(null);
      setMessage("");
      fetchInbox();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Action failed");
    }
  };

  const filteredRequests = requests.filter((req) => {
    const matchesSearch = req.subject.toLowerCase().includes(search.toLowerCase()) || 
                         req.creator?.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter ? req.status === statusFilter : true;
    
    // Date Filtering
    let matchesDate = true;
    if (dateFilter) {
      const reqDate = new Date(req.createdAt).toISOString().split('T')[0];
      matchesDate = reqDate === dateFilter;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  if (loading) return <div className="h-screen flex items-center justify-center font-bold text-slate-400">Loading Inbox...</div>;

  return (
    <div ref={containerRef} className="min-h-screen bg-white p-6 md:p-10 max-w-[1600px] mx-auto text-slate-900">
      
      {/* HEADER SECTION */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-8">Request Inbox</h1>
        
        {/* STATS OVERVIEW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 text-slate-900">
          <StatCard 
            title="Pending Requests" 
            value={requests.filter(r => r.status === "PENDING").length} 
            color="bg-amber-50/50" 
          />
          <StatCard 
            title="Today's Requests" 
            value={requests.filter(r => new Date(r.createdAt).toDateString() === new Date().toDateString()).length} 
            color="bg-blue-50/50" 
          />
          <StatCard 
            title="Total Inbox" 
            value={requests.length} 
            color="bg-slate-50/50" 
          />
        </div>

        {/* FILTERS BAR */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">Search Subject or Name</label>
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
            <label className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">Status</label>
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
            <label className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">Date Received</label>
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
          
          <button 
            onClick={() => router.push("/dashboard/request/create")}
            className="w-full py-3.5 bg-[#4db6ac] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#4db6ac]/20 hover:bg-[#3d968e] transition-colors active:scale-[0.98]"
          >
            New Request
          </button>
        </div>
      </div>

      {/* LIST SECTION */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-900">Incoming Requests</h2>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors">
            <Wrench size={14} />
            Manage
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#e8f5f4] rounded-lg text-xs font-bold text-[#2d6a4f] hover:bg-[#d1eae8] transition-colors">
            <ArrowUpDown size={14} />
            Sort
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-y-3">
          <thead>
            <tr className="text-left text-xs font-bold text-slate-900 uppercase tracking-wider">
              <th className="px-6 py-4 bg-slate-50/50 rounded-l-2xl w-10 text-center">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[#4db6ac]" />
              </th>
              <th className="px-6 py-4 bg-slate-50/50">Sender</th>
              <th className="px-6 py-4 bg-slate-50/50">Subject</th>
              <th className="px-6 py-4 bg-slate-50/50">Status</th>
              <th className="px-6 py-4 bg-slate-50/50">Received Date</th>
              <th className="px-6 py-4 bg-slate-50/50 rounded-r-2xl text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.length > 0 ? (
              filteredRequests.map((req) => (
                <tr key={req.id} className="animate-row group bg-white hover:bg-slate-50/50 transition-colors cursor-pointer border-y border-slate-100" onClick={() => setViewingRequest(req)}>
                  <td className="px-6 py-6 border-y border-l border-slate-100 rounded-l-2xl text-center" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[#4db6ac]" />
                  </td>
                  <td className="px-6 py-6 border-y border-slate-100 text-slate-900">
                    <Avatar 
                      name={req.creator?.name || "Unknown"} 
                      initials={(req.creator?.name || "U").split(" ").map(n => n[0]).join(".")} 
                      color="bg-indigo-500" 
                      src={req.creator?.profileImage}
                    />
                  </td>
                  <td className="px-6 py-6 border-y border-slate-100">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900">{req.subject}</span>
                      <span className="text-xs text-slate-400 line-clamp-1 max-w-xs uppercase tracking-tight font-bold mt-1">{req.description}</span>
                    </div>
                  </td>
                  <td className="px-6 py-6 border-y border-slate-100">
                    <StatusBadge status={req.status} />
                  </td>
                  <td className="px-6 py-6 border-y border-slate-100 text-sm font-medium text-slate-600">
                    {new Date(req.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-6 border-y border-r border-slate-100 rounded-r-2xl text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-2">
                       <button 
                          onClick={() => setViewingRequest(req)}
                          className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-colors shadow-sm"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                      {req.status === "PENDING" && (
                        <>
                          <button 
                            onClick={() => { setSelectedRequest(req); setActionType("APPROVE"); }}
                            className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors shadow-sm"
                            title="Approve"
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button 
                            onClick={() => { setSelectedRequest(req); setActionType("REJECT"); }}
                            className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors shadow-sm"
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
                <td colSpan={6} className="px-6 py-20 text-center text-slate-400 font-bold uppercase tracking-widest bg-slate-50 rounded-2xl">
                  No requests found in your inbox.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ACTION MODAL */}
      {selectedRequest && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-[450px] p-8 rounded-[2.5rem] shadow-2xl relative border border-slate-100">
            <button onClick={() => setSelectedRequest(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors">
              <X size={20} />
            </button>
            <h2 className="text-2xl font-bold mb-4 text-slate-900">{actionType === "APPROVE" ? "Approve" : "Reject"} Request</h2>
            <p className="text-sm text-slate-500 mb-6 font-medium">Are you sure you want to {actionType.toLowerCase()} this request from <span className="text-slate-900 font-bold">{selectedRequest.creator.name}</span>?</p>
            
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Response Message</label>
                <textarea 
                  placeholder="Add a message for the sender (optional)" 
                  rows={4} 
                  className="w-full p-4 bg-slate-50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#4db6ac]/20 border border-slate-100 text-sm" 
                  value={message} 
                  onChange={(e) => setMessage(e.target.value)} 
                />
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setSelectedRequest(null)}
                  className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAction}
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

       {/* DETAILS MODAL */}
       {viewingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-[550px] p-8 rounded-[2.5rem] shadow-2xl relative border border-slate-100 overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#e8f5f4] blur-3xl opacity-50 -mr-16 -mt-16 pointer-events-none" />

            <button onClick={() => setViewingRequest(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors z-10">
              <X size={20} />
            </button>

            <div className="mb-8 pr-12">
              <h1 className="text-sm font-black text-[#2d6a4f] uppercase tracking-widest mb-1">Request Details</h1>
              <h2 className="text-2xl font-bold text-slate-900 mb-2 leading-tight">{viewingRequest.subject}</h2>
              <StatusBadge status={viewingRequest.status} />
            </div>

            <div className="space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Full Description</label>
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 text-sm text-slate-600 leading-relaxed font-medium">
                  {viewingRequest.description}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Sender Profile</label>
                <div className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center font-bold shadow-sm">
                    {viewingRequest.creator?.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{viewingRequest.creator?.name}</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{viewingRequest.creator?.role}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Clock size={12} />
                  Received: {new Date(viewingRequest.createdAt).toLocaleString()}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setViewingRequest(null)}
                    className="px-6 py-3 bg-slate-50 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-100 transition-all active:scale-95"
                  >
                    Close
                  </button>
                  {viewingRequest.status === 'PENDING' && (
                    <button
                      onClick={() => { setViewingRequest(null); setSelectedRequest(viewingRequest); setActionType("APPROVE"); }}
                      className="px-8 py-3 bg-[#4db6ac] text-white rounded-xl font-bold text-xs hover:bg-[#3d968e] transition-all shadow-lg shadow-[#4db6ac]/10 active:scale-95"
                    >
                      Process Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        input[type="checkbox"] { accent-color: #4db6ac; }
        .line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>
    </div>
  );
}