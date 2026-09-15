
const reportService = require("../services/reportService");

// ============================================================
// HELPER: SAFE NUMBER
// ============================================================
const safeNumber = (value, fallback = 0) => {
    const number = Number(value);

    return Number.isFinite(number)
        ? number
        : fallback;
};

// ============================================================
// HELPER: NORMALIZE STRING
// ============================================================
const normalizeString = (value, fallback = null) => {
    if (
        value === undefined ||
        value === null
    ) {
        return fallback;
    }

    const normalized = String(value).trim();

    if (!normalized) {
        return fallback;
    }

    return normalized;
};

// ============================================================
// HELPER: NORMALIZE "ALL"
// ============================================================
const normalizeFilterValue = (value) => {
    const normalized =
        normalizeString(value, null);

    if (!normalized) {
        return null;
    }

    if (
        normalized.toLowerCase() === "all"
    ) {
        return null;
    }

    return normalized;
};

// ============================================================
// HELPER: VALIDATE DATE
// ============================================================
const isValidDate = (value) => {
    if (!value) {
        return false;
    }

    if (
        typeof value !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(value)
    ) {
        return false;
    }

    const [year, month, day] =
        value.split("-").map(Number);

    const date = new Date(
        year,
        month - 1,
        day
    );

    return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
    );
};

// ============================================================
// CREATE REPORT
// ============================================================
const createReport = async (
    req,
    res,
    next
) => {
    try {
        const report =
            await reportService.createReport(
                req.body || {}
            );

        return res.status(201).json({
            success: true,
            message:
                "Report created successfully.",
            data: report,
        });
    } catch (error) {
        console.error(
            "CREATE REPORT ERROR:",
            error
        );

        next(error);
    }
};

// ============================================================
// GET ALL REPORTS
// ============================================================
const getAllReports = async (
    req,
    res,
    next
) => {
    try {
        const reports =
            await reportService.getReports();

        return res.status(200).json({
            success: true,
            data: Array.isArray(reports)
                ? reports
                : [],
        });
    } catch (error) {
        console.error(
            "GET ALL REPORTS ERROR:",
            error
        );

        next(error);
    }
};

