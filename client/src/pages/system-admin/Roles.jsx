
import React, { useEffect, useState } from "react";
import API from "../../services/api";

import {
  FaSearch,
  FaEdit,
  FaTrash,
  FaKey,
  FaUsers,
  FaCheckCircle,
  FaTimesCircle,
  FaPlus,
  FaTimes,
  FaSave,
} from "react-icons/fa";

const Roles = () => {
  // =====================================================
  // STATE
  // =====================================================

  const [search, setSearch] = useState("");

  const [rolesList, setRolesList] = useState([]);
  const [permissionsMatrix, setPermissionsMatrix] = useState([]);
  const [availablePermissions, setAvailablePermissions] =
    useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // MODAL STATE
  // =====================================================

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);

  const [savingRole, setSavingRole] = useState(false);
  const [deletingRoleId, setDeletingRoleId] = useState(null);

  // =====================================================
  // ROLE FORM
  // =====================================================

  const [roleForm, setRoleForm] = useState({
    name: "",
    description: "",
    permissions: [],
  });

  // =====================================================
  // DEFAULT PERMISSIONS
  // =====================================================

  const defaultPermissions = [
    {
      permission_name: "VIEW",
      description: "View system information",
    },
    {
      permission_name: "CREATE",
      description: "Create new records",
    },
    {
      permission_name: "UPDATE",
      description: "Update existing records",
    },
    {
      permission_name: "DELETE",
      description: "Delete records",
    },
    {
      permission_name: "REPORTS",
      description: "Access system reports",
    },
  ];

  // =====================================================
  // LOAD ROLES
  // =====================================================

  const loadRoles = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("====================================");
      console.log("LOADING ROLES");
      console.log("====================================");

      const response = await API.get("/system-admin/roles");

      console.log("ROLES API RESPONSE:", response.data);

  

      const responseData = response.data || {};

      const data = responseData.data || responseData;

      const roles = Array.isArray(data.roles)
        ? data.roles
        : [];

      const permissions = Array.isArray(data.permissions)
        ? data.permissions
        : [];

      const allPermissions = Array.isArray(
        data.availablePermissions
      )
        ? data.availablePermissions
        : [];

      setRolesList(roles);
      setPermissionsMatrix(permissions);
      setAvailablePermissions(allPermissions);

      console.log("ROLES:", roles);
      console.log("PERMISSIONS MATRIX:", permissions);
      console.log(
        "AVAILABLE PERMISSIONS:",
        allPermissions
      );
    } catch (error) {
      console.error("LOAD ROLES ERROR:", error);

      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to load roles.";

      setError(message);

      setRolesList([]);
      setPermissionsMatrix([]);
      setAvailablePermissions([]);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadRoles();
  }, []);

  // =====================================================
  // GET ROLE ID
  // =====================================================

  const getRoleId = (role) => {
    return role?.role_id ?? role?.id ?? null;
  };

  // =====================================================
  // GET ROLE PERMISSIONS
  // =====================================================

  const getRolePermissions = (role) => {
    const roleName = String(role?.name || "")
      .toLowerCase()
      .trim();

    const found = permissionsMatrix.find((item) => {
      const itemName = String(
        item?.name ||
          item?.role_name ||
          item?.role ||
          ""
      )
        .toLowerCase()
        .trim();

      return itemName === roleName;
    });

    if (!found) {
      return {
        view: false,
        create: false,
        update: false,
        delete: false,
        reports: false,
      };
    }

    return {
      view:
        found.view === true ||
        found.VIEW === true ||
        found.view_permission === true,

      create:
        found.create === true ||
        found.CREATE === true ||
        found.create_permission === true,

      update:
        found.update === true ||
        found.UPDATE === true ||
        found.update_permission === true,

      delete:
        found.delete === true ||
        found.DELETE === true ||
        found.delete_permission === true,

      reports:
        found.reports === true ||
        found.REPORTS === true ||
        found.report === true ||
        found.reports_permission === true,
    };
  };

  // =====================================================
  // OPEN CREATE MODAL
  // =====================================================

  const openCreateModal = () => {
    setEditingRole(null);

    setRoleForm({
      name: "",
      description: "",
      permissions: [],
    });

    setShowRoleModal(true);
  };

  // =====================================================
  // OPEN EDIT MODAL
  // =====================================================

  const openEditModal = (role) => {
    const permissions = getRolePermissions(role);

    const selectedPermissions = [];

    if (permissions.view) {
      selectedPermissions.push("VIEW");
    }

    if (permissions.create) {
      selectedPermissions.push("CREATE");
    }

    if (permissions.update) {
      selectedPermissions.push("UPDATE");
    }

    if (permissions.delete) {
      selectedPermissions.push("DELETE");
    }

    if (permissions.reports) {
      selectedPermissions.push("REPORTS");
    }

    setEditingRole(role);

    setRoleForm({
      name: role?.name || "",
      description: role?.description || "",
      permissions: selectedPermissions,
    });

    setShowRoleModal(true);
  };




  
  // =====================================================
  // CLOSE MODAL
  // =====================================================

  const closeRoleModal = () => {
    if (savingRole) {
      return;
    }

    setShowRoleModal(false);
    setEditingRole(null);

    setRoleForm({
      name: "",
      description: "",
      permissions: [],
    });
  };

  // =====================================================
  // INPUT CHANGE
  // =====================================================

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setRoleForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================================
  // TOGGLE PERMISSION
  // =====================================================

  const togglePermission = (permissionName) => {
    setRoleForm((prev) => {
      const exists =
        prev.permissions.includes(permissionName);

      if (exists) {
        return {
          ...prev,
          permissions: prev.permissions.filter(
            (permission) =>
              permission !== permissionName
          ),
        };
      }

      return {
        ...prev,
        permissions: [
          ...prev.permissions,
          permissionName,
        ],
      };
    });
  };

  // =====================================================
  // SAVE ROLE
  // =====================================================

  

