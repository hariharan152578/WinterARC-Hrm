"use client";

import Navbar from "@/components/layout/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f4f6fb] p-6">
      <div className="bg-white rounded-3xl shadow-sm min-h-[90vh] overflow-hidden flex flex-col">
        <Navbar />
        <main className="flex-1 p-10 bg-[#f7f8fc]">
          {children}
        </main>
      </div>
    </div>
  );
}