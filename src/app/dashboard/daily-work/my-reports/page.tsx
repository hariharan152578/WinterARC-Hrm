"use client";

import { useEffect, useState } from "react";
import { getMyReports } from "@/services/dailywork.service";
import ReportCard from "../components/ReportCard";

export default function MyReportsPage() {

  const [reports, setReports] = useState([]);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    const data = await getMyReports();
    setReports(data);
  };

  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-6">
        My Submitted Reports
      </h1>

      <div className="grid gap-4">
        {reports.map((r: any) => (
          <ReportCard key={r.id} report={r} />
        ))}
      </div>

    </div>
  );
}