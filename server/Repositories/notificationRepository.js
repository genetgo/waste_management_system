const db = require("../config/db");

const { getSocket } = require("../utils/socket");


// ==========================================
// CREATE NOTIFICATION
// ==========================================
const createNotification = async (data) => {

    const query = `
        INSERT INTO notifications
        (
            user_id,
            user_role,
            title,
            message,
            is_read
        )
        VALUES ($1, $2, $3, $4, FALSE)
        RETURNING *;
    `;

    const { rows } = await db.query(query, [
        data.user_id,
        data.user_role,
        data.title,
        data.message
    ]);

    const notification = rows[0];

    // ==========================================
    // REAL-TIME SOCKET
    // ==========================================

    const io = getSocket();

    if (io) {

        const room =
            `${data.user_role}_${data.user_id}`;

        console.log(
            "Sending notification to room:",
            room
        );

        io.to(room).emit(
            "newNotification",
            notification
        );
    }

    return notification;
};

// ==========================================
// NOTIFY ALL MUNICIPAL ADMINS
// ==========================================
const notifyMunicipalAdmins = async (title, message) => {

    try {

        const query = `
            SELECT admin_id
            FROM municipal_administrators
            WHERE status = 'Active';
        `;

        const { rows } = await db.query(query);

        console.log(
            "Active Municipal Admins:",
            rows
        );

        if (rows.length === 0) {

            console.log(
                "No active municipal admins found."
            );

            return false;
        }

        for (const admin of rows) {

            console.log(
                "Creating notification for Municipal Admin:",
                admin.admin_id
            );

            await createNotification({

                user_id: admin.admin_id,

                user_role: "MUNICIPAL_ADMIN",

                title,

                message

            });

        }

        console.log(
            "Municipal admin notifications created successfully."
        );

        return true;

    } catch (error) {

        console.error(
            "notifyMunicipalAdmins Error:",
            error
        );

        throw error;
    }
};

// ==========================================
// Get All Notifications
// ==========================================
const getNotifications = async (userId, userRole) => {

    const result = await db.query(
        `
        SELECT *
        FROM notifications
        WHERE user_id = $1
        AND user_role = $2
        ORDER BY notification_id DESC
        `,
        [
            userId,
            userRole
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


    const query = `
        SELECT *
        FROM notifications
        WHERE notification_id = $1;
    `;


    const { rows } =
        await db.query(query, [
            notificationId
        ]);


    return rows[0] || null;

};




// ==========================================
// Get Latest Notifications
// ==========================================
const getLatestNotifications = async (
    userId,
    userRole,
    limit = 5
) => {


    const query = `
        SELECT *
        FROM notifications
        WHERE user_id = $1
        AND user_role = $2
        ORDER BY created_at DESC
        LIMIT $3;
    `;


    const { rows } =
        await db.query(query, [
            userId,
            userRole,
            limit
        ]);


    return rows;

};


// ==========================================
// GET UNREAD COUNT
// ==========================================
const getUnreadCount = async (userId, userRole) => {

    const query = `
        SELECT COUNT(*) AS total
        FROM notifications
        WHERE user_id = $1
        AND user_role = $2
        AND is_read = FALSE;
    `;

    const { rows } = await db.query(query, [
        userId,
        userRole
    ]);

    return Number(rows[0].total);
};



// ==========================================
// Mark Notification As Read
// ==========================================
const markAsRead = async (
    notificationId
) => {


    const query = `
        UPDATE notifications
        SET is_read = TRUE
        WHERE notification_id = $1
        RETURNING *;
    `;


    const { rows } =
        await db.query(query, [
            notificationId
        ]);


    return rows[0] || null;

};




// ==========================================
// Mark All Notifications As Read
// ==========================================
const markAllAsRead = async (userId, userRole) => {

    console.log("MARK ALL READ:", userId, userRole);

    const result = await db.query(
        `
        UPDATE notifications
        SET is_read = TRUE
        WHERE user_id = $1
        AND user_role = $2
        `,
        [
            userId,
            userRole
        ]
    );

    return result.rowCount;
};

// ==========================================
// Get Municipal Admins
// ==========================================
const getMunicipalAdmins = async () => {

    const query = `
        SELECT admin_id
        FROM municipal_administrators;
    `;


    const { rows } = await db.query(query);


    return rows;

};
// ==========================================
// Delete Notification
// ==========================================
const deleteNotification = async (
    notificationId
) => {


    const query = `
        DELETE FROM notifications
        WHERE notification_id = $1
        RETURNING *;
    `;


    const { rows } =
        await db.query(query, [
            notificationId
        ]);


    return rows[0] || null;

};




// ==========================================
// Delete All Notifications
// ==========================================
const deleteAllNotifications = async (
    userId,
    userRole
) => {


    const query = `
        DELETE FROM notifications
        WHERE user_id = $1
        AND user_role = $2;
    `;


    const result =
        await db.query(query, [
            userId,
            userRole
        ]);


    return result.rowCount;

};




module.exports = {

    createNotification,

    notifyMunicipalAdmins,

    getNotifications,
 getMunicipalAdmins,
    getNotificationById,

    getLatestNotifications,

    getUnreadCount,
     
    markAsRead,

    markAllAsRead,

    deleteNotification,

    deleteAllNotifications

};