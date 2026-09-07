const express = require("express");
const router = express.Router();

const reportController = require("../controllers/reportController");
const protect = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// =====================================================
// CREATE REPORT
// POST /api/reports/
// =====================================================
router.post(
    "/",
    protect,
    roleMiddleware("MunicipalAdmin", "SystemAdmin"),
    reportController.createReport
);

// =====================================================
// GET ALL REPORTS
// GET /api/reports/
// =====================================================
router.get(
    "/",
    protect,
    roleMiddleware("MunicipalAdmin", "SystemAdmin"),
    reportController.getAllReports
);

// =====================================================
// MUNICIPAL REPORTS
// GET /api/reports/municipal
//
// IMPORTANT:
// This MUST be BEFORE /:id
// =====================================================
router.get(
    "/municipal",
    protect,
    roleMiddleware("MunicipalAdmin", "SystemAdmin"),
    reportController.getMunicipalReports
);

// =====================================================
// REPORT STATISTICS
// GET /api/reports/statistics/all
//
// IMPORTANT:
// This MUST ALSO be BEFORE /:id
// =====================================================
router.get(
    "/statistics/all",
    protect,
    roleMiddleware("MunicipalAdmin", "SystemAdmin"),
    reportController.reportStatistics
);

// =====================================================
// GET REPORT BY ID
// GET /api/reports/:id
// =====================================================
router.get(
    "/:id",
    protect,
    roleMiddleware("MunicipalAdmin", "SystemAdmin"),
    reportController.getReportById
);

// =====================================================
// UPDATE REPORT
// PUT /api/reports/:id
// =====================================================
router.put(
    "/:id",
    protect,
    roleMiddleware("SystemAdmin"),
    reportController.updateReport
);

// =====================================================
// DELETE REPORT
// DELETE /api/reports/:id
// =====================================================
router.delete(
    "/:id",
    protect,
    roleMiddleware("SystemAdmin"),
    reportController.deleteReport
);

module.exports = router;