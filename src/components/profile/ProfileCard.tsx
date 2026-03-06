"use client";

import React, { useState } from "react";
import EditProfileModal from "./EditProfileModal";

interface Props {
  user: any;
  setUser: any;
}

const ProfileCard = ({ user, setUser }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl p-8">

      {/* Header */}
      <div className="flex items-center gap-6">

        <img
          src={
            user.profileImage
              ? `http://localhost:5000/${user.profileImage}`
              : "/avatar.png"
          }
          className="w-28 h-28 rounded-full object-cover border-4 border-gray-200"
        />

        <div>
          <h2 className="text-2xl font-bold">{user.name}</h2>
          <p className="text-gray-500">{user.role}</p>

          <button
            onClick={() => setOpen(true)}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Edit Profile
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="border my-6"></div>

      {/* Info */}
      <div className="grid grid-cols-2 gap-6">

        <div>
          <p className="text-gray-500 text-sm">Email</p>
          <p className="font-medium">{user.email}</p>
        </div>

        <div>
          <p className="text-gray-500 text-sm">Phone</p>
          <p className="font-medium">{user.phone || "-"}</p>
        </div>

        <div>
          <p className="text-gray-500 text-sm">Department</p>
          <p className="font-medium">{user.department || "-"}</p>
        </div>

        <div>
          <p className="text-gray-500 text-sm">Joining Date</p>
          <p className="font-medium">{user.joiningDate || "-"}</p>
        </div>
      </div>

      {/* Description */}
      <div className="mt-6">
        <p className="text-gray-500 text-sm">About</p>
        <p className="text-gray-700 mt-2">{user.description || "-"}</p>
      </div>

      <EditProfileModal
        open={open}
        setOpen={setOpen}
        user={user}
        setUser={setUser}
      />
    </div>
  );
};

export default ProfileCard;