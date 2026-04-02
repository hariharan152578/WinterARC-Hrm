"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Mail, 
  Phone, 
  Search, 
  UserPlus, 
  CheckCircle2, 
  Sparkles, 
  RefreshCw,
  LayoutGrid,
  MoreVertical,
  Filter,
  Users
} from "lucide-react";
import { gsap } from "gsap";
import { getHierarchyUsers } from "@/services/user.service";

const LEVEL_COLORS: Record<string, string> = {
  ADMIN: "text-[#00A884] bg-[#E0F2F1]",
  MANAGER: "text-indigo-600 bg-indigo-50",
  TEAMLEAD: "text-violet-600 bg-violet-50",
  EMPLOYEE: "text-rose-600 bg-rose-50",
};

const ROLE_ORDER: Record<string, number> = {
  ADMIN: 1,
  MANAGER: 2,
  TEAMLEAD: 3,
  EMPLOYEE: 4,
};

export default function MembersTablePage() {
  const [members, setMembers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const tableRef = useRef<HTMLTableElement>(null);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const res = await getHierarchyUsers();
      setMembers(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && members.length > 0) {
      gsap.fromTo(
        ".member-row",
        { opacity: 0, y: 15 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.4, 
          stagger: 0.04, 
          ease: "power2.out" 
        }
      );
    }
  }, [loading, members, searchTerm]);

  const filteredMembers = members
    .filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.role.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => (ROLE_ORDER[a.role] || 99) - (ROLE_ORDER[b.role] || 99));

  return (
    <div className="min-h-screen bg-[#F9FBFB] p-6 md:p-10 space-y-8 max-w-[1700px] mx-auto text-slate-900 font-inter">
      
      {/* 
          REFINED HEADER SECTION (MATCHING IMAGE)
          - Horizontal alignment of all controls.
          - Compact stats in the center with dividers.
          - Search & Filter bar integrated on the right.
      */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-8">
        
        {/* Left: Title Block */}
        <div className="shrink-0">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users size={16} />
            </div>
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Team Directory</span>
          </div>
          <h1 className="text-3xl xl:text-4xl font-black text-gray-900 tracking-tight leading-[1.1] max-w-[280px]">
            Organization Members
          </h1>
        </div>

        {/* Center: Statistics Highlight */}
        <div className="flex items-center gap-10 xl:gap-16 border-l border-gray-100 pl-10 xl:pl-16">
          <div className="text-center">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] block mb-2">Total Headcount</span>
            <span className="text-3xl font-black text-gray-900 leading-none">{members.length}</span>
          </div>
          <div className="w-px h-10 bg-gray-100 hidden sm:block" />
          <div className="text-center">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] block mb-2">Active Leaders</span>
            <span className="text-3xl font-black text-[#00A884] leading-none">
              {members.filter(m => ["ADMIN", "MANAGER", "TEAMLEAD"].includes(m.role)).length}
            </span>
          </div>
        </div>

        {/* Right: Actions & Slim Search Bar */}
        <div className="flex items-center gap-4 flex-1 justify-end">
           {/* Refresh Icon */}
           <button 
             onClick={loadMembers}
             className="w-10 h-10 shrink-0 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-400 hover:text-emerald-600 transition-all active:scale-95 group"
           >
              <RefreshCw size={18} className={loading ? "animate-spin text-emerald-600" : "group-hover:rotate-180 transition-transform duration-500"} />
           </button>

           {/* Integrated Search & Filter Pill */}
           <div className="flex items-center bg-white border border-gray-100 rounded-2xl shadow-sm p-1 max-w-[400px] w-full group focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
              <div className="relative flex-1 flex items-center pl-4">
                 <input
                   type="text"
                   placeholder="Search by name, role..."
                   className="w-full py-2.5 bg-transparent text-sm font-bold text-gray-700 outline-none placeholder:text-gray-300"
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                 />
                 <Search size={16} className="text-gray-300 ml-2 mr-1" />
              </div>
              <div className="w-px h-6 bg-gray-100 mx-1" />
              <button className="p-2.5 text-gray-400 hover:text-emerald-600 transition-colors">
                 <Filter size={18} />
              </button>
           </div>
        </div>
      </div>

      {/* PREMIUM TABLE SECTION */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden p-2">
        <div className="overflow-x-auto">
          <table ref={tableRef} className="w-full border-separate border-spacing-y-3 px-4">
            <thead>
              <tr className="text-slate-400 capitalize text-xs">
                <th className="px-6 py-4 font-bold text-left tracking-widest uppercase text-[10px]">Member Details</th>
                <th className="px-6 py-4 font-bold text-left tracking-widest uppercase text-[10px]">Organization Role</th>
                <th className="px-6 py-4 font-bold text-left tracking-widest uppercase text-[10px]">Direct Contact</th>
                <th className="px-6 py-4 font-bold text-center tracking-widest uppercase text-[10px]">Status</th>
                <th className="px-6 py-4 font-bold text-right tracking-widest uppercase text-[10px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-8 bg-slate-50 rounded-2xl"></td>
                  </tr>
                ))
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center gap-4 text-slate-300">
                      <Search size={48} strokeWidth={1} />
                      <p className="font-bold text-sm tracking-widest uppercase italic uppercase tracking-widest">No matching members</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr key={member.id} className="member-row bg-white hover:bg-slate-50/30 transition-colors group">
                    <td className="px-6 py-4 border-y border-l border-slate-100 rounded-l-2xl">
                      <div className="flex items-center gap-4">
                        <div className="relative shrink-0">
                          <img
                            src={member.profileImage ? `${process.env.NEXT_PUBLIC_IMAGE_API_URL}/${member.profileImage}` : `https://ui-avatars.com/api/?name=${member.name}&background=F9FBFB&color=00A884&size=128&bold=true`}
                            className="w-12 h-12 rounded-2xl object-cover ring-2 ring-white shadow-sm transition-transform duration-500 group-hover:scale-110"
                            alt={member.name}
                          />
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center border border-gray-100 shadow-sm">
                            <div className="w-2 h-2 bg-[#00A884] rounded-full animate-pulse" />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 group-hover:text-[#00A884] transition-colors">{member.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                            {member.department || "Organization Unit"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 border-y border-slate-100">
                      <div className={`inline-flex items-center px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${LEVEL_COLORS[member.role] || 'bg-gray-100 text-gray-500'}`}>
                        {member.role}
                      </div>
                    </td>

                    <td className="px-6 py-4 border-y border-slate-100">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                          <Mail size={14} className="text-gray-300" />
                          {member.email || `${member.name.toLowerCase().replace(' ', '.')}@winterarc.com`}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          <Phone size={12} className="text-gray-300" />
                          +1 (555) 001-{Math.floor(Math.random() * 9000) + 1000}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 border-y border-slate-100 text-center">
                      <span className="inline-flex items-center gap-1.5 bg-[#E0F2F1] text-[#00A884] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-50">
                        <CheckCircle2 size={12} />
                        Active
                      </span>
                    </td>

                    <td className="px-6 py-4 border-y border-r border-slate-100 rounded-r-2xl text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2.5 text-gray-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all active:scale-90">
                          <Mail size={18} />
                        </button>
                        <button className="p-2.5 text-gray-300 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all active:scale-90">
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}