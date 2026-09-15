
const { pool } = require("../config/db");

// ============================================================
// GET ALL REPORTS
// ============================================================
const getAllReports = async () => {
    const query = `
        SELECT *
        FROM reports
        ORDER BY generated_at DESC
    `;

    const { rows } = await pool.query(query);

    return rows || [];
};

// ============================================================
// GET REPORT BY ID
// ============================================================
const getReportById = async (id) => {
    const query = `
        SELECT *
        FROM reports
        WHERE report_id = $1
    `;

    const { rows } = await pool.query(query, [id]);

    return rows[0] || null;
};

// ============================================================
// GET REPORTS BY MUNICIPAL ADMIN
// ============================================================
const getReportsByAdmin = async (adminId) => {
    const query = `
        SELECT *
        FROM reports
        WHERE admin_id = $1
        ORDER BY generated_at DESC
    `;

    const { rows } = await pool.query(query, [adminId]);

    return rows || [];
};

// ============================================================
// GET REPORTS BY SYSTEM ADMIN
// ============================================================
const getReportsBySystemAdmin = async (systemAdminId) => {
    const query = `
        SELECT *
        FROM reports
        WHERE system_admin_id = $1
        ORDER BY generated_at DESC
    `;

    const { rows } = await pool.query(query, [systemAdminId]);

    return rows || [];
};

// ============================================================
// GET REPORTS BY TYPE
// ============================================================
const getReportsByType = async (reportType) => {
    const query = `
        SELECT *
        FROM reports
        WHERE report_type = $1
        ORDER BY generated_at DESC
    `;

    const { rows } = await pool.query(query, [reportType]);

    return rows || [];
};

// ============================================================
// CREATE REPORT
// ============================================================
const createReport = async (report = {}) => {
    const {
        admin_id = null,
        system_admin_id = null,
        report_type,
        description = null,
        file_path = null
    } = report;

    // Exactly one owner must be supplied
    if (
        (admin_id === null && system_admin_id === null) ||
        (admin_id !== null && system_admin_id !== null)
    ) {
        throw new Error(
            "Exactly one of admin_id or system_admin_id must be provided."
        );
    }

    if (!report_type) {
        throw new Error("Report type is required.");
    }

    const query = `
        INSERT INTO reports (
            admin_id,
            system_admin_id,
            report_type,
            description,
            file_path
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
    `;

    const values = [
        admin_id,
        system_admin_id,
        report_type,
        description,
        file_path
    ];

    const { rows } = await pool.query(query, values);

    return rows[0] || null;
};

// ============================================================
// UPDATE REPORT
// ============================================================
const updateReport = async (id, report = {}) => {
    const {
        report_type,
        description = null,
        file_path = null
    } = report;

    if (!report_type) {
        throw new Error("Report type is required.");
    }

    const query = `
        UPDATE reports
        SET
            report_type = $1,
            description = $2,
            file_path = $3
        WHERE report_id = $4
        RETURNING *
    `;

    const values = [
        report_type,
        description,
        file_path,
        id
    ];

    const { rows } = await pool.query(query, values);

    return rows[0] || null;
};

// ============================================================
// DELETE REPORT
// ============================================================
const deleteReport = async (id) => {
    const query = `
        DELETE FROM reports
        WHERE report_id = $1
        RETURNING *
    `;

    const { rows } = await pool.query(query, [id]);

    return rows[0] || null;
};

