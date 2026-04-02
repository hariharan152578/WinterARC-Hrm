"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCall } from "@/context/CallContext";
import { getPersonalMessages, sendPersonalMessage, getGroupMessages, sendGroupMessage, getTenantMessages, sendTenantMessage, deletePersonalMessage, deleteGroupMessage, deleteTenantMessage } from "@/services/chat.service";
import { Send, Paperclip, MoreVertical, Phone, Video, X, FileText, Download, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

interface ChatAreaProps {
  user?: any;
  group?: any;
}

export default function ChatArea({ user, group }: ChatAreaProps) {
  const { user: currentUser, socket, onlineUsers } = useAuth();
  const { initiateCall } = useCall();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isSending, setIsSending] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Load History
  useEffect(() => {
    loadHistory();
  }, [user?.id, group?.id]);

  // Socket Listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewPersonal = (msg: any) => {
      console.log("New personal message received via socket:", msg);

      // Ensure the message belongs to THIS conversation
      const isFromMeToHim = msg.senderId == currentUser?.id && msg.receiverId == user?.id;
      const isFromHimToMe = msg.senderId == user?.id && msg.receiverId == currentUser?.id;

      if (user && (isFromMeToHim || isFromHimToMe)) {
        setMessages(prev => {
          if (prev.find(m => m.id == msg.id)) return prev;
          return [...prev, msg];
        });
      }
    };

    const handleNewGroup = (msg: any) => {
      console.log("New group message received via socket:", msg);
      if (group && msg.groupId == group.id) {
        setMessages(prev => {
          if (prev.find(m => m.id == msg.id)) return prev;
          return [...prev, msg];
        });
      }
    };

    const handleNewTenant = (msg: any) => {
      console.log("New tenant message received via socket:", msg);
      if (group?.isTenant) {
        setMessages(prev => {
          if (prev.find(m => m.id == msg.id)) return prev;
          return [...prev, msg];
        });
      }
    };

    const handleTenantDeleted = ({ messageId }: any) => {
      console.log("Tenant message deleted via socket:", messageId);
      setMessages(prev => prev.filter(m => m.id != messageId));
    };

    const handlePersonalDeleted = ({ messageId }: any) => {
      console.log("Personal message deleted via socket:", messageId);
      setMessages(prev => prev.filter(m => m.id != messageId));
    };

    const handleGroupDeleted = ({ messageId }: any) => {
      console.log("Group message deleted via socket:", messageId);
      setMessages(prev => prev.filter(m => m.id != messageId));
    };

    socket.on("personal:new-message", handleNewPersonal);
    socket.on("group:new-message", handleNewGroup);
    socket.on("tenant:message", handleNewTenant);
    socket.on("tenant:message-deleted", handleTenantDeleted);
    socket.on("personal:message-deleted", handlePersonalDeleted);
    socket.on("group:message-deleted", handleGroupDeleted);

    return () => {
      socket.off("personal:new-message", handleNewPersonal);
      socket.off("group:new-message", handleNewGroup);
      socket.off("tenant:message", handleNewTenant);
      socket.off("tenant:message-deleted", handleTenantDeleted);
      socket.off("personal:message-deleted", handlePersonalDeleted);
      socket.off("group:message-deleted", handleGroupDeleted);
    };
  }, [socket, user?.id, group?.id, currentUser?.id]);

  const loadHistory = async () => {
    // Guard: Don't load if no ID is present
    const targetId = user?.id || group?.id;
    if (!targetId) return;

    try {
      setLoading(true);
      setMessages([]);
      if (user) {
        const res = await getPersonalMessages(user.id);
        setMessages(res.data.messages || []);
      } else if (group?.isTenant) {
        const res = await getTenantMessages();
        setMessages(res.data.messages || []);
      } else if (group) {
        const res = await getGroupMessages(group.id);
        setMessages(res.data.messages || []);
      }
    } catch (err: any) {
      console.error("Load history error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!inputText.trim() && files.length === 0) || isSending) return;

    try {
      setIsSending(true);
      const formData = new FormData();
      formData.append("content", inputText);

      if (user) {
        formData.append("receiverId", user.id.toString());
        files.forEach(f => formData.append("files", f));

        await sendPersonalMessage(formData);

      } else if (group?.isTenant) {
        files.forEach(f => formData.append("files", f));
        await sendTenantMessage(formData);
      } else if (group) {
        files.forEach(f => formData.append("files", f));
        await sendGroupMessage(group.id, formData);
      }

      setInputText("");
      setFiles([]);
    } catch (err) {
      console.error(err);
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files || [])]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDelete = async (messageId: number) => {
    if (!confirm("Are you sure you want to delete this message?")) return;

    try {
      if (user) {
        await deletePersonalMessage(messageId);
      } else if (group?.isTenant) {
        await deleteTenantMessage(messageId);
      } else if (group) {
        await deleteGroupMessage(group.id, messageId);
      }
      setMessages(prev => prev.filter(m => m.id !== messageId));
      toast.success("Message deleted");
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete message");
    }
  };

  const target = user || group;

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full relative">
      {/* Header */}
      <div className="px-6 py-4 bg-white border-b border-gray-100 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#e8f5f4] flex items-center justify-center font-bold text-[#4db6ac] border border-[#4db6ac]/30 shadow-sm overflow-hidden">
            {target.profileImage ? (
              <img src={`${process.env.NEXT_PUBLIC_IMAGE_API_URL}/${target.profileImage}`} className="w-full h-full object-cover" />
            ) : (
              target.groupname?.charAt(0) || target.name?.charAt(0)
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 group-hover:text-[#4db6ac] transition-colors">
              {target.groupname || target.name}
            </h3>
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${user ? (onlineUsers.has(user.id) ? "bg-emerald-500 animate-pulse" : "bg-gray-300") : "bg-[#4db6ac]"}`}></span>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                {user ? (onlineUsers.has(user.id) ? "Active Now" : "Offline") : "Collective Workspace"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {user && (
            <>
              <button 
                onClick={() => initiateCall(user.id, 'voice', user.name)}
                className="p-2 text-gray-400 hover:text-[#4db6ac] hover:bg-[#e8f5f4] rounded-xl transition-all"
              >
                <Phone size={18} />
              </button>
              <button 
                onClick={() => initiateCall(user.id, 'video', user.name)}
                className="p-2 text-gray-400 hover:text-[#4db6ac] hover:bg-[#e8f5f4] rounded-xl transition-all"
              >
                <Video size={18} />
              </button>
            </>
          )}
          <button className="p-2 text-gray-400 hover:text-[#4db6ac] hover:bg-[#e8f5f4] rounded-xl transition-all">
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4 bg-gray-50/30"
      >
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
                <div className="w-2/3 h-12 bg-white/50 rounded-2xl animate-pulse border border-gray-100" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 opacity-20 filter grayscale">
                <img src="/avatar.png" className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-sm font-bold tracking-widest uppercase">Encryption Established</p>
              </div>
            )}
            {messages.map((msg, idx) => {
              const isMine = msg.senderId === currentUser?.id || msg.sender?.id === currentUser?.id;
              return (
                <div key={idx} className={`flex ${isMine ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                  <div className={`max-w-[75%] p-4 rounded-3xl shadow-sm border ${isMine
                    ? "bg-[#4db6ac] text-white border-[#4db6ac] rounded-tr-none"
                    : "bg-white text-gray-800 border-gray-100 rounded-tl-none"
                    }`}>
                    {!isMine && (group || group?.isTenant) && (
                      <div className="text-[9px] font-black text-[#4db6ac] mb-1 uppercase tracking-tight">
                        {msg.user?.name || msg.sender?.name || 'Someone'}
                      </div>
                    )}
                    {msg.content && <p className="text-sm font-medium leading-relaxed">{msg.content}</p>}

                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {msg.attachments.map((at: any, i: number) => {
                          const isImg = at.mimeType?.startsWith('image/') || at.url?.match(/\.(jpg|jpeg|png|gif|svg)$/i);
                          return (
                            <div key={i} className={`rounded-xl overflow-hidden border ${isMine ? "border-[#4db6ac]/30" : "border-gray-100"}`}>
                              {isImg ? (
                                <img src={`${process.env.NEXT_PUBLIC_IMAGE_API_URL}/${at.url}`} className="max-w-full h-auto" />
                              ) : (
                                <div className="flex items-center gap-3 p-2 bg-black/5">
                                  <FileText size={16} />
                                  <span className="text-[10px] truncate max-w-[150px]">{at.name}</span>
                                  <a href={`${process.env.NEXT_PUBLIC_IMAGE_API_URL}/${at.url}`} download className="ml-auto p-1 hover:bg-black/10 rounded">
                                    <Download size={14} />
                                  </a>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-4 mt-1.5 opacity-50">
                      <div className={`text-[9px] font-bold uppercase tracking-widest ${isMine ? "text-[#e8f5f4]" : "text-gray-400"}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      {isMine && (
                        <button
                          onClick={() => handleDelete(msg.id)}
                          className="p-1 hover:text-red-300 transition-colors"
                          title="Delete Message"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100">
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3 bg-gray-50 p-3 rounded-2xl border border-dashed border-gray-200">
            {files.map((file, i) => (
              <div key={i} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-gray-100 shadow-sm">
                <FileText size={14} className="text-[#4db6ac]" />
                <span className="text-[10px] font-bold max-w-[100px] truncate">{file.name}</span>
                <button onClick={() => removeFile(i)} className="text-gray-400 hover:text-red-500">
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
        <form onSubmit={handleSend} className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-gray-400 hover:text-[#4db6ac] hover:bg-[#e8f5f4] rounded-2xl transition-all"
          >
            <Paperclip size={20} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            className="hidden"
          />
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Type your message here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full bg-gray-50 border-none rounded-2xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-[#4db6ac]/20 transition-all font-medium"
            />
          </div>
          <button
            type="submit"
            disabled={(!inputText.trim() && files.length === 0) || isSending}
            className={`p-3 rounded-2xl transition-all shadow-lg ${(!inputText.trim() && files.length === 0) || isSending
              ? "bg-gray-100 text-gray-300"
              : "bg-[#4db6ac] text-white hover:bg-[#3d968e] shadow-[#4db6ac]/20"
              }`}
          >
            <Send size={20} className={isSending ? "animate-pulse" : ""} />
          </button>
        </form>
      </div>
    </div>
  );
}
