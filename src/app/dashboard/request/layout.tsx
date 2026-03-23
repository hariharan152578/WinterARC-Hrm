"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import path from "path";

export default function RequestsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useAuth();

  const tabs = [
    {
      name: "Overview",
      path: "/dashboard/request",
      roles: ["ADMIN", "MANAGER", "TEAMLEAD"],
    },
    {
      name: "Create Request",
      path: "/dashboard/request/create",
      roles: ["EMPLOYEE", "MANAGER", "TEAMLEAD"],
    },
    {
      name: "My Requests",
      path: "/dashboard/request/my-requests",
      roles: ["EMPLOYEE", "MANAGER", "TEAMLEAD"],
    }
  ];

  const filteredTabs = tabs.filter((tab) =>
    tab.roles.includes(user?.role as string)
  );

  return (
    <div className="space-y-6">
      <div className="flex gap-4 pb-4 border-b border-slate-100 mb-4 overflow-x-auto scrollbar-hide">
        {filteredTabs.map((tab) => {
          const active = pathname.startsWith(tab.path);

          return (
            <Link
              key={tab.path}
              href={tab.path}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                active
                  ? "bg-[#e8f5f4] text-[#2d6a4f] shadow-sm"
                  : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
              }`}
            >
              {tab.name}
            </Link>
          );
        })}
      </div>

      {children}
    </div>
  );
}