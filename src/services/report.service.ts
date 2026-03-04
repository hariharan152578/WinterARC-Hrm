import api from "@/lib/axios";

export const ReportService = {

  // Get my submitted reports
  async getMyReports() {
    const res = await api.get("/dailywork/my-reports");
    return res.data;
  },

  // Submit daily report
  async submitReport(formData: FormData) {
    const res = await api.post("/dailywork/submit", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

};