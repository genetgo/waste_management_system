import { Link } from "react-router-dom";
import ROUTES from "../../constants/routes";

export default function SystemAdminDashboard() {
  return (
    <div className="space-y-5">

      {/* ==========================================
          Header Section
      ========================================== */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          System Administrator Dashboard
        </h1>

        <p className="text-gray-500 text-xs mt-0.5">
          Waste Collection Management System Control Center.
        </p>
      </div>


      {/* ==========================================
          Quick Actions
      ========================================== */}
      <div className="space-y-3">

        <h2 className="text-base font-bold text-gray-900 tracking-tight">
          Quick Actions
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">

          {/* Users */}
          <Link
            to={ROUTES.SYSTEM_USERS}
            className="bg-white border border-slate-100 rounded-xl p-3.5 hover:bg-slate-50 transition duration-150 shadow-sm"
          >
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              👥 Users
            </h3>

            <p className="text-[11px] text-gray-500 mt-1 leading-normal">
              Manage all system users.
            </p>
          </Link>


          {/* Requests */}
          <Link
            to={ROUTES.SYSTEM_REQUESTS}
            className="bg-white border border-slate-100 rounded-xl p-3.5 hover:bg-slate-50 transition duration-150 shadow-sm"
          >
            <h3 className="font-bold text-purple-800 text-sm flex items-center gap-1.5">
              📋 Requests
            </h3>

            <p className="text-[11px] text-gray-500 mt-1 leading-normal">
              View and monitor collection requests.
            </p>
          </Link>


          {/* Staff Accounts */}
          <Link
            to={ROUTES.SYSTEM_STAFF}
            className="bg-white border border-slate-100 rounded-xl p-3.5 hover:bg-slate-50 transition duration-150 shadow-sm"
          >
            <h3 className="font-bold text-emerald-800 text-sm flex items-center gap-1.5">
              👨‍💼 Staff
            </h3>

            <p className="text-[11px] text-gray-500 mt-1 leading-normal">
              Manage staff accounts.
            </p>
          </Link>


          {/* Roles */}
          <Link
            to={ROUTES.SYSTEM_ROLES}
            className="bg-white border border-slate-100 rounded-xl p-3.5 hover:bg-slate-50 transition duration-150 shadow-sm"
          >
            <h3 className="font-bold text-indigo-800 text-sm flex items-center gap-1.5">
              🛡 Roles
            </h3>

            <p className="text-[11px] text-gray-500 mt-1 leading-normal">
              System permissions.
            </p>
          </Link>


          {/* Backup */}
          <Link
            to={ROUTES.SYSTEM_BACKUP}
            className="bg-white border border-slate-100 rounded-xl p-3.5 hover:bg-slate-50 transition duration-150 shadow-sm"
          >
            <h3 className="font-bold text-amber-800 text-sm flex items-center gap-1.5">
              💾 Backup
            </h3>

            <p className="text-[11px] text-gray-500 mt-1 leading-normal">
              Database operations.
            </p>
          </Link>


          {/* Profile */}
          <Link
            to={ROUTES.SYSTEM_PROFILE}
            className="bg-white border border-slate-100 rounded-xl p-3.5 hover:bg-slate-50 transition duration-150 shadow-sm"
          >
            <h3 className="font-bold text-blue-800 text-sm flex items-center gap-1.5">
              👤 Profile
            </h3>

            <p className="text-[11px] text-gray-500 mt-1 leading-normal">
              View and update your profile.
            </p>
          </Link>

        </div>

      </div>

    </div>
  );
}