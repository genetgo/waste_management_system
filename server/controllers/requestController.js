const requestService = require("../services/requestService");
const requestRepository = require("../repositories/requestRepository");

// ==========================================
// Create On-Demand Request
// Business Owner → Pending
// ==========================================
const createRequest = async (req, res, next) => {
    try {
        console.log("=================================");
        console.log("CREATE REQUEST");
        console.log("USER:", req.user);
        console.log("REQUEST BODY:", req.body);
        console.log("=================================");

        // ==========================================
        // Business Owner ID
        // ==========================================
        const businessId = req.user?.id;

        if (!businessId) {
            return res.status(400).json({
                success: false,
                message: "Business owner ID is missing from token.",
            });
        }

        // ==========================================
        // Get GPS Coordinates
        // ==========================================
        const latitude = Number(req.body.latitude);
        const longitude = Number(req.body.longitude);

        // ==========================================
        // Validate GPS
        // ==========================================
        if (
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Valid latitude and longitude are required.",
            });
        }

        if (latitude < -90 || latitude > 90) {
            return res.status(400).json({
                success: false,
                message: "Invalid latitude.",
            });
        }

        if (longitude < -180 || longitude > 180) {
            return res.status(400).json({
                success: false,
                message: "Invalid longitude.",
            });
        }

        // ==========================================
        // House Number
        // ==========================================
        const houseNumber =
            req.body.house_number !== undefined &&
            req.body.house_number !== null
                ? String(req.body.house_number).trim()
                : "";

        if (!houseNumber) {
            return res.status(400).json({
                success: false,
                message: "House number is required.",
            });
        }

        // ==========================================
        // Prepare Request Data
        // ==========================================
        const requestData = {
            business_id: businessId,

            kifle_ketema:
                req.body.kifle_ketema,

            kebele:
                req.body.kebele,

            sefer:
                req.body.sefer,

            // IMPORTANT
            house_number: houseNumber,

            latitude,
            longitude,

            preferred_collection_date:
                req.body.preferred_collection_date,

            // Business Owner's original description
            description:
                req.body.description
                    ? String(req.body.description).trim()
                    : null,
        };

        console.log(
            "========== FINAL REQUEST DATA =========="
        );

        console.log(
            JSON.stringify(requestData, null, 2)
        );

        console.log(
            "========================================="
        );

        // ==========================================
        // Create Request
        // ==========================================
        const request =
            await requestService.createRequest(
                requestData
            );

        // ==========================================
        // SUCCESS
        // ==========================================
        return res.status(201).json({
            success: true,
            message:
                "On-demand request submitted successfully.",
            data: request,
        });

    } catch (error) {
        console.error(
            "CREATE REQUEST ERROR:",
            error
        );

        return res.status(400).json({
            success: false,
            message:
                error.message ||
                "Failed to submit collection request.",
        });
    }
};


// ==========================================
// Get All Requests
// Municipal Admin / System Admin
// ==========================================
const getAllRequests = async (req, res, next) => {
    try {
        const requests =
            await requestService.getAllRequests();

        return res.status(200).json({
            success: true,
            data: requests,
        });

    } catch (error) {
        next(error);
    }
};


// ==========================================
// Get Request By ID
// ==========================================
const getRequestById = async (req, res, next) => {
    try {
        const request =
            await requestService.getRequestById(
                req.params.id
            );

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Request not found.",
            });
        }

        return res.status(200).json({
            success: true,
            data: request,
        });

    } catch (error) {
        next(error);
    }
};


// ==========================================
// Business Owner Requests
// ==========================================
const getMyRequests = async (req, res, next) => {
    try {
        const businessId = req.user?.id;

        if (!businessId) {
            return res.status(400).json({
                success: false,
                message:
                    "Business owner ID is missing from token.",
            });
        }

        const requests =
            await requestService.getRequestsByBusiness(
                businessId
            );

        return res.status(200).json({
            success: true,
            data: requests,
        });

    } catch (error) {
        next(error);
    }
};


// ==========================================
// Pending Requests
// Municipal Admin
// ==========================================
const getPendingRequests = async (req, res, next) => {
    try {
        const requests =
            await requestService.getPendingRequests();

        return res.status(200).json({
            success: true,
            data: requests,
        });

    } catch (error) {
        next(error);
    }
};


// ==========================================
// Approve Request
// Pending → Approved
// Municipal Admin
// ==========================================
const approveRequest = async (req, res, next) => {
    try {
        const adminId = req.user?.id;

        if (!adminId) {
            return res.status(400).json({
                success: false,
                message:
                    "Municipal administrator ID is missing from token.",
            });
        }

        const request =
            await requestService.approveRequest(
                req.params.id,
                adminId
            );

        if (!request) {
            return res.status(404).json({
                success: false,
                message:
                    "Request not found or cannot be approved.",
            });
        }

        return res.status(200).json({
            success: true,
            message:
                "Request approved successfully.",
            data: request,
        });

    } catch (error) {
        next(error);
    }
};


