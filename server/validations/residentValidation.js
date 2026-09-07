const Joi = require("joi");

// ==========================================
// Common Reusable Rules
// ==========================================

const fullNameRule = Joi.string()
  .trim()
  .min(3)
  .max(50)
  .pattern(/^[A-Za-zÀ-ÿ\s]+$/)
  .required()
  .messages({
    "string.empty": "Full name is required.",
    "string.min": "Full name must be at least 3 characters.",
    "string.max": "Full name cannot exceed 50 characters.",
    "string.pattern.base":
      "Full name can contain letters and spaces only.",
    "any.required": "Full name is required.",
  });

const phoneRule = Joi.string()
  .trim()
  .pattern(/^09\d{8}$/)
  .required()
  .messages({
    "string.empty": "Phone number is required.",
    "string.pattern.base":
      "Phone number must be exactly 10 digits and start with 09.",
    "any.required": "Phone number is required.",
  });

const emailRule = Joi.string()
  .trim()
  .pattern(/^[A-Za-z0-9._%+-]+@gmail\.com$/i)
  .required()
  .messages({
    "string.empty": "Email is required.",
    "string.pattern.base":
      "Please enter a valid Gmail address.",
    "any.required": "Email is required.",
  });

const passwordRule = Joi.string()
  .min(6)
  .max(50)
  .required()
  .messages({
    "string.empty": "Password is required.",
    "string.min":
      "Password must be at least 6 characters.",
    "string.max":
      "Password cannot exceed 50 characters.",
    "any.required":
      "Password is required.",
  });

// ==========================================
// Register Resident
// ==========================================
const residentRegisterValidation = Joi.object({
  full_name: fullNameRule,

  phone_number: phoneRule,

  email: emailRule,

  password: passwordRule,

  confirmPassword: Joi.string()
    .required()
    .valid(Joi.ref("password"))
    .messages({
      "string.empty":
        "Confirm password is required.",
      "any.only":
        "Passwords do not match.",
      "any.required":
        "Confirm password is required.",
    }),

  kifle_ketema: Joi.string()
    .trim()
    .valid(
      "Abima",
      "Nigus Teklehaymanot",
      "Tedila Gualu",
      "Menkorer"
    )
    .required()
    .messages({
      "any.only":
        "Please select a valid Kifle Ketema.",
      "string.empty":
        "Kifle Ketema is required.",
      "any.required":
        "Kifle Ketema is required.",
    }),

  kebele: Joi.string()
    .trim()
    .pattern(/^Kebele\s+\d{1,2}$/i)
    .required()
    .messages({
      "string.empty":
        "Kebele is required.",
      "string.pattern.base":
        "Kebele must be in the format Kebele 01.",
      "any.required":
        "Kebele is required.",
    }),

  sefer: Joi.string()
    .trim()
    .pattern(/^Sefer\s+\d{1,2}$/i)
    .required()
    .messages({
      "string.empty":
        "Sefer is required.",
      "string.pattern.base":
        "Sefer must be in the format Sefer 01.",
      "any.required":
        "Sefer is required.",
    }),

  profile_image: Joi.string()
    .allow(null, "")
    .optional(),
})
  .options({
    abortEarly: false,
    allowUnknown: false,
  });

// ==========================================
// Update Resident
// ==========================================
const residentUpdateValidation = Joi.object({
  full_name: Joi.string()
    .trim()
    .min(3)
    .max(50)
    .pattern(/^[A-Za-zÀ-ÿ\s]+$/)
    .messages({
      "string.min":
        "Full name must be at least 3 characters.",
      "string.max":
        "Full name cannot exceed 50 characters.",
      "string.pattern.base":
        "Full name can contain letters and spaces only.",
    }),

  phone_number: Joi.string()
    .trim()
    .pattern(/^09\d{8}$/)
    .messages({
      "string.pattern.base":
        "Phone number must be exactly 10 digits and start with 09.",
    }),

  email: Joi.string()
    .trim()
    .pattern(/^[A-Za-z0-9._%+-]+@gmail\.com$/i)
    .messages({
      "string.pattern.base":
        "Please enter a valid Gmail address.",
    }),

  kebele: Joi.string()
    .trim()
    .pattern(/^Kebele\s+\d{1,2}$/i)
    .messages({
      "string.pattern.base":
        "Kebele must be in the format Kebele 01.",
    }),

  sefer: Joi.string()
    .trim()
    .pattern(/^Sefer\s+\d{1,2}$/i)
    .messages({
      "string.pattern.base":
        "Sefer must be in the format Sefer 01.",
    }),

  kifle_ketema: Joi.string()
    .trim()
    .valid(
      "Abima",
      "Nigus Teklehaymanot",
      "Tedila Gualu",
      "Menkorer"
    )
    .messages({
      "any.only":
        "Please select a valid Kifle Ketema.",
    }),

  profile_image: Joi.string()
    .allow(null, "")
    .optional(),
})
  .options({
    abortEarly: false,
    allowUnknown: false,
  });

module.exports = {
  residentRegisterValidation,
  residentUpdateValidation,
};