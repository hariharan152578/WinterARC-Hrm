import api from "@/lib/axios";

export const submitDailyWork = async (formData: FormData) => {
  const res = await api.post("/dailywork/submit", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const getMyReports = async () => {
  const res = await api.get("/dailywork/my-reports");
  return res.data;
};

export const getInboxReports = async () => {
  const res = await api.get("/dailywork/inbox");
  return res.data;
};