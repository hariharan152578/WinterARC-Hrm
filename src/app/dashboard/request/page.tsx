"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import { CheckCircle, XCircle, Search } from "lucide-react";
import gsap from "gsap";

interface Request {
  id: number;
  subject: string;
  description: string;
  status: string;
  createdAt: string;
  creator: {
    id: number;
    name: string;
    role: string;
  };
}

function StatCard({ title, value, color }: any) {
  return (
    <div
      className={`${color} p-6 rounded-[2rem] flex flex-col justify-between h-36 transition-transform hover:scale-[1.02]`}
    >
      <span className="text-xs font-semibold text-gray-700">{title}</span>
      <span className="text-3xl font-bold text-gray-900">{value}</span>
    </div>
  );
}

export default function InboxPage() {
  const { user } = useAuth();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const [requests, setRequests] = useState<Request[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [actionType, setActionType] =
    useState<"APPROVE" | "REJECT" | null>(null);
  const [message, setMessage] = useState("");

  /* ================= ROLE REDIRECT ================= */
  useEffect(() => {
    if (!user) return;

    if (user.role === "EMPLOYEE") {
      router.replace("/dashboard/request/my-requests");
    }
  }, [user, router]);

  /* ================= FETCH ================= */
  const fetchInbox = async () => {
    try {
      setLoading(true);

      const res = await api.get("/requests/inbox");

      setRequests(res.data);
      setFilteredRequests(res.data);
    } catch (err: any) {
      console.log("Inbox Error:", err?.response);
      toast.error(
        err?.response?.data?.message || "Failed to load inbox"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;

    if (user.role !== "EMPLOYEE") {
      fetchInbox();
    }
  }, [user]);

  /* ================= FILTER ================= */
  useEffect(() => {
    const filtered = requests.filter((req) =>
      req.subject.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredRequests(filtered);
  }, [search, requests]);

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

  /* ================= ACTION ================= */
  const handleAction = async () => {
    if (!selectedRequest || !actionType) return;

    try {
      await api.put(`/requests/${selectedRequest.id}/action`, {
        action: actionType,
        message,
      });

      toast.success(`Request ${actionType}D successfully ✅`);
      setSelectedRequest(null);
      setMessage("");
      fetchInbox();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Action failed"
      );
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-6">
        <div className="h-36 bg-gray-200 rounded-[2rem] animate-pulse" />
        <div className="h-36 bg-gray-200 rounded-[2rem] animate-pulse" />
        <div className="h-36 bg-gray-200 rounded-[2rem] animate-pulse" />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">

      {/* ================= HEADER ================= */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm flex justify-between items-center animate-section">
        <div>
          <h2 className="text-sm text-gray-400">
            Hello {user?.name?.split(" ")[0]} 👋
          </h2>
          <h1 className="text-3xl font-bold">
            Request Inbox
          </h1>
        </div>

        <div className="text-sm bg-black text-white px-4 py-2 rounded-full">
          {user?.role}
        </div>
      </div>

      {/* ================= STATS ================= */}
      <div className="grid grid-cols-3 gap-6 animate-section">
        <StatCard
          title="Pending"
          value={requests.filter(r => r.status === "PENDING").length}
          color="bg-[#E0D7FF]"
        />
        <StatCard
          title="Today"
          value={
            requests.filter(
              (r) =>
                new Date(r.createdAt).toDateString() ===
                new Date().toDateString()
            ).length
          }
          color="bg-[#D1FADF]"
        />
        <StatCard
          title="Total"
          value={requests.length}
          color="bg-[#FFE2E5]"
        />
      </div>

      {/* ================= SEARCH ================= */}
      <div className="relative w-96 animate-section">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          size={18}
        />
        <input
          placeholder="Search by subject..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white rounded-[2rem] shadow-sm focus:outline-none"
        />
      </div>

      {/* ================= REQUEST LIST ================= */}
      <div className="bg-white rounded-[2.5rem] shadow-sm divide-y animate-section">
        {filteredRequests.length === 0 && (
          <p className="p-8 text-center text-gray-400">
            No requests found
          </p>
        )}

        {filteredRequests.map((req) => (
          <div
            key={req.id}
            className="flex justify-between items-start p-6 hover:bg-gray-50 transition"
          >
            <div className="max-w-lg space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="font-medium text-gray-800">
                  From: {req.creator?.name ?? "Unknown"}
                </span>
                <span className="text-gray-400">
                  • {req.creator?.role ?? ""}
                </span>
              </div>

              <span
                className={`px-3 py-1 text-xs rounded-full font-medium ${
                  req.status === "PENDING"
                    ? "bg-yellow-100 text-yellow-700"
                    : req.status === "APPROVED"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {req.status}
              </span>

              <p className="font-semibold text-lg text-gray-900">
                {req.subject}
              </p>

              <p className="text-sm text-gray-500">
                {req.description}
              </p>

              <p className="text-xs text-gray-400">
                {new Date(req.createdAt).toLocaleString()}
              </p>
            </div>

            <div className="flex gap-3 mt-2">
              <button
                onClick={() => {
                  setSelectedRequest(req);
                  setActionType("APPROVE");
                }}
                className="p-2 bg-green-100 text-green-600 rounded-full hover:scale-110 transition"
              >
                <CheckCircle size={20} />
              </button>

              <button
                onClick={() => {
                  setSelectedRequest(req);
                  setActionType("REJECT");
                }}
                className="p-2 bg-red-100 text-red-600 rounded-full hover:scale-110 transition"
              >
                <XCircle size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ================= ACTION MODAL ================= */}
      {selectedRequest && actionType && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[420px] rounded-[2rem] p-8 space-y-6 shadow-xl">
            <h3 className="text-xl font-semibold">
              {actionType} Request
            </h3>

            <textarea
              placeholder="Add message (optional)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-black/20"
            />

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setSelectedRequest(null);
                  setMessage("");
                }}
                className="flex-1 py-3 bg-gray-100 rounded-full"
              >
                Cancel
              </button>

              <button
                onClick={handleAction}
                className={`flex-1 py-3 rounded-full text-white ${
                  actionType === "APPROVE"
                    ? "bg-green-600"
                    : "bg-red-600"
                }`}
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