import { Role } from "@/types/auth.types";

export const canCreateAdmin = (role: Role) =>
  role === "MASTER_ADMIN";

export const canCreateMaster = (role: Role) =>
  role === "SUPER_ADMIN";

export const canCreateSubUser = (role: Role) =>
  ["ADMIN", "MANAGER", "TEAMLEAD"].includes(role);