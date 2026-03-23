"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Skeleton from "@/components/ui/Skeleton";
import { ArrowUpRight, ChevronRight, Calendar, UserPlus, Users, Coffee } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getSuperAdminDashboard } from "@/services/user.service";
import { createMasterAdmin } from "@/services/user.service";
import toast from "react-hot-toast";


import { getMasterAdmins, deleteMasterAdmin } from "@/services/user.service";
import { Trash2, X } from "lucide-react";
function StatCard({ title, value, color, icon }: any) {
  return (
    <div className={`${color} p-6 rounded-[2rem] relative flex flex-col justify-between h-44 transition-transform hover:scale-[1.02]`}>
      <div className="p-2 bg-white/40 w-fit rounded-lg shadow-sm">
        {icon}
      </div>
      <div>
        <span className="text-xs font-semibold text-gray-700 block mb-1">{title}</span>
        <span className="text-3xl font-bold text-gray-900">{value }</span>
      </div>
      <button className="absolute bottom-6 right-6 p-1.5 bg-white/60 rounded-full border border-white/20">
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

function MemberItem({ name, role, img }: any) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
      <img src={img} alt={name} className="w-10 h-10 rounded-full object-cover" />
      <div>
        <p className="text-sm font-bold text-gray-800 leading-tight">{name}</p>
        <p className="text-xs text-gray-400">{role}</p>
      </div>
    </div>
  );
}
export default function DashboardPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [personId, setPersonId] = useState("");
  const [password, setPassword] = useState("");
  const [masters, setMasters] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedMaster, setSelectedMaster] = useState<any>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // ✅ NEW
