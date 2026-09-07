/**
 * Form Input Validation Helpers
 */

// Validate Ethiopian Phone Number (e.g., 0912345678 or +251912345678)
export const validatePhoneNumber = (phone) => {
  const phoneRegex = /^(?:\+251|0)9\d{8}$/;
  return phoneRegex.test(phone?.trim());
};

// Validate standard Email format
export const validateEmail = (email) => {
  if (!email) return true; // Email might be optional in some forms
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

// Validate password strength (Minimum 6 characters)
export const validatePassword = (password) => {
  return typeof password === 'string' && password.length >= 6;
};

// Validate Business On-Demand Collection Request form inputs
export const validateOnDemandRequest = (data) => {
  const errors = {};

  if (!data.collection_address || data.collection_address.trim() === '') {
    errors.collection_address = 'የመሰብሰቢያ ቦታ አድራሻ ማስገባት ያስፈልጋል (Collection address is required)';
  }
  if (!data.kebele || data.kebele.trim() === '') {
    errors.kebele = 'ቀበሌ መምረጥ ያስፈልጋል (Kebele is required)';
  }
  if (!data.preferred_collection_date) {
    errors.preferred_collection_date = 'የሚፈለግበትን ቀን መምረጥ ያስፈልጋል (Preferred date is required)';
  } else {
    const selectedDate = new Date(data.preferred_collection_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      errors.preferred_collection_date = 'የቀጠሮ ቀን ከአሁኑ ቀን በኋላ መሆን አለበት (Date cannot be in the past)';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Validate Feedback Submission form
export const validateFeedback = (comment, rating) => {
  const errors = {};

  if (!comment || comment.trim().length < 5) {
    errors.comment = 'እባክዎ ቢያንስ 5 ፊደላት ያለው አስተያየት ያስገቡ (Comment must be at least 5 characters)';
  }
  if (!rating || rating < 1 || rating > 5) {
    errors.rating = 'እባክዎ ከ 1 እስከ 5 ደረጃ ይስጡ (Rating must be between 1 and 5)';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};