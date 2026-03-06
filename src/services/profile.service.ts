import api from "@/lib/axios";

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  department?: string;
  description?: string;
  joiningDate?: string;
  profileImage?: string;
}

export const getUserProfile = async (id: number) => {
  const response = await api.get<UserProfile>(`/users/users/${id}`);
  return response.data;
};

export const updateUserProfile = async (data: FormData) => {
  const response = await api.put("/users/update-profile", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};