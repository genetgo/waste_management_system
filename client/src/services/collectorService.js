import API from "./api";

const collectorService = {


    // =========================
    // Collector Dashboard
    // =========================
    async getDashboard() {

        const response =
            await API.get("/collectors/dashboard");

        return response.data;

    },



    // =========================
    // Get All Collectors
    // =========================
    async getCollectors() {

        const response =
            await API.get("/collectors");

        return response.data;

    },



    // =========================
    // Get Collector By ID
    // =========================
    async getCollector(id) {

        const response =
            await API.get(`/collectors/${id}`);

        return response.data;

    },



    // =========================
    // Get Assigned Requests
    // =========================
    async getAssignedRequests() {

        const response =
            await API.get(
                "/collectors/assigned-requests"
            );

        return response.data;

    },

    async getCollectorSchedules() {
    const response = await API.get("/collectors/my-schedules");
    return response.data;
},
startCollection:(requestId, collectorId)=>{

    return API.patch(
        `/requests/${requestId}/start`,
        {
            collectorId
        }
    );

},


completeCollection:(requestId, collectorId)=>{

    return API.patch(
        `/requests/${requestId}/collect`,
        {
            collectorId
        }
    );

},
async getAssignedRequestDetails(requestId) {
    const response = await API.get(
        `/collectors/assigned-requests/${requestId}`
    );

    return response.data;
},

    // =========================
    // Update Collection Request Status
    // =========================
    async updateRequestStatus(id, status) {

        const response =
            await API.patch(
                `/collectors/requests/${id}/status`,
                {
                    status
                }
            );


        return response.data;

    }



};


export default collectorService;