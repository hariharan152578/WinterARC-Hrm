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
  deleteSubUser,
} from "@/services/user.service";
import toast from "react-hot-toast";

/* ===============================
   STAT CARD
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

export default function TeamLeadDashboardPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const [users, setUsers] = useState<any[]>([]);
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
    <div ref={containerRef} className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">

      {/* HEADER */}
      <div className="animate-section">
        <div className="relative w-full rounded-[2.5rem] p-8 flex justify-between shadow-lg">
          <div>
            <h2 className="text-sm text-gray-400">
              Hello {user?.name?.split(" ")[0]} 👋
            </h2>
            <h1 className="text-3xl font-bold">{getGreeting()}</h1>
          </div>

          <div className="text-right">
            <h1 className="text-5xl font-black text-gray-900 tracking-tighter">
              {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })}
            </h1>
            <p className="text-gray-400 text-sm">
              {time.toLocaleDateString(undefined, { dateStyle: "full" })}
            </p>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 gap-4 animate-section">
        <StatCard title="Total Employees" value={employees.length} color="bg-[#D1FADF]" icon={<Users size={16} />} />
        <StatCard title="Active Team" value={employees.length} color="bg-[#E0D7FF]" icon={<Coffee size={16} />} />
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* CREATE EMPLOYEE */}
        <div className="lg:col-span-8 bg-white p-8 rounded-[2.5rem] shadow-sm animate-section">
          <h3 className="text-xl font-bold mb-6">Create New Employee</h3>

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

                toast.success("Employee Created");

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
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <FormInput label="Person ID" name="personId" value={personId} onChange={(e) => setPersonId(e.target.value)} error={errors.personId} />
            <FormInput label="Full Name" name="name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />
            <FormInput label="Email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
            <FormInput label="Phone" name="phone" value={phone} onChange={(e) => setPhone(e.target.value)} error={errors.phone} />
            <FormInput label="Department" name="department" value={department} onChange={(e) => setDepartment(e.target.value)} error={errors.department} />
            <FormInput label="Password" type="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} />
            <FormInput label="Confirm Password" type="password" name="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} error={errors.confirmPassword} />

            <button type="submit" disabled={isSubmitting} className="bg-black text-white rounded-full py-2">
              {isSubmitting ? "Creating..." : "Create Employee"}
            </button>
          </form>
        </div>

        {/* EMPLOYEE LIST */}
        <div className="lg:col-span-4 animate-section">
          <div className="bg-white p-6 rounded-[2.5rem] shadow-sm min-h-[500px] relative">
            <h3 className="font-bold text-lg mb-4">My Employees</h3>

            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full p-3 mb-4 bg-gray-50 rounded-xl text-sm"
            />

            <div className="space-y-3 max-h-[350px] overflow-y-auto">
              {employees
                .filter(e => e.name.toLowerCase().includes(search.toLowerCase()))
                .map(e => (
                  <div key={e.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-sm font-bold">{e.name}</p>
                      <p className="text-xs text-gray-400">{e.email}</p>
                    </div>
                    <Trash2 size={16} className="text-red-500 cursor-pointer" onClick={() => setConfirmDelete(e.id)} />
                  </div>
                ))}
            </div>

            {confirmDelete && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-[2.5rem]">
                <div className="bg-white p-6 rounded-2xl text-center">
                  <p className="mb-4 font-semibold">Are you sure?</p>
                  <div className="flex gap-4 justify-center">
                    <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 bg-gray-200 rounded-full">
                      Cancel
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          await deleteSubUser(confirmDelete);
                          toast.success("Deleted ✅");
                          await fetchUsers();
                        } catch (err: any) {
                          toast.error(err?.response?.data?.message || "Delete failed");
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