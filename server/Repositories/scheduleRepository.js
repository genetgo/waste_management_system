const { pool } = require("../config/db");


// ============================================================
// GET ALL SCHEDULES
// ============================================================
const getAllSchedules = async () => {

    const { rows } = await pool.query(`
        SELECT
            cs.schedule_id,
            cs.team_id,
            cs.collector_id,

            cs.kifle_ketema,
            cs.kebele,
            cs.sefer,

            cs.day_of_week,

            TO_CHAR(cs.initial_date, 'YYYY-MM-DD') AS initial_date,

            cs.frequency,
            cs.start_time,
            cs.end_time,
            cs.status,
            cs.created_at,
            cs.updated_at,

            -- ==========================================
            -- TEAM
            -- ==========================================
            ct.team_name,
            ct.status AS team_status,

            -- ==========================================
            -- TEAM LEADER / DRIVER
            -- ==========================================
            ct.team_leader_id,

            leader.full_name AS team_leader_name,
            leader.phone_number AS team_leader_phone,
            leader.email AS team_leader_email,

            -- ==========================================
            -- OLD COLLECTOR / DRIVER
            -- ==========================================
            c.full_name AS collector_name,
            c.phone_number AS collector_phone,

            -- ==========================================
            -- ALL TEAM MEMBERS
            -- ==========================================
            COALESCE(
                json_agg(
                    DISTINCT jsonb_build_object(
                        'collector_id', member.collector_id,
                        'full_name', member.full_name,
                        'phone_number', member.phone_number,
                        'email', member.email,
                        'assigned_kifle_ketema',
                            member.assigned_kifle_ketema,
                        'kebele', member.kebele,
                        'is_active', member.is_active
                    )
                ) FILTER (
                    WHERE member.collector_id IS NOT NULL
                ),
                '[]'::json
            ) AS team_members

        FROM collection_schedules cs

        LEFT JOIN collection_teams ct
            ON cs.team_id = ct.team_id

        LEFT JOIN collectors leader
            ON ct.team_leader_id = leader.collector_id

        LEFT JOIN collection_team_members ctm
            ON ct.team_id = ctm.team_id

        LEFT JOIN collectors member
            ON ctm.collector_id = member.collector_id

        LEFT JOIN collectors c
            ON cs.collector_id = c.collector_id

        GROUP BY
            cs.schedule_id,
            ct.team_id,
            leader.collector_id,
            c.collector_id

        ORDER BY
            cs.day_of_week,
            cs.start_time;
    `);

    return rows;
};


// ============================================================
// GET SCHEDULE BY ID
// ============================================================
const getScheduleById = async (id) => {

    const { rows } = await pool.query(`
        SELECT
            cs.schedule_id,
            cs.team_id,
            cs.collector_id,

            cs.kifle_ketema,
            cs.kebele,
            cs.sefer,

            cs.day_of_week,

            TO_CHAR(cs.initial_date, 'YYYY-MM-DD') AS initial_date,

            cs.frequency,
            cs.start_time,
            cs.end_time,
            cs.status,
            cs.created_at,
            cs.updated_at,

            -- TEAM
            ct.team_name,
            ct.status AS team_status,

            -- LEADER / DRIVER
            ct.team_leader_id,

            leader.full_name AS team_leader_name,
            leader.phone_number AS team_leader_phone,
            leader.email AS team_leader_email,

            -- COLLECTOR
            c.full_name AS collector_name,
            c.phone_number AS collector_phone,

            -- MEMBERS
            COALESCE(
                (
                    SELECT json_agg(
                        jsonb_build_object(
                            'collector_id', mc.collector_id,
                            'full_name', mc.full_name,
                            'phone_number', mc.phone_number,
                            'email', mc.email,
                            'assigned_kifle_ketema',
                                mc.assigned_kifle_ketema,
                            'kebele', mc.kebele,
                            'is_active', mc.is_active
                        )
                        ORDER BY mc.full_name
                    )
                    FROM collection_team_members mctm
                    JOIN collectors mc
                        ON mctm.collector_id = mc.collector_id
                    WHERE mctm.team_id = ct.team_id
                ),
                '[]'::json
            ) AS team_members

        FROM collection_schedules cs

        LEFT JOIN collection_teams ct
            ON cs.team_id = ct.team_id

        LEFT JOIN collectors leader
            ON ct.team_leader_id = leader.collector_id

        LEFT JOIN collectors c
            ON cs.collector_id = c.collector_id

        WHERE cs.schedule_id = $1;
    `, [id]);

    return rows[0] || null;
};


