import API from "./api";

const requestService = {

    // Business Owner
    createOnDemandRequest(data) {
        return API.post("/requests/on-demand", data)
            .then(res => res.data);
    },

    getMyRequests() {
        return API.get("/requests/my-requests")
            .then(res => res.data);
    },

    cancelRequest(id) {
        return API.patch(`/requests/${id}/cancel`)
            .then(res => res.data);
    },

    // Municipal Admin
    getPendingRequests() {
        return API.get("/requests/pending")
            .then(res => res.data);
    },

    approveRequest(id) {
        return API.patch(`/requests/${id}/approve`)
            .then(res => res.data);
    },

    rejectRequest(id) {
        return API.patch(`/requests/${id}/reject`)
            .then(res => res.data);
    },

    assignCollector(id, collector_id) {
        return API.patch(`/requests/${id}/assign`, {
            collector_id,
        }).then(res => res.data);
    },

    // Collector
    getCollectorRequests() {
        return API.get("/requests/collector/my-requests")
            .then(res => res.data);
    },

    updateStatus(id, status) {
        return API.patch(`/requests/${id}/status`, {
            status,
        }).then(res => res.data);
    },

    // Admin
    getAllRequests() {
        return API.get("/requests")
            .then(res => res.data);
    },

    getRequest(id) {
        return API.get(`/requests/${id}`)
            .then(res => res.data);
    },

};

export default requestService;