import API from "./api";

const systemAdminService = {

  // ==========================================
  // Dashboard
  // ==========================================

  async getDashboard() {
    const response = await API.get(
      "/system-admin/dashboard"
    );

    return response.data;
  },


  // ==========================================
  // Profile
  // ==========================================

  async getProfile() {
    const response = await API.get(
      "/system-admin/profile"
    );

    return response.data;
  },


  async updateProfile(data) {
    const response = await API.put(
      "/system-admin/profile",
      data
    );

    return response.data;
  },


  // ==========================================
  // Change Password
  // ==========================================

  async changePassword(data) {
    const response = await API.put(
      "/system-admin/change-password",
      data
    );

    return response.data;
  },


  // ==========================================
  // Statistics
  // ==========================================

  async getStats() {
    const response = await API.get(
      "/system-admin/statistics"
    );

    return response.data;
  },


  // ==========================================
  // Users
  // ==========================================

  async getUsers() {
    const response = await API.get(
      "/system-admin/users"
    );

    return response.data;
  },


  async getUser(id) {
    const response = await API.get(
      `/system-admin/users/${id}`
    );

    return response.data;
  },


  async updateUser(id, data) {
    const response = await API.put(
        `/system-admin/users/${id}`,
        data
    );

    return response.data;
},


  async deleteUser(id, role) {
    const response = await API.delete(
      `/system-admin/users/${id}?role=${encodeURIComponent(role)}`
    );

    return response.data;
  },


  // ==========================================
  // Staff
  // ==========================================

  async createStaffAccount(staffData) {
    const response = await API.post(
      "/system-admin/staff",
      staffData
    );

    return response.data;
  },


  // ==========================================
  // Export Users
  // ==========================================

  async exportUsersPDF() {
    return API.get(
      "/system-admin/users/export/pdf",
      {
        responseType: "blob",
      }
    );
  },


  async exportUsersExcel() {
    return API.get(
      "/system-admin/users/export/excel",
      {
        responseType: "blob",
      }
    );
  },


  // ==========================================
  // Backup
  // ==========================================

  async triggerBackup() {
    const response = await API.post(
      "/system-admin/backup"
    );

    return response.data;
  },
};

export default systemAdminService;