
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import API from "../../services/api";

const Profile = () => {
  const { t } = useTranslation();

  const [profile, setProfile] = useState({
    full_name: "",
    phone_number: "",
    email: "",
    assigned_kifle_ketema: "",
    kebele: "",
    is_active: true,
  });

  const [password, setPassword] = useState({
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
      const res = await API.get("/collectors/profile");

      setProfile(res.data.data || res.data);
    } catch (err) {
      console.error(err);
      alert(t("collectorProfile.failedToLoadProfile"));
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // PROFILE INPUT CHANGE
  // ==========================================
  const handleProfileChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  // ==========================================
  // PASSWORD INPUT CHANGE
  // ==========================================
  const handlePasswordChange = (e) => {
    setPassword({
      ...password,
      [e.target.name]: e.target.value,
    });
  };

  // ==========================================
  // UPDATE PROFILE
  // ==========================================
  const updateProfile = async () => {
    try {
      setSaving(true);

      await API.put("/collectors/profile", {
        full_name: profile.full_name,
        phone_number: profile.phone_number,
        email: profile.email,
      });

      alert(t("collectorProfile.profileUpdated"));
    } catch (err) {
      console.error(err);
      alert(t("collectorProfile.failedToUpdateProfile"));
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // CHANGE PASSWORD
  // ==========================================
  const changePassword = async () => {
    if (
      !password.currentPassword ||
      !password.newPassword ||
      !password.confirmPassword
    ) {
      return alert(t("collectorProfile.fillAllPasswordFields"));
    }

    if (password.newPassword !== password.confirmPassword) {
      return alert(t("collectorProfile.passwordsDoNotMatch"));
    }

    try {
      setChangingPassword(true);

      await API.put("/collectors/change-password", {
        currentPassword: password.currentPassword,
        newPassword: password.newPassword,
      });

      alert(t("collectorProfile.passwordChanged"));

      setPassword({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.message ||
          t("collectorProfile.failedToChangePassword")
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
        {t("collectorProfile.loadingProfile")}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">

      {/* ======================================
          PROFILE TITLE
      ====================================== */}
      <h1 className="text-3xl font-bold mb-6">
        {t("collectorProfile.title")}
      </h1>

      {/* ======================================
          PROFILE INFORMATION
      ====================================== */}
      <div className="bg-white shadow rounded-xl p-6">

        <div className="grid md:grid-cols-2 gap-5">

          {/* FULL NAME */}
          <div>
            <label className="block text-sm mb-1">
              {t("collectorProfile.fullName")}
            </label>

            <input
              className="w-full border rounded-lg p-2"
              name="full_name"
              value={profile.full_name || ""}
              onChange={handleProfileChange}
            />
          </div>

          {/* PHONE */}
          <div>
            <label className="block text-sm mb-1">
              {t("collectorProfile.phoneNumber")}
            </label>

            <input
              className="w-full border rounded-lg p-2"
              name="phone_number"
              value={profile.phone_number || ""}
              onChange={handleProfileChange}
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="block text-sm mb-1">
              {t("collectorProfile.email")}
            </label>

            <input
              type="email"
              className="w-full border rounded-lg p-2"
              name="email"
              value={profile.email || ""}
              onChange={handleProfileChange}
            />
          </div>

          {/* ASSIGNED KIFLE KETEMA */}
          <div>
            <label className="block text-sm mb-1">
              {t("collectorProfile.assignedKifleKetema")}
            </label>

            <input
              className="w-full border rounded-lg p-2 bg-gray-100"
              value={profile.assigned_kifle_ketema || ""}
              disabled
            />
          </div>

          {/* KEBELE */}
          <div>
            <label className="block text-sm mb-1">
              {t("collectorProfile.kebele")}
            </label>

            <input
              className="w-full border rounded-lg p-2 bg-gray-100"
              value={profile.kebele || ""}
              disabled
            />
          </div>

          {/* STATUS */}
          <div>
            <label className="block text-sm mb-1">
              {t("collectorProfile.status")}
            </label>

            <input
              className="w-full border rounded-lg p-2 bg-gray-100"
              value={
                profile.is_active
                  ? t("collectorProfile.active")
                  : t("collectorProfile.inactive")
              }
              disabled
            />
          </div>

        </div>

        {/* UPDATE BUTTON */}
        <button
          onClick={updateProfile}
          disabled={saving}
          className="mt-6 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg"
        >
          {saving
            ? t("collectorProfile.saving")
            : t("collectorProfile.updateProfile")}
        </button>

      </div>

      {/* ======================================
          CHANGE PASSWORD
      ====================================== */}
      <div className="bg-white shadow rounded-xl p-6 mt-8">

        <h2 className="text-xl font-bold mb-4">
          {t("collectorProfile.changePassword")}
        </h2>

        <div className="space-y-4">

          {/* CURRENT PASSWORD */}
          <input
            type="password"
            name="currentPassword"
            placeholder={t("collectorProfile.currentPassword")}
            value={password.currentPassword}
            onChange={handlePasswordChange}
            className="w-full border rounded-lg p-2"
          />

          {/* NEW PASSWORD */}
          <input
            type="password"
            name="newPassword"
            placeholder={t("collectorProfile.newPassword")}
            value={password.newPassword}
            onChange={handlePasswordChange}
            className="w-full border rounded-lg p-2"
          />

          {/* CONFIRM PASSWORD */}
          <input
            type="password"
            name="confirmPassword"
            placeholder={t("collectorProfile.confirmNewPassword")}
            value={password.confirmPassword}
            onChange={handlePasswordChange}
            className="w-full border rounded-lg p-2"
          />

          {/* CHANGE PASSWORD BUTTON */}
          <button
            onClick={changePassword}
            disabled={changingPassword}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg"
          >
            {changingPassword
              ? t("collectorProfile.changing")
              : t("collectorProfile.changePasswordButton")}
          </button>

        </div>

      </div>

    </div>
  );
};

export default Profile;
