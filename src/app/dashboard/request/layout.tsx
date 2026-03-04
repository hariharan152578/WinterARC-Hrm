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
    },
    {
      name: "Assign Task",
      path: "/dashboard/request/assign",
      roles: ["ADMIN", "MANAGER", "TEAMLEAD","EMPLOYEE"],
    },
  ];

  const filteredTabs = tabs.filter((tab) =>
    tab.roles.includes(user?.role as string)
  );

  return (
    <div className="space-y-6">
      <div className="flex gap-4 pb-4">
        {filteredTabs.map((tab) => {
          const active = pathname.startsWith(tab.path);

          return (
            <Link
              key={tab.path}
              href={tab.path}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                active
                  ? "bg-gray-100 text-black"
                  : "text-gray-500 hover:text-black"
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