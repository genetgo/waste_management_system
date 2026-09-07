const express = require("express");
const router = express.Router();

const municipalAdminController = require("../controllers/municipalAdminController");
const protect = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const upload = require("../config/multer");

// ==============================
// Register Municipal Admin
// ==============================
router.post(
  "/register",
  protect,
  roleMiddleware("SystemAdmin"),
  municipalAdminController.registerMunicipalAdmin
);

// GET /municipal-admin/dashboard
// ==============================
router.get(
  "/dashboard",
  protect,
  municipalAdminController.getDashboard
);

// ==============================
// Logged-in Municipal Admin Profile
// ==============================
router.get(
  "/profile",
  protect,
  municipalAdminController.getMyProfile
);

// ==============================
// Update Logged-in Profile
// ==============================
router.put(
  "/profile",
  protect,
  upload.single("profile_image"),
  municipalAdminController.updateMunicipalAdmin
);

// ==============================
// Get All Municipal Admins
// ==============================
router.get(
  "/",
  protect,
  roleMiddleware("SystemAdmin"),
  municipalAdminController.getAllMunicipalAdmins
);

// ==============================
// Get Municipal Admin By ID
// ==============================
router.get(
  "/:id",
  protect,
  municipalAdminController.getMunicipalAdminById
);

// ==============================
// Update Municipal Admin By ID
// ==============================
router.put(
  "/:id",
  protect,
  upload.single("profile_image"),
  municipalAdminController.updateMunicipalAdmin
);

// ==============================
// Delete Municipal Admin
// ==============================
router.delete(
  "/:id",
  protect,
  roleMiddleware("SystemAdmin"),
  municipalAdminController.deleteMunicipalAdmin
);

module.exports = router;