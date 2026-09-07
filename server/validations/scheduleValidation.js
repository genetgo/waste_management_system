const Joi = require("joi");

// ===============================
// Create Collection Schedule
// ===============================
const createScheduleValidation = Joi.object({
  collector_id: Joi.number()
    .integer()
    .positive()
    .required(),

  collection_date: Joi.date()
    .required(),

  collection_time: Joi.string()
    .required(),

  kebele: Joi.string()
    .trim()
    .required(),

  kifle_ketema: Joi.string()
    .trim()
    .required(),

  status: Joi.string()
    .valid(
      "Scheduled",
      "Completed",
      "Cancelled"
    )
    .default("Scheduled"),
}).options({
  abortEarly: false,
  allowUnknown: false,
});

// ===============================
// Update Schedule
// ===============================
const updateScheduleValidation = Joi.object({
  collector_id: Joi.number()
    .integer()
    .positive(),

  collection_date: Joi.date(),

  collection_time: Joi.string(),

  kebele: Joi.string(),

  kifle_ketema: Joi.string(),

  status: Joi.string().valid(
    "Scheduled",
    "Completed",
    "Cancelled"
  ),
}).options({
  abortEarly: false,
  allowUnknown: false,
});

module.exports = {
  createScheduleValidation,
  updateScheduleValidation,
};