const [confirmPassword, setConfirmPassword] = useState("");
  const [time, setTime] = useState(new Date());

  /* ===============================
     LIVE CLOCK
  =============================== */
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  /* ===============================
     GREETING FUNCTION
  =============================== */
  const getGreeting = () => {
    const hour = time.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const fetchMasters = async () => {
    try {
      const res = await getMasterAdmins();
      setMasters(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  /* ===============================
     FETCH SUPER ADMIN DASHBOARD
  =============================== */
  const fetchDashboard = async () => {
    try {
      if (user?.role === "SUPER_ADMIN") {
        const res = await getSuperAdminDashboard();
        setStats(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchDashboard();
      await fetchMasters();
      setLoading(false);
    };
    if (user) fetchData();
  }, [user]);

  /* ===============================
     GSAP ANIMATION
  =============================== */
  useEffect(() => {
    if (!loading && containerRef.current) {
      gsap.from(".animate-section", {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out",
      });
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-4"><Skeleton className="h-64 w-full rounded-3xl" /></div>
        <div className="space-y-4"><Skeleton className="h-64 w-full rounded-3xl" /></div>
        <div className="space-y-4"><Skeleton className="h-64 w-full rounded-3xl" /></div>
      </div>
    );
  }



  return (
    <div ref={containerRef} className="space-y-8">

      {/* HEADER + CLOCK (UNCHANGED) */}
      <div className="space-y-6 animate-section">
        <div className="relative w-full rounded-[2.5rem] p-8 md:p-10 flex flex-col md:flex-row items-center justify-between overflow-hidden shadow-lg border border-white/5">
          <div>
            <h2 className="text-sm font-semibold text-gray-400 mb-1">
              Hello {user?.name?.split(' ')[0]}! 👋
            </h2>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {getGreeting()}
            </h1>
          </div>

          <div className="flex flex-col items-center md:items-start z-10">
            <div className="flex items-baseline gap-2">
              <h1 className="text-5xl md:text-6xl font-bold text-slate-800 tracking-tighter">
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
              </h1>
              <span className="text-2xl font-bold text-gray-400 uppercase tracking-widest">
                {time.getHours() >= 12 ? 'PM' : 'AM'}
              </span>
            </div>
            <div className="mt-4 space-y-1 text-center md:text-left">
              <p className="text-lg font-medium text-gray-500">Madurai, India (IST)</p>
              <p className="text-sm font-semibold text-gray-500 tracking-wide uppercase">
                Today, +0hrs
              </p>
            </div>
          </div>

          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* LEFT COLUMN (UNCHANGED) */}
        <div className="lg:col-span-4 grid grid-cols-2 gap-4 animate-section">
          {user?.role === "SUPER_ADMIN" && stats ? (
            <>
              <StatCard
                        title="Total Admins"
                        value={stats?.totalAdmins || 0}
                        color="bg-[#E0D7FF]"
                        icon={<Users size={18} />}
                      />
                      <StatCard
                        title="Total Tenants"
                        value={stats?.totalTenants || 0}
                        color="bg-[#FDE2D1]"
                        icon={<Calendar size={18} />}
                      />
                      <StatCard
                        title="Active Users"
                        value={stats?.totalActiveUsers || 0}
                        color="bg-[#D1FADF]"
                        icon={<Coffee size={18} />}
                      />
                      <StatCard
                        title="Pending Requests"
                        value={stats?.pendingRequests || 0}
                        color="bg-[#D1E9FF]"
                        icon={<UserPlus size={18} />}
                      />
            </>
          ) : null}
        </div>

        {/* ✅ UPDATED MIDDLE COLUMN ONLY */}
        <div className="lg:col-span-4 bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-50 animate-section h-full">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg">Create Master Admin</h3>
            <span className="text-xs font-medium text-gray-400">
              Super Admin Only
            </span>
          </div>

          <form
  onSubmit={async (e) => {
    e.preventDefault();

    // ✅ Required validation
    if (
      !name ||
      !email ||
      !phone ||
      !personId ||
      !password ||
      !confirmPassword
    ) {
      toast.error("All fields are required ⚠️");
      return;
    }

    // ✅ Password match validation
    if (password !== confirmPassword) {
      toast.error("Passwords do not match ❌");
      return;
    }

    try {
      setIsSubmitting(true);

      await createMasterAdmin({
        name,
        email,
        phone,
        personId,
        password,
      });

      toast.success("Master Admin Created Successfully ✅");

      // 🔥 Clear fields
      setName("");
      setEmail("");
      setPhone("");
      setPersonId("");
      setPassword("");
      setConfirmPassword("");

      await fetchDashboard(); // Auto refresh stats
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Something went wrong"
      );
    } finally {
      setIsSubmitting(false);
    }
  }}
  className="space-y-4"
>
  {[
    { label: "Full Name", value: name, setter: setName, type: "text", placeholder: "John Doe" },
    { label: "Person ID", value: personId, setter: setPersonId, type: "text", placeholder: "123456789" },
    { label: "Email", value: email, setter: setEmail, type: "email", placeholder: "john.doe@example.com" },
    { label: "Phone", value: phone, setter: setPhone, type: "text", placeholder: "+1234567890" },
    { label: "Password", value: password, setter: setPassword, type: "password", placeholder: "••••••••" },
    { label: "Confirm Password", value: confirmPassword, setter: setConfirmPassword, type: "password", placeholder: "••••••••" },
  ].map((field, index) => (
    <div key={index}>
      <label className="text-xs text-gray-400 mb-1 block">
        {field.label}
      </label>

      <input
        type={field.type}
        value={field.value}
        onChange={(e) => field.setter(e.target.value)}
        placeholder={field.placeholder}
        className="w-full p-3 bg-gray-50 rounded-xl text-sm border-none outline-none focus:ring-1 ring-purple-200"
      />

      {/* 🔥 Live Password Mismatch Warning */}
      {field.label === "Confirm Password" &&
        confirmPassword &&
        password !== confirmPassword && (
          <p className="text-xs text-red-500 mt-1">
            Passwords do not match
          </p>
        )}
    </div>
  ))}

  <button
    type="submit"
    disabled={
      isSubmitting ||
      !name ||
      !email ||
      !phone ||
      !personId ||
      !password ||
      !confirmPassword ||
      password !== confirmPassword
    }
    className={`w-full py-3 rounded-full font-medium mt-4 transition flex items-center justify-center gap-2 ${
      isSubmitting ||
      !name ||
      !email ||
      !phone ||
      !personId ||
      !password ||
      !confirmPassword ||
      password !== confirmPassword
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-black text-white hover:bg-gray-800"
    }`}
  >
    {isSubmitting && (
      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
    )}
    {isSubmitting ? "Creating..." : "Create Master Admin"}
  </button>
</form>
        </div>


        {/* RIGHT COLUMN: Master Admin Management */}
        <div className="lg:col-span-4 bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-50 animate-section h-full relative">

          <h3 className="font-bold text-lg mb-4">Master Admins</h3>

          {/* Search */}
          <input
            type="text"
            placeholder="Search Master Admin..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-3 mb-4 bg-gray-50 rounded-xl text-sm outline-none focus:ring-1 ring-purple-200"
          />

          {/* Master List */}
          <div className="space-y-3 max-h-[350px] overflow-y-auto">
            {masters
              .filter((m) =>
                m.name.toLowerCase().includes(search.toLowerCase())
              )
              .map((master) => (
                <div
                  key={master.id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
                >
                  <div
                    onClick={() => {
                      setSelectedMaster(master);
                      setDrawerOpen(true);
                    }}
                    className="cursor-pointer"
                  >
                    <p className="text-sm font-semibold">{master.name}</p>
                    <p className="text-xs text-gray-400">{master.email}</p>
                  </div>

                  <Trash2
                    size={16}
                    className="text-red-500 cursor-pointer"
                    onClick={() => setConfirmDelete(master.id)}
                  />
                </div>
              ))}

            {masters.length === 0 && (
              <p className="text-sm text-gray-400 text-center">
                No Master Admins Found
              </p>
            )}
          </div>

          {/* Confirmation Dialog */}
          {confirmDelete && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-[2.5rem]">
              <div className="bg-white p-6 rounded-2xl shadow-lg w-80 text-center">
                <p className="font-semibold mb-4">
                  Are you sure you want to delete?
                </p>

                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => setConfirmDelete(null)}
                    className="px-4 py-2 rounded-full bg-gray-200 text-sm"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={async () => {
                      try {
                        await deleteMasterAdmin(confirmDelete);
                        toast.success("Master Admin deleted ✅");
                        await fetchMasters();
                        await fetchDashboard();
                      } catch (err: any) {
                        toast.error(
                          err?.response?.data?.message ||
                          "Cannot delete Master Admin"
                        );
                      } finally {
                        setConfirmDelete(null);
                      }
                    }}
                    className="px-4 py-2 rounded-full bg-red-500 text-white text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Drawer Modal */}
          {drawerOpen && selectedMaster && (
            <div className="fixed inset-0 bg-black/40 flex justify-end z-50">
              <div className="bg-white w-96 h-full p-6 shadow-xl relative animate-slide-in">

                <X
                  className="absolute top-4 right-4 cursor-pointer"
                  onClick={() => setDrawerOpen(false)}
                />

                <h2 className="text-lg font-bold mb-6">
                  Master Admin Details
                </h2>

                <div className="space-y-3 text-sm">
                  <p><strong>Name:</strong> {selectedMaster.name}</p>
                  <p><strong>Email:</strong> {selectedMaster.email}</p>
                  <p><strong>Phone:</strong> {selectedMaster.phone}</p>
                  <p><strong>Person ID:</strong> {selectedMaster.personId}</p>
                  <p><strong>Created At:</strong> {new Date(selectedMaster.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* BOTTOM SECTION (UNCHANGED) */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-section">
        <div className="bg-white p-6 rounded-[2.5rem]">
          <div className="flex justify-between mb-4">
            <h3 className="font-bold">Attendance</h3>
            <ArrowUpRight className="text-gray-400 border rounded-full p-1" size={24} />
          </div>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs text-gray-400">{time.toDateString()}</p>
              <p className="text-2xl font-bold">Clock in</p>
            </div>
            <p className="text-2xl font-bold">
              {time.toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div> */}
    </div>
  );
}

