const express = require("express");

const router = express.Router();

const notificationController =
    require("../controllers/notificationController");

const protect =
    require("../middleware/authMiddleware");


// ============================================================
// GET MY NOTIFICATIONS
// GET /api/notifications
// ============================================================
router.get(
    "/",
    protect,
    notificationController.getAllNotifications
);


// ============================================================
// GET UNREAD COUNT
// GET /api/notifications/unread-count
// ============================================================
router.get(
    "/unread-count",
    protect,
    notificationController.getUnreadCount
);


// ============================================================
// MARK ALL NOTIFICATIONS AS READ
// PATCH /api/notifications/mark-all-read
// ============================================================
router.patch(
    "/mark-all-read",
    protect,
    notificationController.markAllAsRead
);


// ============================================================
// DELETE ALL NOTIFICATIONS
// DELETE /api/notifications/delete-all
// ============================================================
router.delete(
    "/delete-all",
    protect,
    notificationController.deleteAllNotifications
);


// ============================================================
// GET NOTIFICATION DETAILS
// GET /api/notifications/:id/details
// ============================================================
router.get(
    "/:id/details",
    protect,
    notificationController.getNotificationDetails
);


// ============================================================
// MARK ONE NOTIFICATION AS READ
// PATCH /api/notifications/:id/read
// ============================================================
router.patch(
    "/:id/read",
    protect,
    notificationController.markAsRead
);


// ============================================================
// DELETE ONE NOTIFICATION
// DELETE /api/notifications/:id
// ============================================================
router.delete(
    "/:id",
    protect,
    notificationController.deleteNotification
);


// ============================================================
// GET NOTIFICATION BY ID
// GET /api/notifications/:id
// ============================================================
router.get(
    "/:id",
    protect,
    notificationController.getNotificationById
);


module.exports = router;