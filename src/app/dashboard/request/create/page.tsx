"use client";

import { useState, useRef, useLayoutEffect } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import gsap from "gsap";
import { Send, Sparkles } from "lucide-react";

export default function CreateRequestPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ================= ANIMATION ================= */
  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(".animate-section", {
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out",
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleSubmit = async () => {
    if (!subject || !description) {
      return toast.error("All fields required ⚠️");
    }

    try {
      setIsSubmitting(true);
      await api.post("/requests", { subject, description });
      toast.success("Request submitted successfully ✅");
      setSubject("");
      setDescription("");
    } catch {
      toast.error("Error creating request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div ref={containerRef} className="max-w-3xl mx-auto py-4">

      {/* ================= HEADER ================= */}
      <div className="mb-10 animate-section">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-[#e8f5f4] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-[#2d6a4f]" />
          </div>
          <span className="text-[11px] font-black text-[#2d6a4f] uppercase tracking-widest">New Submission</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Create Request</h1>
      </div>

      {/* ================= FORM CARD ================= */}
      <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8 animate-section relative overflow-hidden">
        {/* Subtle Decorative Gradient */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#e8f5f4] blur-3xl opacity-50 -mr-16 -mt-16 pointer-events-none" />

        {/* Subject */}
        <div className="space-y-3">
          <label className="text-[11px] font-bold text-slate-900 uppercase tracking-wider ml-1">Request Subject</label>
          <input
            placeholder="What is this request about?"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full p-4 bg-slate-50 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-[#4db6ac]/20 border border-transparent focus:bg-white focus:border-slate-100 transition-all placeholder:text-slate-300"
          />
        </div>

        {/* Description */}
        <div className="space-y-3">
          <label className="text-[11px] font-bold text-slate-900 uppercase tracking-wider ml-1">Detail Description</label>
          <textarea
            placeholder="Provide a detailed explanation of your request..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            className="w-full p-4 bg-slate-50 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-[#4db6ac]/20 border border-transparent focus:bg-white focus:border-slate-100 transition-all resize-none placeholder:text-slate-300"
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-6 border-t border-slate-50 flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 py-4 bg-[#4db6ac] text-white rounded-2xl font-bold text-sm shadow-lg shadow-[#4db6ac]/20 hover:bg-[#3d968e] transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-3"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting...
              </span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Request
              </>
            )}
          </button>
          
          <button 
            onClick={() => window.history.back()}
            className="px-8 py-4 bg-slate-50 text-slate-400 rounded-2xl font-bold text-sm hover:bg-slate-100 transition-all"
          >
            Cancel
          </button>
        </div>

      </div>

      {/* HELPER INFO */}
      <div className="mt-8 p-6 bg-slate-50 rounded-4xl border border-slate-100 animate-section">
        <div className="flex gap-4 items-start">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm shrink-0 border border-slate-100">
            <span className="text-lg">💡</span>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 mb-1">Quick Tip</p>
            <p className="text-[11px] font-medium text-slate-500 leading-relaxed">
              Ensure your subject is concise and the description clearly outlines the purpose of your request. This helps reviewers process your submission more efficiently.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}