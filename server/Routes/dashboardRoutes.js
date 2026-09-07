// routes/dashboardRoutes.js

const express = require("express");
const router = express.Router();

const dashboardController = require("../controllers/dashboardController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// All dashboard routes require login
router.use(authMiddleware);

// System Administrator
router.get(
    "/municipal",
    roleMiddleware("MUNICIPAL_ADMIN"),
    dashboardController.getMunicipalDashboard
);

router.get(
    "/system",
    roleMiddleware("SYSTEM_ADMIN"),
    dashboardController.getSystemDashboard
);

router.get(
    "/collector",
    roleMiddleware("COLLECTOR"),
    dashboardController.getCollectorDashboard
);

router.get(
    "/resident",
    roleMiddleware("RESIDENT"),
    dashboardController.getResidentDashboard
);

router.get(
    "/business",
    roleMiddleware("BUSINESS_OWNER"),
    dashboardController.getBusinessDashboard
);

module.exports = router;