import { Routes, Route } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import ROUTES from "../constants/routes";
import ROLES from "../constants/roles";

// ============================
// Public Pages
// ============================

import Home from "../pages/shared/Home";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ResidentRegister from "../pages/auth/ResidentRegister";
import BusinessRegister from "../pages/auth/BusinessRegister";

import Logout from "../pages/shared/Logout";
import Unauthorized from "../pages/shared/Unauthorized";
import NotFound from "../pages/shared/NotFound";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";
// ============================
// Shared
// ============================

import Notifications from "../pages/shared/Notifications";

// ============================
// Resident
// ============================

import ResidentDashboard from "../pages/resident/Dashboard";
import ResidentSchedule from "../pages/resident/Schedule";
import ResidentFeedback from "../pages/resident/Feedback";
import ResidentProfile from "../pages/resident/Profile";

// ============================
// Business Owner
// ============================

import BusinessDashboard from "../pages/business/Dashboard";
import BusinessSchedule from "../pages/business/Schedule";
import OnDemandRequest from "../pages/business/OnDemandRequest";
import BusinessFeedback from "../pages/business/Feedback";
import BusinessProfile from "../pages/business/Profile";
import MyRequests from "../pages/business/MyRequests";

// ============================
// Collector
// ============================

import CollectorDashboard from "../pages/collector/Dashboard";
import AssignedCollections from "../pages/collector/AssignedCollections";
import UpdateStatus from "../pages/collector/UpdateStatus";
import CollectorProfile from "../pages/collector/Profile";

// ============================
// Municipal Admin
// ============================

import MunicipalAdminLayout
    from "../components/layout/MunicipalAdminLayout";

import AdminHome
    from "../pages/municipal-admin/AdminHome";

import MunicipalDashboard
    from "../pages/municipal-admin/Dashboard";

import Residents
    from "../pages/municipal-admin/Residents";

import BusinessOwners
    from "../pages/municipal-admin/BusinessOwners";

import Collectors
    from "../pages/municipal-admin/Collectors";

import Requests
    from "../pages/municipal-admin/Requests";

import Schedules
    from "../pages/municipal-admin/Schedules";

import AssignCollector
    from "../pages/municipal-admin/AssignCollector";

import Reports
    from "../pages/municipal-admin/Reports";

import MunicipalProfile
    from "../pages/municipal-admin/Profile";

import MunicipalFeedback
    from "../pages/municipal-admin/Feedback";

// ============================
// System Admin
// ============================
import SystemAdminLayout
    from "../components/layout/SystemAdminLayout";
import SystemDashboard
    from "../pages/system-admin/Dashboard";
    import SystemRequests
    from "../pages/system-admin/Requests";

import Users
    from "../pages/system-admin/Users";

import Roles
    from "../pages/system-admin/Roles";

import StaffAccounts
    from "../pages/system-admin/StaffAccounts";

import Backup
    from "../pages/system-admin/Backup";

import SystemProfile
    from "../pages/system-admin/Profile";

import SystemAdminHome
    from "../pages/system-admin/SystemAdminHome";