// ============================================================
// GET SCHEDULES BY COLLECTOR
//
// Collector sees schedules assigned to him/her.
// If collector is a team member, team schedules are also visible.
// ============================================================
const getSchedulesByCollector = async (collectorId) => {

    const { rows } = await pool.query(`
        SELECT DISTINCT
            cs.schedule_id,
            cs.team_id,
            cs.collector_id,

            cs.kifle_ketema,
            cs.kebele,
            cs.sefer,

            cs.day_of_week,

            TO_CHAR(cs.initial_date, 'YYYY-MM-DD') AS initial_date,

            cs.frequency,
            cs.start_time,
            cs.end_time,
            cs.status,

            ct.team_name,
            ct.team_leader_id,

            leader.full_name AS team_leader_name,
            leader.phone_number AS team_leader_phone,

            c.full_name AS collector_name,
            c.phone_number AS collector_phone

        FROM collection_schedules cs

        LEFT JOIN collection_teams ct
            ON cs.team_id = ct.team_id

        LEFT JOIN collection_team_members ctm
            ON ct.team_id = ctm.team_id

        LEFT JOIN collectors leader
            ON ct.team_leader_id = leader.collector_id

        LEFT JOIN collectors c
            ON cs.collector_id = c.collector_id

        WHERE
            cs.collector_id = $1
            OR ctm.collector_id = $1

        ORDER BY
            cs.day_of_week,
            cs.start_time;
    `, [collectorId]);

    return rows;
};


// ============================================================
// GET SCHEDULES BY KIFLE KETEMA
// ============================================================
const getSchedulesByKifleKetema = async (kifleKetema) => {

    const { rows } = await pool.query(`
        SELECT
            cs.*,

            ct.team_name,
            ct.team_leader_id,

            leader.full_name AS team_leader_name,
            leader.phone_number AS team_leader_phone,

            c.full_name AS collector_name,
            c.phone_number AS collector_phone

        FROM collection_schedules cs

        LEFT JOIN collection_teams ct
            ON cs.team_id = ct.team_id

        LEFT JOIN collectors leader
            ON ct.team_leader_id = leader.collector_id

        LEFT JOIN collectors c
            ON cs.collector_id = c.collector_id

        WHERE
            TRIM(LOWER(cs.kifle_ketema))
                = TRIM(LOWER($1))

        ORDER BY
            cs.kebele,
            cs.sefer,
            cs.day_of_week,
            cs.start_time;
    `, [kifleKetema]);

    return rows;
};


// ============================================================
// GET SCHEDULES BY KEBELE
// ============================================================
const getSchedulesByKebele = async (
    kifleKetema,
    kebele
) => {

    const { rows } = await pool.query(`
        SELECT
            cs.*,

            ct.team_name,
            ct.team_leader_id,

            leader.full_name AS team_leader_name,
            leader.phone_number AS team_leader_phone,

            c.full_name AS collector_name,
            c.phone_number AS collector_phone

        FROM collection_schedules cs

        LEFT JOIN collection_teams ct
            ON cs.team_id = ct.team_id

        LEFT JOIN collectors leader
            ON ct.team_leader_id = leader.collector_id

        LEFT JOIN collectors c
            ON cs.collector_id = c.collector_id

        WHERE
            TRIM(LOWER(cs.kifle_ketema))
                = TRIM(LOWER($1))

            AND TRIM(LOWER(cs.kebele))
                = TRIM(LOWER($2))

        ORDER BY
            cs.sefer,
            cs.day_of_week,
            cs.start_time;
    `, [
        kifleKetema,
        kebele
    ]);

    return rows;
};


