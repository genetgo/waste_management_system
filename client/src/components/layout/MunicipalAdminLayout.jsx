import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

import {
    FaHome,
    FaUsers,
    FaBuilding,
    FaTruck,
    FaClipboardList,
    FaCalendarAlt,
    FaUserPlus,
    FaChartBar,
    FaBell,
    FaUser,
    FaCommentDots,
    FaSignOutAlt,
    FaBars,
    FaTimes
} from "react-icons/fa";

import useSocketNotification
    from "../../hooks/useSocketNotification";


const MunicipalAdminLayout = () => {

    const navigate = useNavigate();
    const location = useLocation();


    // ==========================================
    // SIDEBAR STATE
    // false = closed
    // true  = open
    // ==========================================

    const [sidebarOpen, setSidebarOpen] =
        React.useState(false);


    // ==========================================
    // SOCKET NOTIFICATION
    // ==========================================

    useSocketNotification();


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
            label: "Residents",
            path: "/municipal-admin/residents",
            icon: <FaUsers />
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
            icon: <FaBell />
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

        // Close sidebar after navigation
        setSidebarOpen(false);

    };


    // ==========================================
    // LOGOUT
    // ==========================================

    const handleLogout = () => {

        localStorage.clear();

        navigate("/login");

    };


    // ==========================================
    // TOGGLE SIDEBAR
    // ==========================================

    const toggleSidebar = () => {

        setSidebarOpen(
            previous => !previous
        );

    };


    // ==========================================
    // CLOSE SIDEBAR
    // ==========================================

    const closeSidebar = () => {

        setSidebarOpen(false);

    };


    return (

        <div className="min-h-screen bg-gray-100">


            {/* ==================================================
                OVERLAY
                Appears whenever sidebar is open
            ================================================== */}

            {sidebarOpen && (

                <div
                    className="
                        fixed
                        inset-0
                        bg-black/50
                        z-40
                    "
                    onClick={closeSidebar}
                />

            )}


            {/* ==================================================
                SIDEBAR
            ================================================== */}

            <aside
                className={`
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

                    transition-transform
                    duration-300
                    ease-in-out

                    ${
                        sidebarOpen
                            ? "translate-x-0"
                            : "-translate-x-full"
                    }
                `}
            >


                {/* ==================================================
                    SIDEBAR HEADER
                ================================================== */}

                <div
                    className="
                        flex
                        items-center
                        justify-between

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


                    {/* ==================================================
                        CLOSE BUTTON
                    ================================================== */}

                    <button
                        onClick={closeSidebar}
                        className="
                            flex
                            items-center
                            justify-center

                            w-10
                            h-10

                            rounded-lg

                            text-xl

                            hover:bg-blue-600
                            transition
                        "
                        aria-label="Close sidebar"
                    >

                        <FaTimes />

                    </button>

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
                            location.pathname ===
                            item.path;


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

                                <span
                                    className="
                                        text-lg
                                        flex-shrink-0
                                    "
                                >

                                    {item.icon}

                                </span>


                                <span className="font-medium">

                                    {item.label}

                                </span>

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

                No lg:ml-72 because sidebar is hidden
                until ☰ is clicked.
            ================================================== */}

            <div className="min-h-screen">


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

                    <div
                        className="
                            flex
                            items-center
                            gap-4
                        "
                    >


                        {/* ==================================================
                            MENU BUTTON
                            Visible on BOTH desktop and mobile
                        ================================================== */}

                        <button
                            className="
                                flex

                                items-center
                                justify-center

                                w-10
                                h-10

                                rounded-lg

                                text-gray-700

                                hover:bg-gray-100

                                text-2xl

                                transition
                            "
                            onClick={toggleSidebar}
                            aria-label={
                                sidebarOpen
                                    ? "Close sidebar"
                                    : "Open sidebar"
                            }
                        >

                            {sidebarOpen
                                ? <FaTimes />
                                : <FaBars />
                            }

                        </button>


                        {/* ==================================================
                            TITLE
                        ================================================== */}

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

                    </div>


                    {/* ==================================================
                        NOTIFICATION
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
                        "
                        aria-label="Notifications"
                    >

                        <FaBell />

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