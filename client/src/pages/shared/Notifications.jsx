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
    // DETAILS STATE
    // ==========================================

    const [selectedNotification, setSelectedNotification] =
        useState(null);

    const [details, setDetails] = useState(null);

    const [detailsLoading, setDetailsLoading] =
        useState(false);

    const [detailsError, setDetailsError] =
        useState("");

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
                Array.isArray(response?.data)
                    ? response.data
                    : []
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
                Number(unreadResponse?.data?.unread || 0)
            );

        } catch (err) {
            console.error(
                "Error fetching notifications:",
                err
            );

            setNotifications([]);
            setUnreadCount(0);

        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // VIEW DETAILS
    // ==========================================

    const handleViewDetails = async (notification) => {
        try {
            setSelectedNotification(notification);
            setDetails(null);
            setDetailsError("");
            setDetailsLoading(true);

            console.log(
                "================================="
            );

            console.log(
                "GETTING NOTIFICATION DETAILS"
            );

            console.log(
                "NOTIFICATION ID:",
                notification.notification_id
            );

            console.log(
                "NOTIFICATION TYPE:",
                notification.notification_type
            );

            console.log(
                "REFERENCE ID:",
                notification.reference_id
            );

            const response =
                await notificationService.getNotificationDetails(
                    notification.notification_id
                );

            console.log(
                "NOTIFICATION DETAILS RESPONSE:",
                response
            );

            if (response?.success) {
                setDetails(
                    response.data || null
                );
            } else {
                setDetailsError(
                    response?.message ||
                    "No details are available for this notification."
                );
            }

        } catch (error) {
            console.error(
                "Notification Details Error:",
                error
            );

            setDetailsError(
                error.response?.data?.message ||
                "Failed to load notification details."
            );

        } finally {
            setDetailsLoading(false);
        }
    };

    // ==========================================
    // CLOSE DETAILS
    // ==========================================

    const closeDetails = () => {
        setSelectedNotification(null);
        setDetails(null);
        setDetailsError("");
        setDetailsLoading(false);
    };

    // ==========================================
    // FORMAT DATE
    // ==========================================

    const formatDate = (date) => {
        if (!date) {
            return "-";
        }

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "-";
        }

        return parsedDate.toLocaleString();
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

            if (
                notification &&
                !notification.is_read
            ) {
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

            setNotifications((prev) =>
                prev.filter(
                    (item) =>
                        item.notification_id !== id
                )
            );

            if (
                deleted &&
                !deleted.is_read
            ) {
                setUnreadCount((prev) =>
                    Math.max(prev - 1, 0)
                );
            }

            if (
                selectedNotification &&
                selectedNotification.notification_id === id
            ) {
                closeDetails();
            }

        } catch (err) {
            console.error(
                "Delete Notification Error:",
                err
            );

            alert(
                err.response?.data?.message ||
                "Failed to delete notification."
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

            alert(
                err.response?.data?.message ||
                "Failed to mark all notifications as read."
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
            closeDetails();

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
    // NORMALIZE DETAILS DATA
    // ==========================================

    const detailData =
        details?.data ||
        details?.details ||
        null;

    // ==========================================
    // PAGE
    // ==========================================

    return (
        <ErrorBoundary>

            <div className="max-w-5xl mx-auto p-6">

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

                        <div className="flex gap-2 flex-wrap">

                            <button
                                onClick={handleMarkAllRead}
                                className="
                                    bg-blue-600
                                    hover:bg-blue-700
                                    text-white
                                    px-4
                                    py-2
                                    rounded-lg
                                    transition
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
                                    transition
                                "
                            >
                                Delete All
                            </button>

                        </div>

                    )}

                </div>

                {/* ==================================
                    EMPTY STATE
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

                                    {/* ==================================
                                        CONTENT
                                    ================================== */}

                                    <div className="flex-1">

                                        <div className="flex items-center gap-3 flex-wrap">

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
                                            {formatDate(
                                                notif.created_at
                                            )}
                                        </p>

                                    </div>

                                    {/* ==================================
                                        ACTIONS
                                    ================================== */}

                                    <div className="flex flex-col gap-2 min-w-[120px]">

                                        <button
                                            onClick={() =>
                                                handleViewDetails(
                                                    notif
                                                )
                                            }
                                            className="
                                                bg-indigo-600
                                                hover:bg-indigo-700
                                                text-white
                                                px-4
                                                py-2
                                                rounded-lg
                                                transition
                                            "
                                        >
                                            Details
                                        </button>

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
                                                    transition
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
                                                transition
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

            {/* =====================================================
                DETAILS MODAL
            ===================================================== */}

            {selectedNotification && (

                <div
                    className="
                        fixed
                        inset-0
                        z-50
                        bg-black
                        bg-opacity-50
                        flex
                        items-center
                        justify-center
                        p-4
                    "
                    onClick={closeDetails}
                >

                    <div
                        className="
                            bg-white
                            rounded-xl
                            shadow-2xl
                            w-full
                            max-w-4xl
                            max-h-[90vh]
                            overflow-y-auto
                        "
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        {/* ==================================
                            MODAL HEADER
                        ================================== */}

                        <div
                            className="
                                flex
                                justify-between
                                items-center
                                px-6
                                py-4
                                border-b
                                bg-gray-50
                            "
                        >

                            <div>

                                <h2 className="text-xl font-bold text-gray-800">
                                    Notification Details
                                </h2>

                                <p className="text-sm text-gray-500 mt-1">
                                    {selectedNotification.title}
                                </p>

                            </div>

                            <button
                                onClick={closeDetails}
                                className="
                                    text-gray-500
                                    hover:text-red-600
                                    text-2xl
                                    font-bold
                                "
                            >
                                ×
                            </button>

                        </div>

                        {/* ==================================
                            MODAL CONTENT
                        ================================== */}

                        <div className="p-6">

                            {detailsLoading ? (

                                <div className="flex justify-center py-12">
                                    <Loader />
                                </div>

                            ) : detailsError ? (

                                <div
                                    className="
                                        bg-yellow-50
                                        border
                                        border-yellow-300
                                        text-yellow-800
                                        rounded-lg
                                        p-5
                                        text-center
                                    "
                                >

                                    <div className="text-4xl mb-3">
                                        ℹ️
                                    </div>

                                    <p className="font-semibold">
                                        {detailsError}
                                    </p>

                                </div>

                            ) : details ? (

                                <>

                                    {/* =================================================
                                        BUSINESS REGISTRATION
                                    ================================================= */}

                                    {details.type ===
                                        "BUSINESS_REGISTRATION" && (

                                        <div>

                                            <div
                                                className="
                                                    bg-blue-50
                                                    border
                                                    border-blue-200
                                                    rounded-lg
                                                    p-5
                                                    mb-6
                                                "
                                            >

                                                <div className="flex items-center gap-3">

                                                    <div className="text-3xl">
                                                        🏢
                                                    </div>

                                                    <div>

                                                        <h3 className="text-lg font-bold text-blue-800">
                                                            Business Registration
                                                        </h3>

                                                        <p className="text-sm text-blue-600 mt-1">
                                                            Registered business owner information
                                                        </p>

                                                    </div>

                                                </div>

                                            </div>

                                            {detailData ? (

                                                <div className="space-y-6">

                                                    {/* ==================================
                                                        BUSINESS INFORMATION
                                                    ================================== */}

                                                    <div>

                                                        <h4
                                                            className="
                                                                text-base
                                                                font-bold
                                                                text-gray-800
                                                                mb-3
                                                                border-b
                                                                pb-2
                                                            "
                                                        >
                                                            Business Information
                                                        </h4>

                                                        <div
                                                            className="
                                                                grid
                                                                grid-cols-1
                                                                md:grid-cols-2
                                                                gap-4
                                                            "
                                                        >

                                                            <DetailItem
                                                                label="Business Name"
                                                                value={
                                                                    detailData.business_name
                                                                }
                                                            />

                                                            <DetailItem
                                                                label="Owner Name"
                                                                value={
                                                                    detailData.owner_name
                                                                }
                                                            />

                                                            <DetailItem
                                                                label="Business Type"
                                                                value={
                                                                    detailData.business_type
                                                                }
                                                            />

                                                            <DetailItem
                                                                label="Phone Number"
                                                                value={
                                                                    detailData.phone_number
                                                                }
                                                            />

                                                            <DetailItem
                                                                label="Email Address"
                                                                value={
                                                                    detailData.email
                                                                }
                                                            />

                                                        </div>

                                                    </div>

                                                    {/* ==================================
                                                        ADDRESS INFORMATION
                                                    ================================== */}

                                                    <div>

                                                        <h4
                                                            className="
                                                                text-base
                                                                font-bold
                                                                text-gray-800
                                                                mb-3
                                                                border-b
                                                                pb-2
                                                            "
                                                        >
                                                            Address Information
                                                        </h4>

                                                        <div
                                                            className="
                                                                grid
                                                                grid-cols-1
                                                                md:grid-cols-2
                                                                gap-4
                                                            "
                                                        >

                                                            <DetailItem
                                                                label="Kifle Ketema"
                                                                value={
                                                                    detailData.kifle_ketema
                                                                }
                                                            />

                                                            <DetailItem
                                                                label="Kebele"
                                                                value={
                                                                    detailData.kebele
                                                                }
                                                            />

                                                            <DetailItem
                                                                label="Sefer"
                                                                value={
                                                                    detailData.sefer
                                                                }
                                                            />

                                                            <DetailItem
                                                                label="House Number"
                                                                value={
                                                                    detailData.house_number
                                                                }
                                                            />

                                                        </div>

                                                    </div>

                                                    {/* ==================================
                                                        ADDITIONAL INFORMATION
                                                    ================================== */}

                                                    <div>

                                                        <h4
                                                            className="
                                                                text-base
                                                                font-bold
                                                                text-gray-800
                                                                mb-3
                                                                border-b
                                                                pb-2
                                                            "
                                                        >
                                                            Additional Information
                                                        </h4>

                                                        <div
                                                            className="
                                                                grid
                                                                grid-cols-1
                                                                md:grid-cols-2
                                                                gap-4
                                                            "
                                                        >

                                                            <DetailItem
                                                                label="Business ID"
                                                                value={
                                                                    detailData.business_id
                                                                }
                                                            />

                                                            <DetailItem
                                                                label="Registration Date"
                                                                value={
                                                                    formatDate(
                                                                        detailData.created_at
                                                                    )
                                                                }
                                                            />

                                                            <DetailItem
                                                                label="Status"
                                                                value={
                                                                    detailData.is_active
                                                                        ? "Active"
                                                                        : "Inactive"
                                                                }
                                                                status
                                                            />

                                                        </div>

                                                    </div>

                                                    {/* ==================================
                                                        BUSINESS DESCRIPTION
                                                    ================================== */}

                                                    {detailData.business_description && (

                                                        <div>

                                                            <h4
                                                                className="
                                                                    text-base
                                                                    font-bold
                                                                    text-gray-800
                                                                    mb-3
                                                                "
                                                            >
                                                                Business Description
                                                            </h4>

                                                            <div
                                                                className="
                                                                    bg-gray-50
                                                                    border
                                                                    border-gray-200
                                                                    rounded-lg
                                                                    p-4
                                                                    text-gray-700
                                                                    leading-relaxed
                                                                "
                                                            >
                                                                {
                                                                    detailData.business_description
                                                                }
                                                            </div>

                                                        </div>

                                                    )}

                                                </div>

                                            ) : (

                                                <div
                                                    className="
                                                        bg-yellow-50
                                                        border
                                                        border-yellow-200
                                                        rounded-lg
                                                        p-5
                                                        text-center
                                                    "
                                                >

                                                    <div className="text-4xl mb-3">
                                                        ⚠️
                                                    </div>

                                                    <p className="text-yellow-800 font-semibold">
                                                        Business details are not available.
                                                    </p>

                                                    <p className="text-sm text-yellow-700 mt-2">
                                                        The registered business information could not be found.
                                                    </p>

                                                </div>

                                            )}

                                        </div>

                                    )}

                                    {/* =================================================
                                        ON-DEMAND REQUEST
                                    ================================================= */}

                                    {details.type ===
                                        "ON_DEMAND_REQUEST" && (

                                        <div>

                                            <div
                                                className="
                                                    bg-green-50
                                                    border
                                                    border-green-200
                                                    rounded-lg
                                                    p-5
                                                    mb-6
                                                "
                                            >

                                                <div className="flex items-center gap-3">

                                                    <div className="text-3xl">
                                                        🚛
                                                    </div>

                                                    <div>

                                                        <h3 className="text-lg font-bold text-green-800">
                                                            On-Demand Collection Request
                                                        </h3>

                                                        <p className="text-sm text-green-600 mt-1">
                                                            Collection request information
                                                        </p>

                                                    </div>

                                                </div>

                                            </div>

                                            {detailData ? (

                                                <>

                                                    {/* ==================================
                                                        REQUEST INFORMATION
                                                    ================================== */}

                                                    <div>

                                                        <h4
                                                            className="
                                                                text-base
                                                                font-bold
                                                                text-gray-800
                                                                mb-3
                                                                border-b
                                                                pb-2
                                                            "
                                                        >
                                                            Request Information
                                                        </h4>

                                                        <div
                                                            className="
                                                                grid
                                                                grid-cols-1
                                                                md:grid-cols-2
                                                                gap-4
                                                            "
                                                        >

                                                            <DetailItem
                                                                label="Request ID"
                                                                value={
                                                                    detailData.request_id
                                                                }
                                                            />

                                                            <DetailItem
                                                                label="Business Name"
                                                                value={
                                                                    detailData.business_name
                                                                }
                                                            />

                                                            <DetailItem
                                                                label="Owner Name"
                                                                value={
                                                                    detailData.owner_name
                                                                }
                                                            />

                                                            <DetailItem
                                                                label="Phone Number"
                                                                value={
                                                                    detailData.business_phone ||
                                                                    detailData.phone_number
                                                                }
                                                            />

                                                            <DetailItem
                                                                label="Email Address"
                                                                value={
                                                                    detailData.business_email ||
                                                                    detailData.email
                                                                }
                                                            />

                                                            <DetailItem
                                                                label="Business Type"
                                                                value={
                                                                    detailData.business_type
                                                                }
                                                            />

                                                            <DetailItem
                                                                label="Kifle Ketema"
                                                                value={
                                                                    detailData.kifle_ketema
                                                                }
                                                            />

                                                            <DetailItem
                                                                label="Kebele"
                                                                value={
                                                                    detailData.kebele
                                                                }
                                                            />

                                                            <DetailItem
                                                                label="Sefer"
                                                                value={
                                                                    detailData.sefer
                                                                }
                                                            />

                                                            <DetailItem
                                                                label="House Number"
                                                                value={
                                                                    detailData.house_number ||
                                                                    detailData.business_house_number
                                                                }
                                                            />

                                                            <DetailItem
                                                                label="Preferred Collection Date"
                                                                value={
                                                                    formatDate(
                                                                        detailData.preferred_collection_date
                                                                    )
                                                                }
                                                            />

                                                            <DetailItem
                                                                label="Request Status"
                                                                value={
                                                                    detailData.status
                                                                }
                                                                status
                                                            />

                                                        </div>

                                                    </div>

                                                    {/* ==================================
                                                        COLLECTION ADDRESS
                                                    ================================== */}

                                                    {detailData.collection_address && (

                                                        <div className="mt-6">

                                                            <h4
                                                                className="
                                                                    text-base
                                                                    font-bold
                                                                    text-gray-800
                                                                    mb-3
                                                                "
                                                            >
                                                                Collection Address
                                                            </h4>

                                                            <div
                                                                className="
                                                                    bg-gray-50
                                                                    border
                                                                    border-gray-200
                                                                    rounded-lg
                                                                    p-4
                                                                    text-gray-700
                                                                "
                                                            >
                                                                {
                                                                    detailData.collection_address
                                                                }
                                                            </div>

                                                        </div>

                                                    )}

                                                    {/* ==================================
                                                        DESCRIPTION
                                                    ================================== */}

                                                    <div className="mt-6">

                                                        <h4
                                                            className="
                                                                text-base
                                                                font-bold
                                                                text-gray-800
                                                                mb-3
                                                            "
                                                        >
                                                            Description
                                                        </h4>

                                                        <div
                                                            className="
                                                                bg-gray-50
                                                                border
                                                                border-gray-200
                                                                rounded-lg
                                                                p-4
                                                                text-gray-700
                                                                min-h-[80px]
                                                                leading-relaxed
                                                            "
                                                        >
                                                            {
                                                                detailData.description ||
                                                                "No description provided."
                                                            }
                                                        </div>

                                                    </div>

                                                    {/* ==================================
                                                        REJECTION REASON
                                                    ================================== */}

                                                    {detailData.rejection_reason && (

                                                        <div className="mt-6">

                                                            <h4
                                                                className="
                                                                    text-base
                                                                    font-bold
                                                                    text-red-600
                                                                    mb-3
                                                                "
                                                            >
                                                                Rejection Reason
                                                            </h4>

                                                            <div
                                                                className="
                                                                    bg-red-50
                                                                    border
                                                                    border-red-200
                                                                    rounded-lg
                                                                    p-4
                                                                    text-red-700
                                                                    leading-relaxed
                                                                "
                                                            >
                                                                {
                                                                    detailData.rejection_reason
                                                                }
                                                            </div>

                                                        </div>

                                                    )}

                                                </>

                                            ) : (

                                                <div
                                                    className="
                                                        bg-yellow-50
                                                        border
                                                        border-yellow-200
                                                        rounded-lg
                                                        p-5
                                                        text-center
                                                    "
                                                >

                                                    <div className="text-4xl mb-3">
                                                        ⚠️
                                                    </div>

                                                    <p className="text-yellow-800 font-semibold">
                                                        Request details are not available.
                                                    </p>

                                                </div>

                                            )}

                                        </div>

                                    )}

                                    {/* =================================================
                                        GENERAL NOTIFICATION
                                    ================================================= */}

                                    {details.type === "GENERAL" && (

                                        <div
                                            className="
                                                bg-gray-50
                                                border
                                                border-gray-200
                                                rounded-lg
                                                p-5
                                            "
                                        >

                                            <h3
                                                className="
                                                    font-bold
                                                    text-gray-800
                                                    mb-4
                                                    text-lg
                                                "
                                            >
                                                Notification Information
                                            </h3>

                                            <DetailItem
                                                label="Title"
                                                value={
                                                    selectedNotification.title
                                                }
                                            />

                                            <div className="mt-5">

                                                <h4
                                                    className="
                                                        text-sm
                                                        font-semibold
                                                        text-gray-600
                                                        mb-2
                                                    "
                                                >
                                                    Message
                                                </h4>

                                                <div
                                                    className="
                                                        bg-white
                                                        border
                                                        border-gray-200
                                                        rounded-lg
                                                        p-4
                                                        text-gray-700
                                                        leading-relaxed
                                                    "
                                                >
                                                    {
                                                        selectedNotification.message
                                                    }
                                                </div>

                                            </div>

                                            <div className="mt-5">

                                                <h4
                                                    className="
                                                        text-sm
                                                        font-semibold
                                                        text-gray-600
                                                        mb-2
                                                    "
                                                >
                                                    Created At
                                                </h4>

                                                <div
                                                    className="
                                                        bg-white
                                                        border
                                                        border-gray-200
                                                        rounded-lg
                                                        p-3
                                                        text-gray-700
                                                    "
                                                >
                                                    {formatDate(
                                                        selectedNotification.created_at
                                                    )}
                                                </div>

                                            </div>

                                        </div>

                                    )}

                                </>

                            ) : (

                                <div
                                    className="
                                        text-center
                                        py-10
                                        text-gray-500
                                    "
                                >
                                    No details available.
                                </div>

                            )}

                        </div>

                        {/* ==================================
                            MODAL FOOTER
                        ================================== */}

                        <div
                            className="
                                border-t
                                px-6
                                py-4
                                flex
                                justify-end
                            "
                        >

                            <button
                                onClick={closeDetails}
                                className="
                                    bg-gray-600
                                    hover:bg-gray-700
                                    text-white
                                    px-5
                                    py-2
                                    rounded-lg
                                    transition
                                "
                            >
                                Close
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </ErrorBoundary>
    );
};

// ============================================================
// DETAIL ITEM COMPONENT
// ============================================================

const DetailItem = ({
    label,
    value,
    status = false
}) => {

    return (

        <div
            className="
                border
                border-gray-200
                rounded-lg
                p-4
                bg-white
                shadow-sm
            "
        >

            <p
                className="
                    text-xs
                    font-semibold
                    text-gray-500
                    uppercase
                    tracking-wide
                "
            >
                {label}
            </p>

            {status ? (

                <span
                    className={`
                        inline-block
                        mt-2
                        px-3
                        py-1
                        rounded-full
                        text-sm
                        font-semibold
                        ${
                            String(value).toLowerCase() === "active" ||
                            String(value).toLowerCase() === "completed"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                        }
                    `}
                >
                    {value || "-"}
                </span>

            ) : (

                <p
                    className="
                        mt-2
                        text-gray-800
                        font-medium
                        break-words
                    "
                >
                    {value || "-"}
                </p>

            )}

        </div>

    );
};

export default Notifications;