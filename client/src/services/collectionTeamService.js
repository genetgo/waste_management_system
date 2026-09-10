import API from "./api";

const collectionTeamService = {

    // Get all teams for logged-in Municipal Admin
    getAllTeams: async () => {
        const response = await API.get("/collection-teams");
        return response.data;
    },

    // Get one team
    getTeamById: async (teamId) => {
        const response = await API.get(`/collection-teams/${teamId}`);
        return response.data;
    },

    // Create team
    createTeam: async (data) => {
        const response = await API.post("/collection-teams", data);
        return response.data;
    },

    // Update team
    updateTeam: async (teamId, data) => {
        const response = await API.put(
            `/collection-teams/${teamId}`,
            data
        );
        return response.data;
    },

    // Delete team
    deleteTeam: async (teamId) => {
        const response = await API.delete(
            `/collection-teams/${teamId}`
        );
        return response.data;
    },

    // Get collectors for a Kebele
    getAvailableCollectors: async (kebele) => {
        const response = await API.get(
            `/collection-teams/available-collectors/${encodeURIComponent(kebele)}`
        );
        return response.data;
    },

    // Add collector
    addCollector: async (teamId, collectorId) => {
        const response = await API.post(
            `/collection-teams/${teamId}/collectors`,
            {
                collector_id: collectorId
            }
        );
        return response.data;
    },

    // Remove collector
    removeCollector: async (teamId, collectorId) => {
        const response = await API.delete(
            `/collection-teams/${teamId}/collectors/${collectorId}`
        );
        return response.data;
    },

    // Set Team Leader / Driver
    setTeamLeader: async (teamId, collectorId) => {
        const response = await API.put(
            `/collection-teams/${teamId}/leader`,
            {
                collector_id: collectorId
            }
        );
        return response.data;
    },

    // Remove Team Leader
    removeTeamLeader: async (teamId) => {
        const response = await API.delete(
            `/collection-teams/${teamId}/leader`
        );
        return response.data;
    }
};

export default collectionTeamService;