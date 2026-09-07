// services/dashboardService.js

const { pool } = require("../config/db");

// =====================================================
// System Dashboard
// =====================================================
const getSystemDashboard = async () => {
    try {

        const residents = await pool.query(`
            SELECT COUNT(*) AS total
            FROM residents
        `);

        const businesses = await pool.query(`
            SELECT COUNT(*) AS total
            FROM business_owners
        `);

        const collectors = await pool.query(`
            SELECT COUNT(*) AS total
            FROM collectors
        `);

        const activeCollectors = await pool.query(`
            SELECT COUNT(*) AS total
            FROM collectors
            WHERE is_active = true
        `);

        const municipalAdmins = await pool.query(`
            SELECT COUNT(*) AS total
            FROM municipal_administrators
        `);

        const schedules = await pool.query(`
            SELECT COUNT(*) AS total
            FROM collection_schedules
        `);

        const pendingSchedules = await pool.query(`
            SELECT COUNT(*) AS total
            FROM collection_schedules
            WHERE status = 'Scheduled'
        `);

        const completedSchedules = await pool.query(`
            SELECT COUNT(*) AS total
            FROM collection_schedules
            WHERE status = 'Completed'
        `);

        const pendingRequests = await pool.query(`
            SELECT COUNT(*) AS total
            FROM on_demand_requests
            WHERE status = 'Pending'
        `);

        const completedRequests = await pool.query(`
            SELECT COUNT(*) AS total
            FROM on_demand_requests
            WHERE status = 'Completed'
        `);

        const notifications = await pool.query(`
            SELECT COUNT(*) AS total
            FROM notifications
        `);

        const reports = await pool.query(`
            SELECT COUNT(*) AS total
            FROM reports
        `);

        const feedback = await pool.query(`
            SELECT COUNT(*) AS total
            FROM feedback
        `);

        return {

            totalResidents:
                Number(residents.rows[0].total),

            totalBusinesses:
                Number(businesses.rows[0].total),

            totalCollectors:
                Number(collectors.rows[0].total),

            activeCollectors:
                Number(activeCollectors.rows[0].total),

            totalMunicipalAdmins:
                Number(municipalAdmins.rows[0].total),

            totalSchedules:
                Number(schedules.rows[0].total),

            pendingSchedules:
                Number(pendingSchedules.rows[0].total),

            completedSchedules:
                Number(completedSchedules.rows[0].total),

            pendingRequests:
                Number(pendingRequests.rows[0].total),

            completedRequests:
                Number(completedRequests.rows[0].total),

            totalNotifications:
                Number(notifications.rows[0].total),

            totalReports:
                Number(reports.rows[0].total),

            totalFeedback:
                Number(feedback.rows[0].total)
        };

    } catch (error) {

        console.error(
            "System Dashboard Service Error:",
            error
        );

        throw error;
    }
};


// =====================================================
// Municipal Dashboard
// =====================================================
const getMunicipalDashboard = async (
    kifle_ketema,
    adminId
) => {

    try {

        if (!kifle_ketema) {
            throw new Error(
                "Municipal Admin Kifle Ketema is required."
            );
        }

        if (!adminId) {
            throw new Error(
                "Municipal Admin ID is required."
            );
        }

        // ---------------------------------------------
        // Residents
        // ---------------------------------------------
        const residents = await pool.query(
            `
            SELECT COUNT(*) AS total
            FROM residents
            WHERE LOWER(kifle_ketema) = LOWER($1)
            `,
            [kifle_ketema]
        );

        // ---------------------------------------------
        // Business Owners
        // ---------------------------------------------
        const businesses = await pool.query(
            `
            SELECT COUNT(*) AS total
            FROM business_owners
            WHERE LOWER(kifle_ketema) = LOWER($1)
            `,
            [kifle_ketema]
        );

        // ---------------------------------------------
        // Active Collectors
        // ---------------------------------------------
        const collectors = await pool.query(
            `
            SELECT COUNT(*) AS total
            FROM collectors
            WHERE LOWER(assigned_kifle_ketema) = LOWER($1)
            AND is_active = true
            `,
            [kifle_ketema]
        );

        // ---------------------------------------------
        // Total Schedules
        // ---------------------------------------------
        const schedules = await pool.query(
            `
            SELECT COUNT(*) AS total
            FROM collection_schedules
            WHERE LOWER(kifle_ketema) = LOWER($1)
            `,
            [kifle_ketema]
        );

        // ---------------------------------------------
        // Pending Schedules
        // ---------------------------------------------
        const pendingSchedules = await pool.query(
            `
            SELECT COUNT(*) AS total
            FROM collection_schedules
            WHERE LOWER(kifle_ketema) = LOWER($1)
            AND status = 'Scheduled'
            `,
            [kifle_ketema]
        );

        // ---------------------------------------------
        // Completed Schedules
        // ---------------------------------------------
        const completedSchedules = await pool.query(
            `
            SELECT COUNT(*) AS total
            FROM collection_schedules
            WHERE LOWER(kifle_ketema) = LOWER($1)
            AND status = 'Completed'
            `,
            [kifle_ketema]
        );

        // ---------------------------------------------
        // Pending Requests
        // ---------------------------------------------
        const pendingRequests = await pool.query(
            `
            SELECT COUNT(*) AS total
            FROM on_demand_requests
            WHERE LOWER(kifle_ketema) = LOWER($1)
            AND status = 'Pending'
            `,
            [kifle_ketema]
        );

        // ---------------------------------------------
        // Completed Requests
        // ---------------------------------------------
        const completedRequests = await pool.query(
            `
            SELECT COUNT(*) AS total
            FROM on_demand_requests
            WHERE LOWER(kifle_ketema) = LOWER($1)
            AND status = 'Completed'
            `,
            [kifle_ketema]
        );

        // ---------------------------------------------
        // Total Requests
        // ---------------------------------------------
        const totalRequests = await pool.query(
            `
            SELECT COUNT(*) AS total
            FROM on_demand_requests
            WHERE LOWER(kifle_ketema) = LOWER($1)
            `,
            [kifle_ketema]
        );

        // ---------------------------------------------
        // Notifications
        // ---------------------------------------------
        const notifications = await pool.query(
            `
            SELECT COUNT(*) AS total
            FROM notifications
            WHERE user_id = $1
            AND LOWER(user_role) = LOWER($2)
            `,
            [adminId, "MunicipalAdmin"]
        );

        // ---------------------------------------------
        // Reports
        // ---------------------------------------------
        const reports = await pool.query(
            `
            SELECT COUNT(*) AS total
            FROM reports
            WHERE admin_id = $1
            `,
            [adminId]
        );

        // ---------------------------------------------
        // Feedback
        // ---------------------------------------------
        const feedback = await pool.query(
            `
            SELECT COUNT(*) AS total
            FROM feedback
            `
        );

        return {

            totalResidents:
                Number(residents.rows[0].total),

            totalBusinesses:
                Number(businesses.rows[0].total),

            activeCollectors:
                Number(collectors.rows[0].total),

            totalSchedules:
                Number(schedules.rows[0].total),

            pendingSchedules:
                Number(pendingSchedules.rows[0].total),

            completedSchedules:
                Number(completedSchedules.rows[0].total),

            totalRequests:
                Number(totalRequests.rows[0].total),

            pendingRequests:
                Number(pendingRequests.rows[0].total),

            completedRequests:
                Number(completedRequests.rows[0].total),

            totalNotifications:
                Number(notifications.rows[0].total),

            totalReports:
                Number(reports.rows[0].total),

            totalFeedback:
                Number(feedback.rows[0].total)
        };

    } catch (error) {

        console.error(
            "Municipal Dashboard Service Error:",
            error
        );

        throw error;
    }
};


