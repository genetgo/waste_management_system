const Joi = require("joi");

// ===============================
// Register Municipal Admin
// ===============================
const municipalAdminRegisterValidation = Joi.object({
  full_name: Joi.string()
    .trim()
    .min(3)
    .max(100)
    .required(),

  phone_number: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required(),

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
}).options({
  abortEarly: false,
  allowUnknown: false,
});

// ===============================
// Update Municipal Admin
// ===============================
const municipalAdminUpdateValidation = Joi.object({
  full_name: Joi.string()
    .trim()
    .min(3)
    .max(100),

  phone_number: Joi.string()
    .pattern(/^[0-9]{10}$/),

  email: Joi.string()
    .trim()
    .email(),

  assigned_kifle_ketema: Joi.string(),

  profile_image: Joi.string()
    .allow("", null),
}).options({
  abortEarly: false,
  allowUnknown: false,
});

module.exports = {
  municipalAdminRegisterValidation,
  municipalAdminUpdateValidation,
};