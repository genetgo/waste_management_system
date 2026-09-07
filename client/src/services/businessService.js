import API from "./api";

const businessService = {

  // Dashboard
  async getDashboard() {
    const response = await API.get("/business/dashboard");
    return response.data;
  },


  // Profile
  async getProfile() {
    const response = await API.get("/business/profile");
    return response.data;
  },


  async updateProfile(data) {
    const response = await API.put("/business/profile", data);
    return response.data;
  },


  // Requests
  async getRequests() {
    const response = await API.get("/business/requests");
    return response.data;
  },
 // =====================================
  // My Requests
  // =====================================
  async getMyRequests() {
    const response = await API.get("/requests/my-requests");
    return response.data;
  },
 // =====================================
  // Cancel Request
  // =====================================
  async cancelRequest(requestId) {
    const response = await API.patch(
      `/requests/${requestId}/cancel`
    );
    return response.data;
  },


  // Confirm Collection
  // Collected → Completed
  async confirmCompletion(requestId) {

    const response = await API.patch(
      `/requests/${requestId}/confirm`
    );

    return response.data;
  }

};


export default businessService;