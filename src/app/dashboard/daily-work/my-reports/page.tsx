"use client";

import { useEffect, useState, useRef } from "react";
import { getMyReports } from "@/services/dailywork.service";
import { 
  Search, 
  Calendar, 
  ChevronDown, 
  Eye, 
  FileText, 
  Filter,
  Clock,
  ArrowRight,
  MoreHorizontal
} from "lucide-react";
import gsap from "gsap";
import ReportDetailsModal from "../components/ReportDetailsModal";
import { toast } from "react-hot-toast";

export default function MyReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const data = await getMyReports();
      setReports(data || []);
    } catch (err) {
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
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
    const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = dateFilter ? new Date(r.createdAt).toLocaleDateString('en-CA') === dateFilter : true;
    return matchesSearch && matchesDate;
  });

  const reportsToday = reports.filter(r => 
    new Date(r.createdAt).toDateString() === new Date().toDateString()
  ).length;

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
      <div className="w-10 h-10 border-4 border-[#4db6ac] border-t-transparent rounded-full animate-spin" />
      <p className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Syncing Pulse...</p>
    </div>
  );

  return (
    <div ref={containerRef} className="min-h-screen bg-white p-6 md:p-10 space-y-8 max-w-[1600px] mx-auto text-slate-900">
      
      {/* HEADER (Mimicking Task UI) */}
      <div className="animate-section flex flex-col md:flex-row md:items-end justify-between gap-6 relative mb-8">
        <div className="relative z-10">
          <h2 className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
            Workspace Overview
          </h2>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            My Daily Reports
          </h1>
        </div>
        
        <div className="flex items-center gap-6 md:gap-12 relative z-10 pb-1">
          <div className="text-center">
            <span className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">Today</span>
            <span className="text-2xl md:text-3xl font-black text-slate-900">{reportsToday}</span>
          </div>
          <div className="w-px h-12 bg-slate-200 hidden md:block"></div>
          <div className="text-center">
            <span className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">Active Streak</span>
            <span className="text-2xl md:text-3xl font-black text-slate-900">5d</span>
          </div>
          <div className="w-px h-12 bg-slate-200 hidden md:block"></div>
          <div className="text-center">
            <span className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">Total Logs</span>
            <span className="text-2xl md:text-3xl font-black text-slate-900">{reports.length}</span>
          </div>
        </div>
      </div>

      {/* FILTER BAR TOP (Mimicking Task UI) */}
      <div className="animate-section flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1 w-full bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row overflow-hidden divide-y md:divide-y-0 md:divide-x divide-slate-100">
          
          {/* Search all */}
          <div className="flex-1 flex items-center bg-white px-5 py-3.5 relative">
            <input 
              type="text" 
              placeholder="Search all reports" 
              className="w-full bg-transparent text-slate-600 placeholder:text-slate-400 text-[15px] focus:outline-none font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <ChevronDown className="absolute right-5 text-slate-400 pointer-events-none" size={16} />
          </div>

          {/* Type Filter (Placeholder for consistency) */}
          <div className="flex-1 flex items-center bg-white px-5 py-3.5 relative">
            <select 
              className="w-full bg-transparent text-slate-600 appearance-none text-[15px] focus:outline-none cursor-pointer font-medium"
            >
              <option value="">Report Type (All)</option>
              <option value="DAILY">Daily Summary</option>
              <option value="MILESTONE">Milestone</option>
            </select>
            <ChevronDown className="absolute right-5 text-slate-400 pointer-events-none" size={16} />
          </div>

          {/* Date */}
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
              <th className="px-6 py-4 bg-slate-50/50 rounded-l-2xl w-24 text-center">Ref ID</th>
              <th className="px-6 py-4 bg-slate-50/50">Report Summary</th>
              <th className="px-6 py-4 bg-slate-50/50">Submission Time</th>
              <th className="px-6 py-4 bg-slate-50/50 text-center">Attachments</th>
              <th className="px-6 py-4 bg-slate-50/50 rounded-r-2xl w-20 text-center">View</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.length > 0 ? (
              filteredReports.map((report, idx) => (
                <tr key={report.id} className="report-row bg-white hover:bg-slate-50/50 transition-colors cursor-pointer group">
                  <td className="px-6 py-6 border-y border-l border-slate-100 rounded-l-2xl text-center">
                    <span className="text-xs font-bold text-slate-400">#{idx + 1}</span>
                  </td>
                  
                  {/* Summary Column */}
                  <td className="px-6 py-6 border-y border-slate-100">
                    <div className="flex flex-col gap-1 w-full min-w-[250px]">
                      <span className="font-bold text-slate-900 text-sm group-hover:text-[#4db6ac] transition-colors">{report.title}</span>
                      <p className="text-[11px] text-slate-400 font-medium truncate max-w-[400px]">
                        {report.description || "No preview available..."}
                      </p>
                    </div>
                  </td>

                  {/* Submission Time Column */}
                  <td className="px-6 py-6 border-y border-slate-100 min-w-[150px]">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-700">
                        {new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-0.5">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </td>

                  {/* Attachments Column */}
                  <td className="px-6 py-6 border-y border-slate-100 text-center">
                    {report.files?.length > 0 ? (
                      <div className="inline-flex items-center gap-1.5 bg-[#e8f5f4] text-[#4db6ac] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                         <FileText size={12} />
                         {report.files.length} Files
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">None</span>
                    )}
                  </td>
                  
                  {/* View Action Column */}
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
                  No reports found for the selected criteria.
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