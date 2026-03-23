import api from "@/lib/axios";
import { RequestStatus } from "./request.service";

export interface LeaveData {
  id: number;
  userId: number;
  tenantId: number;
  startDate: string;
  endDate: string;
  leaveType: string;
  reason: string;
  adminMessage: string | null;
  approverId: number;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    name: string;
    role: string;
    profileImage: string;
  };
  approver?: {
    id: number;
    name: string;
    role: string;
  };
}

export interface LeavePayload {
  startDate: string;
  endDate: string;
  leaveType: string;
  reason: string;
}

const LeaveService = {
  createLeave: async (payload: LeavePayload) => {
    const response = await api.post("/leaves", payload);
    return response.data;
  },

  getMyLeaves: async (): Promise<LeaveData[]> => {
    const response = await api.get("/leaves/my-leaves");
    return response.data;
  },

  getTeamRequests: async (): Promise<LeaveData[]> => {
    const response = await api.get("/leaves/team-requests");
    return response.data;
  },

  handleAction: async (id: number, action: "APPROVE" | "REJECT", message?: string) => {
    const response = await api.put(`/leaves/${id}/action`, { action, message });
    return response.data;
  },
};

export default LeaveService;
