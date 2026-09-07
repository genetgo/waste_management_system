const Joi = require("joi");

// ===============================
// Create System Admin
// ===============================
const systemAdminValidation = Joi.object({
  full_name: Joi.string()
    .trim()
    .min(3)
    .max(100)
    .required(),

  username: Joi.string()
    .trim()
    .min(4)
    .max(50)
    .required(),

  password: Joi.string()
    .min(6)
    .max(50)
    .required(),
}).options({
  abortEarly: false,
  allowUnknown: false,
});

// ===============================
// Update System Admin
// ===============================
const systemAdminUpdateValidation = Joi.object({
  full_name: Joi.string()
    .trim()
    .min(3)
    .max(100),

  username: Joi.string()
    .trim()
    .min(4)
    .max(50),

  profile_image: Joi.string()
    .allow("", null),
}).options({
  abortEarly: false,
  allowUnknown: false,
});

module.exports = {
  systemAdminValidation,
  systemAdminUpdateValidation,
};