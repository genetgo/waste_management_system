
const notificationRepository =
    require("../repositories/notificationRepository");


// ============================================================
// GET ALL NOTIFICATIONS
// ============================================================
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


// ============================================================
// GET NOTIFICATION BY ID
// ============================================================
const getNotificationById = async (
    req,
    res,
    next
) => {

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


        // ====================================================
        // OWNERSHIP CHECK
        // ====================================================

        if (
            Number(notification.user_id) !==
                Number(req.user.id) ||

            notification.user_role !==
                req.user.role
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


// ============================================================
// GET NOTIFICATION DETAILS
// ============================================================
//
// This endpoint is used when the Municipal Admin clicks
// the "Details" button.
//
// Business Registration:
//
// Notification
//      ↓
// business_id
//      ↓
// business_owners
//
// On-Demand Request:
//
// Notification
//      ↓
// request_id
//      ↓
// on_demand_requests
//      ↓
// business_owners
//      ↓
// collection_teams
//      ↓
// collectors
//
// ============================================================
const getNotificationDetails = async (
    req,
    res,
    next
) => {

    try {

        const notificationId =
            req.params.id;


        console.log("=================================");
        console.log("GET NOTIFICATION DETAILS");
        console.log(
            "NOTIFICATION ID:",
            notificationId
        );
        console.log(
            "USER ID:",
            req.user.id
        );
        console.log(
            "USER ROLE:",
            req.user.role
        );
        console.log("=================================");


        // ====================================================
        // STEP 1: GET NOTIFICATION
        // ====================================================

        const notification =
            await notificationRepository.getNotificationById(
                notificationId
            );


        if (!notification) {

            return res.status(404).json({

                success: false,

                message: "Notification not found"

            });
        }


        // ====================================================
        // STEP 2: OWNERSHIP CHECK
        // ====================================================

        if (
            Number(notification.user_id) !==
                Number(req.user.id) ||

            notification.user_role !==
                req.user.role
        ) {

            return res.status(403).json({

                success: false,

                message: "Access denied"

            });
        }


        // ====================================================
        // STEP 3: GET RELATED DETAILS
        // ====================================================

        const result =
            await notificationRepository.getNotificationDetails(
                notificationId
            );


        if (!result) {

            return res.status(404).json({

                success: false,

                message:
                    "Notification details not found"

            });
        }


        // ====================================================
        // NO REFERENCE AVAILABLE
        // ====================================================

        if (
            !result.details &&
            (
                result.type ===
                    "GENERAL" ||

                result.type ===
                    "BUSINESS_REGISTRATION" ||

                result.type ===
                    "ON_DEMAND_REQUEST"
            )
        ) {

            return res.status(200).json({

                success: true,

                message:
                    "No detailed information is available for this notification.",

                data: result

            });
        }


        // ====================================================
        // SUCCESS
        // ====================================================

        res.status(200).json({

            success: true,

            data: result

        });


    } catch (error) {

        console.error(
            "Get Notification Details Error:",
            error
        );

        next(error);
    }
};


// ============================================================
// CREATE NOTIFICATION
// ============================================================
const createNotification = async (
    req,
    res,
    next
) => {

    try {

        const notification =
            await notificationRepository.createNotification(
                req.body
            );


        res.status(201).json({

            success: true,

            message:
                "Notification sent successfully",

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


// ============================================================
// GET UNREAD NOTIFICATION COUNT
// ============================================================
const getUnreadCount = async (
    req,
    res,
    next
) => {

    try {

        console.log("=================================");
        console.log("GET UNREAD COUNT");
        console.log(
            "USER ID:",
            req.user.id
        );
        console.log(
            "USER ROLE:",
            req.user.role
        );
        console.log("=================================");


        /*
         * Repository function:
         *
         * getUnreadCount(userId, userRole)
         */

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


// ============================================================
// MARK NOTIFICATION AS READ
// ============================================================
const markAsRead = async (
    req,
    res,
    next
) => {

    try {

        const notification =
            await notificationRepository.getNotificationById(
                req.params.id
            );


        if (!notification) {

            return res.status(404).json({

                success: false,

                message:
                    "Notification not found"

            });
        }


        // ====================================================
        // OWNERSHIP CHECK
        // ====================================================

        if (
            Number(notification.user_id) !==
                Number(req.user.id) ||

            notification.user_role !==
                req.user.role
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "Access denied"

            });
        }


        const updated =
            await notificationRepository.markAsRead(
                req.params.id
            );


        res.status(200).json({

            success: true,

            message:
                "Notification marked as read",

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


// ============================================================
// MARK ALL NOTIFICATIONS AS READ
// ============================================================
const markAllAsRead = async (
    req,
    res,
    next
) => {

    try {

        console.log("=================================");
        console.log(
            "MARK ALL NOTIFICATIONS AS READ"
        );
        console.log(
            "USER ID:",
            req.user.id
        );
        console.log(
            "USER ROLE:",
            req.user.role
        );
        console.log("=================================");


        const updatedCount =
            await notificationRepository.markAllAsRead(
                req.user.id,
                req.user.role
            );


        console.log(
            "NOTIFICATIONS UPDATED:",
            updatedCount
        );


        res.status(200).json({

            success: true,

            message:
                "All notifications marked as read",

            data: {

                updated:
                    updatedCount

            }

        });


    } catch (error) {

        console.error(
            "Mark All Notifications Error:",
            error
        );

        next(error);
    }
};


// ============================================================
// DELETE NOTIFICATION
// ============================================================
const deleteNotification = async (
    req,
    res,
    next
) => {

    try {

        const notification =
            await notificationRepository.getNotificationById(
                req.params.id
            );


        if (!notification) {

            return res.status(404).json({

                success: false,

                message:
                    "Notification not found"

            });
        }


        // ====================================================
        // OWNERSHIP CHECK
        // ====================================================

        if (
            Number(notification.user_id) !==
                Number(req.user.id) ||

            notification.user_role !==
                req.user.role
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "Access denied"

            });
        }


        await notificationRepository.deleteNotification(
            req.params.id
        );


        res.status(200).json({

            success: true,

            message:
                "Notification deleted successfully"

        });


    } catch (error) {

        console.error(
            "Delete Notification Error:",
            error
        );

        next(error);
    }
};


// ============================================================
// DELETE ALL NOTIFICATIONS
// ============================================================
const deleteAllNotifications = async (
    req,
    res,
    next
) => {

    try {

        console.log("=================================");
        console.log(
            "DELETE ALL NOTIFICATIONS"
        );
        console.log(
            "USER ID:",
            req.user.id
        );
        console.log(
            "USER ROLE:",
            req.user.role
        );
        console.log("=================================");


        const deletedCount =
            await notificationRepository.deleteAllNotifications(
                req.user.id,
                req.user.role
            );


        console.log(
            "NOTIFICATIONS DELETED:",
            deletedCount
        );


        res.status(200).json({

            success: true,

            message:
                "All notifications deleted successfully",

            data: {

                deleted:
                    deletedCount

            }

        });


    } catch (error) {

        console.error(
            "Delete All Notifications Error:",
            error
        );

        next(error);
    }
};


// ============================================================
// EXPORTS
// ============================================================
module.exports = {

    getAllNotifications,

    getNotificationById,

    getNotificationDetails,

    createNotification,

    getUnreadCount,

    markAsRead,

    markAllAsRead,

    deleteNotification,

    deleteAllNotifications

};
