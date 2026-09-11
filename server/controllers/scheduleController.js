const scheduleService = require("../services/scheduleService");
const scheduleRepository = require("../repositories/scheduleRepository");


// ============================================================
// HELPERS
// ============================================================


// ------------------------------------------------------------
// Normalize Role
// ------------------------------------------------------------
const normalizeRole = (role) => {

    if (!role) return "";

    return String(role)
        .trim()
        .toUpperCase()
        .replace(/\s+/g, "_");
};


// ------------------------------------------------------------
// Is Municipal Admin
// ------------------------------------------------------------
const isMunicipalAdmin = (req) => {

    const role = normalizeRole(
        req.user?.role
    );

    return role === "MUNICIPAL_ADMIN";
};


// ------------------------------------------------------------
// Is System Admin
// ------------------------------------------------------------
const isSystemAdmin = (req) => {

    const role = normalizeRole(
        req.user?.role
    );

    return role === "SYSTEM_ADMIN";
};


// ------------------------------------------------------------
// Normalize Day
// ------------------------------------------------------------
const normalizeDay = (day) => {

    if (!day) return null;

    return String(day)
        .trim()
        .toLowerCase();
};


// ------------------------------------------------------------
// Allowed Days
// Monday - Saturday
// ------------------------------------------------------------
const ALLOWED_DAYS = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday"
];


// ------------------------------------------------------------
// Validate Day
// ------------------------------------------------------------
const isValidDay = (day) => {

    return ALLOWED_DAYS.includes(
        normalizeDay(day)
    );

};


// ------------------------------------------------------------
// Format Day
// ------------------------------------------------------------
const formatDay = (day) => {

    const normalized =
        normalizeDay(day);

    if (!normalized) {
        return null;
    }

    return (
        normalized.charAt(0).toUpperCase() +
        normalized.slice(1)
    );

};


// ============================================================
// GET MUNICIPAL ADMIN KIFLE KETEMA
//
// IMPORTANT:
// Do NOT trust Kifle Ketema sent from React.
//
// Server reads it from database.
// ============================================================
const getAdminKifleKetema = async (req) => {

    if (!isMunicipalAdmin(req)) {
        return null;
    }


    const userId =
        Number(req.user?.id);


    if (
        !Number.isInteger(userId) ||
        userId <= 0
    ) {
        return null;
    }


    const result =
        await scheduleRepository.getKifleKetemas(
            userId,
            "MUNICIPAL_ADMIN"
        );


    if (
        !Array.isArray(result) ||
        result.length === 0
    ) {
        return null;
    }


    return result[0].kifle_ketema || null;
};


// ============================================================
// CHECK MUNICIPAL ADMIN ACCESS TO KIFLE
// ============================================================
const checkKifleAccess = async (
    req,
    kifleKetema
) => {

    if (!isMunicipalAdmin(req)) {
        return true;
    }


    const assignedKifleKetema =
        await getAdminKifleKetema(req);


    if (!assignedKifleKetema) {
        return false;
    }


    return (
        String(assignedKifleKetema)
            .trim()
            .toLowerCase()
        ===
        String(kifleKetema)
            .trim()
            .toLowerCase()
    );
};


// ============================================================
// GET ALL SCHEDULES
//
// Municipal Admin:
// ONLY assigned Kifle Ketema
//
// System Admin:
// ALL
// ============================================================
const getAllSchedules = async (
    req,
    res,
    next
) => {

    try {

        console.log(
            "================================="
        );

        console.log(
            "GET ALL SCHEDULES"
        );

        console.log(
            "USER:",
            req.user
        );

        console.log(
            "================================="
        );


        // ----------------------------------------------------
        // Municipal Admin
        // ----------------------------------------------------
        if (isMunicipalAdmin(req)) {

            const assignedKifleKetema =
                await getAdminKifleKetema(req);


            if (!assignedKifleKetema) {

                return res.status(403).json({
                    success: false,
                    message:
                        "No Kifle Ketema assigned to this Municipal Administrator."
                });

            }


            const schedules =
                await scheduleRepository
                    .getSchedulesByKifleKetema(
                        assignedKifleKetema
                    );


            return res.status(200).json({
                success: true,
                data: schedules
            });

        }


        // ----------------------------------------------------
        // System Admin
        // ----------------------------------------------------
        const schedules =
            await scheduleService
                .getAllSchedules();


        return res.status(200).json({
            success: true,
            data: schedules
        });


    } catch (error) {

        console.error(
            "GET ALL SCHEDULES ERROR:",
            error
        );

        next(error);
    }

};


