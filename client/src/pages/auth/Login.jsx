
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import API from "../../services/api";
import { useAuth } from "../../context/AuthContext";

import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import Toast from "../../components/common/Toast";
import ErrorBoundary from "../../components/common/ErrorBoundary";

import { useTranslation } from "react-i18next";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useTranslation();

  // ==========================================
  // FORM DATA
  // ==========================================

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // ==========================================
  // UI STATES
  // ==========================================

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ==========================================
  // TOAST
  // ==========================================

  const [toast, setToast] = useState({
    show: false,
    type: "error",
    message: "",
  });

  // ==========================================
  // INACTIVE ACCOUNT
  // ==========================================

  const [inactiveAccount, setInactiveAccount] = useState(null);

  // ==========================================
  // HANDLE INPUT
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (inactiveAccount) {
      setInactiveAccount(null);
    }

    if (toast.show) {
      setToast({
        show: false,
        type: "error",
        message: "",
      });
    }
  };

  // ==========================================
  // LOGIN
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setToast({
      show: false,
      type: "error",
      message: "",
    });

    setInactiveAccount(null);

    // ========================================
    // VALIDATION
    // ========================================

    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    if (!email || !password) {
      setToast({
        show: true,
        type: "error",
        message: t("login.required"),
      });

      return;
    }

    try {
      setLoading(true);

      // ======================================
      // LOGIN REQUEST
      // ======================================

      console.log("=================================");
      console.log("LOGIN REQUEST");
      console.log("Email:", email);
      console.log("Endpoint:", "/auth/login");
      console.log("=================================");

      const res = await API.post("/auth/login", {
        email,
        password,
      });

      console.log("RAW LOGIN RESPONSE:", res);
      console.log("LOGIN RESPONSE DATA:", res.data);

      // ======================================
      // BACKEND RESPONSE
      // ======================================

      const response = res.data;
      const loginData = response?.data;

      const token = loginData?.token;
      const user = loginData?.user;

      // ======================================
      // ROLE
      // ======================================

      let userRole =
        loginData?.role ||
        user?.role ||
        "";

      if (typeof userRole === "object") {
        userRole =
          userRole?.name ||
          userRole?.role ||
          "";
      }

      userRole = String(userRole)
        .replace(/\s+/g, "_")
        .trim()
        .toUpperCase();

      console.log("=================================");
      console.log("LOGIN SUCCESS RESPONSE");
      console.log("Token:", token);
      console.log("Role:", userRole);
      console.log("User:", user);
      console.log("=================================");

      // ======================================
      // VALID LOGIN RESPONSE
      // ======================================

      if (!token || !user || !userRole) {
        console.error(
          "Invalid login response:",
          response
        );

        setToast({
          show: true,
          type: "error",
          message: t("login.invalidResponse"),
        });

        return;
      }

      // ======================================
      // ACCOUNT STATUS
      // ======================================

      if (user?.is_active === false) {
        setInactiveAccount({
          message: t("login.accountInactive"),
          contact: null,
        });

        return;
      }

      // ======================================
      // USER ID
      // ======================================

      const userId =
        user?.id ||
        user?.resident_id ||
        user?.business_id ||
        user?.collector_id ||
        user?.admin_id ||
        user?.system_admin_id ||
        user?.user_id;

      console.log("USER ID:", userId);

      // ======================================
      // SAVE AUTH DATA
      // ======================================

      login({
        userData: {
          ...user,
          id: userId,
          role: userRole,
        },
        jwtToken: token,
      });

      // ======================================
      // ROLE BASED NAVIGATION
      // ======================================

      switch (userRole) {
        case "RESIDENT":
          navigate("/resident/dashboard", {
            replace: true,
          });
          break;

        case "BUSINESS_OWNER":
        case "BUSINESSOWNER":
          navigate("/business/dashboard", {
            replace: true,
          });
          break;

        case "COLLECTOR":
        case "COLLECTOR_DRIVER":
          navigate("/collector/dashboard", {
            replace: true,
          });
          break;

        case "MUNICIPAL_ADMIN":
        case "MUNICIPALADMIN":
          navigate("/municipal-admin/home", {
            replace: true,
          });
          break;

        case "SYSTEM_ADMIN":
        case "SYS_ADMIN":
          navigate("/system-admin/home", {
            replace: true,
          });
          break;

        default:
          console.error("UNKNOWN ROLE:", userRole);

          setToast({
            show: true,
            type: "error",
            message: `${t("login.invalidRole")}: ${
              userRole || "Unknown"
            }.`,
          });

          break;
      }
    } catch (err) {
      console.error("=================================");
      console.error("LOGIN ERROR");
      console.error(err);
      console.error("=================================");

      const status = err?.response?.status;
      const data = err?.response?.data;
      const backendMessage = data?.message;

      console.log("STATUS:", status);
      console.log("BACKEND DATA:", data);

      // ======================================
      // INACTIVE ACCOUNT
      // ======================================

      if (
        status === 403 &&
        data?.code === "ACCOUNT_INACTIVE"
      ) {
        const contact = data?.contact || null;

        setInactiveAccount({
          message:
            backendMessage ||
            t("login.accountInactive"),
          contact,
        });

        setToast({
          show: false,
          type: "error",
          message: "",
        });

        return;
      }

      // ======================================
      // INVALID EMAIL / PASSWORD
      // ======================================

      if (status === 401) {
        setToast({
          show: true,
          type: "error",
          message:
            backendMessage ||
            t("login.invalidCredentials"),
        });

        return;
      }

      // ======================================
      // FORBIDDEN
      // ======================================

      if (status === 403) {
        setToast({
          show: true,
          type: "error",
          message:
            backendMessage ||
            t("login.accessDenied"),
        });

        return;
      }

      // ======================================
      // OTHER ERROR
      // ======================================

      setToast({
        show: true,
        type: "error",
        message:
          backendMessage ||
          t("login.failed"),
      });
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <ErrorBoundary>
      <div
        className="
          min-h-screen
          bg-gradient-to-br
          from-green-700
          via-green-600
          to-emerald-500
          flex
          items-center
          justify-center
          py-10
          px-5
        "
      >
        {/* LOGIN CARD */}

        <div
          className="
            w-full
            max-w-md
            bg-white
            rounded-2xl
            shadow-lg
            p-6
            sm:p-8
          "
        >
          {/* HEADER */}

          <div className="text-center mb-8">
            <h1
              className="
                text-2xl
                font-bold
                text-slate-800
              "
            >
              {t("login.title")}
            </h1>

            <p
              className="
                mt-2
                text-sm
                text-slate-500
              "
            >
              {t("login.subtitle")}
            </p>
          </div>

          {/* INACTIVE ACCOUNT */}

          {inactiveAccount && (
            <div
              className="
                mb-6
                rounded-xl
                border
                border-red-200
                bg-red-50
                p-4
              "
            >
              <div className="flex items-start gap-3">
                <div
                  className="
                    mt-0.5
                    text-red-600
                    text-lg
                  "
                >
                  ⚠
                </div>

                <div className="flex-1">
                  <h3
                    className="
                      font-semibold
                      text-red-800
                    "
                  >
                    {t("login.accountInactiveTitle")}
                  </h3>

                  <p
                    className="
                      mt-1
                      text-sm
                      text-red-700
                    "
                  >
                    {inactiveAccount.message}
                  </p>
                </div>
              </div>

              {/* ADMINISTRATOR CONTACT */}

              {inactiveAccount.contact && (
                <div
                  className="
                    mt-4
                    rounded-lg
                    bg-white
                    border
                    border-red-100
                    p-4
                  "
                >
                  <p
                    className="
                      text-xs
                      font-semibold
                      uppercase
                      tracking-wide
                      text-slate-500
                      mb-3
                    "
                  >
                    {t("login.administratorContact")}
                  </p>

                  {/* NAME */}

                  {inactiveAccount.contact.name && (
                    <div className="mb-2">
                      <span
                        className="
                          text-sm
                          font-medium
                          text-slate-600
                        "
                      >
                        {t("login.name")}:
                      </span>{" "}

                      <span
                        className="
                          text-sm
                          text-slate-800
                        "
                      >
                        {inactiveAccount.contact.name}
                      </span>
                    </div>
                  )}

                  {/* EMAIL */}

                  {inactiveAccount.contact.email && (
                    <div className="mb-2">
                      <span
                        className="
                          text-sm
                          font-medium
                          text-slate-600
                        "
                      >
                        {t("login.email")}:
                      </span>{" "}

                      <a
                        href={`mailto:${inactiveAccount.contact.email}`}
                        className="
                          text-sm
                          text-emerald-600
                          hover:text-emerald-700
                          hover:underline
                        "
                      >
                        {inactiveAccount.contact.email}
                      </a>
                    </div>
                  )}

                  {/* PHONE */}

                  {inactiveAccount.contact.phone && (
                    <div>
                      <span
                        className="
                          text-sm
                          font-medium
                          text-slate-600
                        "
                      >
                        {t("login.phone")}:
                      </span>{" "}

                      <a
                        href={`tel:${inactiveAccount.contact.phone}`}
                        className="
                          text-sm
                          text-emerald-600
                          hover:text-emerald-700
                          hover:underline
                        "
                      >
                        {inactiveAccount.contact.phone}
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* LOGIN FORM */}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
            noValidate
          >
            {/* EMAIL */}

            <Input
              label={t("login.email")}
              name="email"
              type="text"
              value={formData.email}
              onChange={handleChange}
              placeholder={t("login.emailPlaceholder")}
              autoComplete="username"
            />

            {/* PASSWORD */}

            <div className="relative">
              <Input
                label={t("login.password")}
                name="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={formData.password}
                onChange={handleChange}
                placeholder={t(
                  "login.passwordPlaceholder"
                )}
                autoComplete="current-password"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword((prev) => !prev)
                }
                className="
                  absolute
                  right-3
                  top-[38px]
                  text-slate-500
                  hover:text-emerald-600
                  transition
                "
                aria-label={
                  showPassword
                    ? t("login.hidePassword")
                    : t("login.showPassword")
                }
              >
                {showPassword ? (
                  <FaEyeSlash />
                ) : (
                  <FaEye />
                )}
              </button>
            </div>

            {/* FORGOT PASSWORD */}

            <div className="text-right">
              <Link
                to="/forgot-password"
                className="
                  text-sm
                  font-medium
                  text-emerald-600
                  hover:text-emerald-700
                "
              >
                {t("login.forgotPassword")}
              </Link>
            </div>

            {/* LOGIN BUTTON */}

            <div className="flex justify-center">
              <Button
                type="submit"
                disabled={loading}
                className="
                  mt-6
                  sm:mt-8
                  w-fit
                  mx-auto
                  bg-green-600
                  hover:bg-green-700
                  text-white
                  px-5
                  sm:px-6
                  py-3
                  rounded-xl
                  font-semibold
                  text-sm
                  sm:text-base
                  transition
                  duration-200
                  text-center
                "
              >
                {loading
                  ? t("login.loggingIn")
                  : t("login.button")}
              </Button>
            </div>

            {/* REGISTER */}

            <div
              className="
                text-center
                pt-4
                border-t
                border-gray-100
              "
            >
              <span
                className="
                  text-sm
                  text-gray-500
                "
              >
                {t("login.noAccount")}{" "}
              </span>

              <Link
                to="/register"
                className="
                  text-sm
                  font-semibold
                  text-emerald-600
                  hover:text-emerald-700
                "
              >
                {t("login.createAccount")}
              </Link>
            </div>
          </form>
        </div>

        {/* TOAST */}

        {toast.show && (
          <Toast
            type={toast.type}
            message={toast.message}
            onClose={() =>
              setToast({
                show: false,
                type: "error",
                message: "",
              })
            }
          />
        )}
      </div>
    </ErrorBoundary>
  );
}
