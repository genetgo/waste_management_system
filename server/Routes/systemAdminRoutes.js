const express = require("express");
const router = express.Router();

const systemAdminController = require("../controllers/systemAdminController");
const protect = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const upload = require("../config/multer");

// =====================================
// PUBLIC
// =====================================

router.post(
    "/login",
    systemAdminController.login
);


// =====================================
// DASHBOARD
// =====================================

router.get(
    "/dashboard",
    protect,
    roleMiddleware("SYSTEM_ADMIN"),
    systemAdminController.getDashboard
);


// =====================================
// MY PROFILE
// =====================================

router.get(
    "/profile",
    protect,
    roleMiddleware("SYSTEM_ADMIN"),
    systemAdminController.getMyProfile
);

router.put(
    "/profile",
    protect,
    roleMiddleware("SYSTEM_ADMIN"),
    systemAdminController.updateMyProfile
);


// =====================================
// CHANGE PASSWORD
// =====================================

router.put(
    "/change-password",
    protect,
    roleMiddleware("SYSTEM_ADMIN"),
    systemAdminController.changePassword
);


// =====================================
// ALL USERS
// =====================================

router.get(
    "/users",
    protect,
    roleMiddleware("SYSTEM_ADMIN"),
    systemAdminController.getAllUsers
);

router.get(
    "/users/:id",
    protect,
    roleMiddleware("SYSTEM_ADMIN"),
    systemAdminController.getUserById
);

router.put(
    "/users/:id",
    protect,
    roleMiddleware("SYSTEM_ADMIN"),
    systemAdminController.updateUser
);

router.delete(
    "/users/:id",
    protect,
    roleMiddleware("SYSTEM_ADMIN"),
    systemAdminController.deleteUser
);


// =====================================
// EXPORT USERS
// =====================================

router.get(
    "/users/export/pdf",
    protect,
    roleMiddleware("SYSTEM_ADMIN"),
    systemAdminController.exportUsersPDF
);

router.get(
    "/users/export/excel",
    protect,
    roleMiddleware("SYSTEM_ADMIN"),
    systemAdminController.exportUsersExcel
);


// =====================================
// STAFF
// =====================================

router.post(
    "/staff",
    protect,
    roleMiddleware("SYSTEM_ADMIN"),
    systemAdminController.createStaff
);

router.get(
    "/staff",
    protect,
    roleMiddleware("SYSTEM_ADMIN"),
    systemAdminController.getStaffAccounts
);

router.put(
    "/staff/:id",
    protect,
    roleMiddleware("SYSTEM_ADMIN"),
    systemAdminController.updateStaff
);

router.delete(
    "/staff/:id",
    protect,
    roleMiddleware("SYSTEM_ADMIN"),
    systemAdminController.deleteStaff
);


// =====================================
// ROLES
// =====================================

router.get(
    "/roles",
    protect,
    roleMiddleware("SYSTEM_ADMIN"),
    systemAdminController.getRoles
);

router.post(
    "/roles",
    protect,
    roleMiddleware("SYSTEM_ADMIN"),
    systemAdminController.createRole
);

router.put(
    "/roles/:id",
    protect,
    roleMiddleware("SYSTEM_ADMIN"),
    systemAdminController.updateRole
);

router.delete(
    "/roles/:id",
    protect,
    roleMiddleware("SYSTEM_ADMIN"),
    systemAdminController.deleteRole
);


// =====================================
// BACKUPS
// =====================================

router.get(
    "/backups",
    protect,
    roleMiddleware("SYSTEM_ADMIN"),
    systemAdminController.getBackups
);

router.post(
    "/backup",
    protect,
    roleMiddleware("SYSTEM_ADMIN"),
    systemAdminController.createBackup
);

router.post(
    "/backups/:id/restore",
    protect,
    roleMiddleware("SYSTEM_ADMIN"),
    systemAdminController.restoreBackup
);

router.delete(
    "/backups/:id",
    protect,
    roleMiddleware("SYSTEM_ADMIN"),
    systemAdminController.deleteBackup
);


// =====================================
// SYSTEM ADMIN CRUD
// =====================================

router.post(
    "/",
    protect,
    roleMiddleware("SYSTEM_ADMIN"),
    systemAdminController.createSystemAdmin
);

router.get(
    "/",
    protect,
    roleMiddleware("SYSTEM_ADMIN"),
    systemAdminController.getAllSystemAdmins
);

router.get(
    "/:id",
    protect,
    roleMiddleware("SYSTEM_ADMIN"),
    systemAdminController.getSystemAdminById
);

router.put(
    "/:id",
    protect,
    roleMiddleware("SYSTEM_ADMIN"),
    upload.single("profile_image"),
    systemAdminController.updateSystemAdmin
);

router.delete(
    "/:id",
    protect,
    roleMiddleware("SYSTEM_ADMIN"),
    systemAdminController.deleteSystemAdmin
);


module.exports = router;