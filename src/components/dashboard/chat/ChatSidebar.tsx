"use client";

import { useState, useEffect, useMemo } from "react";
import { getChatList, getMyGroups, createGroup } from "@/services/chat.service";
import { Search, Users, User, PlusCircle, MoreVertical, Camera, Plus, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Modal from "@/components/ui/Modal";
import toast from "react-hot-toast";

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

  // Group Creation State
  const [showMenu, setShowMenu] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDesc, setGroupDesc] = useState("");
  const [groupImage, setGroupImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<number>>(new Set());
  const [memberSearch, setMemberSearch] = useState("");

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

    const handleNewTenant = (msg: any) => {
      const compoundId = `group_workspace`;
      const isFromMe = msg.senderId == currentUser?.id;

      setLastActivity(prev => ({
        ...prev,
        [compoundId]: {
          time: new Date(msg.createdAt || Date.now()),
          text: `${msg.user?.name || msg.sender?.name || 'Someone'}: ${msg.content || "Sent a file"}`
        }
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
    socket.on("tenant:message", handleNewTenant);

    return () => {
      socket.off("personal:new-message", handleNewPersonal);
      socket.off("group:new-message", handleNewGroup);
      socket.off("tenant:message", handleNewTenant);
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

      const fetchedGroups = groupRes.data.groups || [];
      const workspaceGroup = {
        id: 'workspace',
        groupname: 'Workspace Chat',
        description: 'Company-wide communication',
        profileImage: null,
        isTenant: true
      };
      setGroups([workspaceGroup, ...fetchedGroups]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim() || !groupDesc.trim() || !groupImage) {
      return toast.error("Please fill all fields and upload a profile image");
    }

    try {
      setIsCreating(true);
      const formData = new FormData();
      formData.append("groupname", groupName);
      formData.append("description", groupDesc);
      formData.append("profileImage", groupImage);
      formData.append("userIds", JSON.stringify(Array.from(selectedUserIds)));

      await createGroup(formData);
      toast.success("Group created successfully!");
      setShowCreateModal(false);
      setGroupName("");
      setGroupDesc("");
      setGroupImage(null);
      setImagePreview(null);
      setSelectedUserIds(new Set());
      loadData(); // Refresh list
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to create group");
    } finally {
      setIsCreating(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setGroupImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleUserSelection = (userId: number) => {
    setSelectedUserIds(prev => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const filteredMembers = useMemo(() => {
    return contacts.filter(c =>
      c.name.toLowerCase().includes(memberSearch.toLowerCase()) &&
      c.id !== currentUser?.id
    );
  }, [contacts, memberSearch, currentUser?.id]);

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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black text-gray-900 tracking-tight">Messages</h2>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-400 hover:text-gray-900"
            >
              <MoreVertical size={20} />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-11 w-48 bg-white shadow-2xl rounded-2xl z-20 border border-gray-100 p-2 animate-in fade-in zoom-in duration-200">
                <button
                  onClick={() => { setShowCreateModal(true); setShowMenu(false); }}
                  className="w-full text-left px-3 py-2.5 text-xs font-black text-gray-700 hover:bg-[#e8f5f4] hover:text-[#4db6ac] rounded-xl flex items-center gap-2.5 transition-all"
                >
                  <div className="p-1.5 bg-[#e8f5f4] rounded-lg">
                    <Plus size={14} />
                  </div>
                  Create Group
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-50 border-none rounded-2xl py-3 pl-10 pr-4 text-xs font-medium focus:ring-2 focus:ring-[#4db6ac]/20 outline-none transition-all"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex px-6 mb-4 gap-6 border-b border-gray-50 mt-4">
        <button
          onClick={() => setActiveTab("direct")}
          className={`pb-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === "direct" ? "text-[#4db6ac]" : "text-gray-400"}`}
        >
          Direct
          {activeTab === "direct" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#4db6ac] rounded-full animate-in slide-in-from-left duration-300"></div>}
        </button>
        <button
          onClick={() => setActiveTab("groups")}
          className={`pb-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === "groups" ? "text-[#4db6ac]" : "text-gray-400"}`}
        >
          Groups
          {activeTab === "groups" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#4db6ac] rounded-full animate-in slide-in-from-left duration-300"></div>}
        </button>
      </div>

      {/* List Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-3 space-y-1 py-1">
        {loading ? (
          [1, 2, 3, 4, 5].map(i => (
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
                      className={`w-full flex items-center gap-4 p-3.5 rounded-2xl transition-all group mb-1 ${isSelected ? "bg-[#4db6ac] shadow-lg shadow-[#4db6ac]/20 translate-x-1" : "hover:bg-gray-50 bg-transparent"}`}
                    >
                      <div className="relative shrink-0">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold overflow-hidden border-2 shadow-sm transition-all group-hover:scale-105 ${isSelected ? "bg-white text-[#4db6ac] border-[#4db6ac]" : "bg-[#e8f5f4] text-[#4db6ac] border-white"}`}>
                          {contact.profileImage ? (
                            <img src={`${process.env.NEXT_PUBLIC_IMAGE_API_URL}/${contact.profileImage}`} className="w-full h-full object-cover" />
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
                            <span className={`text-[9px] font-bold uppercase tracking-tighter ${isSelected ? "text-[#e8f5f4]" : "text-gray-400"}`}>
                              {formatTime(lastActivity[compoundId].time)}
                            </span>
                          )}
                        </div>
                        <div className="flex justify-between items-center gap-2">
                          <p className={`text-[10px] font-medium truncate max-w-[140px] ${isSelected ? "text-[#e8f5f4]" : "text-gray-400"}`}>
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
                      className={`w-full flex items-center gap-4 p-3.5 rounded-2xl transition-all group mb-1 ${isSelected ? "bg-[#4db6ac] shadow-lg shadow-[#4db6ac]/20 translate-x-1" : "hover:bg-gray-50 bg-transparent"}`}
                    >
                      <div className="relative shrink-0">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold overflow-hidden border-2 shadow-sm transition-all group-hover:scale-105 ${isSelected ? "bg-white text-[#4db6ac] border-[#4db6ac]" : "bg-[#e8f5f4] text-[#4db6ac] border-white"}`}>
                          {group.profileImage ? (
                            <img src={`${process.env.NEXT_PUBLIC_IMAGE_API_URL}/${group.profileImage}`} className="w-full h-full object-cover" />
                          ) : (
                            group.groupname.charAt(0)
                          )}
                        </div>
                      </div>
                      <div className="text-left flex-1 overflow-hidden">
                        <div className="flex justify-between items-center mb-0.5">
                          <p className={`text-sm font-black truncate ${isSelected ? "text-white" : "text-gray-900"}`}>{group.groupname}</p>
                          {lastActivity[compoundId] && (
                            <span className={`text-[9px] font-bold uppercase tracking-tighter ${isSelected ? "text-[#e8f5f4]" : "text-gray-400"}`}>
                              {formatTime(lastActivity[compoundId].time)}
                            </span>
                          )}
                        </div>
                        <div className="flex justify-between items-center gap-2">
                          <p className={`text-[10px] font-medium truncate max-w-[140px] ${isSelected ? "text-[#e8f5f4]" : "text-gray-400"}`}>
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
                  <button className="flex items-center gap-2 px-4 py-2 bg-[#4db6ac] text-white rounded-full text-[10px] font-black uppercase tracking-[0.15em] hover:bg-[#3d968e] shadow-lg shadow-[#4db6ac]/20 transition-all">
                    <PlusCircle size={14} /> New Group
                  </button>
                </div>
              )
            )}
          </>
        )}
      </div>

      {/* Create Group Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Workspace"
      >
        <form onSubmit={handleCreateGroup} className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <div className="w-24 h-24 rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden transition-all group-hover:border-[#4db6ac]">
                {imagePreview ? (
                  <img src={imagePreview} className="w-full h-full object-cover" />
                ) : (
                  <>
                    <Camera size={24} className="text-gray-300 mb-1" />
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Icon</span>
                  </>
                )}
              </div>
              <input
                type="file"
                onChange={handleImageChange}
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="absolute -bottom-2 -right-2 p-2 bg-[#4db6ac] text-white rounded-xl shadow-lg shadow-[#4db6ac]/20 animate-in zoom-in">
                <Plus size={14} />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Group Name</label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Marketing Team, Dev Squad..."
                className="w-full bg-gray-50 border-none rounded-2xl py-3.5 px-4 text-xs font-bold focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Description</label>
              <textarea
                value={groupDesc}
                onChange={(e) => setGroupDesc(e.target.value)}
                placeholder="What is this workspace for?"
                rows={3}
                className="w-full bg-gray-50 border-none rounded-2xl py-3.5 px-4 text-xs font-bold focus:ring-2 focus:ring-indigo-100 transition-all outline-none resize-none"
                required
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Add Members ({selectedUserIds.size})</label>
            <div className="relative mb-2">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                placeholder="Search colleagues..."
                className="w-full bg-gray-50 border-none rounded-xl py-2.5 pl-9 pr-4 text-[11px] font-bold focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
              />
            </div>
            <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-1 pr-1">
              {filteredMembers.map(member => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => toggleUserSelection(member.id)}
                  className={`w-full flex items-center justify-between p-2 rounded-xl border transition-all ${selectedUserIds.has(member.id) ? "bg-[#e8f5f4] border-[#4db6ac]/30" : "bg-white border-transparent hover:bg-gray-50"}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#e8f5f4] flex items-center justify-center text-[11px] font-black text-[#4db6ac]">
                      {member.profileImage ? (
                        <img src={`${process.env.NEXT_PUBLIC_IMAGE_API_URL}/${member.profileImage}`} className="w-full h-full object-cover rounded-full" />
                      ) : (
                        member.name.charAt(0)
                      )}
                    </div>
                    <span className="text-[11px] font-bold text-gray-700">{member.name}</span>
                  </div>
                  <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${selectedUserIds.has(member.id) ? "bg-[#4db6ac] border-[#4db6ac] text-white" : "bg-white border-gray-200"}`}>
                    {selectedUserIds.has(member.id) && <Plus size={12} strokeWidth={4} />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex pt-2 gap-3">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="flex-1 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="flex-1 lg:flex-[2.5] py-3.5 bg-[#4db6ac] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#4db6ac]/20 hover:bg-[#3d968e] transition-all disabled:opacity-50"
            >
              {isCreating ? "Booting Workspace..." : "Initialize Group"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
