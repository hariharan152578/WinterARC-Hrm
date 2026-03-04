export type Role =
  | "SUPER_ADMIN"
  | "MASTER_ADMIN"
  | "ADMIN"
  | "MANAGER"
  | "TEAMLEAD"
  | "EMPLOYEE";

export interface User {
  name: any;
  id: number;
  email: string;
  personId: string;
  role: Role;
  tenantId: number | null;
}

export interface LoginResponse {
  token: string;
  user: User;
  mustChangePassword: boolean;
}