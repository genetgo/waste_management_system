const requestRepository = require("../repositories/requestRepository");
const scheduleRepository = require("../repositories/scheduleRepository");
const notificationRepository = require("../repositories/notificationRepository");
const sendNotification = require("../utils/sendNotification");


class RequestService {


    // ===========================================
    // Create On-Demand Request
    // Business Owner
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


        if (
            data.latitude === undefined ||
            data.latitude === null ||
            data.longitude === undefined ||
            data.longitude === null
        ) {
            throw new Error("Location is required.");
        }


        if (!data.preferred_collection_date) {
            throw new Error(
                "Preferred collection date is required."
            );
        }



        const requestDate =
            new Date(data.preferred_collection_date)
                .toISOString()
                .split("T")[0];



        const existingRequests =
            await requestRepository.getRequestsByBusiness(
                data.business_id
            );



        const duplicateRequest =
            existingRequests.find(req => {


                if (!req.preferred_collection_date) {
                    return false;
                }


                const date =
                    new Date(req.preferred_collection_date)
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



        const schedule =
            await scheduleRepository.getScheduleByLocation(
                data.kifle_ketema,
                data.kebele,
                data.sefer
            );



        if (schedule) {


            const collectionDay =
                new Date(data.preferred_collection_date)
                    .toLocaleDateString(
                        "en-US",
                        {
                            weekday:"long"
                        }
                    );


            if (
                schedule.collection_day === collectionDay
            ) {

                throw new Error(
                    "On-demand request is not allowed on your regular collection day."
                );

            }

        }



        const request =
            await requestRepository.createRequest(
                data
            );



        // Notify Municipal Admins

        const admins =
            await notificationRepository.getMunicipalAdmins();



        for(const admin of admins){


            await sendNotification(
                
                {

                    user_id: admin.admin_id,

                    user_role:"MUNICIPAL_ADMIN",

                    title:
                    "New On-Demand Request",

                    message:
                    "A new waste collection request has been submitted."

                }
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

        return await requestRepository.getRequestById(id);

    }




    // ===========================================
    // Get Business Owner Requests
    // ===========================================
    async getRequestsByBusiness(businessId) {

        return await requestRepository.getRequestsByBusiness(
            businessId
        );

    }
        // ===========================================
    // Approve Request
    // Municipal Admin → Approve Business Request
    // ===========================================
    async approveRequest(requestId, adminId) {

        const request =
            await requestRepository.getRequestById(
                requestId
            );


        if (!request) {
            throw new Error(
                "Request not found."
            );
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

        // Notify Business Owner

        await sendNotification(
            
            {
                user_id: request.business_id,

                user_role: "BUSINESS_OWNER",

                title: "Request Approved",

                message:
                "Your waste collection request has been approved by municipal administration."
            }
        );


        return updatedRequest;

    }





    // ===========================================
    // Reject Request
    // Municipal Admin → Reject Request
    // ===========================================
    async rejectRequest(requestId, adminId, reason) {


        const request =
            await requestRepository.getRequestById(
                requestId
            );


        if (!request) {

            throw new Error(
                "Request not found."
            );

        }



        if (request.status !== "Pending") {

            throw new Error(
                "Only pending requests can be rejected."
            );

        }



       const updatedRequest =
    await requestRepository.rejectRequest(
        requestId
    );

        // Notify Business Owner

        await sendNotification(
            
            {
                user_id: request.business_id,

                user_role: "BUSINESS_OWNER",

                title: "Request Rejected",

                message:
                reason
                ? `Your waste collection request was rejected. Reason: ${reason}`
                : "Your waste collection request was rejected."
            }
        );


        return updatedRequest;

    }





   // ===========================================
// Assign Collector
// Municipal Admin → Assign Collector
// ===========================================
async assignCollector(requestId, collectorId) {

    // ==========================================
    // Check Request
    // ==========================================
    const request =
        await requestRepository.getRequestById(
            requestId
        );

    if (!request) {
        throw new Error(
            "Request not found."
        );
    }

    // ==========================================
    // Check Collector ID
    // ==========================================
    if (!collectorId) {
        throw new Error(
            "Collector ID is required."
        );
    }

    // ==========================================
    // Request must be Approved
    // ==========================================
    if (request.status !== "Approved") {
        throw new Error(
            "Only approved requests can be assigned to a collector."
        );
    }

    // ==========================================
    // Assign Collector
    // Repository checks collector status
    // ==========================================
    const updatedRequest =
        await requestRepository.assignCollector(
            requestId,
            collectorId
        );

    // ==========================================
    // Assignment Failed
    // Usually inactive/non-existing collector
    // ==========================================
    if (!updatedRequest) {
        throw new Error(
            "Collector is inactive or does not exist."
        );
    }

    // ==========================================
    // Notify Collector
    // ==========================================
    await sendNotification({
        user_id: collectorId,

        user_role: "COLLECTOR",

        title: "New Collection Assigned",

        message:
            "A new waste collection request has been assigned to you."
    });

    return updatedRequest;
}
        // ===========================================
    // Start Collection
    // Collector → Start Pickup
    // ===========================================
    async startCollection(requestId, collectorId) {


        const request =
            await requestRepository.getRequestById(
                requestId
            );


        if (!request) {

            throw new Error(
                "Request not found."
            );

        }



        if (request.collector_id !== collectorId) {

            throw new Error(
                "You are not assigned to this request."
            );

        }



       const updatedRequest =
    await requestRepository.startCollection(
        requestId,
        collectorId
    );


        // Notify Business Owner

        await sendNotification(
            
            {
                user_id: request.business_id,

                user_role: "BUSINESS_OWNER",

                title: "Collection Started",

                message:
                "The collector has started your waste collection."
            }
        );



        return updatedRequest;

    }





    // ===========================================
    // Complete Collection
    // Collector → Complete Pickup
    // ===========================================
    async completeCollection(requestId, collectorId) {


        const request =
            await requestRepository.getRequestById(
                requestId
            );


        if (!request) {

            throw new Error(
                "Request not found."
            );

        }



        if (request.collector_id !== collectorId) {

            throw new Error(
                "You are not assigned to this request."
            );

        }



        const updatedRequest =
    await requestRepository.completeCollection(
        requestId,
        collectorId
    );



        // Notify Business Owner

        await sendNotification(
            
            {
                user_id: request.business_id,

                user_role: "BUSINESS_OWNER",

                title: "Collection Completed",

                message:
                "Your waste collection has been completed."
            }
        );



        return updatedRequest;

    }





    // ===========================================
    // Confirm Completion
    // Business Owner → Confirm Collection Done
    // ===========================================
    async confirmCompletion(requestId, businessId) {


        const request =
            await requestRepository.getRequestById(
                requestId
            );


        if (!request) {

            throw new Error(
                "Request not found."
            );

        }



        if (request.business_id !== businessId) {

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



        // Notify Collector

        await sendNotification(
    
            {
                user_id: request.collector_id,

                user_role: "COLLECTOR",

                title: "Collection Confirmed",

                message:
                "The business owner has confirmed the waste collection completion."
            }
        );



        return updatedRequest;

    }





    // ===========================================
    // Cancel Request
    // Business Owner → Cancel Request
    // ===========================================
    async cancelRequest(requestId, businessId, reason) {


        const request =
            await requestRepository.getRequestById(
                requestId
            );


        if (!request) {

            throw new Error(
                "Request not found."
            );

        }



        if (request.business_id !== businessId) {

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



        const updatedRequest =
            await requestRepository.updateStatus(
                requestId,
                "Cancelled"
            );



        // Notify Collector if assigned

        if (request.collector_id) {


            await sendNotification(
                
                {
                    user_id:
                    request.collector_id,

                    user_role:
                    "COLLECTOR",

                    title:
                    "Request Cancelled",

                    message:
                    reason
                    ? `Collection request was cancelled. Reason: ${reason}`
                    : "A collection request assigned to you was cancelled."
                }
            );

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

        return await requestRepository.getRequestsByCollector(
            collectorId
        );

    }





    // ===========================================
    // Update Request Status
    // ===========================================
    async updateStatus(requestId, status) {


        if (!status) {

            throw new Error(
                "Status is required."
            );

        }


        return await requestRepository.updateStatus(
            requestId,
            status
        );

    }





    // ===========================================
    // Delete Request
    // ===========================================
    async deleteRequest(requestId) {


        return await requestRepository.deleteRequest(
            requestId
        );

    }


}


// ===========================================
// Export Service
// ===========================================
module.exports = new RequestService();