
const db = require("../config/db");
const reportRepository = require("../repositories/reportRepository");

// ============================================================
// DEFAULT MUNICIPAL REPORT RESULT
// ============================================================
const emptyMunicipalReport = () => ({
    summary: {
        totalBusinesses: 0,
        totalCollectors: 0,
        totalRequests: 0,
        completedRequests: 0,
        pendingRequests: 0,
        totalSchedules: 0
    },

    reports: [],

    requests: [],

    schedules: [],

    teams: [],

    locations: {
        kebeles: [],
        sefers: []
    }
});

// ============================================================
// CREATE REPORT
// ============================================================
const createReport = async (data = {}) => {
    const {
        admin_id,
        system_admin_id = null,
        report_type,
        description = null,
        file_path = null
    } = data;

    // --------------------------------------------------------
    // Validate generator
    // --------------------------------------------------------
    if (!admin_id && !system_admin_id) {
        const error = new Error(
            "Either admin_id or system_admin_id is required."
        );

        error.statusCode = 400;

        throw error;
    }

    // Both cannot be provided
    if (admin_id && system_admin_id) {
        const error = new Error(
            "Only one of admin_id or system_admin_id can be provided."
        );

        error.statusCode = 400;

        throw error;
    }

    // --------------------------------------------------------
    // Validate report type
    // --------------------------------------------------------
    if (
        !report_type ||
        String(report_type).trim() === ""
    ) {
        const error = new Error(
            "report_type is required."
        );

        error.statusCode = 400;

        throw error;
    }

    // --------------------------------------------------------
    // Insert
    // --------------------------------------------------------
    const result = await db.query(
        `
        INSERT INTO reports
        (
            admin_id,
            system_admin_id,
            report_type,
            description,
            file_path
        )
        VALUES
        ($1, $2, $3, $4, $5)
        RETURNING *
        `,
        [
            admin_id || null,
            system_admin_id || null,
            String(report_type).trim(),
            description,
            file_path
        ]
    );

    return result.rows[0] || null;
};

// ============================================================
// GET ALL REPORTS
// ============================================================
const getReports = async () => {
    const result = await db.query(
        `
        SELECT
            r.*,

            ma.full_name AS admin_name,

            sa.full_name AS system_admin_name

        FROM reports r

        LEFT JOIN municipal_administrators ma
            ON ma.admin_id = r.admin_id

        LEFT JOIN system_administrators sa
            ON sa.system_admin_id = r.system_admin_id

        ORDER BY
            r.report_id DESC
        `
    );

    return result.rows || [];
};

