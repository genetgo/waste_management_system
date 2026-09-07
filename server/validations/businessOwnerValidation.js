const Joi = require("joi");

// ==========================================
// Register Business Owner
// ==========================================
const businessOwnerRegisterValidation = Joi.object({
  // ------------------------------------------
  // Business Name
  // ------------------------------------------
  business_name: Joi.string()
    .trim()
    .min(3)
    .max(100)
    .required()
    .messages({
      "string.empty":
        "Business name is required.",
      "string.min":
        "Business name must be at least 3 characters.",
      "string.max":
        "Business name cannot exceed 100 characters.",
      "any.required":
        "Business name is required.",
    }),

  // ------------------------------------------
  // Owner Name
  // ------------------------------------------
  owner_name: Joi.string()
    .trim()
    .min(3)
    .max(100)
    .pattern(/^[A-Za-zÀ-ÿ\s]+$/)
    .required()
    .messages({
      "string.empty":
        "Owner name is required.",
      "string.min":
        "Owner name must be at least 3 characters.",
      "string.max":
        "Owner name cannot exceed 100 characters.",
      "string.pattern.base":
        "Owner name can contain letters and spaces only.",
      "any.required":
        "Owner name is required.",
    }),

  // ------------------------------------------
  // Phone
  // ------------------------------------------
  phone_number: Joi.string()
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
  // Confirm Password
  // ------------------------------------------
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

  // ------------------------------------------
  // Business Type
  // ------------------------------------------
  business_type: Joi.string()
    .trim()
    .valid(
      "Cafe",
      "Resturant",
      "Hotel",
      "Jambo",
      "Gulit",
      "Government Office",
      "Kera",
      "Other"
    )
    .required()
    .messages({
      "string.empty":
        "Business type is required.",
      "any.only":
        "Please select a valid business type.",
      "any.required":
        "Business type is required.",
    }),

  // ------------------------------------------
  // Other Business Description
  // ------------------------------------------
  business_description: Joi.when(
    "business_type",
    {
      is: "Other",

      then: Joi.string()
        .trim()
        .min(3)
        .max(100)
        .required()
        .messages({
          "string.empty":
            "Please describe your business.",
          "string.min":
            "Business description must be at least 3 characters.",
          "string.max":
            "Business description cannot exceed 100 characters.",
          "any.required":
            "Please describe your business.",
        }),

      otherwise: Joi.string()
        .trim()
        .allow("")
        .optional(),
    }
  ),

  // ------------------------------------------
  // Kifle Ketema
  // ------------------------------------------
  kifle_ketema: Joi.string()
    .trim()
    .valid(
      "Abima",
      "Menkorer",
      "Nigus Teklehaymanot",
      "Tedila Gualu"
    )
    .required()
    .messages({
      "string.empty":
        "Kifle Ketema is required.",
      "any.only":
        "Please select a valid Kifle Ketema.",
      "any.required":
        "Kifle Ketema is required.",
    }),

  // ------------------------------------------
  // Kebele
  // ------------------------------------------
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

  // ------------------------------------------
  // Sefer
  // ------------------------------------------
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

  // ------------------------------------------
  // Profile Image
  // ------------------------------------------
  profile_image: Joi.string()
    .allow(null, "")
    .optional(),
}).options({
  abortEarly: false,
  allowUnknown: false,
});

// ==========================================
// Update Business Owner
// ==========================================
const businessOwnerUpdateValidation = Joi.object({
  business_name: Joi.string()
    .trim()
    .min(3)
    .max(100)
    .messages({
      "string.min":
        "Business name must be at least 3 characters.",
      "string.max":
        "Business name cannot exceed 100 characters.",
    }),

  owner_name: Joi.string()
    .trim()
    .min(3)
    .max(100)
    .pattern(/^[A-Za-zÀ-ÿ\s]+$/)
    .messages({
      "string.min":
        "Owner name must be at least 3 characters.",
      "string.max":
        "Owner name cannot exceed 100 characters.",
      "string.pattern.base":
        "Owner name can contain letters and spaces only.",
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
    .pattern(
      /^[A-Za-z0-9._%+-]+@gmail\.com$/i
    )
    .messages({
      "string.pattern.base":
        "Please enter a valid Gmail address.",
    }),

  business_type: Joi.string()
    .trim()
    .valid(
      "Cafe",
      "Resturant",
      "Hotel",
      "Jambo",
      "Gulit",
      "Government Office",
      "Kera",
      "Other"
    )
    .messages({
      "any.only":
        "Please select a valid business type.",
    }),

  business_description: Joi.when(
    "business_type",
    {
      is: "Other",

      then: Joi.string()
        .trim()
        .min(3)
        .max(100)
        .required()
        .messages({
          "string.min":
            "Business description must be at least 3 characters.",
          "string.max":
            "Business description cannot exceed 100 characters.",
          "string.empty":
            "Please describe your business.",
          "any.required":
            "Please describe your business.",
        }),

      otherwise: Joi.string()
        .trim()
        .allow("")
        .optional(),
    }
  ),

  kifle_ketema: Joi.string()
    .trim()
    .valid(
      "Abima",
      "Menkorer",
      "Nigus Teklehaymanot",
      "Tedila Gualu"
    )
    .messages({
      "any.only":
        "Please select a valid Kifle Ketema.",
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

  profile_image: Joi.string()
    .allow(null, "")
    .optional(),
}).options({
  abortEarly: false,
  allowUnknown: false,
});

module.exports = {
  businessOwnerRegisterValidation,
  businessOwnerUpdateValidation,
};