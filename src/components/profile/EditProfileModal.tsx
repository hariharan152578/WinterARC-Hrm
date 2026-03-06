"use client";

import React, { useState } from "react";
import { updateUserProfile } from "@/services/profile.service";
import { X } from "lucide-react";

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
    if (image) formData.append("profileImage", image);

    const res = await updateUserProfile(formData);
    setUser(res.user);
    setOpen(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl relative">
        <button 
          onClick={() => setOpen(false)}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>

        <div className="space-y-4">
          <div>
            <label className="text-[11px] uppercase tracking-widest text-slate-400 font-bold ml-1">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border-none bg-slate-50 p-4 rounded-2xl mt-1 focus:ring-2 focus:ring-slate-200 outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-widest text-slate-400 font-bold ml-1">About Bio</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border-none bg-slate-50 p-4 rounded-2xl mt-1 focus:ring-2 focus:ring-slate-200 outline-none resize-none"
            />
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-widest text-slate-400 font-bold ml-1">Profile Photo</label>
            <input
              type="file"
              onChange={(e) => {
                if (e.target.files) setImage(e.target.files[0]);
              }}
              className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 mt-2"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <button
            onClick={() => setOpen(false)}
            className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-800"
          >
            Discard
          </button>
          <button
            onClick={handleSubmit}
            className="px-8 py-3 bg-slate-900 text-white rounded-full text-sm font-bold hover:bg-slate-800 transition-transform active:scale-95"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;