// ============================================================
// MUNICIPAL REPORTS
// ============================================================
const getMunicipalReports = async (filters = {}) => {
    try {
        // ========================================================
        // SAFE FILTER OBJECT
        // ========================================================
        const safeFilters =
            filters &&
            typeof filters === "object" &&
            !Array.isArray(filters)
                ? filters
                : {};

        // ========================================================
        // REPORT TYPE
        // ========================================================
        const rawReportType = String(
            safeFilters.reportType || "all"
        )
            .trim()
            .toLowerCase();

        const reportTypeMap = {
            all: "all",

            requests: "requests",
            request: "requests",
            collection_requests: "requests",
            collection_request: "requests",
            "collection requests": "requests",
            "collection request": "requests",

            schedules: "schedules",
            schedule: "schedules",
            collection_schedules: "schedules",
            collection_schedule: "schedules",
            "collection schedules": "schedules",
            "collection schedule": "schedules"
        };

        const reportType =
            reportTypeMap[rawReportType] || "all";

        // ========================================================
        // PERIOD
        // ========================================================
        const rawPeriod = String(
            safeFilters.period || "all"
        )
            .trim()
            .toLowerCase();

        const period = [
            "all",
            "daily",
            "weekly",
            "monthly",
            "custom"
        ].includes(rawPeriod)
            ? rawPeriod
            : "all";

        // ========================================================
        // DATE
        // ========================================================
        const date =
            safeFilters.date !== undefined &&
            safeFilters.date !== null &&
            String(safeFilters.date).trim() !== ""
                ? String(safeFilters.date).trim()
                : null;

        const startDate =
            safeFilters.startDate !== undefined &&
            safeFilters.startDate !== null &&
            String(safeFilters.startDate).trim() !== ""
                ? String(safeFilters.startDate).trim()
                : null;

        const endDate =
            safeFilters.endDate !== undefined &&
            safeFilters.endDate !== null &&
            String(safeFilters.endDate).trim() !== ""
                ? String(safeFilters.endDate).trim()
                : null;

        // ========================================================
        // STATUS
        // ========================================================
        const rawStatus =
            safeFilters.status === undefined ||
            safeFilters.status === null
                ? "all"
                : String(safeFilters.status).trim();

        const status =
            rawStatus === "" ||
            rawStatus.toLowerCase() === "all"
                ? "all"
                : rawStatus;

        const normalizedStatus =
            status.toLowerCase();

        // ========================================================
        // REQUEST STATUSES
        // ========================================================
        const requestStatuses = [
            "pending",
            "approved",
            "assigned",
            "in progress",
            "collected",
            "completed",
            "rejected",
            "cancelled",
            "canceled"
        ];

        // ========================================================
        // SCHEDULE STATUSES
        // ========================================================
        const scheduleStatuses = [
            "active",
            "inactive"
        ];

        // ========================================================
        // TEAM ID
        // ========================================================
        let teamId = null;

        if (
            safeFilters.teamId !== undefined &&
            safeFilters.teamId !== null
        ) {
            const rawTeamId =
                String(safeFilters.teamId).trim();

            if (
                rawTeamId !== "" &&
                rawTeamId.toLowerCase() !== "all"
            ) {
                const parsedTeamId =
                    Number(rawTeamId);

                if (
                    Number.isInteger(parsedTeamId) &&
                    parsedTeamId > 0
                ) {
                    teamId = parsedTeamId;
                }
            }
        }

        // ========================================================
        // LOCATION NORMALIZER
        // ========================================================
        const normalizeLocation = (value) => {
            if (
                value === undefined ||
                value === null
            ) {
                return null;
            }

            const text = String(value).trim();

            if (
                text === "" ||
                text.toLowerCase() === "all"
            ) {
                return null;
            }

            return text;
        };

        const kebele =
            normalizeLocation(
                safeFilters.kebele
            );

        const sefer =
            normalizeLocation(
                safeFilters.sefer
            );

        // ========================================================
        // DEBUG
        // ========================================================
        console.log("");
        console.log("==========================================");
        console.log("MUNICIPAL REPORT FILTERS");
        console.log("==========================================");
        console.log({
            reportType,
            period,
            date,
            startDate,
            endDate,
            status,
            teamId,
            kebele,
            sefer
        });
        console.log("==========================================");

        // ========================================================
        // REQUEST CONDITIONS
        // ========================================================
        const requestConditions = [];
        const requestParams = [];

        let requestIndex = 1;

        // DATE
        if (period === "daily" && date) {
            requestConditions.push(
                `DATE(odr.created_at) = $${requestIndex}::date`
            );

            requestParams.push(date);
            requestIndex++;
        }

        else if (period === "weekly" && date) {
            requestConditions.push(`
                DATE(odr.created_at)
                BETWEEN
                    $${requestIndex}::date - INTERVAL '6 days'
                    AND $${requestIndex}::date
            `);

            requestParams.push(date);
            requestIndex++;
        }

        else if (period === "monthly" && date) {
            requestConditions.push(`
                DATE_TRUNC('month', odr.created_at)
                =
                DATE_TRUNC('month', $${requestIndex}::date)
            `);

            requestParams.push(date);
            requestIndex++;
        }

        else if (
            period === "custom" &&
            startDate &&
            endDate
        ) {
            requestConditions.push(`
                DATE(odr.created_at)
                BETWEEN
                    $${requestIndex}::date
                    AND $${requestIndex + 1}::date
            `);

            requestParams.push(
                startDate,
                endDate
            );

            requestIndex += 2;
        }

        // STATUS
        if (
            status !== "all" &&
            requestStatuses.includes(normalizedStatus)
        ) {
            requestConditions.push(`
                LOWER(TRIM(COALESCE(odr.status, '')))
                =
                LOWER(TRIM($${requestIndex}))
            `);

            requestParams.push(status);
            requestIndex++;
        }

        // TEAM
        if (teamId !== null) {
            requestConditions.push(
                `odr.team_id = $${requestIndex}`
            );

            requestParams.push(teamId);
            requestIndex++;
        }

        // KEBELE
        if (kebele !== null) {
            requestConditions.push(`
                LOWER(TRIM(COALESCE(odr.kebele, '')))
                =
                LOWER(TRIM($${requestIndex}))
            `);

            requestParams.push(kebele);
            requestIndex++;
        }

        // SEFER
        if (sefer !== null) {
            requestConditions.push(`
                LOWER(TRIM(COALESCE(odr.sefer, '')))
                =
                LOWER(TRIM($${requestIndex}))
            `);

            requestParams.push(sefer);
            requestIndex++;
        }

        const requestWhere =
            requestConditions.length > 0
                ? `WHERE ${requestConditions.join("\nAND ")}`
                : "";

        // ========================================================
        // SCHEDULE CONDITIONS
        // ========================================================
        const scheduleConditions = [];
        const scheduleParams = [];

        let scheduleIndex = 1;

        // DATE
        if (period === "daily" && date) {
            scheduleConditions.push(
                `DATE(cs.initial_date) = $${scheduleIndex}::date`
            );

            scheduleParams.push(date);
            scheduleIndex++;
        }

        else if (period === "weekly" && date) {
            scheduleConditions.push(`
                DATE(cs.initial_date)
                BETWEEN
                    $${scheduleIndex}::date - INTERVAL '6 days'
                    AND $${scheduleIndex}::date
            `);

            scheduleParams.push(date);
            scheduleIndex++;
        }

        else if (period === "monthly" && date) {
            scheduleConditions.push(`
                DATE_TRUNC('month', cs.initial_date)
                =
                DATE_TRUNC('month', $${scheduleIndex}::date)
            `);

            scheduleParams.push(date);
            scheduleIndex++;
        }

        else if (
            period === "custom" &&
            startDate &&
            endDate
        ) {
            scheduleConditions.push(`
                DATE(cs.initial_date)
                BETWEEN
                    $${scheduleIndex}::date
                    AND $${scheduleIndex + 1}::date
            `);

            scheduleParams.push(
                startDate,
                endDate
            );

            scheduleIndex += 2;
        }

        // STATUS
        if (
            status !== "all" &&
            scheduleStatuses.includes(normalizedStatus)
        ) {
            scheduleConditions.push(`
                LOWER(TRIM(COALESCE(cs.status, '')))
                =
                LOWER(TRIM($${scheduleIndex}))
            `);

            scheduleParams.push(status);
            scheduleIndex++;
        }

        // TEAM
        if (teamId !== null) {
            scheduleConditions.push(
                `cs.team_id = $${scheduleIndex}`
            );

            scheduleParams.push(teamId);
            scheduleIndex++;
        }

        // KEBELE
        if (kebele !== null) {
            scheduleConditions.push(`
                LOWER(TRIM(COALESCE(cs.kebele, '')))
                =
                LOWER(TRIM($${scheduleIndex}))
            `);

            scheduleParams.push(kebele);
            scheduleIndex++;
        }

        // SEFER
        if (sefer !== null) {
            scheduleConditions.push(`
                LOWER(TRIM(COALESCE(cs.sefer, '')))
                =
                LOWER(TRIM($${scheduleIndex}))
            `);

            scheduleParams.push(sefer);
            scheduleIndex++;
        }

        const scheduleWhere =
            scheduleConditions.length > 0
                ? `WHERE ${scheduleConditions.join("\nAND ")}`
                : "";

        // ========================================================
        // REQUEST DATA
        // ========================================================
        let requests = [];

        if (
            reportType === "all" ||
            reportType === "requests"
        ) {
            const requestQuery = `
                SELECT
                    odr.request_id,

                    'REQUEST' AS report_type,

                    odr.status,

                    odr.preferred_collection_date
                        AS requested_date,

                    odr.preferred_collection_date,

                    odr.created_at,

                    odr.updated_at,

                    odr.business_id,

                    bo.business_name,

                    bo.owner_name,

                    bo.phone_number
                        AS business_phone,

                    bo.email
                        AS business_email,

                    bo.house_number,

                    odr.kifle_ketema,

                    odr.kebele,

                    odr.sefer,

                    odr.latitude,

                    odr.longitude,

                    odr.description,

                    odr.team_id,

                    odr.collector_id,

                    ct.team_name,

                    COALESCE(
                        ct.team_leader_id,
                        odr.collector_id
                    ) AS team_leader_id,

                    leader.full_name
                        AS team_leader_name,

                    leader.phone_number
                        AS team_leader_phone,

                    leader.email
                        AS team_leader_email,

                    request_collector.full_name
                        AS collector_name,

                    request_collector.phone_number
                        AS collector_phone,

                    request_collector.email
                        AS collector_email

                FROM on_demand_requests odr

                LEFT JOIN business_owners bo
                    ON bo.business_id =
                       odr.business_id

                LEFT JOIN collection_teams ct
                    ON ct.team_id =
                       odr.team_id

                LEFT JOIN collectors leader
                    ON leader.collector_id =
                       COALESCE(
                           ct.team_leader_id,
                           odr.collector_id
                       )

                LEFT JOIN collectors request_collector
                    ON request_collector.collector_id =
                       odr.collector_id

                ${requestWhere}

                ORDER BY
                    odr.created_at DESC,
                    odr.request_id DESC
            `;

            console.log(
                "REQUEST WHERE:",
                requestWhere
            );

            console.log(
                "REQUEST PARAMS:",
                requestParams
            );

            const result =
                await pool.query(
                    requestQuery,
                    requestParams
                );

            requests =
                result.rows || [];

            // ====================================================
            // TEAM MEMBERS
            // ====================================================
            for (const request of requests) {
                request.team_members = [];

                if (!request.team_id) {
                    continue;
                }

                const membersQuery = `
                    SELECT
                        c.collector_id,
                        c.full_name,
                        c.phone_number,
                        c.email
                    FROM collection_team_members ctm

                    INNER JOIN collectors c
                        ON c.collector_id =
                           ctm.collector_id

                    WHERE ctm.team_id = $1

                    AND (
                        $2::integer IS NULL
                        OR c.collector_id <> $2::integer
                    )

                    ORDER BY c.full_name ASC
                `;

                const membersResult =
                    await pool.query(
                        membersQuery,
                        [
                            request.team_id,
                            request.team_leader_id || null
                        ]
                    );

                request.team_members =
                    membersResult.rows || [];
            }

            // ====================================================
            // LEADER FALLBACK
            // ====================================================
            for (const request of requests) {
                if (
                    !request.team_leader_name &&
                    request.collector_id
                ) {
                    const fallbackQuery = `
                        SELECT
                            collector_id,
                            full_name,
                            phone_number,
                            email
                        FROM collectors
                        WHERE collector_id = $1
                    `;

                    const fallbackResult =
                        await pool.query(
                            fallbackQuery,
                            [request.collector_id]
                        );

                    const collector =
                        fallbackResult.rows[0];

                    if (collector) {
                        request.team_leader_id =
                            collector.collector_id;

                        request.team_leader_name =
                            collector.full_name;

                        request.team_leader_phone =
                            collector.phone_number;

                        request.team_leader_email =
                            collector.email;
                    }
                }

                request.team_leader_name =
                    request.team_leader_name ||
                    "Not Assigned";

                request.team_leader_phone =
                    request.team_leader_phone ||
                    "Not Available";

                request.team_leader_email =
                    request.team_leader_email ||
                    "Not Available";

                request.team_name =
                    request.team_name ||
                    "Not Assigned";

                request.collector_name =
                    request.collector_name ||
                    "Not Assigned";

                request.collector_phone =
                    request.collector_phone ||
                    "Not Available";

                request.collector_email =
                    request.collector_email ||
                    "Not Available";
            }
        }

        // ========================================================
        // SCHEDULE DATA
        // ========================================================
        let schedules = [];

        if (
            reportType === "all" ||
            reportType === "schedules"
        ) {
            const scheduleQuery = `
                SELECT
                    cs.schedule_id,

                    'SCHEDULE' AS report_type,

                    cs.team_id,

                    cs.collector_id,

                    cs.kifle_ketema,

                    cs.kebele,

                    cs.sefer,

                    cs.day_of_week,

                    cs.initial_date,

                    cs.frequency,

                    cs.start_time,

                    cs.end_time,

                    cs.status,

                    cs.created_at,

                    cs.updated_at,

                    ct.team_name,

                    COALESCE(
                        ct.team_leader_id,
                        cs.collector_id
                    ) AS team_leader_id,

                    leader.full_name
                        AS team_leader_name,

                    leader.phone_number
                        AS team_leader_phone,

                    leader.email
                        AS team_leader_email,

                    collector.full_name
                        AS collector_name,

                    collector.phone_number
                        AS collector_phone,

                    collector.email
                        AS collector_email

                FROM collection_schedules cs

                LEFT JOIN collection_teams ct
                    ON ct.team_id =
                       cs.team_id

                LEFT JOIN collectors leader
                    ON leader.collector_id =
                       COALESCE(
                           ct.team_leader_id,
                           cs.collector_id
                       )

                LEFT JOIN collectors collector
                    ON collector.collector_id =
                       cs.collector_id

                ${scheduleWhere}

                ORDER BY
                    cs.initial_date DESC,
                    cs.start_time ASC,
                    cs.schedule_id DESC
            `;

            console.log(
                "SCHEDULE WHERE:",
                scheduleWhere
            );

            console.log(
                "SCHEDULE PARAMS:",
                scheduleParams
            );

            const result =
                await pool.query(
                    scheduleQuery,
                    scheduleParams
                );

            schedules =
                result.rows || [];

            // ====================================================
            // TEAM MEMBERS
            // ====================================================
            for (const schedule of schedules) {
                schedule.team_members = [];

                if (!schedule.team_id) {
                    continue;
                }

                const membersQuery = `
                    SELECT
                        c.collector_id,
                        c.full_name,
                        c.phone_number,
                        c.email
                    FROM collection_team_members ctm

                    INNER JOIN collectors c
                        ON c.collector_id =
                           ctm.collector_id

                    WHERE ctm.team_id = $1

                    AND (
                        $2::integer IS NULL
                        OR c.collector_id <> $2::integer
                    )

                    ORDER BY c.full_name ASC
                `;

                const membersResult =
                    await pool.query(
                        membersQuery,
                        [
                            schedule.team_id,
                            schedule.team_leader_id || null
                        ]
                    );

                schedule.team_members =
                    membersResult.rows || [];
            }

            // ====================================================
            // SCHEDULE LEADER FALLBACK
            // ====================================================
            for (const schedule of schedules) {
                if (
                    !schedule.team_leader_name &&
                    schedule.collector_id
                ) {
                    const fallbackQuery = `
                        SELECT
                            collector_id,
                            full_name,
                            phone_number,
                            email
                        FROM collectors
                        WHERE collector_id = $1
                    `;

                    const fallbackResult =
                        await pool.query(
                            fallbackQuery,
                            [schedule.collector_id]
                        );

                    const collector =
                        fallbackResult.rows[0];

                    if (collector) {
                        schedule.team_leader_id =
                            collector.collector_id;

                        schedule.team_leader_name =
                            collector.full_name;

                        schedule.team_leader_phone =
                            collector.phone_number;

                        schedule.team_leader_email =
                            collector.email;
                    }
                }

                schedule.team_leader_name =
                    schedule.team_leader_name ||
                    "Not Assigned";

                schedule.team_leader_phone =
                    schedule.team_leader_phone ||
                    "Not Available";

                schedule.team_leader_email =
                    schedule.team_leader_email ||
                    "Not Available";

                schedule.team_name =
                    schedule.team_name ||
                    "Not Assigned";

                schedule.collector_name =
                    schedule.collector_name ||
                    "Not Assigned";

                schedule.collector_phone =
                    schedule.collector_phone ||
                    "Not Available";

                schedule.collector_email =
                    schedule.collector_email ||
                    "Not Available";
            }
        }

        // ========================================================
        // TOTAL REQUESTS
        // ========================================================
        let totalRequests = 0;

        if (
            reportType === "all" ||
            reportType === "requests"
        ) {
            const result =
                await pool.query(
                    `
                    SELECT COUNT(*) AS total
                    FROM on_demand_requests odr
                    ${requestWhere}
                    `,
                    requestParams
                );

            totalRequests =
                Number(
                    result.rows[0]?.total || 0
                );
        }

        // ========================================================
        // TOTAL SCHEDULES
        // ========================================================
        let totalSchedules = 0;

        if (
            reportType === "all" ||
            reportType === "schedules"
        ) {
            const result =
                await pool.query(
                    `
                    SELECT COUNT(*) AS total
                    FROM collection_schedules cs
                    ${scheduleWhere}
                    `,
                    scheduleParams
                );

            totalSchedules =
                Number(
                    result.rows[0]?.total || 0
                );
        }

        // ========================================================
        // COMPLETED REQUESTS
        // ========================================================
        let completedRequests = 0;

        if (
            (reportType === "all" ||
                reportType === "requests") &&
            (
                status === "all" ||
                normalizedStatus === "completed"
            )
        ) {
            const conditions = [];
            const params = [];

            let index = 1;

            // DATE
            if (period === "daily" && date) {
                conditions.push(
                    `DATE(odr.created_at) = $${index}::date`
                );

                params.push(date);
                index++;
            }

            else if (period === "weekly" && date) {
                conditions.push(`
                    DATE(odr.created_at)
                    BETWEEN
                        $${index}::date - INTERVAL '6 days'
                        AND $${index}::date
                `);

                params.push(date);
                index++;
            }

            else if (period === "monthly" && date) {
                conditions.push(`
                    DATE_TRUNC('month', odr.created_at)
                    =
                    DATE_TRUNC('month', $${index}::date)
                `);

                params.push(date);
                index++;
            }

            else if (
                period === "custom" &&
                startDate &&
                endDate
            ) {
                conditions.push(`
                    DATE(odr.created_at)
                    BETWEEN
                        $${index}::date
                        AND $${index + 1}::date
                `);

                params.push(
                    startDate,
                    endDate
                );

                index += 2;
            }

            // TEAM
            if (teamId !== null) {
                conditions.push(
                    `odr.team_id = $${index}`
                );

                params.push(teamId);
                index++;
            }

            // KEBELE
            if (kebele !== null) {
                conditions.push(`
                    LOWER(TRIM(COALESCE(odr.kebele, '')))
                    =
                    LOWER(TRIM($${index}))
                `);

                params.push(kebele);
                index++;
            }

            // SEFER
            if (sefer !== null) {
                conditions.push(`
                    LOWER(TRIM(COALESCE(odr.sefer, '')))
                    =
                    LOWER(TRIM($${index}))
                `);

                params.push(sefer);
                index++;
            }

            const where =
                conditions.length > 0
                    ? `AND ${conditions.join("\nAND ")}`
                    : "";

            const result =
                await pool.query(
                    `
                    SELECT COUNT(*) AS total
                    FROM on_demand_requests odr
                    WHERE LOWER(
                        TRIM(
                            COALESCE(
                                odr.status,
                                ''
                            )
                        )
                    ) = 'completed'
                    ${where}
                    `,
                    params
                );

            completedRequests =
                Number(
                    result.rows[0]?.total || 0
                );
        }

        // ========================================================
        // PENDING REQUESTS
        // ========================================================
        let pendingRequests = 0;

        if (
            (reportType === "all" ||
                reportType === "requests") &&
            (
                status === "all" ||
                normalizedStatus === "pending"
            )
        ) {
            const conditions = [];
            const params = [];

            let index = 1;

            // DATE
            if (period === "daily" && date) {
                conditions.push(
                    `DATE(odr.created_at) = $${index}::date`
                );

                params.push(date);
                index++;
            }

            else if (period === "weekly" && date) {
                conditions.push(`
                    DATE(odr.created_at)
                    BETWEEN
                        $${index}::date - INTERVAL '6 days'
                        AND $${index}::date
                `);

                params.push(date);
                index++;
            }

            else if (period === "monthly" && date) {
                conditions.push(`
                    DATE_TRUNC('month', odr.created_at)
                    =
                    DATE_TRUNC('month', $${index}::date)
                `);

                params.push(date);
                index++;
            }

            else if (
                period === "custom" &&
                startDate &&
                endDate
            ) {
                conditions.push(`
                    DATE(odr.created_at)
                    BETWEEN
                        $${index}::date
                        AND $${index + 1}::date
                `);

                params.push(
                    startDate,
                    endDate
                );

                index += 2;
            }

            // TEAM
            if (teamId !== null) {
                conditions.push(
                    `odr.team_id = $${index}`
                );

                params.push(teamId);
                index++;
            }

            // KEBELE
            if (kebele !== null) {
                conditions.push(`
                    LOWER(TRIM(COALESCE(odr.kebele, '')))
                    =
                    LOWER(TRIM($${index}))
                `);

                params.push(kebele);
                index++;
            }

            // SEFER
            if (sefer !== null) {
                conditions.push(`
                    LOWER(TRIM(COALESCE(odr.sefer, '')))
                    =
                    LOWER(TRIM($${index}))
                `);

                params.push(sefer);
                index++;
            }

            const where =
                conditions.length > 0
                    ? `AND ${conditions.join("\nAND ")}`
                    : "";

            const result =
                await pool.query(
                    `
                    SELECT COUNT(*) AS total
                    FROM on_demand_requests odr
                    WHERE LOWER(
                        TRIM(
                            COALESCE(
                                odr.status,
                                ''
                            )
                        )
                    ) = 'pending'
                    ${where}
                    `,
                    params
                );

            pendingRequests =
                Number(
                    result.rows[0]?.total || 0
                );
        }

        // ========================================================
        // TOTAL REGISTERED BUSINESSES
        // ========================================================
        const businessesResult =
            await pool.query(`
                SELECT COUNT(*) AS total
                FROM business_owners
            `);

        const totalBusinesses =
            Number(
                businessesResult.rows[0]?.total || 0
            );

        // ========================================================
        // TOTAL REGISTERED COLLECTORS
        // ========================================================
        const collectorsResult =
            await pool.query(`
                SELECT COUNT(*) AS total
                FROM collectors
            `);

        const totalCollectors =
            Number(
                collectorsResult.rows[0]?.total || 0
            );

        // ========================================================
        // ALL COLLECTION TEAMS
        // ========================================================
        const teamsResult =
            await pool.query(`
                SELECT
                    ct.team_id,
                    ct.team_name,
                    ct.admin_id,
                    ct.kifle_ketema,
                    ct.kebele,
                    ct.team_leader_id,
                    ct.status,

                    leader.full_name
                        AS team_leader_name,

                    leader.phone_number
                        AS team_leader_phone,

                    leader.email
                        AS team_leader_email

                FROM collection_teams ct

                LEFT JOIN collectors leader
                    ON leader.collector_id =
                       ct.team_leader_id

                ORDER BY
                    ct.team_name ASC,
                    ct.team_id ASC
            `);

        const teams =
            teamsResult.rows || [];

        // ========================================================
        // ALL LOCATIONS
        // ========================================================
        const locationQuery = `
            SELECT DISTINCT
                kebele,
                sefer
            FROM (
                SELECT
                    kebele,
                    sefer
                FROM on_demand_requests

                UNION

                SELECT
                    kebele,
                    sefer
                FROM collection_schedules
            ) locations

            ORDER BY
                kebele ASC NULLS LAST,
                sefer ASC NULLS LAST
        `;

        const locationResult =
            await pool.query(locationQuery);

        const locationRows =
            locationResult.rows || [];

        const kebeles = [
            ...new Set(
                locationRows
                    .map(row => row.kebele)
                    .filter(
                        value =>
                            value !== null &&
                            value !== undefined &&
                            String(value).trim() !== ""
                    )
                    .map(value =>
                        String(value).trim()
                    )
            )
        ];

        const sefers = [
            ...new Set(
                locationRows
                    .map(row => row.sefer)
                    .filter(
                        value =>
                            value !== null &&
                            value !== undefined &&
                            String(value).trim() !== ""
                    )
                    .map(value =>
                        String(value).trim()
                    )
            )
        ];

        // ========================================================
        // SUMMARY
        // ========================================================
        const summary = {
            totalBusinesses,
            totalCollectors,
            totalRequests,
            completedRequests,
            pendingRequests,
            totalSchedules
        };

        // ========================================================
        // REPORT LIST
        // ========================================================
        const reports = [
            ...requests.map(request => ({
                id:
                    `request-${request.request_id}`,

                category:
                    "Collection Request",

                total: 1,

                status:
                    request.status,

                updated_at:
                    request.updated_at ||
                    request.created_at
            })),

            ...schedules.map(schedule => ({
                id:
                    `schedule-${schedule.schedule_id}`,

                category:
                    "Collection Schedule",

                total: 1,

                status:
                    schedule.status,

                updated_at:
                    schedule.updated_at ||
                    schedule.created_at
            }))
        ];

        // ========================================================
        // FINAL RESULT
        // ========================================================
        const finalResult = {
            summary,

            reports,

            requests,

            schedules,

            teams,

            locations: {
                kebeles,
                sefers
            }
        };

        // ========================================================
        // DEBUG
        // ========================================================
        console.log("");
        console.log("==========================================");
        console.log("MUNICIPAL REPORT SUCCESS");
        console.log("==========================================");

        console.log("Report Type:", reportType);
        console.log("Period:", period);
        console.log("Status:", status);
        console.log("Team ID:", teamId);
        console.log("Kebele:", kebele);
        console.log("Sefer:", sefer);

        console.log(
            "Request Count:",
            requests.length
        );

        console.log(
            "Schedule Count:",
            schedules.length
        );

        console.log(
            "Team Count:",
            teams.length
        );

        console.log(
            "Location Data:",
            {
                kebeles,
                sefers
            }
        );

        console.log(
            "Summary:",
            summary
        );

        if (requests.length > 0) {
            console.log("FIRST REQUEST:", {
                request_id:
                    requests[0].request_id,

                business_name:
                    requests[0].business_name,

                team_id:
                    requests[0].team_id,

                team_name:
                    requests[0].team_name,

                collector_id:
                    requests[0].collector_id,

                collector_name:
                    requests[0].collector_name,

                team_leader_id:
                    requests[0].team_leader_id,

                team_leader_name:
                    requests[0].team_leader_name,

                team_members:
                    requests[0].team_members
            });
        }

        if (schedules.length > 0) {
            console.log("FIRST SCHEDULE:", {
                schedule_id:
                    schedules[0].schedule_id,

                team_id:
                    schedules[0].team_id,

                team_name:
                    schedules[0].team_name,

                collector_id:
                    schedules[0].collector_id,

                collector_name:
                    schedules[0].collector_name,

                team_leader_id:
                    schedules[0].team_leader_id,

                team_leader_name:
                    schedules[0].team_leader_name,

                initial_date:
                    schedules[0].initial_date,

                sefer:
                    schedules[0].sefer,

                team_members:
                    schedules[0].team_members
            });
        }

        console.log("==========================================");

        return finalResult;

    } catch (error) {
        console.error("");
        console.error("==========================================");
        console.error(
            "GET MUNICIPAL REPORTS REPOSITORY ERROR"
        );
        console.error("==========================================");

        console.error(
            "Message:",
            error.message
        );

        console.error(
            "Code:",
            error.code
        );

        console.error(
            "Detail:",
            error.detail
        );

        console.error(
            "Hint:",
            error.hint
        );

        console.error(
            "Stack:",
            error.stack
        );

        console.error("==========================================");

        throw error;
    }
};

