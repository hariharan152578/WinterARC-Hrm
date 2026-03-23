import api from "@/lib/axios";

export type EmployeeDashboardStats = {
  taskCounts: {
    yetToStart: number;
    inProcess: number;
    completed: number;
  };
  attendance: {
    isLoggedIn: boolean;
    totalMinutesToday: number;
    lastLogin: string | null;
  };
  recentLogs: any[];
  efficiency: number;
  efficiencyLogs: any[];
};

export const getEmployeeDashboardStats = async (): Promise<EmployeeDashboardStats> => {
  const response = await api.get("/dashboard/employee-dashboard");
  return response.data;
};

export const getEfficiencyLogs = async () => {
  const response = await api.get("/dashboard/efficiency-logs");
  return response.data;
};

export const getMyTasks = async () => {
  const response = await api.get("/requestassign/inbox");
  return response.data;
};