// ============================================================
// FIND SCHEDULE CONFLICT
//
// Main rule:
// SAME TEAM
// + SAME KIFLE
// + SAME KEBELE
// + SAME SEFER
// + SAME DAY
// + OVERLAPPING TIME
//
// Different Sefer  -> allowed
// Different Kebele -> allowed
// Different Team   -> allowed
// ============================================================
const findScheduleConflict = async ({
    team_id,
    collector_id,
    kifle_ketema,
    kebele,
    sefer,
    day_of_week,
    start_time,
    end_time,
    exclude_schedule_id = null
}) => {

    const { rows } = await pool.query(`
        SELECT
            schedule_id,
            team_id,
            collector_id,
            kifle_ketema,
            kebele,
            sefer,
            day_of_week,
            initial_date,
            start_time,
            end_time,
            status

        FROM collection_schedules

        WHERE

            -- ==========================================
            -- TEAM CONFLICT
            -- ==========================================
            (
                (
                    $1::INTEGER IS NOT NULL
                    AND team_id = $1::INTEGER
                )

                OR

                (
                    $1::INTEGER IS NULL
                    AND collector_id = $2
                )
            )

            AND TRIM(LOWER(kifle_ketema))
                = TRIM(LOWER($3))

            AND TRIM(LOWER(kebele))
                = TRIM(LOWER($4))

            AND TRIM(LOWER(sefer))
                = TRIM(LOWER($5))

            AND TRIM(LOWER(day_of_week))
                = TRIM(LOWER($6))

            AND UPPER(
                TRIM(
                    COALESCE(status, 'ACTIVE')
                )
            ) = 'ACTIVE'

            -- ==========================================
            -- OVERLAPPING TIME
            -- ==========================================
            AND start_time < $8
            AND end_time > $7

            -- ==========================================
            -- IGNORE CURRENT SCHEDULE WHEN UPDATING
            -- ==========================================
            AND (
                $9::INTEGER IS NULL
                OR schedule_id <> $9::INTEGER
            )

        LIMIT 1;
    `, [
        team_id || null,
        collector_id,
        kifle_ketema,
        kebele,
        sefer,
        day_of_week,
        start_time,
        end_time,
        exclude_schedule_id
    ]);

    return rows[0] || null;
};


