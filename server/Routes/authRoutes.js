const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const protect = require("../middleware/authMiddleware");

// ======================================================
// AUTHENTICATION
// ======================================================

// Login
router.post(
    "/login",
    authController.login
);

// Logout
router.post(
    "/logout",
    protect,
    authController.logout
);


// ======================================================
// REGISTRATION
// ======================================================

// Resident Self Registration
router.post(
    "/register/resident",
    authController.registerResident
);

// Business Owner Self Registration
router.post(
    "/register/business",
    authController.registerBusinessOwner
);

// Collector Registration
router.post(
    "/register/collector",
    protect,
    authController.registerCollector
);

// Municipal Admin Registration
router.post(
    "/register/municipal-admin",
    protect,
    authController.registerMunicipalAdmin
);


// ======================================================
// PASSWORD MANAGEMENT
// ======================================================

// Change Password
router.put(
    "/change-password",
    protect,
    authController.changePassword
);

// Forgot Password
router.post(
    "/forgot-password",
    authController.forgotPassword
);

// Reset Password
router.post(
    "/reset-password",
    authController.resetPassword
);


// ======================================================
// USER PROFILE
// ======================================================

// Get Logged-in User Profile
router.get(
    "/profile",
    protect,
    authController.getProfile
);

// Update Logged-in User Profile
router.put(
    "/profile",
    protect,
    authController.updateProfile
);


module.exports = router;