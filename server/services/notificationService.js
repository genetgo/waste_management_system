
const db = require("../config/db");
const { getSocket } = require("../utils/socket");


// ============================================================
// CREATE NOTIFICATION
// ============================================================
const createNotification = async (data) => {

    const query = `
        INSERT INTO notifications
        (
            user_id,
            user_role,
            title,
            message,
            notification_type,
            reference_id,
            is_read
        )
        VALUES ($1, $2, $3, $4, $5, $6, FALSE)
        RETURNING *;
    `;

    const { rows } = await db.query(query, [

        data.user_id,

        data.user_role,

        data.title,

        data.message,

        data.notification_type || null,

        data.reference_id || null

    ]);

    const notification = rows[0];


    // ========================================================
    // SOCKET NOTIFICATION
    // ========================================================

    const io = getSocket();

    if (!io) {

        console.log(
            "❌ Socket.IO is not initialized"
        );

        return notification;
    }


    const room =
        `${data.user_role}_${data.user_id}`;


    console.log(
        "================================="
    );

    console.log(
        "📤 SEND SOCKET ROOM:",
        room
    );


    const roomData =
        io.sockets.adapter.rooms.get(room);


    console.log(
        "📦 ROOM DATA:",
        roomData
    );


    if (!roomData) {

        console.log(
            "⚠️ USER IS NOT CONNECTED TO ROOM:",
            room
        );

    } else {

        console.log(
            "✅ ROOM EXISTS:",
            room
        );


        io.to(room).emit(
            "newNotification",
            notification
        );


        console.log(
            "✅ SOCKET NOTIFICATION SENT"
        );
    }


    console.log(
        "================================="
    );


    return notification;
};


// ============================================================
// NOTIFY ALL MUNICIPAL ADMINISTRATORS
// ============================================================
//
// notificationType examples:
//
// BUSINESS_REGISTRATION
// ON_DEMAND_REQUEST
//
// referenceId:
//
// business_id
// request_id
//
// ============================================================
const notifyMunicipalAdmins = async (
    title,
    message,
    notificationType = null,
    referenceId = null
) => {
    try {
        console.log("=================================");
        console.log("NOTIFY MUNICIPAL ADMINS");
        console.log("TITLE:", title);
        console.log("TYPE:", notificationType);
        console.log("REFERENCE ID:", referenceId);
        console.log("=================================");

        const query = `
            SELECT
                admin_id,
                full_name,
                assigned_kifle_ketema
            FROM municipal_administrators
            WHERE is_active = TRUE
            ORDER BY admin_id;
        `;

        const { rows: admins } = await db.query(query);

        console.log("ACTIVE MUNICIPAL ADMINS:", admins);

        if (!admins || admins.length === 0) {
            console.log("⚠️ NO ACTIVE MUNICIPAL ADMINS FOUND");
            return false;
        }

        let createdCount = 0;

        for (const admin of admins) {
            console.log(
                "Creating notification for Admin:",
                admin.admin_id
            );

            const notification = await createNotification({
                user_id: admin.admin_id,
                user_role: "MUNICIPAL_ADMIN",
                title,
                message,
                notification_type: notificationType,
                reference_id: referenceId
            });

            if (notification) {
                createdCount++;
            }
        }

        console.log(
            `✅ CREATED ${createdCount} MUNICIPAL ADMIN NOTIFICATION(S)`
        );

        return createdCount > 0;

    } catch (error) {
        console.error(
            "❌ NOTIFY MUNICIPAL ADMINS ERROR:",
            error
        );

        throw error;
    }
};

// ============================================================
// GET ALL NOTIFICATIONS
// ============================================================
const getNotifications = async (
    userId,
    userRole
) => {

    const query = `
        SELECT
            notification_id,
            user_id,
            user_role,
            title,
            message,
            notification_type,
            reference_id,
            is_read,
            created_at
        FROM notifications
        WHERE user_id = $1
        AND user_role = $2
        ORDER BY created_at DESC;
    `;


    const {
        rows
    } = await db.query(
        query,
        [
            userId,
            userRole
        ]
    );


    return rows;
};


