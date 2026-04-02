"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Skeleton from "@/components/ui/Skeleton";
import { Users, Coffee, Trash2, ChevronRight, Lock, Calendar, Fingerprint, User, Mail, Phone, Building2 } from "lucide-react";
import FormInput from "@/components/ui/FormInput";
import PasswordCheckpoints from "@/components/ui/PasswordCheckpoints";

import {
  validateEmail,
  validatePhone,
  validatePassword,
} from "@/utils/validation";

import { useAuth } from "@/context/AuthContext";
import { getHierarchyUsers, createSubUser } from "@/services/user.service";
import api from "@/lib/axios";
import toast from "react-hot-toast";

/* ===============================
    STAT CARD COMPONENT
 ================================ */
function StatCard({ title, value, color, icon }: any) {
  return (
    <div className={`${color} p-5 md:p-6 rounded-4xl relative flex flex-col justify-between h-36 md:h-44 transition-transform hover:scale-[1.02] shadow-sm`}>
      <div className="p-2 bg-white/40 w-fit rounded-lg shadow-sm">
        {icon}
      </div>
      <div>
        <span className="text-xs font-semibold text-gray-700 block mb-1">{title}</span>
        <span className="text-2xl md:text-3xl font-bold text-gray-900">{value}</span>
      </div>
      <button className="absolute bottom-4 right-4 md:bottom-6 md:right-6 p-1.5 bg-white/60 rounded-full border border-white/20">
        <ChevronRight size={14} />
      </button>
    </div>
  );
}

