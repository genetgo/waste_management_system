
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";
const Dashboard = () => {
  // ==========================================
  // Dashboard Statistics
  // ==========================================
  const [stats, setStats] = useState({
    totalResidents: 0,
    totalBusinesses: 0,
    activeCollectors: 0,

    totalSchedules: 0,
    pendingSchedules: 0,
    completedSchedules: 0,

    totalRequests: 0,
    pendingRequests: 0,
    completedRequests: 0,

    totalNotifications: 0,
    totalReports: 0,
    totalFeedback: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // Fetch Dashboard
  // ==========================================
  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get(
        "/dashboard/municipal"
      );

      console.log(
        "MUNICIPAL DASHBOARD RESPONSE:",
        response.data
      );

      if (response.data?.success) {
        const data = response.data.data || {};

        setStats({
          totalResidents:
            Number(data.totalResidents) || 0,

          totalBusinesses:
            Number(data.totalBusinesses) || 0,

          activeCollectors:
            Number(data.activeCollectors) || 0,

          totalSchedules:
            Number(data.totalSchedules) || 0,

          pendingSchedules:
            Number(data.pendingSchedules) || 0,

          completedSchedules:
            Number(data.completedSchedules) || 0,

          totalRequests:
            Number(data.totalRequests) || 0,

          pendingRequests:
            Number(data.pendingRequests) || 0,

          completedRequests:
            Number(data.completedRequests) || 0,

          totalNotifications:
            Number(data.totalNotifications) || 0,

          totalReports:
            Number(data.totalReports) || 0,

          totalFeedback:
            Number(data.totalFeedback) || 0,
        });
      }
    } catch (err) {
      console.error(
        "Municipal dashboard error:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.message ||
          "Dashboard data could not be loaded."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // Loading
  // ==========================================
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <h2 className="text-xl font-semibold">
          Loading Municipal Dashboard...
        </h2>
      </div>
    );
  }

  // ==========================================
  // Error
  // ==========================================
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-red-100 text-red-700 px-6 py-4 rounded-xl">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">

      {/* ==========================================
          Dashboard Statistics
      =========================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

        
        {/* Businesses */}
        <div className="bg-white rounded-2xl shadow border p-6">
          <p className="text-sm text-gray-500">
            Business Owners
          </p>

          <h2 className="text-3xl font-bold text-green-700 mt-2">
            {stats.totalBusinesses}
          </h2>

          <p className="text-xs text-gray-400 mt-2">
            Registered businesses
          </p>
        </div>

        {/* Collectors */}
        <div className="bg-white rounded-2xl shadow border p-6">
          <p className="text-sm text-gray-500">
            Active Collectors
          </p>

          <h2 className="text-3xl font-bold text-orange-600 mt-2">
            {stats.activeCollectors}
          </h2>

          <p className="text-xs text-gray-400 mt-2">
            Working collectors
          </p>
        </div>

        {/* Schedules */}
        <div className="bg-white rounded-2xl shadow border p-6">
          <p className="text-sm text-gray-500">
            Collection Schedules
          </p>

          <h2 className="text-3xl font-bold text-purple-700 mt-2">
            {stats.totalSchedules}
          </h2>

          <p className="text-xs text-gray-400 mt-2">
            Collection schedules
          </p>
        </div>

        {/* Pending Requests */}
        <div className="bg-white rounded-2xl shadow border p-6">
          <p className="text-sm text-gray-500">
            Pending Requests
          </p>

          <h2 className="text-3xl font-bold text-red-600 mt-2">
            {stats.pendingRequests}
          </h2>

          <p className="text-xs text-gray-400 mt-2">
            Waiting for service
          </p>
        </div>

        {/* Completed Requests */}
        <div className="bg-white rounded-2xl shadow border p-6">
          <p className="text-sm text-gray-500">
            Completed Requests
          </p>

          <h2 className="text-3xl font-bold text-emerald-700 mt-2">
            {stats.completedRequests}
          </h2>

          <p className="text-xs text-gray-400 mt-2">
            Successfully completed
          </p>
        </div>

      </div>

      {/* ==========================================
          Quick Access
      =========================================== */}
      <div>

        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Quick Access
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

          
          <Link
            to="/municipal-admin/business-owners"
            className="bg-white rounded-2xl border shadow hover:shadow-lg transition p-6"
          >
            <div className="text-4xl mb-3">
              🏢
            </div>

            <h3 className="font-bold text-lg">
              Business Owners
            </h3>

            <p className="text-sm text-gray-500 mt-2">
              View all registered businesses.
            </p>
          </Link>

          <Link
            to="/municipal-admin/collectors"
            className="bg-white rounded-2xl border shadow hover:shadow-lg transition p-6"
          >
            <div className="text-4xl mb-3">
              🚛
            </div>

            <h3 className="font-bold text-lg">
              Collectors
            </h3>

            <p className="text-sm text-gray-500 mt-2">
              View and manage waste collectors.
            </p>
          </Link>

          <Link
            to="/municipal-admin/schedules"
            className="bg-white rounded-2xl border shadow hover:shadow-lg transition p-6"
          >
            <div className="text-4xl mb-3">
              📅
            </div>

            <h3 className="font-bold text-lg">
              Collection Schedules
            </h3>

            <p className="text-sm text-gray-500 mt-2">
              Create and manage schedules.
            </p>
          </Link>

         <Link
  to="/municipal-admin/on-demand-requests"
  className="bg-white rounded-2xl border shadow hover:shadow-lg transition p-6"
>
  <div className="text-4xl mb-3">
    ♻️
  </div>

  <h3 className="font-bold text-lg">
    On-Demand Requests
  </h3>

  <p className="text-sm text-gray-500 mt-2">
    View service requests.
  </p>
</Link>
          <Link
            to="/municipal-admin/reports"
            className="bg-white rounded-2xl border shadow hover:shadow-lg transition p-6"
          >
            <div className="text-4xl mb-3">
              📊
            </div>

            <h3 className="font-bold text-lg">
              Reports
            </h3>

            <p className="text-sm text-gray-500 mt-2">
              View municipal reports.
            </p>
          </Link>

          <Link
            to="/municipal-admin/feedback"
            className="bg-white rounded-2xl border shadow hover:shadow-lg transition p-6"
          >
            <div className="text-4xl mb-3">
              💬
            </div>

            <h3 className="font-bold text-lg">
              Feedback
            </h3>

            <p className="text-sm text-gray-500 mt-2">
              Review citizen feedback.
            </p>
          </Link>
<Link
  to="/municipal-admin/notifications"
  className="bg-white rounded-2xl border shadow hover:shadow-lg transition p-6 block text-gray-800"
>
  <div className="text-4xl mb-3">
    🔔
  </div>

  <h3 className="font-bold text-lg text-gray-800">
    Notifications
  </h3>

  <p className="text-sm text-gray-500 mt-2">
    View system notifications.
  </p>

</Link>
          <Link
            to="/municipal-admin/profile"
            className="bg-white rounded-2xl border shadow hover:shadow-lg transition p-6"
          >
            <div className="text-4xl mb-3">
              ⚙️
            </div>

            <h3 className="font-bold text-lg">
              My Profile
            </h3>

            <p className="text-sm text-gray-500 mt-2">
              Update your account settings.
            </p>
          </Link>

        </div>
        
      </div>

   
    </div>
  );
};

export default Dashboard;

