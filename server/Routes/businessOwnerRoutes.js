const express = require("express");
const router = express.Router();

const businessOwnerController = require("../controllers/businessOwnerController");
const protect  = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const upload = require("../config/multer");

// ==========================================
// Public Routes
// ==========================================

// Register Business Owner
router.post(
    "/register",
    businessOwnerController.registerBusinessOwner
);

// ==========================================
// Logged-in Business Owner Routes
// (These MUST come BEFORE "/:id")
// ==========================================

// Dashboard
router.get(
    "/dashboard",
    protect,
    businessOwnerController.getDashboard
);

// My Profile
router.get(
    "/profile",
    protect,
    businessOwnerController.getMyProfile
);

// Update My Profile
router.put(
    "/profile",
    protect,
    upload.single("profile_image"),
    businessOwnerController.updateMyProfile
);

// My Requests
router.get(
    "/requests",
    protect,
    businessOwnerController.getMyRequests
);

// ==========================================
// Admin Routes
// ==========================================

// Get All Business Owners
router.get(
    "/",
    protect,
    roleMiddleware("SystemAdmin", "MunicipalAdmin"),
    businessOwnerController.getAllBusinessOwners
);

// ==========================================
// Routes By ID
// ==========================================

// Get Business Owner By ID
router.get(
    "/:id",
    protect,
    businessOwnerController.getBusinessOwnerById
);

// Update Business Owner By ID
router.put(
    "/:id",
    protect,
    upload.single("profile_image"),
    businessOwnerController.updateBusinessOwner
);

// Delete Business Owner
router.delete(
    "/:id",
    protect,
    roleMiddleware("MUNICIPAL_ADMIN" ),
    businessOwnerController.deleteBusinessOwner
);

module.exports = router;