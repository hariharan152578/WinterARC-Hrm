"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Lock, Mail, User, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [emailOrPersonId, setEmailOrPersonId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!emailOrPersonId || !password) {
      toast.error("All fields are required");
      return;
    }

    try {
      setLoading(true);
      const isEmail = emailOrPersonId.includes("@");
      await login(
        isEmail ? emailOrPersonId : null,
        isEmail ? null : emailOrPersonId,
        password
      );
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans">
      {/* LEFT SIDE: Login Form */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center px-8 md:px-16 lg:px-24">
        <div className="max-w-md w-full mx-auto">
          {/* Logo */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold tracking-tight">
              <span className="text-slate-900">HR</span>
              <span className="text-purple-600">CONNEX.</span>
            </h1>
            <p className="text-gray-400 mt-2 font-medium">Please enter your details to sign in.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Account Access</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  {emailOrPersonId.includes("@") ? <Mail size={18} /> : <User size={18} />}
                </div>
                <input
                  type="text"
                  name="username" // Added
                  autoComplete="username" // Added
                  placeholder="Email or Person ID"
                  className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 ring-purple-100 outline-none transition-all"
                  value={emailOrPersonId}
                  onChange={(e) => setEmailOrPersonId(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Password</label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  name="password" // Added
                  autoComplete="current-password" // Added
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 ring-purple-100 outline-none transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                <span className="text-xs font-medium text-gray-500">Remember me</span>
              </label>
              <button type="button" className="text-xs font-semibold text-purple-600 hover:underline">Forgot password?</button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-70 mt-4 shadow-lg shadow-slate-200"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Sign In"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="text-center mt-8 text-sm text-gray-400 font-medium">
            Don`t have an account? <span className="text-purple-600 font-bold cursor-pointer hover:underline">Contact Admin</span>
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Visual Content & Branding */}
      <div
        className="hidden lg:flex w-[55%] m-4 rounded-[2.5rem] relative flex-col items-center justify-end overflow-hidden p-12 bg-cover bg-center"
        style={{ backgroundImage: "url('https://res.cloudinary.com/dlb52kdyx/image/upload/v1754579024/samples/imagecon-group.jpg')" }}
      >
        {/* Dark Overlay for contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Decorative Blurs */}
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/20 rounded-full blur-[100px]" />

        {/* Content Box (Glassmorphism) */}
        <div className="relative z-10 w-full max-w-lg bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-[2rem] text-white">
          <h2 className="text-3xl font-bold mb-4 leading-tight">Empowering teams with seamless HR solutions.</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="bg-green-400/20 p-1 rounded-full"><CheckCircle2 size={18} className="text-green-400" /></div>
              <span className="text-white/90 font-medium">Simplify payroll and attendance</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-green-400/20 p-1 rounded-full"><CheckCircle2 size={18} className="text-green-400" /></div>
              <span className="text-white/90 font-medium">Boost employee engagement</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}