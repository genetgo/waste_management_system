const express = require("express");
const router = express.Router();

const collectorController = require("../controllers/collectorController");

const protect = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const upload = require("../config/multer");

// ==========================================
// Collector Dashboard
// ==========================================

router.get(
    "/dashboard",
    protect,
    roleMiddleware("COLLECTOR"),
    collectorController.getDashboard
);

// ==========================================
// Assigned Requests
// ==========================================

router.get(
    "/assigned-requests",
    protect,
    roleMiddleware("COLLECTOR"),
    collectorController.getAssignedRequests
);

// ==========================================
// Collector Profile
// ==========================================

router.get(
    "/profile",
    protect,
    roleMiddleware("COLLECTOR"),
    collectorController.getProfile
);

router.put(
    "/profile",
    protect,
    roleMiddleware("COLLECTOR"),
    collectorController.updateMyProfile
);

router.put(
    "/change-password",
    protect,
    roleMiddleware("COLLECTOR"),
    collectorController.changePassword
);

// ==========================================
// Collector My Schedules
// IMPORTANT: MUST BE BEFORE /:id
// ==========================================

router.get(
    "/my-schedules",
    protect,
    roleMiddleware("COLLECTOR"),
    collectorController.getCollectorSchedules
);

// ==========================================
// Collector Tasks
// ==========================================

router.get(
    "/tasks",
    protect,
    roleMiddleware("COLLECTOR"),
    collectorController.getCollectorTasks
);

// ==========================================
// Register Collector
// ==========================================

router.post(
    "/register",
    protect,
    roleMiddleware("SYSTEM_ADMIN", "MUNICIPAL_ADMIN"),
    upload.single("profile_image"),
    collectorController.registerCollector
);

// ==========================================
// Search Collectors
// ==========================================

router.get(
    "/search",
    protect,
    collectorController.searchCollectors
);

// ==========================================
// Get Active Collectors For Schedule
// ==========================================

router.get(
    "/schedule-select",
    protect,
    roleMiddleware("MUNICIPAL_ADMIN", "SYSTEM_ADMIN"),
    collectorController.getActiveCollectorsForSchedule
);

// ==========================================
// Update Request Status
// ==========================================

router.patch(
    "/requests/:id/status",
    protect,
    roleMiddleware("COLLECTOR"),
    collectorController.updateRequestStatus
);

// ==========================================
// Start Collection
// Assigned -> In Progress
// ==========================================

router.patch(
    "/requests/:id/start",
    protect,
    roleMiddleware("COLLECTOR"),
    collectorController.startCollection
);

// ==========================================
// Complete Collection
// In Progress -> Collected
// ==========================================

router.patch(
    "/requests/:id/collect",
    protect,
    roleMiddleware("COLLECTOR"),
    collectorController.completeCollection
);

// ==========================================
// Get All Collectors
// ==========================================

router.get(
    "/",
    protect,
    collectorController.getAllCollectors
);

// ==========================================
// Update Collector
// ==========================================

router.put(
    "/:id",
    protect,
    roleMiddleware("SYSTEM_ADMIN", "MUNICIPAL_ADMIN"),
    upload.single("profile_image"),
    collectorController.updateCollector
);

// ==========================================
// Activate / Deactivate Collector
// ==========================================

router.patch(
    "/:id/status",
    protect,
    roleMiddleware("SYSTEM_ADMIN", "MUNICIPAL_ADMIN"),
    collectorController.updateCollectorStatus
);

// ==========================================
// Delete Collector
// ==========================================

router.delete(
    "/:id",
    protect,
    roleMiddleware("MUNICIPAL_ADMIN"),
    collectorController.deleteCollector
);

// ==========================================
// Get Collector By ID
// IMPORTANT: ALWAYS LAST
// ==========================================

router.get(
    "/:id",
    protect,
    roleMiddleware("COLLECTOR"),
    collectorController.getCollectorById
);

module.exports = router;