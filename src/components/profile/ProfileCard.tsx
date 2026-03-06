"use client";

import React, { useState } from "react";
import EditProfileModal from "./EditProfileModal";
import { Settings, Mail, Phone, Building2, Calendar } from "lucide-react";

interface Props {
  user: any;
  setUser: any;
}

const ProfileCard = ({ user, setUser }: Props) => {
  const [open, setOpen] = useState(false);

  const imgPath = user.profileImage
    ? `http://localhost:5000/${user.profileImage}`
    : "/avatar.png";

  return (
    <div className="min-h-screen bg-[#F9F9F9] p-4 md:p-8 lg:p-12 font-sans text-slate-900">
      {/* Main Container: max-w-7xl allows it to look good on ultra-wide screens */}
      <div className="max-w-7xl mx-auto bg-white rounded-[2rem] md:rounded-[3rem] shadow-sm overflow-hidden border border-gray-100">
        
        {/* 1. Header Section */}
        <div className="px-6 md:px-12 pt-8 md:pt-12 pb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src={imgPath}
              className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover border border-gray-100"
              alt="Avatar"
            />
            <div>
              <h3 className="text-base md:text-lg font-bold leading-tight">{user.name}</h3>
              <p className="text-xs md:text-sm text-slate-400 uppercase tracking-wider">
                {user.role || "Team Member"}
              </p>
            </div>
          </div>
          
          <button 
            onClick={() => setOpen(true)}
            className="p-3 hover:bg-slate-100 rounded-full transition-all text-slate-400 hover:text-slate-900 border border-transparent hover:border-gray-200"
          >
            <Settings size={24} />
          </button>
        </div>

        {/* 2. Responsive Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 p-6 md:p-12 pt-0">
          
          {/* Left Column: Image and Hero Text */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight leading-[1.1]">
                Hi, I'm {user.name.split(' ')[0]}: <br />
                <span className="text-slate-400">{user.role}</span>
              </h1>
              <p className="text-slate-500 leading-relaxed text-base md:text-lg max-w-xl">
                {user.description || "I contribute to the team by blending creativity and functionality to craft unique digital experiences."}
              </p>
            </div>

            <div className="relative rounded-[2rem] overflow-hidden aspect-square lg:aspect-[4/5] shadow-inner bg-slate-50">
              <img
                src={imgPath}
                className="w-full h-full object-cover"
                alt="Featured Large"
              />
              <div className="absolute bottom-6 right-8 bg-white/20 backdrop-blur-lg px-4 py-2 rounded-full border border-white/30">
                <span className="text-xs text-white font-medium uppercase tracking-widest">
                  {user.name}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Detailed Information */}
          <div className="flex flex-col justify-center space-y-12">
            
            {/* Contact Grid */}
            <section>
              <h2 className="text-2xl md:text-3xl font-medium mb-8">Contact & Identity</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-slate-50 rounded-2xl text-slate-400"><Mail size={20}/></div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-1 font-bold">Email</p>
                    <p className="text-sm md:text-base font-medium break-all">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-slate-50 rounded-2xl text-slate-400"><Phone size={20}/></div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-1 font-bold">Phone</p>
                    <p className="text-sm md:text-base font-medium">{user.phone || "Not provided"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-slate-50 rounded-2xl text-slate-400"><Building2 size={20}/></div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-1 font-bold">Department</p>
                    <p className="text-sm md:text-base font-medium">{user.department || "General"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-slate-50 rounded-2xl text-slate-400"><Calendar size={20}/></div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-1 font-bold">Member Since</p>
                    <p className="text-sm md:text-base font-medium">{user.joiningDate || "—"}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Biography Section */}
            <section className="p-8 md:p-10 bg-slate-50 rounded-[2rem] border border-slate-100">
              <h2 className="text-xl md:text-2xl font-medium mb-4">Professional Biography</h2>
              <p className="text-slate-500 leading-relaxed text-sm md:text-base italic">
                 "{user.description || "Every journey is unique. This team member is currently crafting their story within our organization."}"
              </p>
            </section>

          </div>
        </div>
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