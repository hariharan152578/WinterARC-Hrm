import api from "@/lib/axios";
import { LoginResponse } from "@/types/auth.types";

export const loginUser = async (
  email: string | null,
  personId: string | null,
  password: string
) => {
  const response = await api.post<LoginResponse>("/auth/login", {
    email,
    personId,
    password,
  });

  return response.data;
};

export const changePassword = async (newPassword: string) => {
  const response = await api.post("/auth/change-password", {
    newPassword,
  });

  return response.data;
};