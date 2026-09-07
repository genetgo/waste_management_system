const Joi = require("joi");

// ===============================
// Register Collector
// ===============================
const collectorRegisterValidation = Joi.object({
  full_name: Joi.string()
    .trim()
    .min(3)
    .max(100)
    .required(),

  phone_number: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Phone number must contain exactly 10 digits.",
    }),

  email: Joi.string()
    .trim()
    .email()
    .required(),

  password: Joi.string()
    .min(6)
    .max(50)
    .required(),

  assigned_kifle_ketema: Joi.string()
    .trim()
    .required(),

  kebele: Joi.string()
    .trim()
    .required(),

  status: Joi.string()
    .valid("Available", "On Duty", "Inactive")
    .default("Available"),
}).options({
  abortEarly: false,
  allowUnknown: false,
});

// ===============================
// Update Collector
// ===============================
const collectorUpdateValidation = Joi.object({
  full_name: Joi.string().trim().min(3).max(100),

  phone_number: Joi.string()
    .pattern(/^[0-9]{10}$/),

  email: Joi.string().trim().email(),

  assigned_kifle_ketema: Joi.string(),

  kebele: Joi.string(),

  status: Joi.string().valid(
    "Available",
    "On Duty",
    "Inactive"
  ),

  profile_image: Joi.string().allow("", null),
}).options({
  abortEarly: false,
  allowUnknown: false,
});

module.exports = {
  collectorRegisterValidation,
  collectorUpdateValidation,
};