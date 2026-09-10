const express = require("express");
const router = express.Router();

const feedbackController = require("../controllers/feedbackController");
const protect = require("../middleware/authMiddleware");

const roleMiddlewareImport = require("../middleware/roleMiddleware");
const roleMiddleware =
    roleMiddlewareImport.roleMiddleware || roleMiddlewareImport;

// ==========================================
// Create Feedback
// Resident / Business Owner
// ==========================================
router.post(
    "/",
    protect,
    feedbackController.createFeedback
);
router.post(
    "/public",
    feedbackController.createPublicFeedback
);
// ==========================================
// Get All Feedback
// PUBLIC
// Home Page → Feedback
// ==========================================

router.get(
    "/",
    feedbackController.getFeedbacks
);

// ==========================================
// Get Feedback By ID
// ==========================================
router.get(
    "/:id",
    protect,
    feedbackController.getFeedbackById
);

// ==========================================
// Update Feedback
// ==========================================
router.put(
    "/:id",
    protect,
    feedbackController.updateFeedback
);

// ==========================================
// Delete Feedback
// ==========================================
router.delete(
    "/:id",
    protect,
    roleMiddleware("SYSTEM_ADMIN"),
    feedbackController.deleteFeedback
);

module.exports = router;