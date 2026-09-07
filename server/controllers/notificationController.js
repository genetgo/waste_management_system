const notificationRepository = require("../repositories/notificationRepository");

// ==========================================
// Get All Notifications
// ==========================================
const getAllNotifications = async (req, res, next) => {
    try {

        console.log("=================================");
        console.log("GET NOTIFICATIONS");
        console.log("USER FROM TOKEN:", req.user);
        console.log("USER ID:", req.user.id);
        console.log("USER ROLE:", req.user.role);
        console.log("=================================");

        const notifications =
            await notificationRepository.getNotifications(
                req.user.id,
                req.user.role
            );

        console.log(
            "NOTIFICATIONS FOUND:",
            notifications
        );

        res.status(200).json({
            success: true,
            data: notifications
        });

    } catch (error) {

        console.error(
            "Get All Notifications Error:",
            error
        );

        next(error);
    }
};


// ==========================================
// Get Notification By ID
// ==========================================
const getNotificationById = async (req, res, next) => {
    try {

        const notification =
            await notificationRepository.getNotificationById(
                req.params.id
            );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found"
            });
        }

        // ==========================================
        // OWNERSHIP CHECK
        // ==========================================

        if (
            Number(notification.user_id) !== Number(req.user.id) ||
            notification.user_role !== req.user.role
        ) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        res.status(200).json({
            success: true,
            data: notification
        });

    } catch (error) {

        console.error(
            "Get Notification By ID Error:",
            error
        );

        next(error);
    }
};


// ==========================================
// Create Notification
// ==========================================
const createNotification = async (req, res, next) => {
    try {

        const notification =
            await notificationRepository.createNotification(
                req.body
            );

        res.status(201).json({

            success: true,

            message: "Notification sent successfully",

            data: notification

        });

    } catch (error) {

        console.error(
            "Create Notification Error:",
            error
        );

        next(error);
    }
};


// ==========================================
// Get Unread Notification Count
// ==========================================
const getUnreadCount = async (req, res, next) => {
    try {

        console.log("=================================");
        console.log("GET UNREAD COUNT");
        console.log("USER ID:", req.user.id);
        console.log("USER ROLE:", req.user.role);
        console.log("=================================");

        // IMPORTANT:
        // Repository expects:
        // countUnread(userId, userRole)

         const unread =
            await notificationRepository.getUnreadCount(
                req.user.id,
                req.user.role
            );

        console.log(
            "UNREAD COUNT:",
            unread
        );

        res.status(200).json({

            success: true,

            data: {
                unread
            }

        });

    } catch (error) {

        console.error(
            "Get Unread Count Error:",
            error
        );

        next(error);
    }
};


// ==========================================
// Mark Notification As Read
// ==========================================
const markAsRead = async (req, res, next) => {
    try {

        const notification =
            await notificationRepository.getNotificationById(
                req.params.id
            );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found"
            });
        }

        // ==========================================
        // OWNERSHIP CHECK
        // ==========================================

        if (
            Number(notification.user_id) !== Number(req.user.id) ||
            notification.user_role !== req.user.role
        ) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        const updated =
            await notificationRepository.markAsRead(
                req.params.id
            );

        res.status(200).json({

            success: true,

            message: "Notification marked as read",

            data: updated

        });

    } catch (error) {

        console.error(
            "Mark Notification As Read Error:",
            error
        );

        next(error);
    }
};


// ==========================================
// Mark All Notifications As Read
// ==========================================
const markAllAsRead = async (req, res, next) => {
    try {

        console.log("=================================");
        console.log("MARK ALL NOTIFICATIONS AS READ");
        console.log("USER ID:", req.user.id);
        console.log("USER ROLE:", req.user.role);
        console.log("=================================");

        await notificationRepository.markAllAsRead(
            req.user.id,
            req.user.role
        );

        res.status(200).json({

            success: true,

            message: "All notifications marked as read"

        });

    } catch (error) {

        console.error(
            "Mark All Notifications Error:",
            error
        );

        next(error);
    }
};


// ==========================================
// Delete Notification
// ==========================================
const deleteNotification = async (req, res, next) => {
    try {

        const notification =
            await notificationRepository.getNotificationById(
                req.params.id
            );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found"
            });
        }

        // ==========================================
        // OWNERSHIP CHECK
        // ==========================================

        if (
            Number(notification.user_id) !== Number(req.user.id) ||
            notification.user_role !== req.user.role
        ) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        await notificationRepository.deleteNotification(
            req.params.id
        );

        res.status(200).json({

            success: true,

            message: "Notification deleted successfully"

        });

    } catch (error) {

        console.error(
            "Delete Notification Error:",
            error
        );

        next(error);
    }
};


// ==========================================
// Delete All Notifications
// ==========================================
const deleteAllNotifications = async (req, res, next) => {
    try {

        console.log("=================================");
        console.log("DELETE ALL NOTIFICATIONS");
        console.log("USER ID:", req.user.id);
        console.log("USER ROLE:", req.user.role);
        console.log("=================================");

        // IMPORTANT:
        // Repository expects:
        // deleteAllNotifications(userId, userRole)

        await notificationRepository.deleteAllNotifications(
            req.user.id,
            req.user.role
        );

        res.status(200).json({

            success: true,

            message: "All notifications deleted successfully"

        });

    } catch (error) {

        console.error(
            "Delete All Notifications Error:",
            error
        );

        next(error);
    }
};


// ==========================================
// EXPORT
// ==========================================
module.exports = {

    getAllNotifications,

    getNotificationById,

    createNotification,

    getUnreadCount,

    markAsRead,

    markAllAsRead,

    deleteNotification,

    deleteAllNotifications

};