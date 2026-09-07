import axios from "axios";

const API = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:5000/api",

  withCredentials: true,
});

// =============================
// Request Interceptor
// =============================
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
console.log("REQUEST URL:", config.url);
console.log("TOKEN:", token);


    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// =============================
// Response Interceptor
// =============================
API.interceptors.response.use(
  (response) => response,

  (error) => {
    const isLoginRequest =
      error.config?.url?.includes("/auth/login");

    const status = error.response?.status;

    // ==========================================
    // ONLY 401 -> Logout / Login
    // ==========================================
    if (status === 401 && !isLoginRequest) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    // ==========================================
    // 403 -> DO NOT logout
    // ==========================================
    if (status === 403) {
      console.warn(
        "Access Forbidden:",
        error.response?.data
      );
    }

    return Promise.reject(error);
  }
);

export default API;