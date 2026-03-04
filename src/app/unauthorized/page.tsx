"use client";

import { useRouter } from "next/navigation";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-6xl font-bold text-red-500 mb-4">401</h1>
      <p className="text-xl text-gray-700 mb-6">
        Unauthorized Access
      </p>
      <button
        onClick={() => router.push("/login")}
        className="px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition"
      >
        Go to Login
      </button>
    </div>
  );
}