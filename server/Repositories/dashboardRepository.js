const db = require("../config/db");

// ==========================================
// Dashboard Statistics
// ==========================================
const getDashboardStatistics = async () => {

    const result = await db.query(`
        SELECT
            COUNT(*) AS total_requests,

            COUNT(*) FILTER (
                WHERE status = 'Pending'
            ) AS pending_requests,

            COUNT(*) FILTER (
                WHERE status = 'Approved'
            ) AS approved_requests,

            COUNT(*) FILTER (
                WHERE status = 'Assigned'
            ) AS assigned_requests,

            COUNT(*) FILTER (
                WHERE status = 'In Progress'
            ) AS in_progress_requests,

            COUNT(*) FILTER (
                WHERE status = 'Completed'
            ) AS completed_requests,

            COUNT(*) FILTER (
                WHERE DATE(created_at)=CURRENT_DATE
            ) AS today_requests

        FROM on_demand_requests;
    `);

    return result.rows[0];
};

// ==========================================
// Recent Requests
// ==========================================
const getRecentRequests = async () => {

    const result = await db.query(`
        SELECT
            r.request_id,
            b.business_name,
            r.collection_address,
            r.kebele,
            r.kifle_ketema,
            r.preferred_collection_date,
            r.status,
            r.created_at

        FROM on_demand_requests r

        JOIN business_owners b
            ON r.business_id=b.business_id

        ORDER BY r.created_at DESC

        LIMIT 10
    `);

    return result.rows;
};

module.exports = {
    getDashboardStatistics,
    getRecentRequests
};