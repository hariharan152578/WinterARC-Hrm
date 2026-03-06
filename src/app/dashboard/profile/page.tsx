"use client";

import React, { useEffect, useState } from "react";
import { getUserProfile } from "@/services/profile.service";
import ProfileCard from "@/components/profile/ProfileCard";

interface User {
  id: number;
  name: string;
  email: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");

    if (stored) {
      const parsed: User = JSON.parse(stored);

      getUserProfile(parsed.id).then((data) => {
        setUser(data);
      });
    }
  }, []);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <ProfileCard user={user} setUser={setUser} />
    </div>
  );
}