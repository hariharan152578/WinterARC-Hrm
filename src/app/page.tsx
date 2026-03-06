"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { user, loading } = useAuth(); // Assuming your context has a loading state
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace("/dashboard");
      } else {
        router.replace("/login");
      }
    }
  }, [user, loading, router]);

  // A centered loader ensures a smooth transition on mobile and desktop
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-100">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
    </div>
  );
}