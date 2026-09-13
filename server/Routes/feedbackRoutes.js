
const express = require("express");

const router = express.Router();

const feedbackController =
    require("../controllers/feedbackController");


// ==========================================
// AUTH MIDDLEWARE
// ==========================================

const authMiddlewareImport =
    require("../middleware/authMiddleware");

const protect =
    authMiddlewareImport.protect ||
    authMiddlewareImport;


// ==========================================
// ROLE MIDDLEWARE
// ==========================================

const roleMiddlewareImport =
    require("../middleware/roleMiddleware");

const roleMiddleware =
    roleMiddlewareImport.roleMiddleware ||
    roleMiddlewareImport;


// ==========================================
// CREATE BUSINESS FEEDBACK
//
// Business Owner
// Login Required
// ==========================================

router.post(
    "/",
    protect,
    feedbackController.createFeedback
);


// ==========================================
// CREATE PUBLIC FEEDBACK
//
// Public User
// No Login Required
// ==========================================

router.post(
    "/public",
    feedbackController.createPublicFeedback
);


// ==========================================
// GET PUBLIC FEEDBACK BY ID
//
// Public User
// No Login Required
//
// Used to check:
// Pending -> Viewed
//
// IMPORTANT:
// MUST COME BEFORE /:id
// ==========================================

router.get(
    "/public/:id",
    feedbackController.getPublicFeedbackById
);


// ==========================================
// GET ALL FEEDBACK
//
// Municipal Admin
// System Admin
//
// Login + Role Required
// ==========================================

router.get(
    "/",
    protect,
    roleMiddleware(
        "MunicipalAdmin",
        "SystemAdmin"
    ),
    feedbackController.getFeedbacks
);


// ==========================================
// MARK FEEDBACK AS VIEWED
//
// Municipal Admin
// System Admin
//
// Pending -> Viewed
// Already Viewed -> stays Viewed
//
// IMPORTANT:
// MUST COME BEFORE /:id
// ==========================================

router.patch(
    "/:id/view",
    protect,
    roleMiddleware(
        "MunicipalAdmin",
        "SystemAdmin"
    ),
    feedbackController.markFeedbackAsViewed
);


// ==========================================
// GET FEEDBACK BY ID
//
// Authenticated users
// ==========================================

router.get(
    "/:id",
    protect,
    feedbackController.getFeedbackById
);


// ==========================================
// UPDATE FEEDBACK
//
// Municipal Admin
// System Admin
// ==========================================

router.put(
    "/:id",
    protect,
    roleMiddleware(
        "MunicipalAdmin",
        "SystemAdmin"
    ),
    feedbackController.updateFeedback
);


// ==========================================
// DELETE FEEDBACK
//
// Municipal Admin
// System Admin
// ==========================================

router.delete(
    "/:id",
    protect,
    roleMiddleware(
        "MunicipalAdmin",
        "SystemAdmin"
    ),
    feedbackController.deleteFeedback
);


// ==========================================
// EXPORT
// ==========================================

module.exports = router;
