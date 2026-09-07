const Joi = require("joi");

// ==========================================
// Create Staff Account
// ==========================================
const staffCreateValidation = Joi.object({
  // ------------------------------------------
  // Full Name
  // ------------------------------------------
  fullName: Joi.string()
    .trim()
    .min(3)
    .max(100)
    .pattern(/^[A-Za-zÀ-ÿ\s]+$/)
    .required()
    .messages({
      "string.empty":
        "Full name is required.",
      "string.min":
        "Full name must be at least 3 characters.",
      "string.max":
        "Full name cannot exceed 100 characters.",
      "string.pattern.base":
        "Full name can contain letters and spaces only.",
      "any.required":
        "Full name is required.",
    }),

  // ------------------------------------------
  // Email
  // ------------------------------------------
  email: Joi.string()
    .trim()
    .pattern(
      /^[A-Za-z0-9._%+-]+@gmail\.com$/i
    )
    .required()
    .messages({
      "string.empty":
        "Email is required.",
      "string.pattern.base":
        "Please enter a valid Gmail address.",
      "any.required":
        "Email is required.",
    }),

  // ------------------------------------------
  // Phone
  // ------------------------------------------
  phone: Joi.string()
    .trim()
    .pattern(/^09\d{8}$/)
    .required()
    .messages({
      "string.empty":
        "Phone number is required.",
      "string.pattern.base":
        "Phone number must be exactly 10 digits and start with 09.",
      "any.required":
        "Phone number is required.",
    }),

  // ------------------------------------------
  // Role
  // ------------------------------------------
  role: Joi.string()
    .valid(
      "Municipal Admin",
      "Collector",
      "System Admin"
    )
    .required()
    .messages({
      "any.only":
        "Please select a valid staff role.",
      "any.required":
        "Staff role is required.",
    }),

  // ------------------------------------------
  // Password
  // ------------------------------------------
  password: Joi.string()
    .min(6)
    .max(50)
    .required()
    .messages({
      "string.empty":
        "Password is required.",
      "string.min":
        "Password must be at least 6 characters.",
      "string.max":
        "Password cannot exceed 50 characters.",
      "any.required":
        "Password is required.",
    }),

  // ------------------------------------------
  // Kifle Ketema
  // Required for Municipal Admin and Collector
  // ------------------------------------------
  assigned_kifle_ketema: Joi.when(
    "role",
    {
      is: Joi.valid(
        "Municipal Admin",
        "Collector"
      ),

      then: Joi.string()
        .valid(
          "Abima",
          "Menkorer",
          "Nigus Teklehaymanot",
          "Tedila Gualu"
        )
        .required()
        .messages({
          "string.empty":
            "Assigned Kifle Ketema is required.",
          "any.only":
            "Please select a valid Kifle Ketema.",
          "any.required":
            "Assigned Kifle Ketema is required.",
        }),

      otherwise: Joi.string()
        .allow("")
        .optional(),
    }
  ),

  // ------------------------------------------
  // Kebele
  // Required only for Collector
  // ------------------------------------------
  kebele: Joi.when("role", {
    is: "Collector",

    then: Joi.string()
      .pattern(/^Kebele\s+\d{1,2}$/i)
      .required()
      .messages({
        "string.empty":
          "Kebele is required for collectors.",
        "string.pattern.base":
          "Kebele must be in the format Kebele 01.",
        "any.required":
          "Kebele is required for collectors.",
      }),

    otherwise: Joi.string()
      .allow("")
      .optional(),
  }),

  // ------------------------------------------
  // Sefer
  // Required only for Collector
  // ------------------------------------------
  sefer: Joi.when("role", {
    is: "Collector",

    then: Joi.string()
      .pattern(/^Sefer\s+\d{1,2}$/i)
      .required()
      .messages({
        "string.empty":
          "Sefer is required for collectors.",
        "string.pattern.base":
          "Sefer must be in the format Sefer 01.",
        "any.required":
          "Sefer is required for collectors.",
      }),

    otherwise: Joi.string()
      .allow("")
      .optional(),
  }),
}).options({
  abortEarly: false,
  allowUnknown: false,
});

// ==========================================
// Update Staff Account
// ==========================================
const staffUpdateValidation = Joi.object({
  fullName: Joi.string()
    .trim()
    .min(3)
    .max(100)
    .pattern(/^[A-Za-zÀ-ÿ\s]+$/)
    .messages({
      "string.min":
        "Full name must be at least 3 characters.",
      "string.max":
        "Full name cannot exceed 100 characters.",
      "string.pattern.base":
        "Full name can contain letters and spaces only.",
    }),

  email: Joi.string()
    .trim()
    .pattern(
      /^[A-Za-z0-9._%+-]+@gmail\.com$/i
    )
    .messages({
      "string.pattern.base":
        "Please enter a valid Gmail address.",
    }),

  phone: Joi.string()
    .trim()
    .pattern(/^09\d{8}$/)
    .messages({
      "string.pattern.base":
        "Phone number must be exactly 10 digits and start with 09.",
    }),

  role: Joi.string()
    .valid(
      "Municipal Admin",
      "Collector",
      "System Admin"
    ),

  assigned_kifle_ketema: Joi.string()
    .valid(
      "Abima",
      "Menkorer",
      "Nigus Teklehaymanot",
      "Tedila Gualu"
    )
    .allow(""),

  kebele: Joi.string()
    .pattern(/^Kebele\s+\d{1,2}$/i)
    .allow(""),

  sefer: Joi.string()
    .pattern(/^Sefer\s+\d{1,2}$/i)
    .allow(""),
}).options({
  abortEarly: false,
  allowUnknown: false,
});

module.exports = {
  staffCreateValidation,
  staffUpdateValidation,
};