// ============================================================
// GET SCHEDULE BY ID
// ============================================================
const getScheduleById = async (
    req,
    res,
    next
) => {

    try {

        const schedule =
            await scheduleService
                .getScheduleById(
                    req.params.id
                );


        // ----------------------------------------------------
        // Municipal Admin authorization
        // ----------------------------------------------------
        if (isMunicipalAdmin(req)) {

            const allowed =
                await checkKifleAccess(
                    req,
                    schedule.kifle_ketema
                );


            if (!allowed) {

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

        console.error(
            "GET SCHEDULE BY ID ERROR:",
            error
        );

        if (
            error.message ===
            "Schedule not found."
        ) {

            return res.status(404).json({
                success: false,
                message: "Schedule not found."
            });

        }


        next(error);
    }

};


// ============================================================
// CREATE SCHEDULE
//
// FRONTEND SENDS:
//
// {
//   team_id,
//   kifle_ketema,
//   kebele,
//   sefer,
//   day_of_week,
//   initial_date,
//   frequency,
//   start_time,
//   end_time,
//   status
// }
//
// collector_id is NOT required.
//
// Repository gets Team Leader as Driver.
// ============================================================
const createSchedule = async (
    req,
    res,
    next
) => {

    try {

        console.log(
            "================================="
        );

        console.log(
            "CREATE SCHEDULE REQUEST"
        );

        console.log(
            "BODY:",
            req.body
        );

        console.log(
            "USER:",
            req.user
        );

        console.log(
            "================================="
        );


        const {
            team_id,
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


        // ====================================================
        // TEAM REQUIRED
        // ====================================================
        if (!team_id) {

            return res.status(400).json({
                success: false,
                message:
                    "Collection Team is required."
            });

        }


        const teamId =
            Number(team_id);


        if (
            !Number.isInteger(teamId) ||
            teamId <= 0
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid Collection Team ID."
            });

        }


        // ====================================================
        // REQUIRED FIELDS
        // ====================================================
        if (!kifle_ketema) {

            return res.status(400).json({
                success: false,
                message:
                    "Kifle Ketema is required."
            });

        }


        if (!kebele) {

            return res.status(400).json({
                success: false,
                message:
                    "Kebele is required."
            });

        }


        if (!sefer) {

            return res.status(400).json({
                success: false,
                message:
                    "Sefer is required."
            });

        }


        if (!day_of_week) {

            return res.status(400).json({
                success: false,
                message:
                    "Day of week is required."
            });

        }


        if (!initial_date) {

            return res.status(400).json({
                success: false,
                message:
                    "Initial Date is required."
            });

        }


        if (!start_time) {

            return res.status(400).json({
                success: false,
                message:
                    "Start time is required."
            });

        }


        if (!end_time) {

            return res.status(400).json({
                success: false,
                message:
                    "End time is required."
            });

        }


        // ====================================================
        // MUNICIPAL ADMIN KIFLE AUTHORIZATION
        //
        // Server decides the allowed Kifle.
        // ====================================================
        if (isMunicipalAdmin(req)) {

            const assignedKifleKetema =
                await getAdminKifleKetema(req);


            if (!assignedKifleKetema) {

                return res.status(403).json({
                    success: false,
                    message:
                        "No Kifle Ketema assigned to this Municipal Administrator."
                });

            }


            if (
                String(kifle_ketema)
                    .trim()
                    .toLowerCase()
                !==
                String(assignedKifleKetema)
                    .trim()
                    .toLowerCase()
            ) {

                return res.status(403).json({
                    success: false,
                    message:
                        `You can only create schedules for ${assignedKifleKetema}.`
                });

            }

        }


        // ====================================================
        // VALIDATE DATE
        //
        // Date and Day are independent.
        // ====================================================
        const parsedDate =
            new Date(
                `${initial_date}T00:00:00`
            );


        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid initial date."
            });

        }


        // ====================================================
        // VALIDATE DAY
        // ====================================================
        if (
            !isValidDay(
                day_of_week
            )
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Day must be Monday, Tuesday, Wednesday, Thursday, Friday, or Saturday."
            });

        }


        const dayValue =
            formatDay(
                day_of_week
            );


        // ====================================================
        // VALIDATE TIME
        // ====================================================
        if (
            start_time >= end_time
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "End time must be after start time."
            });

        }


        // ====================================================
        // VERIFY TEAM
        // ====================================================
        const team =
            await scheduleRepository.getTeamForSchedule?.(
                teamId
            );


        /*
         * The repository version we created earlier
         * validates the team itself during createSchedule.
         *
         * Therefore we don't require a separate repository
         * method here.
         */


        // ====================================================
        // CONFLICT CHECK
        //
        // Team-based conflict.
        // ====================================================
        const conflict =
            await scheduleRepository
                .findScheduleConflict({
                    team_id: teamId,

                    collector_id: null,

                    kifle_ketema:
                        String(
                            kifle_ketema
                        ).trim(),

                    kebele:
                        String(
                            kebele
                        ).trim(),

                    sefer:
                        String(
                            sefer
                        ).trim(),

                    day_of_week:
                        normalizeDay(
                            day_of_week
                        ),

                    start_time,

                    end_time
                });


        if (conflict) {

            return res.status(409).json({
                success: false,
                message:
                    "This Collection Team already has a schedule at the selected time for the same Kebele and Sefer."
            });

        }


        // ====================================================
        // CREATE
        //
        // collector_id is intentionally NOT sent.
        // Repository uses team_leader_id.
        // ====================================================
        const schedule =
            await scheduleService
                .createSchedule({

                    team_id: teamId,

                    kifle_ketema:
                        String(
                            kifle_ketema
                        ).trim(),

                    kebele:
                        String(
                            kebele
                        ).trim(),

                    sefer:
                        String(
                            sefer
                        ).trim(),

                    day_of_week:
                        dayValue,

                    initial_date,

                    frequency:
                        frequency ||
                        "Every 2 Weeks",

                    start_time,

                    end_time,

                    status:
                        status ||
                        "ACTIVE"
                });


        return res.status(201).json({

            success: true,

            message:
                "Collection schedule created successfully.",

            data: schedule

        });


    } catch (error) {

        console.error(
            "CREATE SCHEDULE ERROR:",
            error
        );

        next(error);
    }

};


