
import { Routes, Route } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import ROUTES from "../constants/routes";
import ROLES from "../constants/roles";

// ==================================================
// PUBLIC PAGES
// ==================================================

import Home from "../pages/shared/Home";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import BusinessRegister from "../pages/auth/BusinessRegister";

import Logout from "../pages/shared/Logout";
import Unauthorized from "../pages/shared/Unauthorized";
import NotFound from "../pages/shared/NotFound";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";

// ==================================================
// SHARED
// ==================================================

import Notifications from "../pages/shared/Notifications";
import Schedule from "../pages/shared/Schedule";
import Feedback from "../pages/shared/Feedback";
// ==================================================
// BUSINESS OWNER
// ==================================================

import BusinessDashboard from "../pages/business/Dashboard";
import BusinessSchedule from "../pages/business/Schedule";
import OnDemandRequest from "../pages/business/OnDemandRequest";
import BusinessFeedback from "../pages/business/Feedback";
import BusinessProfile from "../pages/business/Profile";
import MyRequests from "../pages/business/MyRequests";

// ==================================================
// COLLECTOR
// ==================================================

import CollectorDashboard from "../pages/collector/Dashboard";
import AssignedCollections from "../pages/collector/AssignedCollections";
import UpdateStatus from "../pages/collector/UpdateStatus";
import CollectorProfile from "../pages/collector/Profile";

// ==================================================
// MUNICIPAL ADMIN
// ==================================================

import MunicipalAdminLayout from "../components/layout/MunicipalAdminLayout";

import AdminHome from "../pages/municipal-admin/AdminHome";
import MunicipalDashboard from "../pages/municipal-admin/Dashboard";
import BusinessOwners from "../pages/municipal-admin/BusinessOwners";
import Collectors from "../pages/municipal-admin/Collectors";
import CollectionTeams from "../pages/municipal-admin/CollectionTeams";
import Requests from "../pages/municipal-admin/Requests";
import Schedules from "../pages/municipal-admin/Schedules";
import AssignCollector from "../pages/municipal-admin/AssignCollector";
import Reports from "../pages/municipal-admin/Reports";
import MunicipalProfile from "../pages/municipal-admin/Profile";
import MunicipalFeedback from "../pages/municipal-admin/Feedback";

// ==================================================
// SYSTEM ADMIN
// ==================================================

import SystemAdminLayout from "../components/layout/SystemAdminLayout";
import SystemDashboard from "../pages/system-admin/Dashboard";
import SystemRequests from "../pages/system-admin/Requests";
import Users from "../pages/system-admin/Users";
import Roles from "../pages/system-admin/Roles";
import StaffAccounts from "../pages/system-admin/StaffAccounts";
import Backup from "../pages/system-admin/Backup";
import SystemProfile from "../pages/system-admin/Profile";
import SystemAdminHome from "../pages/system-admin/SystemAdminHome";

// ==================================================
// APP ROUTES
// ==================================================

