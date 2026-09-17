
import API from "./api";

const notificationService = {

    // ==========================================
    // GET ALL NOTIFICATIONS
    // ==========================================
    getNotifications: async () => {

        const response = await API.get(
            "/notifications"
        );

        return response.data;
    },


    // ==========================================
    // GET UNREAD COUNT
    // ==========================================
    getUnreadCount: async () => {

        const response = await API.get(
            "/notifications/unread-count"
        );

        return response.data;
    },


    // ==========================================
    // GET NOTIFICATION DETAILS
    // ==========================================
    getNotificationDetails: async (notificationId) => {

        const response = await API.get(
            `/notifications/${notificationId}/details`
        );

        return response.data;
    },


    // ==========================================
    // MARK ONE AS READ
    // ==========================================
    markAsRead: async (notificationId) => {

        const response = await API.patch(
            `/notifications/${notificationId}/read`
        );

        return response.data;
    },


    // ==========================================
    // MARK ALL AS READ
    // ==========================================
    markAllAsRead: async () => {

        const response = await API.patch(
            "/notifications/mark-all-read"
        );

        return response.data;
    },


    // ==========================================
    // DELETE ONE
    // ==========================================
    deleteNotification: async (notificationId) => {

        const response = await API.delete(
            `/notifications/${notificationId}`
        );

        return response.data;
    },


    // ==========================================
    // DELETE ALL
    // ==========================================
    deleteAllNotifications: async () => {

        const response = await API.delete(
            "/notifications/delete-all"
        );

        return response.data;
    }

};

export default notificationService;
