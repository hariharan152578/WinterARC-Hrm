"use client";

import Navbar from "@/components/layout/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // 1. Added responsive padding to the outer wrapper (p-0 on mobile, p-4 on desktop)
    <div className="min-h-screen bg-[#f4f6fb] md:p-4 lg:p-6">
      <div 
        className="
          bg-white 
          shadow-sm 
          min-h-screen 
          md:min-h-[90vh] 
          overflow-hidden 
          flex 
          flex-col
          /* 2. Remove rounded corners on mobile to save space, add them on medium screens */
          rounded-none 
          md:rounded-3xl 
        "
      >
        <Navbar />
        
        {/* 3. Fluid padding: p-4 for mobile, p-6 for tablets, p-10 for desktops */}
        <main className="flex-1 p-4 md:p-6 lg:p-10 bg-[#f7f8fc]">
          {children}
        </main>
      </div>
    </div>
  );
}