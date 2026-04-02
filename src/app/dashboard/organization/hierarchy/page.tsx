"use client";

import React, { useEffect, useState, useRef } from "react";
import { getHierarchyUsers } from "@/services/user.service";
import { 
  Users, 
  Search, 
  Sparkles, 
  RefreshCw, 
  Maximize2, 
  MousePointer2, 
  ChevronRight,
  Briefcase,
  Mail,
  Phone,
  Plus,
  Minus
} from "lucide-react";
import { gsap } from "gsap";
import { useAuth } from "@/context/AuthContext";

// --- Interfaces ---
interface User {
  id: string;
  name: string;
  role: string;
  createdBy: string | null;
  department?: string;
  profileImage?: string;
  email?: string;
  phone?: string;
}

interface DeptNode {
  id: string;
  name: string;
  headName: string;
  headRole: string;
  email: string;
  phone: string;
  employeeCount: number;
  image: string;
  subDepartments: DeptNode[];
}

// --- Premium Card Component ---
const ModernDeptCard = ({ node, level }: { node: DeptNode, level: number }) => {
  const getLevelColor = (l: number) => {
    const colors = ["#00A884", "#4F46E5", "#7C3AED", "#DB2777"];
    return colors[l % colors.length];
  };

  const brandColor = getLevelColor(level);

  return (
    <div
      className="dept-card group bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 p-2 min-w-[340px] relative z-20"
      style={{ willChange: "transform" }}
    >
      <div className="flex items-center gap-5 p-4 relative overflow-hidden">
        {/* Background Accent */}
        <div 
          className="absolute top-0 right-0 w-32 h-32 opacity-[0.03] -mr-16 -mt-16 rounded-full transition-transform duration-700 group-hover:scale-150"
          style={{ backgroundColor: brandColor }}
        />

        {/* Image Section */}
        <div className="relative shrink-0">
          <div className="w-20 h-24 rounded-2xl overflow-hidden border-2 border-white shadow-lg ring-1 ring-gray-100 relative z-10">
            <img
              src={node.image || `https://ui-avatars.com/api/?name=${node.headName}&background=F9FBFB&color=${brandColor.replace('#', '')}&size=128&font-size=0.33&bold=true`}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              alt={node.headName}
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${node.headName}&background=F9FBFB&color=${brandColor.replace('#', '')}&size=128&font-size=0.33&bold=true`;
              }}
            />
          </div>
          <div 
            className="absolute -bottom-2 -left-2 w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-lg z-20 transition-transform group-hover:rotate-12"
            style={{ backgroundColor: brandColor }}
          >
            <Briefcase size={14} />
          </div>
        </div>

        {/* Info Section */}
        <div className="flex-1 min-w-0 space-y-1.5 relative z-10">
          <div className="flex items-center gap-2">
             <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] leading-none">
              {node.name || "Corporate"}
            </span>
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: brandColor }} />
          </div>
          
          <h3 className="text-lg font-black text-gray-900 leading-tight truncate group-hover:text-[#00A884] transition-colors">
            {node.headName}
          </h3>
          
          <div className="inline-flex items-center px-2.5 py-1 bg-gray-50 text-gray-500 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-gray-100 group-hover:bg-white transition-colors">
            {node.headRole}
          </div>

          <div className="pt-2 flex flex-col gap-1">
             <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                <Mail size={12} className="text-gray-300" />
                <span className="truncate">{node.email}</span>
             </div>
             <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                <Phone size={12} className="text-gray-300" />
                <span>{node.phone}</span>
             </div>
          </div>
        </div>
      </div>
      
      {/* Footer / Stats */}
      {node.subDepartments.length > 0 && (
        <div className="px-6 py-3 border-t border-gray-50 bg-[#F9FBFB]/50 rounded-b-[2.5rem] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={12} className="text-[#00A884]" />
            <span className="text-[10px] font-black text-gray-900">{node.employeeCount} Direct Reports</span>
          </div>
          <ChevronRight size={14} className="text-gray-300 group-hover:translate-x-1 transition-transform" />
        </div>
      )}
    </div>
  );
};

// --- Main Tree Component ---
export default function OrganizationHierarchy() {
  const { user } = useAuth();
  const [tree, setTree] = useState<DeptNode | null>(null);
  const [loading, setLoading] = useState(true);

  // --- PANNING & ZOOM STATE ---
  const [isDragging, setIsDragging] = useState(false);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    const isCard = (e.target as HTMLElement).closest('.dept-card');
    if (!isCard) {
      setIsDragging(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - lastMousePos.x;
    const deltaY = e.clientY - lastMousePos.y;
    setTranslate(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => setIsDragging(false);

  // --- ZOOM HANDLERS ---
  const zoomIn = () => setScale(prev => Math.min(prev + 0.1, 2));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.3));

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.05 : 0.05;
      setScale(prev => Math.min(Math.max(prev + delta, 0.3), 2));
    }
  };

  const resetPosition = () => {
    gsap.to(canvasRef.current, {
      duration: 1,
      x: 0,
      y: 0,
      scale: 1,
      ease: "power3.inOut",
      onComplete: () => {
        setTranslate({ x: 0, y: 0 });
        setScale(1);
      }
    });
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await getHierarchyUsers();
        const users: User[] = res.data;
        const root = users.find(u => u.role === "ADMIN") || users[0];
        if (root) setTree(transformData(root, users));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!loading && tree) {
      gsap.fromTo(
        ".dept-card",
        { opacity: 0, scale: 0.8, y: 30 },
        { 
          opacity: 1, 
          scale: 1, 
          y: 0, 
          duration: 0.8, 
          stagger: 0.1, 
          ease: "expo.out",
          delay: 0.2
        }
      );
    }
  }, [loading, tree]);

  const transformData = (curr: User, all: User[]): DeptNode => {
    const children = all.filter(u => u.createdBy === curr.id);
    const subNodes = children.map(c => transformData(c, all));

    return {
      id: curr.id,
      name: curr.department || "Headquarters",
      headName: curr.name,
      headRole: curr.role,
      email: curr.email || `${curr.name.toLowerCase().replace(' ', '.')}@winterarc.com`,
      phone: curr.phone || "+1 (555) 001-9922",
      employeeCount: children.length,
      image: curr.profileImage ? `${process.env.NEXT_PUBLIC_IMAGE_API_URL}/${curr.profileImage}` : "",
      subDepartments: subNodes,
    };
  };

  const renderTree = (node: DeptNode, level = 0) => (
    <div className="flex flex-col items-center relative">
      <ModernDeptCard node={node} level={level} />

      {node.subDepartments.length > 0 && (
        <div className="flex flex-col items-center w-full mt-10">
          {/* Vertical line DOWN from parent */}
          <div className="w-0.5 h-16 bg-linear-to-b from-gray-200 to-[#00A884]/30 relative z-10" />

          <div className="flex justify-center w-full relative">
             {/* Horizontal Connector Bar */}
             {node.subDepartments.length > 1 && (
                <div className="absolute top-0 h-0.5 bg-gray-200" 
                  style={{ 
                    left: `calc(100% / ${node.subDepartments.length} / 2)`, 
                    right: `calc(100% / ${node.subDepartments.length} / 2)` 
                  }} 
                />
             )}

            {node.subDepartments.map((child) => (
              <div key={child.id} className="flex flex-col items-center relative flex-1 px-4">
                {/* Vertical line UP to meet horizontal */}
                <div className="w-0.5 h-10 bg-gray-200" />
                {renderTree(child, level + 1)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FBFB] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-12 h-12 text-[#00A884] animate-spin" />
          <p className="text-gray-400 font-black tracking-widest uppercase text-xs animate-pulse">Building Hierarchy...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#F9FBFB] overflow-hidden flex flex-col relative">
      
      {/* PREMIUM HEADER CONTROLS */}
      <div className="absolute top-8 left-10 right-10 z-50 flex items-center justify-between">
        <div className="bg-white/80 backdrop-blur-xl border border-white p-2 rounded-3xl shadow-2xl shadow-emerald-900/5 flex items-center gap-8 pl-6 pr-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E0F2F1] text-[#00A884] flex items-center justify-center shadow-inner">
               <Users size={20} />
            </div>
            <div>
              <h2 className="text-sm font-black text-gray-900 leading-none">Organization</h2>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">WinterArc Hierarchy</p>
            </div>
          </div>
          <div className="h-8 w-px bg-gray-100" />
          <div className="flex items-center gap-1">
            <button 
              onClick={zoomOut}
              className="p-2.5 hover:bg-gray-50 rounded-xl transition-colors text-gray-400 hover:text-indigo-600 active:scale-90"
              title="Zoom Out"
            >
              <Minus size={16} />
            </button>
            <div className="text-[10px] font-black text-gray-300 w-8 text-center uppercase tracking-tighter">
              {Math.round(scale * 100)}%
            </div>
            <button 
              onClick={zoomIn}
              className="p-2.5 hover:bg-gray-50 rounded-xl transition-colors text-gray-400 hover:text-[#00A884] active:scale-90"
              title="Zoom In"
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="h-8 w-px bg-gray-100" />
          <div className="flex items-center gap-2">
            <button 
              onClick={resetPosition}
              className="p-3 hover:bg-gray-50 rounded-2xl transition-colors text-gray-400 hover:text-[#00A884] group"
              title="Reset View"
            >
              <Maximize2 size={18} className="group-active:scale-90 transition-transform" />
            </button>
            <div className="p-3 text-gray-300">
               {isDragging ? <MousePointer2 size={18} className="text-[#00A884]" /> : <Search size={18} />}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white/80 backdrop-blur-xl border border-white p-2 rounded-3xl shadow-2xl shadow-emerald-900/5 px-4 pr-2">
            <div className="relative group">
               <input 
                  type="text" 
                  placeholder="Find member..." 
                  className="bg-transparent text-[11px] font-bold text-gray-700 outline-none w-40 placeholder:text-gray-300"
               />
            </div>
            <div className="w-8 h-8 rounded-xl bg-[#00A884] text-white flex items-center justify-center cursor-pointer hover:bg-[#008F6F] transition-all">
                <Sparkles size={14} />
            </div>
        </div>
      </div>

      {/* DRAGGABLE CANVAS AREA */}
      <div 
        ref={containerRef}
        className={`flex-1 relative transition-colors duration-500 ${isDragging ? "bg-gray-100/30 cursor-grabbing" : "cursor-grab"}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div 
          ref={canvasRef}
          className="absolute will-change-transform"
          style={{ 
            transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
            padding: "300px",
            minWidth: "max-content",
            left: "50%",
            top: "100px",
            marginLeft: "-600px" // Rough offset for centering start
          }}
        >
          {tree && (
            <div className="tree-container">
              {renderTree(tree, 0)}
            </div>
          )}
        </div>

        {/* BACKGROUND DOTS GRID */}
        <div 
          className="absolute inset-0 -z-10 pointer-events-none opacity-20"
          style={{ 
            backgroundImage: `radial-gradient(#CBD5E1 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
            transform: `translate(${translate.x % 48}px, ${translate.y % 48}px)`
          }}
        />
      </div>

      {/* MINI LEGEND */}
      <div className="absolute bottom-10 right-10 z-50">
        <div className="bg-white/80 backdrop-blur-xl border border-white p-4 rounded-4xl shadow-2xl flex flex-col gap-3">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Hierarchy Legend</p>
          <div className="flex items-center gap-3">
             <div className="w-3 h-3 rounded-full bg-[#00A884]" />
             <span className="text-[10px] font-bold text-gray-600">Admin Level</span>
          </div>
          <div className="flex items-center gap-3">
             <div className="w-3 h-3 rounded-full bg-[#4F46E5]" />
             <span className="text-[10px] font-bold text-gray-600">Management</span>
          </div>
          <div className="flex items-center gap-3">
             <div className="w-3 h-3 rounded-full bg-[#7C3AED]" />
             <span className="text-[10px] font-bold text-gray-600">Team Leads</span>
          </div>
        </div>
      </div>
    </div>
  );
}