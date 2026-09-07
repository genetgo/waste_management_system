const dashboardService = require("../services/dashboardService");

// =======================================
// System Dashboard
// =======================================
const getSystemDashboard = async (req, res, next) => {
    try {

        const dashboard =
            await dashboardService.getSystemDashboard();

        return res.status(200).json({
            success: true,
            data: dashboard
        });

    } catch (error) {
        next(error);
    }
};

// =======================================
// Municipal Dashboard
// =======================================
const getMunicipalDashboard = async (req, res, next) => {
    try {

        const kifle_ketema =
            req.user.assigned_kifle_ketema ||
            req.user.kifle_ketema;

        const adminId = req.user.id;
console.log("Admin:", req.user);
console.log("Kifle Ketema:", kifle_ketema);
console.log("Admin ID:", adminId);
        const dashboard =
            await dashboardService.getMunicipalDashboard(
                kifle_ketema,
                adminId
            );

        return res.status(200).json({
            success: true,
            data: dashboard
        });

    } catch (error) {
        next(error);
    }
};
// =======================================
// Collector Dashboard
// =======================================
const getCollectorDashboard = async (req, res, next) => {
    try {

        const dashboard =
            await dashboardService.getCollectorDashboard(
                req.user.id
            );

        return res.status(200).json({
            success: true,
            data: dashboard
        });

    } catch (error) {
        next(error);
    }
};

// =======================================
// Resident Dashboard
// =======================================
const getResidentDashboard = async (req, res, next) => {
    try {

        const dashboard =
            await dashboardService.getResidentDashboard(
                req.user.id
            );

        return res.status(200).json({
            success: true,
            data: dashboard
        });

    } catch (error) {
        next(error);
    }
};

// =======================================
// Business Owner Dashboard
// =======================================
const getBusinessDashboard = async (req, res, next) => {
    try {

        const dashboard =
            await dashboardService.getBusinessDashboard(
                req.user.id
            );

        return res.status(200).json({
            success: true,
            data: dashboard
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {

    getSystemDashboard,

    getMunicipalDashboard,

    getCollectorDashboard,

    getResidentDashboard,

    getBusinessDashboard

};