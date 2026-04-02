"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Skeleton from "@/components/ui/Skeleton";
import {
  ChevronRight,
  Users,
  UserPlus,
  Trash2,
  Coffee,
  Search,
  LayoutGrid,
  ShieldAlert,
  Lock,
  Calendar,
} from "lucide-react";
import FormInput from "@/components/ui/FormInput";
import PasswordCheckpoints from "@/components/ui/PasswordCheckpoints";
import { useAuth } from "@/context/AuthContext";
import { getHierarchyUsers, createSubUser } from "@/services/user.service";
import api from "@/lib/axios";
import toast from "react-hot-toast";

/* ===============================
   TYPES
================================ */
type ManagerForm = {
  personId: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  password: string;
  joiningDate: string;
};

const initialFormState: ManagerForm = {
  personId: "",
  name: "",
  email: "",
  phone: "",
  department: "",
  password: "",
  joiningDate: "",
};

/* ===============================
   STAT CARD COMPONENT
================================ */
function StatCard({ title, value, color, icon }: any) {
  return (
    <div className={`${color} rounded-[2rem] relative flex flex-col justify-between h-44 transition-all hover:scale-[1.02] shadow-sm`}>
      <div className="p-2 bg-white/40 w-fit rounded-lg shadow-sm">
        {icon}
      </div>
      <div>
        <span className="text-xs font-semibold text-gray-700 block mb-1 uppercase tracking-tight">
          {title}
        </span>
        <span className="text-4xl font-bold text-gray-900">
          {value}
        </span>
      </div>
      <button className="absolute bottom-6 right-6 p-1.5 bg-white/60 rounded-full border border-white/20">
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

export default function AdminDashboardPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ManagerForm>(initialFormState);
  const [time, setTime] = useState(new Date());

  /* ================= CLOCK & GREETING ================= */
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

  /* ================= FETCH DATA ================= */
  const fetchUsers = async () => {
    try {
      const res = await getHierarchyUsers();
      setUsers(res.data);
    } catch {
      toast.error("Failed to load hierarchy");
    }
  };

  useEffect(() => {
    const load = async () => {
      await fetchUsers();
      setLoading(false);
    };
    if (user) load();
  }, [user]);

  /* ================= ANIMATION ================= */
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

  const managers = users.filter((u) => u.role === "MANAGER");
  const teamLeads = users.filter((u) => u.role === "TEAMLEAD");
  const employees = users.filter((u) => u.role === "EMPLOYEE");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (Object.values(formData).some(val => !val)) {
      toast.error("Please fill all fields ⚠️");
      return;
    }

    try {
      setIsSubmitting(true);
      await createSubUser({ role: "MANAGER", ...formData });
      toast.success("Manager Created Successfully ✅");
      setFormData(initialFormState);
      await fetchUsers();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <Skeleton className="h-44 w-full rounded-[2rem]" />
        <Skeleton className="h-44 w-full rounded-[2rem]" />
        <Skeleton className="h-44 w-full rounded-[2rem]" />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">

      {/* HEADER */}
      <div className="animate-section bg-white rounded-[2.5rem] p-8 md:p-10 flex flex-col md:flex-row justify-between items-center shadow-sm border border-gray-100">
        <div>
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Administrator Control</h2>
          <h1 className="text-3xl font-bold text-gray-900">{getGreeting()}, {user?.name?.split(" ")[0]}</h1>
        </div>
        <div className="mt-4 md:mt-0 text-center md:text-right">
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter">
            {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })}
          </h1>
          <p className="text-gray-400 text-sm">{time.toLocaleDateString(undefined, { dateStyle: 'full' })}</p>
        </div>
      </div>

      {/* STATS SECTION */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-section">
        <StatCard title="Managers" value={managers.length} color="bg-[#E0D7FF]" icon={<ShieldAlert size={18} className="text-purple-600" />} />
        <StatCard title="TeamLeads" value={teamLeads.length} color="bg-[#FDE2D1]" icon={<Users size={18} className="text-orange-600" />} />
        <StatCard title="Employees" value={employees.length} color="bg-[#D1FADF]" icon={<Coffee size={18} className="text-emerald-600" />} />
        <StatCard title="Total Staff" value={users.length} color="bg-[#D1E9FF]" icon={<LayoutGrid size={18} className="text-blue-600" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* CREATE MANAGER FORM */}
        <div className="lg:col-span-7 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-50 animate-section">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-blue-50 rounded-lg text-black/80">
              <UserPlus size={24} />
            </div>
            <h3 className="text-xl font-bold">Register Manager</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput label="Person ID" name="personId" value={formData.personId} onChange={handleChange} />
              <FormInput label="Full Name" name="name" value={formData.name} onChange={handleChange} />
              <FormInput label="Email Address" name="email" value={formData.email} onChange={handleChange} />
              <FormInput label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} />
              <FormInput label="Department" name="department" value={formData.department} onChange={handleChange} />
              <FormInput label="Joining Date" type="date" name="joiningDate" value={formData.joiningDate} onChange={handleChange} icon={Calendar} />
            </div>

            <div className="space-y-4">
              <FormInput label="Access Password" type="password" name="password" value={formData.password} onChange={handleChange} icon={Lock} />
              <PasswordCheckpoints password={formData.password} />
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="w-full mt-4 py-3 bg-black text-white rounded-4xl font-bold transition-all "
            >
              {isSubmitting ? "Generating Account..." : "Create Manager Account"}
            </button>
          </form>
        </div>

        {/* HIERARCHY LIST */}
        <div className="lg:col-span-5 bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-50 animate-section relative overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg">Local Hierarchy</h3>
            <span className="text-[10px] bg-gray-100 px-2 py-1 rounded-full font-bold text-gray-500 uppercase">Real-time</span>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-2xl text-sm focus:outline-none focus:ring-2 ring-blue-100"
            />
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {users
              .filter((u) => u.name.toLowerCase().includes(search.toLowerCase()))
              .map((u) => (
                <div key={u.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl hover:bg-white hover:shadow-md hover:ring-1 ring-gray-100 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 px-3 py-2 rounded-full bg-white flex items-center justify-center font-bold text-gray-400 shadow-sm`}>
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{u.name}- ({u.role})</p>
                      <p className={`text-[10px] text-gray-400 font-bold tracking-widest 
                        ${u.email === 'MANAGER' ? 'text-gray-500' : 'text-gray-400'}`}>
                        {u.email}
                      </p>
                    </div>
                  </div>

                  {u.role === "MANAGER" && (
                    <button 
                      onClick={() => setConfirmDelete(u.id)}
                      className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
          </div>

          {/* DELETE CONFIRMATION MODAL */}
          {confirmDelete && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center p-6 z-10 transition-all">
              <div className="text-center w-full">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldAlert size={32} />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Delete Manager?</h4>
                <p className="text-sm text-gray-500 mb-8">Deleting a manager will disrupt the reporting lines for their assigned TeamLeads.</p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={async () => {
                      try {
                        await api.delete(`/users/${confirmDelete}`);
                        toast.success("Manager account purged ✅");
                        await fetchUsers();
                      } catch (err: any) {
                        toast.error(err?.response?.data?.message || "Delete failed");
                      } finally {
                        setConfirmDelete(null);
                      }
                    }}
                    className="w-full py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 shadow-lg shadow-red-100"
                  >
                    Confirm Deletion
                  </button>
                  <button 
                    onClick={() => setConfirmDelete(null)} 
                    className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}