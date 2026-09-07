import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaShieldAlt,
  FaArrowRight,
  FaSignOutAlt,
  FaCalendarAlt,
  FaUserCog,
  FaServer,
} from "react-icons/fa";

const SystemAdminHome = () => {
  const navigate = useNavigate();

  const [admin, setAdmin] = useState(null);
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      navigate("/login");
      return;
    }

    const hour = new Date().getHours();

    if (hour < 12) {
      setGreeting("Good Morning");
    } else if (hour < 18) {
      setGreeting("Good Afternoon");
    } else {
      setGreeting("Good Evening");
    }

    setAdmin(user);
  }, [navigate]);

  if (!admin) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl font-semibold">
        Loading System Administrator...
      </div>
    );
  }

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">

      {/* Header */}
      <header className="bg-white shadow-md px-8 py-5 flex justify-between items-center">

        <div>
          <h1 className="text-2xl font-bold text-indigo-700">
            Debre Markos Waste Collection Management System
          </h1>

          <p className="text-sm text-gray-500">
            System Administration Portal
          </p>
        </div>

        <button
          onClick={() => {
            localStorage.clear();
            navigate("/login");
          }}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg transition"
        >
          <FaSignOutAlt />
          Logout
        </button>

      </header>

      {/* Main */}

      <main className="flex-1 flex justify-center items-center p-8">

        <div className="max-w-6xl w-full bg-white rounded-3xl shadow-xl overflow-hidden grid lg:grid-cols-2">

          {/* Left */}

          <div className="bg-gradient-to-br from-indigo-700 to-blue-900 text-white p-10 flex flex-col justify-between">

            <div>

              <FaShieldAlt className="text-6xl mb-6 opacity-90" />

              <h2 className="uppercase tracking-widest text-sm font-semibold opacity-80">
                System Administrator
              </h2>

              <h1 className="text-4xl font-extrabold mt-3">
                Control Center
              </h1>

              <p className="mt-4 text-lg opacity-90">
                Waste Collection Management System
              </p>

            </div>

            <div className="border-t border-white/30 pt-5">
              Debre Markos Municipality
            </div>

          </div>

          {/* Right */}

          <div className="p-10 flex flex-col justify-between">

            <div>

              <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-semibold">
                <FaUserCog />
                Authentication Successful
              </div>

              <h2 className="text-4xl font-bold text-gray-800 mt-6">
                {greeting},
              </h2>

              <h1 className="text-3xl font-extrabold text-indigo-700 mt-2">
                {admin.full_name}
              </h1>

              <p className="mt-5 text-gray-600 leading-8">
                Welcome to the System Administration Portal.
                Manage users, staff accounts, permissions,
                backups and monitor the entire Waste Collection
                Management System.
              </p>

            </div>

            <div className="space-y-5 mt-8">

              <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-4">

                <FaShieldAlt className="text-2xl text-indigo-600" />

                <div>
                  <p className="text-sm text-gray-500">
                    Role
                  </p>

                  <h3 className="text-lg font-bold text-gray-800">
                    System Administrator
                  </h3>
                </div>

              </div>

              <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-4">

                <FaServer className="text-2xl text-green-600" />

                <div>
                  <p className="text-sm text-gray-500">
                    Access Level
                  </p>

                  <h3 className="text-lg font-bold text-gray-800">
                    Full System Access
                  </h3>
                </div>

              </div>

              <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-4">

                <FaCalendarAlt className="text-2xl text-blue-600" />

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

            <div className="mt-10">

              <button
                onClick={() => navigate("/system-admin/dashboard")}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition"
              >
                Go To Dashboard
                <FaArrowRight />
              </button>

            </div>

          </div>

        </div>

      </main>

      {/* Footer */}

      <footer className="bg-white border-t py-5 text-center text-gray-500 text-sm">
        © 2026 Debre Markos Municipality | Waste Collection Management System
      </footer>

    </div>
  );
};

export default SystemAdminHome;