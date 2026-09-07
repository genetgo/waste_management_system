
import { useState } from "react";
import {
  Link,
  useLocation,
  useSearchParams,
  useNavigate,
} from "react-router-dom";
import { useTranslation } from "react-i18next";

import API from "../../services/api";

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();

  // ==========================================
  // GET TOKEN
  // ==========================================

  const token =
    searchParams.get("token") ||
    location.state?.resetToken ||
    "";

  const identifier =
    location.state?.identifier || "";

  // ==========================================
  // FORM STATE
  // ==========================================

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  // ==========================================
  // RESET PASSWORD
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    // ======================================
    // TOKEN
    // ======================================

    if (!token) {
      setError(
        t("resetPassword.validation.tokenInvalid")
      );
      return;
    }

    // ======================================
    // PASSWORD
    // ======================================

    if (!password) {
      setError(
        t("resetPassword.validation.passwordRequired")
      );
      return;
    }

    if (password.length < 6) {
      setError(
        t("resetPassword.validation.passwordMin")
      );
      return;
    }

    if (password.length > 50) {
      setError(
        t("resetPassword.validation.passwordMax")
      );
      return;
    }

    // ======================================
    // CONFIRM PASSWORD
    // ======================================

    if (!confirmPassword) {
      setError(
        t(
          "resetPassword.validation.confirmPasswordRequired"
        )
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        t("resetPassword.validation.passwordMismatch")
      );
      return;
    }

    try {
      setLoading(true);

      const response = await API.post(
        "/auth/reset-password",
        {
          token,
          newPassword: password,
          confirmPassword,
        }
      );

      setMessage(
        response.data?.message ||
          t("resetPassword.success")
      );

      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (err) {
      console.error(
        "RESET PASSWORD ERROR:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.message ||
          t("resetPassword.errors.failed")
      );

    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // INVALID TOKEN PAGE
  // ==========================================

  if (!token) {
    return (
      <div
        className="
          min-h-screen
          bg-gray-100
          flex
          items-center
          justify-center
          px-4
        "
      >

        <div
          className="
            w-full
            max-w-md
            bg-white
            rounded-2xl
            shadow-lg
            border
            border-gray-200
            p-6
            md:p-8
          "
        >

          <div className="text-center">

            <div className="text-4xl mb-3">
              🔐
            </div>

            <h1
              className="
                text-2xl
                font-bold
                text-gray-800
              "
            >
              {t("resetPassword.invalidLink.title")}
            </h1>

            <p
              className="
                text-gray-500
                mt-3
                mb-6
              "
            >
              {t("resetPassword.invalidLink.description")}
            </p>

            <Link
              to="/forgot-password"
              className="
                inline-block
                w-full
                bg-blue-600
                hover:bg-blue-700
                text-white
                text-center
                font-semibold
                py-3
                rounded-lg
                transition
              "
            >
              {t(
                "resetPassword.invalidLink.requestNewToken"
              )}
            </Link>

            <div className="mt-5">

              <Link
                to="/login"
                className="
                  text-blue-600
                  hover:text-blue-700
                  font-semibold
                "
              >
                ← {t("resetPassword.backToLogin")}
              </Link>

            </div>

          </div>

        </div>

      </div>
    );
  }

  // ==========================================
  // RESET PASSWORD FORM
  // ==========================================

  return (
    <div
      className="
        min-h-screen
        bg-gray-100
        flex
        items-center
        justify-center
        px-4
      "
    >

      <div className="w-full max-w-md">

        <div
          className="
            bg-white
            rounded-2xl
            shadow-lg
            border
            border-gray-200
            p-6
            md:p-8
          "
        >

          {/* HEADER */}
          <div className="text-center mb-6">

            <div className="text-4xl mb-3">
              🔐
            </div>

            <h1
              className="
                text-2xl
                md:text-3xl
                font-bold
                text-gray-800
              "
            >
              {t("resetPassword.title")}
            </h1>

            <p
              className="
                text-gray-500
                mt-2
              "
            >
              {t("resetPassword.subtitle")}
            </p>

            {identifier && (
              <p
                className="
                  text-xs
                  text-gray-400
                  mt-2
                "
              >
                {t("resetPassword.resettingFor")}
                {" "}
                {identifier}
              </p>
            )}

          </div>

          {/* ERROR */}
          {error && (
            <div
              className="
                mb-4
                rounded-lg
                bg-red-50
                border
                border-red-200
                px-4
                py-3
                text-sm
                text-red-700
              "
            >
              {error}
            </div>
          )}

          {/* SUCCESS */}
          {message && (
            <div
              className="
                mb-4
                rounded-lg
                bg-green-50
                border
                border-green-200
                px-4
                py-3
                text-sm
                text-green-700
              "
            >

              {message}

              <p className="mt-1 text-xs">
                {t("resetPassword.redirecting")}
              </p>

            </div>
          )}

          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
            noValidate
          >

            {/* NEW PASSWORD */}
            <div>

              <label
                htmlFor="password"
                className="
                  block
                  text-sm
                  font-semibold
                  text-gray-700
                  mb-2
                "
              >
                {t("resetPassword.fields.password")}
              </label>

              <div className="relative">

                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder={t(
                    "resetPassword.placeholders.password"
                  )}
                  disabled={loading}
                  autoComplete="new-password"
                  className="
                    w-full
                    px-4
                    py-3
                    pr-12
                    border
                    border-gray-300
                    rounded-lg
                    outline-none
                    focus:ring-2
                    focus:ring-blue-500
                    focus:border-blue-500
                    disabled:bg-gray-100
                  "
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  disabled={loading}
                  className="
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    text-gray-500
                    hover:text-gray-700
                  "
                  aria-label={
                    showPassword
                      ? t(
                          "resetPassword.hidePassword"
                        )
                      : t(
                          "resetPassword.showPassword"
                        )
                  }
                >
                  {showPassword
                    ? "🙈"
                    : "👁️"}
                </button>

              </div>

              <p
                className="
                  text-xs
                  text-gray-500
                  mt-1
                "
              >
                {t(
                  "resetPassword.passwordHint"
                )}
              </p>

            </div>

            {/* CONFIRM PASSWORD */}
            <div>

              <label
                htmlFor="confirmPassword"
                className="
                  block
                  text-sm
                  font-semibold
                  text-gray-700
                  mb-2
                "
              >
                {t(
                  "resetPassword.fields.confirmPassword"
                )}
              </label>

              <div className="relative">

                <input
                  id="confirmPassword"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(
                      e.target.value
                    );
                    setError("");
                  }}
                  placeholder={t(
                    "resetPassword.placeholders.confirmPassword"
                  )}
                  disabled={loading}
                  autoComplete="new-password"
                  className="
                    w-full
                    px-4
                    py-3
                    pr-12
                    border
                    border-gray-300
                    rounded-lg
                    outline-none
                    focus:ring-2
                    focus:ring-blue-500
                    focus:border-blue-500
                    disabled:bg-gray-100
                  "
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                  disabled={loading}
                  className="
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    text-gray-500
                    hover:text-gray-700
                  "
                  aria-label={
                    showConfirmPassword
                      ? t(
                          "resetPassword.hidePassword"
                        )
                      : t(
                          "resetPassword.showPassword"
                        )
                  }
                >
                  {showConfirmPassword
                    ? "🙈"
                    : "👁️"}
                </button>

              </div>

            </div>

            {/* RESET BUTTON */}
            <button
              type="submit"
              disabled={
                loading ||
                Boolean(message)
              }
              className="
                w-full
                bg-blue-600
                hover:bg-blue-700
                disabled:bg-gray-400
                text-white
                font-semibold
                py-3
                rounded-lg
                transition
              "
            >
              {loading
                ? t(
                    "resetPassword.buttons.resetting"
                  )
                : t(
                    "resetPassword.buttons.reset"
                  )}
            </button>

          </form>

          {/* LOGIN */}
          <div
            className="
              text-center
              mt-6
            "
          >

            <Link
              to="/login"
              className="
                text-blue-600
                hover:text-blue-700
                font-semibold
              "
            >
              ← {t("resetPassword.backToLogin")}
            </Link>

          </div>

        </div>

      </div>

    </div>
  );
};

export default ResetPassword;
