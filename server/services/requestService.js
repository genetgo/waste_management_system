const requestRepository = require("../repositories/requestRepository");
const scheduleRepository = require("../repositories/scheduleRepository");
const notificationRepository = require("../repositories/notificationRepository");
const sendNotification = require("../utils/sendNotification");

class RequestService {
    // ===========================================
    // Create On-Demand Request
    // Business Owner → Pending
    // ===========================================
    async createRequest(data) {
        if (!data.business_id) {
            throw new Error("Business owner is required.");
        }

        if (!data.kifle_ketema) {
            throw new Error("Kifle Ketema is required.");
        }

        if (!data.kebele) {
            throw new Error("Kebele is required.");
        }

        if (!data.sefer) {
            throw new Error("Sefer is required.");
        }

        // ===========================================
        // House Number
        // ===========================================
        const houseNumber =
            data.house_number !== undefined &&
            data.house_number !== null
                ? String(data.house_number).trim()
                : "";

        if (!houseNumber) {
            throw new Error("House number is required.");
        }

        if (houseNumber.length > 20) {
            throw new Error(
                "House number must not exceed 20 characters."
            );
        }

        // ===========================================
        // Location
        // ===========================================
        if (
            data.latitude === undefined ||
            data.latitude === null ||
            data.longitude === undefined ||
            data.longitude === null
        ) {
            throw new Error("Location is required.");
        }

        const latitude = Number(data.latitude);
        const longitude = Number(data.longitude);

        if (
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude)
        ) {
            throw new Error(
                "Valid latitude and longitude are required."
            );
        }

        // ===========================================
        // Preferred Collection Date
        // ===========================================
        if (!data.preferred_collection_date) {
            throw new Error(
                "Preferred collection date is required."
            );
        }

        const preferredDate = new Date(
            data.preferred_collection_date
        );

        if (Number.isNaN(preferredDate.getTime())) {
            throw new Error(
                "Invalid preferred collection date."
            );
        }

        const requestDate = preferredDate
            .toISOString()
            .split("T")[0];

        // ===========================================
        // Check Duplicate Request
        // ===========================================
        const existingRequests =
            await requestRepository.getRequestsByBusiness(
                data.business_id
            );

        const duplicateRequest =
            existingRequests.find((req) => {
                if (!req.preferred_collection_date) {
                    return false;
                }

                const existingDate = new Date(
                    req.preferred_collection_date
                );

                if (Number.isNaN(existingDate.getTime())) {
                    return false;
                }

                const date = existingDate
                    .toISOString()
                    .split("T")[0];

                return (
                    date === requestDate &&
                    req.status !== "Cancelled" &&
                    req.status !== "Rejected"
                );
            });

        if (duplicateRequest) {
            throw new Error(
                "You have already submitted an on-demand request for this date."
            );
        }

        // ===========================================
        // Check Regular Collection Schedule
        // ===========================================
        const schedule =
            await scheduleRepository.getScheduleByLocation(
                data.kifle_ketema,
                data.kebele,
                data.sefer
            );

        if (schedule) {
            const collectionDay =
                preferredDate.toLocaleDateString(
                    "en-US",
                    {
                        weekday: "long",
                    }
                );

            if (
                schedule.collection_day &&
                schedule.collection_day.toLowerCase() ===
                    collectionDay.toLowerCase()
            ) {
                throw new Error(
                    "On-demand request is not allowed on your regular collection day."
                );
            }
        }

        // ===========================================
        // Create Request
        // ===========================================
        const requestData = {
            ...data,
            house_number: houseNumber,
            latitude,
            longitude,
        };

        const request =
            await requestRepository.createRequest(
                requestData
            );

        if (!request) {
            throw new Error(
                "Failed to create on-demand request."
            );
        }

        // ===========================================
        // Notify Municipal Admins
        // ===========================================
        try {
            const admins =
                await notificationRepository.getMunicipalAdmins();

            for (const admin of admins) {
                await sendNotification({
                    user_id: admin.admin_id,
                    user_role: "MUNICIPAL_ADMIN",
                    title: "New On-Demand Request",
                    message:
                        "A new waste collection request has been submitted.",
                });
            }
        } catch (notificationError) {
            console.error(
                "Admin notification error:",
                notificationError
            );
        }

