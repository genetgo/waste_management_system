
const requestService = require("../services/requestService");
const requestRepository = require("../repositories/requestRepository");

// ==========================================
// Create On-Demand Request
// Business Owner → Pending
// ==========================================
// ==========================================
// Create On-Demand Request
// Business Owner → Pending
// ==========================================
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
                message: "Business owner ID is missing from token."
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
                    "Valid latitude and longitude are required."
            });
        }

        if (latitude < -90 || latitude > 90) {
            return res.status(400).json({
                success: false,
                message: "Invalid latitude."
            });
        }

        if (longitude < -180 || longitude > 180) {
            return res.status(400).json({
                success: false,
                message: "Invalid longitude."
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

            latitude,
            longitude,

            preferred_collection_date:
                req.body.preferred_collection_date,

            description:
                req.body.description || null
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
            data: request
        });

    } catch (error) {

        console.error(
            "CREATE REQUEST ERROR:",
            error.message
        );

        // ==========================================
        // SEND ERROR DIRECTLY TO FRONTEND
        // ==========================================
        return res.status(400).json({
            success: false,
            message:
                error.message ||
                "Failed to submit collection request."
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


        res.status(200).json({
            success: true,
            data: requests
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


        res.status(200).json({
            success: true,
            data: request
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

        const requests =
            await requestService.getRequestsByBusiness(
                req.user.id
            );


        res.status(200).json({
            success: true,
            data: requests
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


        res.status(200).json({
            success: true,
            data: requests
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

        const request =
            await requestService.approveRequest(
                req.params.id,
                req.user.id
            );


        res.status(200).json({
            success: true,
            message:
                "Request approved successfully.",
            data: request
        });

    } catch (error) {
        next(error);
    }
};


// ==========================================
// Reject Request
// Pending → Rejected
// Municipal Admin
// ==========================================
const rejectRequest = async (req, res, next) => {
    try {

        const request =
            await requestService.rejectRequest(
                req.params.id
            );


        res.status(200).json({
            success: true,
            message:
                "Request rejected successfully.",
            data: request
        });

    } catch (error) {
        next(error);
    }
};


// ==========================================
// Assign Collector
// Approved → Assigned
// Municipal Admin
// ==========================================
const assignCollector = async (req, res, next) => {
    try {

        const collectorId = req.body.collector_id;

        // ==========================================
        // Validate Collector ID
        // ==========================================
        if (!collectorId) {
            return res.status(400).json({
                success: false,
                message: "Collector ID is required."
            });
        }

        // ==========================================
        // Assign Collector
        // ==========================================
        const request =
            await requestService.assignCollector(
                req.params.id,
                collectorId
            );

        // ==========================================
        // Assignment Failed
        // ==========================================
        if (!request) {
            return res.status(400).json({
                success: false,
                message:
                    "Collector cannot be assigned. The request may not be approved or the collector is inactive."
            });
        }

        // ==========================================
        // Success
        // ==========================================
        return res.status(200).json({
            success: true,
            message: "Collector assigned successfully.",
            data: request
        });

    } catch (error) {
        next(error);
    }
};

// ==========================================
// Collector Starts Collection
// Assigned → In Progress
// ==========================================
const startCollection = async(req,res)=>{

    try {

        const requestId = req.params.id;

        const collectorId = req.user.id;


        const result =
        await requestRepository.startCollection(
            requestId,
            collectorId
        );


        if(!result){
            return res.status(404).json({
                message:"Request not found or not assigned"
            });
        }


        res.json({
            success:true,
            data:result
        });


    } catch(error){

        res.status(500).json({
            message:error.message
        });

    }

};
// ==========================================
// Collector Completes Collection
// In Progress → Collected
// ==========================================
const completeCollection = async(req,res)=>{

    try {

        const requestId=req.params.id;

        const collectorId=req.user.id;


        const result =
        await requestRepository.completeCollection(
            requestId,
            collectorId
        );


        if(!result){

            return res.status(404).json({
                message:"Cannot complete collection"
            });

        }


        res.json({
            success:true,
            data:result
        });


    }catch(error){

        res.status(500).json({
            message:error.message
        });

    }

};


// ==========================================
// Business Owner Confirms Collection
// Collected → Completed
// ==========================================
const confirmCompletion = async (req, res, next) => {
    try {

        const request =
            await requestService.confirmCompletion(
                req.params.id,
                req.user.id
            );


        res.status(200).json({
            success: true,
            message:
                "Collection confirmed successfully. Request is now completed.",
            data: request
        });

    } catch (error) {
        next(error);
    }
};


// ==========================================
// Collector Requests
// ==========================================
const getMyCollectorRequests = async (req, res, next) => {
    try {

        const requests =
            await requestService.getRequestsByCollector(
                req.user.id
            );


        res.status(200).json({
            success: true,
            data: requests
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
const cancelRequest = async (req, res, next) => {
    try {

        const request =
            await requestService.cancelRequest(
                req.params.id,
                req.user.id
            );


        res.status(200).json({
            success: true,
            message:
                "Request cancelled successfully.",
            data: request
        });

    } catch (error) {
        next(error);
    }
};


// ==========================================
// Update Request Status
// ==========================================
const updateStatus = async (req, res, next) => {
    try {

        const { status } = req.body;


        if (!status) {

            return res.status(400).json({
                success: false,
                message:
                    "Status is required."
            });

        }


        const request =
            await requestService.updateStatus(
                req.params.id,
                status
            );


        res.status(200).json({
            success: true,
            message:
                "Request status updated successfully.",
            data: request
        });

    } catch (error) {
        next(error);
    }
};


// ==========================================
// Delete Request
// ==========================================
const deleteRequest = async (req, res, next) => {
    try {

        const request =
            await requestService.deleteRequest(
                req.params.id
            );


        if (!request) {

            return res.status(404).json({
                success: false,
                message:
                    "Request not found."
            });

        }


        res.status(200).json({
            success: true,
            message:
                "Request deleted successfully.",
            data: request
        });

    } catch (error) {
        next(error);
    }
};


// ==========================================
// Export Controller
// ==========================================
module.exports = {

    // Business
    createRequest,
    getMyRequests,
    cancelRequest,
    confirmCompletion,

    // General
    getAllRequests,
    getRequestById,
    getPendingRequests,

    // Municipal Admin
    approveRequest,
    rejectRequest,
    assignCollector,

    // Collector
    getMyCollectorRequests,
    startCollection,
    completeCollection,

    // General status / delete
    updateStatus,
    deleteRequest
};
