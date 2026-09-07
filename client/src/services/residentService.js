import API from "./api";

const residentService = {
  // Dashboard
  async getDashboard() {
    const response = await API.get("/residents/dashboard");
    return response.data;
  },

  // Profile
  async getProfile() {
    const response = await API.get("/residents/profile");
    return response.data;
  },

  async updateProfile(data) {
    const response = await API.put("/residents/profile", data);
    return response.data;
  },

  // History
  async getHistory() {
    const response = await API.get("/residents/history");
    return response.data;
  },
};

export default residentService;