// ============================================================
// UPDATE SCHEDULE
// ============================================================
const updateSchedule = async (
    req,
    res,
    next
) => {

    try {

        const scheduleId =
            Number(
                req.params.id
            );


        if (
            !Number.isInteger(scheduleId) ||
            scheduleId <= 0
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid Schedule ID."
            });

        }


        // ====================================================
        // EXISTING
        // ====================================================
        const existingSchedule =
            await scheduleRepository
                .getScheduleById(
                    scheduleId
                );


        if (!existingSchedule) {

            return res.status(404).json({
                success: false,
                message:
                    "Schedule not found."
            });

        }


        // ====================================================
        // MUNICIPAL ADMIN ACCESS
        // ====================================================
        if (isMunicipalAdmin(req)) {

            const allowed =
                await checkKifleAccess(
                    req,
                    existingSchedule.kifle_ketema
                );


            if (!allowed) {

                return res.status(403).json({
                    success: false,
                    message:
                        "You are not authorized to update this schedule."
                });

            }

        }


        // ====================================================
        // VALUES
        // ====================================================
        const teamId =
            req.body.team_id !== undefined
                ? Number(req.body.team_id)
                : Number(existingSchedule.team_id);


        if (
            !Number.isInteger(teamId) ||
            teamId <= 0
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Collection Team is required."
            });

        }


        const kifleKetema =
            req.body.kifle_ketema !== undefined
                ? String(
                    req.body.kifle_ketema
                ).trim()
                : existingSchedule.kifle_ketema;


        const kebele =
            req.body.kebele !== undefined
                ? String(
                    req.body.kebele
                ).trim()
                : existingSchedule.kebele;


        const sefer =
            req.body.sefer !== undefined
                ? String(
                    req.body.sefer
                ).trim()
                : existingSchedule.sefer;


        const dayOfWeek =
            req.body.day_of_week !== undefined
                ? String(
                    req.body.day_of_week
                ).trim()
                : existingSchedule.day_of_week;


        const initialDate =
            req.body.initial_date !== undefined
                ? req.body.initial_date
                : existingSchedule.initial_date;


        const frequency =
            req.body.frequency !== undefined
                ? req.body.frequency
                : (
                    existingSchedule.frequency ||
                    "Every 2 Weeks"
                );


        const startTime =
            req.body.start_time !== undefined
                ? req.body.start_time
                : existingSchedule.start_time;


        const endTime =
            req.body.end_time !== undefined
                ? req.body.end_time
                : existingSchedule.end_time;


        const status =
            req.body.status !== undefined
                ? req.body.status
                : (
                    existingSchedule.status ||
                    "ACTIVE"
                );


        // ====================================================
        // MUNICIPAL ADMIN CANNOT CHANGE TO ANOTHER KIFLE
        // ====================================================
        if (isMunicipalAdmin(req)) {

            const assignedKifleKetema =
                await getAdminKifleKetema(req);


            if (!assignedKifleKetema) {

                return res.status(403).json({
                    success: false,
                    message:
                        "No Kifle Ketema assigned to this Municipal Administrator."
                });

            }


            if (
                kifleKetema
                    .trim()
                    .toLowerCase()
                !==
                assignedKifleKetema
                    .trim()
                    .toLowerCase()
            ) {

                return res.status(403).json({
                    success: false,
                    message:
                        `You can only manage schedules for ${assignedKifleKetema}.`
                });

            }

        }


        // ====================================================
        // REQUIRED
        // ====================================================
        if (
            !kifleKetema ||
            !kebele ||
            !sefer ||
            !dayOfWeek ||
            !initialDate ||
            !startTime ||
            !endTime
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "All required schedule fields must be provided."
            });

        }


        // ====================================================
        // DATE
        // ====================================================
        const parsedDate =
            new Date(
                `${initialDate}T00:00:00`
            );


        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid initial date."
            });

        }


        // ====================================================
        // DAY
        // ====================================================
        if (
            !isValidDay(
                dayOfWeek
            )
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Day must be Monday, Tuesday, Wednesday, Thursday, Friday, or Saturday."
            });

        }


        const normalizedDay =
            normalizeDay(
                dayOfWeek
            );


        const dayValue =
            formatDay(
                dayOfWeek
            );


        // ====================================================
        // TIME
        // ====================================================
        if (
            startTime >= endTime
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "End time must be after start time."
            });

        }


        // ====================================================
        // CONFLICT
        // ====================================================
        const conflict =
            await scheduleRepository
                .findScheduleConflict({

                    team_id: teamId,

                    collector_id:
                        existingSchedule.collector_id,

                    kifle_ketema:
                        kifleKetema,

                    kebele,

                    sefer,

                    day_of_week:
                        normalizedDay,

                    start_time:
                        startTime,

                    end_time:
                        endTime,

                    exclude_schedule_id:
                        scheduleId

                });


        if (conflict) {

            return res.status(409).json({
                success: false,
                message:
                    "This Collection Team already has another schedule at the selected time for the same Kebele and Sefer."
            });

        }


        // ====================================================
        // UPDATE
        //
        // Repository automatically changes
        // collector_id to Team Leader / Driver.
        // ====================================================
        const schedule =
            await scheduleService
                .updateSchedule(

                    scheduleId,

                    {

                        team_id:
                            teamId,

                        kifle_ketema:
                            kifleKetema,

                        kebele,

                        sefer,

                        day_of_week:
                            dayValue,

                        initial_date:
                            initialDate,

                        frequency,

                        start_time:
                            startTime,

                        end_time:
                            endTime,

                        status

                    }
                );


        if (!schedule) {

            return res.status(404).json({
                success: false,
                message:
                    "Schedule not found."
            });

        }


        return res.status(200).json({

            success: true,

            message:
                "Schedule updated successfully.",

            data:
                schedule

        });


    } catch (error) {

        console.error(
            "UPDATE SCHEDULE ERROR:",
            error
        );

        next(error);
    }

};


