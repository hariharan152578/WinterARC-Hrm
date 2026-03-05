"use client";

import React from "react";
import { Search, Filter, MoreHorizontal } from "lucide-react";

export default function MemberList({ users }: { users: any[] }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search members..." 
            className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-all"
          />
        </div>
        <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-white hover:shadow-sm rounded-md transition-all">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50/50 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
          <tr>
            <th className="px-6 py-4">Member</th>
            <th className="px-6 py-4">Role / Dept</th>
            <th className="px-6 py-4">ID</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {users?.map((user) => (
            <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                     <img src={`http://localhost:5000/${user.profileImage}`} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{user.name}</div>
                    <div className="text-xs text-slate-500">{user.email}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-slate-700">{user.position}</div>
                <div className="text-[10px] text-slate-400 uppercase font-medium">{user.role}</div>
              </td>
              <td className="px-6 py-4 text-sm text-slate-500 tabular-nums">
                {user.personId}
              </td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${user.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <button className="p-1 hover:bg-slate-200 rounded-md transition-colors">
                  <MoreHorizontal className="w-4 h-4 text-slate-400" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}