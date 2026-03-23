import api from "@/lib/axios";

export const getPersonalMessages = (userId: number, lastId?: number) =>
  api.get(`/personal/chat/${userId}`, { params: { lastId } });

export const sendPersonalMessage = (formData: FormData) =>
  api.post("/personal/send", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const markPersonalSeen = (data: { senderId: number }) =>
  api.post("/personal/seen", data);

export const getGroupMessages = (groupId: number, lastId?: number) =>
  api.get(`/groups/${groupId}/chat`, { params: { lastId } });

export const sendGroupMessage = (groupId: number, formData: FormData) =>
  api.post(`/groups/${groupId}/messages`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getChatList = () => api.get("/users/hierarchy");

export const getMyGroups = () => api.get("/groups/my-groups");

export const createGroup = (formData: FormData) =>
  api.post("/groups", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getTenantMessages = (lastId?: number) =>
  api.get("/tenant-chat", { params: { lastId } });

export const sendTenantMessage = (formData: FormData) =>
  api.post("/tenant-chat/send", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deletePersonalMessage = (messageId: number) =>
  api.delete(`/personal/messages/${messageId}`);

export const deleteGroupMessage = (groupId: number, messageId: number) =>
  api.delete(`/groups/${groupId}/messages/${messageId}`);

export const deleteTenantMessage = (messageId: number) =>
  api.delete(`/tenant-chat/messages/${messageId}`);
