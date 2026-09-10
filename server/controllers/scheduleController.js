
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
// Helper
// Normalize Day
// ==========================================
const normalizeDay = (day) => {
    if (!day) return null;

    return String(day)
        .trim()
        .toLowerCase();
};

// ==========================================
// Helper
// Validate Collection Day
// Monday - Saturday ONLY
//
// IMPORTANT:
// Initial Date does NOT have to match this day.
// Example:
// Initial Date = 2026-09-10 (Thursday)
// Day = Monday
// This is ALLOWED.
// ==========================================
const ALLOWED_DAYS = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday"
];

const isValidDay = (day) => {
    return ALLOWED_DAYS.includes(normalizeDay(day));
};

// ==========================================
// Helper
// Check Municipal Admin
// ==========================================
const isMunicipalAdmin = (req) => {
    return (
        req.user?.role === "MUNICIPAL_ADMIN" ||
        req.user?.role === "MUNICIPAL ADMIN"
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

        if (isMunicipalAdmin(req)) {
            const assignedKifleKetema = getAdminKifleKetema(req);

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

        const schedules =
            await scheduleRepository.getAllSchedules();

        return res.status(200).json({
            success: true,
            data: schedules
        });

    } catch (error) {
        console.error("Get All Schedules Error:", error);
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

        if (isMunicipalAdmin(req)) {
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

        return res.status(200).json({
            success: true,
            data: schedule
        });

    } catch (error) {
        console.error("Get Schedule By ID Error:", error);
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
            initial_date,
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
            !initial_date ||
            !start_time ||
            !end_time
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Please fill all required fields including Initial Date."
            });
        }

        // ==========================================
        // Validate Initial Date
        // ==========================================
        // IMPORTANT:
        // We only check that a date was supplied.
        // We DO NOT compare the date with day_of_week.
        // ==========================================
        const parsedDate = new Date(`${initial_date}T00:00:00`);

        if (Number.isNaN(parsedDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Invalid initial date."
            });
        }

        // ==========================================
        // Validate Day
        // Monday - Saturday
        // ==========================================
        if (!isValidDay(day_of_week)) {
            return res.status(400).json({
                success: false,
                message:
                    "Day must be Monday, Tuesday, Wednesday, Thursday, Friday, or Saturday."
            });
        }

        // ==========================================
        // Normalize Day
        // ==========================================
        const normalizedDay = normalizeDay(day_of_week);

        // Store with first letter uppercase
        const dayValue =
            normalizedDay.charAt(0).toUpperCase() +
            normalizedDay.slice(1);

        // ==========================================
        // Validate Time
        // ==========================================
        if (start_time >= end_time) {
            return res.status(400).json({
                success: false,
                message:
                    "End time must be after start time."
            });
        }

        // ==========================================
        // Municipal Admin Authorization
        // ==========================================
        if (isMunicipalAdmin(req)) {
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
                assignedKifleKetema.trim().toLowerCase() !==
                String(kifle_ketema).trim().toLowerCase()
            ) {
                return res.status(403).json({
                    success: false,
                    message:
                        `You can only create schedules for ${assignedKifleKetema}.`
                });
            }
        }

        // ==========================================
        // Check Collector ID
        // ==========================================
        const collectorId = Number(collector_id);

        if (
            !Number.isInteger(collectorId) ||
            collectorId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid collector ID."
            });
        }

        // ==========================================
        // CHECK DUPLICATE / TIME OVERLAP
        //
        // Same:
        // Collector
        // Kifle Ketema
        // Kebele
        // Sefer
        // Day
        //
        // Different Kebele = allowed
        // Different Sefer = allowed
        // ==========================================
        const conflict =
            await scheduleRepository.findScheduleConflict({
                collector_id: collectorId,

                kifle_ketema:
                    String(kifle_ketema).trim(),

                kebele:
                    String(kebele).trim(),

                sefer:
                    String(sefer).trim(),

                day_of_week:
                    normalizedDay,

                start_time,
                end_time
            });

        if (conflict) {
            return res.status(409).json({
                success: false,
                message:
                    "This schedule already exists or the selected time overlaps with an existing schedule for the same Kebele and Sefer."
            });
        }

        // ==========================================
        // Create Schedule
        // ==========================================
        const schedule =
            await scheduleRepository.createSchedule({
                collector_id: collectorId,

                kifle_ketema:
                    String(kifle_ketema).trim(),

                kebele:
                    String(kebele).trim(),

                sefer:
                    String(sefer).trim(),

                day_of_week: dayValue,

                initial_date,

                frequency:
                    frequency || "Every 2 Weeks",

                start_time,

                end_time,

                status:
                    status || "ACTIVE"
            });

        return res.status(201).json({
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
        // ==========================================
        // Get Existing Schedule
        // ==========================================
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

        // ==========================================
        // Municipal Admin Authorization
        // ==========================================
        if (isMunicipalAdmin(req)) {
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
                        "You are not authorized to update this schedule."
                });
            }

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

        // ==========================================
        // Build Final Values
        // ==========================================
        const collector_id =
            req.body.collector_id !== undefined
                ? Number(req.body.collector_id)
                : existingSchedule.collector_id;

        const kifle_ketema =
            req.body.kifle_ketema !== undefined
                ? String(req.body.kifle_ketema).trim()
                : existingSchedule.kifle_ketema;

        const kebele =
            req.body.kebele !== undefined
                ? String(req.body.kebele).trim()
                : existingSchedule.kebele;

        const sefer =
            req.body.sefer !== undefined
                ? String(req.body.sefer).trim()
                : existingSchedule.sefer;

        const day_of_week =
            req.body.day_of_week !== undefined
                ? String(req.body.day_of_week).trim()
                : existingSchedule.day_of_week;

        const initial_date =
            req.body.initial_date !== undefined
                ? req.body.initial_date
                : existingSchedule.initial_date;

        const frequency =
            req.body.frequency !== undefined
                ? req.body.frequency
                : existingSchedule.frequency;

        const start_time =
            req.body.start_time !== undefined
                ? req.body.start_time
                : existingSchedule.start_time;

        const end_time =
            req.body.end_time !== undefined
                ? req.body.end_time
                : existingSchedule.end_time;

        const status =
            req.body.status !== undefined
                ? req.body.status
                : existingSchedule.status;

        // ==========================================
        // Validate Collector
        // ==========================================
        if (
            !Number.isInteger(collector_id) ||
            collector_id <= 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid collector ID."
            });
        }

        // ==========================================
        // Validate Required Fields
        // ==========================================
        if (
            !kifle_ketema ||
            !kebele ||
            !sefer ||
            !day_of_week ||
            !initial_date ||
            !start_time ||
            !end_time
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "All required schedule fields must be provided."
            });
        }

        // ==========================================
        // Validate Initial Date
        // ==========================================
        // IMPORTANT:
        // Initial Date and Day are independent.
        // ==========================================
        const parsedDate =
            new Date(`${initial_date}T00:00:00`);

        if (Number.isNaN(parsedDate.getTime())) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid initial date."
            });
        }

        // ==========================================
        // Validate Day
        // Monday - Saturday
        // ==========================================
        if (!isValidDay(day_of_week)) {
            return res.status(400).json({
                success: false,
                message:
                    "Day must be Monday, Tuesday, Wednesday, Thursday, Friday, or Saturday."
            });
        }

        // ==========================================
        // Normalize Day
        // ==========================================
        const normalizedDay =
            normalizeDay(day_of_week);

        const dayValue =
            normalizedDay.charAt(0).toUpperCase() +
            normalizedDay.slice(1);

        // ==========================================
        // Validate Time
        // ==========================================
        if (start_time >= end_time) {
            return res.status(400).json({
                success: false,
                message:
                    "End time must be after start time."
            });
        }

        // ==========================================
        // Check Conflict
        // Exclude current schedule ID
        // ==========================================
        const conflict =
            await scheduleRepository.findScheduleConflict({
                collector_id,

                kifle_ketema,

                kebele,

                sefer,

                day_of_week:
                    normalizedDay,

                start_time,

                end_time,

                exclude_schedule_id:
                    Number(req.params.id)
            });

        if (conflict) {
            return res.status(409).json({
                success: false,
                message:
                    "This schedule already exists or the selected time overlaps with another schedule for the same Kebele and Sefer."
            });
        }

        // ==========================================
        // Update
        // ==========================================
        const schedule =
            await scheduleRepository.updateSchedule(
                req.params.id,
                {
                    collector_id,
                    kifle_ketema,
                    kebele,
                    sefer,
                    day_of_week: dayValue,
                    initial_date,
                    frequency,
                    start_time,
                    end_time,
                    status
                }
            );

        if (!schedule) {
            return res.status(404).json({
                success: false,
                message:
                    "Schedule not found"
            });
        }

        return res.status(200).json({
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
        // ==========================================
        // Get Existing Schedule
        // ==========================================
        const existingSchedule =
            await scheduleRepository.getScheduleById(
                req.params.id
            );

        if (!existingSchedule) {
            return res.status(404).json({
                success: false,
                message:
                    "Schedule not found"
            });
        }

        // ==========================================
        // Municipal Admin Authorization
        // ==========================================
        if (isMunicipalAdmin(req)) {
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

        // ==========================================
        // Delete
        // ==========================================
        const schedule =
            await scheduleRepository.deleteSchedule(
                req.params.id
            );

        if (!schedule) {
            return res.status(404).json({
                success: false,
                message:
                    "Schedule not found"
            });
        }

        return res.status(200).json({
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
            const collectorId =
                Number(req.params.collector_id);

            if (
                !Number.isInteger(collectorId) ||
                collectorId <= 0
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid collector ID."
                });
            }

            const schedules =
                await scheduleRepository.getSchedulesByCollector(
                    collectorId
                );

            return res.status(200).json({
                success: true,
                data: schedules
            });

        } catch (error) {
            console.error(
                "Get Collector Schedules Error:",
                error
            );

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

            return res.status(200).json({
                success: true,
                data: schedules
            });

        } catch (error) {
            console.error(
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
