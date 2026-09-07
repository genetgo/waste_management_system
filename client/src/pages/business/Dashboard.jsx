
// src/pages/business/Dashboard.jsx

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import businessService from "../../services/businessService";
import { useAuth } from "../../context/AuthContext";

export default function Dashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { logout } = useAuth();

  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // LOAD BUSINESS PROFILE
  // ==========================================
  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await businessService.getProfile();

        console.log("BUSINESS PROFILE RESPONSE:", response);

        if (!mounted) return;

        /*
          Supports both:

          {
            success: true,
            data: {...}
          }

          and:

          {
            data: {...}
          }
        */

        const profile =
          response?.data?.data ||
          response?.data ||
          null;

        if (profile) {
          setBusiness(profile);
        } else {
          setBusiness(null);
          setError(t("businessDashboard.profileNotFound"));
        }
      } catch (err) {
        console.error(
          "ERROR LOADING BUSINESS PROFILE:",
          err?.response?.data || err
        );

        if (!mounted) return;

        setError(
          err?.response?.data?.message ||
            t("businessDashboard.profileLoadFailed")
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [t]);

  // ==========================================
  // LOGOUT
  // ==========================================
  const handleLogout = () => {
    try {
      if (typeof logout === "function") {
        logout();
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("role");
      }
    } catch (err) {
      console.error("LOGOUT ERROR:", err);

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
    }

    navigate("/login", { replace: true });
  };

  // ==========================================
  // LOCATION TRANSLATION
  // ==========================================
  const translateLocation = (value) => {
    if (!value) return t("businessDashboard.notSet");

    const translated = t(`register.locations.${value}`, {
      defaultValue: value,
    });

    return translated;
  };

  // ==========================================
  // BUSINESS TYPE TRANSLATION
  // ==========================================
  const translateBusinessType = (value) => {
    if (!value) return t("businessDashboard.notSet");

    return t(`register.businessTypes.${value}`, {
      defaultValue: value,
    });
  };

  // ==========================================
  // LOADING
  // ==========================================
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="text-4xl mb-3">🏢</div>

          <h2 className="text-lg font-semibold text-slate-700">
            {t("businessDashboard.loading")}
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            {t("businessDashboard.loadingDescription")}
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================
  if (error && !business) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-red-200 p-8 text-center">
          <div className="text-4xl mb-3">⚠️</div>

          <h2 className="text-xl font-bold text-gray-800">
            {t("businessDashboard.unableToLoad")}
          </h2>

          <p className="text-sm text-red-600 mt-2">
            {error}
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="
              mt-6
              px-5
              py-2.5
              rounded-xl
              bg-emerald-600
              hover:bg-emerald-700
              text-white
              font-semibold
              text-sm
              transition
            "
          >
            {t("businessDashboard.tryAgain")}
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // UI
  // ==========================================
  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ======================================
            HEADER
        ====================================== */}
        <div
          className="
            bg-white
            border
            border-gray-200
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
              md:flex-row
              md:items-center
              md:justify-between
              gap-4
            "
          >
            <div className="flex items-center gap-4">
              <div
                className="
                  w-14
                  h-14
                  rounded-2xl
                  bg-emerald-50
                  flex
                  items-center
                  justify-center
                  text-3xl
                  shrink-0
                "
              >
                🏢
              </div>

              <div>
                <h1
                  className="
                    text-xl
                    sm:text-2xl
                    md:text-3xl
                    font-bold
                    text-gray-800
                  "
                >
                  {t("businessDashboard.welcome")},{" "}
                  {business?.owner_name ||
                    t("businessDashboard.businessOwner")}{" "}
                  👋
                </h1>

                <p className="text-sm text-gray-500 mt-1">
                  {business?.business_name ||
                    t("businessDashboard.business")}{" "}
                  {t("businessDashboard.portalOverview")}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="
                w-full
                md:w-auto
                px-5
                py-2.5
                bg-red-600
                hover:bg-red-700
                text-white
                text-sm
                font-semibold
                rounded-xl
                shadow-sm
                transition
              "
            >
              🚪 {t("businessDashboard.logout")}
            </button>
          </div>
        </div>

        {/* ======================================
            ERROR MESSAGE
        ====================================== */}
        {error && business && (
          <div
            className="
              rounded-xl
              border
              border-amber-200
              bg-amber-50
              px-4
              py-3
              text-sm
              text-amber-700
            "
          >
            ⚠️ {error}
          </div>
        )}

        {/* ======================================
            QUICK ACTIONS
        ====================================== */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">
              {t("businessDashboard.quickActions")}
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              {t("businessDashboard.quickActionsDescription")}
            </p>
          </div>

          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-5
              gap-4
            "
          >
            {/* SCHEDULE */}
            <Link
              to="/business/schedule"
              className="
                group
                bg-white
                border
                border-gray-200
                rounded-2xl
                p-5
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
                {t("businessDashboard.actions.schedule.title")}
              </h3>

              <p className="text-xs text-gray-500 mt-2 leading-5">
                {t("businessDashboard.actions.schedule.description")}
              </p>
            </Link>

            {/* MAKE REQUEST */}
            <Link
              to="/business/on-demand-request"
              className="
                group
                bg-white
                border
                border-gray-200
                rounded-2xl
                p-5
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
                📍
              </div>

              <h3 className="text-sm font-bold text-gray-800">
                {t("businessDashboard.actions.request.title")}
              </h3>

              <p className="text-xs text-gray-500 mt-2 leading-5">
                {t("businessDashboard.actions.request.description")}
              </p>
            </Link>

            {/* FEEDBACK */}
            <Link
              to="/business/feedback"
              className="
                group
                bg-white
                border
                border-gray-200
                rounded-2xl
                p-5
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
                  bg-amber-50
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
                {t("businessDashboard.actions.feedback.title")}
              </h3>

              <p className="text-xs text-gray-500 mt-2 leading-5">
                {t("businessDashboard.actions.feedback.description")}
              </p>
            </Link>

            {/* MY REQUESTS */}
            <Link
              to="/business/my-requests"
              className="
                group
                bg-white
                border
                border-gray-200
                rounded-2xl
                p-5
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
                  bg-cyan-50
                  flex
                  items-center
                  justify-center
                  text-2xl
                  mb-4
                "
              >
                📋
              </div>

              <h3 className="text-sm font-bold text-gray-800">
                {t("businessDashboard.actions.myRequests.title")}
              </h3>

              <p className="text-xs text-gray-500 mt-2 leading-5">
                {t(
                  "businessDashboard.actions.myRequests.description"
                )}
              </p>
            </Link>

            {/* PROFILE */}
            <Link
              to="/business/profile"
              className="
                group
                bg-white
                border
                border-gray-200
                rounded-2xl
                p-5
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
                {t("businessDashboard.actions.profile.title")}
              </h3>

              <p className="text-xs text-gray-500 mt-2 leading-5">
                {t(
                  "businessDashboard.actions.profile.description"
                )}
              </p>
            </Link>
          </div>
        </section>

        {/* ======================================
            BUSINESS INFORMATION
        ====================================== */}
        <section
          className="
            bg-white
            border
            border-gray-200
            rounded-2xl
            shadow-sm
            p-5
            sm:p-6
          "
        >
          <div
            className="
              flex
              items-center
              justify-between
              gap-3
              mb-6
            "
          >
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                {t("businessDashboard.businessInformation")}
              </h2>

              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                {t(
                  "businessDashboard.businessInformationDescription"
                )}
              </p>
            </div>

            <div
              className="
                w-11
                h-11
                rounded-xl
                bg-gray-50
                flex
                items-center
                justify-center
                text-2xl
                shrink-0
              "
            >
              🏢
            </div>
          </div>

          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-3
              gap-4
            "
          >
            
            {/* BUSINESS NAME */}
<InfoItem
  label={t("businessDashboard.fields.businessName")}
  value={
    business?.business_name ||
    t("businessDashboard.notSet")
  }
/>

{/* OWNER NAME */}
<InfoItem
  label={t("businessDashboard.fields.ownerName")}
  value={
    business?.owner_name ||
    t("businessDashboard.notSet")
  }
/>

{/* BUSINESS TYPE */}
<InfoItem
  label={t("businessDashboard.fields.businessType")}
  value={translateBusinessType(business?.business_type)}
/>

{/* PHONE */}
<InfoItem
  label={t("businessDashboard.fields.phone")}
  value={
    business?.phone_number ||
    t("businessDashboard.notSet")
  }
  mono
/>

{/* EMAIL */}
<InfoItem
  label={t("businessDashboard.fields.email")}
  value={
    business?.email ||
    t("businessDashboard.notSet")
  }
  breakAll
/>

{/* KIFLE KETEMA */}
<InfoItem
  label={t("businessDashboard.fields.kifleKetema")}
  value={translateLocation(
    business?.kifle_ketema ||
    business?.assigned_kifle_ketema
  )}
/>

{/* KEBELE */}
<InfoItem
  label={t("businessDashboard.fields.kebele")}
  value={translateLocation(business?.kebele)}
/>

{/* SEFER */}
<InfoItem
  label={t("businessDashboard.fields.sefer")}
  value={translateLocation(business?.sefer)}
/>

          </div>
        </section>
      </div>
    </div>
  );
}

// ==========================================
// INFO ITEM
// ==========================================
function InfoItem({
  label,
  value,
  mono = false,
  breakAll = false,
}) {
  return (
    <div
      className="
        rounded-xl
        border
        border-gray-100
        bg-gray-50
        p-4
      "
    >
      <p
        className="
          text-xs
          font-semibold
          uppercase
          tracking-wide
          text-gray-400
        "
      >
        {label}
      </p>

      <p
        className={`
          text-sm
          font-bold
          text-gray-700
          mt-2
          ${mono ? "font-mono" : ""}
          ${breakAll ? "break-all" : ""}
        `}
      >
        {value}
      </p>
    </div>
  );
}