// ==========================================
// Reject Request
// Pending → Rejected
// Municipal Admin
//
// IMPORTANT:
// Admin MUST provide rejection description.
// Frontend sends:
//
// {
//     description: "Reason for rejection"
// }
//
// Backend stores it as rejection_reason.
// ==========================================
const rejectRequest = async (req, res, next) => {
    try {
        const requestId = req.params.id;

        const adminId = req.user?.id;

        // ==========================================
        // Validate Admin
        // ==========================================
        if (!adminId) {
            return res.status(400).json({
                success: false,
                message:
                    "Municipal administrator ID is missing from token.",
            });
        }

        // ==========================================
        // Get Rejection Description
        // ==========================================
        const rejectionReason =
            req.body?.description !== undefined &&
            req.body?.description !== null
                ? String(req.body.description).trim()
                : "";

        // ==========================================
        // Description REQUIRED
        // ==========================================
        if (!rejectionReason) {
            return res.status(400).json({
                success: false,
                message:
                    "Rejection reason is required.",
            });
        }

        // ==========================================
        // Maximum Length
        // ==========================================
        if (rejectionReason.length > 500) {
            return res.status(400).json({
                success: false,
                message:
                    "Rejection reason must not exceed 500 characters.",
            });
        }

        console.log("=================================");
        console.log("REJECT REQUEST");
        console.log("REQUEST ID:", requestId);
        console.log("ADMIN ID:", adminId);
        console.log(
            "REJECTION REASON:",
            rejectionReason
        );
        console.log("=================================");

        // ==========================================
        // Reject Request
        //
        // IMPORTANT:
        // requestService.rejectRequest()
        // must accept:
        //
        // requestId
        // rejectionReason
        // adminId
        // ==========================================
        const request =
            await requestService.rejectRequest(
                requestId,
                rejectionReason,
                adminId
            );

        if (!request) {
            return res.status(404).json({
                success: false,
                message:
                    "Request not found or cannot be rejected.",
            });
        }

        // ==========================================
        // SUCCESS
        // ==========================================
        return res.status(200).json({
            success: true,
            message:
                "Request rejected successfully.",
            data: request,
        });

    } catch (error) {
        console.error(
            "REJECT REQUEST ERROR:",
            error
        );

        next(error);
    }
};


