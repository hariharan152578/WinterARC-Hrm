"use client";

import { useEffect, useState, useRef } from "react";
import api from "@/lib/axios";
import gsap from "gsap";
import { 
  ChevronRight, 
  Calendar, 
  Search, 
  MoreHorizontal, 
  X, 
  ChevronLeft,
  ArrowUpDown,
  Wrench,
  Clock
} from "lucide-react";

/* ================= TYPES ================= */
interface User {
  id: number;
  name: string;
  role: string;
  profileImage?: string;
}

interface Request {
  id: number;
  subject: string;
  description: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  message?: string | null;
  creator: User;
  approver: User;
}

const ITEMS_PER_PAGE = 8;

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
      <div className="flex flex-col">
        <span className="text-sm font-bold text-slate-700 leading-tight">{name}</span>
      </div>
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

/* ================= PAGE ================= */
export default function MyRequestsPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  const [requests, setRequests] = useState<Request[]>([]);
  const [activeTab, setActiveTab] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH ================= */
  useEffect(() => {
    setLoading(true);
    api.get("/requests/my-created").then((res) => {
      setRequests(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

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

  /* ================= FILTERING ================= */
  const filteredRequests = requests.filter((req) => {
    const matchesTab = activeTab === "ALL" || req.status === activeTab;
    
    // Date Filtering
    let matchesDate = true;
    if (dateFilter) {
      const reqDate = new Date(req.createdAt).toISOString().split('T')[0];
      matchesDate = reqDate === dateFilter;
    }

    return matchesTab && matchesDate;
  });

  const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE);
  const paginatedData = filteredRequests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (loading) return <div className="h-screen flex items-center justify-center font-bold text-slate-400">Loading My Requests...</div>;

  return (
    <div ref={containerRef} className="max-w-[1600px] mx-auto py-4 space-y-8">

      {/* HEADER SECTION */}
      <div className="mb-10 animate-row">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-8">My Requests</h1>
        
        {/* FILTER BAR / TABS */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex p-1 bg-slate-50 rounded-2xl border border-slate-100">
            {["ALL", "PENDING", "APPROVED", "REJECTED"].map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                  activeTab === tab
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="text" 
                placeholder="Quick search..." 
                className="pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#4db6ac]/10 w-48"
              />
            </div>
            
            <div className="relative group/date">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="date" 
                className="pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#4db6ac]/10 cursor-pointer w-40"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
              {dateFilter && (
                <button 
                  onClick={() => setDateFilter("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 p-1"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-y-3">
          <thead>
            <tr className="text-left text-xs font-bold text-slate-900 uppercase tracking-wider">
              <th className="px-6 py-4 bg-slate-50/50 rounded-l-2xl w-10 text-center">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[#4db6ac]" />
              </th>
              <th className="px-6 py-4 bg-slate-50/50">Subject & Description</th>
              <th className="px-6 py-4 bg-slate-50/50">Approver</th>
              <th className="px-6 py-4 bg-slate-50/50">Status</th>
              <th className="px-6 py-4 bg-slate-50/50">Created Date</th>
              <th className="px-6 py-4 bg-slate-50/50 rounded-r-2xl text-right">Details</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((req) => (
                <tr key={req.id} className="animate-row group bg-white hover:bg-slate-50/50 transition-colors cursor-pointer border-y border-slate-100" onClick={() => setSelectedRequest(req)}>
                  <td className="px-6 py-6 border-y border-l border-slate-100 rounded-l-2xl text-center">
                    <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[#4db6ac]" onClick={(e) => e.stopPropagation()} />
                  </td>
                  <td className="px-6 py-6 border-y border-slate-100 max-w-sm">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900 line-clamp-1">{req.subject}</span>
                      <span className="text-xs text-slate-400 font-bold mt-1 line-clamp-1 uppercase tracking-tight">{req.description}</span>
                    </div>
                  </td>
                  <td className="px-6 py-6 border-y border-slate-100">
                    {req.approver ? (
                      <Avatar 
                        name={req.approver.name} 
                        initials={req.approver.name.split(" ").map(n => n[0]).join(".")} 
                        color="bg-[#4db6ac]" 
                        src={req.approver.profileImage}
                      />
                    ) : (
                      <div className="flex items-center gap-3 text-slate-300 italic text-xs font-medium">
                        <Clock size={14} />
                        Awaiting Assign
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-6 border-y border-slate-100">
                    <StatusBadge status={req.status} />
                  </td>
                  <td className="px-6 py-6 border-y border-slate-100 text-sm font-medium text-slate-600">
                    {new Date(req.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-6 border-y border-r border-slate-100 rounded-r-2xl text-right">
                    <button className="p-2 text-slate-300 group-hover:text-[#4db6ac] transition-colors">
                      <ChevronRight size={20} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center text-slate-400 font-medium">
                  No requests found. Start by creating a new one!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 animate-row">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Showing <span className="text-slate-900">{(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredRequests.length)}</span> of {filteredRequests.length}
          </p>
          <div className="flex gap-2">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="p-2.5 bg-white border border-slate-100 rounded-xl disabled:opacity-30 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 rounded-xl text-xs font-bold transition-all ${
                    currentPage === i + 1
                      ? "bg-[#4db6ac] text-white shadow-lg shadow-[#4db6ac]/20"
                      : "bg-white border border-slate-100 text-slate-400 hover:bg-slate-50"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="p-2.5 bg-white border border-slate-100 rounded-xl disabled:opacity-30 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* DETAILS MODAL */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-[550px] p-8 rounded-[2.5rem] shadow-2xl relative border border-slate-100 overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#e8f5f4] blur-3xl opacity-50 -mr-16 -mt-16 pointer-events-none" />

            <button onClick={() => setSelectedRequest(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors z-10">
              <X size={20} />
            </button>

            <div className="mb-8 pr-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-2 leading-tight">{selectedRequest.subject}</h2>
              <StatusBadge status={selectedRequest.status} />
            </div>

            <div className="space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Description</label>
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 text-sm text-slate-600 leading-relaxed font-medium">
                  {selectedRequest.description}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Sender Info</label>
                  <div className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center font-bold shadow-sm">
                      {selectedRequest.creator?.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{selectedRequest.creator?.name}</p>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{selectedRequest.creator?.role}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Reviewer Info</label>
                  <div className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold shadow-sm">
                      {selectedRequest.approver?.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{selectedRequest.approver?.name || 'Awaiting Review'}</p>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{selectedRequest.approver?.role || '-'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {selectedRequest.status !== 'PENDING' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Reviewer Message</label>
                  <div className={`p-5 rounded-2xl border text-sm font-medium leading-relaxed ${
                    selectedRequest.status === 'APPROVED' ? 'bg-emerald-50 border-emerald-100 text-emerald-900' : 'bg-rose-50 border-rose-100 text-rose-900'
                  }`}>
                    {selectedRequest.message || "No message provided by the reviewer."}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Submitted: {new Date(selectedRequest.createdAt).toLocaleString()}
                </p>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-slate-800 transition-all shadow-lg shadow-black/10 active:scale-95"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        input[type="checkbox"] { accent-color: #4db6ac; }
        .line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}