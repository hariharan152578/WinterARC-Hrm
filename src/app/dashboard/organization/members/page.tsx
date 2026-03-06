"use client";

import React, { useState, useEffect } from "react";
import { Mail, Phone, MoreVertical, Search, UserPlus, CheckCircle2, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getHierarchyUsers } from "@/services/user.service";

const LEVEL_COLORS: Record<string, string> = {
  ADMIN: "#FF3B3B",
  MANAGER: "#82C91E",
  TEAMLEAD: "#3BC9DB",
  EMPLOYEE: "#FFA94D",
};

const ROLE_ORDER: Record<string, number> = {
  ADMIN: 1,
  MANAGER: 2,
  TEAMLEAD: 3,
  EMPLOYEE: 4,
};

// --- Sub-Component: Member Portrait Card ---
const MemberPortraitCard = ({ member }: { member: any }) => {
  const [isHovered, setIsHovered] = useState(false);
  const levelAccent = LEVEL_COLORS[member.role] || "#ADB5BD";

  // Logic for status colors
  const isActive = member.status === "Active";
  const statusColor = isActive ? "#22C55E" : "#94A3B8"; // Green vs Gray

  return (
    <motion.div
      className="bg-white rounded-[32px] p-2 shadow-sm border border-slate-100 relative overflow-hidden cursor-pointer group"
      style={{ height: "540px", width: "100%" }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* 1. FULL PORTRAIT IMAGE SECTION */}
      <div className="w-full h-[78%] rounded-[28px] overflow-hidden relative bg-slate-50">
        <img
          src={member.profileImage ? `http://localhost:5000/${member.profileImage}` : `https://ui-avatars.com/api/?name=${member.name}&background=fff&color=${levelAccent.replace('#', '')}`}
          className="w-full h-full object-cover transition-transform duration-700 ease-out"
          style={{ transform: isHovered ? 'scale(1.1)' : 'scale(1)' }}
          alt="profile"
        />

        {/* --- NEW STATUS TAG --- */}
        <div
          className="absolute top-4 right-4 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm border border-white/20 z-20"
          style={{ backgroundColor: "rgba(255, 255, 255, 0.85)" }}
        >
          {/* Color Signal Dot */}
          <div
            className={`w-2 h-2 rounded-full ${isActive ? 'animate-pulse' : ''}`}
            style={{ backgroundColor: statusColor }}
          />
          <span className="text-[9px] font-black uppercase tracking-wider" style={{ color: "#1e293b" }}>
            {member.status || "Inactive"}
          </span>
        </div>
      </div>

      {/* 2. CONTENT AREA */}
      <div className="p-5 flex flex-col justify-between h-[22%] relative">
        <div className="relative z-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-black text-slate-900 text-lg leading-tight flex items-center gap-2 truncate pr-6">
              {member.name}
              {isActive && <CheckCircle2 size={16} className="text-blue-500 flex-shrink-0" />}
            </h3>
            <button className="text-slate-300 hover:text-slate-500 flex-shrink-0"><MoreVertical size={18} /></button>
          </div>
          <p className="text-xs font-bold text-slate-400 leading-none">
            {member.department || "Organization Unit"}
          </p>
        </div>

        {/* 3. DYNAMIC POSITION FOOTER */}
        <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-50">
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-tight">Position</span>
            <span className="text-sm font-black uppercase leading-tight" style={{ color: levelAccent }}>{member.role}</span>
          </div>
        </div>

        {/* 4. THE GLASSMORPHISM HOVER OVERLAY */}
        <AnimatePresence mode="wait">
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              className="absolute inset-0 z-10 bg-white/60 backdrop-blur-xl p-6 flex flex-col items-center justify-center text-center"
            >
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-[3px] mb-2">Member Details</span>
              <h4 className="text-2xl font-black mb-6 tracking-tighter" style={{ color: levelAccent }}>{member.role}</h4>
              <button className="w-full py-3.5 bg-slate-900 text-white rounded-2xl font-black text-xs shadow-xl transition-all hover:bg-indigo-600 active:scale-95">
                View Profile
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// --- Main Page Component ---
export default function MembersPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadMembers = async () => {
      try {
        const res = await getHierarchyUsers();
        setMembers(res.data);
      } catch (err) { console.error(err); }
    };
    loadMembers();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-10">
      <div className="max-w-[1400px] mx-auto">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 px-2 gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Organization</h1>
            <p className="text-slate-400 font-bold uppercase text-[11px] tracking-widest">Team Members Gallery</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-center">
            {/* Search Bar */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search gallery..."
                className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-100 rounded-2xl text-sm font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <button className="bg-blue-600 text-white px-8 py-4 rounded-3xl font-black text-sm shadow-2xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2 whitespace-nowrap">
              <UserPlus size={18} /> Add New Member
            </button>
          </div>
        </div>

        {/* THE GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {members
            .filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .sort((a, b) => (ROLE_ORDER[a.role] || 99) - (ROLE_ORDER[b.role] || 99))
            .map(member => (
              <MemberPortraitCard key={member.id} member={member} />
            ))}
        </div>

        {/* Empty State */}
        {members.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Search size={32} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-black text-slate-800">No members found</h3>
            <p className="text-slate-400 font-bold text-sm">Try adjusting your search terms</p>
          </div>
        )}
      </div>
    </div>
  );
}