// ============================================================
// REPORT STATISTICS
// ============================================================
const reportStatistics = async () => {
    const businesses = await pool.query(`
        SELECT COUNT(*) AS total
        FROM business_owners
    `);

    const collectors = await pool.query(`
        SELECT COUNT(*) AS total
        FROM collectors
    `);

    const requests = await pool.query(`
        SELECT COUNT(*) AS total
        FROM on_demand_requests
    `);

    const schedules = await pool.query(`
        SELECT COUNT(*) AS total
        FROM collection_schedules
    `);

    const feedback = await pool.query(`
        SELECT COUNT(*) AS total
        FROM feedback
    `);

    return {
        businesses:
            Number(
                businesses.rows[0]?.total || 0
            ),

        collectors:
            Number(
                collectors.rows[0]?.total || 0
            ),

        requests:
            Number(
                requests.rows[0]?.total || 0
            ),

        schedules:
            Number(
                schedules.rows[0]?.total || 0
            ),

        feedback:
            Number(
                feedback.rows[0]?.total || 0
            )
    };
};

// ============================================================
// EXPORT
// ============================================================
module.exports = {
    getAllReports,
    getReportById,
    getReportsByAdmin,
    getReportsBySystemAdmin,
    getReportsByType,
    createReport,
    updateReport,
    deleteReport,
    getMunicipalReports,
    reportStatistics
};
