"use client";

import { useState, useEffect, useRef, useLayoutEffect } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import gsap from "gsap";

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
        y: 30,
        opacity: 0,
        duration: 0.6,
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
    <div ref={containerRef} className="space-y-8">

      {/* ================= HEADER ================= */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm animate-section">
        <h2 className="text-sm text-gray-400">New Submission</h2>
        <h1 className="text-3xl font-bold mt-1">Create Request</h1>
      </div>

      {/* ================= FORM CARD ================= */}
      <div className="bg-white p-10 rounded-[2.5rem] shadow-sm space-y-6 animate-section">

        {/* Subject */}
        <div className="space-y-2">
          <label className="text-xs text-gray-400 ml-1">Subject</label>
          <input
            placeholder="Enter request subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full p-4 bg-gray-50 rounded-[1.5rem] text-sm outline-none focus:ring-2 focus:ring-black/10 transition"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-xs text-gray-400 ml-1">Description</label>
          <textarea
            placeholder="Describe your request in detail..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="w-full p-4 bg-gray-50 rounded-[1.5rem] text-sm outline-none focus:ring-2 focus:ring-black/10 transition resize-none"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full py-4 bg-black text-white rounded-full transition-transform hover:scale-[1.02] disabled:opacity-60"
          >
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </button>
        </div>

      </div>
    </div>
  );
}