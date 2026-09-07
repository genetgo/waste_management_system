
import React, { useEffect, useState } from "react";
import {
  FaUsers,
  FaSearch,
  FaFilePdf,
  FaFileExcel,
  FaEye,
  FaEdit,
  FaTrash,
  FaArrowLeft,
} from "react-icons/fa";

import systemAdminService from "../../services/systemAdminService";

const Users = ({ onBack }) => {
  // ===========================
  // STATES
  // ===========================
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [selectedUser, setSelectedUser] = useState(null);

  const [showView, setShowView] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const [editUser, setEditUser] = useState({});

  // ===========================
  // LOAD USERS
  // ===========================
  const loadUsers = async () => {
    try {
      setLoading(true);

      const res = await systemAdminService.getUsers();

      console.log("USERS RESPONSE:", res);

      setUsers(
        Array.isArray(res)
          ? res
          : res?.users || res?.data || []
      );
    } catch (err) {
      console.error("Load Users Error:", err);
      alert("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // ===========================
  // STATISTICS
  // ===========================
  const totalUsers = users.length;

  const residents = users.filter(
    (u) => u.role === "Resident"
  ).length;

  const businessOwners = users.filter(
    (u) => u.role === "Business Owner"
  ).length;

  const staffMembers = users.filter(
    (u) =>
      u.role === "Collector" ||
      u.role === "Municipal Admin" ||
      u.role === "System Admin"
  ).length;

  // ===========================
  // FILTER USERS
  // ===========================
  const filteredUsers = users.filter((user) => {
    const kifleKetema =
      user.kifle_ketema ||
      user.kifleKetema ||
      "";

    const matchesSearch =
      (user.name || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||

      (user.email || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||

      (user.phone || user.phone_number || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||

      kifleKetema
        .toLowerCase()
        .includes(search.toLowerCase()) ||

      (user.role || "")
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesRole =
      roleFilter === "All" ||
      user.role === roleFilter;

    const matchesStatus =
      statusFilter === "All" ||
      user.status === statusFilter;

    return (
      matchesSearch &&
      matchesRole &&
      matchesStatus
    );
  });

  // ===========================
  // VIEW USER
  // ===========================
  const handleView = (user) => {
    setSelectedUser(user);
    setShowView(true);
  };

  // ===========================
  // EDIT USER
  // ===========================
  

const handleEdit = (user) => {
  console.log("ORIGINAL USER:", user);

  const normalizedRole =
    typeof user.role === "object" &&
    user.role !== null
      ? user.role.role || user.role.name
      : user.role;

  setEditUser({
    id: user.id,

    name: user.name || "",

    email: user.email || "",

    phone:
      user.phone ||
      user.phone_number ||
      "",

    kifle_ketema:
      user.kifle_ketema ||
      user.kifleKetema ||
      "",

    role: normalizedRole,

    status: user.status || "Active",

    created_at: user.created_at,
    updated_at: user.updated_at,
  });

  setShowEdit(true);
};

  const handleChange = (e) => {
    setEditUser({
      ...editUser,
      [e.target.name]: e.target.value,
    });
  };

 

const handleSave = async () => {
    try {

        const userData = {
            name: editUser.name,
            email: editUser.email,
            phone:
                editUser.phone ||
                editUser.phone_number ||
                "",
            kifle_ketema:
                editUser.kifle_ketema ||
                editUser.kifleKetema ||
                "",
            status: editUser.status || "Active",
            role: editUser.role,
        };

        console.log("========== FRONTEND UPDATE ==========");
        console.log("ID:", editUser.id);
        console.log("Sending:", userData);
        console.log("=====================================");

        await systemAdminService.updateUser(
            editUser.id,
            userData
        );

        setShowEdit(false);

        await loadUsers();

        alert("User updated successfully.");

    } catch (err) {

        console.error(
            "Update User Error:",
            err
        );

        console.error(
            "Response:",
            err.response?.data
        );

        alert(
            err.response?.data?.message ||
            "Update failed."
        );
    }
};
  // ===========================
  // DELETE USER
  // ===========================
  const handleDelete = async (user) => {
    console.log(user);

    if (!window.confirm(`Delete ${user.name}?`)) {
      return;
    }

    try {
      console.log("ID:", user.id);
      console.log("ROLE:", user.role);

      await systemAdminService.deleteUser(
        user.id,
        user.role
      );

      await loadUsers();

      alert("User deleted successfully.");
    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.message ||
          "Delete failed."
      );
    }
  };

  // ===========================
  // EXPORT PDF
  // ===========================
  const handleExportPDF = async () => {
    try {
      const response =
        await systemAdminService.exportUsersPDF();

      const url = window.URL.createObjectURL(
        new Blob([response.data], {
          type: "application/pdf",
        })
      );

      const link = document.createElement("a");

      link.href = url;
      link.download = "Users.pdf";

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("PDF Export Failed");
    }
  };

  // ===========================
  // EXPORT EXCEL
  // ===========================
  const handleExportExcel = async () => {
    try {
      const response =
        await systemAdminService.exportUsersExcel();

      const url = window.URL.createObjectURL(
        new Blob([response.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        })
      );

      const link = document.createElement("a");

      link.href = url;
      link.download = "Users.xlsx";

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Excel Export Failed");
    }
  };

  // ===========================
  // RENDER
  // ===========================
  return (
    <div className="space-y-6">

      {/* ===========================
          HEADER
      =========================== */}
      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FaUsers className="text-emerald-600" />
            Users Management
          </h1>

          <p className="text-gray-500 mt-1">
            View, search and manage all users.
          </p>
        </div>

        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg"
          >
            <FaArrowLeft />
            Back
          </button>
        )}

      </div>

      {/* ===========================
          STATISTICS
      =========================== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-gray-500">
            Total Users
          </p>

          <h2 className="text-2xl font-bold">
            {totalUsers}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-gray-500">
            Residents
          </p>

          <h2 className="text-2xl font-bold">
            {residents}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-gray-500">
            Business Owners
          </p>

          <h2 className="text-2xl font-bold">
            {businessOwners}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-gray-500">
            Staff Members
          </p>

          <h2 className="text-2xl font-bold">
            {staffMembers}
          </h2>
        </div>

      </div>

      {/* ===========================
          SEARCH + FILTERS
      =========================== */}
      <div className="bg-white rounded-xl shadow p-5">

        <div className="grid md:grid-cols-5 gap-3">

          <div className="relative md:col-span-2">

            <FaSearch className="absolute left-3 top-3 text-gray-400" />

            <input
              type="text"
              placeholder="Search by email, phone , name..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="w-full border rounded-lg pl-10 py-2"
            />

          </div>

          <select
            value={roleFilter}
            onChange={(e) =>
              setRoleFilter(e.target.value)
            }
            className="border rounded-lg p-2"
          >
            <option value="All">
              All Roles
            </option>

            <option value="Resident">
              Resident
            </option>

            <option value="Business Owner">
              Business Owner
            </option>

            <option value="Collector">
              Collector
            </option>

            <option value="Municipal Admin">
              Municipal Admin
            </option>

            <option value="System Admin">
              System Admin
            </option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            className="border rounded-lg p-2"
          >
            <option value="All">
              All Status
            </option>

            <option value="Active">
              Active
            </option>

            <option value="Inactive">
              Inactive
            </option>
          </select>

        </div>

        <div className="flex gap-3 pt-4">

          <button
            onClick={handleExportPDF}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <FaFilePdf />
            Export PDF
          </button>

          <button
            onClick={handleExportExcel}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <FaFileExcel />
            Export Excel
          </button>

        </div>

      </div>

      
      {/* ===========================
          USERS TABLE
      =========================== */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">

        <table className="w-full">

          <thead className="bg-slate-100">

            <tr>

              <th className="p-3 text-left">
                ID
              </th>

              <th className="p-3 text-left">
                Name
              </th>

              <th className="p-3 text-left">
                Email
              </th>

              <th className="p-3 text-left">
                Phone
              </th>

              {/* NEW COLUMN */}
              <th className="p-3 text-left">
                Kifle Ketema
              </th>

              <th className="p-3 text-left">
                Role
              </th>

              <th className="p-3 text-left">
                Status
              </th>

              <th className="p-3 text-center">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {loading ? (

              <tr>
                <td
                  colSpan="8"
                  className="text-center p-6"
                >
                  Loading...
                </td>
              </tr>

            ) : filteredUsers.length === 0 ? (

              <tr>
                <td
                  colSpan="8"
                  className="text-center p-6"
                >
                  No users found.
                </td>
              </tr>

            ) : (

              filteredUsers.map((user) => (

                <tr
                  key={`${user.role}-${user.id}`}
                  className="border-t hover:bg-slate-50"
                >

                  <td className="p-3">
                    {user.id}
                  </td>

                  <td className="p-3 font-medium">
                    {user.name}
                  </td>

                  <td className="p-3">
                    {user.email}
                  </td>

                  {/* PHONE */}
                  <td className="p-3">
                    {user.phone ||
                      user.phone_number ||
                      "-"}
                  </td>

                  {/* KIFLE KETEMA */}
                  <td className="p-3">
                    {user.kifle_ketema ||
                      user.kifleKetema ||
                      "-"}
                  </td>

                  <td className="p-3">
                    {user.role}
                  </td>

                  <td className="p-3">

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {user.status}
                    </span>

                  </td>

                  <td className="p-3">

                    <div className="flex justify-center gap-2">

                      {/* VIEW */}
                      <button
                        onClick={() =>
                          handleView(user)
                        }
                        className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white transition"
                      >
                        <FaEye />
                      </button>

                      {/* EDIT */}
                      <button
                        onClick={() =>
                          handleEdit(user)
                        }
                        className="p-2 rounded-lg bg-yellow-100 text-yellow-600 hover:bg-yellow-500 hover:text-white transition"
                      >
                        <FaEdit />
                      </button>

                      {/* DELETE */}
                      <button
                        onClick={() =>
                          handleDelete(user)
                        }
                        className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-600 hover:text-white transition"
                      >
                        <FaTrash />
                      </button>

                    </div>

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

      {/* ===========================
          VIEW USER MODAL
      =========================== */}
      {showView && selectedUser && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">

          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col">

            {/* HEADER */}
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-4 flex items-center justify-between rounded-t-2xl">

              <div>
                <h2 className="text-xl font-bold text-white">
                  User Details
                </h2>

                <p className="text-sm text-emerald-100">
                  Complete user information
                </p>
              </div>

              <button
                onClick={() =>
                  setShowView(false)
                }
                className="text-white text-3xl leading-none hover:text-red-200 transition"
              >
                ×
              </button>

            </div>

            {/* BODY */}
            <div className="flex-1 overflow-y-auto p-6">

              {/* PROFILE */}
              <div className="flex items-center gap-4 border-b pb-5">

                <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-xl font-bold text-emerald-700">
                  {selectedUser.name
                    ?.charAt(0)
                    .toUpperCase()}
                </div>

                <div className="flex-1">

                  <h3 className="text-xl font-bold text-gray-800">
                    {selectedUser.name}
                  </h3>

                  <p className="text-sm text-gray-500">
                    {selectedUser.role}
                  </p>

                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    selectedUser.status ===
                    "Active"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {selectedUser.status}
                </span>

              </div>

              {/* INFORMATION */}
              <div className="grid md:grid-cols-2 gap-6 mt-6">

                {/* PERSONAL INFORMATION */}
                <div className="bg-gray-50 rounded-xl p-5">

                  <h4 className="text-lg font-semibold text-emerald-600 mb-4">
                    Personal Information
                  </h4>

                  <div className="space-y-3">

                    <div className="flex justify-between">
                      <span className="text-gray-500">
                        User ID
                      </span>

                      <span className="font-medium">
                        #{selectedUser.id}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-500">
                        Full Name
                      </span>

                      <span className="font-medium">
                        {selectedUser.name}
                      </span>
                    </div>

                    <div className="flex justify-between items-start">
                      <span className="text-gray-500">
                        Email
                      </span>

                      <span className="font-medium text-right break-all max-w-[220px]">
                        {selectedUser.email}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-500">
                        Phone
                      </span>

                      <span className="font-medium">
                        {selectedUser.phone ||
                          selectedUser.phone_number ||
                          "-"}
                      </span>
                    </div>

                    {/* NEW KIFLE KETEMA */}
                    <div className="flex justify-between items-start">
                      <span className="text-gray-500">
                        Kifle Ketema
                      </span>

                      <span className="font-medium text-right max-w-[220px]">
                        {selectedUser.kifle_ketema ||
                          selectedUser.kifleKetema ||
                          "-"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-500">
                        Role
                      </span>

                      <span className="font-medium">
                        {selectedUser.role}
                      </span>
                    </div>

                  </div>

                </div>

                {/* ACCOUNT INFORMATION */}
                <div className="bg-gray-50 rounded-xl p-5">

                  <h4 className="text-lg font-semibold text-blue-600 mb-4">
                    Account Information
                  </h4>

                  <div className="space-y-3">

                    <div className="flex justify-between">
                      <span className="text-gray-500">
                        Created At
                      </span>

                      <span className="font-medium">
                        {selectedUser.created_at
                          ? new Date(
                              selectedUser.created_at
                            ).toLocaleDateString(
                              "en-US",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }
                            )
                          : "-"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-500">
                        Last Updated
                      </span>

                      <span className="font-medium">
                        {selectedUser.updated_at
                          ? new Date(
                              selectedUser.updated_at
                            ).toLocaleDateString(
                              "en-US",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }
                            )
                          : "-"}
                      </span>
                    </div>

                  </div>

                </div>

              </div>

            </div>

            {/* FOOTER */}
            <div className="bg-gray-100 px-6 py-4 flex justify-end rounded-b-2xl">

              <button
                onClick={() =>
                  setShowView(false)
                }
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg transition"
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

      {/* ===========================
          EDIT USER MODAL
      =========================== */}
      {showEdit && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">

          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">

            <h2 className="text-2xl font-bold mb-6">
              Edit User
            </h2>

            <div className="space-y-4">

              {/* NAME */}
              <div>

                <label className="block mb-1 font-medium">
                  Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={editUser.name || ""}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                />

              </div>

              {/* EMAIL */}
              <div>

                <label className="block mb-1 font-medium">
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={editUser.email || ""}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                />

              </div>

              {/* PHONE */}
              <div>

                <label className="block mb-1 font-medium">
                  Phone
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={
                    editUser.phone ||
                    editUser.phone_number ||
                    ""
                  }
                  onChange={handleChange}
                  className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                />

              </div>

              {/* KIFLE KETEMA */}
              <div>

                <label className="block mb-1 font-medium">
                  Kifle Ketema
                </label>

                <input
                  type="text"
                  name="kifle_ketema"
                  value={
                    editUser.kifle_ketema ||
                    editUser.kifleKetema ||
                    ""
                  }
                  onChange={handleChange}
                  placeholder="Enter Kifle Ketema"
                  className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                />

              </div>

              {/* STATUS */}
              <div>

                <label className="block mb-1 font-medium">
                  Status
                </label>

                <select
                  name="status"
                  value={
                    editUser.status ||
                    "Active"
                  }
                  onChange={handleChange}
                  className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                >

                  <option value="Active">
                    Active
                  </option>

                  <option value="Inactive">
                    Inactive
                  </option>

                </select>

              </div>

            </div>

            {/* BUTTONS */}
            <div className="flex justify-end gap-3 mt-8">

              <button
                onClick={() =>
                  setShowEdit(false)
                }
                className="px-5 py-2 rounded-lg bg-gray-500 text-white hover:bg-gray-600"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                className="px-5 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
              >
                Save Changes
              </button>

            </div>

          </div>

        </div>

      )}

      {/* ===========================
          FOOTER
      =========================== */}
      <div className="flex justify-between items-center mt-8 border-t pt-5">

        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 bg-slate-200 hover:bg-slate-300 px-5 py-2 rounded-lg"
          >
            <FaArrowLeft />
            Back to Dashboard
          </button>
        )}

      </div>

    </div>
  );
};

export default Users;