// ============================================================
// DELETE SCHEDULE
// ============================================================
const deleteSchedule = async (
    req,
    res,
    next
) => {

    try {

        const scheduleId =
            Number(
                req.params.id
            );


        if (
            !Number.isInteger(scheduleId) ||
            scheduleId <= 0
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid Schedule ID."
            });

        }


        const existingSchedule =
            await scheduleRepository
                .getScheduleById(
                    scheduleId
                );


        if (!existingSchedule) {

            return res.status(404).json({
                success: false,
                message:
                    "Schedule not found."
            });

        }


        // ====================================================
        // MUNICIPAL ADMIN ACCESS
        // ====================================================
        if (isMunicipalAdmin(req)) {

            const allowed =
                await checkKifleAccess(
                    req,
                    existingSchedule.kifle_ketema
                );


            if (!allowed) {

                return res.status(403).json({
                    success: false,
                    message:
                        "You are not authorized to delete this schedule."
                });

            }

        }


        await scheduleService
            .deleteSchedule(
                scheduleId
            );


        return res.status(200).json({

            success: true,

            message:
                "Schedule deleted successfully."

        });


    } catch (error) {

        console.error(
            "DELETE SCHEDULE ERROR:",
            error
        );

        next(error);
    }

};


// ============================================================
// GET SCHEDULES BY COLLECTOR
// ============================================================
const getSchedulesByCollector = async (
    req,
    res,
    next
) => {

    try {

        const collectorId =
            Number(
                req.params.collector_id
            );


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
            await scheduleService
                .getSchedulesByCollector(
                    collectorId
                );


        return res.status(200).json({

            success: true,

            data:
                schedules

        });


    } catch (error) {

        console.error(
            "GET COLLECTOR SCHEDULES ERROR:",
            error
        );

        next(error);
    }

};


