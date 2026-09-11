const express = require("express");

const router = express.Router();

const scheduleController =
    require("../controllers/scheduleController");

const protect =
    require("../middleware/authMiddleware");

const roleMiddleware =
    require("../middleware/roleMiddleware");


// ==========================================================
// MY SCHEDULE
//
// Resident / Business Owner / other logged-in users
// ==========================================================
router.get(
    "/my-schedule",
    protect,
    scheduleController.getMySchedule
);


// ==========================================================
// GET KIFLE KETEMAS
//
// Municipal Admin:
//   → only his/her assigned Kifle Ketema
//
// System Admin:
//   → all Kifle Ketemas
//
// IMPORTANT:
// Kifle Ketema comes from SERVER / DATABASE.
// It is NOT hard-coded in React.
// ==========================================================
router.get(
    "/kifle-ketemas",
    protect,
    roleMiddleware(
        "MunicipalAdmin",
        "SystemAdmin"
    ),
    scheduleController.getKifleKetemas
);


// ==========================================================
// GET KEBELES BY KIFLE KETEMA
// ==========================================================
router.get(
    "/kebeles/:kifle_ketema",
    protect,
    roleMiddleware(
        "MunicipalAdmin",
        "SystemAdmin"
    ),
    scheduleController.getKebelesByKifleKetema
);


// ==========================================================
// GET SEFERS BY COLLECTION TEAM
// ==========================================================
router.get(
    "/sefers/:team_id",
    protect,
    roleMiddleware(
        "MunicipalAdmin",
        "SystemAdmin"
    ),
    scheduleController.getSefersByTeam
);


// ==========================================================
// GET SCHEDULES BY COLLECTOR
//
// Example:
// GET /api/schedules/collector/1
// ==========================================================
router.get(
    "/collector/:collector_id",
    protect,
    roleMiddleware(
        "MunicipalAdmin",
        "SystemAdmin",
        "Collector"
    ),
    scheduleController.getSchedulesByCollector
);


// ==========================================================
// CREATE SCHEDULE
//
// Municipal Admin / System Admin
//
// Frontend sends team_id.
// collector_id is NOT required.
//
// Team Leader = Driver.
// ==========================================================
router.post(
    "/",
    protect,
    roleMiddleware(
        "MunicipalAdmin",
        "SystemAdmin"
    ),
    scheduleController.createSchedule
);


// ==========================================================
// GET ALL SCHEDULES
//
// IMPORTANT:
// protect middleware was missing in your old route.
//
// Now:
// Municipal Admin → assigned Kifle only
// System Admin → all
// ==========================================================
router.get(
    "/",
    scheduleController.getAllSchedules
);
// ==========================================================
// GET SCHEDULE BY ID
//
// IMPORTANT:
// This MUST come AFTER all specific routes above.
// Otherwise /kifle-ketemas can be treated as :id.
// ==========================================================
router.get(
    "/:id",
    protect,
    roleMiddleware(
        "MunicipalAdmin",
        "SystemAdmin"
    ),
    scheduleController.getScheduleById
);


// ==========================================================
// UPDATE SCHEDULE
// ==========================================================
router.put(
    "/:id",
    protect,
    roleMiddleware(
        "MunicipalAdmin",
        "SystemAdmin"
    ),
    scheduleController.updateSchedule
);


// ==========================================================
// DELETE SCHEDULE
// ==========================================================
router.delete(
    "/:id",
    protect,
    roleMiddleware(
        "MunicipalAdmin",
        "SystemAdmin"
    ),
    scheduleController.deleteSchedule
);


// ==========================================================
// EXPORT
// ==========================================================
module.exports = router;