// ============================================================
// GET NOTIFICATION BY ID
// ============================================================
const getNotificationById = async (
    notificationId
) => {

    const query = `
        SELECT
            notification_id,
            user_id,
            user_role,
            title,
            message,
            notification_type,
            reference_id,
            is_read,
            created_at
        FROM notifications
        WHERE notification_id = $1;
    `;


    const {
        rows
    } = await db.query(
        query,
        [
            notificationId
        ]
    );


    return rows[0] || null;
};


// ============================================================
// GET NOTIFICATION DETAILS
// ============================================================
//
// BUSINESS_REGISTRATION:
//
// notification
//      ↓
// reference_id
//      ↓
// business_owners.business_id
//
//
//
// ON_DEMAND_REQUEST:
//
// notification
//      ↓
// reference_id
//      ↓
// on_demand_requests.request_id
//      ↓
// business_owners
//      ↓
// collection_teams
//      ↓
// collectors
//
// ============================================================
const getNotificationDetails = async (
    notificationId
) => {

    // ========================================================
    // STEP 1: GET NOTIFICATION
    // ========================================================

    const notificationQuery = `
        SELECT
            notification_id,
            user_id,
            user_role,
            title,
            message,
            notification_type,
            reference_id,
            is_read,
            created_at
        FROM notifications
        WHERE notification_id = $1;
    `;


    const {
        rows: notificationRows
    } = await db.query(
        notificationQuery,
        [
            notificationId
        ]
    );


    const notification =
        notificationRows[0];


    if (!notification) {

        return null;
    }


    // ========================================================
    // STEP 2: BUSINESS REGISTRATION DETAILS
    // ========================================================

    if (
        notification.notification_type ===
        "BUSINESS_REGISTRATION"
    ) {

        if (!notification.reference_id) {

            return {

                notification,

                type:
                    "BUSINESS_REGISTRATION",

                details:
                    null

            };
        }


        const businessQuery = `
            SELECT

                business_id,

                business_name,

                owner_name,

                phone_number,

                email,

                business_type,

                business_description,

                kifle_ketema,

                kebele,

                sefer,

                house_number,

                profile_image,

                is_active,

                created_at,

                updated_at

            FROM business_owners

            WHERE business_id = $1;
        `;


        const {
            rows
        } = await db.query(
            businessQuery,
            [
                notification.reference_id
            ]
        );


        return {

            notification,

            type:
                "BUSINESS_REGISTRATION",

            details:
                rows[0] || null

        };
    }


    // ========================================================
    // STEP 3: ON-DEMAND REQUEST DETAILS
    // ========================================================

    if (
        notification.notification_type ===
        "ON_DEMAND_REQUEST"
    ) {

        if (!notification.reference_id) {

            return {

                notification,

                type:
                    "ON_DEMAND_REQUEST",

                details:
                    null

            };
        }


        const requestQuery = `
            SELECT

                -- ==========================================
                -- REQUEST INFORMATION
                -- ==========================================

                r.request_id,

                r.business_id,

                r.team_id,

                r.collector_id,

                r.approved_by,

                r.kifle_ketema,

                r.kebele,

                r.sefer,

                r.latitude,

                r.longitude,

                r.preferred_collection_date,

                r.description,

                r.status,

                r.rejection_reason,

                r.approved_at,

                r.collected_at,

                r.completed_at,

                r.created_at,

                r.updated_at,


                -- ==========================================
                -- BUSINESS INFORMATION
                -- ==========================================

                b.business_name,

                b.owner_name,

                b.phone_number AS business_phone,

                b.email AS business_email,

                b.business_type,

                b.business_description,

                b.house_number,


                -- ==========================================
                -- COLLECTION TEAM
                -- ==========================================

                t.team_name,

                t.kifle_ketema AS team_kifle_ketema,

                t.kebele AS team_kebele,

                t.status AS team_status,


                -- ==========================================
                -- TEAM LEADER / DRIVER
                -- ==========================================

                c.collector_id AS team_leader_id,

                c.full_name AS team_leader_name,

                c.phone_number AS team_leader_phone,

                c.email AS team_leader_email

            FROM on_demand_requests r


            LEFT JOIN business_owners b
                ON r.business_id =
                   b.business_id


            LEFT JOIN collection_teams t
                ON r.team_id =
                   t.team_id


            LEFT JOIN collectors c
                ON r.collector_id =
                   c.collector_id


            WHERE r.request_id = $1;
        `;


        const {
            rows
        } = await db.query(
            requestQuery,
            [
                notification.reference_id
            ]
        );


        return {

            notification,

            type:
                "ON_DEMAND_REQUEST",

            details:
                rows[0] || null

        };
    }


    // ========================================================
    // GENERAL NOTIFICATION
    // ========================================================

    return {

        notification,

        type:
            notification.notification_type ||
            "GENERAL",

        details:
            null

    };
};


