"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function RequestsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useAuth();

  const tabs = [
    {
      name: "My Tasks",
      path: "/dashboard/assign/mytask",
      roles: ["EMPLOYEE", "MANAGER", "TEAMLEAD"],
    },
    {
      name: "Assign Task",
      path: "/dashboard/assign/assigned",
      roles: ["ADMIN", "MANAGER", "TEAMLEAD"],
    },
  ];

  const filteredTabs = tabs.filter((tab) =>
    tab.roles.includes(user?.role as string)
  );

  return (
    <div className="space-y-4 md:space-y-6">
      {/* 1. Responsive Tab Container: 
          - flex-nowrap + overflow-x-auto ensures tabs don't wrap to a second line.
          - no-scrollbar hides the scrollbar for a cleaner mobile UI.
      */}
      <div className="flex items-center gap-2 md:gap-4 pb-2 md:pb-4 overflow-x-auto no-scrollbar border-b border-gray-100 md:border-none">
        {filteredTabs.map((tab) => {
          const active = pathname === tab.path;

          return (
            <Link
              key={tab.path}
              href={tab.path}
              className={`
                px-4 py-2 
                rounded-full 
                text-xs md:text-sm 
                font-semibold 
                whitespace-nowrap 
                transition-all
                ${
                  active
                    ? "bg-black text-white shadow-md shadow-purple-100" 
                    : "text-gray-500 hover:bg-gray-100 hover:text-black"
                }
              `}
            >
              {tab.name}
            </Link>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        {children}
      </div>
    </div>
  );
}