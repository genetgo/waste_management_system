import React, { useEffect, useState } from "react";
import API from "../../services/api";

const Reports = () => {
  const [loading, setLoading] = useState(true);

  const [summary, setSummary] = useState({
    totalResidents: 0,
    totalBusinesses: 0,
    totalCollectors: 0,
    totalSchedules: 0,
    totalRequests: 0,
    completedRequests: 0,
    pendingRequests: 0,
  });

  const [reports, setReports] = useState([]);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
  try {
    setLoading(true);

    const res = await API.get("/reports/municipal");

    console.log("MUNICIPAL REPORT RESPONSE:", res.data);

    if (res.data?.success) {
      setSummary({
        totalResidents: Number(res.data.summary?.totalResidents) || 0,
        totalBusinesses: Number(res.data.summary?.totalBusinesses) || 0,
        totalCollectors: Number(res.data.summary?.totalCollectors) || 0,
        totalSchedules: Number(res.data.summary?.totalSchedules) || 0,
        totalRequests: Number(res.data.summary?.totalRequests) || 0,
        completedRequests:
          Number(res.data.summary?.completedRequests) || 0,
        pendingRequests:
          Number(res.data.summary?.pendingRequests) || 0,
      });

      setReports(Array.isArray(res.data.reports) ? res.data.reports : []);
    } else {
      throw new Error(
        res.data?.message || "Failed to load municipal reports."
      );
    }
  } catch (err) {
    console.error(
      "Municipal reports error:",
      err.response?.data || err.message || err
    );

    setSummary({
      totalResidents: 0,
      totalBusinesses: 0,
      totalCollectors: 0,
      totalSchedules: 0,
      totalRequests: 0,
      completedRequests: 0,
      pendingRequests: 0,
    });

    setReports([]);
  } finally {
    setLoading(false);
  }
};
  if (loading) {
    return (
      <div className="p-10 text-center text-lg font-semibold">
        Loading Municipal Reports...
      </div>
    );
  }
const exportExcel = () => {
  const headers = [
    "#",
    "Category",
    "Total",
    "Status",
    "Last Updated",
  ];

  const rows = reports.map((report, index) => [
    index + 1,
    report.category,
    report.total,
    report.status,
    report.updated_at,
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "municipal-reports.csv";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

const exportPDF = () => {
  window.print();
};
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Municipal Reports</h1>
        <p className="text-gray-500 mt-2">
          Waste Collection Management Reports
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl shadow border p-5">
          <p className="text-gray-500 text-sm">Residents</p>
          <h2 className="text-3xl font-bold text-blue-600 mt-2">
            {summary.totalResidents}
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow border p-5">
          <p className="text-gray-500 text-sm">Business Owners</p>
          <h2 className="text-3xl font-bold text-green-600 mt-2">
            {summary.totalBusinesses}
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow border p-5">
          <p className="text-gray-500 text-sm">Collectors</p>
          <h2 className="text-3xl font-bold text-indigo-600 mt-2">
            {summary.totalCollectors}
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow border p-5">
          <p className="text-gray-500 text-sm">Requests</p>
          <h2 className="text-3xl font-bold text-red-600 mt-2">
            {summary.totalRequests}
          </h2>
        </div>
      </div>

      {/* Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
          <p className="text-green-700 text-sm font-semibold">
            Completed Requests
          </p>
          <h2 className="text-3xl font-bold text-green-700 mt-2">
            {summary.completedRequests}
          </h2>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5">
          <p className="text-yellow-700 text-sm font-semibold">
            Pending Requests
          </p>
          <h2 className="text-3xl font-bold text-yellow-700 mt-2">
            {summary.pendingRequests}
          </h2>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
          <p className="text-blue-700 text-sm font-semibold">
            Collection Schedules
          </p>
          <h2 className="text-3xl font-bold text-blue-700 mt-2">
            {summary.totalSchedules}
          </h2>
        </div>
      </div>

     {/* Export Buttons */}
<div className="flex flex-wrap items-center gap-4">
  <button
    onClick={exportExcel}
    type="button"
    className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg"
  >
    Export Excel
  </button>

  <button
    onClick={exportPDF}
    type="button"
    className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg"
  >
    Export PDF
  </button>

  <button
    onClick={fetchReports}
    type="button"
    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
  >
    Refresh
  </button>
</div>

      {/* Reports Table */}
      <div className="bg-white rounded-2xl shadow border overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">Municipal Reports</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left">#</th>
                <th className="px-6 py-3 text-left">Category</th>
                <th className="px-6 py-3 text-left">Total</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {reports.length > 0 ? (
                reports.map((report, index) => (
                  <tr key={report.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4">{index + 1}</td>
                    <td className="px-6 py-4 font-medium">{report.category}</td>
                    <td className="px-6 py-4">{report.total}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          report.status === "Completed"
                            ? "bg-green-100 text-green-700"
                            : report.status === "Pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">{report.updated_at}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center py-8 text-gray-500"
                  >
                    No reports found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;