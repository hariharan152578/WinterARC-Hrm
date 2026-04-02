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
import { Trash2, X, Lock, Mail, Phone, Fingerprint, User } from "lucide-react";
import FormInput from "@/components/ui/FormInput";
import PasswordCheckpoints from "@/components/ui/PasswordCheckpoints";

function StatCard({ title, value, color, icon }: any) {
  return (
    <div className={`${color} p-6 rounded-4xl relative flex flex-col justify-between h-44 transition-transform hover:scale-[1.02]`}>
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

export default function MyTeamPage() {
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [joiningDate, setJoiningDate] = useState("");
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        <div className="lg:col-span-4 grid grid-cols-2 gap-4 animate-section">
          {user?.role === "SUPER_ADMIN" && stats ? (
            <>
              <StatCard
                        title="Team Admins"
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

        <div className="lg:col-span-4 bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-50 animate-section h-full">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg">Create New Admin</h3>
            <span className="text-xs font-medium text-gray-400">
              Super Admin Only
            </span>
          </div>

          <form
  onSubmit={async (e) => {
    e.preventDefault();

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
        joiningDate,
      });

      toast.success("Admin Created Successfully ✅");

      setName("");
      setEmail("");
      setPhone("");
      setPersonId("");
      setPassword("");
      setConfirmPassword("");
      setJoiningDate("");

      await fetchDashboard();
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
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <FormInput label="Full Name" name="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" icon={User} />
    <FormInput label="Person ID" name="personId" value={personId} onChange={(e) => setPersonId(e.target.value)} placeholder="123456789" icon={Fingerprint} />
    <FormInput label="Email" type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john.doe@example.com" icon={Mail} />
    <FormInput label="Phone" name="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1234567890" icon={Phone} />
    <FormInput label="Joining Date" type="date" name="joiningDate" value={joiningDate} onChange={(e) => setJoiningDate(e.target.value)} icon={Calendar} />
  </div>

  <div className="space-y-4">
    <FormInput label="Password" type="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" icon={Lock} />
    <PasswordCheckpoints password={password} />
    <FormInput label="Confirm Password" type="password" name="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" icon={Lock} />
    {confirmPassword && password !== confirmPassword && (
      <p className="text-xs text-red-500 mt-1 ml-1 font-medium flex items-center gap-1">
        <X size={12} /> Passwords do not match
      </p>
    )}
  </div>

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
    {isSubmitting ? "Creating..." : "Create Admin"}
  </button>
</form>
        </div>


        <div className="lg:col-span-4 bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-50 animate-section h-full relative">

          <h3 className="font-bold text-lg mb-4">My Team Admins</h3>

          <input
            type="text"
            placeholder="Search Admin..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-3 mb-4 bg-gray-50 rounded-xl text-sm outline-none focus:ring-1 ring-purple-200"
          />

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
                No Admins Found
              </p>
            )}
          </div>

          {confirmDelete && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-[2.5rem]">
              <div className="bg-white p-6 rounded-2xl shadow-lg w-80 text-center">
                <p className="font-semibold mb-4">
                  Are you sure you want to delete this admin?
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
                        toast.success("Admin deleted ✅");
                        await fetchMasters();
                        await fetchDashboard();
                      } catch (err: any) {
                        toast.error(
                          err?.response?.data?.message ||
                          "Cannot delete Admin"
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

          {drawerOpen && selectedMaster && (
            <div className="fixed inset-0 bg-black/40 flex justify-end z-50">
              <div className="bg-white w-96 h-full p-6 shadow-xl relative animate-slide-in">

                <X
                  className="absolute top-4 right-4 cursor-pointer"
                  onClick={() => setDrawerOpen(false)}
                />

                <h2 className="text-lg font-bold mb-6">
                  Admin Details
                </h2>

                <div className="space-y-3 text-sm">
                  <p><strong>Name:</strong> {selectedMaster.name}</p>
                  <p><strong>Email:</strong> {selectedMaster.email}</p>
                  <p><strong>Phone:</strong> {selectedMaster.phone}</p>
                  <p><strong>Person ID:</strong> {selectedMaster.personId}</p>
                  <p><strong>Joining Date:</strong> {selectedMaster.joiningDate ? new Date(selectedMaster.joiningDate).toLocaleDateString() : 'N/A'}</p>
                  <p><strong>Created At:</strong> {new Date(selectedMaster.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
