"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Users, Network, Sparkles } from "lucide-react";

export default function OrganizationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const navLinks = [
    { name: "Hierarchy", href: "/dashboard/organization/hierarchy", icon: Network },
    { name: "Members List", href: "/dashboard/organization/members", icon: Users },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#F9FBFB]">
      
      {/* 
          NEW DESIGN: Floating Module Controller 
          - Removed 'z-index' and full-width borders as requested.
          - Re-styled as a premium glassmorphism floating pill.
      */}
      <div className="w-full pt-6 px-4 md:px-10 flex justify-center">
        <nav className="inline-flex items-center gap-6 px-8 py-3 bg-white/70 backdrop-blur-2xl rounded-[2.5rem] border border-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] transition-all hover:shadow-[0_25px_60px_-12px_rgba(0,0,0,0.08)]">
          
          {/* Module Identity (Condensed) */}
          <div className="flex items-center gap-3 pr-6 border-r border-gray-100">
             <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center relative overflow-hidden group">
                <LayoutGrid size={18} className="relative z-10 transition-transform group-hover:rotate-12" />
             </div>
             <div className="flex flex-col">
                <h2 className="text-[11px] font-black text-gray-900 uppercase tracking-widest leading-none">Organization</h2>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Enterprise</span>
             </div>
          </div>

          {/* Navigation Items (Pills) */}
          <div className="flex items-center gap-2">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300
                    ${active 
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100 scale-[1.05]" 
                      : "text-gray-400 hover:text-indigo-600 hover:bg-indigo-50/50"}
                  `}
                >
                  <Icon size={14} className={active ? "text-white" : "text-gray-300"} />
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Status Badge (Subtle) */}
          <div className="hidden lg:flex items-center gap-2 pl-6 border-l border-gray-100">
             <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
             <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Active System</p>
          </div>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}