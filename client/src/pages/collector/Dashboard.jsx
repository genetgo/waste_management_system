
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import collectorService from "../../services/collectorService";

const Dashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [collector, setCollector] = useState(null);

  const [stats, setStats] = useState({
    todayTasks: 0,
    completedToday: 0,
    pendingTasks: 0,
  });

  const [loading, setLoading] = useState(true);

  // ==========================================
  // FETCH COLLECTOR DASHBOARD
  // ==========================================
  const fetchCollectorDashboard = async () => {
    try {
      setLoading(true);

      const response =
        await collectorService.getDashboard();

      console.log(
        "Collector Dashboard Response:",
        response
      );

      if (response?.success) {
        setCollector(
          response.data?.collector || null
        );

        setStats({
          todayTasks:
            response.data?.stats?.todayTasks ?? 0,

          completedToday:
            response.data?.stats?.completedToday ?? 0,

          pendingTasks:
            response.data?.stats?.pendingTasks ?? 0,
        });
      }
    } catch (err) {
      console.error(
        "Collector Dashboard Error:",
        err
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOAD DASHBOARD
  // ==========================================
  useEffect(() => {
    fetchCollectorDashboard();
  }, []);

  // ==========================================
  // LOGOUT
  // ==========================================
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");

    navigate("/login", {
      replace: true,
    });
  };

  // ==========================================
  // LOADING
  // ==========================================
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-sm text-gray-500 animate-pulse">
            {t("collectorDashboard.loading")}
          </div>
        </div>
      </div>
    );
  }

  const collectorName =
    collector?.full_name ||
    t("collectorDashboard.collector");

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">

      {/* ======================================
          HEADER
      ====================================== */}
      <div
        className="
          bg-white
          border
          border-gray-100
          rounded-2xl
          shadow-sm
          p-5
          sm:p-6
        "
      >
        <div
          className="
            flex
            flex-col
            sm:flex-row
            sm:items-center
            sm:justify-between
            gap-4
          "
        >

          {/* LEFT */}
          <div className="min-w-0">

            <h1
              className="
                text-2xl
                sm:text-3xl
                font-bold
                text-gray-800
                break-words
              "
            >
              {t("collectorDashboard.welcomeBack", {
                name: collectorName,
              })}
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              {t("collectorDashboard.portalOverview")}
            </p>

          </div>

          {/* TOP RIGHT LOGOUT */}
          <div className="flex sm:justify-end">

            <button
              type="button"
              onClick={handleLogout}
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                px-5
                py-2.5
                bg-red-600
                hover:bg-red-700
                active:bg-red-800
                text-white
                text-sm
                font-semibold
                rounded-xl
                shadow-sm
                transition
                duration-200
                whitespace-nowrap
              "
            >
              <span>🚪</span>
              <span>
                {t("collectorDashboard.logout")}
              </span>
            </button>

          </div>

        </div>
      </div>

      {/* ======================================
          COLLECTOR INFORMATION
      ====================================== */}
      <div
        className="
          bg-white
          border
          border-gray-100
          rounded-2xl
          shadow-sm
          p-5
          sm:p-6
        "
      >

        <div
          className="
            grid
            grid-cols-1
            sm:grid-cols-2
            gap-5
          "
        >

          {/* ROLE */}
          <div
            className="
              bg-gray-50
              rounded-xl
              p-4
              border
              border-gray-100
            "
          >
            <p className="text-xs text-gray-500">
              {t("collectorDashboard.role")}
            </p>

            <p className="text-sm font-semibold text-gray-800 mt-1">
              {t("collectorDashboard.collector")}
            </p>
          </div>

          {/* KIFLE KETEMA */}
          <div
            className="
              bg-gray-50
              rounded-xl
              p-4
              border
              border-gray-100
            "
          >
            <p className="text-xs text-gray-500">
              {t("collectorDashboard.assignedKifleKetema")}
            </p>

            <p className="text-sm font-semibold text-gray-800 mt-1">
              {collector?.assigned_kifle_ketema ||
                t("collectorDashboard.notAssigned")}
            </p>
          </div>

        </div>

      </div>

      {/* ======================================
          QUICK ACTIONS
      ====================================== */}
      <div>

        <h2 className="text-lg font-bold text-gray-800 mb-3">
          {t("collectorDashboard.quickActions")}
        </h2>

        <div
          className="
            grid
            grid-cols-1
            sm:grid-cols-2
            gap-4
          "
        >

          {/* ASSIGNED TASKS */}
          <Link
            to="/collector/assigned-tasks"
            className="
              group
              bg-white
              border
              border-gray-100
              rounded-2xl
              p-5
              shadow-sm
              hover:shadow-md
              hover:border-blue-200
              transition
              duration-200
            "
          >

            <div
              className="
                w-12
                h-12
                flex
                items-center
                justify-center
                bg-blue-50
                text-2xl
                rounded-xl
                mb-3
                group-hover:bg-blue-100
                transition
              "
            >
              📋
            </div>

            <h3 className="text-sm font-bold text-gray-800">
              {t("collectorDashboard.assignedTasks.title")}
            </h3>

            <p className="text-xs text-gray-500 mt-1 leading-5">
              {t("collectorDashboard.assignedTasks.description")}
            </p>

          </Link>

          {/* PROFILE */}
          <Link
            to="/collector/profile"
            className="
              group
              bg-white
              border
              border-gray-100
              rounded-2xl
              p-5
              shadow-sm
              hover:shadow-md
              hover:border-emerald-200
              transition
              duration-200
            "
          >

            <div
              className="
                w-12
                h-12
                flex
                items-center
                justify-center
                bg-emerald-50
                text-2xl
                rounded-xl
                mb-3
                group-hover:bg-emerald-100
                transition
              "
            >
              👤
            </div>

            <h3 className="text-sm font-bold text-gray-800">
              {t("collectorDashboard.profile.title")}
            </h3>

            <p className="text-xs text-gray-500 mt-1 leading-5">
              {t("collectorDashboard.profile.description")}
            </p>

          </Link>

        </div>

      </div>

    </div>
  );
};

export default Dashboard;
