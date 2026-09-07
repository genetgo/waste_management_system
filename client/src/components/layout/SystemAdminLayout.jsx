import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import ROUTES from "../../constants/routes";

const SystemAdminLayout = () => {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ==========================================
  // Menu Items
  // ==========================================
  const menuItems = [
    {
      label: "Home",
      path: "/system-admin/home",
      icon: "🏠",
    },
    {
      label: "Dashboard",
      path: ROUTES.SYSTEM_DASHBOARD,
      icon: "📊",
    },
    {
      label: "Users",
      path: ROUTES.SYSTEM_USERS,
      icon: "👥",
    },
    {
      label: "Requests",
      path: ROUTES.SYSTEM_REQUESTS,
      icon: "📋",
    },
    {
      label: "Roles",
      path: ROUTES.SYSTEM_ROLES,
      icon: "🔐",
    },
    {
      label: "Staff Accounts",
      path: ROUTES.SYSTEM_STAFF,
      icon: "👤",
    },
    {
      label: "Backup",
      path: ROUTES.SYSTEM_BACKUP,
      icon: "💾",
    },
    {
      label: "Profile",
      path: ROUTES.SYSTEM_PROFILE,
      icon: "⚙️",
    },
  ];

  // ==========================================
  // Open Sidebar
  // ==========================================
  const openSidebar = () => {
    setSidebarOpen(true);
  };

  // ==========================================
  // Close Sidebar
  // ==========================================
  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // ==========================================
  // Logout
  // ==========================================
  const handleLogout = () => {
    setSidebarOpen(false);
    navigate("/logout");
  };

  return (
    <div className="min-h-screen bg-gray-100">

      {/* =====================================================
          OVERLAY
          Desktop + Mobile
      ====================================================== */}
      {sidebarOpen && (
        <div
          onClick={closeSidebar}
          className="
            fixed
            inset-0
            bg-black/40
            z-40
          "
        />
      )}

      {/* =====================================================
          SIDEBAR

          IMPORTANT:
          Sidebar is hidden by default on ALL screen sizes.
          No lg:translate-x-0 here.
      ====================================================== */}
      <aside
        className={`
          fixed
          top-0
          left-0

          z-50

          w-64
          h-screen

          bg-white

          border-r
          border-gray-200

          shadow-xl

          flex
          flex-col

          transform

          transition-transform
          duration-300
          ease-in-out

          ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >

        {/* =================================================
            SIDEBAR HEADER
        ================================================= */}
        <div
          className="
            flex
            items-center
            justify-between

            px-5
            py-5

            border-b
            border-gray-200

            flex-shrink-0
          "
        >

          <div>
            <h1
              className="
                text-lg
                font-bold
                text-gray-800
              "
            >
              Waste Management
            </h1>

            <p
              className="
                text-sm
                text-gray-500
                mt-1
              "
            >
              System Administrator
            </p>
          </div>

          {/* CLOSE BUTTON */}

          <button
            type="button"
            onClick={closeSidebar}
            className="
              w-9
              h-9

              flex
              items-center
              justify-center

              rounded-lg

              text-gray-500

              hover:text-gray-800
              hover:bg-gray-100

              text-xl
            "
            aria-label="Close sidebar"
          >
            ✕
          </button>

        </div>

        {/* =================================================
            NAVIGATION

            Only this part scrolls
        ================================================= */}
        <div
          className="
            flex-1
            min-h-0

            overflow-y-auto

            px-4
            py-4
          "
        >

          <nav className="space-y-2">

            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeSidebar}
                className={({ isActive }) =>
                  `
                    flex
                    items-center
                    gap-3

                    px-4
                    py-3

                    rounded-lg

                    font-medium

                    transition-all
                    duration-200

                    ${
                      isActive
                        ? `
                          bg-blue-600
                          text-white
                          shadow-sm
                        `
                        : `
                          text-gray-700
                          hover:bg-blue-50
                          hover:text-blue-600
                        `
                    }
                  `
                }
              >

                <span className="text-lg">
                  {item.icon}
                </span>

                <span>
                  {item.label}
                </span>

              </NavLink>
            ))}

          </nav>

        </div>

        {/* =================================================
            LOGOUT
        ================================================= */}
        <div
          className="
            p-4

            border-t
            border-gray-200

            flex-shrink-0
          "
        >

          <button
            type="button"
            onClick={handleLogout}
            className="
              w-full

              flex
              items-center
              gap-3

              px-4
              py-3

              rounded-lg

              bg-red-600
              hover:bg-red-700

              text-white

              font-semibold

              transition
              duration-200
            "
          >

            <span className="text-lg">
              🚪
            </span>

            <span>
              Logout
            </span>

          </button>

        </div>

      </aside>

      {/* =====================================================
          MAIN CONTENT

          Full width because sidebar is hidden by default
      ====================================================== */}
      <div className="min-h-screen w-full">

        {/* =================================================
            TOP HEADER
        ================================================= */}
        <header
          className="
            bg-white
            shadow-sm

            h-16

            flex
            items-center
            justify-between

            px-4
            sm:px-6

            sticky
            top-0

            z-30
          "
        >

          {/* LEFT */}

          <div className="flex items-center gap-3">

            {/* MENU BUTTON */}

            <button
              type="button"
              onClick={openSidebar}
              className="
                w-10
                h-10

                flex
                items-center
                justify-center

                rounded-lg

                text-gray-700

                hover:bg-gray-100

                text-2xl

                transition
              "
              aria-label="Open sidebar"
            >
              ☰
            </button>

            {/* TITLE */}

            <div>

              <h2
                className="
                  text-lg
                  sm:text-xl

                  font-semibold
                  text-gray-800
                "
              >
                System Administrator
              </h2>

              <p
                className="
                  hidden
                  sm:block

                  text-sm
                  text-gray-500
                "
              >
                Waste Management System
              </p>

            </div>

          </div>

          {/* RIGHT */}

          <div
            className="
              flex
              items-center
              gap-3
            "
          >

            {/* ADMIN INFO */}

            <div
              className="
                hidden
                sm:block

                text-right
              "
            >

              <p
                className="
                  font-semibold
                  text-gray-800
                "
              >
                System Admin
              </p>

              <p
                className="
                  text-xs
                  text-gray-500
                "
              >
                Administrator
              </p>

            </div>

            {/* AVATAR */}

            <div
              className="
                w-10
                h-10

                rounded-full

                bg-blue-600
                text-white

                flex
                items-center
                justify-center

                font-bold
              "
            >
              SA
            </div>

          </div>

        </header>

        {/* =================================================
            PAGE CONTENT
        ================================================= */}
        <main
          className="
            p-4
            sm:p-6
          "
        >
          <Outlet />
        </main>

      </div>

    </div>
  );
};

export default SystemAdminLayout;