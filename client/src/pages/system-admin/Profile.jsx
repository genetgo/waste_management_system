import React, { useEffect, useState } from "react";
import ErrorBoundary from "../../components/common/ErrorBoundary";
import Card from "../../components/common/Card";
import systemAdminService from "../../services/systemAdminService";

const Profile = () => {
  const [admin, setAdmin] = useState({
    fullName: "",
    username: "",
    email: "",
    phoneNumber: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // ==========================================
  // LOAD PROFILE
  // ==========================================
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);

      const response = await systemAdminService.getProfile();

      console.log("PROFILE RESPONSE:", response);

      // systemAdminService.getProfile() returns response.data
      const profile =
        response?.profile ||
        response?.data?.profile ||
        response?.data ||
        {};

      setAdmin((prev) => ({
        ...prev,

        fullName: profile.full_name ?? "",
        username: profile.username ?? "",
        email: profile.email ?? "",
        phoneNumber: profile.phone_number ?? "",

        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (error) {
      console.error("Load Profile Error:", error);

      alert(
        error?.response?.data?.message ||
          "Failed to load profile."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // HANDLE INPUT
  // ==========================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setAdmin((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==========================================
  // UPDATE PROFILE
  // ==========================================
  const handleSaveProfile = async (e) => {
  e.preventDefault();

  try {
    setSaving(true);

    const profileData = {
      full_name: admin.fullName.trim(),
      username: admin.username.trim(),
      email: admin.email.trim(),
      phone_number: admin.phoneNumber.trim(),
    };

    console.log("Request Body:", profileData);

    const response =
      await systemAdminService.updateProfile(profileData);

    console.log("Update Response:", response);

    setAdmin((prev) => ({
      ...prev,
      fullName:
        response?.profile?.full_name ??
        profileData.full_name,

      username:
        response?.profile?.username ??
        profileData.username,

      email:
        response?.profile?.email ??
        profileData.email,

      phoneNumber:
        response?.profile?.phone_number ??
        profileData.phone_number,
    }));

    alert("Profile updated successfully.");

  } catch (error) {
    console.error("Update Profile Error:", error);

    alert(
      error?.response?.data?.message ||
      "Failed to update profile."
    );
  } finally {
    setSaving(false);
  }
};


  // ==========================================
  // CHANGE PASSWORD
  // ==========================================
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!admin.currentPassword) {
      alert("Please enter your current password.");
      return;
    }

    if (!admin.newPassword) {
      alert("Please enter a new password.");
      return;
    }

    if (admin.newPassword.length < 6) {
      alert("New password must be at least 6 characters.");
      return;
    }

    if (!admin.confirmPassword) {
      alert("Please confirm your new password.");
      return;
    }

    if (admin.newPassword !== admin.confirmPassword) {
      alert(
        "New password and confirmation password do not match."
      );
      return;
    }

    try {
      setChangingPassword(true);

      await systemAdminService.changePassword({
        currentPassword: admin.currentPassword,
        newPassword: admin.newPassword,
      });

      alert("Password changed successfully.");

      setAdmin((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (error) {
      console.error(
        "Change Password Error:",
        error
      );

      alert(
        error?.response?.data?.message ||
          "Failed to change password."
      );
    } finally {
      setChangingPassword(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================
  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-500">
          Loading profile...
        </p>
      </div>
    );
  }

  // ==========================================
  // UI
  // ==========================================
  return (
    <ErrorBoundary>
      <div className="space-y-6">

        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Account Settings
          </h1>

          <p className="text-gray-500 mt-1 text-sm">
            Update your personal information and security settings.
          </p>
        </div>

        {/* ==========================================
            PERSONAL INFORMATION
        ========================================== */}
        <Card className="p-6 rounded-2xl shadow-md">

          <form onSubmit={handleSaveProfile}>

            <h2 className="text-xl font-bold text-emerald-700 mb-5">
              Personal Information
            </h2>

            <div className="space-y-4">

              {/* FULL NAME */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Full Name
                </label>

                <input
                  type="text"
                  name="fullName"
                  value={admin.fullName}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* USERNAME */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Username
                </label>

                <input
                  type="text"
                  name="username"
                  value={admin.username}
                  onChange={handleChange}
                  placeholder="Enter username"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* EMAIL */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={admin.email}
                  onChange={handleChange}
                  placeholder="Enter email"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* PHONE */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Phone Number
                </label>

                <input
                  type="tel"
                  name="phoneNumber"
                  value={admin.phoneNumber}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  autoComplete="tel"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

            </div>

            {/* BUTTONS */}
            <div className="flex gap-3 mt-5">

              <button
                type="submit"
                disabled={saving}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white px-6 py-2.5 rounded-lg font-semibold text-sm"
              >
                {saving
                  ? "Saving..."
                  : "Update Profile"}
              </button>

              

            </div>

          </form>

        </Card>

        {/* ==========================================
            CHANGE PASSWORD
        ========================================== */}
        <Card className="p-6 rounded-2xl shadow-md">

          <form onSubmit={handleChangePassword}>

            <h2 className="text-xl font-bold text-black-700 mb-5">
              Change Password
            </h2>

            <div className="space-y-4">

              {/* CURRENT PASSWORD */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Current Password
                </label>

                <input
                  type="password"
                  name="currentPassword"
                  value={admin.currentPassword}
                  onChange={handleChange}
                  placeholder="Current Password"
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* NEW PASSWORD */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  New Password
                </label>

                <input
                  type="password"
                  name="newPassword"
                  value={admin.newPassword}
                  onChange={handleChange}
                  placeholder="New Password"
                  required
                  minLength={6}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* CONFIRM PASSWORD */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Confirm New Password
                </label>

                <input
                  type="password"
                  name="confirmPassword"
                  value={admin.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm New Password"
                  required
                  minLength={6}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

            </div>

            <button
              type="submit"
              disabled={changingPassword}
               className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white px-6 py-2.5 rounded-lg font-semibold text-sm"
              >
              {changingPassword
                ? "Changing Password..."
                : "Change Password"}
            </button>

          </form>

        </Card>

      </div>
    </ErrorBoundary>
  );
};

export default Profile;