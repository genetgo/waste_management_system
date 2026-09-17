const db = require("../config/db");
const { getSocket } = require("../utils/socket");

// ============================================================
// CREATE NOTIFICATION
// ============================================================
const createNotification = async (data) => {
    try {
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

        const values = [
            data.user_id,
            data.user_role,
            data.title,
            data.message,
            data.notification_type || null,
            data.reference_id || null
        ];

        const { rows } = await db.query(query, values);

        const notification = rows[0];

        console.log(
            "✅ NOTIFICATION CREATED:",
            notification
        );

        // ========================================================
        // REAL-TIME SOCKET
        // ========================================================
        try {
            const io = getSocket();

            if (io && notification) {
                const room =
                    `${data.user_role}_${data.user_id}`;

                console.log(
                    "📡 Sending notification to room:",
                    room
                );

                io.to(room).emit(
                    "newNotification",
                    notification
                );
            }
        } catch (socketError) {
            console.error(
                "⚠️ SOCKET NOTIFICATION ERROR:",
                socketError
            );
        }

        return notification;

    } catch (error) {
        console.error(
            "❌ CREATE NOTIFICATION ERROR:",
            error
        );

        throw error;
    }
};


// ============================================================
// NOTIFY ALL MUNICIPAL ADMINISTRATORS
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

        const { rows: admins } =
            await db.query(query);

        console.log(
            "ACTIVE MUNICIPAL ADMINS:",
            admins
        );

        if (!admins || admins.length === 0) {
            console.log(
                "⚠️ NO ACTIVE MUNICIPAL ADMINS FOUND"
            );

            return false;
        }

        let createdCount = 0;

        for (const admin of admins) {

            console.log(
                "Creating notification for Admin:",
                admin.admin_id
            );

            const notification =
                await createNotification({
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
        ORDER BY notification_id DESC;
    `;

    const { rows } =
        await db.query(
            query,
            [userId, userRole]
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

    const { rows } =
        await db.query(
            query,
            [notificationId]
        );

    return rows[0] || null;
};


// ============================================================
// GET NOTIFICATION DETAILS
// ============================================================
const getNotificationDetails = async (
    notificationId
) => {

    try {

        // =====================================================
        // GET NOTIFICATION
        // =====================================================

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
            [notificationId]
        );

        const notification =
            notificationRows[0];

        if (!notification) {
            return null;
        }


        // =====================================================
        // BUSINESS REGISTRATION
        // =====================================================

        const isBusinessRegistration =
            notification.notification_type ===
                "BUSINESS_REGISTRATION" ||

            notification.notification_type ===
                "BUSINESS_OWNER_REGISTERED" ||

            notification.title ===
                "New Business Registration" ||

            notification.title ===
                "New Business Owner Registered";


        if (isBusinessRegistration) {

            let business = null;


            // =================================================
            // 1. FIRST TRY REFERENCE ID
            // =================================================

            if (notification.reference_id) {

                console.log(
                    "🔎 BUSINESS LOOKUP BY REFERENCE ID:",
                    notification.reference_id
                );

                const query = `
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
                    WHERE business_id = $1
                    LIMIT 1;
                `;

                const {
                    rows
                } = await db.query(
                    query,
                    [notification.reference_id]
                );

                business =
                    rows[0] || null;

                console.log(
                    "🔎 BUSINESS FOUND BY REFERENCE:",
                    business
                );
            }


            // =================================================
            // 2. FALLBACK FOR OLD NOTIFICATIONS
            // =================================================
            //
            // Example notification:
            //
            // cafe has registered as a new business owner in Abima.
            //
            // Extract:
            // businessName = cafe
            // kifleKetema = Abima
            //
            // =================================================

            if (
                !business &&
                notification.message
            ) {

                const messageMatch =
                    notification.message.match(
                        /^(.+?)\s+has registered as a new business owner in\s+(.+?)\.$/i
                    );


                if (messageMatch) {

                    const businessName =
                        messageMatch[1].trim();

                    const kifleKetema =
                        messageMatch[2].trim();

                    console.log(
                        "🔎 FALLBACK BUSINESS NAME:",
                        businessName
                    );

                    console.log(
                        "🔎 FALLBACK KIFLE KETEMA:",
                        kifleKetema
                    );


                    const query = `
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
                        WHERE LOWER(TRIM(business_name))
                            = LOWER(TRIM($1))
                        AND LOWER(TRIM(kifle_ketema))
                            = LOWER(TRIM($2))
                        ORDER BY created_at DESC
                        LIMIT 1;
                    `;

                    const {
                        rows
                    } = await db.query(
                        query,
                        [
                            businessName,
                            kifleKetema
                        ]
                    );

                    business =
                        rows[0] || null;


                    console.log(
                        "🔎 FALLBACK BUSINESS RESULT:",
                        business
                    );
                }
            }


            // =================================================
            // RETURN BUSINESS REGISTRATION DETAILS
            // =================================================

            return {
                notification,
                type: "BUSINESS_REGISTRATION",
                data: business
            };
        }


        // =====================================================
        // ON-DEMAND REQUEST
        // =====================================================

        if (
            notification.notification_type ===
            "ON_DEMAND_REQUEST"
        ) {

            if (!notification.reference_id) {

                return {
                    notification,
                    type: "ON_DEMAND_REQUEST",
                    data: null
                };
            }


            const query = `
                SELECT
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

                    b.business_name,
                    b.owner_name,
                    b.phone_number AS business_phone,
                    b.email AS business_email,
                    b.business_type,
                    b.business_description,
                    b.house_number AS business_house_number,

                    t.team_name,
                    t.kifle_ketema AS team_kifle_ketema,
                    t.kebele AS team_kebele,
                    t.status AS team_status,

                    c.collector_id AS team_leader_id,
                    c.full_name AS team_leader_name,
                    c.phone_number AS team_leader_phone,
                    c.email AS team_leader_email

                FROM on_demand_requests r

                LEFT JOIN business_owners b
                    ON r.business_id = b.business_id

                LEFT JOIN collection_teams t
                    ON r.team_id = t.team_id

                LEFT JOIN collectors c
                    ON r.collector_id = c.collector_id

                WHERE r.request_id = $1;
            `;

            const { rows } =
                await db.query(
                    query,
                    [notification.reference_id]
                );


            return {
                notification,
                type: "ON_DEMAND_REQUEST",
                data: rows[0] || null
            };
        }


        // =====================================================
        // GENERAL NOTIFICATION
        // =====================================================

        return {
            notification,
            type:
                notification.notification_type ||
                "GENERAL",
            data: null
        };

    } catch (error) {

        console.error(
            "❌ GET NOTIFICATION DETAILS ERROR:",
            error
        );

        throw error;
    }
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

    const { rows } =
        await db.query(
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

    const { rows } =
        await db.query(
            query,
            [
                userId,
                userRole
            ]
        );

    const total =
        Number(rows[0]?.total || 0);

    console.log(
        "================================="
    );

    console.log(
        "UNREAD COUNT QUERY"
    );

    console.log(
        "USER ID:",
        userId
    );

    console.log(
        "USER ROLE:",
        userRole
    );

    console.log(
        "UNREAD COUNT:",
        total
    );

    console.log(
        "================================="
    );

    return total;
};


// ============================================================
// MARK ONE AS READ
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

    const { rows } =
        await db.query(
            query,
            [notificationId]
        );

    return rows[0] || null;
};


// ============================================================
// MARK ALL AS READ
// ============================================================
const markAllAsRead = async (
    userId,
    userRole
) => {

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
        SELECT
            admin_id,
            full_name,
            assigned_kifle_ketema,
            is_active
        FROM municipal_administrators
        WHERE is_active = TRUE
        ORDER BY admin_id;
    `;

    const { rows } =
        await db.query(query);

    return rows;
};


// ============================================================
// DELETE ONE
// ============================================================
const deleteNotification = async (
    notificationId
) => {

    const query = `
        DELETE FROM notifications
        WHERE notification_id = $1
        RETURNING *;
    `;

    const { rows } =
        await db.query(
            query,
            [notificationId]
        );

    return rows[0] || null;
};


// ============================================================
// DELETE ALL
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
// EXPORT
// ============================================================
module.exports = {
    createNotification,
    notifyMunicipalAdmins,
    getNotifications,
    getMunicipalAdmins,
    getNotificationById,
    getNotificationDetails,
    getLatestNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications
};