export default function AppRoutes() {
    return (
        <Routes>

            {/* ==================================================
                PUBLIC
            ================================================== */}

            {/* HOME */}
            <Route
                path={ROUTES.HOME}
                element={<Home />}
            />

            {/* LOGIN */}
            <Route
                path={ROUTES.LOGIN}
                element={<Login />}
            />

            {/* GENERAL REGISTER */}
            <Route
                path={ROUTES.REGISTER}
                element={<Register />}
            />

            {/* BUSINESS OWNER REGISTER */}
            <Route
                path={ROUTES.BUSINESS_REGISTER}
                element={<BusinessRegister />}
            />

           
{/* PUBLIC SCHEDULE */}
<Route
    path="/schedule"
    element={<Schedule />}
/>

{/* PUBLIC FEEDBACK */}
<Route
    path="/feedback"
    element={<Feedback />}
/>
            {/* LOGOUT */}
            <Route
                path={ROUTES.LOGOUT}
                element={<Logout />}
            />

            {/* UNAUTHORIZED */}
            <Route
                path={ROUTES.UNAUTHORIZED}
                element={<Unauthorized />}
            />

            {/* FORGOT PASSWORD */}
            <Route
                path="/forgot-password"
                element={<ForgotPassword />}
            />

            {/* RESET PASSWORD */}
            <Route
                path="/reset-password"
                element={<ResetPassword />}
            />


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

                {/* BUSINESS DASHBOARD */}
                <Route
                    path={ROUTES.BUSINESS_DASHBOARD}
                    element={<BusinessDashboard />}
                />

                {/* BUSINESS SCHEDULE */}
                <Route
                    path={ROUTES.BUSINESS_SCHEDULE}
                    element={<BusinessSchedule />}
                />

                {/* ON-DEMAND REQUEST */}
                <Route
                    path={ROUTES.BUSINESS_ON_DEMAND}
                    element={<OnDemandRequest />}
                />

                {/* BUSINESS FEEDBACK */}
                <Route
                    path={ROUTES.BUSINESS_FEEDBACK}
                    element={<BusinessFeedback />}
                />

                {/* NOTIFICATIONS */}
                <Route
                    path={ROUTES.BUSINESS_NOTIFICATIONS}
                    element={<Notifications />}
                />

                {/* BUSINESS PROFILE */}
                <Route
                    path={ROUTES.BUSINESS_PROFILE}
                    element={<BusinessProfile />}
                />

                {/* MY REQUESTS */}
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

                {/* COLLECTOR DASHBOARD */}
                <Route
                    path={ROUTES.COLLECTOR_DASHBOARD}
                    element={<CollectorDashboard />}
                />

                {/* ASSIGNED COLLECTIONS */}
                <Route
                    path={ROUTES.COLLECTOR_ASSIGNED_TASKS}
                    element={<AssignedCollections />}
                />

                {/* UPDATE STATUS */}
                <Route
                    path={ROUTES.COLLECTOR_UPDATE_STATUS}
                    element={<UpdateStatus />}
                />

                {/* NOTIFICATIONS */}
                <Route
                    path={ROUTES.COLLECTOR_NOTIFICATIONS}
                    element={<Notifications />}
                />

                {/* COLLECTOR PROFILE */}
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
                        element={<MunicipalDashboard />}
                    />

                    {/* BUSINESS OWNERS */}
                    <Route
                        path="/municipal-admin/business-owners"
                        element={<BusinessOwners />}
                    />

                    {/* COLLECTORS */}
                    <Route
                        path="/municipal-admin/collectors"
                        element={<Collectors />}
                    />
               {/* COLLECTION TEAMS */}
<Route
    path="/municipal-admin/collection-teams"
    element={<CollectionTeams />}
/>
                    {/* REQUESTS */}
                    <Route
                        path="/municipal-admin/requests"
                        element={<Requests />}
                    />

                    {/* SCHEDULES */}
                    <Route
                        path="/municipal-admin/schedules"
                        element={<Schedules />}
                    />

                    {/* ASSIGN COLLECTOR */}
                    <Route
                        path="/municipal-admin/assign-collector/:id"
                        element={<AssignCollector />}
                    />

                    {/* REPORTS */}
                    <Route
                        path="/municipal-admin/reports"
                        element={<Reports />}
                    />

                    {/* NOTIFICATIONS */}
                    <Route
                        path="/municipal-admin/notifications"
                        element={<Notifications />}
                    />

                    {/* PROFILE */}
                    <Route
                        path="/municipal-admin/profile"
                        element={<MunicipalProfile />}
                    />

                    {/* FEEDBACK */}
                    <Route
                        path="/municipal-admin/feedback"
                        element={<MunicipalFeedback />}
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

                    {/* SYSTEM ADMIN HOME */}
                    <Route
                        path="/system-admin/home"
                        element={<SystemAdminHome />}
                    />

                    {/* SYSTEM ADMIN ROOT */}
                    <Route
                        path="/system-admin"
                        element={<SystemAdminHome />}
                    />

                    {/* DASHBOARD */}
                    <Route
                        path={ROUTES.SYSTEM_DASHBOARD}
                        element={<SystemDashboard />}
                    />

                    {/* USERS */}
                    <Route
                        path={ROUTES.SYSTEM_USERS}
                        element={<Users />}
                    />

                    {/* REQUESTS */}
                    <Route
                        path={ROUTES.SYSTEM_REQUESTS}
                        element={<SystemRequests />}
                    />

                    {/* ROLES */}
                    <Route
                        path={ROUTES.SYSTEM_ROLES}
                        element={<Roles />}
                    />

                    {/* STAFF */}
                    <Route
                        path={ROUTES.SYSTEM_STAFF}
                        element={<StaffAccounts />}
                    />

                    {/* BACKUP */}
                    <Route
                        path={ROUTES.SYSTEM_BACKUP}
                        element={<Backup />}
                    />

                    {/* PROFILE */}
                    <Route
                        path={ROUTES.SYSTEM_PROFILE}
                        element={<SystemProfile />}
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
