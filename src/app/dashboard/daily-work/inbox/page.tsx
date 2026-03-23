"use client";

import { useEffect, useState, useRef } from "react";
import { getInboxReports } from "@/services/dailywork.service";
import { getMyTeam } from "@/services/user.service";
import {
  Search,
  Calendar,
  ChevronDown,
  Eye,
  FileText,
  Filter,
  Users,
  Clock,
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import gsap from "gsap";
import ReportDetailsModal from "../components/ReportDetailsModal";
import { toast } from "react-hot-toast";

export default function InboxPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadReports();
    loadMembers();
  }, []);

  const loadReports = async () => {
    try {
      const data = await getInboxReports();
      setReports(data || []);
    } catch (err) {
      toast.error("Failed to load team reports");
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async () => {
    try {
      const response = await getMyTeam();
      setMembers(response.data || []);
    } catch (err) {
      console.error("Failed to load members", err);
    }
  };

  useEffect(() => {
    if (!loading && containerRef.current) {
      gsap.from(".animate-section", {
        y: 20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out",
      });
      gsap.from(".report-row", {
        y: 10,
        opacity: 0,
        duration: 0.4,
        stagger: 0.05,
        ease: "power1.out",
        delay: 0.2
      });
    }
  }, [loading]);

  const filteredReports = reports.filter((r) => {
    const nameMatches = r.sender?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const titleMatches = r.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearch = nameMatches || titleMatches;
    const matchesDate = dateFilter ? new Date(r.createdAt).toLocaleDateString('en-CA') === dateFilter : true;
    const matchesMember = selectedMemberId ? String(r.submittedBy) === selectedMemberId : true;
    return matchesSearch && matchesDate && matchesMember;
  });

  const reportsToday = reports.filter(r =>
    new Date(r.createdAt).toDateString() === new Date().toDateString()
  ).length;

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
      <div className="w-10 h-10 border-4 border-[#4db6ac] border-t-transparent rounded-full animate-spin" />
      <p className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Syncing Team Pulse...</p>
    </div>
  );

  return (
    <div ref={containerRef} className="min-h-screen bg-white p-6 md:p-10 space-y-8 max-w-[1600px] mx-auto text-slate-900">

      {/* HEADER SECTION (Mimicking Task UI) */}
      <div className="animate-section flex flex-col md:flex-row md:items-end justify-between gap-6 relative mb-8">
        <div className="relative z-10">
          <h2 className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
            Supervisor Overview
          </h2>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Team Daily Reports
          </h1>
        </div>

        <div className="flex items-center gap-6 md:gap-12 relative z-10 pb-1">
          <div className="text-center">
            <span className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">Received Today</span>
            <span className="text-2xl md:text-3xl font-black text-slate-900">{reportsToday}</span>
          </div>
          <div className="w-px h-12 bg-slate-200 hidden md:block"></div>
          <div className="text-center">
            <span className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">Pending Syncs</span>
            <span className="text-2xl md:text-3xl font-black text-slate-900">0</span>
          </div>
          <div className="w-px h-12 bg-slate-200 hidden md:block"></div>
          <div className="text-center">
            <span className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">Compliance</span>
            <span className="text-2xl md:text-3xl font-black text-slate-900">100%</span>
          </div>
        </div>
      </div>

      {/* FILTER BAR TOP (Mimicking Task UI) */}
      <div className="animate-section flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1 w-full bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row overflow-hidden divide-y md:divide-y-0 md:divide-x divide-slate-100">

          <div className="flex-1 flex items-center bg-white px-5 py-3.5 relative">
            <input
              type="text"
              placeholder="Search by member or report title..."
              className="w-full bg-transparent text-slate-600 placeholder:text-slate-400 text-[15px] focus:outline-none font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <ChevronDown className="absolute right-5 text-slate-400 pointer-events-none" size={16} />
          </div>

          <div className="flex-1 flex items-center bg-white px-5 py-3.5 relative">
            <div className="flex items-center gap-2 w-full text-slate-600">
              <Users size={16} className="text-slate-400" />
              <select
                className="w-full bg-transparent appearance-none text-[15px] focus:outline-none cursor-pointer font-medium"
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
              >
                <option value="">All Team Members</option>
                {members.map(member => (
                  <option key={member.id} value={member.id}>{member.name} ({member.role})</option>
                ))}
              </select>
            </div>
            <ChevronDown className="absolute right-5 text-slate-400 pointer-events-none" size={16} />
          </div>

          <div className="flex-1 flex items-center bg-white px-5 py-3.5 relative">
            <input
              type="date"
              className="w-full bg-transparent text-slate-600 placeholder:text-slate-400 text-[15px] focus:outline-none cursor-pointer font-medium"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* TABLE SECTION (Mimicking Task UI) */}
      <div className="animate-section mt-10 overflow-x-auto">
        <table className="w-full border-separate border-spacing-y-3">
          <thead>
            <tr className="text-left text-xs font-bold text-slate-900 uppercase tracking-wider">
              <th className="px-6 py-4 bg-slate-50/50 rounded-l-2xl">Member</th>
              <th className="px-6 py-4 bg-slate-50/50">Work Pulse Summary</th>
              <th className="px-6 py-4 bg-slate-50/50">Submission</th>
              <th className="px-6 py-4 bg-slate-50/50 text-center">Documentation</th>
              <th className="px-6 py-4 bg-slate-50/50 rounded-r-2xl w-20 text-center">View</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.length > 0 ? (
              filteredReports.map((report) => (
                <tr key={report.id} className="report-row bg-white hover:bg-slate-50/50 transition-colors cursor-pointer group">
                  <td className="px-6 py-6 border-y border-l border-slate-100 rounded-l-2xl min-w-[200px]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl overflow-hidden shadow-xs ring-2 ring-white group-hover:ring-[#4db6ac]/20 transition-all text-[#4db6ac] flex items-center justify-center">
                        <img
                          src={report.sender?.profileImage ? `http://localhost:5000/${report.sender.profileImage}` : `https://res.cloudinary.com/dlb52kdyx/image/upload/v1774179997/0185e4c0175af1347a02a9a814ede0e2-removebg-preview_b2rhgy.png`}
                          alt={report.sender?.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 group-hover:text-[#4db6ac] transition-colors">{report.sender?.name || "System User"}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{report.sender?.role || "EMPLOYEE"}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-6 border-y border-slate-100">
                    <div className="flex flex-col gap-1 w-full min-w-[250px]">
                      <span className="font-bold text-slate-900 text-sm">{report.title}</span>
                      <p className="text-[11px] text-slate-400 font-medium truncate max-w-[350px]">
                        {report.description || "No preview available..."}
                      </p>
                    </div>
                  </td>

                  <td className="px-6 py-6 border-y border-slate-100">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-700">
                        {new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-0.5">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-6 border-y border-slate-100 text-center">
                    {report.files?.length > 0 ? (
                      <div className="inline-flex items-center gap-1.5 bg-[#e8f5f4] text-[#4db6ac] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        <FileText size={12} />
                        {report.files.length} Assets
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">No Proof</span>
                    )}
                  </td>

                  <td className="px-6 py-6 border-y border-r border-slate-100 rounded-r-2xl text-center">
                    <button
                      onClick={() => setSelectedReport(report)}
                      className="p-2 text-slate-400 hover:text-[#4db6ac] hover:bg-[#e8f5f4] rounded-xl transition-colors mx-auto block relative z-20"
                    >
                      <Eye size={20} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center text-slate-400 font-medium">
                  No team reports found for the selected criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* DETAILS MODAL */}
      <ReportDetailsModal
        report={selectedReport}
        isOpen={!!selectedReport}
        onClose={() => setSelectedReport(null)}
      />
    </div>
  );
}