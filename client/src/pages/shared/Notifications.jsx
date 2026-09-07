import React, { useState, useEffect } from "react";

import Card from "../../components/common/Card";
import Loader from "../../components/common/Loader";
import ErrorBoundary from "../../components/common/ErrorBoundary";

import notificationService from "../../services/notificationService";

const Notifications = () => {

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);

    // ==========================================
    // LOAD NOTIFICATIONS
    // ==========================================

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {

        try {

            setLoading(true);

            const response =
                await notificationService.getNotifications();

            console.log(
                "NOTIFICATION RESPONSE:",
                response
            );

            setNotifications(
                response.data || []
            );

            // ==========================================
            // LOAD UNREAD COUNT
            // ==========================================

            const unreadResponse =
                await notificationService.getUnreadCount();

            console.log(
                "UNREAD COUNT RESPONSE:",
                unreadResponse
            );

            setUnreadCount(
                unreadResponse.data?.unread || 0
            );

        } catch (err) {

            console.error(
                "Error fetching notifications:",
                err
            );

        } finally {

            setLoading(false);

        }

    };


    // ==========================================
    // MARK ONE AS READ
    // ==========================================

    const handleMarkAsRead = async (id) => {

        try {

            const notification =
                notifications.find(
                    (item) =>
                        item.notification_id === id
                );

            await notificationService.markAsRead(id);

            setNotifications((prev) =>
                prev.map((item) =>
                    item.notification_id === id
                        ? {
                            ...item,
                            is_read: true,
                        }
                        : item
                )
            );

            // Only decrease if it was unread
            if (notification && !notification.is_read) {

                setUnreadCount((prev) =>
                    Math.max(prev - 1, 0)
                );

            }

        } catch (err) {

            console.error(
                "Mark Notification Read Error:",
                err
            );

        }

    };


    // ==========================================
    // DELETE ONE
    // ==========================================

    const handleDelete = async (id) => {

        if (
            !window.confirm(
                "Delete this notification?"
            )
        ) {
            return;
        }

        try {

            const deleted =
                notifications.find(
                    (n) =>
                        n.notification_id === id
                );

            await notificationService.deleteNotification(id);

            // Remove from UI
            setNotifications((prev) =>
                prev.filter(
                    (item) =>
                        item.notification_id !== id
                )
            );

            // Update unread count
            if (
                deleted &&
                !deleted.is_read
            ) {

                setUnreadCount((prev) =>
                    Math.max(prev - 1, 0)
                );

            }

        } catch (err) {

            console.error(
                "Delete Notification Error:",
                err
            );

        }

    };


    // ==========================================
    // MARK ALL AS READ
    // ==========================================

    const handleMarkAllRead = async () => {

        try {

            await notificationService.markAllAsRead();

            setNotifications((prev) =>
                prev.map((item) => ({
                    ...item,
                    is_read: true,
                }))
            );

            setUnreadCount(0);

        } catch (err) {

            console.error(
                "Mark All Read Error:",
                err
            );

        }

    };


    // ==========================================
    // DELETE ALL
    // ==========================================

    const handleDeleteAll = async () => {

    if (notifications.length === 0) {
        return;
    }

    const confirmed = window.confirm(
        "Are you sure you want to delete all notifications?"
    );

    if (!confirmed) {
        return;
    }

    try {

        console.log(
            "Deleting all notifications..."
        );

        const response =
            await notificationService.deleteAllNotifications();

        console.log(
            "Delete All Response:",
            response
        );

        setNotifications([]);

        setUnreadCount(0);

    } catch (error) {

        console.error(
            "Delete All Notifications Error:",
            error
        );

        console.error(
            "Response:",
            error.response?.data
        );

        alert(
            error.response?.data?.message ||
            "Failed to delete all notifications."
        );
    }
};

    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (

            <div className="flex h-[50vh] items-center justify-center">

                <Loader />

            </div>

        );

    }


    // ==========================================
    // PAGE
    // ==========================================

    return (

        <ErrorBoundary>

            <div className="max-w-4xl mx-auto p-6">

                {/* ==================================
                    HEADER
                ================================== */}

                <div className="flex justify-between items-center flex-wrap gap-4 border-b pb-4 mb-6">

                    <div>

                        <h1 className="text-2xl font-bold text-gray-800">
                            Notifications
                        </h1>

                        <p className="text-sm text-gray-500">
                            Latest updates from the municipality
                        </p>

                        <p className="text-sm text-blue-600 font-semibold mt-1">
                            {unreadCount} unread notification(s)
                        </p>

                    </div>


                    {/* ==================================
                        ACTION BUTTONS
                    ================================== */}

                    {notifications.length > 0 && (

                        <div className="flex gap-2">

                            <button
                                onClick={handleMarkAllRead}
                                className="
                                    bg-blue-600
                                    hover:bg-blue-700
                                    text-white
                                    px-4
                                    py-2
                                    rounded-lg
                                "
                            >
                                Mark All Read
                            </button>


                            <button
                                onClick={handleDeleteAll}
                                className="
                                    bg-red-600
                                    hover:bg-red-700
                                    text-white
                                    px-4
                                    py-2
                                    rounded-lg
                                "
                            >
                                Delete All
                            </button>

                        </div>

                    )}

                </div>


                {/* ==================================
                    EMPTY
                ================================== */}

                {notifications.length === 0 ? (

                    <Card className="text-center py-12">

                        <div className="text-6xl mb-4">
                            📬
                        </div>

                        <h2 className="text-xl font-semibold text-gray-700">
                            No Notifications
                        </h2>

                        <p className="text-gray-500 mt-2">
                            You don't have any notifications yet.
                        </p>

                    </Card>

                ) : (

                    /* ==================================
                       NOTIFICATION LIST
                    ================================== */

                    <div className="space-y-4">

                        {notifications.map((notif) => (

                            <Card
                                key={notif.notification_id}
                                className={`
                                    p-5
                                    transition-all
                                    ${
                                        notif.is_read
                                            ? "bg-white border-gray-200"
                                            : "bg-blue-50 border-blue-300 shadow-md"
                                    }
                                `}
                            >

                                <div className="flex justify-between gap-4">

                                    {/* CONTENT */}

                                    <div className="flex-1">

                                        <div className="flex items-center gap-3">

                                            <span className="text-2xl">

                                                {notif.is_read
                                                    ? "📩"
                                                    : "🔔"}

                                            </span>

                                            <h3 className="font-bold text-lg text-gray-800">
                                                {notif.title}
                                            </h3>


                                            {!notif.is_read && (

                                                <span
                                                    className="
                                                        bg-red-500
                                                        text-white
                                                        text-xs
                                                        px-2
                                                        py-1
                                                        rounded-full
                                                    "
                                                >
                                                    New
                                                </span>

                                            )}

                                        </div>


                                        <p className="mt-3 text-gray-700 leading-relaxed">
                                            {notif.message}
                                        </p>


                                        <p className="text-xs text-gray-400 mt-4">

                                            {new Date(
                                                notif.created_at
                                            ).toLocaleString()}

                                        </p>

                                    </div>


                                    {/* ACTIONS */}

                                    <div className="flex flex-col gap-2">

                                        {!notif.is_read && (

                                            <button
                                                onClick={() =>
                                                    handleMarkAsRead(
                                                        notif.notification_id
                                                    )
                                                }
                                                className="
                                                    bg-green-600
                                                    hover:bg-green-700
                                                    text-white
                                                    px-4
                                                    py-2
                                                    rounded-lg
                                                "
                                            >
                                                Mark Read
                                            </button>

                                        )}


                                        <button
                                            onClick={() =>
                                                handleDelete(
                                                    notif.notification_id
                                                )
                                            }
                                            className="
                                                bg-red-600
                                                hover:bg-red-700
                                                text-white
                                                px-4
                                                py-2
                                                rounded-lg
                                            "
                                        >
                                            Delete
                                        </button>

                                    </div>

                                </div>

                            </Card>

                        ))}

                    </div>

                )}

            </div>

        </ErrorBoundary>

    );

};

export default Notifications;