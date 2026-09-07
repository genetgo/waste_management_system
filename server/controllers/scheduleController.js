const scheduleRepository = require("../repositories/scheduleRepository");

// ==========================================
// Helper
// Get Municipal Admin Assigned Kifle Ketema
// ==========================================
const getAdminKifleKetema = (req) => {
    return (
        req.user?.assigned_kifle_ketema ||
        req.user?.kifle_ketema ||
        null
    );
};

// ==========================================
// Get All Schedules
// Municipal Admin → Assigned Kifle Ketema ONLY
// ==========================================
const getAllSchedules = async (req, res, next) => {
    try {

        console.log("=================================");
        console.log("GET ALL SCHEDULES");
        console.log("USER:", req.user);
        console.log("=================================");

        // ------------------------------------------
        // Municipal Admin
        // ------------------------------------------
        if (
            req.user?.role === "MUNICIPAL_ADMIN" ||
            req.user?.role === "MUNICIPAL ADMIN"
        ) {

            const assignedKifleKetema =
                getAdminKifleKetema(req);

            if (!assignedKifleKetema) {
                return res.status(403).json({
                    success: false,
                    message:
                        "No Kifle Ketema assigned to this Municipal Administrator."
                });
            }

            const schedules =
                await scheduleRepository.getSchedulesByKifleKetema(
                    assignedKifleKetema
                );

            return res.status(200).json({
                success: true,
                data: schedules
            });
        }

        // ------------------------------------------
        // Other roles
        // ------------------------------------------
        const schedules =
            await scheduleRepository.getAllSchedules();

        res.status(200).json({
            success: true,
            data: schedules
        });

    } catch (error) {

        console.error(
            "Get All Schedules Error:",
            error
        );

        next(error);
    }
};


// ==========================================
// Get Schedule By ID
// ==========================================
const getScheduleById = async (req, res, next) => {
    try {

        const schedule =
            await scheduleRepository.getScheduleById(
                req.params.id
            );

        if (!schedule) {
            return res.status(404).json({
                success: false,
                message: "Schedule not found"
            });
        }

        // ------------------------------------------
        // Municipal Admin Authorization
        // ------------------------------------------
        if (
            req.user?.role === "MUNICIPAL_ADMIN" ||
            req.user?.role === "MUNICIPAL ADMIN"
        ) {

            const assignedKifleKetema =
                getAdminKifleKetema(req);

            if (
                !assignedKifleKetema ||
                schedule.kifle_ketema?.trim().toLowerCase() !==
                assignedKifleKetema.trim().toLowerCase()
            ) {

                return res.status(403).json({
                    success: false,
                    message:
                        "You are not authorized to access this schedule."
                });
            }
        }

        res.status(200).json({
            success: true,
            data: schedule
        });

    } catch (error) {

        next(error);
    }
};


// ==========================================
// Create Schedule
// Municipal Admin → Assigned Kifle Ketema ONLY
// ==========================================
const createSchedule = async (req, res, next) => {
    try {

        const {
            collector_id,
            kifle_ketema,
            kebele,
            sefer,
            day_of_week,
            frequency,
            start_time,
            end_time,
            status
        } = req.body;


        // ==========================================
        // Required Fields
        // ==========================================
        if (
            !collector_id ||
            !kifle_ketema ||
            !kebele ||
            !sefer ||
            !day_of_week ||
            !start_time ||
            !end_time
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Please fill all required fields"
            });
        }


        // ==========================================
        // Municipal Admin Authorization
        // ==========================================
        if (
            req.user?.role === "MUNICIPAL_ADMIN" ||
            req.user?.role === "MUNICIPAL ADMIN"
        ) {

            const assignedKifleKetema =
                getAdminKifleKetema(req);

            if (!assignedKifleKetema) {

                return res.status(403).json({
                    success: false,
                    message:
                        "No Kifle Ketema assigned to this Municipal Administrator."
                });
            }


            // Prevent creating schedule
            // for another Kifle Ketema
            if (
                assignedKifleKetema.trim().toLowerCase() !==
                kifle_ketema.trim().toLowerCase()
            ) {

                return res.status(403).json({
                    success: false,
                    message:
                        `You can only create schedules for ${assignedKifleKetema}.`
                });
            }
        }


        // ==========================================
        // Create
        // ==========================================
        const schedule =
            await scheduleRepository.createSchedule({

                collector_id,

                kifle_ketema:
                    kifle_ketema.trim(),

                kebele:
                    kebele.trim(),

                sefer:
                    sefer.trim(),

                day_of_week,

                frequency,

                start_time,

                end_time,

                status:
                    status || "ACTIVE"
            });


        res.status(201).json({

            success: true,

            message:
                "Collection schedule created successfully",

            data: schedule
        });

    } catch (error) {

        console.error(
            "Create Schedule Error:",
            error
        );

        next(error);
    }
};