// ==========================================
// Assign Collection Team
// Approved → Assigned
// Municipal Admin
//
// Frontend sends:
// {
//     team_id: 1
// }
//
// Backend automatically gets:
// team.team_leader_id
// and stores it as collector_id.
// ==========================================
const assignCollector = async (req, res, next) => {
    try {
        const requestId = req.params.id;
        const teamId = req.body?.team_id;

        // ==========================================
        // Validate Request ID
        // ==========================================
        if (!requestId) {
            return res.status(400).json({
                success: false,
                message: "Request ID is required.",
            });
        }

        // ==========================================
        // Validate Collection Team ID
        // ==========================================
        if (!teamId) {
            return res.status(400).json({
                success: false,
                message: "Collection Team ID is required.",
            });
        }

        console.log("=================================");
        console.log("ASSIGN COLLECTION TEAM");
        console.log("REQUEST ID:", requestId);
        console.log("TEAM ID:", teamId);
        console.log("REQUEST BODY:", req.body);
        console.log("=================================");

        // ==========================================
        // Assign Collection Team
        // Repository will:
        //
        // 1. Check team exists
        // 2. Check team is ACTIVE
        // 3. Check Team Leader exists
        // 4. Check Team Leader is active
        // 5. Check Kifle Ketema matches
        // 6. Check Kebele matches
        // 7. Set team_id
        // 8. Set collector_id = team_leader_id
        // 9. Change status Approved → Assigned
        // ==========================================
        const request =
            await requestService.assignCollector(
                requestId,
                Number(teamId)
            );

        // ==========================================
        // Assignment Failed
        // ==========================================
        if (!request) {
            return res.status(400).json({
                success: false,
                message:
                    "Collection team cannot be assigned. The request may not be approved or the team may be inactive.",
            });
        }

        // ==========================================
        // SUCCESS
        // ==========================================
        return res.status(200).json({
            success: true,
            message:
                "Collection team assigned successfully.",
            data: request,
        });

    } catch (error) {
        console.error(
            "ASSIGN COLLECTION TEAM ERROR:",
            error
        );

        next(error);
    }
};
// ==========================================
// Collector Starts Collection
// Assigned → In Progress
// ==========================================
const startCollection = async (req, res, next) => {
    try {
        const requestId = req.params.id;
        const collectorId = req.user?.id;

        // ==========================================
        // Validate Collector
        // ==========================================
        if (!collectorId) {
            return res.status(400).json({
                success: false,
                message:
                    "Collector ID is missing from token.",
            });
        }

        console.log("=================================");
        console.log("START COLLECTION");
        console.log("REQUEST ID:", requestId);
        console.log("COLLECTOR ID:", collectorId);
        console.log("=================================");

        const result =
            await requestRepository.startCollection(
                requestId,
                collectorId
            );

        if (!result) {
            return res.status(404).json({
                success: false,
                message:
                    "Request not found or not assigned to this collector.",
            });
        }

        return res.status(200).json({
            success: true,
            message:
                "Collection started successfully.",
            data: result,
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
// Collector Completes Collection
// In Progress → Collected
// ==========================================
const completeCollection = async (
    req,
    res,
    next
) => {
    try {
        const requestId = req.params.id;
        const collectorId = req.user?.id;

        // ==========================================
        // Validate Collector
        // ==========================================
        if (!collectorId) {
            return res.status(400).json({
                success: false,
                message:
                    "Collector ID is missing from token.",
            });
        }

        console.log("=================================");
        console.log("COMPLETE COLLECTION");
        console.log("REQUEST ID:", requestId);
        console.log("COLLECTOR ID:", collectorId);
        console.log("=================================");

        const result =
            await requestRepository.completeCollection(
                requestId,
                collectorId
            );

        if (!result) {
            return res.status(404).json({
                success: false,
                message:
                    "Cannot complete collection. Request may not be in progress or may not belong to this collector.",
            });
        }

        return res.status(200).json({
            success: true,
            message:
                "Collection completed by collector. Waiting for business confirmation.",
            data: result,
        });

    } catch (error) {
        console.error(
            "COMPLETE COLLECTION ERROR:",
            error
        );

        next(error);
    }
};


// ==========================================
// Business Owner Confirms Collection
// Collected → Completed
// ==========================================
const confirmCompletion = async (
    req,
    res,
    next
) => {
    try {
        const businessId = req.user?.id;

        if (!businessId) {
            return res.status(400).json({
                success: false,
                message:
                    "Business owner ID is missing from token.",
            });
        }

        const request =
            await requestService.confirmCompletion(
                req.params.id,
                businessId
            );

        if (!request) {
            return res.status(404).json({
                success: false,
                message:
                    "Request not found or cannot be confirmed.",
            });
        }

        return res.status(200).json({
            success: true,
            message:
                "Collection confirmed successfully. Request is now completed.",
            data: request,
        });

    } catch (error) {
        next(error);
    }
};


// ==========================================
// Collector Requests
// ==========================================
const getMyCollectorRequests = async (
    req,
    res,
    next
) => {
    try {
        const collectorId = req.user?.id;

        if (!collectorId) {
            return res.status(400).json({
                success: false,
                message:
                    "Collector ID is missing from token.",
            });
        }

        const requests =
            await requestService.getRequestsByCollector(
                collectorId
            );

        return res.status(200).json({
            success: true,
            data: requests,
        });

    } catch (error) {
        next(error);
    }
};


// ==========================================
// Cancel Request
// Business Owner
// Pending / Approved → Cancelled
// ==========================================
const cancelRequest = async (
    req,
    res,
    next
) => {
    try {
        const businessId = req.user?.id;

        if (!businessId) {
            return res.status(400).json({
                success: false,
                message:
                    "Business owner ID is missing from token.",
            });
        }

        const request =
            await requestService.cancelRequest(
                req.params.id,
                businessId
            );

        if (!request) {
            return res.status(404).json({
                success: false,
                message:
                    "Request not found or cannot be cancelled.",
            });
        }

        return res.status(200).json({
            success: true,
            message:
                "Request cancelled successfully.",
            data: request,
        });

    } catch (error) {
        next(error);
    }
};


// ==========================================
// Update Request Status
// ==========================================
const updateStatus = async (
    req,
    res,
    next
) => {
    try {
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message:
                    "Status is required.",
            });
        }

        const request =
            await requestService.updateStatus(
                req.params.id,
                status
            );

        if (!request) {
            return res.status(404).json({
                success: false,
                message:
                    "Request not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message:
                "Request status updated successfully.",
            data: request,
        });

    } catch (error) {
        next(error);
    }
};


// ==========================================
// Delete Request
// ==========================================
const deleteRequest = async (
    req,
    res,
    next
) => {
    try {
        const request =
            await requestService.deleteRequest(
                req.params.id
            );

        if (!request) {
            return res.status(404).json({
                success: false,
                message:
                    "Request not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message:
                "Request deleted successfully.",
            data: request,
        });

    } catch (error) {
        next(error);
    }
};


// ==========================================
// EXPORT CONTROLLER
// ==========================================
module.exports = {

    // ==========================================
    // Business Owner
    // ==========================================
    createRequest,
    getMyRequests,
    cancelRequest,
    confirmCompletion,

    // ==========================================
    // General
    // ==========================================
    getAllRequests,
    getRequestById,
    getPendingRequests,

    // ==========================================
    // Municipal Admin
    // ==========================================
    approveRequest,
    rejectRequest,
    assignCollector,

    // ==========================================
    // Collector
    // ==========================================
    getMyCollectorRequests,
    startCollection,
    completeCollection,

    // ==========================================
    // General Status / Delete
    // ==========================================
    updateStatus,
    deleteRequest,
};