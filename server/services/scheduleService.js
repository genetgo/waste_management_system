const scheduleRepository = require("../repositories/scheduleRepository");


// ============================================================
// GET ALL SCHEDULES
// ============================================================
const getAllSchedules = async () => {

    return await scheduleRepository.getAllSchedules();

};


// ============================================================
// GET SCHEDULE BY ID
// ============================================================
const getScheduleById = async (id) => {

    if (!id) {
        throw new Error("Schedule ID is required.");
    }

    const schedule =
        await scheduleRepository.getScheduleById(id);

    if (!schedule) {
        throw new Error("Schedule not found.");
    }

    return schedule;

};


// ============================================================
// GET SCHEDULES BY COLLECTOR
// ============================================================
const getSchedulesByCollector = async (
    collectorId
) => {

    if (!collectorId) {
        throw new Error("Collector ID is required.");
    }

    return await scheduleRepository.getSchedulesByCollector(
        collectorId
    );

};


// ============================================================
// GET SCHEDULES BY KIFLE KETEMA
// ============================================================
const getSchedulesByKifleKetema = async (
    kifleKetema
) => {

    if (!kifleKetema) {
        throw new Error("Kifle Ketema is required.");
    }

    return await scheduleRepository.getSchedulesByKifleKetema(
        kifleKetema
    );

};


// ============================================================
// GET SCHEDULES BY KEBELE
// ============================================================
const getSchedulesByKebele = async (
    kifleKetema,
    kebele
) => {

    if (!kifleKetema) {
        throw new Error("Kifle Ketema is required.");
    }

    if (!kebele) {
        throw new Error("Kebele is required.");
    }

    return await scheduleRepository.getSchedulesByKebele(
        kifleKetema,
        kebele
    );

};


// ============================================================
// CREATE SCHEDULE
//
// FLOW:
//
// Municipal Admin
//       ↓
// Kifle Ketema
//       ↓
// Kebele
//       ↓
// Collection Team
//       ↓
// Team Leader = Driver
//       ↓
// Sefer
//       ↓
// Day / Date / Time
// ============================================================
const createSchedule = async (data) => {

    if (!data) {
        throw new Error("Schedule data is required.");
    }


    // ========================================================
    // TEAM IS REQUIRED
    // ========================================================
    if (!data.team_id) {
        throw new Error(
            "Collection Team is required."
        );
    }


    // ========================================================
    // REQUIRED LOCATION
    // ========================================================
    if (!data.kifle_ketema) {
        throw new Error(
            "Kifle Ketema is required."
        );
    }

    if (!data.kebele) {
        throw new Error(
            "Kebele is required."
        );
    }

    if (!data.sefer) {
        throw new Error(
            "Sefer is required."
        );
    }


    // ========================================================
    // DAY
    // ========================================================
    if (!data.day_of_week) {
        throw new Error(
            "Day of week is required."
        );
    }


    // ========================================================
    // DATE
    // ========================================================
    if (!data.initial_date) {
        throw new Error(
            "Initial date is required."
        );
    }


    // ========================================================
    // TIME
    // ========================================================
    if (!data.start_time) {
        throw new Error(
            "Start time is required."
        );
    }

    if (!data.end_time) {
        throw new Error(
            "End time is required."
        );
    }


    // ========================================================
    // TIME VALIDATION
    // ========================================================
    if (
        data.start_time >=
        data.end_time
    ) {

        throw new Error(
            "End time must be greater than Start time."
        );

    }


    // ========================================================
    // DEFAULTS
    // ========================================================
    data.frequency =
        data.frequency ||
        "Every 2 Weeks";

    data.status =
        data.status ||
        "ACTIVE";


    // ========================================================
    // IMPORTANT
    //
    // collector_id DOES NOT need to come
    // from React.
    //
    // Repository gets:
    //
    // team.team_leader_id
    //
    // and uses that as Driver.
    // ========================================================
    return await scheduleRepository.createSchedule(
        data
    );

};


