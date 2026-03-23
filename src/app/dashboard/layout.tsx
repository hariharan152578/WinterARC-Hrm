"use client";

import Sidebar from "@/components/layout/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col lg:flex-row overflow-x-hidden">
      {/* SIDEBAR - Fixed on mobile, sticky on desktop */}
      <Sidebar />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 w-full min-h-screen lg:h-screen lg:overflow-y-auto px-4 md:px-6 lg:px-8 pt-20 pb-6 lg:py-8 transition-all duration-500">
        <div className="max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
          {children}
        </div>

        {/* Mobile Spacer (for bottom menu if needed) */}
        <div className="h-20 lg:hidden" />
      </main>
    </div>
  );
}