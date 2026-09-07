const express = require("express");
const router = express.Router();

const notificationController =
    require("../controllers/notificationController");

const protect  =
    require("../middleware/authMiddleware");


// Get my notifications
router.get(
    "/",
    protect,
    notificationController.getAllNotifications
);


// Get unread count
router.get(
    "/unread-count",
    protect,
    notificationController.getUnreadCount
);


// Mark all read
router.patch(
    "/mark-all-read",
    protect,
    notificationController.markAllAsRead
);


// Delete all
router.delete(
    "/delete-all",
    protect,
    notificationController.deleteAllNotifications
);


// Get by id
router.get(
    "/:id",
    protect,
    notificationController.getNotificationById
);


// Mark one read
router.patch(
    "/:id/read",
    protect,
    notificationController.markAsRead
);


// Delete one
router.delete(
    "/:id",
    protect,
    notificationController.deleteNotification
);


module.exports = router;