import API from "./api";

const municipalAdminService = {

  async getDashboard() {
    const response = await API.get("/municipal-admin/dashboard");
    return response.data;
  },

  async getCollectors() {
    const response = await API.get("/municipal-admin/collectors");
    return response.data;
  },

  async assignRoute(data) {
    const response = await API.post(
      "/municipal-admin/assign-route",
      data
    );

    return response.data;
  }

};

export default municipalAdminService;