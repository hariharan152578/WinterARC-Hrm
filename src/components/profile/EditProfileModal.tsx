"use client";

import React, { useState } from "react";
import { updateUserProfile } from "@/services/profile.service";

interface Props {
  open: boolean;
  setOpen: (value: boolean) => void;
  user: any;
  setUser: any;
}

const EditProfileModal = ({ open, setOpen, user, setUser }: Props) => {

  const [phone, setPhone] = useState(user.phone || "");
  const [description, setDescription] = useState(user.description || "");
  const [image, setImage] = useState<File | null>(null);

  if (!open) return null;

  const handleSubmit = async () => {
    const formData = new FormData();

    formData.append("phone", phone);
    formData.append("description", description);

    if (image) {
      formData.append("profileImage", image);
    }

    const res = await updateUserProfile(formData);

    setUser(res.user);
    setOpen(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

      <div className="bg-white rounded-xl p-8 w-[400px]">

        <h2 className="text-xl font-semibold mb-4">
          Edit Profile
        </h2>

        <input
          type="text"
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full border p-2 rounded mb-3"
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border p-2 rounded mb-3"
        />

        <input
          type="file"
          onChange={(e) => {
            if (e.target.files) setImage(e.target.files[0]);
          }}
          className="mb-4"
        />

        <div className="flex justify-end gap-3">

          <button
            onClick={() => setOpen(false)}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Save
          </button>

        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;