// ============================================================
// UPDATE SCHEDULE
// ============================================================
const updateSchedule = async (
    id,
    data
) => {

    if (!id) {
        throw new Error(
            "Schedule ID is required."
        );
    }

    if (!data) {
        throw new Error(
            "Schedule data is required."
        );
    }


    // ========================================================
    // TEAM REQUIRED
    // ========================================================
    if (!data.team_id) {
        throw new Error(
            "Collection Team is required."
        );
    }


    // ========================================================
    // REQUIRED LOCATION
    // ========================================================
    if (!data.kifle_ketema) {
        throw new Error(
            "Kifle Ketema is required."
        );
    }

    if (!data.kebele) {
        throw new Error(
            "Kebele is required."
        );
    }

    if (!data.sefer) {
        throw new Error(
            "Sefer is required."
        );
    }


    // ========================================================
    // DAY
    // ========================================================
    if (!data.day_of_week) {
        throw new Error(
            "Day of week is required."
        );
    }


    // ========================================================
    // DATE
    // ========================================================
    if (!data.initial_date) {
        throw new Error(
            "Initial date is required."
        );
    }


    // ========================================================
    // TIME
    // ========================================================
    if (!data.start_time) {
        throw new Error(
            "Start time is required."
        );
    }

    if (!data.end_time) {
        throw new Error(
            "End time is required."
        );
    }


    // ========================================================
    // TIME VALIDATION
    // ========================================================
    if (
        data.start_time >=
        data.end_time
    ) {

        throw new Error(
            "End time must be greater than Start time."
        );

    }


    // ========================================================
    // DEFAULT FREQUENCY
    // ========================================================
    data.frequency =
        data.frequency ||
        "Every 2 Weeks";


    return await scheduleRepository.updateSchedule(
        id,
        data
    );

};


// ============================================================
// UPDATE SCHEDULE STATUS
// ============================================================
const updateScheduleStatus = async (
    id,
    status
) => {

    if (!id) {
        throw new Error(
            "Schedule ID is required."
        );
    }

    if (!status) {
        throw new Error(
            "Schedule status is required."
        );
    }


    const allowedStatuses = [
        "ACTIVE",
        "INACTIVE",
        "CANCELLED"
    ];


    if (
        !allowedStatuses.includes(
            String(status).toUpperCase()
        )
    ) {

        throw new Error(
            "Invalid schedule status."
        );

    }


    return await scheduleRepository.updateScheduleStatus(
        id,
        String(status).toUpperCase()
    );

};


// ============================================================
// DELETE SCHEDULE
// ============================================================
const deleteSchedule = async (
    id
) => {

    if (!id) {
        throw new Error(
            "Schedule ID is required."
        );
    }


    const schedule =
        await scheduleRepository.getScheduleById(id);


    if (!schedule) {
        throw new Error(
            "Schedule not found."
        );
    }


    return await scheduleRepository.deleteSchedule(
        id
    );

};


// ============================================================
// GET MY SCHEDULE
//
// Resident / Business Owner
// ============================================================
const getMySchedule = async (
    userId,
    role
) => {

    if (!userId) {
        throw new Error(
            "User ID is required."
        );
    }


    return await scheduleRepository.getMySchedule(
        userId,
        role
    );

};


// ============================================================
// GET KIFLE KETEMAS
//
// IMPORTANT:
//
// Kifle Ketema is NOT hard-coded in React.
//
// Municipal Admin:
//     → only his assigned Kifle
//
// System Admin:
//     → all Kifles
// ============================================================
const getKifleKetemas = async (
    userId,
    role
) => {

    if (!userId) {
        throw new Error(
            "User ID is required."
        );
    }


    return await scheduleRepository.getKifleKetemas(
        userId,
        role
    );

};


// ============================================================
// GET KEBELES BY KIFLE KETEMA
// ============================================================
const getKebelesByKifleKetema = async (
    kifleKetema
) => {

    if (!kifleKetema) {
        throw new Error(
            "Kifle Ketema is required."
        );
    }


    return await scheduleRepository.getKebelesByKifleKetema(
        kifleKetema
    );

};


// ============================================================
// GET SEFERS BY TEAM
// ============================================================
const getSefersByTeam = async (
    teamId
) => {

    if (!teamId) {
        throw new Error(
            "Collection Team ID is required."
        );
    }


    return await scheduleRepository.getSefersByTeam(
        teamId
    );

};


// ============================================================
// EXPORT
// ============================================================
module.exports = {

    getAllSchedules,

    getScheduleById,

    getSchedulesByCollector,

    getSchedulesByKifleKetema,

    getSchedulesByKebele,

    createSchedule,

    updateSchedule,

    updateScheduleStatus,

    deleteSchedule,

    getMySchedule,

    getKifleKetemas,

    getKebelesByKifleKetema,

    getSefersByTeam

};