export default function AppRoutes() {

    return (

        <Routes>

            {/* ==================================================
                PUBLIC
            ================================================== */}

            <Route
                path={ROUTES.HOME}
                element={<Home />}
            />

            <Route
                path={ROUTES.LOGIN}
                element={<Login />}
            />

            <Route
                path={ROUTES.REGISTER}
                element={<Register />}
            />

            <Route
                path={ROUTES.RESIDENT_REGISTER}
                element={<ResidentRegister />}
            />

            <Route
                path={ROUTES.BUSINESS_REGISTER}
                element={<BusinessRegister />}
            />

            <Route
                path={ROUTES.LOGOUT}
                element={<Logout />}
            />

            <Route
                path={ROUTES.UNAUTHORIZED}
                element={<Unauthorized />}
            />
<Route
    path="/forgot-password"
    element={<ForgotPassword />}
/>

<Route
    path="/reset-password"
    element={<ResetPassword />}
/>

            {/* ==================================================
                RESIDENT
            ================================================== */}

            <Route
                element={
                    <ProtectedRoute
                        allowedRoles={[ROLES.RESIDENT]}
                    />
                }
            >

                <Route
                    path={ROUTES.RESIDENT_DASHBOARD}
                    element={<ResidentDashboard />}
                />

                <Route
                    path={ROUTES.RESIDENT_SCHEDULE}
                    element={<ResidentSchedule />}
                />

                <Route
                    path={ROUTES.RESIDENT_FEEDBACK}
                    element={<ResidentFeedback />}
                />

                <Route
                    path={ROUTES.RESIDENT_NOTIFICATIONS}
                    element={<Notifications />}
                />

                <Route
                    path={ROUTES.RESIDENT_PROFILE}
                    element={<ResidentProfile />}
                />

            </Route>


            {/* ==================================================
                BUSINESS OWNER
            ================================================== */}

            <Route
                element={
                    <ProtectedRoute
                        allowedRoles={[ROLES.BUSINESS_OWNER]}
                    />
                }
            >

                <Route
                    path={ROUTES.BUSINESS_DASHBOARD}
                    element={<BusinessDashboard />}
                />

                <Route
                    path={ROUTES.BUSINESS_SCHEDULE}
                    element={<BusinessSchedule />}
                />

                <Route
                    path={ROUTES.BUSINESS_ON_DEMAND}
                    element={<OnDemandRequest />}
                />

                <Route
                    path={ROUTES.BUSINESS_FEEDBACK}
                    element={<BusinessFeedback />}
                />

                <Route
                    path={ROUTES.BUSINESS_NOTIFICATIONS}
                    element={<Notifications />}
                />

                <Route
                    path={ROUTES.BUSINESS_PROFILE}
                    element={<BusinessProfile />}
                />

                <Route
                    path="/business/my-requests"
                    element={<MyRequests />}
                />

            </Route>


            {/* ==================================================
                COLLECTOR
            ================================================== */}

            <Route
                element={
                    <ProtectedRoute
                        allowedRoles={[ROLES.COLLECTOR]}
                    />
                }
            >

                <Route
                    path={ROUTES.COLLECTOR_DASHBOARD}
                    element={<CollectorDashboard />}
                />

                <Route
                    path={ROUTES.COLLECTOR_ASSIGNED_TASKS}
                    element={<AssignedCollections />}
                />

                <Route
                    path={ROUTES.COLLECTOR_UPDATE_STATUS}
                    element={<UpdateStatus />}
                />

                <Route
                    path={ROUTES.COLLECTOR_NOTIFICATIONS}
                    element={<Notifications />}
                />

                <Route
                    path={ROUTES.COLLECTOR_PROFILE}
                    element={<CollectorProfile />}
                />

            </Route>


            {/* ==================================================
                MUNICIPAL ADMIN
            ================================================== */}

            <Route
                element={
                    <ProtectedRoute
                        allowedRoles={[
                            ROLES.MUNICIPAL_ADMIN
                        ]}
                    />
                }
            >

                {/* MUNICIPAL ADMIN LAYOUT */}

                <Route
                    element={
                        <MunicipalAdminLayout />
                    }
                >

                    {/* HOME */}

                    <Route
                        path="/municipal-admin/home"
                        element={<AdminHome />}
                    />


                    {/* DASHBOARD */}

                    <Route
                        path="/municipal-admin/dashboard"
                        element={
                            <MunicipalDashboard />
                        }
                    />


                    {/* RESIDENTS */}

                    <Route
                        path="/municipal-admin/residents"
                        element={<Residents />}
                    />


                    {/* BUSINESS OWNERS */}

                    <Route
                        path="/municipal-admin/business-owners"
                        element={
                            <BusinessOwners />
                        }
                    />


                    {/* COLLECTORS */}

                    <Route
                        path="/municipal-admin/collectors"
                        element={
                            <Collectors />
                        }
                    />


                    {/* REQUESTS */}

                    <Route
                        path="/municipal-admin/requests"
                        element={
                            <Requests />
                        }
                    />


                    {/* SCHEDULES */}

                    <Route
                        path="/municipal-admin/schedules"
                        element={
                            <Schedules />
                        }
                    />


                    {/* ASSIGN COLLECTOR */}

                  
<Route
    path="/municipal-admin/assign-collector/:id"
    element={<AssignCollector />}

/>

                    {/* REPORTS */}

                    <Route
                        path="/municipal-admin/reports"
                        element={
                            <Reports />
                        }
                    />


                    {/* NOTIFICATIONS */}

                    <Route
                        path="/municipal-admin/notifications"
                        element={
                            <Notifications />
                        }
                    />


                    {/* PROFILE */}

                    <Route
                        path="/municipal-admin/profile"
                        element={
                            <MunicipalProfile />
                        }
                    />


                    {/* FEEDBACK */}

                    <Route
                        path="/municipal-admin/feedback"
                        element={
                            <MunicipalFeedback />
                        }
                    />

                </Route>

            </Route>


            {/* ==================================================
    SYSTEM ADMIN
================================================== */}

<Route
    element={
        <ProtectedRoute
            allowedRoles={[
                ROLES.SYSTEM_ADMIN
            ]}
        />
    }
>

    {/* SYSTEM ADMIN LAYOUT */}

    <Route
        element={
            <SystemAdminLayout />
        }
    >

        {/* HOME */}
        <Route
            path="/system-admin/home"
            element={
                <SystemAdminHome />
            }
        />

        {/* SYSTEM ADMIN ROOT */}
        <Route
            path="/system-admin"
            element={
                <SystemAdminHome />
            }
        />

        {/* DASHBOARD */}
        <Route
            path={ROUTES.SYSTEM_DASHBOARD}
            element={
                <SystemDashboard />
            }
        />

        {/* USERS */}
        <Route
            path={ROUTES.SYSTEM_USERS}
            element={
                <Users />
            }
        />

        {/* REQUESTS */}
        <Route
            path={ROUTES.SYSTEM_REQUESTS}
            element={
                <SystemRequests />
            }
        />

        {/* ROLES */}
        <Route
            path={ROUTES.SYSTEM_ROLES}
            element={
                <Roles />
            }
        />

        {/* STAFF */}
        <Route
            path={ROUTES.SYSTEM_STAFF}
            element={
                <StaffAccounts />
            }
        />

        {/* BACKUP */}
        <Route
            path={ROUTES.SYSTEM_BACKUP}
            element={
                <Backup />
            }
        />

        {/* PROFILE */}
        <Route
            path={ROUTES.SYSTEM_PROFILE}
            element={
                <SystemProfile />
            }
        />

    </Route>

</Route>


            {/* ==================================================
                404
            ================================================== */}

            <Route
                path="*"
                element={<NotFound />}
            />

        </Routes>
    );
}