// ============================================================
// GET LATEST NOTIFICATIONS
// ============================================================
const getLatestNotifications = async (
    userId,
    userRole,
    limit = 5
) => {

    const query = `
        SELECT
            notification_id,
            user_id,
            user_role,
            title,
            message,
            notification_type,
            reference_id,
            is_read,
            created_at
        FROM notifications
        WHERE user_id = $1
        AND user_role = $2
        ORDER BY created_at DESC
        LIMIT $3;
    `;


    const {
        rows
    } = await db.query(
        query,
        [
            userId,
            userRole,
            limit
        ]
    );


    return rows;
};


// ============================================================
// GET UNREAD COUNT
// ============================================================
const getUnreadCount = async (
    userId,
    userRole
) => {

    const query = `
        SELECT COUNT(*) AS total
        FROM notifications
        WHERE user_id = $1
        AND user_role = $2
        AND is_read = FALSE;
    `;


    const {
        rows
    } = await db.query(
        query,
        [
            userId,
            userRole
        ]
    );


    return Number(
        rows[0].total
    );
};


// ============================================================
// MARK NOTIFICATION AS READ
// ============================================================
const markAsRead = async (
    notificationId
) => {

    const query = `
        UPDATE notifications
        SET is_read = TRUE
        WHERE notification_id = $1
        RETURNING *;
    `;


    const {
        rows
    } = await db.query(
        query,
        [
            notificationId
        ]
    );


    return rows[0] || null;
};


// ============================================================
// MARK ALL NOTIFICATIONS AS READ
// ============================================================
const markAllAsRead = async (
    userId,
    userRole
) => {

    console.log(
        "MARK ALL READ:",
        userId,
        userRole
    );


    const query = `
        UPDATE notifications
        SET is_read = TRUE
        WHERE user_id = $1
        AND user_role = $2;
    `;


    const result =
        await db.query(
            query,
            [
                userId,
                userRole
            ]
        );


    return result.rowCount;
};


// ============================================================
// GET MUNICIPAL ADMINS
// ============================================================
const getMunicipalAdmins = async () => {

    const query = `
        SELECT admin_id
        FROM municipal_administrators
        WHERE is_active = TRUE;
    `;


    const {
        rows
    } = await db.query(query);


    return rows;
};


// ============================================================
// DELETE NOTIFICATION
// ============================================================
const deleteNotification = async (
    notificationId
) => {

    const query = `
        DELETE FROM notifications
        WHERE notification_id = $1
        RETURNING *;
    `;


    const {
        rows
    } = await db.query(
        query,
        [
            notificationId
        ]
    );


    return rows[0] || null;
};


// ============================================================
// DELETE ALL NOTIFICATIONS
// ============================================================
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
        await db.query(
            query,
            [
                userId,
                userRole
            ]
        );


    return result.rowCount;
};


// ============================================================
// EXPORTS
// ============================================================
module.exports = {

    createNotification,

    notifyMunicipalAdmins,

    getNotifications,

    getNotificationById,

    getNotificationDetails,

    getLatestNotifications,

    getUnreadCount,

    getMunicipalAdmins,

    markAsRead,

    markAllAsRead,

    deleteNotification,

    deleteAllNotifications

};
