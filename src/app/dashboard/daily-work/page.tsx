"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function DailyWorkPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.role === "EMPLOYEE") {
      router.replace("/dashboard/daily-work/my-reports");
    } else {
      router.replace("/dashboard/daily-work/inbox");
    }
  }, [router, user]);

  return null;
}