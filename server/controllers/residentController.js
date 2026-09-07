
const { getSocket } = require("../utils/socket");

const residentRepository = require("../repositories/residentRepository");
const municipalAdminRepository =
require("../repositories/municipalAdminRepository");
// =================================
// Get All Residents
// =================================
const getAllResidents = async (req, res, next) => {
    try {
        console.log("GET /residents called");

        let kifleKetema = null;

// Municipal Admin 
if (req.user.role === "MUNICIPAL_ADMIN") {

    const admin =
        await municipalAdminRepository.getAdminById(req.user.id);

    kifleKetema = admin.assigned_kifle_ketema;
}

const residents =
    await residentRepository.getAllResidents(kifleKetema);
        console.log(residents);

        return res.status(200).json({
            success: true,
            data: residents,
        });

    } catch (error) {
        next(error);
    }
};

// =================================
// Get Resident By ID
// =================================
const getResidentById = async (req, res, next) => {
    try {
        const resident =
            await residentRepository.getResidentById(
                req.params.id
            );

        if (!resident) {
            return res.status(404).json({
                success: false,
                message: "Resident not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: resident,
        });

    } catch (error) {
        next(error);
    }
};

// =================================
// Create Resident
// =================================
// =================================
// Create Resident
// =================================
const createResident = async (req, res, next) => {
    try {

        console.log("========== CREATE RESIDENT ==========");

        const payload = {
            ...req.body,
        };

        if (req.file) {
            payload.profile_image =
                req.file.path ||
                req.file.filename;
        }

        // =================================
        // CREATE RESIDENT
        // =================================

        const resident =
            await residentRepository.createResident(payload);

        console.log("✅ RESIDENT CREATED:", resident);

        // =================================
        // SEND SOCKET NOTIFICATION
        // =================================

        try {

            const io = getSocket();

            if (!io) {
                console.log("⚠️ Socket instance not available");
            } else {

                console.log("📡 Socket instance available");

                // Find Municipal Admins
                // assigned to resident's Kifle Ketema

                const admins =
                    await municipalAdminRepository
                        .getMunicipalAdminsByKifleKetema(
                            resident.kifle_ketema
                        );

                console.log(
                    "MUNICIPAL ADMINS:",
                    admins
                );

                // Send notification to each admin

                admins.forEach((admin) => {

                    const room =
                        `MUNICIPAL_ADMIN_${admin.id}`;

                    io.to(room).emit(
                        "newNotification",
                        {
                            title: "New Resident Registered",

                            message:
                                `${resident.full_name} has registered in ${resident.kifle_ketema}.`,

                            type: "RESIDENT_REGISTERED",

                            resident_id: resident.id,

                            kifle_ketema:
                                resident.kifle_ketema,

                            created_at:
                                new Date().toISOString(),
                        }
                    );

                    console.log(
                        "📨 NOTIFICATION SENT TO:",
                        room
                    );
                });
            }

        } catch (socketError) {

            console.error(
                "⚠️ SOCKET NOTIFICATION ERROR:",
                socketError
            );

        }

        // =================================
        // RESPONSE
        // =================================

        return res.status(201).json({
            success: true,
            message: "Resident created successfully",
            data: resident,
        });

    } catch (error) {

        console.error(
            "CREATE RESIDENT ERROR:",
            error
        );

        next(error);
    }
};

// =================================
// Update Resident
// =================================
const updateResident = async (req, res, next) => {
    try {
        const payload = {
            ...req.body,
        };

        if (req.file) {
            payload.profile_image =
                req.file.path ||
                req.file.filename;
        }

        const resident =
            await residentRepository.updateResident(
                req.params.id,
                payload
            );

        if (!resident) {
            return res.status(404).json({
                success: false,
                message: "Resident not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Resident updated successfully",
            data: resident,
        });

    } catch (error) {
        next(error);
    }
};

// =================================
// Delete Resident
// =================================
const deleteResident = async (req, res, next) => {
    try {
        const residentId = Number(req.params.id);

        if (!Number.isInteger(residentId) || residentId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid resident ID."
            });
        }

        const resident =
            await residentRepository.getResidentById(residentId);

        if (!resident) {
            return res.status(404).json({
                success: false,
                message: "Resident not found."
            });
        }

        const deletedResident =
            await residentRepository.deleteResident(residentId);

        if (!deletedResident) {
            return res.status(404).json({
                success: false,
                message: "Resident could not be deleted."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Resident deleted successfully.",
            data: deletedResident
        });

    } catch (error) {

        console.error("========== DELETE RESIDENT BACKEND ERROR ==========");
        console.error("Code:", error.code);
        console.error("Message:", error.message);
        console.error("Detail:", error.detail);
        console.error("Constraint:", error.constraint);
        console.error("Table:", error.table);
        console.error("Column:", error.column);

        return res.status(500).json({
            success: false,
            message: error.detail || error.message || "Failed to delete resident."
        });
    }
};
// =================================
// Get Logged-in Resident Profile
// =================================
const getMyProfile = async (req, res, next) => {
    try {
        const resident =
            await residentRepository.getResidentById(
                req.user.id
            );

        if (!resident) {
            return res.status(404).json({
                success: false,
                message: "Resident not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: resident,
        });

    } catch (error) {
        next(error);
    }
};
const updateMyProfile = async (req, res, next) => {
    try {

        console.log("========== UPDATE PROFILE ==========");
        console.log("REQ.USER:", req.user);
        console.log("REQ.USER.ID:", req.user?.id);
        console.log("BODY:", req.body);

        const residentId = Number(req.user?.id);

        console.log("PARSED RESIDENT ID:", residentId);

        if (!Number.isInteger(residentId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid resident ID."
            });
        }

        const resident =
            await residentRepository.updateResident(
                residentId,
                {
                    full_name: req.body.full_name,
                    phone_number: req.body.phone_number,
                    email: req.body.email,
                    kifle_ketema: req.body.kifle_ketema,
                    kebele: req.body.kebele,
                    sefer: req.body.sefer,
                }
            );

        if (!resident) {
            return res.status(404).json({
                success: false,
                message: "Resident not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully.",
            data: resident
        });

    } catch (error) {

        console.error(
            "UPDATE PROFILE ERROR:",
            error
        );

        console.error("CODE:", error.code);
        console.error("MESSAGE:", error.message);
        console.error("DETAIL:", error.detail);

        next(error);
    }
};
// =================================
// Resident Dashboard
// =================================
const getDashboard = async (req, res, next) => {
    try {
        const dashboard =
            await residentRepository.getDashboard(
                req.user.id
            );

        return res.status(200).json({
            success: true,
            data: dashboard,
        });

    } catch (error) {
        next(error);
    }
    
};

// =================================
// Export Functions
// =================================
module.exports = {
    getAllResidents,
    getResidentById,
    createResident,
    updateResident,
    deleteResident,
    getMyProfile,
    updateMyProfile,
    getDashboard,
};