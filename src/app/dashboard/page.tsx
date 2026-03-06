"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { roleHomeRoute } from "@/lib/rbac";
import Skeleton from "@/components/ui/Skeleton";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // 🚨 If no user → go to login
    if (!user) {
      router.replace("/login");
      return;
    }

    // ✅ Redirect to role-based home route (e.g., /dashboard/admin or /dashboard/employee)
    const redirectPath = roleHomeRoute[user.role as keyof typeof roleHomeRoute];

    if (redirectPath) {
      router.replace(redirectPath);
    } else {
      router.replace("/401");
    }
  }, [user, loading, router]);

  // We make the skeleton responsive to match the "main" content area padding
  if (loading) {
    return (
      <div className="w-full h-full p-4 md:p-6 lg:p-10 space-y-6">
        <Skeleton className="h-10 w-1/3 rounded-lg" /> {/* Mimics a Title */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return null;
}