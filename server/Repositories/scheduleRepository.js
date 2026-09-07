const { pool } = require("../config/db");

// ===========================================
// Get All Collection Schedules
// ===========================================
const getAllSchedules = async () => {
    const query = `
        SELECT
            cs.*,
            c.full_name AS collector_name,
            c.phone_number AS collector_phone
        FROM collection_schedules cs
        LEFT JOIN collectors c
            ON cs.collector_id = c.collector_id
        ORDER BY
            cs.day_of_week,
            cs.start_time;
    `;

    const { rows } = await pool.query(query);

    return rows;
};

// ===========================================
// Get Schedule By ID
// ===========================================
const getScheduleById = async (id) => {
    const { rows } = await pool.query(
        `
        SELECT
            cs.*,
            c.full_name AS collector_name,
            c.phone_number AS collector_phone
        FROM collection_schedules cs
        LEFT JOIN collectors c
            ON cs.collector_id = c.collector_id
        WHERE cs.schedule_id = $1
        `,
        [id]
    );

    return rows[0];
};

// ===========================================
// Get Schedules By Collector
// ===========================================
const getSchedulesByCollector = async (collectorId) => {
    const { rows } = await pool.query(
        `
        SELECT *
        FROM collection_schedules
        WHERE collector_id = $1
        ORDER BY
            day_of_week,
            start_time;
        `,
        [collectorId]
    );

    return rows;
};

// ===========================================
// Get Schedules By Kifle Ketema
// ===========================================
const getSchedulesByKifleKetema = async (kifleKetema) => {
    const { rows } = await pool.query(
        `
        SELECT *
        FROM collection_schedules
        WHERE
            TRIM(LOWER(kifle_ketema))
            = TRIM(LOWER($1))
        ORDER BY
            kebele,
            sefer,
            day_of_week,
            start_time;
        `,
        [kifleKetema]
    );

    return rows;
};

// ===========================================
// Get Schedules By Kebele
// ===========================================
const getSchedulesByKebele = async (
    kifleKetema,
    kebele
) => {
    const { rows } = await pool.query(
        `
        SELECT *
        FROM collection_schedules
        WHERE
            TRIM(LOWER(kifle_ketema))
            = TRIM(LOWER($1))
            AND
            TRIM(LOWER(kebele))
            = TRIM(LOWER($2))
        ORDER BY
            sefer,
            day_of_week,
            start_time;
        `,
        [
            kifleKetema,
            kebele
        ]
    );

    return rows;
};

// ===========================================
// Create Schedule
// ===========================================
const createSchedule = async (data) => {
    try {
        const {
            collector_id,
            kifle_ketema,
            kebele,
            sefer,
            day_of_week,
            frequency,
            start_time,
            end_time,
            status
        } = data;

        const { rows } = await pool.query(
            `
            INSERT INTO collection_schedules
            (
                collector_id,
                kifle_ketema,
                kebele,
                sefer,
                day_of_week,
                frequency,
                start_time,
                end_time,
                status
            )
            VALUES
            ($1,$2,$3,$4,$5,$6,$7,$8,$9)
            RETURNING *;
            `,
            [
                collector_id,
                kifle_ketema,
                kebele,
                sefer,
                day_of_week,
                frequency || "Every 2 Weeks",
                start_time,
                end_time,
                status || "ACTIVE"
            ]
        );

        return rows[0];

    } catch (error) {
        console.error(
            "Create Schedule Repository Error:",
            error
        );

        throw error;
    }
};

// ===========================================
// Update Schedule
// ===========================================
const updateSchedule = async (id, schedule) => {

    const {
        collector_id,
        kifle_ketema,
        kebele,
        sefer,
        day_of_week,
        frequency,
        start_time,
        end_time,
        status
    } = schedule;

    const { rows } = await pool.query(
        `
        UPDATE collection_schedules
        SET
            collector_id = $1,
            kifle_ketema = $2,
            kebele = $3,
            sefer = $4,
            day_of_week = $5,
            frequency = $6,
            start_time = $7,
            end_time = $8,
            status = $9,
            updated_at = CURRENT_TIMESTAMP
        WHERE schedule_id = $10
        RETURNING *;
        `,
        [
            collector_id,
            kifle_ketema,
            kebele,
            sefer,
            day_of_week,
            frequency,
            start_time,
            end_time,
            status,
            id
        ]
    );

    return rows[0];
};

// ===========================================
// Update Schedule Status
// ===========================================
const updateScheduleStatus = async (id, status) => {

    const { rows } = await pool.query(
        `
        UPDATE collection_schedules
        SET
            status = $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE schedule_id = $2
        RETURNING *;
        `,
        [
            status,
            id
        ]
    );

    return rows[0];
};

