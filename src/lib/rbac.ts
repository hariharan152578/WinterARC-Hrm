import { Role } from "@/types/auth.types";

/**
 * ✅ Role → Default Home Route
 * Used for dashboard redirection
 */
export const roleHomeRoute: Record<Role, string> = {
  SUPER_ADMIN: "/dashboard/super",
  MASTER_ADMIN: "/dashboard/masters",
  ADMIN: "/dashboard/admin",
  MANAGER: "/dashboard/manager",
  TEAMLEAD: "/dashboard/teamlead",
  EMPLOYEE: "/dashboard/employee",
};

/**
 * ✅ Route → Allowed Roles
 * Used by middleware for protection
 */
export const routeAccessMap: Record<string, Role[]> = {
  "/dashboard/super": ["SUPER_ADMIN"],

  "/dashboard/masters": ["MASTER_ADMIN"],

  "/dashboard/admin": ["ADMIN"],

  "/dashboard/manager": ["MANAGER"],

  "/dashboard/teamlead": ["TEAMLEAD"],

  "/dashboard/employee": ["EMPLOYEE"],

  // Shared routes
  "/dashboard/employees": ["ADMIN", "MANAGER"],

  "/dashboard/leaves": ["ADMIN", "MANAGER", "TEAMLEAD"],

  "/dashboard/attendance": [
    "ADMIN",
    "MANAGER",
    "TEAMLEAD",
    "EMPLOYEE",
  ],

  "/dashboard/projects": [
    "ADMIN",
    "MANAGER",
    "TEAMLEAD",
    "EMPLOYEE",
  ],
};