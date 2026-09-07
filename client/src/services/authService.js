// client/src/services/authService.js

import API from "../services/api";

const authService = {
  // ==========================
  // Login
  // ==========================
  async login(credentials) {
    // ተጠቃሚው የጻፈውን input (email, username, or identifier) በትክክል ማዘጋጀት
    const payload = {
      email: credentials.email || credentials.identifier || credentials.username || "",
      username: credentials.username || credentials.identifier || credentials.email || "",
      password: credentials.password,
    };

    const response = await API.post("/auth/login", payload);
    const data = response.data;

    if (data.success) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("user", JSON.stringify(data.user));
    }

    return data;
  },

  // ==========================
  // Logout
  // ==========================
  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");

    window.location.href = "/login";
  },

  // ==========================
  // Current User
  // ==========================
  getCurrentUser() {
    const user = localStorage.getItem("user");
    try {
      return user ? JSON.parse(user) : null;
    } catch (e) {
      return null;
    }
  },

  // ==========================
  // Get Profile
  // ==========================
  async getProfile() {
    const response = await API.get("/auth/profile");
    return response.data;
  },

  // ==========================
  // Update Profile
  // ==========================
  async updateProfile(data) {
    const response = await API.put("/auth/profile", data);
    return response.data;
  },

  // ==========================
  // Forgot Password
  // ==========================
  async forgotPassword(email) {
    const response = await API.post("/auth/forgot-password", {
      email,
    });

    return response.data;
  },

  // ==========================
  // Reset Password
  // ==========================
  async resetPassword(token, password) {
    const response = await API.post("/auth/reset-password", {
      token,
      password,
    });

    return response.data;
  },

  // ==========================
  // Change Password
  // ==========================
  async changePassword(data) {
    const response = await API.put("/auth/change-password", data);
    return response.data;
  },
};

export default authService;