// ============================================================
// GET MUNICIPAL REPORTS
// ============================================================
const getMunicipalReports = async (filters = {}) => {

    console.log("");
    console.log("==========================================");
    console.log("REPORT SERVICE - MUNICIPAL REPORTS");
    console.log("==========================================");
    console.log("Incoming filters:");
    console.log(filters);
    console.log("==========================================");

    try {

        // ========================================================
        // SAFE FILTERS
        // ========================================================
        const safeFilters =
            filters &&
            typeof filters === "object" &&
            !Array.isArray(filters)
                ? filters
                : {};

        // ========================================================
        // REPOSITORY
        // ========================================================
        const result =
            await reportRepository.getMunicipalReports(
                safeFilters
            );

        // ========================================================
        // EMPTY RESULT
        // ========================================================
        if (!result) {

            console.log(
                "REPORT SERVICE: Repository returned nothing."
            );

            return emptyMunicipalReport();
        }

        // ========================================================
        // SUMMARY
        // ========================================================
        const summary = {
            totalBusinesses: Number(
                result.summary?.totalBusinesses ?? 0
            ),

            totalCollectors: Number(
                result.summary?.totalCollectors ?? 0
            ),

            totalRequests: Number(
                result.summary?.totalRequests ?? 0
            ),

            completedRequests: Number(
                result.summary?.completedRequests ?? 0
            ),

            pendingRequests: Number(
                result.summary?.pendingRequests ?? 0
            ),

            totalSchedules: Number(
                result.summary?.totalSchedules ?? 0
            )
        };

        // ========================================================
        // REQUESTS
        // ========================================================
        const requests =
            Array.isArray(result.requests)
                ? result.requests.map((request) => {

                    return {
                        ...request,

                        request_id:
                            request.request_id ?? null,

                        business_id:
                            request.business_id ?? null,

                        business_name:
                            request.business_name ||
                            "Not Available",

                        owner_name:
                            request.owner_name ||
                            "Not Available",

                        business_phone:
                            request.business_phone ||
                            "Not Available",

                        business_email:
                            request.business_email ||
                            "Not Available",

                        house_number:
                            request.house_number ||
                            "Not Available",

                        // ------------------------------------------------
                        // LOCATION
                        // ------------------------------------------------
                        kifle_ketema:
                            request.kifle_ketema ||
                            "Not Available",

                        kebele:
                            request.kebele ||
                            "Not Available",

                        sefer:
                            request.sefer ||
                            "Not Available",

                        // ------------------------------------------------
                        // TEAM
                        // ------------------------------------------------
                        team_id:
                            request.team_id ?? null,

                        team_name:
                            request.team_name ||
                            "Not Assigned",

                        // ------------------------------------------------
                        // LEADER / DRIVER
                        // ------------------------------------------------
                        team_leader_id:
                            request.team_leader_id ??
                            request.collector_id ??
                            null,

                        team_leader_name:
                            request.team_leader_name ||
                            "Not Assigned",

                        team_leader_phone:
                            request.team_leader_phone ||
                            "Not Available",

                        team_leader_email:
                            request.team_leader_email ||
                            "Not Available",

                        // ------------------------------------------------
                        // COLLECTOR
                        // ------------------------------------------------
                        collector_id:
                            request.collector_id ?? null,

                        collector_name:
                            request.collector_name ||
                            "Not Assigned",

                        collector_phone:
                            request.collector_phone ||
                            "Not Available",

                        collector_email:
                            request.collector_email ||
                            "Not Available",

                        // ------------------------------------------------
                        // TEAM MEMBERS
                        // ------------------------------------------------
                        team_members:
                            Array.isArray(
                                request.team_members
                            )
                                ? request.team_members
                                : [],

                        // ------------------------------------------------
                        // REQUEST DATA
                        // ------------------------------------------------
                        preferred_collection_date:
                            request.preferred_collection_date ??
                            null,

                        requested_date:
                            request.requested_date ??
                            request.preferred_collection_date ??
                            null,

                        description:
                            request.description ||
                            "",

                        latitude:
                            request.latitude ?? null,

                        longitude:
                            request.longitude ?? null,

                        created_at:
                            request.created_at ??
                            null,

                        updated_at:
                            request.updated_at ??
                            null,

                        status:
                            request.status ||
                            "Pending"
                    };
                })
                : [];

        // ========================================================
        // SCHEDULES
        // ========================================================
        const schedules =
            Array.isArray(result.schedules)
                ? result.schedules.map((schedule) => {

                    return {
                        ...schedule,

                        schedule_id:
                            schedule.schedule_id ?? null,

                        // ------------------------------------------------
                        // TEAM
                        // ------------------------------------------------
                        team_id:
                            schedule.team_id ?? null,

                        team_name:
                            schedule.team_name ||
                            "Not Assigned",

                        // ------------------------------------------------
                        // LEADER / DRIVER
                        // ------------------------------------------------
                        team_leader_id:
                            schedule.team_leader_id ??
                            schedule.collector_id ??
                            null,

                        team_leader_name:
                            schedule.team_leader_name ||
                            schedule.collector_name ||
                            "Not Assigned",

                        team_leader_phone:
                            schedule.team_leader_phone ||
                            "Not Available",

                        team_leader_email:
                            schedule.team_leader_email ||
                            "Not Available",

                        // ------------------------------------------------
                        // COLLECTOR
                        // ------------------------------------------------
                        collector_id:
                            schedule.collector_id ?? null,

                        collector_name:
                            schedule.collector_name ||
                            "Not Assigned",

                        collector_phone:
                            schedule.collector_phone ||
                            "Not Available",

                        collector_email:
                            schedule.collector_email ||
                            "Not Available",

                        // ------------------------------------------------
                        // TEAM MEMBERS
                        // ------------------------------------------------
                        team_members:
                            Array.isArray(
                                schedule.team_members
                            )
                                ? schedule.team_members
                                : [],

                        // ------------------------------------------------
                        // LOCATION
                        // ------------------------------------------------
                        kifle_ketema:
                            schedule.kifle_ketema ||
                            "Not Available",

                        kebele:
                            schedule.kebele ||
                            "Not Available",

                        sefer:
                            schedule.sefer ||
                            "Not Available",

                        // ------------------------------------------------
                        // SCHEDULE DATA
                        // ------------------------------------------------
                        day_of_week:
                            schedule.day_of_week ||
                            "Not Available",

                        initial_date:
                            schedule.initial_date ??
                            null,

                        frequency:
                            schedule.frequency ||
                            "Every 2 Weeks",

                        start_time:
                            schedule.start_time ??
                            null,

                        end_time:
                            schedule.end_time ??
                            null,

                        status:
                            schedule.status ||
                            "ACTIVE",

                        created_at:
                            schedule.created_at ??
                            null,

                        updated_at:
                            schedule.updated_at ??
                            null
                    };
                })
                : [];

        // ========================================================
        // REPORTS
        // ========================================================
        const reports =
            Array.isArray(result.reports)
                ? result.reports.map((report) => ({
                    ...report,

                    id:
                        report.id ??
                        null,

                    category:
                        report.category ||
                        "Report",

                    total:
                        Number(
                            report.total ?? 0
                        ),

                    status:
                        report.status ||
                        "Unknown",

                    updated_at:
                        report.updated_at ??
                        null
                }))
                : [];

        // ========================================================
        // TEAMS
        // ========================================================
        const teams =
            Array.isArray(result.teams)
                ? result.teams.map((team) => ({
                    ...team,

                    team_id:
                        team.team_id ?? null,

                    team_name:
                        team.team_name ||
                        "Unnamed Team",

                    admin_id:
                        team.admin_id ?? null,

                    kifle_ketema:
                        team.kifle_ketema ||
                        "Not Available",

                    kebele:
                        team.kebele ||
                        "Not Available",

                    team_leader_id:
                        team.team_leader_id ??
                        null,

                    team_leader_name:
                        team.team_leader_name ||
                        "Not Assigned",

                    team_leader_phone:
                        team.team_leader_phone ||
                        "Not Available",

                    team_leader_email:
                        team.team_leader_email ||
                        "Not Available",

                    status:
                        team.status ||
                        "INACTIVE"
                }))
                : [];

        // ========================================================
        // LOCATIONS
        // ========================================================
        const locations = {
            kebeles:
                Array.isArray(
                    result.locations?.kebeles
                )
                    ? [
                        ...new Set(
                            result.locations.kebeles
                                .filter(
                                    value =>
                                        value !== null &&
                                        value !== undefined &&
                                        String(value).trim() !== ""
                                )
                                .map(
                                    value =>
                                        String(value).trim()
                                )
                        )
                    ]
                    : [],

            sefers:
                Array.isArray(
                    result.locations?.sefers
                )
                    ? [
                        ...new Set(
                            result.locations.sefers
                                .filter(
                                    value =>
                                        value !== null &&
                                        value !== undefined &&
                                        String(value).trim() !== ""
                                )
                                .map(
                                    value =>
                                        String(value).trim()
                                )
                        )
                    ]
                    : []
        };

        // ========================================================
        // DEBUG
        // ========================================================
        console.log("");
        console.log("==========================================");
        console.log("REPORT SERVICE RESULT");
        console.log("==========================================");

        console.log(
            "Summary:",
            summary
        );

        console.log(
            "Requests:",
            requests.length
        );

        console.log(
            "Schedules:",
            schedules.length
        );

        console.log(
            "Reports:",
            reports.length
        );

        console.log(
            "Teams:",
            teams.length
        );

        console.log(
            "Locations:",
            locations
        );

        // ========================================================
        // FILTER DEBUG
        // ========================================================
        console.log("");
        console.log("ACTIVE FILTERS:");
        console.log({
            reportType:
                safeFilters.reportType ?? "all",

            period:
                safeFilters.period ?? "all",

            status:
                safeFilters.status ?? "all",

            teamId:
                safeFilters.teamId ?? "all",

            kebele:
                safeFilters.kebele ?? "all",

            sefer:
                safeFilters.sefer ?? "all"
        });

        // ========================================================
        // FIRST REQUEST DEBUG
        // ========================================================
        if (requests.length > 0) {

            console.log("");
            console.log("FIRST REQUEST:");

            console.log({
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

                kifle_ketema:
                    requests[0].kifle_ketema,

                kebele:
                    requests[0].kebele,

                sefer:
                    requests[0].sefer,

                status:
                    requests[0].status,

                team_members:
                    requests[0].team_members
            });
        }

        // ========================================================
        // FIRST SCHEDULE DEBUG
        // ========================================================
        if (schedules.length > 0) {

            console.log("");
            console.log("FIRST SCHEDULE:");

            console.log({
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

                kifle_ketema:
                    schedules[0].kifle_ketema,

                kebele:
                    schedules[0].kebele,

                sefer:
                    schedules[0].sefer,

                initial_date:
                    schedules[0].initial_date,

                status:
                    schedules[0].status,

                team_members:
                    schedules[0].team_members
            });
        }

        console.log("");
        console.log("==========================================");
        console.log("REPORT SERVICE SUCCESS");
        console.log("==========================================");

        // ========================================================
        // FINAL RESULT
        // ========================================================
        return {
            summary,

            reports,

            requests,

            schedules,

            teams,

            locations
        };

    } catch (error) {

        console.error("");
        console.error("==========================================");
        console.error("REPORT SERVICE ERROR");
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
// GET REPORT BY ID
// ============================================================
const getReportById = async (id) => {

    if (!id) {
        return null;
    }

    const result = await db.query(
        `
        SELECT
            r.*,

            ma.full_name AS admin_name,

            sa.full_name AS system_admin_name

        FROM reports r

        LEFT JOIN municipal_administrators ma
            ON ma.admin_id = r.admin_id

        LEFT JOIN system_administrators sa
            ON sa.system_admin_id = r.system_admin_id

        WHERE r.report_id = $1
        `,
        [id]
    );

    return result.rows[0] || null;
};

// ============================================================
// UPDATE REPORT
// ============================================================
const updateReport = async (id, data = {}) => {

    if (!id) {
        const error = new Error(
            "Report ID is required."
        );

        error.statusCode = 400;

        throw error;
    }

    const {
        report_type,
        description = null,
        file_path = null
    } = data;

    // --------------------------------------------------------
    // Validate report type
    // --------------------------------------------------------
    if (
        !report_type ||
        String(report_type).trim() === ""
    ) {
        const error = new Error(
            "report_type is required."
        );

        error.statusCode = 400;

        throw error;
    }

    // --------------------------------------------------------
    // Update
    // --------------------------------------------------------
    const result = await db.query(
        `
        UPDATE reports
        SET
            report_type = $1,
            description = $2,
            file_path = $3
        WHERE report_id = $4
        RETURNING *
        `,
        [
            String(report_type).trim(),
            description,
            file_path,
            id
        ]
    );

    return result.rows[0] || null;
};

// ============================================================
// DELETE REPORT
// ============================================================
const deleteReport = async (id) => {

    if (!id) {
        return null;
    }

    const result = await db.query(
        `
        DELETE FROM reports
        WHERE report_id = $1
        RETURNING *
        `,
        [id]
    );

    return result.rows[0] || null;
};

// ============================================================
// REPORT STATISTICS
// ============================================================
const reportStatistics = async () => {

    const residents = await db.query(
        `
        SELECT COUNT(*) AS total
        FROM residents
        `
    );

    const businesses = await db.query(
        `
        SELECT COUNT(*) AS total
        FROM business_owners
        `
    );

    const collectors = await db.query(
        `
        SELECT COUNT(*) AS total
        FROM collectors
        `
    );

    const requests = await db.query(
        `
        SELECT COUNT(*) AS total
        FROM on_demand_requests
        `
    );

    const schedules = await db.query(
        `
        SELECT COUNT(*) AS total
        FROM collection_schedules
        `
    );

    const feedback = await db.query(
        `
        SELECT COUNT(*) AS total
        FROM feedback
        `
    );

    return {
        residents:
            Number(
                residents.rows[0]?.total || 0
            ),

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
// EXPORTS
// ============================================================
module.exports = {
    createReport,
    getReports,
    getMunicipalReports,
    getReportById,
    updateReport,
    deleteReport,
    reportStatistics
};
