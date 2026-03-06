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

    // ✅ Redirect to role-based home route
    const redirectPath = roleHomeRoute[user.role];

    if (redirectPath) {
      router.replace(redirectPath);
    } else {
      router.replace("/401");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="p-6">
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return null;
}