// ===========================================
// Delete Schedule
// ===========================================
const deleteSchedule = async (id) => {

    const { rows } = await pool.query(
        `
        DELETE FROM collection_schedules
        WHERE schedule_id = $1
        RETURNING *;
        `,
        [id]
    );

    return rows[0];
};

// ===========================================
// Get My Schedule
// Resident / Business Owner
//
// IMPORTANT:
// Resident sees ONLY schedules matching:
// Kifle Ketema + Kebele + Sefer
//
// Business Owner sees ONLY schedules matching:
// Kifle Ketema + Kebele + Sefer
// ===========================================
const getMySchedule = async (userId, role) => {

    let locationQuery;

    // ==========================================
    // Resident
    // ==========================================
    if (role === "RESIDENT") {

        locationQuery = `
            SELECT
                TRIM(kifle_ketema) AS kifle_ketema,
                TRIM(kebele) AS kebele,
                TRIM(sefer) AS sefer
            FROM residents
            WHERE resident_id = $1
            LIMIT 1;
        `;

    }

    // ==========================================
    // Business Owner
    // ==========================================
    else if (
        role === "BUSINESS_OWNER" ||
        role === "BUSINESS OWNER" ||
        role === "BUSINESS"
    ) {

        locationQuery = `
            SELECT
                TRIM(kifle_ketema) AS kifle_ketema,
                TRIM(kebele) AS kebele,
                TRIM(sefer) AS sefer
            FROM business_owners
            WHERE business_id = $1
            LIMIT 1;
        `;

    }

    // ==========================================
    // Unsupported Role
    // ==========================================
    else {

        console.log(
            "Unsupported schedule role:",
            role
        );

        return [];
    }

    // ==========================================
    // Get User Location
    // ==========================================
    const locationResult = await pool.query(
        locationQuery,
        [userId]
    );

    console.log(
        "================================="
    );

    console.log(
        "SCHEDULE USER:",
        {
            userId,
            role
        }
    );

    console.log(
        "USER LOCATION:",
        locationResult.rows
    );

    console.log(
        "================================="
    );

    // ==========================================
    // No Location
    // ==========================================
    if (locationResult.rows.length === 0) {

        console.log(
            "No user location found."
        );

        return [];
    }

    const {
        kifle_ketema,
        kebele,
        sefer
    } = locationResult.rows[0];

    console.log(
        "SEARCH LOCATION:",
        {
            kifle_ketema,
            kebele,
            sefer
        }
    );

    // ==========================================
    // Find ONLY Matching Active Schedules
    // ==========================================
    const { rows } = await pool.query(
        `
        SELECT
            cs.*,
            c.collector_id,
            c.full_name AS collector_name,
            c.phone_number AS collector_phone
        FROM collection_schedules cs

        LEFT JOIN collectors c
            ON cs.collector_id = c.collector_id

        WHERE
            TRIM(LOWER(cs.kifle_ketema))
                = TRIM(LOWER($1))

            AND TRIM(LOWER(cs.kebele))
                = TRIM(LOWER($2))

            AND TRIM(LOWER(cs.sefer))
                = TRIM(LOWER($3))

            AND UPPER(TRIM(cs.status))
                = 'ACTIVE'

        ORDER BY
            cs.day_of_week,
            cs.start_time;
        `,
        [
            kifle_ketema,
            kebele,
            sefer
        ]
    );

    console.log(
        "================================="
    );

    console.log(
        "FOUND SCHEDULE:",
        rows
    );

    console.log(
        "================================="
    );

    return rows;
};

// ===========================================
// Get Schedule By Location
// ===========================================
const getScheduleByLocation = async (
    kifle_ketema,
    kebele,
    sefer
) => {

    const { rows } = await pool.query(
        `
        SELECT
            cs.*,
            c.full_name AS collector_name,
            c.phone_number AS collector_phone
        FROM collection_schedules cs
        LEFT JOIN collectors c
            ON cs.collector_id = c.collector_id
        WHERE
            TRIM(LOWER(cs.kifle_ketema))
                = TRIM(LOWER($1))
            AND TRIM(LOWER(cs.kebele))
                = TRIM(LOWER($2))
            AND TRIM(LOWER(cs.sefer))
                = TRIM(LOWER($3))
            AND UPPER(TRIM(cs.status))
                = 'ACTIVE'
        ORDER BY
            cs.day_of_week,
            cs.start_time
        LIMIT 1;
        `,
        [
            kifle_ketema,
            kebele,
            sefer
        ]
    );

    return rows[0] || null;
};

// ===========================================
// Export
// ===========================================
module.exports = {
    getAllSchedules,
    getScheduleById,
    getSchedulesByCollector,
    getSchedulesByKifleKetema,
    getSchedulesByKebele,
    createSchedule,
    updateSchedule,
    getScheduleByLocation,
    updateScheduleStatus,
    deleteSchedule,
    getMySchedule
};