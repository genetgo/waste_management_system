
// src/pages/resident/Dashboard.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import residentService from "../../services/residentService";

const Dashboard = () => {
  const navigate = useNavigate();

  const [resident, setResident] = useState(null);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // LOAD RESIDENT PROFILE
  // ==========================================
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await residentService.getDashboard();

        console.log("Resident Dashboard Response:", response);

        if (response?.success) {
          setResident(response?.data?.resident || null);
        }
      } catch (err) {
        console.error("Resident Dashboard Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // ==========================================
  // LOGOUT
  // ==========================================
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");

    navigate("/login", { replace: true });
  };

  // ==========================================
  // LOADING
  // ==========================================
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <h2 className="text-lg font-semibold text-slate-600 animate-pulse">
          Loading Dashboard...
        </h2>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 bg-gray-100 min-h-screen space-y-6">

      {/* ==========================================
          HEADER
      ========================================== */}
      <div className="bg-white border rounded-2xl shadow-sm p-6">

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">

          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Welcome back, {resident?.full_name || "Resident"} 👋
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Resident Portal Overview
            </p>
          </div>

          {/* LOGOUT */}
          <button
            type="button"
            onClick={handleLogout}
            className="
              px-4 py-2.5
              bg-red-600
              hover:bg-red-700
              text-white
              text-xs
              font-semibold
              rounded-xl
              shadow-sm
              transition
              flex
              items-center
              gap-2
            "
          >
            🚪 Logout
          </button>

        </div>

      </div>


      {/* ==========================================
          QUICK ACTIONS
      ========================================== */}
      <div>

        <h2 className="text-lg font-bold text-gray-800 mb-3">
          Quick Actions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* ======================================
              COLLECTION SCHEDULE
          ====================================== */}
          <Link
            to="/resident/schedule"
            className="
              bg-white
              border
              rounded-2xl
              p-6
              shadow-sm
              hover:shadow-md
              hover:-translate-y-0.5
              transition
            "
          >
            <div
              className="
                w-12
                h-12
                rounded-xl
                bg-blue-50
                flex
                items-center
                justify-center
                text-2xl
                mb-4
              "
            >
              📅
            </div>

            <h3 className="text-sm font-bold text-gray-800">
              View Collection Schedule
            </h3>

            <p className="text-xs text-gray-500 mt-1">
              View your upcoming waste collection dates.
            </p>
          </Link>


          {/* ======================================
              GIVE FEEDBACK
          ====================================== */}
          <Link
            to="/resident/feedback"
            className="
              bg-white
              border
              rounded-2xl
              p-6
              shadow-sm
              hover:shadow-md
              hover:-translate-y-0.5
              transition
            "
          >
            <div
              className="
                w-12
                h-12
                rounded-xl
                bg-emerald-50
                flex
                items-center
                justify-center
                text-2xl
                mb-4
              "
            >
              💬
            </div>

            <h3 className="text-sm font-bold text-gray-800">
              Give Feedback
            </h3>

            <p className="text-xs text-gray-500 mt-1">
              Share your experience with the waste collection service.
            </p>
          </Link>


          {/* ======================================
              MY PROFILE
          ====================================== */}
          <Link
            to="/resident/profile"
            className="
              bg-white
              border
              rounded-2xl
              p-6
              shadow-sm
              hover:shadow-md
              hover:-translate-y-0.5
              transition
            "
          >
            <div
              className="
                w-12
                h-12
                rounded-xl
                bg-purple-50
                flex
                items-center
                justify-center
                text-2xl
                mb-4
              "
            >
              👤
            </div>

            <h3 className="text-sm font-bold text-gray-800">
              My Profile
            </h3>

            <p className="text-xs text-gray-500 mt-1">
              View and update your resident account information.
            </p>
          </Link>

        </div>

      </div>


      {/* ==========================================
          RESIDENT INFORMATION
      ========================================== */}
      <div className="bg-white border rounded-2xl shadow-sm p-6">

        <div className="flex items-center justify-between mb-5">

          <div>
            <h2 className="text-lg font-bold text-gray-800">
              Resident Information
            </h2>

            <p className="text-xs text-gray-500 mt-1">
              Your registered resident details
            </p>
          </div>

          <span className="text-2xl">
            🏠
          </span>

        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

          {/* ======================================
              FULL NAME
          ====================================== */}
          <div>
            <p className="text-xs font-semibold text-gray-400">
              Full Name
            </p>

            <p className="text-sm font-bold text-gray-700 mt-1">
              {resident?.full_name || "Not Set"}
            </p>
          </div>


          {/* ======================================
              PHONE
          ====================================== */}
          <div>
            <p className="text-xs font-semibold text-gray-400">
              Phone Number
            </p>

            <p className="text-sm font-bold text-gray-700 mt-1 font-mono">
              {resident?.phone_number || "Not Set"}
            </p>
          </div>


          {/* ======================================
              EMAIL
          ====================================== */}
          <div>
            <p className="text-xs font-semibold text-gray-400">
              Email Address
            </p>

            <p className="text-sm font-bold text-gray-700 mt-1 break-all">
              {resident?.email || "Not Set"}
            </p>
          </div>


          {/* ======================================
              KIFLE KETEMA
          ====================================== */}
          <div>
            <p className="text-xs font-semibold text-gray-400">
              Kifle Ketema
            </p>

            <p className="text-sm font-bold text-gray-700 mt-1">
              {resident?.kifle_ketema ||
               resident?.assigned_kifle_ketema ||
               "Not Set"}
            </p>
          </div>


          {/* ======================================
              KEBELE
          ====================================== */}
          <div>
            <p className="text-xs font-semibold text-gray-400">
              Kebele
            </p>

            <p className="text-sm font-bold text-gray-700 mt-1">
              {resident?.kebele || "Not Set"}
            </p>
          </div>


          {/* ======================================
              SEFER
          ====================================== */}
          <div>
            <p className="text-xs font-semibold text-gray-400">
              Sefer
            </p>

            <p className="text-sm font-bold text-gray-700 mt-1">
              {resident?.sefer || "Not Set"}
            </p>
          </div>



        </div>

      </div>

    </div>
  );
};

export default Dashboard;
