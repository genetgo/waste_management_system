
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBuilding } from "react-icons/fa";
import { useTranslation } from "react-i18next";

import API from "../../services/api";

import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import Toast from "../../components/common/Toast";
import ErrorBoundary from "../../components/common/ErrorBoundary";

export default function BusinessRegister() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [toast, setToast] = useState({
    show: false,
    type: "error",
    message: "",
  });

  // ==========================================
  // Business Types
  // ==========================================
  const businessTypes = [
    "Cafe",
    "Restaurant",
    "Hotel",
    "Jambo",
    "Gulit",
    "Government Office",
    "Kera",
    "Other",
  ];

  // ==========================================
  // Form Data
  // ==========================================
  const [formData, setFormData] = useState({
    business_name: "",
    owner_name: "",
    phone_number: "",
    email: "",
    password: "",
    confirmPassword: "",

    business_type: "",
    business_description: "",

    kifle_ketema: "",
    kebele: "",
    sefer: "",
  });

  // ==========================================
  // Locations
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
  // Select Style
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
    focus:border-blue-500
    focus:ring-2
    focus:ring-blue-200
    hover:border-blue-400
    disabled:bg-gray-100
    disabled:text-gray-400
    disabled:cursor-not-allowed
  `;

  // ==========================================
  // Handle Change
  // ==========================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "kifle_ketema") {
      setFormData((prev) => ({
        ...prev,
        kifle_ketema: value,
        kebele: "",
        sefer: "",
      }));

      setErrors((prev) => ({
        ...prev,
        kifle_ketema: "",
        kebele: "",
        sefer: "",
      }));

      return;
    }

    if (name === "kebele") {
      setFormData((prev) => ({
        ...prev,
        kebele: value,
        sefer: "",
      }));

      setErrors((prev) => ({
        ...prev,
        kebele: "",
        sefer: "",
      }));

      return;
    }

    if (name === "business_type") {
      setFormData((prev) => ({
        ...prev,
        business_type: value,
        business_description:
          value === "Other"
            ? prev.business_description
            : "",
      }));

      setErrors((prev) => ({
        ...prev,
        business_type: "",
        business_description: "",
      }));

      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  // ==========================================
  // Frontend Validation
  // ==========================================
  const validateForm = () => {
    const newErrors = {};

    const businessName = formData.business_name.trim();
    const ownerName = formData.owner_name.trim();
    const phone = formData.phone_number.trim();
    const email = formData.email.trim();

    // Business Name
    if (!businessName) {
      newErrors.business_name = t(
        "register.validation.businessNameRequired"
      );
    } else if (businessName.length < 3) {
      newErrors.business_name = t(
        "register.validation.businessNameMin"
      );
    } else if (businessName.length > 100) {
      newErrors.business_name = t(
        "register.validation.businessNameMax"
      );
    }

    // Owner Name
    if (!ownerName) {
      newErrors.owner_name = t(
        "register.validation.ownerNameRequired"
      );
    } else if (ownerName.length < 3) {
      newErrors.owner_name = t(
        "register.validation.ownerNameMin"
      );
    } else if (ownerName.length > 100) {
      newErrors.owner_name = t(
        "register.validation.ownerNameMax"
      );
    } else if (!/^[A-Za-zÀ-ÿ\s]+$/.test(ownerName)) {
      newErrors.owner_name = t(
        "register.validation.ownerNameLetters"
      );
    }

    // Phone
    if (!phone) {
      newErrors.phone_number = t(
        "register.validation.phoneRequired"
      );
    } else if (!/^09\d{8}$/.test(phone)) {
      newErrors.phone_number = t(
        "register.validation.phoneInvalid"
      );
    }

    // Email
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

    // Password
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

    // Confirm Password
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

    // Business Type
    if (!formData.business_type) {
      newErrors.business_type = t(
        "register.validation.businessTypeRequired"
      );
    } else if (!businessTypes.includes(formData.business_type)) {
      newErrors.business_type = t(
        "register.validation.invalidBusinessType"
      );
    }

    // Other Description
    if (formData.business_type === "Other") {
      const description =
        formData.business_description.trim();

      if (!description) {
        newErrors.business_description = t(
          "register.validation.businessDescriptionRequired"
        );
      } else if (description.length < 3) {
        newErrors.business_description = t(
          "register.validation.businessDescriptionMin"
        );
      } else if (description.length > 100) {
        newErrors.business_description = t(
          "register.validation.businessDescriptionMax"
        );
      }
    }

    // Kifle Ketema
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

    // Kebele
    if (!formData.kebele) {
      newErrors.kebele = t(
        "register.validation.kebeleRequired"
      );
    } else if (
      !formData.kifle_ketema ||
      !locations[formData.kifle_ketema]?.[formData.kebele]
    ) {
      newErrors.kebele = t(
        "register.validation.invalidKebele"
      );
    }

    // Sefer
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
  // Backend Errors
  // ==========================================
  const extractServerErrors = (data) => {
    const serverErrors = {};

    if (Array.isArray(data?.errors)) {
      data.errors.forEach((item) => {
        const field =
          item.path?.[0] || item.field;

        const message =
          item.message || item.msg;

        if (field && message) {
          serverErrors[field] = message;
        }
      });
    }

    if (Array.isArray(data?.details)) {
      data.details.forEach((item) => {
        const field =
          item.path?.[0] || item.field;

        const message =
          item.message || item.msg;

        if (field && message) {
          serverErrors[field] = message;
        }
      });
    }

    return serverErrors;
  };

  // ==========================================
  // Submit
  // ==========================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setToast({
      show: false,
      type: "error",
      message: "",
    });

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

    try {
      setLoading(true);

      const payload = {
        business_name: formData.business_name.trim(),
        owner_name: formData.owner_name.trim(),
        phone_number: formData.phone_number.trim(),
        email: formData.email.trim().toLowerCase(),

        password: formData.password,
        confirmPassword: formData.confirmPassword,

        business_type: formData.business_type,
        business_description:
          formData.business_description.trim(),

        kifle_ketema: formData.kifle_ketema,
        kebele: formData.kebele,
        sefer: formData.sefer,
      };

      console.log(
        "BUSINESS REGISTER PAYLOAD:",
        payload
      );

      const response = await API.post(
        "/auth/register/business",
        payload
      );

      console.log(
        "BUSINESS REGISTER RESPONSE:",
        response.data
      );

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

      setToast({
        show: true,
        type: "error",
        message:
          response.data?.message ||
          t("register.failed"),
      });
    } catch (err) {
      console.error(
        "BUSINESS REGISTRATION ERROR:",
        err.response?.data || err
      );

      const serverData = err.response?.data;

      const serverErrors =
        extractServerErrors(serverData);

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
  // JSX
  // ==========================================
  return (
    <ErrorBoundary>
      <div
        className="
          min-h-screen
          bg-gradient-to-br
          from-blue-700
          via-blue-600
          to-cyan-500
          flex
          items-center
          justify-center
          py-10
          px-5
        "
      >
        <div
          className="
            bg-white
            w-full
            max-w-4xl
            rounded-3xl
            shadow-2xl
            p-8
          "
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div
                className="
                  bg-blue-100
                  p-5
                  rounded-full
                "
              >
                <FaBuilding className="text-5xl text-blue-600" />
              </div>
            </div>

            <h2 className="text-3xl font-bold text-gray-800">
              {t("register.businessForm.title")}
            </h2>

            <p className="text-gray-500 mt-2">
              {t("register.businessForm.subtitle")}
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="grid md:grid-cols-2 gap-5"
          >
            {/* Business Name */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                {t("register.fields.businessName")}
              </label>

              <Input
                type="text"
                name="business_name"
                placeholder={t(
                  "register.placeholders.businessName"
                )}
                value={formData.business_name}
                onChange={handleChange}
                className="mb-0"
              />

              {errors.business_name && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.business_name}
                </p>
              )}
            </div>

            {/* Owner Name */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                {t("register.fields.ownerName")}
              </label>

              <Input
                type="text"
                name="owner_name"
                placeholder={t(
                  "register.placeholders.ownerName"
                )}
                value={formData.owner_name}
                onChange={handleChange}
                className="mb-0"
              />

              {errors.owner_name && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.owner_name}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                {t("register.fields.phone")}
              </label>

              <Input
                type="text"
                name="phone_number"
                placeholder={t(
                  "register.placeholders.phone"
                )}
                value={formData.phone_number}
                onChange={handleChange}
                className="mb-0"
              />

              {errors.phone_number && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.phone_number}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                {t("register.fields.email")}
              </label>

              <Input
                type="email"
                name="email"
                placeholder={t(
                  "register.placeholders.email"
                )}
                value={formData.email}
                onChange={handleChange}
                className="mb-0"
              />

              {errors.email && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                {t("register.fields.password")}
              </label>

              <Input
                type="password"
                name="password"
                placeholder={t(
                  "register.placeholders.password"
                )}
                value={formData.password}
                onChange={handleChange}
                className="mb-0"
              />

              {errors.password && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                {t("register.fields.confirmPassword")}
              </label>

              <Input
                type="password"
                name="confirmPassword"
                placeholder={t(
                  "register.placeholders.confirmPassword"
                )}
                value={formData.confirmPassword}
                onChange={handleChange}
                className="mb-0"
              />

              {errors.confirmPassword && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Business Type */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                {t("register.fields.businessType")}
              </label>

              <select
                name="business_type"
                value={formData.business_type}
                onChange={handleChange}
                className={selectClass("business_type")}
              >
                <option value="">
                  {t(
                    "register.placeholders.businessType"
                  )}
                </option>

                {businessTypes.map((type) => (
                  <option key={type} value={type}>
                    {t(
                      `register.businessTypes.${type}`,
                      type
                    )}
                  </option>
                ))}
              </select>

              {errors.business_type && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.business_type}
                </p>
              )}
            </div>

            {/* Other Description */}
            {formData.business_type === "Other" && (
              <div>
                <label className="block text-sm font-semibold mb-2">
                  {t(
                    "register.fields.businessDescription"
                  )}
                </label>

                <Input
                  type="text"
                  name="business_description"
                  placeholder={t(
                    "register.placeholders.businessDescription"
                  )}
                  value={formData.business_description}
                  onChange={handleChange}
                  className="mb-0"
                />

                {errors.business_description && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.business_description}
                  </p>
                )}
              </div>
            )}

            {/* Kifle Ketema */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                {t("register.fields.kifleKetema")}
              </label>

              <select
                name="kifle_ketema"
                value={formData.kifle_ketema}
                onChange={handleChange}
                className={selectClass("kifle_ketema")}
              >
                <option value="">
                  {t(
                    "register.placeholders.kifleKetema"
                  )}
                </option>

                {Object.keys(locations).map((kifle) => (
                  <option key={kifle} value={kifle}>
                    {t(
                      `register.locations.${kifle}`,
                      kifle
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

            {/* Kebele */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                {t("register.fields.kebele")}
              </label>

              <select
                name="kebele"
                value={formData.kebele}
                onChange={handleChange}
                disabled={!formData.kifle_ketema}
                className={selectClass("kebele")}
              >
                <option value="">
                  {t(
                    "register.placeholders.kebele"
                  )}
                </option>

                {formData.kifle_ketema &&
                  Object.keys(
                    locations[formData.kifle_ketema] || {}
                  ).map((kebele) => (
                    <option key={kebele} value={kebele}>
                      {t(
                        `register.locations.${kebele}`,
                        kebele
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

            {/* Sefer */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                {t("register.fields.sefer")}
              </label>

              <select
                name="sefer"
                value={formData.sefer}
                onChange={handleChange}
                disabled={!formData.kebele}
                className={selectClass("sefer")}
              >
                <option value="">
                  {t(
                    "register.placeholders.sefer"
                  )}
                </option>

                {formData.kifle_ketema &&
                  formData.kebele &&
                  (
                    locations[formData.kifle_ketema]?.[
                      formData.kebele
                    ] || []
                  ).map((sefer) => (
                    <option key={sefer} value={sefer}>
                      {t(
                        `register.locations.${sefer}`,
                        sefer
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

            {/* Register Button */}
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="
                md:col-span-2
                bg-blue-600
                hover:bg-blue-700
                active:bg-blue-800
                py-3
                rounded-xl
                font-semibold
                text-white
              "
            >
              {loading
                ? t("register.buttons.registering")
                : t("register.buttons.registerBusiness")}
            </Button>
          </form>

          {/* Already Have Account */}
          <div className="text-center mt-6">
            <span className="text-gray-500">
              {t("register.alreadyAccount")}{" "}
            </span>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="
                text-blue-600
                font-semibold
                hover:text-blue-800
                hover:underline
                transition
              "
            >
              {t("register.login")}
            </button>
          </div>
        </div>

        {/* Toast */}
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
