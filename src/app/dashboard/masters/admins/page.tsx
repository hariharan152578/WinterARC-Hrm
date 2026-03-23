"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Skeleton from "@/components/ui/Skeleton";
import {
  ChevronRight,
  Calendar,
  UserPlus,
  Users,
  Coffee,
  Trash2,
  Search,
} from "lucide-react";
import FormInput from "@/components/ui/FormInput";
import {
  validateEmail,
  validatePhone,
  validatePassword,
} from "@/utils/validation";
import { useAuth } from "@/context/AuthContext";
import {
  getMasterAdminDashboard,
  createAdmin,
  getMyAdmins,
  deleteAdmin,
} from "@/services/user.service";
import toast from "react-hot-toast";

/* ================= TYPES & INITIAL STATE ================= */

const initialFormState = {
  personId: "",
  name: "",
  phone: "",
  email: "",
  password: "",
  confirmPassword: "",
  companyName: "",
  position: "",
  noOfEmployees: 0,
  noOfManagers: 0,
  noOfTeamLeads: 0,
  sessionStartDate: "",
  sessionEndDate: "",
};

/* ================= COMPONENTS ================= */

function StatCard({ title, value, color, icon }: any) {
  return (
    <div
      className={`${color} p-6 rounded-[2rem] relative flex flex-col justify-between h-44 transition-transform hover:scale-[1.02] shadow-sm`}
    >
      <div className="p-2 bg-white/40 w-fit rounded-lg shadow-sm">
        {icon}
      </div>
      <div>
        <span className="text-xs font-semibold text-gray-700 block mb-1">
          {title}
        </span>
        <span className="text-3xl font-bold text-gray-900">
          {value}
        </span>
      </div>
      <button className="absolute bottom-6 right-6 p-1.5 bg-white/60 rounded-full border border-white/20">
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

/* ================= MAIN PAGE ================= */

export default function MasterDashboardPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  
  // State Management
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState<any>({});
  const [admins, setAdmins] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [time, setTime] = useState(new Date());

  /* ================= UTILS & HANDLERS ================= */

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name.includes("noOf") ? Number(value) : value,
    }));
  };

  const getGreeting = () => {
    const hour = time.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  /* ================= API CALLS ================= */

  const fetchData = async () => {
    try {
      const [adminsRes, statsRes] = await Promise.all([
        getMyAdmins(),
        user?.role === "MASTER_ADMIN" ? getMasterAdminDashboard() : Promise.resolve({ data: null }),
      ]);
      setAdmins(adminsRes.data);
      if (statsRes.data) setStats(statsRes.data);
    } catch (err) {
      console.error(err);
      toast.error("Error refreshing data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    if (user) fetchData();
    return () => clearInterval(interval);
  }, [user]);

  /* ================= ANIMATION ================= */

  useEffect(() => {
    if (!loading && containerRef.current) {
      gsap.from(".animate-section", {
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out",
      });
    }
  }, [loading]);

  /* ================= FORM SUBMISSION ================= */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let newErrors: any = {};

    // Validation
    if (!formData.personId) newErrors.personId = "Required";
    if (!formData.name) newErrors.name = "Required";
    if (!formData.companyName) newErrors.companyName = "Required";
    if (!validateEmail(formData.email)) newErrors.email = "Invalid email";
    if (!validatePhone(formData.phone)) newErrors.phone = "Invalid phone";
    if (!validatePassword(formData.password)) newErrors.password = "Weak password";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Mismatch";
    
    if (formData.sessionStartDate && formData.sessionEndDate && 
        new Date(formData.sessionEndDate) < new Date(formData.sessionStartDate)) {
      newErrors.sessionEndDate = "End date before start date";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      await createAdmin(formData);
      toast.success("Admin Created Successfully ✅");
      setFormData(initialFormState);
      setErrors({});
      await fetchData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Creation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Skeleton className="h-44 w-full rounded-[2rem]" />
        <Skeleton className="h-44 w-full rounded-[2rem]" />
        <Skeleton className="h-44 w-full rounded-[2rem]" />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* HEADER */}
      <div className="animate-section bg-white rounded-[2.5rem] p-8 md:p-10 flex flex-col md:flex-row justify-between items-center shadow-sm border border-gray-50">
        <div>
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
            Welcome back, {user?.name?.split(" ")[0]}
          </h2>
          <h1 className="text-4xl font-bold text-gray-900">{getGreeting()}</h1>
        </div>
        <div className="mt-4 md:mt-0 text-center md:text-right">
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter">
            {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })}
          </h1>
          <p className="text-gray-400 text-sm">{time.toLocaleDateString(undefined, { dateStyle: 'full' })}</p>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-section">
        <StatCard title="Total Admins" value={stats?.totalAdmins || 0} color="bg-[#E0D7FF]" icon={<Users size={18} />} />
        <StatCard title="Total Tenants" value={stats?.totalTenants || 0} color="bg-[#FDE2D1]" icon={<Calendar size={18} />} />
        <StatCard title="Active Users" value={stats?.totalActiveUsers || 0} color="bg-[#D1FADF]" icon={<Coffee size={18} />} />
        <StatCard title="Pending Requests" value={stats?.pendingRequests || 0} color="bg-[#D1E9FF]" icon={<UserPlus size={18} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* CREATE ADMIN FORM */}
        <div className="lg:col-span-8 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-50 animate-section">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold">Register New Admin</h3>
            <span className="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-500 font-bold uppercase">Administrator Access</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <FormInput label="Person ID" name="personId" value={formData.personId} onChange={handleInputChange} error={errors.personId} />
              <FormInput label="Full Name" name="name" value={formData.name} onChange={handleInputChange} error={errors.name} />
              <FormInput label="Email Address" name="email" value={formData.email} onChange={handleInputChange} error={errors.email} />
              <FormInput label="Phone Number" name="phone" value={formData.phone} onChange={handleInputChange} error={errors.phone} />
              <FormInput label="Password" type="password" name="password" value={formData.password} onChange={handleInputChange} error={errors.password} />
              <FormInput label="Confirm Password" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} error={errors.confirmPassword} />
              <FormInput label="Company Name" name="companyName" value={formData.companyName} onChange={handleInputChange} error={errors.companyName} />
              <FormInput label="Position" name="position" value={formData.position} onChange={handleInputChange} error={errors.position} />
            </div>

            <div className="p-6 bg-gray-50 rounded-3xl grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormInput label="Employees" type="number" name="noOfEmployees" value={formData.noOfEmployees} onChange={handleInputChange} />
              <FormInput label="Managers" type="number" name="noOfManagers" value={formData.noOfManagers} onChange={handleInputChange} />
              <FormInput label="Team Leads" type="number" name="noOfTeamLeads" value={formData.noOfTeamLeads} onChange={handleInputChange} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput label="Session Start" type="date" name="sessionStartDate" value={formData.sessionStartDate} onChange={handleInputChange} error={errors.sessionStartDate} />
              <FormInput label="Session End" type="date" name="sessionEndDate" value={formData.sessionEndDate} onChange={handleInputChange} error={errors.sessionEndDate} />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 transition-all disabled:bg-gray-400"
            >
              {isSubmitting ? "Creating Admin Account..." : "Create Admin Account"}
            </button>
          </form>
        </div>

        {/* ADMIN LIST */}
        <div className="lg:col-span-4 space-y-6 animate-section">
          <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-50 relative min-h-[500px]">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Users size={20} />Local Hierarchy
            </h3>

            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Filter by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-2xl text-sm focus:outline-none focus:ring-2 ring-black/5"
              />
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {admins
                .filter((a) => a.name.toLowerCase().includes(search.toLowerCase()))
                .map((admin) => (
                  <div key={admin.id} className="group flex justify-between items-center p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-bold text-gray-400 shadow-sm">
                        {admin.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{admin.name}</p>
                        <p className="text-xs text-gray-400 truncate max-w-[120px]">{admin.email}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setConfirmDelete(admin.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
            </div>

            {/* DELETE MODAL OVERLAY */}
            {confirmDelete && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-[2.5rem] z-10 px-6">
                <div className="bg-white p-8 rounded-[2rem] shadow-2xl border border-gray-100 text-center w-full">
                  <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trash2 size={32} />
                  </div>
                  <h4 className="text-xl font-bold mb-2">Are you sure?</h4>
                  <p className="text-gray-500 text-sm mb-6">This action cannot be undone. This admin will lose all access.</p>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={async () => {
                        try {
                          await deleteAdmin(confirmDelete);
                          toast.success("Admin removed");
                          await fetchData();
                        } catch (err) {
                          toast.error("Failed to delete");
                        } finally {
                          setConfirmDelete(null);
                        }
                      }}
                      className="w-full py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors"
                    >
                      Yes, Delete Admin
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
    </div>
  );
}