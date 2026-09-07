const db = require("../config/db");

// Create Report
const createReport = async (data) => {
  const {
    admin_id,
    report_type,
    title,
    description,
    file_path,
  } = data;

  const result = await db.query(
    `INSERT INTO reports
    (
      admin_id,
      report_type,
      title,
      description,
      file_path
    )
    VALUES($1,$2,$3,$4,$5)
    RETURNING *`,
    [
      admin_id,
      report_type,
      title,
      description,
      file_path,
    ]
  );

  return result.rows[0];
};

// Get All Reports
const getReports = async () => {
  const result = await db.query(`
      SELECT *
      FROM reports
      ORDER BY report_id DESC
  `);

  return result.rows;
};
const reportRepository = require("../repositories/reportRepository");

// ======================================
// Municipal Reports
// ======================================
const getMunicipalReports = async () => {
    return await reportRepository.getMunicipalReports();
};
// Get Report By ID
const getReportById = async (id) => {
  const result = await db.query(
    "SELECT * FROM reports WHERE report_id=$1",
    [id]
  );

  return result.rows[0];
};

// Update Report
const updateReport = async (id, data) => {
  const {
    report_type,
    title,
    description,
    file_path,
  } = data;

  const result = await db.query(
    `UPDATE reports
     SET report_type=$1,
         title=$2,
         description=$3,
         file_path=$4
     WHERE report_id=$5
     RETURNING *`,
    [
      report_type,
      title,
      description,
      file_path,
      id,
    ]
  );

  return result.rows[0];
};

// Delete Report
const deleteReport = async (id) => {
  const result = await db.query(
    "DELETE FROM reports WHERE report_id=$1 RETURNING *",
    [id]
  );

  return result.rows[0];
};

// Report Statistics
const reportStatistics = async () => {
  const residents = await db.query(
    "SELECT COUNT(*) total FROM residents"
  );

  const businesses = await db.query(
    "SELECT COUNT(*) total FROM business_owners"
  );

  const collectors = await db.query(
    "SELECT COUNT(*) total FROM collectors"
  );

  const requests = await db.query(
    "SELECT COUNT(*) total FROM on_demand_requests"
  );

  const feedback = await db.query(
    "SELECT COUNT(*) total FROM feedback"
  );

  return {
    residents: Number(residents.rows[0].total),
    businesses: Number(businesses.rows[0].total),
    collectors: Number(collectors.rows[0].total),
    requests: Number(requests.rows[0].total),
    feedback: Number(feedback.rows[0].total),
  };
};

module.exports = {
  createReport,
  getReports,
  getReportById,
  updateReport,
  deleteReport,
  reportStatistics,
    getMunicipalReports
};