"use client";

import { X, Calendar, Eye, FileText, User, Zap, Download, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ReportDetailsModalProps {
  report: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function ReportDetailsModal({ report, isOpen, onClose }: ReportDetailsModalProps) {
  if (!report) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-200 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="bg-white w-full max-w-[500px] p-8 rounded-4xl shadow-2xl relative border border-slate-100 flex flex-col max-h-[90vh]"
          >
            {/* CLOSE BUTTON */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors bg-slate-100 hover:bg-slate-200 p-2 rounded-full"
            >
              <X size={18} />
            </button>

            {/* HEADER BADGE */}
            <div className="bg-[#e8f5f4] text-[#4db6ac] text-[10px] font-bold px-3 py-1 rounded-full w-fit mb-4 uppercase tracking-wider">
              Daily Pulse Details
            </div>

            {/* TITLE */}
            <h2 className="text-2xl font-bold mb-4 text-slate-900 leading-tight pr-8">{report.title}</h2>

            {/* SCROLLABLE CONTENT (Mimicking Task Details scroll) */}
            <div className="flex-1 overflow-y-auto pr-2 -mr-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent space-y-8">

              {/* META INFO (Similar to Task Details) */}
              <div className="flex items-center gap-6 text-xs font-medium text-slate-500 mb-6 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                  <Calendar size={14} className="text-[#4db6ac]" />
                  <span className="pt-0.5">{new Date(report.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center">
                    <img
                      src={report.sender?.profileImage || report.receiver?.profileImage
                        ? `${process.env.NEXT_PUBLIC_IMAGE_API_URL}/${report.sender?.profileImage || report.receiver?.profileImage}`
                        : `https://res.cloudinary.com/dlb52kdyx/image/upload/v1774179997/0185e4c0175af1347a02a9a814ede0e2-removebg-preview_b2rhgy.png`}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-slate-900 font-bold">{report.sender?.name || report.receiver?.name || "System User"}</span>
                </div>
              </div>

              {/* DESCRIPTION BOX (Same styling as Task Description) */}
              <div className="space-y-3">
                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Daily Breakdown</h3>
                <div className="bg-slate-50 p-5 rounded-2xl text-sm text-slate-600 leading-relaxed border border-slate-100 min-h-[120px] shadow-sm shadow-slate-100/50 whitespace-pre-wrap">
                  {report.description || "No detailed breakdown provided."}
                </div>
              </div>

              {/* ATTACHMENTS (Same styling as Task Attachments) */}
              {report.files && report.files.length > 0 && (
                <div className="space-y-3 mb-8">
                  <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Pulse Artifacts ({report.files.length})</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {report.files.map((file: string, index: number) => {
                      const fileName = file.split('/').pop() || `Attachment ${index + 1}`;
                      const fileUrl = `${process.env.NEXT_PUBLIC_IMAGE_API_URL}/${file}`;
                      return (
                        <a
                          key={index}
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl hover:bg-[#e8f5f4] hover:border-[#4db6ac]/30 transition-all group/filelink"
                        >
                          <div className="p-2 bg-white rounded-lg shadow-sm group-hover/filelink:text-[#4db6ac]">
                            <Eye size={14} />
                          </div>
                          <span className="text-xs font-bold text-slate-600 group-hover/filelink:text-slate-900 truncate flex-1">
                            {fileName}
                          </span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* FOOTER ACTION */}
            <div className="mt-8 pt-6 border-t border-slate-50">
              <button
                onClick={onClose}
                className="w-full py-3.5 bg-slate-50 text-slate-400 hover:bg-slate-100 rounded-full font-black text-[11px] uppercase tracking-widest transition-all mt-2"
              >
                CLOSE PULSE VIEW
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