// =====================================================
// SAVE ROLE
// =====================================================
const handleSaveRole = async (e) => {
  e.preventDefault();

  const roleName = roleForm.name?.trim() || "";
  const description = roleForm.description?.trim() || "";

  if (!roleName) {
    alert("Role name is required.");
    return;
  }

  if (roleName.length < 2) {
    alert("Role name must contain at least 2 characters.");
    return;
  }

  try {
    setSavingRole(true);

    // =================================================
    // EXACT SELECTED PERMISSIONS
    // Example: ["VIEW", "CREATE", "UPDATE"]
    // =================================================
    const selectedPermissions = Array.isArray(
      roleForm.permissions
    )
      ? roleForm.permissions
      : [];

    const payload = {
      role_name: roleName,
      description,

      // CREATE uses this
      permissions: selectedPermissions,

      // UPDATE uses this
      permissionIds: selectedPermissions,
    };

    console.log("====================================");
    console.log(
      editingRole ? "UPDATING ROLE" : "CREATING ROLE"
    );
    console.log("====================================");

    console.log("SELECTED PERMISSIONS:", selectedPermissions);
    console.log("PERMISSION COUNT:", selectedPermissions.length);
    console.log("ROLE PAYLOAD:", payload);

    // =================================================
    // CREATE
    // =================================================
    if (!editingRole) {
      const response = await API.post(
        "/system-admin/roles",
        payload
      );

      console.log(
        "CREATE ROLE RESPONSE:",
        response.data
      );

      alert("Role created successfully.");
    }

    // =================================================
    // UPDATE
    // =================================================
    else {
      const roleId = getRoleId(editingRole);

      if (!roleId) {
        throw new Error("Role ID is missing.");
      }

      const response = await API.put(
        `/system-admin/roles/${roleId}`,
        payload
      );

      console.log(
        "UPDATE ROLE RESPONSE:",
        response.data
      );

      alert("Role updated successfully.");
    }

    // =================================================
    // CLOSE MODAL
    // =================================================
    setShowRoleModal(false);
    setEditingRole(null);

    setRoleForm({
      name: "",
      description: "",
      permissions: [],
    });

    // =================================================
    // IMPORTANT:
    // use loadRoles(), NOT fetchRoles()
    // =================================================
    await loadRoles();

  } catch (error) {
    console.error(
      "SAVE ROLE ERROR:",
      error
    );

    console.error(
      "SERVER RESPONSE:",
      error.response?.data
    );

    alert(
      error.response?.data?.message ||
      error.message ||
      "Failed to save role."
    );

  } finally {
    setSavingRole(false);
  }
};
  // =====================================================
  // DELETE ROLE
  // =====================================================

  const handleDeleteRole = async (role) => {
    const roleId = getRoleId(role);

    const roleName = role?.name || "";

    if (!roleId) {
      alert("Role ID is missing.");
      return;
    }

    // =================================================
    // PROTECTED SYSTEM ROLES
    // =================================================

    const protectedRoles = [
      "System Admin",
      "Municipal Admin",
      "Collector",
      "Business Owner",
      "Resident",
    ];

    const isProtectedRole =
      protectedRoles.some(
        (item) =>
          item.toLowerCase() ===
          roleName.toLowerCase()
      );

    if (isProtectedRole) {
      alert(
        `${roleName} is a default system role and cannot be deleted.`
      );

      return;
    }

    // =================================================
    // USERS CHECK
    // =================================================

    if (Number(role?.users || 0) > 0) {
      alert(
        `Cannot delete ${roleName}. This role is assigned to ${role.users} user(s).`
      );

      return;
    }

    // =================================================
    // CONFIRM
    // =================================================

    const confirmed = window.confirm(
      `Are you sure you want to delete "${roleName}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingRoleId(roleId);

      const response = await API.delete(
        `/system-admin/roles/${roleId}`
      );

      console.log(
        "DELETE ROLE RESPONSE:",
        response.data
      );

      alert(
        "Role deleted successfully."
      );

      await loadRoles();
    } catch (error) {
      console.error(
        "DELETE ROLE ERROR:",
        error
      );

      alert(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete role."
      );
    } finally {
      setDeletingRoleId(null);
    }
  };

  // =====================================================
  // RENDER PERMISSION
  // =====================================================

  const renderPermission = (value) => {
    if (value === true) {
      return (
        <span className="text-green-600 text-xl font-bold">
          ✓
        </span>
      );
    }

    return (
      <span className="text-red-500 text-xl font-bold">
        ✕
      </span>
    );
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />

          <h2 className="text-xl font-bold text-gray-700 mt-4">
            Loading Roles & Permissions...
          </h2>

          <p className="text-sm text-gray-500 mt-2">
            Loading data from database
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow border p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800">
            Failed to Load Roles
          </h2>

          <p className="text-red-600 mt-2">
            {error}
          </p>

          <button
            type="button"
            onClick={loadRoles}
            className="
              mt-4
              px-4
              py-2
              bg-red-600
              hover:bg-red-700
              text-white
              rounded-lg
            "
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // =====================================================
  // STATISTICS
  // =====================================================

  const totalRoles = rolesList.length;

  const totalAssignedUsers =
    rolesList.reduce(
      (sum, role) =>
        sum + Number(role?.users || 0),
      0
    );

  const totalPermissionsCount =
    rolesList.reduce(
      (sum, role) =>
        sum + Number(role?.permissions || 0),
      0
    );

  const activeRolesCount =
    rolesList.filter(
      (role) =>
        String(role?.status || "")
          .toLowerCase() === "active" ||
        role?.is_active === true
    ).length;

  // =====================================================
  // ROLE CATEGORY COUNTS
  // =====================================================

  const adminRolesCount =
    rolesList.filter((role) => {
      const name = String(
        role?.name || ""
      )
        .toLowerCase()
        .trim();

      return (
        name === "system admin" ||
        name === "municipal admin"
      );
    }).length;

  const operationalRolesCount =
    rolesList.filter((role) => {
      const name = String(
        role?.name || ""
      )
        .toLowerCase()
        .trim();

      return (
        name === "collector" ||
        name === "business owner"
      );
    }).length;

  const citizenRolesCount =
    rolesList.filter(
      (role) =>
        String(role?.name || "")
          .toLowerCase()
          .trim() === "resident"
    ).length;

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredRoles =
    rolesList.filter((role) =>
      String(role?.name || "")
        .toLowerCase()
        .includes(
          search.toLowerCase().trim()
        )
    );

  // =====================================================
  // AVAILABLE PERMISSIONS
  // =====================================================

  const permissionsToShow =
    availablePermissions.length > 0
      ? availablePermissions
      : defaultPermissions;

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="space-y-8">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Roles & Permissions
          </h1>

          <p className="mt-2 text-gray-500">
            Manage system roles and permissions
            for all users.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="
            flex
            w-fit
            self-start
            items-center
            justify-center
            gap-2
            bg-green-600
            hover:bg-blue-700
            text-white
            px-5
            py-3
            rounded-xl
            font-semibold
            transition
          "
        >
          <FaPlus />
          New Role
        </button>

      </div>

      {/* =================================================
          STATISTICS
      ================================================= */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

        <div className="bg-white rounded-2xl shadow border p-6">
          <p className="text-gray-500 text-sm">
            Total Roles
          </p>

          <h2 className="text-4xl font-bold text-indigo-700 mt-2">
            {totalRoles}
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow border p-6">
          <p className="text-gray-500 text-sm">
            Total Permissions
          </p>

          <h2 className="text-4xl font-bold text-green-600 mt-2">
            {totalPermissionsCount}
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow border p-6">
          <p className="text-gray-500 text-sm">
            Assigned Users
          </p>

          <h2 className="text-4xl font-bold text-blue-600 mt-2">
            {totalAssignedUsers}
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow border p-6">
          <p className="text-gray-500 text-sm">
            Active Roles
          </p>

          <h2 className="text-4xl font-bold text-purple-600 mt-2">
            {activeRolesCount}
          </h2>
        </div>

      </div>

      {/* =================================================
          SEARCH
      ================================================= */}

      <div className="bg-white rounded-2xl shadow border p-6">

        <div className="relative">

          <FaSearch
            className="
              absolute
              left-4
              top-4
              text-gray-400
            "
          />

          <input
            type="text"
            placeholder="Search role..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="
              w-full
              pl-12
              pr-4
              py-3
              border
              rounded-xl
              outline-none
              focus:ring-2
              focus:ring-indigo-500
            "
          />

        </div>

      </div>

      {/* =================================================
          ROLES TABLE
      ================================================= */}

      <div className="bg-white rounded-2xl shadow border overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="bg-gray-100">

              <tr>

                <th className="p-4 text-left">
                  Role
                </th>

                <th className="p-4 text-left">
                  Permissions
                </th>

                <th className="p-4 text-left">
                  Users
                </th>

                <th className="p-4 text-left">
                  Status
                </th>

                <th className="p-4 text-center">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredRoles.map((role) => {

                const roleId =
                  getRoleId(role);

                return (
                  <tr
                    key={
                      roleId ||
                      role.name
                    }
                    className="
                      border-t
                      hover:bg-gray-50
                      transition
                    "
                  >

                    <td className="p-4">

                      <h3 className="font-bold text-gray-800">
                        {role.name || "Unnamed Role"}
                      </h3>

                      <p className="text-sm text-gray-500 mt-1">
                        {role.description ||
                          "No description"}
                      </p>

                    </td>

                    <td className="p-4">

                      <span
                        className="
                          inline-flex
                          items-center
                          gap-2
                          px-3
                          py-1
                          rounded-full
                          bg-indigo-100
                          text-indigo-700
                          font-semibold
                        "
                      >

                        <FaKey />

                        {Number(
                          role.permissions || 0
                        )}

                        {" "}
                        Permissions

                      </span>

                    </td>

                    <td className="p-4">

                      <span
                        className="
                          inline-flex
                          items-center
                          gap-2
                          px-3
                          py-1
                          rounded-full
                          bg-blue-100
                          text-blue-700
                          font-semibold
                        "
                      >

                        <FaUsers />

                        {Number(
                          role.users || 0
                        )}

                        {" "}
                        Users

                      </span>

                    </td>

                    <td className="p-4">

                      {(
                        String(
                          role.status || ""
                        ).toLowerCase() ===
                          "active" ||
                        role.is_active === true
                      ) ? (

                        <span
                          className="
                            inline-flex
                            items-center
                            gap-2
                            px-3
                            py-1
                            rounded-full
                            bg-green-100
                            text-green-700
                            font-semibold
                          "
                        >

                          <FaCheckCircle />

                          Active

                        </span>

                      ) : (

                        <span
                          className="
                            inline-flex
                            items-center
                            gap-2
                            px-3
                            py-1
                            rounded-full
                            bg-red-100
                            text-red-700
                            font-semibold
                          "
                        >

                          <FaTimesCircle />

                          Inactive

                        </span>

                      )}

                    </td>

                    <td className="p-4">

                      <div className="flex justify-center gap-2">

                        {/* EDIT */}

                        <button
                          type="button"
                          onClick={() =>
                            openEditModal(role)
                          }
                          className="
                            p-2
                            bg-blue-100
                            text-blue-700
                            rounded-lg
                            hover:bg-blue-600
                            hover:text-white
                            transition
                          "
                          title="Edit Role"
                        >
                          <FaEdit />
                        </button>

                        {/* DELETE */}

                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteRole(
                              role
                            )
                          }
                          disabled={
                            deletingRoleId ===
                            roleId
                          }
                          className="
                            p-2
                            bg-red-100
                            text-red-700
                            rounded-lg
                            hover:bg-red-600
                            hover:text-white
                            transition
                            disabled:opacity-50
                            disabled:cursor-not-allowed
                          "
                          title="Delete Role"
                        >

                          {deletingRoleId ===
                          roleId ? (
                            <span className="text-xs">
                              ...
                            </span>
                          ) : (
                            <FaTrash />
                          )}

                        </button>

                      </div>

                    </td>

                  </tr>
                );
              })}

              {filteredRoles.length === 0 && (
                <tr>

                  <td
                    colSpan="5"
                    className="
                      p-8
                      text-center
                      text-gray-500
                      font-medium
                    "
                  >
                    No roles found.
                  </td>

                </tr>
              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* =================================================
          ROLE SUMMARY
      ================================================= */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div
          className="
            bg-gradient-to-r
            from-blue-500
            to-indigo-600
            text-white
            rounded-2xl
            p-6
            shadow-lg
          "
        >

          <h2 className="text-lg font-bold">
            Administrator Roles
          </h2>

          <p className="text-4xl font-bold mt-3">
            {adminRolesCount}
          </p>

          <p className="text-blue-100 mt-2">
            System Admin & Municipal Admin
          </p>

        </div>

        <div
          className="
            bg-gradient-to-r
            from-green-500
            to-emerald-600
            text-white
            rounded-2xl
            p-6
            shadow-lg
          "
        >

          <h2 className="text-lg font-bold">
            Operational Roles
          </h2>

          <p className="text-4xl font-bold mt-3">
            {operationalRolesCount}
          </p>

          <p className="text-green-100 mt-2">
            Collector & Business Owner
          </p>

        </div>

        <div
          className="
            bg-gradient-to-r
            from-purple-500
            to-pink-600
            text-white
            rounded-2xl
            p-6
            shadow-lg
          "
        >

          <h2 className="text-lg font-bold">
            Citizen Roles
          </h2>

          <p className="text-4xl font-bold mt-3">
            {citizenRolesCount}
          </p>

          <p className="text-purple-100 mt-2">
            Resident Account
          </p>

        </div>

      </div>

      {/* =================================================
          PERMISSION MATRIX
      ================================================= */}

      <div className="bg-white rounded-2xl shadow border p-6">

        <div className="flex items-center justify-between mb-6">

          <h2 className="text-2xl font-bold text-gray-800">
            Permission Matrix
          </h2>

          <button
            type="button"
            onClick={openCreateModal}
            className="
              flex
              items-center
              gap-2
              bg-indigo-600
              hover:bg-indigo-700
              text-white
              px-5
              py-2
              rounded-xl
              font-semibold
              transition
            "
          >

            <FaKey />

            Assign Permissions

          </button>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="bg-gray-100">

              <tr>

                <th className="p-4 text-left">
                  Role
                </th>

                <th className="p-4 text-center">
                  View
                </th>

                <th className="p-4 text-center">
                  Create
                </th>

                <th className="p-4 text-center">
                  Update
                </th>

                <th className="p-4 text-center">
                  Delete
                </th>

                <th className="p-4 text-center">
                  Reports
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredRoles.map((role) => {

                const permissions =
                  getRolePermissions(role);

                return (
                  <tr
                    key={
                      getRoleId(role) ||
                      role.name
                    }
                    className="
                      border-t
                      hover:bg-gray-50
                    "
                  >

                    <td className="p-4 font-semibold">
                      {role.name}
                    </td>

                    <td className="p-4 text-center">
                      {renderPermission(
                        permissions.view
                      )}
                    </td>

                    <td className="p-4 text-center">
                      {renderPermission(
                        permissions.create
                      )}
                    </td>

                    <td className="p-4 text-center">
                      {renderPermission(
                        permissions.update
                      )}
                    </td>

                    <td className="p-4 text-center">
                      {renderPermission(
                        permissions.delete
                      )}
                    </td>

                    <td className="p-4 text-center">
                      {renderPermission(
                        permissions.reports
                      )}
                    </td>

                  </tr>
                );
              })}

              {filteredRoles.length === 0 && (
                <tr>

                  <td
                    colSpan="6"
                    className="
                      p-8
                      text-center
                      text-gray-500
                    "
                  >
                    No permission data found.
                  </td>

                </tr>
              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* =================================================
          FOOTER SUMMARY
      ================================================= */}

      <div
        className="
          bg-gradient-to-r
          from-indigo-700
          to-purple-700
          rounded-2xl
          p-8
          text-white
        "
      >

        <h2 className="text-2xl font-bold mb-3">
          Roles Management Summary
        </h2>

        <p className="text-indigo-100 leading-8">
          The System Administrator controls
          all user roles and permissions within
          the Waste Collection Management System.
          This module allows administrators to
          create new roles, assign permissions,
          edit existing privileges, and monitor
          user access across the platform.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">

          <div>
            <h3 className="text-4xl font-bold">
              {totalRoles}
            </h3>

            <p className="text-indigo-200">
              Total Roles
            </p>
          </div>

          <div>
            <h3 className="text-4xl font-bold">
              {totalPermissionsCount}
            </h3>

            <p className="text-indigo-200">
              Permissions
            </p>
          </div>

          <div>
            <h3 className="text-4xl font-bold">
              {totalAssignedUsers}
            </h3>

            <p className="text-indigo-200">
              Assigned Users
            </p>
          </div>

          <div>
            <h3 className="text-4xl font-bold">
              {totalRoles > 0
                ? "100%"
                : "0%"}
            </h3>

            <p className="text-indigo-200">
              System Security
            </p>
          </div>

        </div>

      </div>

      {/* =================================================
          CREATE / EDIT ROLE MODAL
      ================================================= */}

      {showRoleModal && (
        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/60
            backdrop-blur-sm
            p-4
          "
          onMouseDown={(e) => {
            if (
              e.target === e.currentTarget &&
              !savingRole
            ) {
              closeRoleModal();
            }
          }}
        >

          <div
            className="
              bg-white
              rounded-2xl
              shadow-2xl
              w-full
              max-w-xl
              max-h-[90vh]
              overflow-hidden
            "
          >

            {/* MODAL HEADER */}

            <div
              className="
                flex
                items-center
                justify-between
                p-6
                border-b
                bg-gray-50
              "
            >

              <div>

                <h2 className="text-2xl font-bold text-gray-800">

                  {editingRole
                    ? "Edit Role"
                    : "Create New Role"}

                </h2>

                <p className="text-sm text-gray-500 mt-1">

                  {editingRole
                    ? "Update role information and permissions."
                    : "Create a new role and assign permissions."}

                </p>

              </div>

              <button
                type="button"
                onClick={closeRoleModal}
                disabled={savingRole}
                className="
                  w-10
                  h-10
                  flex
                  items-center
                  justify-center
                  rounded-full
                  text-gray-500
                  hover:bg-red-100
                  hover:text-red-600
                  transition
                  disabled:opacity-50
                "
              >

                <FaTimes />

              </button>

            </div>

            {/* MODAL BODY */}

            <form
              onSubmit={handleSaveRole}
              className="
                p-6
                space-y-6
                overflow-y-auto
                max-h-[calc(90vh-100px)]
              "
            >

              {/* ROLE NAME */}

              <div>

                <label
                  htmlFor="role-name"
                  className="
                    block
                    text-sm
                    font-semibold
                    text-gray-700
                    mb-2
                  "
                >
                  Role Name
                </label>

                <input
                  id="role-name"
                  type="text"
                  name="name"
                  value={roleForm.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Supervisor"
                  disabled={savingRole}
                  className="
                    w-full
                    px-4
                    py-3
                    border
                    border-gray-300
                    rounded-xl
                    outline-none
                    transition
                    focus:ring-2
                    focus:ring-indigo-500
                    focus:border-indigo-500
                    disabled:bg-gray-100
                  "
                  required
                />

              </div>

              {/* DESCRIPTION */}

              <div>

                <label
                  htmlFor="role-description"
                  className="
                    block
                    text-sm
                    font-semibold
                    text-gray-700
                    mb-2
                  "
                >
                  Description
                </label>

                <textarea
                  id="role-description"
                  name="description"
                  value={
                    roleForm.description
                  }
                  onChange={
                    handleInputChange
                  }
                  rows={4}
                  placeholder="Describe the responsibilities of this role..."
                  disabled={savingRole}
                  className="
                    w-full
                    px-4
                    py-3
                    border
                    border-gray-300
                    rounded-xl
                    outline-none
                    resize-none
                    transition
                    focus:ring-2
                    focus:ring-indigo-500
                    focus:border-indigo-500
                    disabled:bg-gray-100
                  "
                />

              </div>

              {/* PERMISSIONS */}

              <div>

                <div className="flex items-center justify-between mb-3">

                  <label
                    className="
                      block
                      text-sm
                      font-semibold
                      text-gray-700
                    "
                  >
                    Permissions
                  </label>

                  <span
                    className="
                      text-xs
                      font-medium
                      text-indigo-600
                    "
                  >
                    {
                      roleForm.permissions.length
                    }{" "}
                    selected
                  </span>

                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                  {permissionsToShow.map(
                    (permission) => {

                      const permissionName =
                        typeof permission ===
                        "string"
                          ? permission
                          : permission?.permission_name ||
                            permission?.name ||
                            "";

                      const description =
                        typeof permission ===
                        "string"
                          ? ""
                          : permission?.description ||
                            "";

                      if (!permissionName) {
                        return null;
                      }

                      const checked =
                        roleForm.permissions.includes(
                          permissionName
                        );

                      return (
                        <label
                          key={permissionName}
                          className={`
                            flex
                            items-start
                            gap-3
                            p-4
                            border
                            rounded-xl
                            cursor-pointer
                            transition
                            ${
                              checked
                                ? "border-indigo-500 bg-indigo-50"
                                : "border-gray-300 hover:bg-gray-50"
                            }
                            ${
                              savingRole
                                ? "opacity-60 cursor-not-allowed"
                                : ""
                            }
                          `}
                        >

                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={
                              savingRole
                            }
                            onChange={() =>
                              togglePermission(
                                permissionName
                              )
                            }
                            className="
                              mt-1
                              w-4
                              h-4
                              text-indigo-600
                              rounded
                              focus:ring-indigo-500
                            "
                          />

                          <div>

                            <div
                              className="
                                font-semibold
                                text-gray-800
                              "
                            >
                              {permissionName}
                            </div>

                            {description && (
                              <p
                                className="
                                  text-xs
                                  text-gray-500
                                  mt-1
                                "
                              >
                                {description}
                              </p>
                            )}

                          </div>

                        </label>
                      );
                    }
                  )}

                </div>

                {roleForm.permissions.length ===
                  0 && (
                  <p
                    className="
                      text-xs
                      text-gray-500
                      mt-3
                    "
                  >
                    Select at least one
                    permission for this role.
                  </p>
                )}

              </div>

              {/* FORM BUTTONS */}

              <div
                className="
                  flex
                  justify-end
                  gap-3
                  pt-5
                  border-t
                "
              >

                <button
                  type="button"
                  onClick={closeRoleModal}
                  disabled={savingRole}
                  className="
                    px-5
                    py-3
                    border
                    border-gray-300
                    rounded-xl
                    font-semibold
                    text-gray-700
                    hover:bg-gray-100
                    transition
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                  "
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={savingRole}
                  className="
                    flex
                    items-center
                    gap-2
                    px-5
                    py-3
                    bg-indigo-600
                    hover:bg-indigo-700
                    text-white
                    rounded-xl
                    font-semibold
                    transition
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                  "
                >

                  {savingRole ? (
                    <>
                      <span
                        className="
                          inline-block
                          w-4
                          h-4
                          border-2
                          border-white
                          border-t-transparent
                          rounded-full
                          animate-spin
                        "
                      />

                      Saving...
                    </>
                  ) : (
                    <>
                      <FaSave />

                      {editingRole
                        ? "Update Role"
                        : "Create Role"}
                    </>
                  )}

                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
};

export default Roles;
