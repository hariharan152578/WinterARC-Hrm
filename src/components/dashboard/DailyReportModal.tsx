"use client";

import { useState } from "react";
import { X, Send, Paperclip, ClipboardList, Briefcase, Zap, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ReportService } from "@/services/report.service";
import { toast } from "react-hot-toast";

interface DailyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DailyReportModal({ isOpen, onClose, onSuccess }: DailyReportModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error("Please provide both a title and description.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      files.forEach((file) => formData.append("files", file));
      
      // Default message types for simple implementation
      formData.append("messageTypes", "TEXT");

      await ReportService.submitReport(formData);
      toast.success("Daily report submitted successfully!");
      onSuccess();
    } catch (err: any) {
      console.error("Report submission failed", err);
      toast.error(err.response?.data?.message || "Failed to submit report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-150 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]"
          >
            {/* HEADER */}
            <div className="p-8 pb-4 flex items-center justify-between border-b border-slate-50 bg-slate-50/30">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                  <ClipboardList size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Daily Work Pulse</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Logout Requirement</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-3 hover:bg-white rounded-2xl text-slate-400 hover:text-slate-600 transition-all border border-transparent hover:border-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
              <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs font-bold text-amber-700 leading-relaxed">
                  Almost there! Please summarize your accomplishments for today before logging out. Your report will be sent to your supervisor.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Zap size={10} className="text-indigo-500" />
                  Primary Achievement
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Finalized Authentication Module & Fixed Dashboard Lints"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:bg-white focus:border-indigo-400 transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Briefcase size={10} className="text-slate-400" />
                  Work Breakdown
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your progress, hurdles, and next steps..."
                  rows={5}
                  className="w-full bg-slate-50 border border-slate-100 rounded-3xl px-5 py-4 text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:bg-white focus:border-indigo-400 transition-all leading-relaxed"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Paperclip size={10} className="text-slate-400" />
                  Visual Proof / Documentation
                </label>
                <div className="relative group/upload">
                  <input
                    type="file"
                    multiple
                    onChange={(e) => setFiles(Array.from(e.target.files || []))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="border-2 border-dashed border-slate-200 group-hover/upload:border-indigo-400 rounded-2xl p-6 flex flex-col items-center justify-center transition-all bg-slate-50/50 group-hover/upload:bg-white">
                    <Paperclip className="w-8 h-8 text-slate-300 mb-2 group-hover/upload:text-indigo-400 group-hover/upload:scale-110 transition-all" />
                    <p className="text-xs font-bold text-slate-500">
                      {files.length > 0 ? `${files.length} files selected` : "Drag and drop or click to upload proof"}
                    </p>
                  </div>
                </div>
              </div>
            </form>

            {/* FOOTER */}
            <div className="p-8 pt-4 border-t border-slate-50 bg-slate-50/30 flex items-center gap-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-4 text-sm font-black text-slate-400 hover:text-slate-600 transition-all uppercase tracking-widest"
              >
                Go Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-2 py-4 bg-indigo-600 hover:bg-slate-900 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-indigo-100 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? (
                   <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send size={16} />
                    Submit & Logout
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
