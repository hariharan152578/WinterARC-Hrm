"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { getPersonalMessages, sendPersonalMessage, getGroupMessages, sendGroupMessage } from "@/services/chat.service";
import { Send, Paperclip, MoreVertical, Phone, Video, X, FileText, Download } from "lucide-react";
import toast from "react-hot-toast";

interface ChatAreaProps {
  user?: any;
  group?: any;
}

export default function ChatArea({ user, group }: ChatAreaProps) {
  const { user: currentUser, socket, onlineUsers } = useAuth();
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

    socket.on("personal:new-message", handleNewPersonal);
    socket.on("group:new-message", handleNewGroup);

    return () => {
      socket.off("personal:new-message", handleNewPersonal);
      socket.off("group:new-message", handleNewGroup);
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

  const target = user || group;

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full relative">
      {/* Header */}
      <div className="px-6 py-4 bg-white border-b border-gray-100 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center font-bold text-purple-600 border border-purple-200 shadow-sm overflow-hidden">
             {target.profileImage ? (
                <img src={`http://localhost:5000/${target.profileImage}`} className="w-full h-full object-cover" />
             ) : (
                target.groupname?.charAt(0) || target.name?.charAt(0)
             )}
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
              {target.groupname || target.name}
            </h3>
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${user ? (onlineUsers.has(user.id) ? "bg-emerald-500 animate-pulse" : "bg-gray-300") : "bg-indigo-400"}`}></span>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                {user ? (onlineUsers.has(user.id) ? "Active Now" : "Offline") : "Collective Workspace"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all">
            <Phone size={18} />
          </button>
          <button className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all">
            <Video size={18} />
          </button>
          <button className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all">
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
             {[1,2,3].map(i => (
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
                  <div className={`max-w-[75%] p-4 rounded-3xl shadow-sm border ${
                    isMine 
                      ? "bg-purple-600 text-white border-purple-500 rounded-tr-none" 
                      : "bg-white text-gray-800 border-gray-100 rounded-tl-none"
                  }`}>
                    {msg.content && <p className="text-sm font-medium leading-relaxed">{msg.content}</p>}
                    
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mt-2 space-y-2">
                         {msg.attachments.map((at: any, i: number) => {
                            const isImg = at.mimeType?.startsWith('image/') || at.url?.match(/\.(jpg|jpeg|png|gif|svg)$/i);
                            return (
                               <div key={i} className={`rounded-xl overflow-hidden border ${isMine ? "border-purple-400/30" : "border-gray-100"}`}>
                                  {isImg ? (
                                    <img src={`http://localhost:5000/${at.url}`} className="max-w-full h-auto" />
                                  ) : (
                                    <div className="flex items-center gap-3 p-2 bg-black/5">
                                      <FileText size={16} />
                                      <span className="text-[10px] truncate max-w-[150px]">{at.name}</span>
                                      <a href={`http://localhost:5000/${at.url}`} download className="ml-auto p-1 hover:bg-black/10 rounded">
                                        <Download size={14} />
                                      </a>
                                    </div>
                                  )}
                               </div>
                            )
                         })}
                      </div>
                    )}
                    <div className={`text-[9px] mt-1.5 font-bold uppercase tracking-widest opacity-50 ${isMine ? "text-purple-100" : "text-gray-400"}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                   <FileText size={14} className="text-purple-500" />
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
            className="p-3 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-2xl transition-all"
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
              className="w-full bg-gray-50 border-none rounded-2xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-purple-100 transition-all font-medium"
            />
          </div>
          <button 
            type="submit"
            disabled={(!inputText.trim() && files.length === 0) || isSending}
            className={`p-3 rounded-2xl transition-all shadow-lg ${
              (!inputText.trim() && files.length === 0) || isSending
                ? "bg-gray-100 text-gray-300" 
                : "bg-purple-600 text-white hover:bg-purple-700 shadow-purple-100"
            }`}
          >
            <Send size={20} className={isSending ? "animate-pulse" : ""} />
          </button>
        </form>
      </div>
    </div>
  );
}
