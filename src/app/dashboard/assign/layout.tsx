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
    <div className="space-y-6">

      <div className="flex gap-4 pb-4">

        {filteredTabs.map((tab) => {

          const active = pathname === tab.path;

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