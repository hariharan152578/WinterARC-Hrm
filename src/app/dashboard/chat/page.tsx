"use client";

import { useState } from "react";
import ChatSidebar from "@/components/dashboard/chat/ChatSidebar";
import ChatArea from "@/components/dashboard/chat/ChatArea";

export default function ChatPage() {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);

  const handleSelectUser = (user: any) => {
    setSelectedGroup(null);
    setSelectedUser(user);
  };

  const handleSelectGroup = (group: any) => {
    setSelectedUser(null);
    setSelectedGroup(group);
  };

  const selectedChatId = selectedUser ? `user_${selectedUser.id}` : selectedGroup ? `group_${selectedGroup.id}` : null;

  return (
    <div className="flex bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden h-[calc(100vh-200px)]">
      {/* Sidebar - Contacts & Groups */}
      <ChatSidebar 
        onSelectUser={handleSelectUser} 
        onSelectGroup={handleSelectGroup}
        selectedChatId={selectedChatId}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50/50">
        {selectedUser || selectedGroup ? (
          <ChatArea 
            user={selectedUser} 
            group={selectedGroup} 
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-xl shadow-gray-100 border border-gray-50">
              <svg className="w-10 h-10 text-purple-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">AuraGuard Messenger</h3>
            <p className="text-sm max-w-xs font-medium text-gray-400 leading-relaxed">Select a contact or join a group to start a secure, real-time encrypted conversation.</p>
          </div>
        )}
      </div>
    </div>
  );
}
