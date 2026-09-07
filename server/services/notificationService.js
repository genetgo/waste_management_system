const db = require("../config/db");
const { getSocket } = require("../utils/socket");

// ==========================================
// Create Notification
// ==========================================
const createNotification = async (data) => {

    const query = `
        INSERT INTO notifications
        (
            user_id,
            user_role,
            title,
            message
        )
        VALUES ($1, $2, $3, $4)
        RETURNING *;
    `;

    const { rows } = await db.query(query, [
        data.user_id,
        data.user_role,
        data.title,
        data.message,
    ]);

    const notification = rows[0];

    // ==========================================
    // SOCKET NOTIFICATION
    // ==========================================

    const io = getSocket();

    if (!io) {
        console.log("❌ Socket.IO is not initialized");
        return notification;
    }

    const room = `${data.user_role}_${data.user_id}`;

    console.log("=================================");
    console.log("📤 SEND SOCKET ROOM:", room);

    const roomData = io.sockets.adapter.rooms.get(room);

    console.log("📦 ROOM DATA:", roomData);

    if (!roomData) {
        console.log("⚠️ USER IS NOT CONNECTED TO ROOM:", room);
    } else {
        console.log("✅ ROOM EXISTS:", room);

        io.to(room).emit(
            "newNotification",
            notification
        );

        console.log("✅ SOCKET NOTIFICATION SENT");
    }

    console.log("=================================");

    return notification;
};


// ==========================================
// Notify All Municipal Administrators
// ==========================================
const notifyMunicipalAdmins = async (
    title,
    message
) => {

    const query = `
        SELECT admin_id
        FROM municipal_administrators;
    `;

    const { rows } = await db.query(query);

    console.log(
        "🏢 MUNICIPAL ADMINS:",
        rows
    );

    if (rows.length === 0) {
        console.log(
            "⚠️ No municipal administrators found."
        );

        return false;
    }

    for (const admin of rows) {

        console.log(
            "📤 NOTIFY ADMIN:",
            admin.admin_id
        );

        await createNotification({
            user_id: admin.admin_id,
            user_role: "MUNICIPAL_ADMIN",
            title,
            message,
        });
    }

    console.log(
        "✅ Municipal admin notifications created."
    );

    return true;
};


// ==========================================
// Get Notifications
// ==========================================
const getNotifications = async (
    userId,
    userRole
) => {

    const result = await db.query(
        `
        SELECT *
        FROM notifications
        WHERE user_id = $1
        AND user_role = $2
        ORDER BY created_at DESC
        `,
        [
            userId,
            userRole,
        ]
    );

    return result.rows;
};


// ==========================================
// Get Notification By ID
// ==========================================
const getNotificationById = async (
    notificationId
) => {

    const { rows } = await db.query(
        `
        SELECT *
        FROM notifications
        WHERE notification_id = $1
        `,
        [notificationId]
    );

    return rows[0] || null;
};


// ==========================================
// Mark As Read
// ==========================================
const markAsRead = async (
    notificationId
) => {

    const { rows } = await db.query(
        `
        UPDATE notifications
        SET is_read = TRUE
        WHERE notification_id = $1
        RETURNING *;
        `,
        [notificationId]
    );

    return rows[0] || null;
};


// ==========================================
// Mark All As Read
// ==========================================
const markAllAsRead = async (
    userId,
    userRole
) => {

    const result = await db.query(
        `
        UPDATE notifications
        SET is_read = TRUE
        WHERE user_id = $1
        AND user_role = $2
        `,
        [
            userId,
            userRole,
        ]
    );

    return result.rowCount;
};


// ==========================================
// Count Unread
// ==========================================
const countUnread = async (
    userId,
    userRole
) => {

    const result = await db.query(
        `
        SELECT COUNT(*) AS total
        FROM notifications
        WHERE user_id = $1
        AND user_role = $2
        AND is_read = FALSE
        `,
        [
            userId,
            userRole,
        ]
    );

    return Number(
        result.rows[0].total
    );
};


// ==========================================
// Delete Notification
// ==========================================
const deleteNotification = async (
    notificationId
) => {

    const { rows } = await db.query(
        `
        DELETE FROM notifications
        WHERE notification_id = $1
        RETURNING *;
        `,
        [notificationId]
    );

    return rows[0] || null;
};


// ==========================================
// Delete All Notifications
// ==========================================
const deleteAllNotifications = async (
    userId,
    userRole
) => {

    const result = await db.query(
        `
        DELETE FROM notifications
        WHERE user_id = $1
        AND user_role = $2
        `,
        [
            userId,
            userRole,
        ]
    );

    return result.rowCount;
};


module.exports = {
    createNotification,
    notifyMunicipalAdmins,
    getNotifications,
    getNotificationById,
    markAsRead,
    markAllAsRead,
    countUnread,
    deleteNotification,
    deleteAllNotifications,
};