"use client";

import { useState } from "react";
import { X, User, ArrowRight, Loader2, CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react";
import api from "@/lib/axios";
import toast from "react-hot-toast";

interface LoginRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginRequestModal({ isOpen, onClose }: LoginRequestModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [emailOrPersonId, setEmailOrPersonId] = useState("");
  const [userData, setUserData] = useState<any>(null);
  const [approvers, setApprovers] = useState<any[]>([]);
  const [selectedApprover, setSelectedApprover] = useState("");
  const [reason, setReason] = useState("");
  const [password, setPassword] = useState("");

  if (!isOpen) return null;

  const handleNextStep1 = async () => {
    if (!emailOrPersonId) return toast.error("Please enter email or person ID");
    
    setLoading(true);
    try {
      const res = await api.post(`/auth/request-identity`, { emailOrPersonId });
      setUserData(res.data.user);
      setApprovers(res.data.approvers);
      setStep(2);
    } catch (err: any) {
      console.error("Login request error details:", err);
      toast.error(err.response?.data?.message || `Request failed: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep2 = () => {
    if (!selectedApprover) return toast.error("Please select an approver");
    setStep(3);
  };

  const handleSubmit = async () => {
    if (!reason || !password) return toast.error("All fields are required");

    setLoading(true);
    try {
      await api.post(`/auth/create-login-request`, {
        userId: userData.id,
        password,
        approverId: selectedApprover,
        reason
      });
      setStep(4);
      toast.success("Request raised successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setStep(1);
    setEmailOrPersonId("");
    setUserData(null);
    setApprovers([]);
    setSelectedApprover("");
    setReason("");
    setPassword("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={resetAndClose} />
      
      <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-300">
        <button 
          onClick={resetAndClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-full transition-all z-10"
        >
          <X size={20} />
        </button>

        <div className="p-8 md:p-10">
          {/* Header */}
          <div className="mb-8">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors ${step === 4 ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'}`}>
              {step === 4 ? <CheckCircle2 size={24} /> : <ShieldCheck size={24} />}
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              {step === 4 ? "Request Sent" : "Request Multiple Login"}
            </h2>
            <p className="text-sm text-slate-400 mt-1 font-medium">
              {step === 1 && "Identify yourself to see eligible approvers."}
              {step === 2 && `Hi ${userData?.name}, select who should approve your login.`}
              {step === 3 && "Securely verify and provide a reason."}
              {step === 4 && "Your request is pending review."}
            </p>
          </div>

          {/* Stepper */}
          {step < 4 && (
            <div className="flex items-center gap-2 mb-8">
              {[1, 2, 3].map(i => (
                <div 
                  key={i} 
                  className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-purple-600' : 'bg-slate-100'}`} 
                />
              ))}
            </div>
          )}

          {/* Content */}
          <div className="space-y-6">
            {step === 1 && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Account ID</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    placeholder="Email or Person ID"
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 ring-purple-100 outline-none transition-all"
                    value={emailOrPersonId}
                    onChange={(e) => setEmailOrPersonId(e.target.value)}
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Your Role</p>
                  <p className="text-sm font-bold text-slate-900">{userData?.role}</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Select Approver</label>
                  <div className="grid gap-2">
                    {approvers.map(app => (
                      <button
                        key={app.id}
                        onClick={() => setSelectedApprover(app.id)}
                        className={`p-4 rounded-2xl border text-left transition-all ${selectedApprover === app.id ? 'bg-purple-50 border-purple-200 ring-1 ring-purple-100' : 'bg-white border-slate-100 hover:border-purple-200'}`}
                      >
                        <p className="text-sm font-bold text-slate-900">{app.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{app.role} • {app.department || "No Dept"}</p>
                      </button>
                    ))}
                    {approvers.length === 0 && (
                      <div className="p-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <AlertCircle className="mx-auto text-slate-300 mb-2" size={24} />
                        <p className="text-xs text-slate-500 font-medium">No higher-ups found in your company.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Reason for Multiple Login</label>
                  <textarea
                    rows={3}
                    placeholder="Enter short reason..."
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 ring-purple-100 outline-none transition-all resize-none"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Security Verification</label>
                  <input
                    type="password"
                    placeholder="Verify your password"
                    className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 ring-purple-100 outline-none transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="text-center py-6">
                <p className="text-slate-500 font-medium mb-8">
                  Your request has been sent to your supervisor. Once approved, you will be able to log in again.
                </p>
                <button
                  onClick={resetAndClose}
                  className="w-full bg-green-500 text-white py-4 rounded-2xl font-bold hover:bg-green-600 transition-all active:scale-[0.98]"
                >
                  Done
                </button>
              </div>
            )}

            {step < 4 && (
              <button
                onClick={step === 1 ? handleNextStep1 : step === 2 ? handleNextStep2 : handleSubmit}
                disabled={loading}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-70 shadow-lg shadow-slate-200"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : "Continue"}
                {!loading && <ArrowRight size={18} />}
              </button>
            )}
            
            {step > 1 && step < 4 && (
              <button 
                onClick={() => setStep(step - 1)}
                className="w-full text-slate-400 text-xs font-bold uppercase tracking-widest py-2 hover:text-slate-600 transition-colors"
              >
                Back to previous stage
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
