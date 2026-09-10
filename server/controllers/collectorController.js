
const collectorRepository = require("../repositories/collectorRepository");
const municipalAdminRepository = require("../repositories/municipalAdminRepository");
const bcrypt = require("bcryptjs");

/// =================================
// Get All Collectors
// =================================
const getAllCollectors = async (req, res, next) => {
    try {

        let kifleKetema = null;

        // Municipal Admin
        // can only see collectors from
        // his/her assigned Kifle Ketema
        if (req.user.role === "MUNICIPAL_ADMIN") {

            const admin =
                await municipalAdminRepository.getAdminById(
                    req.user.id
                );

            if (!admin) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Municipal administrator not found."
                });
            }

            kifleKetema =
                admin.assigned_kifle_ketema;
        }


        const collectors =
            await collectorRepository.getAllCollectors(
                kifleKetema
            );


        return res.status(200).json({
            success: true,
            data: collectors
        });


    } catch (error) {
        next(error);
    }
};


const getActiveCollectorsForSchedule = async(req,res,next)=>{

try{

const collectors =
await collectorRepository.getAllCollectors();
console.log("SCHEDULE COLLECTORS:", collectors);

res.status(200).json({

success:true,
data:collectors

});


}catch(error){

next(error);

}

};
const getCollectorTasks = async (req, res, next) => {
    try {

        const collectorId = req.user.id;

        const requests =
            await collectorRepository.getAssignedRequests(
                collectorId
            );

        const schedules =
            await collectorRepository.getCollectorSchedules(
                collectorId
            );

        return res.status(200).json({
            success: true,
            data: {
                requests,
                schedules
            }
        });

    } catch (error) {
        next(error);
    }
};
//========
// Get Collector By ID
// =================================
const getCollectorById = async (req, res, next) => {
    try {
        const collector =
            await collectorRepository.getCollectorById(req.params.id);

        if (!collector) {
            return res.status(404).json({
                success: false,
                message: "Collector not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: collector
        });

    } catch (error) {
        next(error);
    }
};


// =================================
// Register Collector
// =================================
const registerCollector = async (req, res, next) => {
    try {
        const payload = {
            ...req.body
        };

        if (req.file) {
            payload.profile_image =
                req.file.path || req.file.filename;
        }

        payload.is_active = true;

        const collector =
            await collectorRepository.createCollector(payload);

        return res.status(201).json({
            success: true,
            message: "Collector registered successfully.",
            data: collector
        });

    } catch (error) {
        next(error);
    }
};


// =================================
// Update Collector
// =================================
const updateCollector = async (req, res, next) => {
    try {
        const payload = {
            ...req.body
        };

        if (req.file) {
            payload.profile_image =
                req.file.path || req.file.filename;
        }

        const collector =
            await collectorRepository.updateCollector(
                req.params.id,
                payload
            );

        if (!collector) {
            return res.status(404).json({
                success: false,
                message: "Collector not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Collector updated successfully.",
            data: collector
        });

    } catch (error) {
        next(error);
    }
};


// =================================
// Delete Collector
// =================================
const deleteCollector = async (req, res, next) => {
    try {
        const collector =
            await collectorRepository.deleteCollector(req.params.id);

        if (!collector) {
            return res.status(404).json({
                success: false,
                message: "Collector not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Collector deleted successfully."
        });

    } catch (error) {
        next(error);
    }
};


// =================================
// Activate / Deactivate Collector
// =================================
const updateCollectorStatus = async (req, res, next) => {
    try {
        const { is_active } = req.body;

        const collector =
            await collectorRepository.updateCollectorStatus(
                req.params.id,
                is_active
            );

        if (!collector) {
            return res.status(404).json({
                success: false,
                message: "Collector not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Collector status updated successfully.",
            data: collector
        });

    } catch (error) {
        next(error);
    }
};


// =================================
// Search Collectors
// =================================
const searchCollectors = async (req, res, next) => {
    try {
        const keyword = req.query.keyword || "";

        const collectors =
            await collectorRepository.searchCollectors(keyword);

        return res.status(200).json({
            success: true,
            data: collectors
        });

    } catch (error) {
        next(error);
    }
};

const getAssignedRequestDetails = async (req, res, next) => {
    try {
        const requestId = req.params.id;
        const collectorId = req.user.id;

        if (!requestId) {
            return res.status(400).json({
                success: false,
                message: "Request ID is required."
            });
        }

        const request =
            await collectorRepository.getAssignedRequestDetails(
                requestId,
                collectorId
            );

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Assigned request not found."
            });
        }

        return res.status(200).json({
            success: true,
            data: request
        });

    } catch (error) {
        console.error("GET ASSIGNED REQUEST DETAILS ERROR:", error);
        next(error);
    }
};

// =================================
// Get Assigned Requests
// =================================
const getAssignedRequests = async (req, res, next) => {
    try {
        const collectorId = req.user.id;

        const requests =
            await collectorRepository.getAssignedRequests(
                collectorId
            );

        return res.status(200).json({
            success: true,
            data: requests
        });

    } catch (error) {
        next(error);
    }
};


// =================================
// Update Request Status
// =================================
const updateRequestStatus = async (req, res, next) => {
    try {
        const collectorId = req.user.id;
        const { status } = req.body;

        const updatedRequest =
            await collectorRepository.updateRequestStatus(
                req.params.id,
                collectorId,
                status
            );

        if (!updatedRequest) {
            return res.status(404).json({
                success: false,
                message:
                    "Request not found or not assigned to this collector."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Request status updated successfully.",
            data: updatedRequest
        });

    } catch (error) {
        next(error);
    }
    
};

// ==========================================
// Start Collection
// Assigned -> In Progress
// ==========================================
const startCollection = async (req, res, next) => {

    try {

        const requestId = Number(req.params.id);
        const collectorId = Number(req.user.id);

        console.log("========== START COLLECTION ==========");
        console.log("Request ID:", requestId);
        console.log("Collector ID:", collectorId);

        if (!requestId || !collectorId) {

            return res.status(400).json({
                success: false,
                message: "Invalid request or collector ID."
            });

        }

        const result =
            await collectorRepository.startCollection(
                requestId,
                collectorId
            );

        if (!result) {

            return res.status(404).json({
                success: false,
                message:
                    "Request not found or not assigned to this collector."
            });

        }

        return res.status(200).json({
            success: true,
            message:
                "Collection started successfully.",
            data: result
        });

    } catch (error) {

        console.error(
            "START COLLECTION ERROR:",
            error
        );

        next(error);
    }
};
// ==========================================
// Complete Collection
// In Progress -> Collected
// ==========================================
const completeCollection = async (req, res, next) => {

    try {

        const requestId = Number(req.params.id);
        const collectorId = Number(req.user.id);

        console.log("========== COMPLETE COLLECTION ==========");
        console.log("Request ID:", requestId);
        console.log("Collector ID:", collectorId);

        if (!requestId || !collectorId) {

            return res.status(400).json({
                success: false,
                message: "Invalid request or collector ID."
            });

        }

        const result =
            await collectorRepository.completeCollection(
                requestId,
                collectorId
            );

        if (!result) {

            return res.status(404).json({
                success: false,
                message:
                    "Request not found or cannot be completed."
            });

        }

        return res.status(200).json({
            success: true,
            message:
                "Collection completed successfully.",
            data: result
        });

    } catch (error) {

        console.error(
            "COMPLETE COLLECTION ERROR:",
            error
        );

        next(error);
    }
};
// =================================
// Collector Dashboard
// =================================
const getDashboard = async (req, res, next) => {
    try {
        console.log("===== COLLECTOR DASHBOARD =====");
        console.log("REQ.USER:", req.user);

        const collectorId =
            req.user?.collector_id ||
            req.user?.id ||
            req.user?.user_id;

        console.log("COLLECTOR ID:", collectorId);

        if (!collectorId) {
            return res.status(401).json({
                success: false,
                message: "Collector ID not found in token."
            });
        }

        // Get collector information
        const collector =
            await collectorRepository.getCollectorById(
                collectorId
            );

        if (!collector) {
            return res.status(404).json({
                success: false,
                message: "Collector not found."
            });
        }

        // Get assigned requests
        const requests =
            await collectorRepository.getAssignedRequests(
                collectorId
            );

        // Today's date
        const today = new Date()
            .toISOString()
            .split("T")[0];

        // Today's tasks
        const todayTasks =
            requests.filter(
                request =>
                    request.preferred_collection_date &&
                    new Date(request.preferred_collection_date)
                        .toISOString()
                        .split("T")[0] === today
            );

        const completedToday =
            todayTasks.filter(
                request =>
                    request.status === "Completed"
            ).length;

        const pendingTasks =
            todayTasks.filter(
                request =>
                    request.status === "Assigned" ||
                    request.status === "In Progress"
            ).length;

        return res.status(200).json({
            success: true,
            data: {
                collector: {
                    collector_id: collector.collector_id,
                    full_name: collector.full_name,
                    phone_number: collector.phone_number,
                    email: collector.email,
                    assigned_kifle_ketema:
                        collector.assigned_kifle_ketema,
                    kebele: collector.kebele,
                    sefer: collector.sefer,
                    is_active: collector.is_active,
                    profile_image: collector.profile_image
                },

                todayTasks: todayTasks.length,
                completedToday,
                pendingTasks
            }
        });

    } catch (error) {
        console.error(
            "COLLECTOR DASHBOARD ERROR:",
            error
        );

        next(error);
    }
};


// =================================
// Get Collector Profile
// =================================
const getProfile = async (req, res, next) => {
    try {
        console.log("===== GET COLLECTOR PROFILE =====");
        console.log("REQ.USER:", req.user);

        const collectorId =
            req.user?.collector_id ||
            req.user?.id ||
            req.user?.user_id;

        if (!collectorId) {
            return res.status(401).json({
                success: false,
                message: "Collector ID not found in token."
            });
        }

        const collector =
            await collectorRepository.getCollectorById(
                collectorId
            );

        if (!collector) {
            return res.status(404).json({
                success: false,
                message: "Collector not found."
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                collector_id: collector.collector_id,
                full_name: collector.full_name,
                phone_number: collector.phone_number,
                email: collector.email,
                assigned_kifle_ketema:
                    collector.assigned_kifle_ketema,
                kebele: collector.kebele,
                sefer: collector.sefer,
                is_active: collector.is_active,
                profile_image: collector.profile_image
            }
        });

    } catch (error) {
        console.error(
            "GET PROFILE ERROR:",
            error
        );

        next(error);
    }
};


// =================================
// Update Collector Profile
// =================================
const updateMyProfile = async (req, res, next) => {
    try {
        const {
            full_name,
            phone_number,
            email
        } = req.body;

        const collector =
            await collectorRepository.updateMyProfile(
                req.user.id,
                {
                    full_name,
                    phone_number,
                    email
                }
            );

        if (!collector) {
            return res.status(404).json({
                success: false,
                message: "Collector not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully.",
            data: collector
        });

    } catch (error) {
        next(error);
    }
};


// =================================
// Change Collector Password
// =================================
const changePassword = async (req, res, next) => {
    try {
        const {
            currentPassword,
            newPassword
        } = req.body;

        const collector =
            await collectorRepository.getCollectorById(
                req.user.id
            );

        if (!collector) {
            return res.status(404).json({
                success: false,
                message: "Collector not found."
            });
        }

        const match = await bcrypt.compare(
            currentPassword,
            collector.password_hash
        );

        if (!match) {
            return res.status(400).json({
                success: false,
                message: "Current password is incorrect."
            });
        }

        const password_hash =
            await bcrypt.hash(newPassword, 10);

        await collectorRepository.updatePassword(
            req.user.id,
            password_hash
        );

        return res.status(200).json({
            success: true,
            message: "Password changed successfully."
        });

    } catch (error) {
        next(error);
    }
};
// =================================
// Get My Collection Schedules
// =================================
const getCollectorSchedules = async (req, res, next) => {
    try {

        const collectorId = req.user.id;

        const schedules =
            await collectorRepository.getCollectorSchedules(
                collectorId
            );

        return res.status(200).json({
            success: true,
            data: schedules
        });

    } catch (error) {
        next(error);
    }
};

// =================================
// Export
// =================================
module.exports = {
    getAllCollectors,
    getProfile,
    updateMyProfile,
    changePassword,
    getCollectorById,
    registerCollector,
    updateCollector,
    deleteCollector,
    updateRequestStatus,
    updateCollectorStatus,
    searchCollectors,
    getAssignedRequests,
     getCollectorTasks,
    getActiveCollectorsForSchedule,
     startCollection,
    completeCollection,
    getCollectorSchedules,
    getAssignedRequestDetails,
    getDashboard
};
