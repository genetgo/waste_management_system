const Joi = require("joi");

// ===============================
// Create Feedback
// ===============================
const createFeedbackValidation = Joi.object({
  user_type: Joi.string()
    .valid("Resident", "Business")
    .required(),

  user_id: Joi.number()
    .integer()
    .positive()
    .required(),

  collector_id: Joi.number()
    .integer()
    .positive()
    .required(),

  rating: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .required(),

  comment: Joi.string()
    .trim()
    .max(500)
    .allow("", null),
}).options({
  abortEarly: false,
  allowUnknown: false,
});

// ===============================
// Update Feedback
// ===============================
const updateFeedbackValidation = Joi.object({
  rating: Joi.number()
    .integer()
    .min(1)
    .max(5),

  comment: Joi.string()
    .trim()
    .max(500)
    .allow("", null),
}).options({
  abortEarly: false,
  allowUnknown: false,
});

module.exports = {
  createFeedbackValidation,
  updateFeedbackValidation,
};