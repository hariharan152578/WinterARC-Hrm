"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Skeleton from "@/components/ui/Skeleton";
import { Users, Coffee, Trash2, ChevronRight, Activity, Clock, CheckCircle2, Phone, Mail, Building } from "lucide-react";
import FormInput from "@/components/ui/FormInput";

import {
  validateEmail,
  validatePhone,
  validatePassword,
} from "@/utils/validation";

import { useAuth } from "@/context/AuthContext";
import {
  getTeamDetailedStats,
  createSubUser,
  deleteSubUser,
} from "@/services/user.service";
import toast from "react-hot-toast";

/* ===============================
   MEMBER CARD
================================ */
function MemberCard({ member, onDelete }: { member: any; onDelete: (id: number) => void }) {
  const stats = member.stats || {};
  const efficiency = stats.efficiency?.overall || 0;
  const attendance = stats.attendance || {};
  const tasks = stats.tasks || {};

  return (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 hover:border-blue-200 transition-all group relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />

      <div className="relative flex flex-col md:flex-row gap-6">
        {/* Profile Info */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl font-black shadow-sm">
              {member.name.charAt(0)}
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-900 leading-tight">{member.name}</h4>
              <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">{member.role}</span>
                <span>•</span>
                <span>{member.department}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Mail size={14} className="text-gray-300" />
              <span className="truncate">{member.email}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Phone size={14} className="text-gray-300" />
              <span>{member.phone || "N/A"}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Building size={14} className="text-gray-300" />
              <span>{member.position || "Employee"}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
               <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight ${member.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                {member.isActive ? "Active" : "Inactive"}
              </span>
              {attendance.isLoggedIn && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full uppercase">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" /> Online
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex flex-wrap md:flex-nowrap gap-4 items-center border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
          
          {/* Efficiency */}
          <div className="text-center min-w-[80px]">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 flex items-center justify-center gap-1">
              <Activity size={10} /> Efficiency
            </p>
            <div className="relative inline-flex items-center justify-center">
              <svg className="w-12 h-12 transform -rotate-90">
                <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-100" />
                <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={125.6} strokeDashoffset={125.6 - (125.6 * efficiency) / 100} className="text-blue-500" />
              </svg>
              <span className="absolute text-[10px] font-black">{efficiency}%</span>
            </div>
          </div>

          {/* Attendance */}
          <div className="text-center min-w-[100px]">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 flex items-center justify-center gap-1">
              <Clock size={10} /> Attendance
            </p>
            <p className="text-lg font-black text-gray-900 leading-none">{(attendance.totalMinutesToday / 60).toFixed(1)} <span className="text-[10px]">hrs</span></p>
            <p className="text-[9px] text-gray-400 font-bold mt-1 uppercase">Today</p>
          </div>

          {/* Tasks */}
          <div className="text-center min-w-[100px]">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 flex items-center justify-center gap-1">
              <CheckCircle2 size={10} /> Performance
            </p>
            <p className="text-lg font-black text-gray-900 leading-none">{tasks.completed}<span className="text-gray-300 mx-1">/</span>{tasks.total}</p>
            <p className="text-[9px] text-gray-400 font-bold mt-1 uppercase">Completed</p>
          </div>

          <button 
            onClick={() => onDelete(member.id)}
            className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TeamEmployeesPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const [detailedMembers, setDetailedMembers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const [personId, setPersonId] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [department, setDepartment] = useState("");

  const fetchData = async () => {
    try {
      const res = await getTeamDetailedStats();
      setDetailedMembers(res.data);
    } catch (err) {
      toast.error("Failed to load team details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  /* ================= ANIMATION ================= */
  useEffect(() => {
    if (!loading && containerRef.current) {
      gsap.from(".animate-section", {
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.05,
        ease: "power2.out"
      });
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-40 w-full rounded-3xl" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-4">
            <Skeleton className="h-24 w-full rounded-3xl" />
            <Skeleton className="h-24 w-full rounded-3xl" />
            <Skeleton className="h-24 w-full rounded-3xl" />
          </div>
          <div className="lg:col-span-4">
            <Skeleton className="h-[500px] w-full rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  const filteredMembers = detailedMembers.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    m.email.toLowerCase().includes(search.toLowerCase()) ||
    m.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={containerRef} className="p-4 md:p-8 space-y-8 max-w-[1600px] mx-auto min-h-screen bg-[#F9FBFB]">

      {/* HEADER SECTION */}
      <div className="animate-section flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">The Dream Team</h1>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">
            Managing {detailedMembers.length} active members in your unit
          </p>
        </div>
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Search by name, email or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-blue-100 transition-all outline-none text-sm font-bold text-gray-500 shadow-inner"
          />
          <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* TEAM MEMBER FEED */}
        <div className="lg:col-span-8 space-y-4 animate-section order-2 lg:order-1">
          <div className="flex items-center justify-between px-4 mb-2">
            <h3 className="font-black text-gray-900 text-sm uppercase tracking-widest">Team Roster</h3>
            <span className="text-[10px] font-bold text-gray-400">{filteredMembers.length} results</span>
          </div>

          <div className="space-y-4">
            {filteredMembers.map(member => (
              <MemberCard 
                key={member.id} 
                member={member} 
                onDelete={(id) => setConfirmDelete(id)} 
              />
            ))}
            
            {filteredMembers.length === 0 && (
              <div className="bg-white p-20 rounded-[2.5rem] text-center border border-dashed border-gray-200">
                <Coffee className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                <h4 className="text-lg font-bold text-gray-400">No members found</h4>
                <p className="text-xs text-gray-300 mt-1">Try adjusting your search criteria or add a new member.</p>
              </div>
            )}
          </div>
        </div>

        {/* CREATE EMPLOYEE FORM */}
        <div className="lg:col-span-4 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 animate-section sticky top-8 order-1 lg:order-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center">
              <Users size={20} />
            </div>
            <h3 className="text-xl font-black text-gray-900">Add Member</h3>
          </div>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              let newErrors: any = {};
              if (!personId) newErrors.personId = "Person ID required";
              if (!name) newErrors.name = "Name required";
              if (!department) newErrors.department = "Department required";
              if (!validateEmail(email)) newErrors.email = "Invalid email";
              if (!validatePhone(phone)) newErrors.phone = "Invalid phone";
              if (!validatePassword(password))
                newErrors.password = "Min 8 chars, 1 uppercase & 1 number required";
              if (password !== confirmPassword)
                newErrors.confirmPassword = "Passwords do not match";

              if (Object.keys(newErrors).length > 0) {
                setErrors(newErrors);
                return;
              }

              try {
                setIsSubmitting(true);
                await createSubUser({
                  role: "EMPLOYEE",
                  personId,
                  name,
                  phone,
                  email,
                  password,
                  department,
                });

                toast.success("Welcome to the team! 🎉");
                setPersonId("");
                setName("");
                setPhone("");
                setEmail("");
                setPassword("");
                setConfirmPassword("");
                setDepartment("");
                setErrors({});
                await fetchData();
              } catch (err: any) {
                toast.error(err?.response?.data?.message || "Recruitment failed");
              } finally {
                setIsSubmitting(false);
              }
            }}
            className="space-y-4"
          >
            <FormInput label="Personnel ID" name="personId" placeholder="EMP-001" value={personId} onChange={(e) => setPersonId(e.target.value)} error={errors.personId} />
            <FormInput label="Full Name" name="name" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />
            <FormInput label="Business Email" name="email" placeholder="john@company.com" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
            <FormInput label="Phone Number" name="phone" placeholder="+1..." value={phone} onChange={(e) => setPhone(e.target.value)} error={errors.phone} />
            <FormInput label="Department" name="department" placeholder="Engineering" value={department} onChange={(e) => setDepartment(e.target.value)} error={errors.department} />
            <FormInput label="Access Password" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} />
            <FormInput label="Confirm Access" name="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} error={errors.confirmPassword} />

            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="w-full bg-black text-white font-black py-4 rounded-2xl hover:bg-gray-800 transition-all active:scale-95 disabled:bg-gray-200 mt-4 shadow-lg shadow-black/10"
            >
              {isSubmitting ? "Processing..." : "Onboard Member"}
            </button>
          </form>
        </div>

      </div>

      {/* DELETE MODAL */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-[2rem] max-w-sm w-full text-center shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trash2 size={32} />
            </div>
            <h4 className="text-xl font-black text-gray-900 mb-2">Offboard Member?</h4>
            <p className="text-sm text-gray-400 font-medium mb-8">This action cannot be undone. All access will be revoked immediately.</p>
            <div className="flex gap-4">
              <button 
                onClick={() => setConfirmDelete(null)} 
                className="flex-1 py-3 px-4 bg-gray-100 text-gray-900 font-bold rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await deleteSubUser(confirmDelete);
                    toast.success("Member offboarded");
                    await fetchData();
                  } catch (err: any) {
                    toast.error(err?.response?.data?.message || "Operation failed");
                  } finally {
                    setConfirmDelete(null);
                  }
                }}
                className="flex-1 py-3 px-4 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors shadow-lg shadow-red-200"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
