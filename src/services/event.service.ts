import api from "@/lib/axios";

export interface CreateEventPayload {
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  color?: string;
  files?: File[];
}

export interface EventType {
  id: number;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  color: string;
  files: string[];
  createdBy: number;
  tenantId: number;
  completed?: boolean;
  createdAt: string;
  updatedAt: string;
}

export const EventService = {
  // ✅ Create Event
  async createEvent(payload: CreateEventPayload) {
    const formData = new FormData();

    formData.append("title", payload.title);
    formData.append("description", payload.description || "");
    formData.append("date", payload.date);
    formData.append("startTime", payload.startTime);
    formData.append("endTime", payload.endTime);
    formData.append("color", payload.color || "");

    if (payload.files) {
      payload.files.forEach((file) => {
        formData.append("files", file);
      });
    }

    const response = await api.post("/events/event", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },

  // ✅ Get Events
  async getEvents(): Promise<EventType[]> {
    const response = await api.get("/events/event");
    return response.data;
  },

  // ✅ Update Event
  async updateEvent(id: number, payload: CreateEventPayload) {
    const formData = new FormData();

    formData.append("title", payload.title);
    formData.append("description", payload.description || "");
    formData.append("date", payload.date);
    formData.append("startTime", payload.startTime);
    formData.append("endTime", payload.endTime);
    formData.append("color", payload.color || "");

    if (payload.files) {
      payload.files.forEach((file) => {
        formData.append("files", file);
      });
    }

    const response = await api.put(`/events/event/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },
};