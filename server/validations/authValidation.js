const Joi = require("joi");

// ===============================
// Login Validation
// ===============================
const loginValidation = Joi.object({
  email: Joi.string()
    .trim()
    .email()
    .required()
    .messages({
      "string.email": "Please enter a valid email.",
      "string.empty": "Email is required.",
      "any.required": "Email is required.",
    }),

  password: Joi.string()
    .min(6)
    .max(50)
    .required()
    .messages({
      "string.min": "Password must be at least 6 characters.",
      "string.max": "Password cannot exceed 50 characters.",
      "string.empty": "Password is required.",
      "any.required": "Password is required.",
    }),
}).options({
  abortEarly: false,
  allowUnknown: false,
});

// ===============================
// Change Password Validation
// ===============================
const changePasswordValidation = Joi.object({
  oldPassword: Joi.string()
    .required()
    .messages({
      "string.empty": "Old password is required.",
      "any.required": "Old password is required.",
    }),

  newPassword: Joi.string()
    .min(6)
    .max(50)
    .required()
    .messages({
      "string.min": "New password must be at least 6 characters.",
      "string.max": "New password cannot exceed 50 characters.",
      "string.empty": "New password is required.",
      "any.required": "New password is required.",
    }),

  confirmPassword: Joi.any()
    .valid(Joi.ref("newPassword"))
    .required()
    .messages({
      "any.only": "Passwords do not match.",
      "any.required": "Confirm password is required.",
    }),
}).options({
  abortEarly: false,
  allowUnknown: false,
});

module.exports = {
  loginValidation,
  changePasswordValidation,
};