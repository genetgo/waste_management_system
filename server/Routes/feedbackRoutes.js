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

// ==========================================
// Get All Feedback
// Municipal Admin / System Admin
// ==========================================
router.get(
    "/",
    protect,
    roleMiddleware("MUNICIPAL_ADMIN", "SYSTEM_ADMIN"),
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