const express = require("express");
const router = express.Router();

const scheduleController = require("../controllers/scheduleController");

const protect = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// ==========================================
// Logged-in User Schedule
// ==========================================
router.get(
    "/my-schedule",
    protect,
    scheduleController.getMySchedule
);

// ==========================================
// Create Schedule
// ==========================================
router.post(
    "/",
    protect,
    roleMiddleware("MunicipalAdmin", "SystemAdmin"),
    scheduleController.createSchedule
);

// ==========================================
// Get All Schedules
// ==========================================
router.get(
    "/",
    scheduleController.getAllSchedules
);
// ==========================================
// Get Schedule By ID
// ==========================================
router.get(
    "/:id",
    protect,
    scheduleController.getScheduleById
);

// ==========================================
// Update Schedule
// ==========================================
router.put(
    "/:id",
    protect,
    roleMiddleware("MunicipalAdmin", "SystemAdmin"),
    scheduleController.updateSchedule
);

// ==========================================
// Delete Schedule
// ==========================================
router.delete(
    "/:id",
    protect,
    roleMiddleware("MunicipalAdmin", "SystemAdmin"),
    scheduleController.deleteSchedule
);

module.exports = router;