const express = require("express");
const router = express.Router();

const residentController = require("../controllers/residentController");

// Middleware Imports
const authMiddleware = require("../middleware/authMiddleware");
const protect = authMiddleware.protect || authMiddleware;

const roleMiddlewareImport = require("../middleware/roleMiddleware");
const roleMiddleware = roleMiddlewareImport.roleMiddleware || roleMiddlewareImport;

const upload = require("../config/multer");

// =================================
// Public / Registration
// =================================
router.post(
    "/register",
    upload.single("profile_image"),
    residentController.createResident
);

// =================================
// Authenticated Profile
// =================================
router.get(
    "/dashboard",
    protect,
    residentController.getDashboard
);

router.get(
    "/profile",
    protect,
    residentController.getMyProfile
);
router.put(
    "/profile",
    protect,
    roleMiddleware("RESIDENT"),
    residentController.updateMyProfile
);
// =================================
// Admin Operations
// =================================
router.get(
    "/",
    protect,
    roleMiddleware("SystemAdmin", "MunicipalAdmin"),
    residentController.getAllResidents
);

// =================================
// Specific Resident Operations
// =================================
router.get(
    "/:id",
    protect,
    residentController.getResidentById
);

router.put(
    "/:id",
    protect,
    upload.single("profile_image"),
    residentController.updateResident
);

router.delete(
    "/:id",
    protect,
    roleMiddleware("MUNICIPAL_ADMIN"),
    residentController.deleteResident
);

module.exports = router;