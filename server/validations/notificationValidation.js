const Joi = require("joi");

// ===============================
// Create Notification
// ===============================
const createNotificationValidation = Joi.object({
  user_role: Joi.string()
    .valid(
      "RESIDENT",
      "BUSINESS_OWNER",
      "COLLECTOR",
      "MUNICIPAL_ADMIN",
      "SYSTEM_ADMIN"
    )
    .required(),

  user_id: Joi.number()
    .integer()
    .positive()
    .required(),

  title: Joi.string()
    .trim()
    .max(150)
    .required(),

  message: Joi.string()
    .trim()
    .required(),

  is_read: Joi.boolean().default(false),
}).options({
  abortEarly: false,
  allowUnknown: false,
});

// ===============================
// Update Notification
// ===============================
const updateNotificationValidation = Joi.object({
  title: Joi.string()
    .trim()
    .max(150),

  message: Joi.string()
    .trim(),

  is_read: Joi.boolean(),
}).options({
  abortEarly: false,
  allowUnknown: false,
});

module.exports = {
  createNotificationValidation,
  updateNotificationValidation,
};