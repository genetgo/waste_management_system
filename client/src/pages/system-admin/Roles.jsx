
import React, { useEffect, useMemo, useState } from "react";
import API from "../../services/api";

import {
  FaSearch,
  FaEdit,
  FaTrash,
  FaKey,
  FaUsers,
  FaPlus,
  FaTimes,
  FaSave,
} from "react-icons/fa";

// =====================================================
// DEFAULT PERMISSIONS
// OTHER IS NOT A REAL PERMISSION
// =====================================================

const DEFAULT_PERMISSIONS = [
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
];

const BUILT_IN_PERMISSIONS = [
  "VIEW",
  "CREATE",
  "UPDATE",
  "DELETE",
];

// =====================================================
// COMPONENT
// =====================================================

const Roles = () => {
  // =====================================================
  // STATE
  // =====================================================

  const [search, setSearch] = useState("");
  const [rolesList, setRolesList] = useState([]);
  const [permissionsMatrix, setPermissionsMatrix] = useState([]);

  const [availablePermissions, setAvailablePermissions] =
    useState(DEFAULT_PERMISSIONS);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // CREATE / EDIT ROLE
  // =====================================================

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [savingRole, setSavingRole] = useState(false);

  const [roleForm, setRoleForm] = useState({
    name: "",
    description: "",
    permissions: [],
  });

  // =====================================================
  // OTHER / CUSTOM PERMISSION
  // =====================================================

  const [otherSelected, setOtherSelected] = useState(false);

  const [customPermission, setCustomPermission] = useState({
    name: "",
    description: "",
  });

  // =====================================================
  // DELETE ROLE
  // =====================================================

  const [deletingRoleId, setDeletingRoleId] = useState(null);

  // =====================================================
  // HELPERS
  // =====================================================

  const normalize = (value) =>
    String(value || "")
      .trim()
      .toUpperCase()
      .replace(/[_-]+/g, "_")
      .replace(/\s+/g, "_");

  const normalizeRoleName = (value) =>
    String(value || "")
      .toLowerCase()
      .trim()
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ");

  const getRoleName = (role) =>
    role?.name ||
    role?.role_name ||
    role?.role ||
    "Unnamed Role";

  const getRoleId = (role) =>
    role?.role_id ??
    role?.id ??
    role?._id ??
    null;

  const getPermissionName = (permission) => {
    if (typeof permission === "string") {
      return permission.trim();
    }

    return (
      permission?.permission_name ||
      permission?.permissionName ||
      permission?.name ||
      ""
    );
  };

  const getPermissionDescription = (permission) => {
    if (typeof permission === "string") {
      return "";
    }

    return (
      permission?.description ||
      permission?.permission_description ||
      ""
    );
  };

  const isResidentRole = (role) =>
    normalizeRoleName(getRoleName(role)) === "resident";

  const getUserCount = (role) => {
    const value =
      role?.users ??
      role?.user_count ??
      role?.users_count ??
      role?.assigned_users ??
      0;

    if (Array.isArray(value)) {
      return value.length;
    }

    const number = Number(value);

    return Number.isFinite(number) ? number : 0;
  };

  // =====================================================
  // NON PERMISSION VALUES
  // =====================================================

  const NON_PERMISSION_VALUES = new Set([
    "PENDING",
    "APPROVED",
    "REJECTED",
    "ASSIGNED",
    "IN_PROGRESS",
    "COLLECTED",
    "COMPLETED",
    "CANCELLED",
  ]);

  const isVisiblePermissionName = (permissionName) => {
    const key = normalize(permissionName);

    if (!key) {
      return false;
    }

    // OTHER IS ONLY A UI TRIGGER
    if (key === "OTHER") {
      return false;
    }

    return !NON_PERMISSION_VALUES.has(key);
  };

  // =====================================================
  // MERGE PERMISSIONS
  // =====================================================

  const mergePermissions = (...permissionLists) => {
    const map = new Map();

    permissionLists.flat().forEach((permission) => {
      if (permission == null) {
        return;
      }

      const name = getPermissionName(permission);

      if (!name) {
        return;
      }

      const key = normalize(name);

      if (!isVisiblePermissionName(key)) {
        return;
      }

      const description =
        getPermissionDescription(permission);

      const permissionId =
        permission?.permission_id ??
        permission?.id ??
        null;

      const isCustom =
        permission?.is_custom === true;

      if (!map.has(key)) {
        map.set(key, {
          permission_id: permissionId,
          permission_name: key,
          description,
          is_custom: isCustom,
        });
      } else {
        const existing = map.get(key);

        if (
          !existing.description &&
          description
        ) {
          existing.description = description;
        }

        if (
          existing.permission_id == null &&
          permissionId != null
        ) {
          existing.permission_id = permissionId;
        }

        if (isCustom) {
          existing.is_custom = true;
        }
      }
    });

    return Array.from(map.values());
  };

  // =====================================================
  // PERMISSIONS TO SHOW
  // =====================================================

  const permissionsToShow = useMemo(() => {
    const rolePermissions = [];

    rolesList.forEach((role) => {
      if (Array.isArray(role?.permissions)) {
        role.permissions.forEach((permission) => {
          rolePermissions.push(permission);
        });
      }

      if (Array.isArray(role?.permissionIds)) {
        role.permissionIds.forEach((permission) => {
          rolePermissions.push(permission);
        });
      }

      if (Array.isArray(role?.permission_ids)) {
        role.permission_ids.forEach((permission) => {
          rolePermissions.push(permission);
        });
      }
    });

    return mergePermissions(
      DEFAULT_PERMISSIONS,
      availablePermissions,
      rolePermissions
    );
  }, [
    availablePermissions,
    rolesList,
  ]);

  // =====================================================
  // LOAD ROLES
  // =====================================================

  const loadRoles = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get(
        "/system-admin/roles"
      );

      console.log(
        "========== ROLES API RESPONSE =========="
      );

      console.log(response.data);

      const responseData =
        response?.data || {};

      const data =
        responseData?.data &&
        typeof responseData.data === "object"
          ? responseData.data
          : responseData;

      // =================================================
      // ROLES
      // =================================================

      let allRoles = [];

      if (Array.isArray(data?.roles)) {
        allRoles = data.roles;
      } else if (
        Array.isArray(data?.data?.roles)
      ) {
        allRoles = data.data.roles;
      } else if (
        Array.isArray(responseData?.roles)
      ) {
        allRoles = responseData.roles;
      }

      const roles =
        allRoles.filter(
          (role) =>
            !isResidentRole(role)
        );

      // =================================================
      // BACKEND PERMISSIONS
      // =================================================

      let backendPermissions = [];

      if (
        Array.isArray(
          data?.availablePermissions
        )
      ) {
        backendPermissions =
          data.availablePermissions;
      } else if (
        Array.isArray(
          data?.available_permissions
        )
      ) {
        backendPermissions =
          data.available_permissions;
      } else if (
        Array.isArray(
          data?.permissionsList
        )
      ) {
        backendPermissions =
          data.permissionsList;
      }

      const filteredBackendPermissions =
        backendPermissions.filter(
          (permission) =>
            isVisiblePermissionName(
              getPermissionName(
                permission
              )
            )
        );

      const mergedPermissions =
        mergePermissions(
          DEFAULT_PERMISSIONS,
          filteredBackendPermissions
        );

      // =================================================
      // PERMISSION MATRIX
      // =================================================

      let matrix = [];

      if (
        Array.isArray(
          data?.permissions
        )
      ) {
        matrix = data.permissions;
      } else if (
        Array.isArray(
          data?.permissionMatrix
        )
      ) {
        matrix =
          data.permissionMatrix;
      } else if (
        Array.isArray(
          data?.permission_matrix
        )
      ) {
        matrix =
          data.permission_matrix;
      }

      const filteredMatrix =
        matrix.filter(
          (item) =>
            !isResidentRole(item)
        );

      setRolesList(roles);
      setPermissionsMatrix(
        filteredMatrix
      );

      setAvailablePermissions(
        mergedPermissions.length
          ? mergedPermissions
          : DEFAULT_PERMISSIONS
      );

      console.log(
        "ROLES:",
        roles
      );

      console.log(
        "PERMISSIONS:",
        mergedPermissions
      );

      console.log(
        "MATRIX:",
        filteredMatrix
      );
    } catch (err) {
      console.error(
        "LOAD ROLES ERROR:",
        err
      );

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to load roles.";

      setError(message);
      setRolesList([]);
      setPermissionsMatrix([]);
      setAvailablePermissions(
        DEFAULT_PERMISSIONS
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  // =====================================================
  // GET ROLE PERMISSION NAMES
  // IMPORTANT:
  // Supports:
  //   permissions: ["VIEW", "CREATE"]
  //   permissions: [{ permission_name: "VIEW" }]
  //   permissionIds: [1, 2]
  //   permission_ids: [1, 2]
  // =====================================================

  const getRolePermissionNames = (role) => {
    const result = new Set();

    // ---------------------------------------------------
    // ADD PERMISSION HELPER
    // ---------------------------------------------------

    const addPermission = (permission) => {
      if (
        permission === null ||
        permission === undefined
      ) {
        return;
      }

      // -----------------------------------------------
      // STRING
      // -----------------------------------------------

      if (
        typeof permission ===
        "string"
      ) {
        const key =
          normalize(permission);

        if (
          isVisiblePermissionName(
            key
          )
        ) {
          result.add(key);
        }

        return;
      }

      // -----------------------------------------------
      // OBJECT WITH NAME
      // -----------------------------------------------

      const name =
        permission?.permission_name ||
        permission?.permissionName ||
        permission?.name;

      if (name) {
        const key =
          normalize(name);

        if (
          isVisiblePermissionName(
            key
          )
        ) {
          result.add(key);
        }

        return;
      }

      // -----------------------------------------------
      // OBJECT WITH ID ONLY
      // -----------------------------------------------

      const permissionId =
        permission?.permission_id ??
        permission?.id;

      if (
        permissionId !== null &&
        permissionId !== undefined
      ) {
        const matched =
          permissionsToShow.find(
            (p) =>
              Number(
                p?.permission_id ??
                p?.id
              ) ===
              Number(permissionId)
          );

        if (matched) {
          const matchedName =
            normalize(
              getPermissionName(
                matched
              )
            );

          if (
            isVisiblePermissionName(
              matchedName
            )
          ) {
            result.add(
              matchedName
            );
          }
        }
      }
    };

    // =================================================
    // 1. role.permissions
    // =================================================

    if (
      Array.isArray(
        role?.permissions
      )
    ) {
      role.permissions.forEach(
        addPermission
      );
    }

    // =================================================
    // 2. role.permissionIds
    // =================================================

    if (
      Array.isArray(
        role?.permissionIds
      )
    ) {
      role.permissionIds.forEach(
        addPermission
      );
    }

    // =================================================
    // 3. role.permission_ids
    // =================================================

    if (
      Array.isArray(
        role?.permission_ids
      )
    ) {
      role.permission_ids.forEach(
        addPermission
      );
    }

    // =================================================
    // 4. assignedPermissions
    // =================================================

    if (
      Array.isArray(
        role?.assignedPermissions
      )
    ) {
      role.assignedPermissions.forEach(
        addPermission
      );
    }

    // =================================================
    // 5. assigned_permissions
    // =================================================

    if (
      Array.isArray(
        role?.assigned_permissions
      )
    ) {
      role.assigned_permissions.forEach(
        addPermission
      );
    }

    // =================================================
    // 6. ROLE MATRIX
    // =================================================

    const roleName =
      normalizeRoleName(
        getRoleName(role)
      );

    const matrixRow =
      permissionsMatrix.find(
        (item) =>
          normalizeRoleName(
            getRoleName(item)
          ) === roleName
      );

    if (matrixRow) {
      // -----------------------------------------------
      // Matrix permissions
      // -----------------------------------------------

      if (
        Array.isArray(
          matrixRow.permissions
        )
      ) {
        matrixRow.permissions.forEach(
          addPermission
        );
      }

      // -----------------------------------------------
      // Matrix permission IDs
      // -----------------------------------------------

      if (
        Array.isArray(
          matrixRow.permissionIds
        )
      ) {
        matrixRow.permissionIds.forEach(
          addPermission
        );
      }

      if (
        Array.isArray(
          matrixRow.permission_ids
        )
      ) {
        matrixRow.permission_ids.forEach(
          addPermission
        );
      }

      // -----------------------------------------------
      // Dynamic permission columns
      // -----------------------------------------------

      permissionsToShow.forEach(
        (permission) => {
          const permissionName =
            getPermissionName(
              permission
            );

          if (!permissionName) {
            return;
          }

          const key =
            normalize(
              permissionName
            );

          if (
            !isVisiblePermissionName(
              key
            )
          ) {
            return;
          }

          const lower =
            key.toLowerCase();

          const possibleKeys = [
            permissionName,
            key,
            lower,
            `can_${lower}`,
            `has_${lower}`,
            `${lower}_permission`,
          ];

          const found =
            possibleKeys.some(
              (possibleKey) => {
                const value =
                  matrixRow?.[
                    possibleKey
                  ];

                return (
                  value === true ||
                  value === 1 ||
                  value === "1" ||
                  String(value)
                    .toLowerCase() ===
                    "true"
                );
              }
            );

          if (found) {
            result.add(key);
          }
        }
      );
    }

    const finalPermissions =
      Array.from(result);

    console.log(
      `ROLE "${getRoleName(
        role
      )}" PERMISSIONS:`,
      finalPermissions
    );

    return finalPermissions;
  };

  // =====================================================
  // HAS ROLE PERMISSION
  // =====================================================

  const hasRolePermission = (
    role,
    permissionName
  ) => {
    return getRolePermissionNames(
      role
    ).includes(
      normalize(permissionName)
    );
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

    setOtherSelected(false);

    setCustomPermission({
      name: "",
      description: "",
    });

    setShowRoleModal(true);
  };

  // =====================================================
  // OPEN EDIT MODAL
  // FIXED
  // =====================================================

  const openEditModal = (role) => {
    console.log(
      "================================"
    );

    console.log(
      "EDIT ROLE CLICKED:"
    );

    console.log(role);

    const selectedPermissions =
      getRolePermissionNames(role)
        .filter(
          (permission) =>
            isVisiblePermissionName(
              permission
            )
        );

    console.log(
      "SELECTED PERMISSIONS:",
      selectedPermissions
    );

    setEditingRole(role);

    setRoleForm({
      name: getRoleName(role),
      description:
        role?.description || "",
      permissions:
        selectedPermissions,
    });

    setOtherSelected(false);

    setCustomPermission({
      name: "",
      description: "",
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

    setOtherSelected(false);

    setCustomPermission({
      name: "",
      description: "",
    });
  };

  // =====================================================
  // ROLE INPUT
  // =====================================================

  const handleInputChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setRoleForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================================
  // TOGGLE PERMISSION
  // =====================================================

  const togglePermission = (
    permissionName
  ) => {
    if (savingRole) {
      return;
    }

    const normalized =
      normalize(permissionName);

    // OTHER IS ONLY UI
    if (
      normalized === "OTHER"
    ) {
      setOtherSelected(
        (prev) => !prev
      );

      setCustomPermission({
        name: "",
        description: "",
      });

      return;
    }

    if (
      !isVisiblePermissionName(
        normalized
      )
    ) {
      return;
    }

    setRoleForm((prev) => {
      const exists =
        prev.permissions.some(
          (permission) =>
            normalize(permission) ===
            normalized
        );

      if (exists) {
        return {
          ...prev,
          permissions:
            prev.permissions.filter(
              (permission) =>
                normalize(
                  permission
                ) !== normalized
            ),
        };
      }

      return {
        ...prev,
        permissions: [
          ...prev.permissions,
          normalized,
        ],
      };
    });
  };

  // =====================================================
  // CUSTOM PERMISSION INPUT
  // =====================================================

  const handleCustomPermissionChange = (
    e
  ) => {
    const {
      name,
      value,
    } = e.target;

    setCustomPermission(
      (prev) => ({
        ...prev,
        [name]: value,
      })
    );
  };

  // =====================================================
  // ADD CUSTOM PERMISSION
  // =====================================================

  const handleAddCustomPermission =
    async () => {
      if (savingRole) {
        return;
      }

      const name =
        customPermission.name.trim();

      const description =
        customPermission.description.trim();

      if (!name) {
        alert(
          "Custom permission name is required."
        );
        return;
      }

      if (name.length < 2) {
        alert(
          "Permission name must contain at least 2 characters."
        );
        return;
      }

      if (!description) {
        alert(
          "Custom permission description is required."
        );
        return;
      }

      const normalized =
        normalize(name);

      if (!normalized) {
        alert(
          "Invalid custom permission name."
        );
        return;
      }

      if (
        normalized === "OTHER"
      ) {
        alert(
          "OTHER is reserved for the custom permission option."
        );
        return;
      }

      const exists =
        permissionsToShow.some(
          (permission) =>
            normalize(
              getPermissionName(
                permission
              )
            ) === normalized
        );

      if (exists) {
        alert(
          "This permission already exists."
        );
        return;
      }

      try {
        const response =
          await API.post(
            "/system-admin/permissions",
            {
              permission_name:
                normalized,
              description,
            }
          );

        const responseData =
          response?.data || {};

        const createdPermission =
          responseData?.data ||
          responseData?.permission ||
          responseData;

        const permissionId =
          createdPermission?.permission_id ??
          createdPermission?.id ??
          null;

        const createdName =
          normalize(
            createdPermission?.permission_name ||
              createdPermission?.permissionName ||
              normalized
          );

        const createdDescription =
          createdPermission?.description ||
          description;

        const newPermission = {
          permission_id:
            permissionId,
          permission_name:
            createdName,
          description:
            createdDescription,
          is_custom: true,
        };

        // Add to permissions
        setAvailablePermissions(
          (prev) =>
            mergePermissions(
              prev,
              [newPermission]
            )
        );

        // Automatically select
        // new permission
        setRoleForm((prev) => ({
          ...prev,
          permissions: [
            ...new Set([
              ...prev.permissions,
              createdName,
            ]),
          ],
        }));

        setOtherSelected(false);

        setCustomPermission({
          name: "",
          description: "",
        });

        alert(
          "Custom permission added successfully."
        );
      } catch (err) {
        console.error(
          "ADD CUSTOM PERMISSION ERROR:",
          err
        );

        alert(
          err?.response?.data
            ?.message ||
            err?.response?.data
              ?.error ||
            err?.message ||
            "Failed to add custom permission."
        );
      }
    };

  // =====================================================
  // DELETE CUSTOM PERMISSION
  // =====================================================

  const handleDeleteCustomPermission =
    async (permission) => {
      try {
        const permissionId =
          permission?.permission_id ??
          permission?.id ??
          null;

        const permissionName =
          getPermissionName(
            permission
          );

        if (!permissionId) {
          alert(
            "Permission ID not found."
          );
          return;
        }

        if (!permissionName) {
          alert(
            "Permission name not found."
          );
          return;
        }

        const normalizedName =
          normalize(
            permissionName
          );

        if (
          BUILT_IN_PERMISSIONS.includes(
            normalizedName
          )
        ) {
          alert(
            "Built-in permissions cannot be deleted."
          );
          return;
        }

        const confirmed =
          window.confirm(
            `Are you sure you want to delete "${permissionName}"?`
          );

        if (!confirmed) {
          return;
        }

        await API.delete(
          `/system-admin/permissions/${permissionId}`
        );

        setAvailablePermissions(
          (prev) =>
            prev.filter(
              (p) =>
                Number(
                  p?.permission_id ??
                    p?.id
                ) !==
                Number(permissionId)
            )
        );

        setRoleForm((prev) => ({
          ...prev,
          permissions:
            prev.permissions.filter(
              (p) =>
                normalize(p) !==
                normalizedName
            ),
        }));

        setOtherSelected(false);

        setCustomPermission({
          name: "",
          description: "",
        });

        alert(
          "Custom permission deleted successfully."
        );
      } catch (err) {
        console.error(
          "DELETE CUSTOM PERMISSION ERROR:",
          err
        );

        alert(
          err?.response?.data
            ?.message ||
            err?.response?.data
              ?.error ||
            err?.message ||
            "Failed to delete custom permission."
        );
      }
    };

  // =====================================================
  // SAVE ROLE
  // =====================================================

  const handleSaveRole = async (e) => {
    e.preventDefault();

    if (savingRole) {
      return;
    }

    const roleName =
      roleForm.name.trim();

    const description =
      roleForm.description.trim();

    // ONLY REAL PERMISSIONS
    const selectedPermissions =
      roleForm.permissions.filter(
        (permission) =>
          isVisiblePermissionName(
            normalize(permission)
          )
      );

    if (!roleName) {
      alert(
        "Role name is required."
      );
      return;
    }

    if (roleName.length < 2) {
      alert(
        "Role name must contain at least 2 characters."
      );
      return;
    }

    if (
      normalizeRoleName(
        roleName
      ) === "resident"
    ) {
      alert(
        "Resident cannot be managed from this page."
      );
      return;
    }

    if (
      selectedPermissions.length ===
      0
    ) {
      alert(
        "Please select at least one permission."
      );
      return;
    }

    try {
      setSavingRole(true);

      const payload = {
        role_name: roleName,
        name: roleName,
        description,

        // OTHER NEVER SENT
        permissions:
          selectedPermissions,

        permissionIds:
          selectedPermissions,
      };

      console.log(
        "========== SAVE ROLE =========="
      );

      console.log(
        "PAYLOAD:",
        payload
      );

      // =================================================
      // UPDATE
      // =================================================

      if (editingRole) {
        const roleId =
          getRoleId(
            editingRole
          );

        if (!roleId) {
          throw new Error(
            "Role ID is missing."
          );
        }

        const response =
          await API.put(
            `/system-admin/roles/${roleId}`,
            payload
          );

        alert(
          response?.data
            ?.message ||
            "Role updated successfully."
        );
      }

      // =================================================
      // CREATE
      // =================================================

      else {
        const response =
          await API.post(
            "/system-admin/roles",
            payload
          );

        alert(
          response?.data
            ?.message ||
            "Role created successfully."
        );
      }

      closeRoleModal();

      await loadRoles();
    } catch (err) {
      console.error(
        "SAVE ROLE ERROR:",
        err
      );

      alert(
        err?.response?.data
          ?.message ||
          err?.response?.data
            ?.error ||
          err?.message ||
          "Failed to save role."
      );
    } finally {
      setSavingRole(false);
    }
  };

  // =====================================================
  // DELETE ROLE
  // =====================================================

  const handleDeleteRole = async (
    role
  ) => {
    const roleId =
      getRoleId(role);

    const roleName =
      getRoleName(role);

    if (!roleId) {
      alert(
        "Role ID is missing."
      );
      return;
    }

    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${roleName}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingRoleId(roleId);

      const response =
        await API.delete(
          `/system-admin/roles/${roleId}`
        );

      alert(
        response?.data?.message ||
          "Role deleted successfully."
      );

      await loadRoles();
    } catch (err) {
      console.error(
        "DELETE ROLE ERROR:",
        err
      );

      alert(
        err?.response?.data
          ?.message ||
          err?.response?.data
            ?.error ||
          err?.message ||
          "Failed to delete role."
      );
    } finally {
      setDeletingRoleId(null);
    }
  };

  // =====================================================
  // FILTER ROLES
  // =====================================================

  const filteredRoles =
    useMemo(() => {
      const keyword =
        search
          .toLowerCase()
          .trim();

      if (!keyword) {
        return rolesList;
      }

      return rolesList.filter(
        (role) => {
          const name =
            getRoleName(
              role
            ).toLowerCase();

          const description =
            String(
              role?.description ||
                ""
            ).toLowerCase();

          return (
            name.includes(
              keyword
            ) ||
            description.includes(
              keyword
            )
          );
        }
      );
    }, [
      rolesList,
      search,
    ]);

  // =====================================================
  // STATISTICS
  // =====================================================

  const totalRoles =
    rolesList.length;

  const totalAssignedUsers =
    rolesList.reduce(
      (sum, role) =>
        sum +
        getUserCount(role),
      0
    );

  const totalPermissionsCount =
    permissionsToShow.length;

  const adminRolesCount =
    rolesList.filter(
      (role) => {
        const name =
          normalizeRoleName(
            getRoleName(role)
          );

        return (
          name ===
            "system admin" ||
          name ===
            "municipal admin"
        );
      }
    ).length;

  const operationalRolesCount =
    rolesList.filter(
      (role) => {
        const name =
          normalizeRoleName(
            getRoleName(role)
          );

        return (
          name === "collector" ||
          name ===
            "business owner"
        );
      }
    ).length;

  // =====================================================
  // PERMISSION COUNT
  // =====================================================

  const getPermissionCount = (
    role
  ) => {
    return getRolePermissionNames(
      role
    ).length;
  };

  // =====================================================
  // RENDER PERMISSION
  // =====================================================

  const renderPermission = (
    value
  ) =>
    value ? (
      <span className="text-green-600 text-xl font-bold">
        ✓
      </span>
    ) : (
      <span className="text-red-500 text-xl font-bold">
        ✕
      </span>
    );

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
      <div className="min-h-[400px] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow border p-8 text-center max-w-lg w-full">
          <h2 className="text-2xl font-bold text-gray-800">
            Failed to Load Roles
          </h2>

          <p className="text-red-600 mt-3 break-words">
            {error}
          </p>

          <button
            type="button"
            onClick={loadRoles}
            className="mt-5 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <div className="space-y-8">

      {/* HEADER */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Roles & Permissions
          </h1>

          <p className="mt-2 text-gray-500">
            Manage system roles and permissions for
            administrators, collectors, business owners,
            and custom roles.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl font-semibold transition"
        >
          <FaPlus />
          New Role
        </button>
      </div>

      {/* STATISTICS */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

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
      </div>

      {/* SEARCH */}

      <div className="bg-white rounded-2xl shadow border p-6">
        <div className="relative">

          <FaSearch className="absolute left-4 top-4 text-gray-400" />

          <input
            type="text"
            placeholder="Search role..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="w-full pl-12 pr-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
          />

        </div>
      </div>

      {/* ROLES TABLE */}

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

                <th className="p-4 text-center">
                  Actions
                </th>
              </tr>

            </thead>

            <tbody>

              {filteredRoles.map(
                (role) => {

                  const roleId =
                    getRoleId(
                      role
                    );

                  const roleName =
                    getRoleName(
                      role
                    );

                  const userCount =
                    getUserCount(
                      role
                    );

                  const permissionCount =
                    getPermissionCount(
                      role
                    );

                  return (
                    <tr
                      key={
                        roleId ||
                        roleName
                      }
                      className="border-t hover:bg-gray-50 transition"
                    >

                      <td className="p-4">
                        <h3 className="font-bold text-gray-800">
                          {roleName}
                        </h3>

                        <p className="text-sm text-gray-500 mt-1">
                          {role?.description ||
                            "No description"}
                        </p>
                      </td>

                      <td className="p-4">

                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 font-semibold">
                          <FaKey />
                          {permissionCount} Permissions
                        </span>

                      </td>

                      <td className="p-4">

                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-semibold">
                          <FaUsers />
                          {userCount} Users
                        </span>

                      </td>

                      <td className="p-4">

                        <div className="flex justify-center gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              openEditModal(
                                role
                              )
                            }
                            disabled={
                              savingRole
                            }
                            className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-600 hover:text-white transition disabled:opacity-40 disabled:cursor-not-allowed"
                            title="Edit Role"
                          >
                            <FaEdit />
                          </button>

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
                            className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-600 hover:text-white transition disabled:opacity-40 disabled:cursor-not-allowed"
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
                }
              )}

              {filteredRoles.length ===
                0 && (
                <tr>
                  <td
                    colSpan="4"
                    className="p-8 text-center text-gray-500"
                  >
                    No roles found.
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* ROLE SUMMARY */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl p-6 shadow-lg">

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

        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl p-6 shadow-lg">

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

      </div>

      {/* =====================================================
          PERMISSION MATRIX
      ===================================================== */}

      <div className="bg-white rounded-2xl shadow border p-6">

        <div className="mb-6">

          <h2 className="text-2xl font-bold text-gray-800">
            Permission Matrix
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            View permissions assigned to each role.
          </p>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full min-w-max">

            <thead className="bg-gray-100">

              <tr>

                <th className="p-4 text-left">
                  Role
                </th>

                {permissionsToShow.map(
                  (permission) => {

                    const name =
                      getPermissionName(
                        permission
                      );

                    return (
                      <th
                        key={name}
                        className="p-4 text-center whitespace-nowrap"
                      >
                        {name}
                      </th>
                    );
                  }
                )}

              </tr>

            </thead>

            <tbody>

              {filteredRoles.map(
                (role) => {

                  const roleName =
                    getRoleName(
                      role
                    );

                  return (
                    <tr
                      key={
                        getRoleId(
                          role
                        ) ||
                        roleName
                      }
                      className="border-t hover:bg-gray-50"
                    >

                      <td className="p-4 font-semibold whitespace-nowrap">
                        {roleName}
                      </td>

                      {permissionsToShow.map(
                        (permission) => {

                          const permissionName =
                            getPermissionName(
                              permission
                            );

                          return (
                            <td
                              key={
                                permissionName
                              }
                              className="p-4 text-center"
                            >
                              {renderPermission(
                                hasRolePermission(
                                  role,
                                  permissionName
                                )
                              )}
                            </td>
                          );
                        }
                      )}

                    </tr>
                  );
                }
              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* FOOTER SUMMARY */}

      <div className="bg-gradient-to-r from-indigo-700 to-purple-700 rounded-2xl p-8 text-white">

        <h2 className="text-2xl font-bold mb-3">
          Roles Management Summary
        </h2>

        <p className="text-indigo-100 leading-8">
          The System Administrator controls manageable
          user roles and permissions within the Waste
          Collection Management System. This module
          allows administrators to create custom roles,
          edit role privileges, and monitor user access.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">

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

        </div>

      </div>

      {/* =====================================================
          CREATE / EDIT ROLE MODAL
      ===================================================== */}

      {showRoleModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onMouseDown={(e) => {
            if (
              e.target ===
                e.currentTarget &&
              !savingRole
            ) {
              closeRoleModal();
            }
          }}
        >

          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden">

            {/* HEADER */}

            <div className="flex items-center justify-between p-6 border-b bg-gray-50">

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
                onClick={
                  closeRoleModal
                }
                disabled={
                  savingRole
                }
                className="w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:bg-red-100 hover:text-red-600"
              >
                <FaTimes />
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={
                handleSaveRole
              }
              className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-100px)]"
            >

              {/* ROLE NAME */}

              <div>

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Role Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={
                    roleForm.name
                  }
                  onChange={
                    handleInputChange
                  }
                  placeholder="e.g. Supervisor"
                  disabled={
                    savingRole
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                  required
                />

              </div>

              {/* DESCRIPTION */}

              <div>

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>

                <textarea
                  name="description"
                  value={
                    roleForm.description
                  }
                  onChange={
                    handleInputChange
                  }
                  rows={4}
                  placeholder="Describe the responsibilities of this role..."
                  disabled={
                    savingRole
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none resize-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                />

              </div>

              {/* =================================================
                  PERMISSIONS
              ================================================= */}

              <div>

                <div className="flex items-center justify-between mb-3">

                  <label className="text-sm font-semibold text-gray-700">
                    Permissions
                  </label>

                  <span className="text-xs font-medium text-indigo-600">
                    {
                      roleForm.permissions
                        .filter(
                          (p) =>
                            isVisiblePermissionName(
                              p
                            )
                        ).length
                    }{" "}
                    selected
                  </span>

                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                  {permissionsToShow.map(
                    (permission) => {

                      const permissionName =
                        getPermissionName(
                          permission
                        );

                      const description =
                        getPermissionDescription(
                          permission
                        );

                      const normalizedPermission =
                        normalize(
                          permissionName
                        );

                      const checked =
                        roleForm.permissions.some(
                          (item) =>
                            normalize(
                              item
                            ) ===
                            normalizedPermission
                        );

                      const isBuiltIn =
                        BUILT_IN_PERMISSIONS.includes(
                          normalizedPermission
                        );

                      const isCustom =
                        !isBuiltIn &&
                        (
                          permission?.is_custom ===
                            true ||
                          permission?.permission_id !=
                            null ||
                          permission?.id !=
                            null
                        );

                      return (
                        <div
                          key={
                            permission?.permission_id ||
                            permission?.id ||
                            permissionName
                          }
                          className={`p-4 border rounded-xl transition ${
                            checked
                              ? "border-indigo-500 bg-indigo-50"
                              : "border-gray-300 hover:bg-gray-50"
                          }`}
                        >

                          <div className="flex items-start gap-3">

                            <label className="flex items-start gap-3 cursor-pointer flex-1">

                              <input
                                type="checkbox"
                                checked={
                                  checked
                                }
                                disabled={
                                  savingRole
                                }
                                onChange={() =>
                                  togglePermission(
                                    permissionName
                                  )
                                }
                                className="mt-1 w-4 h-4 accent-indigo-600"
                              />

                              <div className="flex-1">

                                <div className="font-semibold text-gray-800">
                                  {permissionName}
                                </div>

                                {description && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    {
                                      description
                                    }
                                  </p>
                                )}

                              </div>

                            </label>

                            {isCustom && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteCustomPermission(
                                    permission
                                  )
                                }
                                disabled={
                                  savingRole
                                }
                                className="p-2 text-red-600 bg-red-50 hover:bg-red-600 hover:text-white rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed"
                                title={`Delete ${permissionName}`}
                              >
                                <FaTrash />
                              </button>
                            )}

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>

              </div>

              {/* =================================================
                  OTHER
              ================================================= */}

              <div>

                <div
                  className={`p-4 border rounded-xl transition ${
                    otherSelected
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-300 hover:bg-gray-50"
                  }`}
                >

                  <label className="flex items-start gap-3 cursor-pointer">

                    <input
                      type="checkbox"
                      checked={
                        otherSelected
                      }
                      disabled={
                        savingRole
                      }
                      onChange={() => {
                        setOtherSelected(
                          (prev) =>
                            !prev
                        );

                        setCustomPermission({
                          name: "",
                          description:
                            "",
                        });
                      }}
                      className="mt-1 w-4 h-4 accent-orange-500"
                    />

                    <div className="flex-1">

                      <div className="font-semibold text-gray-800">
                        OTHER
                      </div>

                      <p className="text-xs text-gray-500 mt-1">
                        Add a custom permission.
                      </p>

                    </div>

                  </label>

                  {otherSelected && (
                    <div className="mt-4 pl-7">

                      <div className="p-4 bg-white border border-orange-300 rounded-xl">

                        <div className="flex items-center gap-2 mb-4">

                          <FaPlus className="text-orange-500" />

                          <h4 className="font-bold text-gray-800">
                            Add Custom Permission
                          </h4>

                        </div>

                        <div className="space-y-4">

                          <div>

                            <label className="block text-xs font-semibold text-gray-700 mb-2">
                              Permission Name
                            </label>

                            <input
                              type="text"
                              name="name"
                              value={
                                customPermission.name
                              }
                              onChange={
                                handleCustomPermissionChange
                              }
                              placeholder="e.g. REPORTS"
                              disabled={
                                savingRole
                              }
                              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-500"
                            />

                          </div>

                          <div>

                            <label className="block text-xs font-semibold text-gray-700 mb-2">
                              Description
                            </label>

                            <textarea
                              name="description"
                              value={
                                customPermission.description
                              }
                              onChange={
                                handleCustomPermissionChange
                              }
                              rows={3}
                              placeholder="Describe this custom permission..."
                              disabled={
                                savingRole
                              }
                              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none resize-none focus:ring-2 focus:ring-orange-500"
                            />

                          </div>

                          <div className="flex justify-end gap-2 pt-2">

                            <button
                              type="button"
                              onClick={() => {
                                setOtherSelected(
                                  false
                                );

                                setCustomPermission({
                                  name: "",
                                  description:
                                    "",
                                });
                              }}
                              disabled={
                                savingRole
                              }
                              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100"
                            >
                              Cancel
                            </button>

                            <button
                              type="button"
                              onClick={
                                handleAddCustomPermission
                              }
                              disabled={
                                savingRole
                              }
                              className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-semibold disabled:opacity-50"
                            >
                              <FaPlus />
                              Add Permission
                            </button>

                          </div>

                        </div>

                      </div>

                    </div>
                  )}

                </div>

              </div>

              {/* FOOTER */}

              <div className="flex justify-end gap-3 pt-5 border-t">

                <button
                  type="button"
                  onClick={
                    closeRoleModal
                  }
                  disabled={
                    savingRole
                  }
                  className="px-5 py-3 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    savingRole
                  }
                  className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold disabled:opacity-50"
                >

                  {savingRole ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />

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