// ============================================================
// GET MY SCHEDULE
//
// Resident / Business Owner
// ============================================================
const getMySchedule = async (
    req,
    res,
    next
) => {

    try {

        if (!req.user?.id) {

            return res.status(401).json({
                success: false,
                message:
                    "User authentication required."
            });

        }


        const schedules =
            await scheduleService
                .getMySchedule(

                    req.user.id,

                    normalizeRole(
                        req.user.role
                    )

                );


        return res.status(200).json({

            success: true,

            data:
                schedules

        });


    } catch (error) {

        console.error(
            "GET MY SCHEDULE ERROR:",
            error
        );

        next(error);
    }

};


// ============================================================
// GET KIFLE KETEMAS
//
// Municipal Admin:
// only assigned Kifle
//
// System Admin:
// all Kifles
//
// Frontend does NOT hard-code Kifle Ketema.
// ============================================================
const getKifleKetemas = async (
    req,
    res,
    next
) => {

    try {

        const userId =
            Number(
                req.user?.id
            );


        if (
            !Number.isInteger(userId) ||
            userId <= 0
        ) {

            return res.status(401).json({
                success: false,
                message:
                    "User authentication required."
            });

        }


        const role =
            normalizeRole(
                req.user?.role
            );


        const kifleKetemas =
            await scheduleService
                .getKifleKetemas(
                    userId,
                    role
                );


        return res.status(200).json({

            success: true,

            data:
                kifleKetemas

        });


    } catch (error) {

        console.error(
            "GET KIFLE KETEMAS ERROR:",
            error
        );

        next(error);
    }

};


// ============================================================
// GET KEBELES BY KIFLE KETEMA
// ============================================================
const getKebelesByKifleKetema = async (
    req,
    res,
    next
) => {

    try {

        const kifleKetema =
            req.params.kifle_ketema;


        if (!kifleKetema) {

            return res.status(400).json({
                success: false,
                message:
                    "Kifle Ketema is required."
            });

        }


        // ====================================================
        // MUNICIPAL ADMIN AUTHORIZATION
        // ====================================================
        const allowed =
            await checkKifleAccess(
                req,
                kifleKetema
            );


        if (!allowed) {

            return res.status(403).json({
                success: false,
                message:
                    "You are not authorized to access this Kifle Ketema."
            });

        }


        const kebeles =
            await scheduleService
                .getKebelesByKifleKetema(
                    kifleKetema
                );


        return res.status(200).json({

            success: true,

            data:
                kebeles

        });


    } catch (error) {

        console.error(
            "GET KEBELES ERROR:",
            error
        );

        next(error);
    }

};


// ============================================================
// GET SEFERS BY TEAM
// ============================================================
const getSefersByTeam = async (
    req,
    res,
    next
) => {

    try {

        const teamId =
            Number(
                req.params.team_id
            );


        if (
            !Number.isInteger(teamId) ||
            teamId <= 0
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid Collection Team ID."
            });

        }


        const sefers =
            await scheduleService
                .getSefersByTeam(
                    teamId
                );


        return res.status(200).json({

            success: true,

            data:
                sefers

        });


    } catch (error) {

        console.error(
            "GET SEFERS BY TEAM ERROR:",
            error
        );

        next(error);
    }

};


// ============================================================
// EXPORT
// ============================================================
module.exports = {

    getAllSchedules,

    getScheduleById,

    createSchedule,

    updateSchedule,

    deleteSchedule,

    getSchedulesByCollector,

    getMySchedule,

    getKifleKetemas,

    getKebelesByKifleKetema,

    getSefersByTeam

};