export default function ManagerDashboardPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const [users, setUsers] = useState<any[]>([]);
  const [teamLeads, setTeamLeads] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [joiningDate, setJoiningDate] = useState(""); 
  const [personId, setPersonId] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [department, setDepartment] = useState("");

  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const getGreeting = () => {
    const hour = time.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const fetchUsers = async () => {
    try {
      const res = await getHierarchyUsers();
      setUsers(res.data);
      setTeamLeads(res.data.filter((u: any) => u.role === "TEAMLEAD"));
      setEmployees(res.data.filter((u: any) => u.role === "EMPLOYEE"));
    } catch (err) {
      console.error("Fetch failed");
    }
  };

  useEffect(() => {
    const load = async () => {
      await fetchUsers();
      setLoading(false);
    };
    if (user) load();
  }, [user]);

  useEffect(() => {
    if (!loading && containerRef.current) {
      gsap.from(".animate-section", {
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out"
      });
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
        <Skeleton className="h-40 md:h-64 w-full rounded-3xl" />
        <Skeleton className="h-40 md:h-64 w-full rounded-3xl" />
        <Skeleton className="h-40 md:h-64 w-full rounded-3xl" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let newErrors: any = {};
    if (!personId) newErrors.personId = "Required";
    if (!name) newErrors.name = "Required";
    if (!department) newErrors.department = "Required";
    if (!validateEmail(email)) newErrors.email = "Invalid email";
    if (!validatePhone(phone)) newErrors.phone = "10 digits required";
    if (!validatePassword(password)) newErrors.password = "Complexity required";
    if (password !== confirmPassword) newErrors.confirmPassword = "Mismatch";
    if (!joiningDate) newErrors.joiningDate = "Joining date required";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      await createSubUser({ role: "TEAMLEAD", personId, name, phone, email, password, department, joiningDate });
      toast.success("Created ✅");
      setPersonId(""); setName(""); setPhone(""); setEmail(""); setPassword(""); setConfirmPassword(""); setDepartment(""); setJoiningDate("");
      setErrors({});
      await fetchUsers();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div ref={containerRef} className="p-0 md:p-4 space-y-6 md:space-y-8 max-w-7xl mx-auto overflow-x-hidden">

      {/* ================= HEADER ================= */}
      <div className="animate-section">
        <div className="bg-white md:bg-transparent rounded-3xl md:rounded-none p-6 md:p-0 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-xs md:text-sm text-gray-400 font-medium">
              Hello {user?.name?.split(" ")[0]} 👋
            </h2>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{getGreeting()}</h1>
          </div>

          <div className="text-left md:text-right">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter">
              {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })}
            </h1>
            <p className="text-gray-400 text-xs md:text-sm uppercase tracking-wider font-semibold">
              {time.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {/* ================= STATS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-section">
        <StatCard title="TeamLeads" value={teamLeads.length} color="bg-[#E0D7FF]" icon={<Users size={16} />} />
        <StatCard title="Employees" value={employees.length} color="bg-[#D1FADF]" icon={<Coffee size={16} />} />
      </div>

      {/* ================= MAIN GRID ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">

        {/* CREATE TEAMLEAD FORM */}
        <div className="lg:col-span-8 bg-white p-6 md:p-10 rounded-4xl shadow-sm animate-section border border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-2">
            <h3 className="text-lg md:text-xl font-bold">Create Team Lead</h3>
            <span className="text-[10px] bg-purple-50 px-3 py-1 rounded-full text-purple-600 font-bold uppercase border border-purple-100">
              Admin Access
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6 md:gap-y-8">
              <FormInput label="Person ID" name="personId" value={personId} onChange={(e) => setPersonId(e.target.value)} error={errors.personId} icon={Fingerprint} />
              <FormInput label="Full Name" name="name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} icon={User} />
              <FormInput label="Email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} icon={Mail} />
              <FormInput label="Phone" name="phone" value={phone} onChange={(e) => setPhone(e.target.value)} error={errors.phone} icon={Phone} />
              <FormInput label="Joining Date" type="date" name="joiningDate" value={joiningDate} onChange={(e) => setJoiningDate(e.target.value)} error={errors.joiningDate} icon={Calendar} />
              <FormInput label="Department" name="department" value={department} onChange={(e) => setDepartment(e.target.value)} error={errors.department} icon={Building2} />
            </div>

            <div className="space-y-4">
              <FormInput label="Password" type="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} icon={Lock} />
              <PasswordCheckpoints password={password} />
              <FormInput label="Confirm Password" type="password" name="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} error={errors.confirmPassword} icon={Lock} />
            </div>

            <div className="md:col-span-2 mt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Processing..." : "Register Team Lead"}
              </button>
            </div>
          </form>
        </div>

        {/* TEAMLEAD LIST / HIERARCHY */}
        <div className="lg:col-span-4 space-y-6 animate-section w-full">
          <div className="bg-white p-6 rounded-4xl shadow-sm border border-gray-100 relative min-h-[400px]">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Users size={20} className="text-purple-600" /> Local Hierarchy
            </h3>

            <input
              type="text"
              placeholder="Search leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full p-3 mb-4 bg-gray-50 rounded-xl text-sm border border-gray-100 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
            />

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
              {teamLeads
                .filter((t) => t.name.toLowerCase().includes(search.toLowerCase()))
                .map((t) => (
                  <div key={t.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-gray-200 transition-all group">
                    <div className="truncate mr-2">
                      <p className="text-sm font-bold text-gray-900 truncate">{t.name}</p>
                      <p className="text-[10px] text-gray-500 font-medium truncate">{t.email}</p>
                    </div>
                    <button
                      onClick={() => setConfirmDelete(t.id)}
                      className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              {teamLeads.length === 0 && (
                <div className="text-center py-10 text-gray-400 text-sm">No team leads found</div>
              )}
            </div>

            {/* DELETE MODAL WITHIN CONTAINER */}
            {confirmDelete && (
              <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center rounded-4xl z-10 px-6">
                <div className="text-center">
                  <div className="bg-red-50 p-4 rounded-full w-fit mx-auto mb-4 text-red-500">
                    <Trash2 size={24} />
                  </div>
                  <p className="mb-6 font-bold text-gray-900">Remove this Team Lead?</p>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={async () => {
                        try {
                          await api.delete(`/users/${confirmDelete}`);
                          toast.success("Removed");
                          await fetchUsers();
                        } catch { toast.error("Failed"); }
                        finally { setConfirmDelete(null); }
                      }}
                      className="w-full px-6 py-2 bg-red-500 text-white rounded-xl font-bold shadow-lg shadow-red-200"
                    >
                      Confirm Delete
                    </button>
                    <button onClick={() => setConfirmDelete(null)} className="w-full px-6 py-2 text-gray-500 font-medium">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}