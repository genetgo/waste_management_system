
import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

import {
    FaHome,
    FaBuilding,
    FaTruck,
    FaUsers,
    FaClipboardList,
    FaCalendarAlt,
    FaChartBar,
    FaBell,
    FaUser,
    FaCommentDots,
    FaSignOutAlt
} from "react-icons/fa";

import useSocketNotification
    from "../../hooks/useSocketNotification";

import notificationService
    from "../../services/notificationService";


const MunicipalAdminLayout = () => {

    const navigate = useNavigate();
    const location = useLocation();


    // ==========================================
    // SOCKET NOTIFICATION
    // ==========================================

    useSocketNotification();


    // ==========================================
    // NOTIFICATION COUNT
    // ==========================================

    const [unreadNotificationCount, setUnreadNotificationCount] =
        useState(0);


    // ==========================================
    // USER
    // ==========================================

    const user = React.useMemo(() => {

        try {

            return (
                JSON.parse(
                    localStorage.getItem("user")
                ) || {}
            );

        } catch (error) {

            console.error(
                "Failed to read user:",
                error
            );

            return {};

        }

    }, []);


    // ==========================================
    // LOAD UNREAD NOTIFICATION COUNT
    // ==========================================

    const loadUnreadNotificationCount = async () => {

        try {

            const response =
                await notificationService.getUnreadCount();

            console.log(
                "SIDEBAR UNREAD COUNT:",
                response
            );

            setUnreadNotificationCount(
                Number(
                    response.data?.unread || 0
                )
            );

        } catch (error) {

            console.error(
                "Failed to load notification count:",
                error
            );

        }

    };


    // ==========================================
    // LOAD COUNT ON PAGE LOAD
    // ==========================================

    useEffect(() => {

        loadUnreadNotificationCount();

    }, []);


    // ==========================================
    // REFRESH COUNT WHEN RETURNING TO LAYOUT
    // ==========================================

    useEffect(() => {

        loadUnreadNotificationCount();

    }, [location.pathname]);


    // ==========================================
    // MENU ITEMS
    // ==========================================

    const menuItems = [

        {
            label: "Home",
            path: "/municipal-admin/home",
            icon: <FaHome />
        },

        {
            label: "Dashboard",
            path: "/municipal-admin/dashboard",
            icon: <FaChartBar />
        },

        {
            label: "Business Owners",
            path: "/municipal-admin/business-owners",
            icon: <FaBuilding />
        },

        {
            label: "Collectors",
            path: "/municipal-admin/collectors",
            icon: <FaTruck />
        },

        {
            label: "Collection Teams",
            path: "/municipal-admin/collection-teams",
            icon: <FaUsers />
        },

        {
            label: "Requests",
            path: "/municipal-admin/requests",
            icon: <FaClipboardList />
        },

        {
            label: "Schedules",
            path: "/municipal-admin/schedules",
            icon: <FaCalendarAlt />
        },

        {
            label: "Reports",
            path: "/municipal-admin/reports",
            icon: <FaChartBar />
        },

        {
            label: "Notifications",
            path: "/municipal-admin/notifications",
            icon: <FaBell />,
            notification: true
        },

        {
            label: "Feedback",
            path: "/municipal-admin/feedback",
            icon: <FaCommentDots />
        },

        {
            label: "Profile",
            path: "/municipal-admin/profile",
            icon: <FaUser />
        }

    ];


    // ==========================================
    // NAVIGATION
    // ==========================================

    const handleNavigation = (path) => {

        navigate(path);

    };


    // ==========================================
    // LOGOUT
    // ==========================================

    const handleLogout = () => {

        localStorage.clear();

        navigate("/login");

    };


    return (

        <div className="min-h-screen bg-gray-100">


            {/* ==================================================
                STATIC SIDEBAR
            ================================================== */}

            <aside
                className="
                    fixed
                    top-0
                    left-0
                    z-50

                    h-screen
                    w-72

                    bg-white
                    shadow-2xl

                    flex
                    flex-col
                "
            >


                {/* ==================================================
                    SIDEBAR HEADER
                ================================================== */}

                <div
                    className="
                        flex
                        items-center

                        flex-shrink-0

                        h-20
                        px-6

                        bg-blue-700
                        text-white
                    "
                >

                    <div>

                        <h1 className="font-bold text-lg">
                            Municipal Admin
                        </h1>

                        <p className="text-xs text-blue-200">
                            Waste Management System
                        </p>

                    </div>

                </div>


                {/* ==================================================
                    USER INFORMATION
                ================================================== */}

                <div
                    className="
                        flex-shrink-0

                        px-5
                        py-5

                        border-b
                        bg-gray-50
                    "
                >

                    <p className="text-xs text-gray-500">
                        Administrator
                    </p>


                    <h2
                        className="
                            font-bold
                            text-gray-800
                            truncate
                        "
                    >

                        {user.full_name ||
                            "Municipal Admin"}

                    </h2>


                    <p
                        className="
                            text-sm
                            text-blue-600
                            mt-1
                        "
                    >

                        {user.assigned_kifle_ketema ||
                            "Assigned Area"}

                    </p>

                </div>


                {/* ==================================================
                    MENU
                ================================================== */}

                <nav
                    className="
                        flex-1
                        overflow-y-auto

                        px-4
                        py-4

                        space-y-1
                    "
                >

                    {menuItems.map((item) => {

                        const active =
                            location.pathname === item.path;


                        return (

                            <button
                                key={item.path}
                                onClick={() =>
                                    handleNavigation(
                                        item.path
                                    )
                                }
                                className={`
                                    w-full

                                    flex
                                    items-center
                                    gap-4

                                    px-4
                                    py-3

                                    rounded-xl

                                    text-left

                                    transition
                                    duration-200

                                    ${
                                        active
                                            ? "bg-blue-600 text-white shadow-md"
                                            : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                                    }
                                `}
                            >

                                {/* ICON */}

                                <span
                                    className="
                                        text-lg
                                        flex-shrink-0
                                    "
                                >

                                    {item.icon}

                                </span>


                                {/* LABEL */}

                                <span className="font-medium flex-1">

                                    {item.label}

                                </span>


                                {/* ==================================
                                    NOTIFICATION COUNT
                                ================================== */}

                                {item.notification &&
                                    unreadNotificationCount > 0 && (

                                    <span
                                        className={`
                                            min-w-[24px]
                                            h-[24px]

                                            px-1.5

                                            rounded-full

                                            flex
                                            items-center
                                            justify-center

                                            text-xs
                                            font-bold

                                            ${
                                                active
                                                    ? "bg-white text-blue-600"
                                                    : "bg-red-500 text-white"
                                            }
                                        `}
                                    >

                                        {unreadNotificationCount > 99
                                            ? "99+"
                                            : unreadNotificationCount}

                                    </span>

                                )}

                            </button>

                        );

                    })}

                </nav>


                {/* ==================================================
                    LOGOUT
                ================================================== */}

                <div
                    className="
                        flex-shrink-0

                        p-4

                        bg-white
                        border-t
                    "
                >

                    <button
                        onClick={handleLogout}
                        className="
                            w-full

                            flex
                            items-center
                            justify-center
                            gap-3

                            bg-red-600
                            hover:bg-red-700

                            text-white

                            py-3

                            rounded-xl

                            font-semibold

                            transition
                        "
                    >

                        <FaSignOutAlt />

                        Logout

                    </button>

                </div>

            </aside>


            {/* ==================================================
                MAIN AREA
            ================================================== */}

            <div className="min-h-screen ml-72">


                {/* ==================================================
                    TOP BAR
                ================================================== */}

                <header
                    className="
                        h-20

                        bg-white
                        shadow-sm

                        flex
                        items-center
                        justify-between

                        px-6

                        sticky
                        top-0

                        z-30
                    "
                >

                    {/* TITLE */}

                    <div>

                        <h1
                            className="
                                font-bold
                                text-xl
                                text-gray-800
                            "
                        >

                            Debre Markos Municipality

                        </h1>


                        <p
                            className="
                                text-xs
                                text-gray-500
                            "
                        >

                            Waste Collection Management System

                        </p>

                    </div>


                    {/* ==================================================
                        TOP BAR NOTIFICATION
                    ================================================== */}

                    <button
                        onClick={() =>
                            navigate(
                                "/municipal-admin/notifications"
                            )
                        }
                        className="
                            relative

                            text-gray-600

                            hover:text-blue-600

                            text-xl

                            transition

                            p-2
                        "
                        aria-label="Notifications"
                    >

                        <FaBell />


                        {/* ==================================
                            NOTIFICATION BADGE
                        ================================== */}

                        {unreadNotificationCount > 0 && (

                            <span
                                className="
                                    absolute
                                    -top-1
                                    -right-1

                                    bg-red-500
                                    text-white

                                    text-[10px]
                                    font-bold

                                    min-w-[18px]
                                    h-[18px]

                                    px-1

                                    rounded-full

                                    flex
                                    items-center
                                    justify-center

                                    border-2
                                    border-white
                                "
                            >

                                {unreadNotificationCount > 99
                                    ? "99+"
                                    : unreadNotificationCount}

                            </span>

                        )}

                    </button>

                </header>


                {/* ==================================================
                    PAGE CONTENT
                ================================================== */}

                <main className="p-6">

                    <Outlet />

                </main>

            </div>

        </div>

    );

};


export default MunicipalAdminLayout;
