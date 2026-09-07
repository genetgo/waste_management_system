const { pool } = require("../config/db");

// ===========================================
// Get All Reports
// ===========================================
const getAllReports = async () => {

    const query = `
        SELECT *
        FROM reports
        ORDER BY generated_at DESC
    `;

    const { rows } = await pool.query(query);
    return rows;
};

// ===========================================
// Get Report By ID
// ===========================================
const getReportById = async (id) => {

    const query = `
        SELECT *
        FROM reports
        WHERE report_id = $1
    `;

    const { rows } = await pool.query(query, [id]);
    return rows[0];
};

// ===========================================
// Get Reports Created By Municipal Admin
// ===========================================
const getReportsByAdmin = async (adminId) => {

    const query = `
        SELECT *
        FROM reports
        WHERE admin_id = $1
        ORDER BY generated_at DESC
    `;

    const { rows } = await pool.query(query, [adminId]);
    return rows;
};

// ===========================================
// Get Reports Created By System Admin
// ===========================================
const getReportsBySystemAdmin = async (systemAdminId) => {

    const query = `
        SELECT *
        FROM reports
        WHERE system_admin_id = $1
        ORDER BY generated_at DESC
    `;

    const { rows } = await pool.query(query, [systemAdminId]);
    return rows;
};

// ===========================================
// Get Reports By Type
// ===========================================
const getReportsByType = async (reportType) => {

    const query = `
        SELECT *
        FROM reports
        WHERE report_type = $1
        ORDER BY generated_at DESC
    `;

    const { rows } = await pool.query(query, [reportType]);
    return rows;
};

// ===========================================
// Create Report
// ===========================================
const createReport = async (report) => {

    const {
        admin_id,
        system_admin_id,
        report_type,
        description,
        file_path
    } = report;

    const query = `
        INSERT INTO reports
        (
            admin_id,
            system_admin_id,
            report_type,
            description,
            file_path
        )
        VALUES ($1,$2,$3,$4,$5)
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
    return rows[0];
};

// ===========================================
// Update Report
// ===========================================
const updateReport = async (id, report) => {

    const {
        report_type,
        description,
        file_path
    } = report;

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
    return rows[0];
};

// ===========================================
// Delete Report
// ===========================================
const deleteReport = async (id) => {

    const query = `
        DELETE FROM reports
        WHERE report_id = $1
        RETURNING *
    `;

    const { rows } = await pool.query(query, [id]);
    return rows[0];
};
// ===========================================
// Get Municipal Reports
// ===========================================
const getMunicipalReports = async () => {

    const residentsResult = await pool.query(`
        SELECT COUNT(*) AS total
        FROM residents
    `);

    const businessesResult = await pool.query(`
        SELECT COUNT(*) AS total
        FROM business_owners
    `);

    const collectorsResult = await pool.query(`
        SELECT COUNT(*) AS total
        FROM collectors
    `);

    const requestsResult = await pool.query(`
        SELECT COUNT(*) AS total
        FROM on_demand_requests
    `);

    const completedRequestsResult = await pool.query(`
        SELECT COUNT(*) AS total
        FROM on_demand_requests
        WHERE status = 'Completed'
    `);

    const pendingRequestsResult = await pool.query(`
        SELECT COUNT(*) AS total
        FROM on_demand_requests
        WHERE status = 'Pending'
    `);

    return {
        summary: {
            totalResidents: Number(residentsResult.rows[0].total),
            totalBusinesses: Number(businessesResult.rows[0].total),
            totalCollectors: Number(collectorsResult.rows[0].total),
            totalRequests: Number(requestsResult.rows[0].total),
            completedRequests: Number(
                completedRequestsResult.rows[0].total
            ),
            pendingRequests: Number(
                pendingRequestsResult.rows[0].total
            ),
        },

        reports: [
            {
                id: 1,
                category: "Residents",
                total: Number(residentsResult.rows[0].total),
                status: "Completed",
                updated_at: new Date().toISOString().split("T")[0],
            },
            {
                id: 2,
                category: "Business Owners",
                total: Number(businessesResult.rows[0].total),
                status: "Completed",
                updated_at: new Date().toISOString().split("T")[0],
            },
            {
                id: 3,
                category: "Collectors",
                total: Number(collectorsResult.rows[0].total),
                status: "Completed",
                updated_at: new Date().toISOString().split("T")[0],
            },
            {
                id: 4,
                category: "Requests",
                total: Number(requestsResult.rows[0].total),
                status: "Pending",
                updated_at: new Date().toISOString().split("T")[0],
            },
        ],
    };
};
module.exports = {
    getAllReports,
    getReportById,
    getReportsByAdmin,
    getReportsBySystemAdmin,
    getReportsByType,
    createReport,
    updateReport,
    deleteReport,
    getMunicipalReports
};