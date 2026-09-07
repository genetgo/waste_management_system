
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEnvelope, FaArrowLeft } from "react-icons/fa";
import { useTranslation } from "react-i18next";

import API from "../../services/api";

function ForgotPassword() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    const value = identifier.trim();

    // ==========================================
    // VALIDATION
    // ==========================================
    if (!value) {
      setError(t("forgotPassword.validation.identifierRequired"));
      return;
    }

    // ==========================================
    // EMAIL / PHONE VALIDATION
    // ==========================================

    const isEmail = /^[A-Za-z0-9._%+-]+@gmail\.com$/i.test(value);
    const isPhone = /^09\d{8}$/.test(value);

    if (!isEmail && !isPhone) {
      setError(t("forgotPassword.validation.identifierInvalid"));
      return;
    }

    try {
      setLoading(true);

      const response = await API.post(
        "/auth/forgot-password",
        {
          identifier: value,
        }
      );

      const resetToken = response.data?.resetToken;

      if (!resetToken) {
        setError(
          t("forgotPassword.validation.tokenNotReturned")
        );
        return;
      }

      setMessage(
        response.data?.message ||
          t("forgotPassword.success")
      );

      setTimeout(() => {
        navigate("/reset-password", {
          state: {
            identifier: value,
            resetToken: resetToken,
          },
        });
      }, 1000);

    } catch (err) {
      console.error(
        "FORGOT PASSWORD ERROR:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.message ||
          t("forgotPassword.errors.unable")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
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
      {/* CARD */}
      <div
        className="
          w-full
          max-w-md
          bg-white
          rounded-2xl
          shadow-xl
          p-6
          sm:p-8
        "
      >

        {/* HEADER */}
        <div className="text-center mb-8">

          <div
            className="
              mx-auto
              mb-4
              w-16
              h-16
              rounded-full
              bg-green-100
              flex
              items-center
              justify-center
            "
          >
            <span className="text-3xl">
              🔐
            </span>
          </div>

          <h1
            className="
              text-2xl
              sm:text-3xl
              font-bold
              text-slate-800
            "
          >
            {t("forgotPassword.title")}
          </h1>

          <p
            className="
              mt-2
              text-sm
              sm:text-base
              text-slate-500
              leading-relaxed
            "
          >
            {t("forgotPassword.subtitle")}
          </p>

        </div>

        {/* SUCCESS MESSAGE */}
        {message && (
          <div
            className="
              mb-5
              rounded-xl
              border
              border-green-200
              bg-green-50
              px-4
              py-3
              text-sm
              text-green-700
            "
          >
            {message}
          </div>
        )}

        {/* ERROR MESSAGE */}
        {error && (
          <div
            className="
              mb-5
              rounded-xl
              border
              border-red-200
              bg-red-50
              px-4
              py-3
              text-sm
              text-red-700
            "
          >
            {error}
          </div>
        )}

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="space-y-6"
          noValidate
        >

          {/* IDENTIFIER */}
          <div>

            <label
              htmlFor="identifier"
              className="
                block
                text-sm
                font-semibold
                text-slate-700
                mb-2
              "
            >
              {t("forgotPassword.fields.identifier")}
            </label>

            <div className="relative">

              <div
                className="
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-slate-400
                  pointer-events-none
                "
              >
                <FaEnvelope />
              </div>

              <input
                id="identifier"
                name="identifier"
                type="text"
                placeholder={t(
                  "forgotPassword.placeholders.identifier"
                )}
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  setError("");
                  setMessage("");
                }}
                disabled={loading}
                autoComplete="username"
                className="
                  w-full
                  pl-11
                  pr-4
                  py-3
                  border
                  border-gray-300
                  rounded-xl
                  outline-none
                  text-sm
                  text-slate-800
                  placeholder:text-slate-400
                  focus:ring-2
                  focus:ring-green-500
                  focus:border-green-500
                  disabled:bg-gray-100
                  disabled:cursor-not-allowed
                  transition
                "
              />

            </div>

            <p
              className="
                mt-2
                text-xs
                text-slate-500
              "
            >
              {t("forgotPassword.helpText")}
            </p>

          </div>

          {/* CONTINUE BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="
              w-full
              bg-green-600
              hover:bg-green-700
              active:bg-green-800
              disabled:bg-gray-400
              disabled:cursor-not-allowed
              text-white
              font-semibold
              py-3
              rounded-xl
              transition
              duration-200
              shadow-sm
              hover:shadow-md
            "
          >
            {loading
              ? t("forgotPassword.buttons.processing")
              : t("forgotPassword.buttons.continue")}
          </button>

        </form>

        {/* BACK TO LOGIN */}
        <div
          className="
            mt-7
            pt-5
            border-t
            border-gray-100
            text-center
          "
        >

          <Link
            to="/login"
            className="
              inline-flex
              items-center
              gap-2
              text-sm
              font-semibold
              text-emerald-600
              hover:text-emerald-700
              transition
            "
          >
            <FaArrowLeft />
            {t("forgotPassword.backToLogin")}
          </Link>

        </div>

      </div>
    </div>
  );
}

export default ForgotPassword;