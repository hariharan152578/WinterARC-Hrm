"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Skeleton from "@/components/ui/Skeleton";
import { Users, Coffee, Trash2, ChevronRight } from "lucide-react";
import FormInput from "@/components/ui/FormInput";

import {
  validateEmail,
  validatePhone,
  validatePassword,
} from "@/utils/validation";

import { useAuth } from "@/context/AuthContext";
import {
  getHierarchyUsers,
  createSubUser,
} from "@/services/user.service";
import api from "@/lib/axios";
import toast from "react-hot-toast";

/* ===============================
   STAT CARD COMPONENT
================================ */
function StatCard({ title, value, color, icon }: any) {
  return (
    <div className={`${color} p-6 rounded-[2rem] relative flex flex-col justify-between h-44 transition-transform hover:scale-[1.02]`}>
      <div className="p-2 bg-white/40 w-fit rounded-lg shadow-sm">
        {icon}
      </div>
      <div>
        <span className="text-xs font-semibold text-gray-700 block mb-1">{title}</span>
        <span className="text-3xl font-bold text-gray-900">{value}</span>
      </div>
      <button className="absolute bottom-6 right-6 p-1.5 bg-white/60 rounded-full border border-white/20">
        <ChevronRight size={16} />
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

  const [personId, setPersonId] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [department, setDepartment] = useState("");

  const [time, setTime] = useState(new Date());

  /* ================= CLOCK ================= */
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

  /* ================= FETCH ================= */
  const fetchUsers = async () => {
    const res = await getHierarchyUsers();
    setUsers(res.data);

    setTeamLeads(res.data.filter((u: any) => u.role === "TEAMLEAD"));
    setEmployees(res.data.filter((u: any) => u.role === "EMPLOYEE"));
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
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
      });
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Skeleton className="h-64 w-full rounded-3xl" />
        <Skeleton className="h-64 w-full rounded-3xl" />
        <Skeleton className="h-64 w-full rounded-3xl" />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="sp-4 md:p-8 space-y-8 max-w mx-auto">

      {/* ================= HEADER ================= */}
      <div className="space-y-6 animate-section">
        <div className="relative w-full rounded-[2.5rem] p-8 flex justify-between shadow-lg">
          <div>
            <h2 className="text-sm text-gray-400">
              Hello {user?.name?.split(" ")[0]} 👋
            </h2>
            <h1 className="text-3xl font-bold">{getGreeting()}</h1>
          </div>

          <div className="mt-4 md:mt-0 text-center md:text-right">
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter">
            {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })}
          </h1>
          <p className="text-gray-400 text-sm">{time.toLocaleDateString(undefined, { dateStyle: 'full' })}</p>
        </div>
        </div>
      </div>

      {/* ================= STATS ================= */}
      <div className="grid grid-cols-2 gap-4 animate-section">
        <StatCard title="TeamLeads" value={teamLeads.length} color="bg-[#E0D7FF]" icon={<Users size={16} />} />
        <StatCard title="Employees" value={employees.length} color="bg-[#D1FADF]" icon={<Coffee size={16} />} />
      </div>

      {/* ================= MAIN GRID ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* CREATE TEAMLEAD */}
        <div className="lg:col-span-8  bg-white p-8 rounded-[2.5rem] shadow-sm animate-section">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold">Create new Team Lead</h3>
            <span className="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-500 font-bold uppercase">Administrator Access</span>
          </div>
          <form
            onSubmit={async (e) => {
              e.preventDefault();

              let newErrors: any = {};

              if (!personId) newErrors.personId = "Person ID required";
              if (!name) newErrors.name = "Name required";
              if (!department) newErrors.department = "Department required";

              if (!validateEmail(email))
                newErrors.email = "Invalid email format";

              if (!validatePhone(phone))
                newErrors.phone = "Phone must be 10 digits";

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
                  role: "TEAMLEAD",
                  personId,
                  name,
                  phone,
                  email,
                  password,
                  department,
                });

                toast.success("TeamLead Created Successfully ✅");

                setPersonId("");
                setName("");
                setPhone("");
                setEmail("");
                setPassword("");
                setConfirmPassword("");
                setDepartment("");
                setErrors({});

                await fetchUsers();
              } catch (err: any) {
                toast.error(err?.response?.data?.message || "Error");
              } finally {
                setIsSubmitting(false);
              }
            }}
            className="space-y-6"
          >
             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">

            <FormInput
              label="Person ID"
              name="personId"
              value={personId}
              onChange={(e) => setPersonId(e.target.value)}
              error={errors.personId}
              />

            <FormInput
              label="Full Name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
            />

            <FormInput
              label="Email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
            />

            <FormInput
              label="Phone"
              name="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              error={errors.phone}
              />

            <FormInput
              label="Department"
              name="department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              error={errors.department}
              />

            <FormInput
              label="Password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              />

            <FormInput
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
            />

            <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-black text-white rounded-full">
              {isSubmitting ? "Creating..." : "Create TeamLead"}
            </button>
              </div>
          </form>
        </div>

        {/* TEAMLEAD LIST */}
        <div className="lg:col-span-4 space-y-6 animate-section">
          <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-50 relative min-h-[500px]">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Users size={20} /> Local Hierarchy
            </h3>
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-3 mb-4 bg-gray-50 rounded-xl text-sm"
          />

          <div className="space-y-3 max-h-[350px] overflow-y-auto">
            {teamLeads
              .filter((t) => t.name.toLowerCase().includes(search.toLowerCase()))
              .map((t) => (
                <div key={t.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                 <div>
                      <p className="text-sm font-bold text-gray-900">{t.name}- ({t.role})</p>
                      <p className={`text-[10px] text-gray-400 font-bold tracking-widest 
                        ${t.email === 'MANAGER' ? 'text-gray-500' : 'text-gray-400'}`}>
                        {t.email}
                      </p>
                    </div>
                  <Trash2 size={16} className="text-red-500 cursor-pointer" onClick={() => setConfirmDelete(t.id)} />
                </div>
              ))}
          </div>

          {confirmDelete && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-[2.5rem]">
              <div className="bg-white p-6 rounded-2xl text-center">
                <p className="mb-4 font-semibold">Are you sure?</p>
                <div className="flex justify-center gap-4">
                  <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 bg-gray-200 rounded-full">Cancel</button>
                  <button
                    onClick={async () => {
                      try {
                        await api.delete(`/users/${confirmDelete}`);
                        toast.success("Deleted ✅");
                        await fetchUsers();
                      } catch (err: any) {
                        toast.error("Delete failed");
                      } finally {
                        setConfirmDelete(null);
                      }
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded-full"
                  >
                    Delete
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