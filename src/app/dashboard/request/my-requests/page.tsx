"use client";

import { useEffect, useState, useRef, useLayoutEffect } from "react";
import api from "@/lib/axios";
import gsap from "gsap";

interface User {
  id: number;
  name: string;
  role: string;
}

interface Request {
  id: number;
  subject: string;
  description: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  message?: string | null;
  creator: User;
  approver: User;
}

const ITEMS_PER_PAGE = 5;

export default function MyRequestsPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  const [requests, setRequests] = useState<Request[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<Request[]>([]);
  const [activeTab, setActiveTab] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRequest, setSelectedRequest] =
    useState<Request | null>(null);

  /* ================= FETCH ================= */
  useEffect(() => {
    api.get("/requests/my-created").then((res) => {
      setRequests(res.data);
      setFilteredRequests(res.data);
    });
  }, []);

  /* ================= ANIMATION ================= */
  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(".animate-section", {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out",
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  /* ================= FILTERING ================= */
  useEffect(() => {
    let data = requests;

    if (activeTab !== "ALL") {
      data = requests.filter((r) => r.status === activeTab);
    }

    setFilteredRequests(data);
    setCurrentPage(1);
  }, [activeTab, requests]);

  const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE);

  const paginatedData = filteredRequests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-600";
      case "REJECTED":
        return "bg-red-100 text-red-600";
      default:
        return "bg-yellow-100 text-yellow-600";
    }
  };

  return (
    <div ref={containerRef} className="space-y-8">

      {/* HEADER */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm animate-section">
        <h2 className="text-sm text-gray-400">Overview</h2>
        <h1 className="text-3xl font-bold mt-1">My Requests</h1>
      </div>

      {/* FILTER TABS */}
      <div className="flex gap-4 animate-section">
        {["ALL", "PENDING", "APPROVED", "REJECTED"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition ${
              activeTab === tab
                ? "bg-black text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* TIMELINE */}
      <div className="relative pl-8 animate-section">
        <div className="absolute left-3 top-0 bottom-0 w-[2px] bg-gray-200"></div>

        {paginatedData.map((req) => (
          <div key={req.id} className="relative mb-10">
            <div
              className="bg-white p-6 rounded-[2rem] shadow-sm hover:shadow-md transition cursor-pointer"
              onClick={() => setSelectedRequest(req)}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-3">
                <span className="font-medium text-gray-800">
                  From: {req.creator?.name ?? "Unknown User"}
                </span>
                <span className="text-gray-400">
                  • {req.creator?.role ?? "Unknown Role"}
                </span>
              </div>
                <span
                  className={`px-4 py-1 text-xs rounded-full ${getStatusStyle(
                    req.status
                  )}`}
                >
                  {req.status}
                </span>
              </div>

              {/* From + Role */}
              <div className="flex flex-col items-start gap-2 text-sm text-gray-600 mt-3">
                <span className="font-medium text-gray-800">
                  subject: {req.subject}
                </span>
                <span className="text-gray-400">
                description: {req.description ?? "No description provided"}
                </span>
              </div>

              <p className="text-xs text-gray-400 mt-3">
                {new Date(req.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-3 animate-section">
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index + 1)}
              className={`w-10 h-10 rounded-full ${
                currentPage === index + 1
                  ? "bg-black text-white"
                  : "bg-gray-100"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}

      {/* MODAL */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[550px] rounded-[2rem] p-8 space-y-6 shadow-xl">
            <h2 className="text-xl font-bold">
              {selectedRequest.subject}
            </h2>

            <span
              className={`px-4 py-1 text-xs rounded-full ${getStatusStyle(
                selectedRequest.status
              )}`}
            >
              {selectedRequest.status}
            </span>
              <p className="text-sm text-gray-600">
              {selectedRequest.subject}
            </p>
            <p className="text-sm text-gray-600">
              {selectedRequest.description}
            </p>

            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-xs text-gray-400 mb-1">Sender</p>
              <p className="font-semibold">
                {selectedRequest.creator?.name}
              </p>
              <p className="text-xs text-gray-500">
                Role: {selectedRequest.creator?.role}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-xs text-gray-400 mb-1">
                Approved / Reviewed By
              </p>
              <p className="font-semibold">
                {selectedRequest.approver?.name}
              </p>
              <p className="text-xs text-gray-500">
                Role: {selectedRequest.approver?.role}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-xs text-gray-400 mb-1">
                Approver Message
              </p>
              <p className="text-sm text-gray-700">
                {selectedRequest.message || "No message provided"}
              </p>
            </div>

            <p className="text-xs text-gray-400">
              Created:{" "}
              {new Date(selectedRequest.createdAt).toLocaleString()}
            </p>

            <button
              onClick={() => setSelectedRequest(null)}
              className="w-full py-3 bg-black text-white rounded-full"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}