"use client";

import { useState, useEffect, useMemo } from "react";
import { getChatList, getMyGroups } from "@/services/chat.service";
import { Search, Users, User, PlusCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface ChatSidebarProps {
  onSelectUser: (user: any) => void;
  onSelectGroup: (group: any) => void;
  selectedChatId?: string | null; // e.g., "user_1" or "group_1"
}

export default function ChatSidebar({ onSelectUser, onSelectGroup, selectedChatId }: ChatSidebarProps) {
  const { socket, user: currentUser, onlineUsers } = useAuth();
  const [contacts, setContacts] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"direct" | "groups">("direct");
  
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [lastActivity, setLastActivity] = useState<Record<string, { time: Date, text: string }>>({});

  useEffect(() => {
    loadData();
  }, []);

  // Clear unread count when a contact is selected
  useEffect(() => {
    if (selectedChatId) {
      setUnreadCounts(prev => ({ ...prev, [selectedChatId]: 0 }));
    }
  }, [selectedChatId]);

  useEffect(() => {
    if (!socket) return;

    const handleNewPersonal = (msg: any) => {
      const isFromMe = msg.senderId == currentUser?.id;
      const otherPersonId = isFromMe ? msg.receiverId : msg.senderId;
      const compoundId = `user_${otherPersonId}`;
      
      setLastActivity(prev => ({
        ...prev,
        [compoundId]: { time: new Date(msg.createdAt), text: msg.content || "Sent a file" }
      }));

      // Increment unread if not currently viewing this chat
      if (!isFromMe && selectedChatId != compoundId) {
        setUnreadCounts(prev => ({
          ...prev,
          [compoundId]: (prev[compoundId] || 0) + 1
        }));
      }
    };

    const handleNewGroup = (msg: any) => {
      const compoundId = `group_${msg.groupId}`;
      const isFromMe = msg.senderId == currentUser?.id;

      setLastActivity(prev => ({
        ...prev,
        [compoundId]: { time: new Date(msg.createdAt), text: `${msg.sender?.name || 'Someone'}: ${msg.content || "Sent a file"}` }
      }));

      if (!isFromMe && selectedChatId != compoundId) {
        setUnreadCounts(prev => ({
          ...prev,
          [compoundId]: (prev[compoundId] || 0) + 1
        }));
      }
    };

    socket.on("personal:new-message", handleNewPersonal);
    socket.on("group:new-message", handleNewGroup);

    return () => {
      socket.off("personal:new-message", handleNewPersonal);
      socket.off("group:new-message", handleNewGroup);
    };
  }, [socket, selectedChatId, currentUser?.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [contactRes, groupRes] = await Promise.all([
        getChatList(),
        getMyGroups()
      ]);
      setContacts(contactRes.data);
      setGroups(groupRes.data.groups || []); 
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sortedContacts = useMemo(() => {
    return [...contacts]
      .filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        const timeA = lastActivity[`user_${a.id}`]?.time.getTime() || 0;
        const timeB = lastActivity[`user_${b.id}`]?.time.getTime() || 0;
        return timeB - timeA;
      });
  }, [contacts, search, lastActivity]);

  const sortedGroups = useMemo(() => {
    return [...groups]
      .sort((a, b) => {
        const timeA = lastActivity[`group_${a.id}`]?.time.getTime() || 0;
        const timeB = lastActivity[`group_${b.id}`]?.time.getTime() || 0;
        return timeB - timeA;
      });
  }, [groups, lastActivity]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="w-80 border-r border-gray-100 flex flex-col bg-white">
      {/* Search Header */}
      <div className="p-6 pb-2">
        <h2 className="text-xl font-black text-gray-900 mb-4 tracking-tight">Messages</h2>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-50 border-none rounded-2xl py-3 pl-10 pr-4 text-xs font-medium focus:ring-2 focus:ring-purple-100 outline-none transition-all"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex px-6 mb-4 gap-6 border-b border-gray-50 mt-4">
        <button 
          onClick={() => setActiveTab("direct")}
          className={`pb-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === "direct" ? "text-purple-600" : "text-gray-400"}`}
        >
          Direct
          {activeTab === "direct" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-600 rounded-full animate-in slide-in-from-left duration-300"></div>}
        </button>
        <button 
          onClick={() => setActiveTab("groups")}
          className={`pb-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === "groups" ? "text-purple-600" : "text-gray-400"}`}
        >
          Groups
          {activeTab === "groups" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-600 rounded-full animate-in slide-in-from-left duration-300"></div>}
        </button>
      </div>

      {/* List Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-3 space-y-1 py-1">
        {loading ? (
          [1,2,3,4,5].map(i => (
            <div key={i} className="h-16 bg-gray-50 rounded-2xl animate-pulse mx-2 mb-2" />
          ))
        ) : (
          <>
            {activeTab === "direct" ? (
              sortedContacts.length > 0 ? (
                sortedContacts.map(contact => {
                  const compoundId = `user_${contact.id}`;
                  const isSelected = selectedChatId === compoundId;
                  return (
                    <button
                      key={contact.id}
                      onClick={() => onSelectUser(contact)}
                      className={`w-full flex items-center gap-4 p-3.5 rounded-2xl transition-all group mb-1 ${isSelected ? "bg-purple-600 shadow-lg shadow-purple-100 translate-x-1" : "hover:bg-gray-50 bg-transparent"}`}
                    >
                      <div className="relative shrink-0">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold overflow-hidden border-2 shadow-sm transition-all group-hover:scale-105 ${isSelected ? "bg-white text-purple-600 border-purple-400" : "bg-purple-100 text-purple-600 border-white"}`}>
                          {contact.profileImage ? (
                            <img src={`http://localhost:5000/${contact.profileImage}`} className="w-full h-full object-cover" />
                          ) : (
                            contact.name.charAt(0)
                          )}
                        </div>
                        {!isSelected && onlineUsers.has(contact.id) && (
                          <div className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full animate-pulse"></div>
                        )}
                      </div>
                      <div className="text-left flex-1 overflow-hidden">
                        <div className="flex justify-between items-center mb-0.5">
                          <p className={`text-sm font-black truncate ${isSelected ? "text-white" : "text-gray-900"}`}>{contact.name}</p>
                          {lastActivity[compoundId] && (
                            <span className={`text-[9px] font-bold uppercase tracking-tighter ${isSelected ? "text-purple-100" : "text-gray-400"}`}>
                              {formatTime(lastActivity[compoundId].time)}
                            </span>
                          )}
                        </div>
                        <div className="flex justify-between items-center gap-2">
                          <p className={`text-[10px] font-medium truncate max-w-[140px] ${isSelected ? "text-purple-100" : "text-gray-400"}`}>
                             {lastActivity[compoundId]?.text || contact.role}
                          </p>
                          {unreadCounts[compoundId] > 0 && !isSelected && (
                            <span className="min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white rounded-full text-[9px] font-black px-1 animate-in zoom-in shadow-sm">
                              {unreadCounts[compoundId]}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              ) : (
                <p className="text-center text-xs text-gray-400 py-10 font-medium tracking-wide">No contacts found</p>
              )
            ) : (
              sortedGroups.length > 0 ? (
                sortedGroups.map(group => {
                  const compoundId = `group_${group.id}`;
                  const isSelected = selectedChatId === compoundId;
                  return (
                    <button
                      key={group.id}
                      onClick={() => onSelectGroup(group)}
                      className={`w-full flex items-center gap-4 p-3.5 rounded-2xl transition-all group mb-1 ${isSelected ? "bg-indigo-600 shadow-lg shadow-indigo-100 translate-x-1" : "hover:bg-gray-50 bg-transparent"}`}
                    >
                      <div className="relative shrink-0">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold overflow-hidden border-2 shadow-sm transition-all group-hover:scale-105 ${isSelected ? "bg-white text-indigo-600 border-indigo-400" : "bg-indigo-50 text-indigo-600 border-white"}`}>
                          {group.profileImage ? (
                            <img src={`http://localhost:5000/${group.profileImage}`} className="w-full h-full object-cover" />
                          ) : (
                            group.groupname.charAt(0)
                          )}
                        </div>
                      </div>
                      <div className="text-left flex-1 overflow-hidden">
                        <div className="flex justify-between items-center mb-0.5">
                          <p className={`text-sm font-black truncate ${isSelected ? "text-white" : "text-gray-900"}`}>{group.groupname}</p>
                          {lastActivity[compoundId] && (
                            <span className={`text-[9px] font-bold uppercase tracking-tighter ${isSelected ? "text-indigo-100" : "text-gray-400"}`}>
                              {formatTime(lastActivity[compoundId].time)}
                            </span>
                          )}
                        </div>
                        <div className="flex justify-between items-center gap-2">
                          <p className={`text-[10px] font-medium truncate max-w-[140px] ${isSelected ? "text-indigo-100" : "text-gray-400"}`}>
                             {lastActivity[compoundId]?.text || "Collective Workspace"}
                          </p>
                          {unreadCounts[compoundId] > 0 && !isSelected && (
                            <span className="min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white rounded-full text-[9px] font-black px-1 animate-in zoom-in shadow-sm">
                              {unreadCounts[compoundId]}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              ) : (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                 <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                   <Users className="text-gray-200" size={32} />
                 </div>
                 <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-4">No Groups Joined</p>
                 <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-[0.15em] hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">
                    <PlusCircle size={14} /> New Group
                 </button>
              </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}
