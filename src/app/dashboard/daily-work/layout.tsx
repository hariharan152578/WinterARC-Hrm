"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function DailyWorkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const pathname = usePathname();

  const allTabs = [
    {
      name: "Inbox",
      href: "/dashboard/daily-work/inbox",
      roles: ["MASTER_ADMIN", "ADMIN", "MANAGER", "TEAMLEAD"],
    },
    {
      name: "My Reports",
      href: "/dashboard/daily-work/my-reports",
      roles: ["MASTER_ADMIN", "ADMIN", "MANAGER", "TEAMLEAD", "EMPLOYEE"],
    }
  ];

  const tabs = allTabs.filter(tab => tab.roles.includes(user?.role || ""));

  return (
    <div className="p-6">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Daily Work Reports
        </h1>
        <p className="text-gray-500 text-sm font-medium">
          Manage and view daily work submissions
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b mb-6 overflow-x-auto scrollbar-hide">

        {tabs.map((tab) => {
          const active = pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`px-4 py-2 text-sm font-black whitespace-nowrap border-b-2 transition-all duration-300
                ${
                  active
                    ? "border-[#00A884] text-[#00A884]"
                    : "border-transparent text-gray-400 hover:text-gray-700"
                }`}
            >
              {tab.name}
            </Link>
          );
        })}

      </div>

      {/* Child pages */}
      <div>{children}</div>
    </div>
  );
}