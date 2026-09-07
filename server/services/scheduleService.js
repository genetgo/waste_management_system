const scheduleRepository = require("../repositories/scheduleRepository");

// ==========================================
// Get All Schedules
// ==========================================
const getAllSchedules = async () => {
    return await scheduleRepository.getAllSchedules();
};

// ==========================================
// Get Schedule By ID
// ==========================================
const getScheduleById = async (id) => {

    const schedule = await scheduleRepository.getScheduleById(id);

    if (!schedule) {
        throw new Error("Schedule not found.");
    }

    return schedule;
};

// ==========================================
// Get Schedules By Collector
// ==========================================
const getSchedulesByCollector = async (collectorId) => {

    return await scheduleRepository.getSchedulesByCollector(
        collectorId
    );

};

// ==========================================
// Get Schedules By Kifle Ketema
// ==========================================
const getSchedulesByKifleKetema = async (kifleKetema) => {

    return await scheduleRepository.getSchedulesByKifleKetema(
        kifleKetema
    );

};

// ==========================================
// Get Schedules By Kebele
// ==========================================
const getSchedulesByKebele = async (
    kifle_ketema,
    kebele
) => {

    return await scheduleRepository.getSchedulesByKebele(
        kifle_ketema,
        kebele
    );

};

// ==========================================
// Create Schedule
// ==========================================
const createSchedule = async (data) => {

    if (
        !data.kifle_ketema ||
        !data.kebele ||
        !data.sefer ||
        !data.day_of_week ||
        !data.start_time ||
        !data.end_time
    ) {
        throw new Error("All required fields must be provided.");
    }

    if (data.start_time >= data.end_time) {
        throw new Error("End time must be greater than Start time.");
    }

    data.frequency = data.frequency || "Every 2 Weeks";
    data.status = data.status || "ACTIVE";

    return await scheduleRepository.createSchedule(data);
};

// ==========================================
// Update Schedule
// ==========================================
const updateSchedule = async (id, data) => {

    if (
        !data.kifle_ketema ||
        !data.kebele ||
        !data.sefer ||
        !data.day_of_week ||
        !data.start_time ||
        !data.end_time
    ) {
        throw new Error("All required fields must be provided.");
    }

    if (data.start_time >= data.end_time) {
        throw new Error("End time must be greater than Start time.");
    }

    data.frequency = data.frequency || "Every 2 Weeks";

    return await scheduleRepository.updateSchedule(id, data);
};

// ==========================================
// Update Schedule Status
// ==========================================
const updateScheduleStatus = async (
    id,
    status
) => {

    return await scheduleRepository.updateScheduleStatus(
        id,
        status
    );

};

// ==========================================
// Delete Schedule
// ==========================================
const deleteSchedule = async (id) => {

    const schedule =
        await scheduleRepository.getScheduleById(id);

    if (!schedule) {
        throw new Error("Schedule not found.");
    }

    return await scheduleRepository.deleteSchedule(id);

};

// ==========================================
// Get Logged-in User Schedule
// ==========================================
const getMySchedule = async (userId) => {

    return await scheduleRepository.getMySchedule(
        userId
    );

};

// ==========================================
// Export
// ==========================================
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
    getMySchedule
};