// ==========================================
// Update Schedule
// Municipal Admin → Assigned Kifle Ketema ONLY
// ==========================================
const updateSchedule = async (req, res, next) => {
    try {

        // ------------------------------------------
        // Get existing schedule
        // ------------------------------------------
        const existingSchedule =
            await scheduleRepository.getScheduleById(
                req.params.id
            );

        if (!existingSchedule) {

            return res.status(404).json({
                success: false,
                message: "Schedule not found"
            });
        }


        // ------------------------------------------
        // Municipal Admin authorization
        // ------------------------------------------
        if (
            req.user?.role === "MUNICIPAL_ADMIN" ||
            req.user?.role === "MUNICIPAL ADMIN"
        ) {

            const assignedKifleKetema =
                getAdminKifleKetema(req);

            if (!assignedKifleKetema) {

                return res.status(403).json({
                    success: false,
                    message:
                        "No Kifle Ketema assigned to this Municipal Administrator."
                });
            }


            // Existing schedule must belong
            // to admin's Kifle Ketema
            if (
                existingSchedule.kifle_ketema?.trim().toLowerCase() !==
                assignedKifleKetema.trim().toLowerCase()
            ) {

                return res.status(403).json({
                    success: false,
                    message:
                        "You are not authorized to update this schedule."
                });
            }


            // ------------------------------------------
            // Prevent changing Kifle Ketema
            // to another one
            // ------------------------------------------
            if (
                req.body.kifle_ketema &&
                req.body.kifle_ketema.trim().toLowerCase() !==
                assignedKifleKetema.trim().toLowerCase()
            ) {

                return res.status(403).json({
                    success: false,
                    message:
                        `You can only manage schedules for ${assignedKifleKetema}.`
                });
            }
        }


        const schedule =
            await scheduleRepository.updateSchedule(
                req.params.id,
                req.body
            );


        if (!schedule) {

            return res.status(404).json({
                success: false,
                message: "Schedule not found"
            });
        }


        res.status(200).json({

            success: true,

            message:
                "Schedule updated successfully",

            data: schedule
        });

    } catch (error) {

        console.error(
            "Update Schedule Error:",
            error
        );

        next(error);
    }
};


// ==========================================
// Delete Schedule
// Municipal Admin → Assigned Kifle Ketema ONLY
// ==========================================
const deleteSchedule = async (req, res, next) => {
    try {

        // ------------------------------------------
        // Get existing schedule
        // ------------------------------------------
        const existingSchedule =
            await scheduleRepository.getScheduleById(
                req.params.id
            );


        if (!existingSchedule) {

            return res.status(404).json({
                success: false,
                message: "Schedule not found"
            });
        }


        // ------------------------------------------
        // Municipal Admin authorization
        // ------------------------------------------
        if (
            req.user?.role === "MUNICIPAL_ADMIN" ||
            req.user?.role === "MUNICIPAL ADMIN"
        ) {

            const assignedKifleKetema =
                getAdminKifleKetema(req);

            if (!assignedKifleKetema) {

                return res.status(403).json({
                    success: false,
                    message:
                        "No Kifle Ketema assigned to this Municipal Administrator."
                });
            }


            if (
                existingSchedule.kifle_ketema?.trim().toLowerCase() !==
                assignedKifleKetema.trim().toLowerCase()
            ) {

                return res.status(403).json({
                    success: false,
                    message:
                        "You are not authorized to delete this schedule."
                });
            }
        }


        const schedule =
            await scheduleRepository.deleteSchedule(
                req.params.id
            );


        if (!schedule) {

            return res.status(404).json({
                success: false,
                message: "Schedule not found"
            });
        }


        res.status(200).json({

            success: true,

            message:
                "Schedule deleted successfully"
        });

    } catch (error) {

        console.error(
            "Delete Schedule Error:",
            error
        );

        next(error);
    }
};


// ==========================================
// Get Collector Schedules
// ==========================================
const getSchedulesByCollector =
    async (req, res, next) => {

        try {

            const schedules =
                await scheduleRepository.getSchedulesByCollector(
                    req.params.collector_id
                );


            res.status(200).json({

                success: true,

                data: schedules
            });

        } catch (error) {

            next(error);
        }
    };


// ==========================================
// Resident / Business Owner
// Own Location Schedule
// ==========================================
const getMySchedule =
    async (req, res, next) => {

        try {

            console.log(
                "LOGIN USER:",
                req.user
            );


            const schedules =
                await scheduleRepository.getMySchedule(
                    req.user.id,
                    req.user.role
                );


            res.status(200).json({

                success: true,

                data: schedules
            });

        } catch (error) {

            console.log(
                "MY SCHEDULE ERROR:",
                error
            );

            next(error);
        }
    };


// ==========================================
// Export
// ==========================================
module.exports = {

    getAllSchedules,

    getScheduleById,

    createSchedule,

    updateSchedule,

    deleteSchedule,

    getSchedulesByCollector,

    getMySchedule
};