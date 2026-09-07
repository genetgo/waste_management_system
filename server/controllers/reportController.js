const reportService = require("../services/reportService");

// ======================================
// Create Report
// ======================================
const createReport = async (req, res, next) => {
    try {
        const report = await reportService.createReport(req.body);

        res.status(201).json({
            success: true,
            message: "Report created successfully.",
            data: report
        });

    } catch (error) {
        next(error);
    }
};

// ======================================
// Get All Reports
// ======================================
const getAllReports = async (req, res, next) => {
    try {
        const reports = await reportService.getReports();

        res.status(200).json({
            success: true,
            data: reports
        });

    } catch (error) {
        next(error);
    }
};
// ======================================
// Municipal Reports
// ======================================
const getMunicipalReports = async (req, res, next) => {
    try {
        const reports = await reportService.getMunicipalReports();

        res.status(200).json({
            success: true,
            summary: reports.summary,
            reports: reports.reports
        });

    } catch (error) {
        next(error);
    }
};
// ======================================
// Get Report By ID
// ======================================
const getReportById = async (req, res, next) => {
    try {

        const report = await reportService.getReportById(req.params.id);

        if (!report) {
            return res.status(404).json({
                success: false,
                message: "Report not found."
            });
        }

        res.status(200).json({
            success: true,
            data: report
        });

    } catch (error) {
        next(error);
    }
};

// ======================================
// Update Report
// ======================================
const updateReport = async (req, res, next) => {
    try {

        const report = await reportService.updateReport(
            req.params.id,
            req.body
        );

        res.status(200).json({
            success: true,
            message: "Report updated successfully.",
            data: report
        });

    } catch (error) {
        next(error);
    }
};

// ======================================
// Delete Report
// ======================================
const deleteReport = async (req, res, next) => {
    try {

        await reportService.deleteReport(req.params.id);

        res.status(200).json({
            success: true,
            message: "Report deleted successfully."
        });

    } catch (error) {
        next(error);
    }
};

// ======================================
// Report Statistics
// ======================================
const reportStatistics = async (req, res, next) => {
    try {

        const statistics = await reportService.reportStatistics();

        res.status(200).json({
            success: true,
            data: statistics
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    createReport,
    getAllReports,
    getReportById,
    updateReport,
    deleteReport,
    getMunicipalReports,
    reportStatistics
};