// =====================================================
// Collector Dashboard
// =====================================================
const getCollectorDashboard = async (
    collectorId
) => {

    try {

        const schedules = await pool.query(
            `
            SELECT COUNT(*) AS total
            FROM collection_schedules
            WHERE collector_id = $1
            `,
            [collectorId]
        );

        const completed = await pool.query(
            `
            SELECT COUNT(*) AS total
            FROM collection_schedules
            WHERE collector_id = $1
            AND status = 'Completed'
            `,
            [collectorId]
        );

        const pending = await pool.query(
            `
            SELECT COUNT(*) AS total
            FROM collection_schedules
            WHERE collector_id = $1
            AND status = 'Scheduled'
            `,
            [collectorId]
        );

        const notifications = await pool.query(
            `
            SELECT COUNT(*) AS total
            FROM notifications
            WHERE user_id = $1
            AND LOWER(user_role) = LOWER($2)
            `,
            [collectorId, "Collector"]
        );

        return {

            totalSchedules:
                Number(schedules.rows[0].total),

            completedSchedules:
                Number(completed.rows[0].total),

            pendingSchedules:
                Number(pending.rows[0].total),

            totalNotifications:
                Number(notifications.rows[0].total)
        };

    } catch (error) {

        console.error(
            "Collector Dashboard Service Error:",
            error
        );

        throw error;
    }
};


// =====================================================
// Resident Dashboard
// =====================================================
const getResidentDashboard = async (
    residentId
) => {

    try {

        const requests = await pool.query(
            `
            SELECT COUNT(*) AS total
            FROM on_demand_requests
            WHERE resident_id = $1
            `,
            [residentId]
        );

        const notifications = await pool.query(
            `
            SELECT COUNT(*) AS total
            FROM notifications
            WHERE user_id = $1
            AND LOWER(user_role) = LOWER($2)
            `,
            [residentId, "Resident"]
        );

        return {

            totalRequests:
                Number(requests.rows[0].total),

            totalNotifications:
                Number(notifications.rows[0].total)
        };

    } catch (error) {

        console.error(
            "Resident Dashboard Service Error:",
            error
        );

        throw error;
    }
};


// =====================================================
// Business Owner Dashboard
// =====================================================
const getBusinessDashboard = async (
    businessId
) => {

    try {

        const requests = await pool.query(
            `
            SELECT COUNT(*) AS total
            FROM on_demand_requests
            WHERE business_id = $1
            `,
            [businessId]
        );

        const notifications = await pool.query(
            `
            SELECT COUNT(*) AS total
            FROM notifications
            WHERE user_id = $1
            AND LOWER(user_role) = LOWER($2)
            `,
            [businessId, "BusinessOwner"]
        );

        return {

            totalRequests:
                Number(requests.rows[0].total),

            totalNotifications:
                Number(notifications.rows[0].total)
        };

    } catch (error) {

        console.error(
            "Business Dashboard Service Error:",
            error
        );

        throw error;
    }
};


// =====================================================
// Export
// =====================================================
module.exports = {

    getSystemDashboard,

    getMunicipalDashboard,

    getCollectorDashboard,

    getResidentDashboard,

    getBusinessDashboard
};