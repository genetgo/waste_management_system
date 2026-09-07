import React, { useState } from "react";
import {
  FaEye,
  FaEyeSlash,
  FaUserPlus,
} from "react-icons/fa";
import API from "../../services/api";

const StaffAccounts = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    role: "Municipal Admin",
    phone: "",
    password: "",
    assigned_kifle_ketema: "",
    kebele: "",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // ==========================================
  // Location Data
  // ==========================================
  const locationData = {
    Abima: {
      kebeles: [
        "Kebele 01",
        "Kebele 02",
        "Kebele 03",
        "Kebele 04",
      ],
    },

    Menkorer: {
      kebeles: [
        "Kebele 05",
        "Kebele 06",
        "Kebele 07",
        "Kebele 08",
      ],
    },

    "Nigus Teklehaymanot": {
      kebeles: [
        "Kebele 09",
        "Kebele 10",
        "Kebele 11",
        "Kebele 12",
        "Kebele 13",
      ],
    },

    "Tedila Gualu": {
      kebeles: [
        "Kebele 14",
        "Kebele 15",
        "Kebele 16",
        "Kebele 17",
        "Kebele 18",
      ],
    },
  };

  const kebeles =
    locationData[
      formData.assigned_kifle_ketema
    ]?.kebeles || [];

  // ==========================================
  // Handle Change
  // ==========================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: value,
      };

      if (name === "role") {
        updated.assigned_kifle_ketema = "";
        updated.kebele = "";
      }

      if (name === "assigned_kifle_ketema") {
        updated.kebele = "";
      }

      return updated;
    });

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setError("");
    setSuccess(false);
  };

  // ==========================================
  // Frontend Validation
  // ==========================================
  const validateForm = () => {
    const newErrors = {};

    const fullName = formData.fullName.trim();
    const email = formData.email.trim();
    const phone = formData.phone.trim();

    // Full Name
    if (!fullName) {
      newErrors.fullName = "Full name is required.";
    } else if (fullName.length < 3) {
      newErrors.fullName =
        "Full name must be at least 3 characters.";
    } else if (!/^[A-Za-zÀ-ÿ\s]+$/.test(fullName)) {
      newErrors.fullName =
        "Full name can contain letters and spaces only.";
    }

    // Email
    if (!email) {
      newErrors.email = "Email is required.";
    } else if (
      !/^[A-Za-z0-9._%+-]+@gmail\.com$/i.test(email)
    ) {
      newErrors.email =
        "Please enter a valid Gmail address.";
    }

    // Phone
    if (!phone) {
      newErrors.phone = "Phone number is required.";
    } else if (!/^09\d{8}$/.test(phone)) {
      newErrors.phone =
        "Phone number must be exactly 10 digits and start with 09.";
    }

    // Role
    if (!formData.role) {
      newErrors.role = "Staff role is required.";
    }

    // Password
    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else if (formData.password.length < 6) {
      newErrors.password =
        "Password must be at least 6 characters.";
    }

    // Kifle Ketema
    if (
      formData.role !== "System Admin" &&
      !formData.assigned_kifle_ketema
    ) {
      newErrors.assigned_kifle_ketema =
        "Assigned Kifle Ketema is required.";
    }

    // Kebele
    if (
      formData.role === "Collector" &&
      !formData.kebele
    ) {
      newErrors.kebele =
        "Kebele is required for collectors.";
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

    setSuccess(false);
    setError("");

    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setError(
        "Please correct the highlighted fields."
      );
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        fullName: formData.fullName.trim(),

        email: formData.email
          .trim()
          .toLowerCase(),

        role: formData.role,

        phone: formData.phone.trim(),

        password: formData.password,

        assigned_kifle_ketema:
          formData.assigned_kifle_ketema,

        kebele: formData.kebele,
      };

      console.log(
        "STAFF REGISTER PAYLOAD:",
        payload
      );

      const response = await API.post(
        "/system-admin/staff",
        payload
      );

      console.log(
        "STAFF REGISTER RESPONSE:",
        response.data
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Failed to create staff account."
        );
      }

      setSuccess(true);

      setFormData({
        fullName: "",
        email: "",
        role: "Municipal Admin",
        phone: "",
        password: "",
        assigned_kifle_ketema: "",
        kebele: "",
      });

      setErrors({});
    } catch (err) {
      console.error(
        "Staff registration error:",
        err.response?.data || err
      );

      const serverData = err.response?.data;

      const serverErrors =
        extractServerErrors(serverData);

      if (
        Object.keys(serverErrors).length > 0
      ) {
        setErrors((prev) => ({
          ...prev,
          ...serverErrors,
        }));

        setError(
          "Please correct the highlighted fields."
        );
      } else {
        setError(
          serverData?.message ||
            err.message ||
            "Failed to create staff account."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-4 w-full max-w-xl mx-auto">

      {/* Header */}
      <div className="border-b border-slate-100 pb-4">
        <h1
          className="
            text-2xl
            font-bold
            text-gray-900
            tracking-tight
            flex
            items-center
            gap-2
          "
        >
          <FaUserPlus className="text-emerald-600 text-xl" />
          Create Staff Account
        </h1>

        <p
          className="
            text-xs
            sm:text-sm
            text-gray-500
            mt-1
          "
        >
          Create accounts for municipal
          administrators, collectors, or system
          administrators.
        </p>
      </div>

      {/* Success */}
      {success && (
        <div
          className="
            p-3.5
            bg-emerald-50
            border
            border-emerald-100
            text-emerald-800
            text-sm
            rounded-xl
            font-medium
          "
        >
          🎉 Staff account has been
          successfully created!
        </div>
      )}

      {/* General Error */}
      {error && (
        <div
          className="
            p-3.5
            bg-red-50
            border
            border-red-100
            text-red-800
            text-sm
            rounded-xl
            font-medium
          "
        >
          ⚠️ {error}
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="
          bg-white
          p-5
          sm:p-6
          border
          border-slate-100
          rounded-2xl
          shadow-sm
          space-y-4
        "
      >

        {/* Full Name */}
        <div>
          <label
            className="
              block
              text-[11px]
              font-semibold
              text-gray-500
              uppercase
              tracking-wider
              mb-1
            "
          >
            Full Name
          </label>

          <input
            type="text"
            value={formData.fullName}
            onChange={(e) =>
              handleChange({
                target: {
                  name: "fullName",
                  value: e.target.value,
                },
              })
            }
            placeholder="Enter full name"
            className={`
              w-full
              px-3.5
              py-2.5
              border
              rounded-xl
              outline-none
              transition
              ${
                errors.fullName
                  ? "border-red-500 ring-2 ring-red-100"
                  : "border-slate-200"
              }
              focus:ring-2
              focus:ring-emerald-500/20
              focus:border-emerald-500
            `}
          />

          {errors.fullName && (
            <p className="text-red-600 text-sm mt-1">
              {errors.fullName}
            </p>
          )}
        </div>

        {/* Email + Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Email */}
          <div>
            <label
              className="
                block
                text-[11px]
                font-semibold
                text-gray-500
                uppercase
                tracking-wider
                mb-1
              "
            >
              Email Address
            </label>

            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                handleChange({
                  target: {
                    name: "email",
                    value: e.target.value,
                  },
                })
              }
              placeholder="Enter email address"
              className={`
                w-full
                px-3.5
                py-2.5
                border
                rounded-xl
                outline-none
                ${
                  errors.email
                    ? "border-red-500 ring-2 ring-red-100"
                    : "border-slate-200"
                }
              `}
            />

            {errors.email && (
              <p className="text-red-600 text-sm mt-1">
                {errors.email}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label
              className="
                block
                text-[11px]
                font-semibold
                text-gray-500
                uppercase
                tracking-wider
                mb-1
              "
            >
              Phone Number
            </label>

            <input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                handleChange({
                  target: {
                    name: "phone",
                    value: e.target.value,
                  },
                })
              }
              placeholder="Enter phone number"
              className={`
                w-full
                px-3.5
                py-2.5
                border
                rounded-xl
                outline-none
                ${
                  errors.phone
                    ? "border-red-500 ring-2 ring-red-100"
                    : "border-slate-200"
                }
              `}
            />

            {errors.phone && (
              <p className="text-red-600 text-sm mt-1">
                {errors.phone}
              </p>
            )}
          </div>
        </div>

        {/* Role */}
        <div>
          <label
            className="
              block
              text-[11px]
              font-semibold
              text-gray-500
              uppercase
              tracking-wider
              mb-1
            "
          >
            System Assigned Role
          </label>

          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className={`
              w-full
              px-3.5
              py-2.5
              border
              rounded-xl
              outline-none
              bg-white
              ${
                errors.role
                  ? "border-red-500"
                  : "border-slate-200"
              }
            `}
          >
            <option value="Municipal Admin">
              Municipal Admin
            </option>

            <option value="Collector">
              Collector / Driver
            </option>

            <option value="System Admin">
              System Admin
            </option>
          </select>

          {errors.role && (
            <p className="text-red-600 text-sm mt-1">
              {errors.role}
            </p>
          )}
        </div>

        {/* Assigned Kifle Ketema */}
        {formData.role !== "System Admin" && (
          <div>
            <label
              className="
                block
                text-[11px]
                font-semibold
                text-gray-500
                uppercase
                tracking-wider
                mb-1
              "
            >
              Assigned Kifle Ketema
            </label>

            <select
              name="assigned_kifle_ketema"
              value={
                formData.assigned_kifle_ketema
              }
              onChange={handleChange}
              className={`
                w-full
                px-3.5
                py-2.5
                border
                rounded-xl
                outline-none
                bg-white
                ${
                  errors.assigned_kifle_ketema
                    ? "border-red-500"
                    : "border-slate-200"
                }
              `}
            >
              <option value="">
                Select Kifle Ketema
              </option>

              {Object.keys(locationData).map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                )
              )}
            </select>

            {errors.assigned_kifle_ketema && (
              <p className="text-red-600 text-sm mt-1">
                {
                  errors.assigned_kifle_ketema
                }
              </p>
            )}
          </div>
        )}

        {/* Collector Location - Kebele ONLY */}
        {formData.role === "Collector" && (
          <div>
            <label
              className="
                block
                text-[11px]
                font-semibold
                text-gray-500
                uppercase
                tracking-wider
                mb-1
              "
            >
              Kebele
            </label>

            <select
              name="kebele"
              value={formData.kebele}
              onChange={handleChange}
              disabled={
                !formData.assigned_kifle_ketema
              }
              className={`
                w-full
                px-3.5
                py-2.5
                border
                rounded-xl
                outline-none
                bg-white
                disabled:bg-gray-100
                disabled:cursor-not-allowed
                ${
                  errors.kebele
                    ? "border-red-500"
                    : "border-slate-200"
                }
              `}
            >
              <option value="">
                Select Kebele
              </option>

              {kebeles.map((item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              ))}
            </select>

            {errors.kebele && (
              <p className="text-red-600 text-sm mt-1">
                {errors.kebele}
              </p>
            )}
          </div>
        )}

        {/* Password */}
        <div>
          <label
            className="
              block
              text-[11px]
              font-semibold
              text-gray-500
              uppercase
              tracking-wider
              mb-1
            "
          >
            Password
          </label>

          <div className="relative">
            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              value={formData.password}
              onChange={(e) =>
                handleChange({
                  target: {
                    name: "password",
                    value: e.target.value,
                  },
                })
              }
              placeholder="Create temporary password"
              className={`
                w-full
                px-3.5
                py-2.5
                border
                rounded-xl
                outline-none
                pr-10
                ${
                  errors.password
                    ? "border-red-500"
                    : "border-slate-200"
                }
              `}
            />

            <button
              type="button"
              className="
                absolute
                right-3
                top-1/2
                -translate-y-1/2
                text-gray-400
                hover:text-gray-600
                p-1
              "
              onClick={() =>
                setShowPassword(
                  (prev) => !prev
                )
              }
            >
              {showPassword ? (
                <FaEyeSlash className="h-4 w-4" />
              ) : (
                <FaEye className="h-4 w-4" />
              )}
            </button>
          </div>

          {errors.password && (
            <p className="text-red-600 text-sm mt-1">
              {errors.password}
            </p>
          )}
        </div>

        {/* Submit */}
        <div className="pt-2 flex justify-center">
          <button
            type="submit"
            disabled={submitting}
            className="
              w-fit
              px-6
              py-2.5
              bg-emerald-600
              hover:bg-emerald-700
              active:bg-emerald-800
              text-white
              font-semibold
              rounded-xl
              shadow-sm
              transition
              disabled:opacity-50
              disabled:cursor-not-allowed
            "
          >
            {submitting
              ? "Creating Account..."
              : "Register Staff Account"}
          </button>
        </div>

      </form>
    </div>
  );
};

export default StaffAccounts;