        return request;
    }

    // ===========================================
    // Get All Requests
    // Municipal Admin / System Admin
    // ===========================================
    async getAllRequests() {
        return await requestRepository.getAllRequests();
    }

    // ===========================================
    // Get Request By ID
    // ===========================================
    async getRequestById(id) {
        if (!id) {
            throw new Error("Request ID is required.");
        }

        return await requestRepository.getRequestById(id);
    }

    // ===========================================
    // Get Business Owner Requests
    // ===========================================
    async getRequestsByBusiness(businessId) {
        if (!businessId) {
            throw new Error(
                "Business owner ID is required."
            );
        }

        return await requestRepository.getRequestsByBusiness(
            businessId
        );
    }

    // ===========================================
    // Approve Request
    // Municipal Admin → Approve
    // Pending → Approved
    // ===========================================
    async approveRequest(requestId, adminId) {
        if (!requestId) {
            throw new Error("Request ID is required.");
        }

        if (!adminId) {
            throw new Error(
                "Municipal administrator is required."
            );
        }

        const request =
            await requestRepository.getRequestById(
                requestId
            );

        if (!request) {
            throw new Error("Request not found.");
        }

        if (request.status !== "Pending") {
            throw new Error(
                "Only pending requests can be approved."
            );
        }

        const updatedRequest =
            await requestRepository.approveRequest(
                requestId,
                adminId
            );

        if (!updatedRequest) {
            throw new Error(
                "Request could not be approved."
            );
        }

        // ===========================================
        // Notify Business Owner
        // ===========================================
        try {
            await sendNotification({
                user_id: request.business_id,
                user_role: "BUSINESS_OWNER",
                title: "Request Approved",
                message:
                    "Your waste collection request has been approved by municipal administration.",
            });
        } catch (notificationError) {
            console.error(
                "Approval notification error:",
                notificationError
            );
        }

        return updatedRequest;
    }

    // ===========================================
    // Reject Request
    // Municipal Admin → Reject
    // Pending → Rejected
    //
    // requestId
    // rejectionReason
    // adminId
    // ===========================================
    async rejectRequest(
        requestId,
        rejectionReason,
        adminId
    ) {
        if (!requestId) {
            throw new Error("Request ID is required.");
        }

        if (!adminId) {
            throw new Error(
                "Municipal administrator is required."
            );
        }

        const reason =
            rejectionReason !== undefined &&
            rejectionReason !== null
                ? String(rejectionReason).trim()
                : "";

        if (!reason) {
            throw new Error(
                "Rejection reason is required."
            );
        }

        if (reason.length > 500) {
            throw new Error(
                "Rejection reason must not exceed 500 characters."
            );
        }

        const request =
            await requestRepository.getRequestById(
                requestId
            );

        if (!request) {
            throw new Error("Request not found.");
        }

        if (request.status !== "Pending") {
            throw new Error(
                "Only pending requests can be rejected."
            );
        }

        // ===========================================
        // Save rejection reason separately
        // DO NOT use business description
        // ===========================================
        const updatedRequest =
            await requestRepository.rejectRequest(
                requestId,
                reason,
                adminId
            );

        if (!updatedRequest) {
            throw new Error(
                "Request could not be rejected."
            );
        }

        // ===========================================
        // Notify Business Owner
        // ===========================================
        try {
            await sendNotification({
                user_id: request.business_id,
                user_role: "BUSINESS_OWNER",
                title: "Request Rejected",
                message:
                    `Your waste collection request was rejected. Reason: ${reason}`,
            });
        } catch (notificationError) {
            console.error(
                "Rejection notification error:",
                notificationError
            );
        }

        return updatedRequest;
    }

    // ===========================================
