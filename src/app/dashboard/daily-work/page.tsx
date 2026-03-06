"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DailyWorkPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/daily-work/inbox");
  }, [router]);

  return null;
}