import api from "@/lib/axios";

// 🔵 SUPER_ADMIN
export const createMasterAdmin = (data: any) =>
  api.post("/users/master", data);

export const getMasterAdmins = () =>
  api.get("/users/masters");

export const deleteMasterAdmin = (id: number) =>
  api.delete(`/users/master/${id}`);

// 🔵 MASTER_ADMIN
export const createAdmin = (data: any) =>
  api.post("/users/admin", data);

export const getMyAdmins = () =>
  api.get("/users/my-admins");

export const updateAdmin = (id: number, data: any) =>
  api.put(`/users/admin/${id}`, data);

export const deleteAdmin = (id: number) =>
  api.delete(`/users/admin/${id}`);

// 🔵 ADMIN / MANAGER / TEAMLEAD
export const createSubUser = (data: any) =>
  api.post("/users/sub-user", data);

export const getHierarchyUsers = () =>
  api.get("/users/hierarchy");

// 🔵 DASHBOARD
export const getSuperAdminDashboard = () =>
  api.get("/dashboard/super-dashboard");

export const getMasterAdminDashboard = () =>
  api.get("/dashboard/master-dashboard");

// 🔵 DELETE SUB USER (Hierarchy)
export const deleteSubUser = (id: number) =>
  api.delete(`/users/${id}`);