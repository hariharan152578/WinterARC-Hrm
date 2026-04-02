"use client";

import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { User } from "@/types/auth.types";
export type { User };
import { loginUser } from "@/services/auth.service";
import { LoginResponse } from "@/types/auth.types";
import io from "socket.io-client";
import { showBrowserNotification, requestNotificationPermission } from "@/utils/notification";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  socket: any;
  onlineUsers: Set<number>;
  notifications: Record<string, number>;
  clearNotification: (type: string) => void;
  login: (
    email: string | null,
    personId: string | null,
    password: string
  ) => Promise<LoginResponse>;
  logout: (options?: { isAuto?: boolean }) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [socket, setSocket] = useState<any>(null);
  const [onlineUsers, setOnlineUsers] = useState<Set<number>>(new Set());
  const [notifications, setNotifications] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const clearNotification = (type: string) => {
    setNotifications(prev => ({
      ...prev,
      [type]: 0
    }));
  };

  const initSocket = (token: string) => {
    try {
      // Disconnect existing socket if any
      if (socket) {
        socket.disconnect();
      }

      const s = io(process.env.NEXT_PUBLIC_IMAGE_API_URL!, {
        auth: { token },
        reconnection: true,
      });

      s.on("connect", () => {
        console.log("✅ Socket connected:", s.id);
      });

      s.on("connect_error", (err: any) => {
        console.error("❌ Socket connection error:", err.message);
      });

      s.on("presence:initial", (userIds: number[]) => {
        setOnlineUsers(new Set(userIds));
      });

      s.on("presence:update", ({ userId, status }: { userId: number, status: 'online' | 'offline' }) => {
        setOnlineUsers(prev => {
          const next = new Set(prev);
          if (status === 'online') next.add(userId);
          else next.delete(userId);
          return next;
        });
      });

      // 🔔 NOTIFICATION LISTENERS
      s.on("notification:new", (data: any) => {
        setNotifications(prev => ({
          ...prev,
          [data.type]: (prev[data.type] || 0) + 1
        }));
        showBrowserNotification(data.title || "New Notification", {
          body: data.message || "You have a new notification in the system.",
        });
      });

      s.on("personal:new-message", (data: any) => {
        // If we're not on the chat page with this user, increment chat notification
        // Note: Actual 'active chat' check usually happens in a ChatContext, 
        // but here we just increment a global 'CHAT' unread count.
        
        // Prevent notification if it's our own message
        const userStr = localStorage.getItem("user");
        const currentUser = userStr ? JSON.parse(userStr) : null;
        if (currentUser && data.senderId === currentUser.id) return;

        setNotifications(prev => ({
          ...prev,
          CHAT: (prev.CHAT || 0) + 1
        }));
        const senderName = data.sender?.name || "Someone";
        showBrowserNotification(`New message from ${senderName}`, {
          body: data.content || "Sent an attachment",
        });
      });

      s.on("group:new-message", (data: any) => {
        const userStr = localStorage.getItem("user");
        const currentUser = userStr ? JSON.parse(userStr) : null;
        if (currentUser && data.senderId === currentUser.id) return;

        setNotifications(prev => ({
          ...prev,
          GROUP_CHAT: (prev.GROUP_CHAT || 0) + 1
        }));
        const senderName = data.sender?.name || "Someone";
        showBrowserNotification(`New message in group`, {
          body: `${senderName}: ${data.content || "Sent an attachment"}`,
        });
      });

      s.on("tenant:message", (data: any) => {
        const userStr = localStorage.getItem("user");
        const currentUser = userStr ? JSON.parse(userStr) : null;
        if (currentUser && data.senderId === currentUser.id) return;

        setNotifications(prev => ({
          ...prev,
          GROUP_CHAT: (prev.GROUP_CHAT || 0) + 1
        }));
        const senderName = data.user?.name || data.sender?.name || "Someone";
        showBrowserNotification(`Workspace Announcement`, {
          body: `${senderName}: ${data.content || "Sent an attachment"}`,
        });
      });

      setSocket(s);
    } catch (err) {
      console.error("Socket init failed", err);
    }
  };

  useEffect(() => {
    requestNotificationPermission();

    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      initSocket(storedToken);
    }

    setLoading(false);
  }, []);

  // 🕒 8-HOUR AUTO-LOGOUT TIMER
  useEffect(() => {
    if (!token || !user) return;

    const checkSession = () => {
      const loginTime = localStorage.getItem("loginTime");
      if (!loginTime) return;

      const startTime = parseInt(loginTime);
      const now = Date.now();
      const eightHoursInMs = 8 * 60 * 60 * 1000;

      if (now - startTime >= eightHoursInMs) {
        console.log("⏰ 8 hours passed. Automatic logout initiated.");
        logout({ isAuto: true });
      }
    };

    const interval = setInterval(checkSession, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [token, user]);

  const login = async (
    email: string | null,
    personId: string | null,
    password: string
  ) => {
    const data = await loginUser(email, personId, password);

    setUser(data.user);
    setToken(data.token);

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("loginTime", Date.now().toString());

    initSocket(data.token);

    return data;
  };

  const logout = async (options?: { isAuto?: boolean }) => {
    const isAuto = options?.isAuto || false;

    try {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${storedToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ isAuto })
        });
      }
    } catch (err) {
      console.error("Logout backend call failed", err);
    }

    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
    setUser(null);
    setToken(null);
    localStorage.clear();
  };

  const value = useMemo(() => ({
    user,
    token,
    loading,
    socket,
    onlineUsers,
    notifications,
    clearNotification,
    login,
    logout
  }), [user, token, loading, socket, onlineUsers, notifications]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};