import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBuilding,
  FaArrowRight,
  FaSignOutAlt,
  FaMapMarkerAlt,
  FaUserShield,
  FaCalendarAlt,
} from "react-icons/fa";



// ==========================================
// KIFLE KETEMAS
// ==========================================

const KIFLE_KETEMAS = [
  {
    id: "Abima",
    name: "Abima Sub-City",
    color: "from-blue-600 to-indigo-800",
  },
  {
    id: "Menkorer",
    name: "Menkorer Sub-City",
    color: "from-cyan-600 to-blue-800",
  },
  {
    id: "Nigus Teklehaymanot",
    name: "Nigus Teklehaymanot Sub-City",
    color: "from-emerald-600 to-teal-700",
  },
  {
    id: "Tedila Gualu",
    name: "Tedila Gualu Sub-City",
    color: "from-purple-700 to-indigo-900",
  },
];

// ==========================================
// ADMIN HOME
// ==========================================

const AdminHome = () => {

  const navigate = useNavigate();

  const [admin, setAdmin] = useState(null);
  const [greeting, setGreeting] = useState("");

  // ==========================================
  // REAL-TIME SOCKET NOTIFICATION
  // ==========================================


  // ==========================================
  // LOAD ADMIN
  // ==========================================

  useEffect(() => {

    const user = JSON.parse(
      localStorage.getItem("user")
    );

    console.log(
      "🏛️ MUNICIPAL ADMIN USER:",
      user
    );

    if (!user) {

      navigate("/login");

      return;
    }

    // ==========================================
    // GREETING
    // ==========================================

    const hour = new Date().getHours();

    if (hour < 12) {

      setGreeting("Good Morning");

    } else if (hour < 18) {

      setGreeting("Good Afternoon");

    } else {

      setGreeting("Good Evening");
    }

    // ==========================================
    // ASSIGNED KIFLE KETEMA
    // ==========================================

    const area =
      KIFLE_KETEMAS.find(
        (k) =>
          k.id === user.assigned_kifle_ketema
      ) || {
        id: "",
        name:
          user.assigned_kifle_ketema ||
          "Unknown Area",
        color:
          "from-gray-600 to-gray-800",
      };

    // ==========================================
    // SET ADMIN
    // ==========================================

    setAdmin({
      ...user,
      area,
    });

  }, [navigate]);

  // ==========================================
  // LOADING
  // ==========================================

  if (!admin) {

    return (
      <div className="min-h-screen flex items-center justify-center text-xl font-semibold">

        Loading Municipal Administrator...

      </div>
    );
  }

  // ==========================================
  // TODAY
  // ==========================================

  const today =
    new Date().toLocaleDateString(
      "en-US",
      {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {

    localStorage.clear();

    navigate("/login");
  };

  // ==========================================
  // UI
  // ==========================================

  return (

    <div className="min-h-screen bg-gray-100 flex flex-col">

      {/* ======================================
          HEADER
      ====================================== */}

      <header className="bg-white shadow-md px-8 py-5 flex justify-between items-center">

        <div>

          <h1 className="text-2xl font-bold text-blue-700">

            Debre Markos Waste Collection
            Management System

          </h1>

          <p className="text-sm text-gray-500">

            Municipal Administration Portal

          </p>

        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg transition"
        >

          <FaSignOutAlt />

          Logout

        </button>

      </header>

      {/* ======================================
          MAIN CONTENT
      ====================================== */}

      <main className="flex-1 flex justify-center items-center p-8">

        <div className="max-w-6xl w-full bg-white rounded-3xl shadow-xl overflow-hidden grid lg:grid-cols-2">

          {/* ==================================
              LEFT PANEL
          ================================== */}

          <div
            className={`bg-gradient-to-br ${admin.area?.color} text-white p-10 flex flex-col justify-between`}
          >

            <div>

              <FaBuilding className="text-6xl mb-6 opacity-90" />

              <h2 className="uppercase tracking-widest text-sm font-semibold opacity-80">

                Municipal Administrator

              </h2>

              <h1 className="text-4xl font-extrabold mt-3">

                {admin.area?.name}

              </h1>

              <p className="mt-4 text-lg opacity-90">

                Waste Collection Management System

              </p>

            </div>

            <div className="border-t border-white/30 pt-5">

              Debre Markos Municipality

            </div>

          </div>

          {/* ==================================
              RIGHT PANEL
          ================================== */}

          <div className="p-10 flex flex-col justify-between">

            <div>

              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold">

                <FaUserShield />

                Authentication Successful

              </div>

              <h2 className="text-4xl font-bold text-gray-800 mt-6">

                {greeting},

              </h2>

              <h1 className="text-3xl font-extrabold text-blue-700 mt-2">

                {admin.full_name}

              </h1>

              <p className="mt-5 text-gray-600 leading-8">

                Welcome to{" "}

                <span className="font-bold text-blue-700">

                  {admin.area?.name}

                </span>{" "}

                Municipal Administration Portal.
                Manage residents, collectors,
                schedules, requests, reports and
                monitor all waste collection
                activities in your assigned
                sub-city.

              </p>

            </div>

            {/* ==================================
                ADMIN INFORMATION
            ================================== */}

            <div className="space-y-5 mt-8">

              {/* Assigned Area */}

              <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-4">

                <FaMapMarkerAlt className="text-2xl text-blue-600" />

                <div>

                  <p className="text-sm text-gray-500">

                    Assigned Area

                  </p>

                  <h3 className="text-lg font-bold text-gray-800">

                    {admin.area?.name}

                  </h3>

                </div>

              </div>

              {/* Today's Date */}

              <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-4">

                <FaCalendarAlt className="text-2xl text-green-600" />

                <div>

                  <p className="text-sm text-gray-500">

                    Today's Date

                  </p>

                  <h3 className="text-lg font-bold text-gray-800">

                    {today}

                  </h3>

                </div>

              </div>

            </div>

            {/* ==================================
                DASHBOARD BUTTON
            ================================== */}

            <div className="mt-10">

              <button
                onClick={() =>
                  navigate(
                    "/municipal-admin/dashboard"
                  )
                }
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition"
              >

                Go To Dashboard

                <FaArrowRight />

              </button>

            </div>

          </div>

        </div>

      </main>

      {/* ======================================
          FOOTER
      ====================================== */}

      <footer className="bg-white border-t py-5 text-center text-gray-500 text-sm">

        © 2026 Debre Markos Municipality |
        Waste Collection Management System

      </footer>

    </div>
  );
};

export default AdminHome;