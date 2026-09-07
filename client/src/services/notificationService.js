import API from "./api";

const notificationService = {

    // ==========================================
    // Get Notifications
    // ==========================================
    getNotifications: async () => {

        const response = await API.get(
            "/notifications"
        );

        return response.data;
    },


    // ==========================================
    // Get Unread Count
    // ==========================================
    getUnreadCount: async () => {

        const response = await API.get(
            "/notifications/unread-count"
        );

        return response.data;
    },


    // ==========================================
    // Mark One As Read
    // ==========================================
    markAsRead: async (id) => {

        const response = await API.patch(
            `/notifications/${id}/read`
        );

        return response.data;
    },


    // ==========================================
    // Mark All As Read
    // ==========================================
    markAllAsRead: async () => {

        const response = await API.patch(
            "/notifications/mark-all-read"
        );

        return response.data;
    },


    // ==========================================
    // Delete One
    // ==========================================
    deleteNotification: async (id) => {

        const response = await API.delete(
            `/notifications/${id}`
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