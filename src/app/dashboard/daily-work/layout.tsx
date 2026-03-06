"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DailyWorkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const tabs = [
    {
      name: "Inbox",
      href: "/dashboard/daily-work/inbox",
    },
    {
      name: "My Reports",
      href: "/dashboard/daily-work/my-reports",
    },
    {
      name: "Submit",
      href: "/dashboard/daily-work/submit",
    },
  ];

  return (
    <div className="p-6">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Daily Work Reports
        </h1>
        <p className="text-gray-500">
          Manage and view daily work submissions
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b mb-6">

        {tabs.map((tab) => {
          const active = pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition
                ${
                  active
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-black"
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