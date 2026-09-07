
// src/pages/resident/Profile.jsx

import React, { useEffect, useState } from "react";

// API
import API from "../../services/api";

// Shared Common Components
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import Toast from "../../components/common/Toast";
import ErrorBoundary from "../../components/common/ErrorBoundary";

const Profile = () => {

  // ==========================================
  // Location Data
  // ==========================================
  const locations = {
    Abima: {
      "Kebele 01": ["Sefer 01", "Sefer 02", "Sefer 03", "Sefer 04"],
      "Kebele 02": ["Sefer 01", "Sefer 02", "Sefer 03", "Sefer 04"],
      "Kebele 03": ["Sefer 01", "Sefer 02", "Sefer 03", "Sefer 04"],
      "Kebele 04": ["Sefer 01", "Sefer 02", "Sefer 03", "Sefer 04"],
    },

    Menkorer: {
      "Kebele 05": ["Sefer 01", "Sefer 02", "Sefer 03", "Sefer 04"],
      "Kebele 06": ["Sefer 01", "Sefer 02", "Sefer 03", "Sefer 04"],
      "Kebele 07": ["Sefer 01", "Sefer 02", "Sefer 03", "Sefer 04"],
      "Kebele 08": ["Sefer 01", "Sefer 02", "Sefer 03", "Sefer 04"],
    },

    "Nigus Teklehaymanot": {
      "Kebele 09": ["Sefer 01", "Sefer 02", "Sefer 03", "Sefer 04"],
      "Kebele 10": ["Sefer 01", "Sefer 02", "Sefer 03", "Sefer 04"],
      "Kebele 11": ["Sefer 01", "Sefer 02", "Sefer 03", "Sefer 04"],
      "Kebele 12": ["Sefer 01", "Sefer 02", "Sefer 03", "Sefer 04"],
      "Kebele 13": ["Sefer 01", "Sefer 02", "Sefer 03", "Sefer 04"],
    },

    "Tedila Gualu": {
      "Kebele 14": ["Sefer 01", "Sefer 02", "Sefer 03", "Sefer 04"],
      "Kebele 15": ["Sefer 01", "Sefer 02", "Sefer 03", "Sefer 04"],
      "Kebele 16": ["Sefer 01", "Sefer 02", "Sefer 03", "Sefer 04"],
      "Kebele 17": ["Sefer 01", "Sefer 02", "Sefer 03", "Sefer 04"],
      "Kebele 18": ["Sefer 01", "Sefer 02", "Sefer 03", "Sefer 04"],
    },
  };

  // ==========================================
  // Profile State
  // ==========================================
  const [profile, setProfile] = useState({
    fullName: "",
    phone: "",
    email: "",
    kifleKetema: "",
    kebele: "",
    sefer: "",
  });

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // ==========================================
  // Change Password State
  // ==========================================
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [changingPassword, setChangingPassword] = useState(false);

  // ==========================================
  // Toast
  // ==========================================
  const [toast, setToast] = useState({
    show: false,
    type: "success",
    message: "",
  });

  // ==========================================
  // Load Profile
  // ==========================================
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);

      const response = await API.get("/residents/profile");

      const resident = response.data?.data;

      if (!resident) {
        throw new Error("Resident profile could not be loaded.");
      }

      setProfile({
        fullName: resident.full_name || "",
        phone: resident.phone_number || "",
        email: resident.email || "",
        kifleKetema: resident.kifle_ketema || "",
        kebele: resident.kebele || "",
        sefer: resident.sefer || "",
      });

    } catch (error) {
      console.error(
        "Load resident profile error:",
        error.response?.data || error
      );

      setToast({
        show: true,
        type: "error",
        message:
          error.response?.data?.message ||
          "Failed to load profile.",
      });
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // Profile Input Change
  // ==========================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setProfile((prev) => {

      if (name === "kifleKetema") {
        return {
          ...prev,
          kifleKetema: value,
          kebele: "",
          sefer: "",
        };
      }

      if (name === "kebele") {
        return {
          ...prev,
          kebele: value,
          sefer: "",
        };
      }

      return {
        ...prev,
        [name]: value,
      };
    });
  };

  // ==========================================
  // Password Input Change
  // ==========================================
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;

    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==========================================
  // Update Profile
  // ==========================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setUpdating(true);

    setToast({
      show: false,
      type: "success",
      message: "",
    });

    if (!profile.fullName.trim()) {
      setToast({
        show: true,
        type: "error",
        message: "Full name is required.",
      });

      setUpdating(false);
      return;
    }

    if (!/^09\d{8}$/.test(profile.phone.trim())) {
      setToast({
        show: true,
        type: "error",
        message:
          "Phone number must be exactly 10 digits and start with 09.",
      });

      setUpdating(false);
      return;
    }

    if (
      !/^[A-Za-z0-9._%+-]+@gmail\.com$/i.test(
        profile.email.trim()
      )
    ) {
      setToast({
        show: true,
        type: "error",
        message: "Please enter a valid Gmail address.",
      });

      setUpdating(false);
      return;
    }

    if (!profile.kifleKetema) {
      setToast({
        show: true,
        type: "error",
        message: "Kifle Ketema is required.",
      });

      setUpdating(false);
      return;
    }

    if (!profile.kebele) {
      setToast({
        show: true,
        type: "error",
        message: "Kebele is required.",
      });

      setUpdating(false);
      return;
    }

    if (!profile.sefer) {
      setToast({
        show: true,
        type: "error",
        message: "Sefer is required.",
      });

      setUpdating(false);
      return;
    }

    try {
      const payload = {
        full_name: profile.fullName.trim(),
        phone_number: profile.phone.trim(),
        email: profile.email.trim().toLowerCase(),
        kifle_ketema: profile.kifleKetema,
        kebele: profile.kebele,
        sefer: profile.sefer,
      };

      const response = await API.put(
        "/residents/profile",
        payload
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
          "Profile update failed."
        );
      }

      const resident = response.data?.data;

      if (resident) {
        setProfile({
          fullName: resident.full_name || "",
          phone: resident.phone_number || "",
          email: resident.email || "",
          kifleKetema: resident.kifle_ketema || "",
          kebele: resident.kebele || "",
          sefer: resident.sefer || "",
        });
      }

      setToast({
        show: true,
        type: "success",
        message:
          response.data?.message ||
          "Profile updated successfully!",
      });

    } catch (error) {
      console.error(
        "Update resident profile error:",
        error.response?.data || error
      );

      setToast({
        show: true,
        type: "error",
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to update profile details.",
      });
    } finally {
      setUpdating(false);
    }
  };

  // ==========================================
  // CHANGE PASSWORD
  // ==========================================
  const handleChangePassword = async (e) => {
    e.preventDefault();

    setChangingPassword(true);

    setToast({
      show: false,
      type: "success",
      message: "",
    });

    // ------------------------------------------
    // Validation
    // ------------------------------------------
    if (!passwordData.currentPassword) {
      setToast({
        show: true,
        type: "error",
        message: "Current password is required.",
      });

      setChangingPassword(false);
      return;
    }

    if (!passwordData.newPassword) {
      setToast({
        show: true,
        type: "error",
        message: "New password is required.",
      });

      setChangingPassword(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setToast({
        show: true,
        type: "error",
        message:
          "New password must be at least 6 characters.",
      });

      setChangingPassword(false);
      return;
    }

    if (
      passwordData.newPassword !==
      passwordData.confirmPassword
    ) {
      setToast({
        show: true,
        type: "error",
        message:
          "New password and confirm password do not match.",
      });

      setChangingPassword(false);
      return;
    }

    if (
      passwordData.currentPassword ===
      passwordData.newPassword
    ) {
      setToast({
        show: true,
        type: "error",
        message:
          "New password must be different from your current password.",
      });

      setChangingPassword(false);
      return;
    }

    // ------------------------------------------
    // API Request
    // ------------------------------------------
    try {
      const response = await API.put(
        "/auth/change-password",
        {
          currentPassword:
            passwordData.currentPassword,

          newPassword:
            passwordData.newPassword,

          confirmPassword:
            passwordData.confirmPassword,
        }
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
          "Password change failed."
        );
      }

      // Clear password fields
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setToast({
        show: true,
        type: "success",
        message:
          response.data?.message ||
          "Password changed successfully!",
      });

    } catch (error) {
      console.error(
        "Change password error:",
        error.response?.data || error
      );

      setToast({
        show: true,
        type: "error",
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to change password.",
      });

    } finally {
      setChangingPassword(false);
    }
  };

  // ==========================================
  // Loading
  // ==========================================
  if (loading) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow p-10 text-center">
          <p className="text-gray-600 font-semibold">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // Render
  // ==========================================
  return (
    <ErrorBoundary>

      <div className="p-6 max-w-3xl mx-auto space-y-6">

        {/* ======================================
            HEADER
        ====================================== */}
        <div className="border-b pb-4">

          <h1 className="text-2xl font-bold text-gray-800">
            Resident Profile
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Personal address and residential information
          </p>

        </div>


        {/* ======================================
            PROFILE CARD
        ====================================== */}
        <Card>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <Input
                label="Full Name"
                type="text"
                name="fullName"
                value={profile.fullName}
                onChange={handleChange}
                required
                className="mb-0"
              />

              <Input
                label="Phone Number"
                type="tel"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                required
                className="mb-0"
              />

            </div>


            {/* Email */}
            <Input
              label="Email Address"
              type="email"
              name="email"
              value={profile.email}
              onChange={handleChange}
              required
              className="mb-0"
            />


            {/* ==================================
                LOCATION
            ================================== */}
            <div className="border-t pt-5">

              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Residential Location
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                {/* Kifle Ketema */}
                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kifle Ketema
                  </label>

                  <select
                    name="kifleKetema"
                    value={profile.kifleKetema}
                    onChange={handleChange}
                    required
                    className="
                      w-full
                      border
                      border-gray-300
                      rounded-xl
                      px-4
                      py-3
                      bg-white
                      text-gray-700
                      outline-none
                      focus:ring-2
                      focus:ring-green-500
                      focus:border-green-500
                    "
                  >

                    <option value="">
                      Select Kifle Ketema
                    </option>

                    {Object.keys(locations).map(
                      (item) => (
                        <option
                          key={item}
                          value={item}
                        >
                          {item}
                        </option>
                      )
                    )}

                  </select>

                </div>


                {/* Kebele */}
                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kebele
                  </label>

                  <select
                    name="kebele"
                    value={profile.kebele}
                    onChange={handleChange}
                    disabled={!profile.kifleKetema}
                    required
                    className="
                      w-full
                      border
                      border-gray-300
                      rounded-xl
                      px-4
                      py-3
                      bg-white
                      text-gray-700
                      outline-none
                      focus:ring-2
                      focus:ring-green-500
                      focus:border-green-500
                      disabled:bg-gray-100
                      disabled:text-gray-400
                      disabled:cursor-not-allowed
                    "
                  >

                    <option value="">
                      Select Kebele
                    </option>

                    {profile.kifleKetema &&
                      Object.keys(
                        locations[
                          profile.kifleKetema
                        ] || {}
                      ).map((kebele) => (
                        <option
                          key={kebele}
                          value={kebele}
                        >
                          {kebele}
                        </option>
                      ))}

                  </select>

                </div>


                {/* Sefer */}
                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sefer
                  </label>

                  <select
                    name="sefer"
                    value={profile.sefer}
                    onChange={handleChange}
                    disabled={!profile.kebele}
                    required
                    className="
                      w-full
                      border
                      border-gray-300
                      rounded-xl
                      px-4
                      py-3
                      bg-white
                      text-gray-700
                      outline-none
                      focus:ring-2
                      focus:ring-green-500
                      focus:border-green-500
                      disabled:bg-gray-100
                      disabled:text-gray-400
                      disabled:cursor-not-allowed
                    "
                  >

                    <option value="">
                      Select Sefer
                    </option>

                    {profile.kifleKetema &&
                      profile.kebele &&
                      (
                        locations[
                          profile.kifleKetema
                        ]?.[
                          profile.kebele
                        ] || []
                      ).map((sefer) => (
                        <option
                          key={sefer}
                          value={sefer}
                        >
                          {sefer}
                        </option>
                      ))}

                  </select>

                </div>

              </div>

            </div>


            {/* Update Profile */}
            <Button
              type="submit"
              variant="primary"
              loading={updating}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white px-6 py-2.5 rounded-lg font-semibold text-sm"
              >
              {updating
                ? "Saving Changes..."
                : "Update Profile"}
            </Button>

          </form>

        </Card>


        {/* ======================================
            CHANGE PASSWORD
        ====================================== */}
        <Card>

          <div className="border-b pb-4 mb-5">

            <h2 className="text-xl font-bold text-gray-800">
              Change Password
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Update your account password to keep
              your account secure.
            </p>

          </div>


          <form
            onSubmit={handleChangePassword}
            className="space-y-5"
          >

            {/* Current Password */}
            <Input
              label="Current Password"
              type="password"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              placeholder="Enter your current password"
              required
            />


            {/* New Password */}
            <Input
              label="New Password"
              type="password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              placeholder="Enter your new password"
              required
            />

            <p className="text-xs text-gray-500 -mt-3">
              Password must be at least 6 characters.
            </p>


            {/* Confirm Password */}
            <Input
              label="Confirm New Password"
              type="password"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              placeholder="Confirm your new password"
              required
            />


            {/* Change Password Button */}
            <Button
              type="submit"
              variant="primary"
              loading={changingPassword}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white px-6 py-2.5 rounded-lg font-semibold text-sm"
              >
              {changingPassword
                ? "Changing Password..."
                : "Change Password"}
            </Button>

          </form>

        </Card>


        {/* ======================================
            TOAST
        ====================================== */}
        {toast.show && (
          <Toast
            type={toast.type}
            message={toast.message}
            onClose={() =>
              setToast({
                show: false,
                type: "success",
                message: "",
              })
            }
          />
        )}

      </div>

    </ErrorBoundary>
  );
};

export default Profile;