// ============================================================
// MUNICIPAL REPORTS
// ============================================================
const getMunicipalReports = async (
    req,
    res,
    next
) => {
    try {
        // ======================================================
        // 1. REPORT TYPE
        // ======================================================
        const rawReportType =
            normalizeString(
                req.query?.reportType,
                "all"
            ).toLowerCase();

        const reportTypeMap = {
            all: "all",

            requests: "requests",
            request: "requests",
            collection_requests: "requests",
            "collection requests": "requests",
            "collection request": "requests",

            schedules: "schedules",
            schedule: "schedules",
            collection_schedules: "schedules",
            "collection schedules": "schedules",
            "collection schedule": "schedules",
        };

        const reportType =
            reportTypeMap[
                rawReportType
            ];

        if (!reportType) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid report type.",
            });
        }

        // ======================================================
        // 2. PERIOD
        // ======================================================
        const period =
            normalizeString(
                req.query?.period,
                "daily"
            ).toLowerCase();

        const allowedPeriods = [
            "all",
            "daily",
            "weekly",
            "monthly",
            "custom",
        ];

        if (
            !allowedPeriods.includes(
                period
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid report period.",
            });
        }

        // ======================================================
        // 3. STATUS
        // ======================================================
        const status =
            normalizeFilterValue(
                req.query?.status
            ) || "all";

        // ======================================================
        // 4. DATE
        // ======================================================
        const date =
            normalizeString(
                req.query?.date
            );

        // ======================================================
        // 5. START DATE
        // ======================================================
        const startDate =
            normalizeString(
                req.query?.startDate
            );

        // ======================================================
        // 6. END DATE
        // ======================================================
        const endDate =
            normalizeString(
                req.query?.endDate
            );

        // ======================================================
        // 7. DATE VALIDATION
        // ======================================================

        // Daily / Weekly / Monthly
        if (
            [
                "daily",
                "weekly",
                "monthly",
            ].includes(period)
        ) {
            if (!date) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Date is required for daily, weekly and monthly reports.",
                });
            }

            if (!isValidDate(date)) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid report date. Use YYYY-MM-DD.",
                });
            }
        }

        // ======================================================
        // 8. CUSTOM DATE VALIDATION
        // ======================================================
        if (period === "custom") {
            if (
                !startDate ||
                !endDate
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Start date and end date are required for custom reports.",
                });
            }

            if (
                !isValidDate(startDate) ||
                !isValidDate(endDate)
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid custom report dates. Use YYYY-MM-DD.",
                });
            }

            if (startDate > endDate) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Start date cannot be after end date.",
                });
            }
        }

        // ======================================================
        // 9. TEAM ID
        // ======================================================
        let teamId = null;

        const rawTeamId =
            req.query?.teamId;

        if (
            rawTeamId !== undefined &&
            rawTeamId !== null
        ) {
            const value =
                String(rawTeamId).trim();

            if (
                value === "" ||
                value.toLowerCase() ===
                    "all"
            ) {
                teamId = null;
            } else {
                const parsed =
                    Number(value);

                if (
                    !Number.isInteger(
                        parsed
                    ) ||
                    parsed <= 0
                ) {
                    return res.status(400).json({
                        success: false,
                        message:
                            "Invalid collection team ID.",
                    });
                }

                teamId = parsed;
            }
        }

        // ======================================================
        // 10. LOCATION FILTERS
        // ======================================================
        const kifleKetema =
            normalizeFilterValue(
                req.query?.kifleKetema
            );

        const kebele =
            normalizeFilterValue(
                req.query?.kebele
            );

        const sefer =
            normalizeFilterValue(
                req.query?.sefer
            );

        // ======================================================
        // 11. FILTER OBJECT
        // ======================================================
        const filters = {
            reportType,
            period,
            date,
            startDate,
            endDate,
            status,
            teamId,
            kifleKetema,
            kebele,
            sefer,
        };

        // ======================================================
        // DEBUG REQUEST
        // ======================================================
        console.log(
            "=========================================="
        );

        console.log(
            "MUNICIPAL REPORT REQUEST"
        );

        console.log(
            "=========================================="
        );

        console.log(
            "Query:",
            req.query
        );

        console.log(
            "Filters:",
            filters
        );

        // ======================================================
        // 12. SERVICE
        // ======================================================
        const result =
            await reportService.getMunicipalReports(
                filters
            );

        // ======================================================
        // 13. SAFE SUMMARY
        // ======================================================
        const rawSummary =
            result?.summary || {};

        const summary = {
            totalBusinesses:
                safeNumber(
                    rawSummary.totalBusinesses
                ),

            totalCollectors:
                safeNumber(
                    rawSummary.totalCollectors
                ),

            totalRequests:
                safeNumber(
                    rawSummary.totalRequests
                ),

            completedRequests:
                safeNumber(
                    rawSummary.completedRequests
                ),

            pendingRequests:
                safeNumber(
                    rawSummary.pendingRequests
                ),

            totalSchedules:
                safeNumber(
                    rawSummary.totalSchedules
                ),
        };

        // ======================================================
        // 14. REQUESTS
        // ======================================================
        const requests =
            Array.isArray(
                result?.requests
            )
                ? result.requests
                : [];

        // ======================================================
        // 15. SCHEDULES
        // ======================================================
        const schedules =
            Array.isArray(
                result?.schedules
            )
                ? result.schedules
                : [];

        // ======================================================
        // 16. TEAMS
        // IMPORTANT:
        // Teams must come directly from repository/service.
        // ======================================================
        const teams =
            Array.isArray(
                result?.teams
            )
                ? result.teams
                : [];

        // ======================================================
        // 17. LOCATIONS
        // ======================================================
        const rawLocations =
            result?.locations &&
            typeof result.locations ===
                "object"
                ? result.locations
                : {};

        const locations = {
            kifleKetemas:
                Array.isArray(
                    rawLocations.kifleKetemas
                )
                    ? rawLocations.kifleKetemas
                    : [],

            kebeles:
                Array.isArray(
                    rawLocations.kebeles
                )
                    ? rawLocations.kebeles
                    : [],

            sefers:
                Array.isArray(
                    rawLocations.sefers
                )
                    ? rawLocations.sefers
                    : [],
        };

        // ======================================================
        // 18. DEBUG RESULT
        // ======================================================
        console.log(
            "=========================================="
        );

        console.log(
            "MUNICIPAL REPORT RESULT"
        );

        console.log(
            "=========================================="
        );

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
            "Teams:",
            teams.length
        );

        console.log(
            "Locations:",
            locations
        );

        if (teams.length > 0) {
            console.log(
                "First Team:",
                teams[0]
            );
        }

        if (requests.length > 0) {
            console.log(
                "First Request:",
                requests[0]
            );
        }

        if (schedules.length > 0) {
            console.log(
                "First Schedule:",
                schedules[0]
            );
        }

        console.log(
            "=========================================="
        );

        // ======================================================
        // 19. RESPONSE
        // ======================================================
        return res.status(200).json({
            success: true,

            summary,

            requests,

            schedules,

            teams,

            locations,
        });
    } catch (error) {
        // ======================================================
        // ERROR LOG
        // ======================================================
        console.error(
            "=========================================="
        );

        console.error(
            "GET MUNICIPAL REPORTS ERROR"
        );

        console.error(
            "=========================================="
        );

        console.error(
            "Message:",
            error?.message
        );

        console.error(
            "Code:",
            error?.code
        );

        console.error(
            "Detail:",
            error?.detail
        );

        console.error(
            "Hint:",
            error?.hint
        );

        console.error(
            "Position:",
            error?.position
        );

        console.error(
            "Stack:",
            error?.stack
        );

        console.error(
            "=========================================="
        );

        next(error);
    }
};

