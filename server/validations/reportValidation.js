const Joi = require("joi");

// ===============================
// Create Report
// ===============================
const createReportValidation = Joi.object({
  report_type: Joi.string()
    .valid(
      "Collection",
      "Request",
      "Feedback",
      "Resident",
      "Business",
      "Collector",
      "Schedule",
      "Other"
    )
    .required(),

  title: Joi.string()
    .trim()
    .min(3)
    .max(150)
    .required(),

  description: Joi.string()
    .trim()
    .required(),

  created_by: Joi.number()
    .integer()
    .positive()
    .required(),
}).options({
  abortEarly: false,
  allowUnknown: false,
});

// ===============================
// Update Report
// ===============================
const updateReportValidation = Joi.object({
  report_type: Joi.string().valid(
    "Collection",
    "Request",
    "Feedback",
    "Resident",
    "Business",
    "Collector",
    "Schedule",
    "Other"
  ),

  title: Joi.string()
    .trim()
    .min(3)
    .max(150),

  description: Joi.string().trim(),
}).options({
  abortEarly: false,
  allowUnknown: false,
});

module.exports = {
  createReportValidation,
  updateReportValidation,
};