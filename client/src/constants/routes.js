export const ROUTES = {
  // =========================
  // Authentication
  // =========================
  HOME: "/",
  LOGIN: "/login",
  LOGOUT: "/logout",

  REGISTER: "/register",
  RESIDENT_REGISTER: "/register/resident",
  BUSINESS_REGISTER: "/register/business",

  FORGOT_PASSWORD: "/forgot-password",

  UNAUTHORIZED: "/unauthorized",
  NOT_FOUND: "*",

  // =========================
  // Resident
  // =========================
  RESIDENT_DASHBOARD: "/resident/dashboard",
  RESIDENT_PROFILE: "/resident/profile",
  RESIDENT_SCHEDULE: "/resident/schedule",
  RESIDENT_NOTIFICATIONS: "/resident/notifications",
  RESIDENT_FEEDBACK: "/resident/feedback",

  // =========================
  // Business Owner
  // =========================
  BUSINESS_DASHBOARD: "/business/dashboard",
  BUSINESS_PROFILE: "/business/profile",
  BUSINESS_SCHEDULE: "/business/schedule",
  BUSINESS_ON_DEMAND: "/business/on-demand-request",
  BUSINESS_NOTIFICATIONS: "/business/notifications",
  BUSINESS_FEEDBACK: "/business/feedback",

  // =========================
  // Collector
  // =========================
  COLLECTOR_DASHBOARD: "/collector/dashboard",
  COLLECTOR_ASSIGNED_TASKS: "/collector/assigned-tasks",
  COLLECTOR_UPDATE_STATUS: "/collector/update-status",
  COLLECTOR_NOTIFICATIONS: "/collector/notifications",
  COLLECTOR_PROFILE: "/collector/profile",

  // =========================
  // Municipal Administrator
  // =========================
  MUNICIPAL_HOME: "/municipal-admin/home",
  MUNICIPAL_DASHBOARD: "/municipal-admin/dashboard",

  MUNICIPAL_RESIDENTS: "/municipal-admin/residents",
  MUNICIPAL_BUSINESS_OWNERS: "/municipal-admin/business-owners",
  MUNICIPAL_COLLECTORS: "/municipal-admin/collectors",

  // On-Demand Requests
  MUNICIPAL_REQUESTS: "/municipal-admin/requests",
  MUNICIPAL_ON_DEMAND_REQUESTS: "/municipal-admin/on-demand-requests",

  MUNICIPAL_SCHEDULES: "/municipal-admin/schedules",

  MUNICIPAL_ASSIGN_COLLECTOR:
    "/municipal-admin/assign-collector/:id",

  MUNICIPAL_REPORTS: "/municipal-admin/reports",

  MUNICIPAL_FEEDBACK: "/municipal-admin/feedback",

  MUNICIPAL_NOTIFICATIONS:
    "/municipal-admin/notifications",

  MUNICIPAL_PROFILE: "/municipal-admin/profile",

  // =========================
  // System Administrator
  // =========================
  SYSTEM_DASHBOARD: "/system-admin/dashboard",
  SYSTEM_USERS: "/system-admin/users",
  SYSTEM_ROLES: "/system-admin/roles",
  SYSTEM_STAFF: "/system-admin/staff-accounts",
  SYSTEM_BACKUP: "/system-admin/backup",
  SYSTEM_REQUESTS: "/system-admin/requests",
  SYSTEM_PROFILE: "/system-admin/profile",
};

export default ROUTES;