// ============================================================
// GET REPORT BY ID
// ============================================================
const getReportById = async (
    req,
    res,
    next
) => {
    try {
        const report =
            await reportService.getReportById(
                req.params.id
            );

        if (!report) {
            return res.status(404).json({
                success: false,
                message:
                    "Report not found.",
            });
        }

        return res.status(200).json({
            success: true,
            data: report,
        });
    } catch (error) {
        console.error(
            "GET REPORT BY ID ERROR:",
            error
        );

        next(error);
    }
};

// ============================================================
// UPDATE REPORT
// ============================================================
const updateReport = async (
    req,
    res,
    next
) => {
    try {
        const report =
            await reportService.updateReport(
                req.params.id,
                req.body || {}
            );

        if (!report) {
            return res.status(404).json({
                success: false,
                message:
                    "Report not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message:
                "Report updated successfully.",
            data: report,
        });
    } catch (error) {
        console.error(
            "UPDATE REPORT ERROR:",
            error
        );

        next(error);
    }
};

// ============================================================
// DELETE REPORT
// ============================================================
const deleteReport = async (
    req,
    res,
    next
) => {
    try {
        const deletedReport =
            await reportService.deleteReport(
                req.params.id
            );

        if (!deletedReport) {
            return res.status(404).json({
                success: false,
                message:
                    "Report not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message:
                "Report deleted successfully.",
            data: deletedReport,
        });
    } catch (error) {
        console.error(
            "DELETE REPORT ERROR:",
            error
        );

        next(error);
    }
};
const generateMunicipalReport = async (req, res, next) => {
    try {

        const adminId =
            req.user?.admin_id ??
            req.user?.id ??
            req.user?.user_id ??
            null;

        if (!adminId) {
            return res.status(401).json({
                success: false,
                message:
                    "Authenticated municipal administrator could not be identified."
            });
        }

        const body = req.body || {};

        const reportType =
            normalizeString(
                body.reportType,
                "all"
            ).toLowerCase();

        const allowedReportTypes = [
            "all",
            "requests",
            "schedules"
        ];

        if (!allowedReportTypes.includes(reportType)) {
            return res.status(400).json({
                success: false,
                message: "Invalid report type."
            });
        }

        const period =
            normalizeString(
                body.period,
                "all"
            ).toLowerCase();

        const allowedPeriods = [
            "all",
            "daily",
            "weekly",
            "monthly",
            "custom"
        ];

        if (!allowedPeriods.includes(period)) {
            return res.status(400).json({
                success: false,
                message: "Invalid report period."
            });
        }

        const status =
            normalizeFilterValue(
                body.status
            ) || "all";

        const date =
            normalizeString(body.date);

        const startDate =
            normalizeString(body.startDate);

        const endDate =
            normalizeString(body.endDate);

        // Custom date validation
        if (period === "custom") {

            if (!startDate || !endDate) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Start date and end date are required."
                });
            }

            if (
                !isValidDate(startDate) ||
                !isValidDate(endDate)
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid custom report dates."
                });
            }

            if (startDate > endDate) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Start date cannot be after end date."
                });
            }
        }

        // Team
        let teamId = null;

        if (
            body.teamId !== undefined &&
            body.teamId !== null
        ) {

            const value =
                String(body.teamId).trim();

            if (
                value !== "" &&
                value.toLowerCase() !== "all"
            ) {

                const parsed =
                    Number(value);

                if (
                    !Number.isInteger(parsed) ||
                    parsed <= 0
                ) {
                    return res.status(400).json({
                        success: false,
                        message:
                            "Invalid collection team ID."
                    });
                }

                teamId = parsed;
            }
        }

        const kifleKetema =
            normalizeFilterValue(
                body.kifleKetema
            );

        const kebele =
            normalizeFilterValue(
                body.kebele
            );

        const sefer =
            normalizeFilterValue(
                body.sefer
            );

        // ==========================================
        // FILTERS
        // ==========================================

        const filters = {
            reportType,
            period,
            date,
            startDate,
            endDate,
            status,
            teamId,
            kifleKetema,
            kebele,
            sefer
        };

        console.log(
            "GENERATE MUNICIPAL REPORT:",
            filters
        );

        // ==========================================
        // GENERATE DATA
        // ==========================================

        const result =
            await reportService.getMunicipalReports(
                filters
            );

        // ==========================================
        // DESCRIPTION
        // ==========================================

        const description = [
            `Municipal ${reportType} report`,
            `Period: ${period}`,
            `Status: ${status}`,
            `Team: ${
                teamId !== null
                    ? teamId
                    : "All"
            }`,
            `Kebele: ${
                kebele || "All"
            }`,
            `Sefer: ${
                sefer || "All"
            }`,
            `Requests: ${
                result.summary?.totalRequests || 0
            }`,
            `Schedules: ${
                result.summary?.totalSchedules || 0
            }`
        ].join(" | ");

        // ==========================================
        // SAVE REPORT
        // ==========================================

        const savedReport =
            await reportService.createReport({
                admin_id: adminId,
                system_admin_id: null,
                report_type: reportType,
                description,
                file_path: null
            });

        // ==========================================
        // RESPONSE
        // ==========================================

        return res.status(201).json({
            success: true,
            message:
                "Municipal report generated successfully.",

            report: savedReport,

            summary:
                result.summary || {},

            requests:
                result.requests || [],

            schedules:
                result.schedules || [],

            teams:
                result.teams || [],

            locations:
                result.locations || {}
        });

    } catch (error) {

        console.error(
            "GENERATE MUNICIPAL REPORT ERROR:",
            error
        );

        next(error);
    }
};
// ============================================================
// REPORT STATISTICS
// ============================================================
const reportStatistics = async (
    req,
    res,
    next
) => {
    try {
        const statistics =
            await reportService.reportStatistics();

        return res.status(200).json({
            success: true,
            data: statistics || {},
        });
    } catch (error) {
        console.error(
            "REPORT STATISTICS ERROR:",
            error
        );

        next(error);
    }
};

// ============================================================
// EXPORT
// ============================================================
module.exports = {
    createReport,
    getAllReports,
    getMunicipalReports,
    generateMunicipalReport,
    getReportById,
    updateReport,
    deleteReport,
    reportStatistics,
};