// ============================================================
// CREATE SCHEDULE
// ============================================================
const createSchedule = async (data) => {

    try {

        const {
            team_id,
            collector_id,

            kifle_ketema,
            kebele,
            sefer,

            day_of_week,
            initial_date,

            frequency,
            start_time,
            end_time,
            status
        } = data;


        // ====================================================
        // VERIFY TEAM
        // ====================================================
        const teamResult = await pool.query(`
            SELECT
                ct.team_id,
                ct.team_name,
                ct.kifle_ketema,
                ct.kebele,
                ct.team_leader_id,
                ct.status,

                leader.full_name AS team_leader_name,
                leader.phone_number AS team_leader_phone

            FROM collection_teams ct

            LEFT JOIN collectors leader
                ON ct.team_leader_id = leader.collector_id

            WHERE ct.team_id = $1
        `, [team_id]);


        if (!teamResult.rows.length) {
            throw new Error("Collection Team not found.");
        }


        const team = teamResult.rows[0];


        // ====================================================
        // TEAM MUST BE ACTIVE
        // ====================================================
        if (team.status !== "ACTIVE") {
            throw new Error("Collection Team is inactive.");
        }


        // ====================================================
        // TEAM MUST HAVE LEADER / DRIVER
        // ====================================================
        if (!team.team_leader_id) {
            throw new Error(
                "Collection Team does not have a Team Leader / Driver."
            );
        }


        // ====================================================
        // TEAM LOCATION MUST MATCH
        // ====================================================
        if (
            team.kifle_ketema?.trim().toLowerCase() !==
            kifle_ketema?.trim().toLowerCase()
        ) {
            throw new Error(
                "Team Kifle Ketema does not match schedule Kifle Ketema."
            );
        }


        if (
            team.kebele?.trim().toLowerCase() !==
            kebele?.trim().toLowerCase()
        ) {
            throw new Error(
                "Team Kebele does not match schedule Kebele."
            );
        }


        // ====================================================
        // TEAM LEADER IS THE DRIVER
        // ====================================================
        const driverId = team.team_leader_id;


        // ====================================================
        // CREATE
        // ====================================================
        const { rows } = await pool.query(`
            INSERT INTO collection_schedules
            (
                team_id,
                collector_id,

                kifle_ketema,
                kebele,
                sefer,

                day_of_week,
                initial_date,

                frequency,
                start_time,
                end_time,
                status
            )

            VALUES
            (
                $1,
                $2,

                $3,
                $4,
                $5,

                $6,
                $7,

                $8,
                $9,
                $10,
                $11
            )

            RETURNING *;
        `, [
            team_id,
            driverId,

            kifle_ketema,
            kebele,
            sefer,

            day_of_week,
            initial_date,

            frequency || "Every 2 Weeks",
            start_time,
            end_time,
            status || "ACTIVE"
        ]);


        return rows[0];

    } catch (error) {

        console.error(
            "CREATE SCHEDULE REPOSITORY ERROR:",
            error
        );

        throw error;
    }
};


// ============================================================
// UPDATE SCHEDULE
// ============================================================
const updateSchedule = async (
    id,
    schedule
) => {

    const {
        team_id,
        collector_id,

        kifle_ketema,
        kebele,
        sefer,

        day_of_week,
        initial_date,

        frequency,
        start_time,
        end_time,
        status
    } = schedule;


    let finalCollectorId = collector_id;


    // ========================================================
    // IF TEAM SELECTED
    // TEAM LEADER BECOMES DRIVER
    // ========================================================
    if (team_id) {

        const teamResult = await pool.query(`
            SELECT
                team_id,
                kifle_ketema,
                kebele,
                team_leader_id,
                status
            FROM collection_teams
            WHERE team_id = $1
        `, [team_id]);


        if (!teamResult.rows.length) {
            throw new Error("Collection Team not found.");
        }


        const team = teamResult.rows[0];


        if (team.status !== "ACTIVE") {
            throw new Error("Collection Team is inactive.");
        }


        if (!team.team_leader_id) {
            throw new Error(
                "Collection Team does not have a Team Leader / Driver."
            );
        }


        if (
            team.kifle_ketema?.trim().toLowerCase() !==
            kifle_ketema?.trim().toLowerCase()
        ) {
            throw new Error(
                "Team Kifle Ketema does not match schedule Kifle Ketema."
            );
        }


        if (
            team.kebele?.trim().toLowerCase() !==
            kebele?.trim().toLowerCase()
        ) {
            throw new Error(
                "Team Kebele does not match schedule Kebele."
            );
        }


        finalCollectorId = team.team_leader_id;
    }


    const { rows } = await pool.query(`
        UPDATE collection_schedules

        SET
            team_id = $1,
            collector_id = $2,

            kifle_ketema = $3,
            kebele = $4,
            sefer = $5,

            day_of_week = $6,
            initial_date = $7,

            frequency = $8,
            start_time = $9,
            end_time = $10,
            status = $11,

            updated_at = CURRENT_TIMESTAMP

        WHERE schedule_id = $12

        RETURNING *;
    `, [
        team_id || null,
        finalCollectorId,

        kifle_ketema,
        kebele,
        sefer,

        day_of_week,
        initial_date,

        frequency || "Every 2 Weeks",
        start_time,
        end_time,
        status || "ACTIVE",

        id
    ]);


    return rows[0] || null;
};


