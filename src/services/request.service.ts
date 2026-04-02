import api from "@/lib/axios";

export enum RequestType {
  LEAVE = "LEAVE",
  PERMISSION = "PERMISSION",
  GENERAL = "GENERAL",
}

export enum RequestStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export interface RequestPayload {
  subject: string;
  description: string;
  message?: string;
  type?: RequestType;
}

export interface RequestData {
  id: number;
  subject: string;
  description: string;
  message: string | null;
  createdBy: number;
  currentApproverId: number;
  status: RequestStatus;
  type: RequestType;
  createdAt: string;
  updatedAt: string;
  creator?: {
    id: number;
    name: string;
    role: string;
  };
  approver?: {
    id: number;
    name: string;
    role: string;
  };
}

const RequestService = {
  createRequest: async (payload: RequestPayload) => {
    const response = await api.post("/requests", payload);
    return response.data;
  },

  getInbox: async (): Promise<RequestData[]> => {
    const response = await api.get("/requests/inbox");
    return response.data;
  },

  getMyCreatedRequests: async (): Promise<RequestData[]> => {
    const response = await api.get("/requests/my-created");
    return response.data;
  },

  handleRequestAction: async (requestId: number, action: "APPROVE" | "REJECT", message?: string) => {
    const response = await api.put(`/requests/${requestId}/action`, { action, message });
    return response.data;
  },

  deleteRequest: async (requestId: number) => {
    const response = await api.delete(`/requests/${requestId}`);
    return response.data;
  },
};

export default RequestService;