// Assign Collection Team
// Municipal Admin → Collection Team
// Approved → Assigned
//
// Team Leader = Driver
// Other collectors work together with the driver
// ===========================================
async assignCollector(
    requestId,
    teamId
) {
    if (!requestId) {
        throw new Error("Request ID is required.");
    }

    if (!teamId) {
        throw new Error(
            "Collection Team ID is required."
        );
    }

    const request =
        await requestRepository.getRequestById(
            requestId
        );

    if (!request) {
        throw new Error("Request not found.");
    }

    // Only Approved requests can be assigned
    if (request.status !== "Approved") {
        throw new Error(
            "Only approved requests can be assigned to a collection team."
        );
    }

    // ===========================================
    // Assign Team
    // ===========================================
    const updatedRequest =
        await requestRepository.assignCollector(
            requestId,
            teamId
        );

    if (!updatedRequest) {
        throw new Error(
            "Collection team could not be assigned to this request."
        );
    }

    // ===========================================
    // Notify Team Leader / Driver
    // ===========================================
    try {
        if (updatedRequest.collector_id) {
            await sendNotification({
                user_id: updatedRequest.collector_id,
                user_role: "COLLECTOR",
                title: "New Collection Assigned",
                message:
                    "A new waste collection request has been assigned to your team. You are the Team Leader and Driver.",
            });
        }
    } catch (notificationError) {
        console.error(
            "Team Leader notification error:",
            notificationError
        );
    }

    return updatedRequest;
}

    // ===========================================
    // Start Collection
    // Collector → Start Pickup
    // Assigned → In Progress
    // ===========================================
    async startCollection(
        requestId,
        collectorId
    ) {
        if (!requestId) {
            throw new Error("Request ID is required.");
        }

        if (!collectorId) {
            throw new Error("Collector ID is required.");
        }

        const request =
            await requestRepository.getRequestById(
                requestId
            );

        if (!request) {
            throw new Error("Request not found.");
        }

        if (
            String(request.collector_id) !==
            String(collectorId)
        ) {
            throw new Error(
                "You are not assigned to this request."
            );
        }

        if (request.status !== "Assigned") {
            throw new Error(
                "Only assigned requests can be started."
            );
        }

        const updatedRequest =
            await requestRepository.startCollection(
                requestId,
                collectorId
            );

        if (!updatedRequest) {
            throw new Error(
                "Collection could not be started."
            );
        }

        // ===========================================
        // Notify Business Owner
        // ===========================================
        try {
            await sendNotification({
                user_id: request.business_id,
                user_role: "BUSINESS_OWNER",
                title: "Collection Started",
                message:
                    "The collector has started your waste collection.",
            });
        } catch (notificationError) {
            console.error(
                "Start notification error:",
                notificationError
            );
        }

        return updatedRequest;
    }

    // ===========================================
    // Complete Collection
    // Collector → Complete Pickup
    // In Progress → Collected
    // ===========================================
    async completeCollection(
        requestId,
        collectorId
    ) {
        if (!requestId) {
            throw new Error("Request ID is required.");
        }

        if (!collectorId) {
            throw new Error("Collector ID is required.");
        }

        const request =
            await requestRepository.getRequestById(
                requestId
            );

        if (!request) {
            throw new Error("Request not found.");
        }

        if (
            String(request.collector_id) !==
            String(collectorId)
        ) {
            throw new Error(
                "You are not assigned to this request."
            );
        }

        if (request.status !== "In Progress") {
            throw new Error(
                "Only in-progress requests can be completed."
            );
        }

        const updatedRequest =
            await requestRepository.completeCollection(
                requestId,
                collectorId
            );

        if (!updatedRequest) {
            throw new Error(
                "Collection could not be completed."
            );
        }

        // ===========================================
        // Notify Business Owner
        // ===========================================
        try {
            await sendNotification({
                user_id: request.business_id,
                user_role: "BUSINESS_OWNER",
                title: "Collection Completed",
                message:
                    "Your waste collection has been completed. Please confirm the collection.",
            });
        } catch (notificationError) {
            console.error(
                "Complete notification error:",
                notificationError
            );
        }

        return updatedRequest;
    }

    // ===========================================
    // Confirm Completion
    // Business Owner → Confirm Collection
    // Collected → Completed
    // ===========================================
    async confirmCompletion(
        requestId,
        businessId
    ) {
        if (!requestId) {
            throw new Error("Request ID is required.");
        }

        if (!businessId) {
            throw new Error(
                "Business owner ID is required."
            );
        }

        const request =
            await requestRepository.getRequestById(
                requestId
            );

        if (!request) {
            throw new Error("Request not found.");
        }

        if (
            String(request.business_id) !==
            String(businessId)
        ) {
            throw new Error(
                "You are not allowed to confirm this request."
            );
        }

        if (request.status !== "Collected") {
            throw new Error(
                "Only collected requests can be confirmed."
            );
        }

        const updatedRequest =
            await requestRepository.confirmCompletion(
                requestId,
                businessId
            );

        if (!updatedRequest) {
            throw new Error(
                "Collection could not be confirmed."
            );
        }

        // ===========================================
        // Notify Collector
        // ===========================================
        if (request.collector_id) {
            try {
                await sendNotification({
                    user_id: request.collector_id,
                    user_role: "COLLECTOR",
                    title: "Collection Confirmed",
                    message:
                        "The business owner has confirmed the waste collection completion.",
                });
            } catch (notificationError) {
                console.error(
                    "Confirmation notification error:",
                    notificationError
                );
            }
        }

        return updatedRequest;
    }

    // ===========================================
    // Cancel Request
    // Business Owner → Cancel
    // Pending / Approved → Cancelled
    // ===========================================
    async cancelRequest(
        requestId,
        businessId,
        reason
    ) {
        if (!requestId) {
            throw new Error("Request ID is required.");
        }

        if (!businessId) {
            throw new Error(
                "Business owner ID is required."
            );
        }

        const request =
            await requestRepository.getRequestById(
                requestId
            );

        if (!request) {
            throw new Error("Request not found.");
        }

        if (
            String(request.business_id) !==
            String(businessId)
        ) {
            throw new Error(
                "You are not allowed to cancel this request."
            );
        }

        if (
            request.status === "Completed" ||
            request.status === "Collected"
        ) {
            throw new Error(
                "Completed requests cannot be cancelled."
            );
        }

        if (
            request.status !== "Pending" &&
            request.status !== "Approved"
        ) {
            throw new Error(
                "Only pending or approved requests can be cancelled."
            );
        }

        const updatedRequest =
            await requestRepository.cancelRequest(
                requestId,
                businessId
            );

        if (!updatedRequest) {
            throw new Error(
                "Request could not be cancelled."
            );
        }

        // ===========================================
        // Notify Collector if assigned
        // ===========================================
        if (request.collector_id) {
            try {
                const cancelReason =
                    reason !== undefined &&
                    reason !== null
                        ? String(reason).trim()
                        : "";

                await sendNotification({
                    user_id: request.collector_id,
                    user_role: "COLLECTOR",
                    title: "Request Cancelled",
                    message: cancelReason
                        ? `Collection request was cancelled. Reason: ${cancelReason}`
                        : "A collection request assigned to you was cancelled.",
                });
            } catch (notificationError) {
                console.error(
                    "Cancellation notification error:",
                    notificationError
                );
            }
        }

        return updatedRequest;
    }

    // ===========================================
    // Get Pending Requests
    // Municipal Admin
    // ===========================================
    async getPendingRequests() {
        return await requestRepository.getPendingRequests();
    }

    // ===========================================
    // Get Collector Requests
    // Collector Dashboard
    // ===========================================
    async getRequestsByCollector(collectorId) {
        if (!collectorId) {
            throw new Error(
                "Collector ID is required."
            );
        }

        return await requestRepository.getRequestsByCollector(
            collectorId
        );
    }

    // ===========================================
    // Update Request Status
    // ===========================================
    async updateStatus(
        requestId,
        status
    ) {
        if (!requestId) {
            throw new Error(
                "Request ID is required."
            );
        }

        if (!status) {
            throw new Error(
                "Status is required."
            );
        }

        const updatedRequest =
            await requestRepository.updateStatus(
                requestId,
                status
            );

        if (!updatedRequest) {
            throw new Error(
                "Request not found or status could not be updated."
            );
        }

        return updatedRequest;
    }

    // ===========================================
    // Delete Request
    // ===========================================
    async deleteRequest(requestId) {
        if (!requestId) {
            throw new Error(
                "Request ID is required."
            );
        }

        const deletedRequest =
            await requestRepository.deleteRequest(
                requestId
            );

        if (!deletedRequest) {
            throw new Error(
                "Request not found."
            );
        }

        return deletedRequest;
    }
}

// ===========================================
// Export Service
// ===========================================
module.exports = new RequestService();