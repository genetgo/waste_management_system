import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserPlus } from "react-icons/fa";
import { useTranslation } from "react-i18next";

import API from "../../services/api";

import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import Toast from "../../components/common/Toast";
import ErrorBoundary from "../../components/common/ErrorBoundary";


export default function ResidentRegister() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // ==========================================
  // FORM DATA
  // ==========================================
  const [formData, setFormData] = useState({
    full_name: "",
    phone_number: "",
    email: "",
    password: "",
    confirmPassword: "",
    kifle_ketema: "",
    kebele: "",
    sefer: "",
  });

  // ==========================================
  // STATES
  // ==========================================
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [toast, setToast] = useState({
    show: false,
    type: "error",
    message: "",
  });

  // ==========================================
  // LOCATION DATA
  // Backend values remain English
  // ==========================================
  const locations = {
    Abima: {
      "Kebele 01": ["Sefer 01", "Sefer 02", "Sefer 03", "Sefer 04"],
      "Kebele 02": ["Sefer 01", "Sefer 02", "Sefer 03", "Sefer 04"],
      "Kebele 03": ["Sefer 01", "Sefer 02", "Sefer 03", "Sefer 04"],
      "Kebele 04": ["Sefer 01", "Sefer 02", "Sefer 03", "Sefer 04"],
    },

    Menkorer: {
      "Kebele 05": ["Sefer 01", "Sefer 02", "Sefer 03", "Sefer 04"],
      "Kebele 06": ["Sefer 01", "Sefer 02", "Sefer 03", "Sefer 04"],
      "Kebele 07": ["Sefer 01", "Sefer 02", "Sefer 03", "Sefer 04"],
      "Kebele 08": ["Sefer 01", "Sefer 02", "Sefer 03", "Sefer 04"],
    },

    "Nigus Teklehaymanot": {
      "Kebele 09": ["Sefer 01", "Sefer 02", "Sefer 03", "Sefer 04"],
      "Kebele 10": ["Sefer 01", "Sefer 02", "Sefer 03", "Sefer 04"],
      "Kebele 11": ["Sefer 01", "Sefer 02", "Sefer 03", "Sefer 04"],
      "Kebele 12": ["Sefer 01", "Sefer 02", "Sefer 03", "Sefer 04"],
      "Kebele 13": ["Sefer 01", "Sefer 02", "Sefer 03", "Sefer 04"],
    },

    "Tedila Gualu": {
      "Kebele 14": ["Sefer 01", "Sefer 02", "Sefer 03", "Sefer 04"],
      "Kebele 15": ["Sefer 01", "Sefer 02", "Sefer 03", "Sefer 04"],
      "Kebele 16": ["Sefer 01", "Sefer 02", "Sefer 03", "Sefer 04"],
      "Kebele 17": ["Sefer 01", "Sefer 02", "Sefer 03", "Sefer 04"],
      "Kebele 18": ["Sefer 01", "Sefer 02", "Sefer 03", "Sefer 04"],
    },
  };

  // ==========================================
  // SELECT STYLE
  // ==========================================
  const selectClass = (field) => `
    w-full
    px-4
    py-3
    rounded-xl
    border
    ${
      errors[field]
        ? "border-red-500 ring-2 ring-red-100"
        : "border-gray-300"
    }
    bg-white
    text-gray-700
    shadow-sm
    outline-none
    transition
    duration-200
    focus:border-green-500
    focus:ring-2
    focus:ring-green-200
    hover:border-green-400
    disabled:bg-gray-100
    disabled:text-gray-400
    disabled:cursor-not-allowed
  `;

  // ==========================================
  // HANDLE CHANGE
  // ==========================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      if (name === "kifle_ketema") {
        return {
          ...prev,
          kifle_ketema: value,
          kebele: "",
          sefer: "",
        };
      }

      if (name === "kebele") {
        return {
          ...prev,
          kebele: value,
          sefer: "",
        };
      }

      return {
        ...prev,
        [name]: value,
      };
    });

    // Clear only current field error
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    // Hide toast while user is correcting the form
    setToast({
      show: false,
      type: "error",
      message: "",
    });
  };

  // ==========================================
  // VALIDATE FORM
  // ==========================================
  const validateForm = () => {
    const newErrors = {};

    const fullName = formData.full_name.trim();
    const phone = formData.phone_number.trim();
    const email = formData.email.trim();

    // ==========================================
    // FULL NAME
    // ==========================================
    if (!fullName) {
      newErrors.full_name = t(
        "register.validation.fullNameRequired"
      );
    } else if (fullName.length < 3) {
      newErrors.full_name = t(
        "register.validation.fullNameMin"
      );
    } else if (fullName.length > 50) {
      newErrors.full_name = t(
        "register.validation.fullNameMax"
      );
    } else if (!/^[A-Za-zÀ-ÿ\s]+$/.test(fullName)) {
      newErrors.full_name = t(
        "register.validation.fullNameLetters"
      );
    }

    // ==========================================
    // PHONE
    // ==========================================
    if (!phone) {
      newErrors.phone_number = t(
        "register.validation.phoneRequired"
      );
    } else if (!/^09\d{8}$/.test(phone)) {
      newErrors.phone_number = t(
        "register.validation.phoneInvalid"
      );
    }

    // ==========================================
    // EMAIL
    // ==========================================
    if (!email) {
      newErrors.email = t(
        "register.validation.emailRequired"
      );
    } else if (
      !/^[A-Za-z0-9._%+-]+@gmail\.com$/i.test(email)
    ) {
      newErrors.email = t(
        "register.validation.emailInvalid"
      );
    }

    // ==========================================
    // PASSWORD
    // ==========================================
    if (!formData.password) {
      newErrors.password = t(
        "register.validation.passwordRequired"
      );
    } else if (formData.password.length < 6) {
      newErrors.password = t(
        "register.validation.passwordMin"
      );
    } else if (formData.password.length > 50) {
      newErrors.password = t(
        "register.validation.passwordMax"
      );
    }

    // ==========================================
    // CONFIRM PASSWORD
    // ==========================================
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t(
        "register.validation.confirmPasswordRequired"
      );
    } else if (
      formData.password !== formData.confirmPassword
    ) {
      newErrors.confirmPassword = t(
        "register.validation.passwordMismatch"
      );
    }

    // ==========================================
    // KIFLE KETEMA
    // ==========================================
    if (!formData.kifle_ketema) {
      newErrors.kifle_ketema = t(
        "register.validation.kifleKetemaRequired"
      );
    } else if (
      !Object.prototype.hasOwnProperty.call(
        locations,
        formData.kifle_ketema
      )
    ) {
      newErrors.kifle_ketema = t(
        "register.validation.invalidKifleKetema"
      );
    }

    // ==========================================
    // KEBELE
    // ==========================================
    if (!formData.kebele) {
      newErrors.kebele = t(
        "register.validation.kebeleRequired"
      );
    } else if (
      !formData.kifle_ketema ||
      !locations[formData.kifle_ketema]?.[
        formData.kebele
      ]
    ) {
      newErrors.kebele = t(
        "register.validation.invalidKebele"
      );
    }

    // ==========================================
    // SEFER
    // ==========================================
    if (!formData.sefer) {
      newErrors.sefer = t(
        "register.validation.seferRequired"
      );
    } else {
      const availableSefers =
        locations[formData.kifle_ketema]?.[
          formData.kebele
        ] || [];

      if (!availableSefers.includes(formData.sefer)) {
        newErrors.sefer = t(
          "register.validation.invalidSefer"
        );
      }
    }

    setErrors(newErrors);

    return newErrors;
  };

  // ==========================================
  // SERVER ERRORS
  // ==========================================
  const extractServerErrors = (data) => {
    const serverErrors = {};

    if (Array.isArray(data?.errors)) {
      data.errors.forEach((item) => {
        const field =
          item.path?.[0] ||
          item.field ||
          null;

        const message =
          item.message ||
          item.msg ||
          null;

        if (field && message) {
          serverErrors[field] = message;
        }
      });
    }

    if (Array.isArray(data?.details)) {
      data.details.forEach((item) => {
        const field =
          item.path?.[0] ||
          item.field ||
          null;

        const message =
          item.message ||
          item.msg ||
          null;

        if (field && message) {
          serverErrors[field] = message;
        }
      });
    }

    return serverErrors;
  };

  // ==========================================
  // SUBMIT
  // ==========================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Hide previous toast
    setToast({
      show: false,
      type: "error",
      message: "",
    });

    // ==========================================
    // FRONTEND VALIDATION
    // ==========================================
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setToast({
        show: true,
        type: "error",
        message: t(
          "register.validation.correctFields"
        ),
      });

      return;
    }

    // ==========================================
    // API REQUEST
    // ==========================================
    try {
      setLoading(true);

      const payload = {
        full_name: formData.full_name.trim(),
        phone_number: formData.phone_number.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        kifle_ketema: formData.kifle_ketema,
        kebele: formData.kebele,
        sefer: formData.sefer,
      };

      console.log(
        "📤 RESIDENT REGISTER PAYLOAD:",
        JSON.stringify(payload, null, 2)
      );

      const response = await API.post(
        "/auth/register/resident",
        payload
      );

      console.log(
        "📥 SERVER RESPONSE:",
        response.data
      );

      // ==========================================
      // SUCCESS
      // ==========================================
      if (response.data?.success) {
        setToast({
          show: true,
          type: "success",
          message:
            response.data.message ||
            t("register.success"),
        });

        setTimeout(() => {
          navigate("/login");
        }, 1500);

        return;
      }

      // ==========================================
      // API FAILURE
      // ==========================================
      setToast({
        show: true,
        type: "error",
        message:
          response.data?.message ||
          t("register.failed"),
      });
    } catch (err) {
      console.error(
        "Resident registration error:",
        err.response?.data || err
      );

      const serverData = err.response?.data;
      const serverErrors =
        extractServerErrors(serverData);

      // ==========================================
      // FIELD SERVER ERRORS
      // ==========================================
      if (Object.keys(serverErrors).length > 0) {
        setErrors((prev) => ({
          ...prev,
          ...serverErrors,
        }));

        setToast({
          show: true,
          type: "error",
          message: t(
            "register.validation.correctFields"
          ),
        });
      } else {
        // ========================================
        // GENERAL SERVER ERROR
        // ========================================
        setToast({
          show: true,
          type: "error",
          message:
            serverData?.message ||
            t("register.unable"),
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // RENDER
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
          py-8
          px-4
          sm:px-6
        "
      >
        <div
          className="
            bg-white
            w-full
            max-w-3xl
            rounded-2xl
            sm:rounded-3xl
            shadow-2xl
            p-5
            sm:p-8
            md:p-10
          "
        >

         
          {/* ======================================
              HEADER
          ====================================== */}
          <div className="text-center mb-7 sm:mb-10">

            <div className="flex justify-center mb-4">
              <div
                className="
                  bg-green-100
                  p-4
                  sm:p-5
                  rounded-full
                "
              >
                <FaUserPlus
                  className="
                    text-4xl
                    sm:text-5xl
                    text-green-600
                  "
                />
              </div>
            </div>

            <h2
              className="
                text-2xl
                sm:text-3xl
                font-bold
                text-gray-800
              "
            >
              {t("register.residentForm.title")}
            </h2>

            <p
              className="
                text-sm
                sm:text-base
                text-gray-500
                mt-2
              "
            >
              {t("register.residentForm.subtitle")}
            </p>
          </div>

          {/* ======================================
              FORM
              IMPORTANT:
              Disable browser native validation
          ====================================== */}
          <form
            onSubmit={handleSubmit}
            noValidate
            className="
              grid
              grid-cols-1
              md:grid-cols-2
              gap-5
            "
          >

            {/* FULL NAME */}
            <div>
              <Input
                type="text"
                name="full_name"
                label={t("register.fields.fullName")}
                placeholder={t(
                  "register.placeholders.fullName"
                )}
                value={formData.full_name}
                onChange={handleChange}
                className={`mb-0 ${
                  errors.full_name
                    ? "border-red-500"
                    : ""
                }`}
              />

              {errors.full_name && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.full_name}
                </p>
              )}
            </div>

            {/* PHONE */}
            <div>
              <Input
                type="text"
                name="phone_number"
                label={t("register.fields.phone")}
                placeholder={t(
                  "register.placeholders.phone"
                )}
                value={formData.phone_number}
                onChange={handleChange}
                className={`mb-0 ${
                  errors.phone_number
                    ? "border-red-500"
                    : ""
                }`}
              />

              {errors.phone_number && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.phone_number}
                </p>
              )}
            </div>

            {/* EMAIL */}
            <div>
              <Input
                type="email"
                name="email"
                label={t("register.fields.email")}
                placeholder={t(
                  "register.placeholders.email"
                )}
                value={formData.email}
                onChange={handleChange}
                className={`mb-0 ${
                  errors.email
                    ? "border-red-500"
                    : ""
                }`}
              />

              {errors.email && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.email}
                </p>
              )}
            </div>

            {/* PASSWORD */}
            <div>
              <Input
                type="password"
                name="password"
                label={t("register.fields.password")}
                placeholder={t(
                  "register.placeholders.password"
                )}
                value={formData.password}
                onChange={handleChange}
                className={`mb-0 ${
                  errors.password
                    ? "border-red-500"
                    : ""
                }`}
              />

              {errors.password && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.password}
                </p>
              )}
            </div>

            {/* CONFIRM PASSWORD */}
            <div>
              <Input
                type="password"
                name="confirmPassword"
                label={t(
                  "register.fields.confirmPassword"
                )}
                placeholder={t(
                  "register.placeholders.confirmPassword"
                )}
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`mb-0 ${
                  errors.confirmPassword
                    ? "border-red-500"
                    : ""
                }`}
              />

              {errors.confirmPassword && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* KIFLE KETEMA */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("register.fields.kifleKetema")}
              </label>

              <select
                name="kifle_ketema"
                value={formData.kifle_ketema}
                onChange={handleChange}
                className={selectClass(
                  "kifle_ketema"
                )}
              >
                <option value="" disabled>
                  {t(
                    "register.placeholders.kifleKetema"
                  )}
                </option>

                {Object.keys(locations).map((item) => (
                  <option key={item} value={item}>
                    {t(
                      `register.locations.${item}`
                    )}
                  </option>
                ))}
              </select>

              {errors.kifle_ketema && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.kifle_ketema}
                </p>
              )}
            </div>

            {/* KEBELE */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("register.fields.kebele")}
              </label>

              <select
                name="kebele"
                value={formData.kebele}
                onChange={handleChange}
                disabled={!formData.kifle_ketema}
                className={selectClass("kebele")}
              >
                <option value="" disabled>
                  {t(
                    "register.placeholders.kebele"
                  )}
                </option>

                {formData.kifle_ketema &&
                  Object.keys(
                    locations[
                      formData.kifle_ketema
                    ] || {}
                  ).map((kebele) => (
                    <option
                      key={kebele}
                      value={kebele}
                    >
                      {t(
                        `register.locations.${kebele}`
                      )}
                    </option>
                  ))}
              </select>

              {errors.kebele && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.kebele}
                </p>
              )}
            </div>

            {/* SEFER */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("register.fields.sefer")}
              </label>

              <select
                name="sefer"
                value={formData.sefer}
                onChange={handleChange}
                disabled={!formData.kebele}
                className={selectClass("sefer")}
              >
                <option value="" disabled>
                  {t(
                    "register.placeholders.sefer"
                  )}
                </option>

                {formData.kifle_ketema &&
                  formData.kebele &&
                  (
                    locations[
                      formData.kifle_ketema
                    ]?.[formData.kebele] || []
                  ).map((sefer) => (
                    <option
                      key={sefer}
                      value={sefer}
                    >
                      {t(
                        `register.locations.${sefer}`
                      )}
                    </option>
                  ))}
              </select>

              {errors.sefer && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.sefer}
                </p>
              )}
            </div>

            {/* SUBMIT */}
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={loading}
              className="
                md:col-span-2
                bg-green-600
                hover:bg-green-700
                active:bg-green-800
                py-3
                rounded-xl
                font-semibold
                text-white
              "
            >
              {loading
                ? t(
                    "register.buttons.registering"
                  )
                : t(
                    "register.buttons.register"
                  )}
            </Button>
          </form>

          {/* LOGIN LINK */}
          <div
            className="
              text-center
              mt-6
              pt-5
              border-t
              border-gray-100
            "
          >
            <span className="text-sm text-gray-500">
              {t("register.alreadyAccount")}{" "}
            </span>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="
                text-sm
                font-semibold
                text-emerald-600
                hover:text-emerald-700
                hover:underline
              "
            >
              {t("register.login")}
            </button>
          </div>
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