// ============================================================
// UPDATE SCHEDULE STATUS
// ============================================================
const updateScheduleStatus = async (
    id,
    status
) => {

    const { rows } = await pool.query(`
        UPDATE collection_schedules

        SET
            status = $1,
            updated_at = CURRENT_TIMESTAMP

        WHERE schedule_id = $2

        RETURNING *;
    `, [
        status,
        id
    ]);

    return rows[0] || null;
};


// ============================================================
// DELETE SCHEDULE
// ============================================================
const deleteSchedule = async (id) => {

    const { rows } = await pool.query(`
        DELETE FROM collection_schedules

        WHERE schedule_id = $1

        RETURNING *;
    `, [id]);

    return rows[0] || null;
};


// ============================================================
// GET MY SCHEDULE
//
// RESIDENT
// BUSINESS OWNER
//
// Matching:
// Kifle Ketema
// + Kebele
// + Sefer
//
// ACTIVE ONLY
// ============================================================
const getMySchedule = async (
    userId,
    role
) => {

    let locationQuery;


    // ========================================================
    // RESIDENT
    // ========================================================
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


    // ========================================================
    // BUSINESS OWNER
    // ========================================================
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


    // ========================================================
    // UNSUPPORTED
    // ========================================================
    else {

        console.log(
            "Unsupported schedule role:",
            role
        );

        return [];
    }


    // ========================================================
    // GET LOCATION
    // ========================================================
    const locationResult = await pool.query(
        locationQuery,
        [userId]
    );


    if (!locationResult.rows.length) {

        console.log(
            "No user location found for schedule."
        );

        return [];
    }


    const {
        kifle_ketema,
        kebele,
        sefer
    } = locationResult.rows[0];


    // ========================================================
    // GET MATCHING SCHEDULES
    // ========================================================
    const { rows } = await pool.query(`
        SELECT
            cs.*,

            ct.team_name,
            ct.team_leader_id,

            leader.full_name AS team_leader_name,
            leader.phone_number AS team_leader_phone,

            c.full_name AS collector_name,
            c.phone_number AS collector_phone

        FROM collection_schedules cs

        LEFT JOIN collection_teams ct
            ON cs.team_id = ct.team_id

        LEFT JOIN collectors leader
            ON ct.team_leader_id = leader.collector_id

        LEFT JOIN collectors c
            ON cs.collector_id = c.collector_id

        WHERE
            TRIM(LOWER(cs.kifle_ketema))
                = TRIM(LOWER($1))

            AND TRIM(LOWER(cs.kebele))
                = TRIM(LOWER($2))

            AND TRIM(LOWER(cs.sefer))
                = TRIM(LOWER($3))

            AND UPPER(
                TRIM(
                    COALESCE(cs.status, 'ACTIVE')
                )
            ) = 'ACTIVE'

        ORDER BY
            cs.day_of_week,
            cs.start_time;
    `, [
        kifle_ketema,
        kebele,
        sefer
    ]);


    return rows;
};


// ============================================================
// GET SCHEDULE BY LOCATION
// ============================================================
const getScheduleByLocation = async (
    kifle_ketema,
    kebele,
    sefer
) => {

    const { rows } = await pool.query(`
        SELECT
            cs.*,

            ct.team_name,
            ct.team_leader_id,

            leader.full_name AS team_leader_name,
            leader.phone_number AS team_leader_phone,

            c.full_name AS collector_name,
            c.phone_number AS collector_phone

        FROM collection_schedules cs

        LEFT JOIN collection_teams ct
            ON cs.team_id = ct.team_id

        LEFT JOIN collectors leader
            ON ct.team_leader_id = leader.collector_id

        LEFT JOIN collectors c
            ON cs.collector_id = c.collector_id

        WHERE
            TRIM(LOWER(cs.kifle_ketema))
                = TRIM(LOWER($1))

            AND TRIM(LOWER(cs.kebele))
                = TRIM(LOWER($2))

            AND TRIM(LOWER(cs.sefer))
                = TRIM(LOWER($3))

            AND UPPER(
                TRIM(
                    COALESCE(cs.status, 'ACTIVE')
                )
            ) = 'ACTIVE'

        ORDER BY
            cs.day_of_week,
            cs.start_time

        LIMIT 1;
    `, [
        kifle_ketema,
        kebele,
        sefer
    ]);

    return rows[0] || null;
};


// ============================================================
// GET KIFLE KETEMA FOR MUNICIPAL ADMIN
//
// IMPORTANT:
// Kifle Ketema comes from SERVER / DATABASE.
// React does NOT hard-code it.
//
// Municipal Admin:
// only his/her assigned Kifle
//
// System Admin:
// all Kifles used by municipal administrators
// ============================================================
const getKifleKetemas = async (
    userId,
    role
) => {

    // ========================================================
    // MUNICIPAL ADMIN
    // ========================================================
    if (
        role === "MUNICIPAL_ADMIN" ||
        role === "MunicipalAdmin"
    ) {

        const { rows } = await pool.query(`
            SELECT DISTINCT
                TRIM(assigned_kifle_ketema) AS kifle_ketema

            FROM municipal_administrators

            WHERE admin_id = $1
              AND is_active = TRUE
              AND assigned_kifle_ketema IS NOT NULL

            ORDER BY kifle_ketema;
        `, [userId]);

        return rows;
    }


    // ========================================================
    // SYSTEM ADMIN
    // ========================================================
    if (
        role === "SYSTEM_ADMIN" ||
        role === "SystemAdmin"
    ) {

        const { rows } = await pool.query(`
            SELECT DISTINCT
                TRIM(assigned_kifle_ketema) AS kifle_ketema

            FROM municipal_administrators

            WHERE assigned_kifle_ketema IS NOT NULL

            ORDER BY kifle_ketema;
        `);

        return rows;
    }


    return [];
};


// ============================================================
// GET KEBELES FOR KIFLE KETEMA
//
// Server provides these too.
// No hard-coded Kebele in React.
// ============================================================
const getKebelesByKifleKetema = async (
    kifleKetema
) => {

    const { rows } = await pool.query(`
        SELECT DISTINCT
            TRIM(kebele) AS kebele

        FROM collection_teams

        WHERE
            TRIM(LOWER(kifle_ketema))
                = TRIM(LOWER($1))

            AND kebele IS NOT NULL

            AND status = 'ACTIVE'

        ORDER BY kebele;
    `, [kifleKetema]);

    return rows;
};


// ============================================================
// GET SEFERS FOR TEAM
//
// Server provides Sefer values.
// ============================================================
const getSefersByTeam = async (
    teamId
) => {

    const { rows } = await pool.query(`
        SELECT DISTINCT
            TRIM(sefer) AS sefer

        FROM collection_schedules

        WHERE team_id = $1
          AND sefer IS NOT NULL

        ORDER BY sefer;
    `, [teamId]);

    return rows;
};


// ============================================================
// EXPORT
// ============================================================
module.exports = {

    getAllSchedules,

    getScheduleById,

    getSchedulesByCollector,

    getSchedulesByKifleKetema,

    getSchedulesByKebele,

    findScheduleConflict,

    createSchedule,

    updateSchedule,

    updateScheduleStatus,

    deleteSchedule,

    getMySchedule,

    getScheduleByLocation,

    getKifleKetemas,

    getKebelesByKifleKetema,

    getSefersByTeam
};