
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

// API
import API from "../../services/api";

// Common Components
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import Toast from "../../components/common/Toast";
import Loader from "../../components/common/Loader";
import ErrorBoundary from "../../components/common/ErrorBoundary";

const Profile = () => {
  // =====================================================
  // TRANSLATION
  // =====================================================

  const { t } = useTranslation();

  // =====================================================
  // LOCATION DATA
  // =====================================================

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

  // =====================================================
  // PROFILE STATE
  // =====================================================

  const [profile, setProfile] = useState({
    businessName: "",
    ownerName: "",
    businessType: "",
    phoneNumber: "",
    email: "",
    kifleKetema: "",
    kebele: "",
    sefer: "",
  });

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // =====================================================
  // PASSWORD STATE
  // =====================================================

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [changingPassword, setChangingPassword] = useState(false);

  // =====================================================
  // TOAST
  // =====================================================

  const [toast, setToast] = useState({
    show: false,
    type: "success",
    message: "",
  });

  // =====================================================
  // LOAD BUSINESS PROFILE
  // =====================================================

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);

      const response = await API.get("/business/profile");

      console.log("Business Profile Response:", response.data);

      const business = response.data?.data;

      if (!business) {
        throw new Error(
          t("profile.messages.profileNotLoaded")
        );
      }

      setProfile({
        businessName: business.business_name || "",
        ownerName: business.owner_name || "",
        businessType: business.business_type || "",
        phoneNumber: business.phone_number || "",
        email: business.email || "",
        kifleKetema:
          business.kifle_ketema ||
          business.assigned_kifle_ketema ||
          "",
        kebele: business.kebele || "",
        sefer: business.sefer || "",
      });
    } catch (error) {
      console.error(
        "Load business profile error:",
        error.response?.data || error
      );

      setToast({
        show: true,
        type: "error",
        message:
          error.response?.data?.message ||
          error.message ||
          t("profile.messages.loadFailed"),
      });
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // PROFILE INPUT CHANGE
  // =====================================================

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

  // =====================================================
  // PASSWORD INPUT CHANGE
  // =====================================================

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;

    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================================
  // UPDATE BUSINESS PROFILE
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setUpdating(true);

    setToast({
      show: false,
      type: "success",
      message: "",
    });

    // ===================================================
    // VALIDATION
    // ===================================================

    if (!profile.businessName.trim()) {
      setToast({
        show: true,
        type: "error",
        message: t("profile.validation.businessNameRequired"),
      });

      setUpdating(false);
      return;
    }

    if (!profile.ownerName.trim()) {
      setToast({
        show: true,
        type: "error",
        message: t("profile.validation.ownerNameRequired"),
      });

      setUpdating(false);
      return;
    }

    if (!/^09\d{8}$/.test(profile.phoneNumber.trim())) {
      setToast({
        show: true,
        type: "error",
        message: t("profile.validation.phoneInvalid"),
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
        message: t("profile.validation.emailInvalid"),
      });

      setUpdating(false);
      return;
    }

    if (!profile.kifleKetema) {
      setToast({
        show: true,
        type: "error",
        message: t("profile.validation.kifleKetemaRequired"),
      });

      setUpdating(false);
      return;
    }

    if (!profile.kebele) {
      setToast({
        show: true,
        type: "error",
        message: t("profile.validation.kebeleRequired"),
      });

      setUpdating(false);
      return;
    }

    if (!profile.sefer) {
      setToast({
        show: true,
        type: "error",
        message: t("profile.validation.seferRequired"),
      });

      setUpdating(false);
      return;
    }

    // ===================================================
    // UPDATE
    // ===================================================

    try {
      const payload = {
        business_name: profile.businessName.trim(),
        owner_name: profile.ownerName.trim(),
        business_type: profile.businessType.trim(),
        phone_number: profile.phoneNumber.trim(),
        email: profile.email.trim().toLowerCase(),
        kifle_ketema: profile.kifleKetema,
        kebele: profile.kebele,
        sefer: profile.sefer,
      };

      console.log("Business Profile Update:", payload);

      const response = await API.put(
        "/business/profile",
        payload
      );

      console.log(
        "Business Profile Update Response:",
        response.data
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            t("profile.messages.updateFailed")
        );
      }

      const business = response.data?.data;

      if (business) {
        setProfile({
          businessName: business.business_name || "",
          ownerName: business.owner_name || "",
          businessType: business.business_type || "",
          phoneNumber: business.phone_number || "",
          email: business.email || "",
          kifleKetema:
            business.kifle_ketema ||
            business.assigned_kifle_ketema ||
            "",
          kebele: business.kebele || "",
          sefer: business.sefer || "",
        });
      }

      setToast({
        show: true,
        type: "success",
        message:
          response.data?.message ||
          t("profile.messages.profileUpdated"),
      });
    } catch (error) {
      console.error(
        "Update business profile error:",
        error.response?.data || error
      );

      setToast({
        show: true,
        type: "error",
        message:
          error.response?.data?.message ||
          error.message ||
          t("profile.messages.updateFailed"),
      });
    } finally {
      setUpdating(false);
    }
  };

  // =====================================================
  // CHANGE PASSWORD
  // =====================================================

  const handleChangePassword = async (e) => {
    e.preventDefault();

    setChangingPassword(true);

    setToast({
      show: false,
      type: "success",
      message: "",
    });

    // ===================================================
    // VALIDATION
    // ===================================================

    if (!passwordData.currentPassword) {
      setToast({
        show: true,
        type: "error",
        message: t(
          "profile.validation.currentPasswordRequired"
        ),
      });

      setChangingPassword(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setToast({
        show: true,
        type: "error",
        message: t(
          "profile.validation.newPasswordLength"
        ),
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
        message: t(
          "profile.validation.passwordMismatch"
        ),
      });

      setChangingPassword(false);
      return;
    }

    // ===================================================
    // CHANGE PASSWORD
    // ===================================================

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

      console.log(
        "Change Password Response:",
        response.data
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            t(
              "profile.messages.passwordChangeFailed"
            )
        );
      }

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
          t("profile.messages.passwordChanged"),
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
          t(
            "profile.messages.passwordChangeFailed"
          ),
      });
    } finally {
      setChangingPassword(false);
    }
  };

  // =====================================================
  // LOCATION TRANSLATION HELPERS
  // =====================================================

  const getLocationLabel = (value) => {
    if (!value) return value;

    return t(`register.locations.${value}`, {
      defaultValue: value,
    });
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader />
      </div>
    );
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <ErrorBoundary>
      <div className="p-6 max-w-4xl mx-auto space-y-6">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="border-b pb-4">
          <h1 className="text-2xl font-bold text-gray-800">
            {t("profile.title")}
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            {t("profile.subtitle")}
          </p>
        </div>

        {/* =================================================
            BUSINESS INFORMATION
        ================================================= */}

        <Card>
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            <div>
              <h2 className="text-lg font-bold text-gray-800">
                {t("profile.businessInformation.title")}
              </h2>

              <p className="text-xs text-gray-500 mt-1">
                {t(
                  "profile.businessInformation.description"
                )}
              </p>
            </div>

            {/* Business + Owner */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <Input
                label={t(
                  "profile.fields.businessName"
                )}
                type="text"
                name="businessName"
                value={profile.businessName}
                onChange={handleChange}
                placeholder={t(
                  "profile.placeholders.businessName"
                )}
                required
              />

              <Input
                label={t(
                  "profile.fields.ownerName"
                )}
                type="text"
                name="ownerName"
                value={profile.ownerName}
                onChange={handleChange}
                placeholder={t(
                  "profile.placeholders.ownerName"
                )}
                required
              />

            </div>

            {/* Type + Phone + Email */}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              <Input
                label={t(
                  "profile.fields.businessType"
                )}
                type="text"
                name="businessType"
                value={profile.businessType}
                onChange={handleChange}
                placeholder={t(
                  "profile.placeholders.businessType"
                )}
              />

              <Input
                label={t(
                  "profile.fields.phoneNumber"
                )}
                type="tel"
                name="phoneNumber"
                value={profile.phoneNumber}
                onChange={handleChange}
                placeholder={t(
                  "profile.placeholders.phoneNumber"
                )}
                required
              />

              <Input
                label={t("profile.fields.email")}
                type="email"
                name="email"
                value={profile.email}
                onChange={handleChange}
                placeholder={t(
                  "profile.placeholders.email"
                )}
                required
              />

            </div>

            {/* =================================================
                LOCATION
            ================================================= */}

            <div className="border-t pt-5">

              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                {t("profile.location.title")}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                {/* Kifle Ketema */}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t(
                      "profile.fields.kifleKetema"
                    )}
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
                      {t(
                        "profile.placeholders.selectKifleKetema"
                      )}
                    </option>

                    {Object.keys(locations).map(
                      (item) => (
                        <option
                          key={item}
                          value={item}
                        >
                          {getLocationLabel(item)}
                        </option>
                      )
                    )}

                  </select>
                </div>

                {/* Kebele */}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("profile.fields.kebele")}
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
                      {t(
                        "profile.placeholders.selectKebele"
                      )}
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
                          {getLocationLabel(kebele)}
                        </option>
                      ))}

                  </select>
                </div>

                {/* Sefer */}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("profile.fields.sefer")}
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
                      {t(
                        "profile.placeholders.selectSefer"
                      )}
                    </option>

                    {profile.kifleKetema &&
                      profile.kebele &&
                      (
                        locations[
                          profile.kifleKetema
                        ]?.[profile.kebele] || []
                      ).map((sefer) => (
                        <option
                          key={sefer}
                          value={sefer}
                        >
                          {getLocationLabel(sefer)}
                        </option>
                      ))}

                  </select>
                </div>

              </div>
            </div>

            {/* =================================================
                UPDATE BUTTON
            ================================================= */}

            <Button
              type="submit"
              variant="primary"
              loading={updating}
              className="w-full"
            >
              {updating
                ? t("profile.buttons.saving")
                : t("profile.buttons.updateProfile")}
            </Button>

          </form>
        </Card>

        {/* =================================================
            CHANGE PASSWORD
        ================================================= */}

        <Card>
          <form
            onSubmit={handleChangePassword}
            className="space-y-5"
          >

            <div className="border-b pb-4">

              <h2 className="text-lg font-bold text-gray-800">
                {t("profile.password.title")}
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                {t("profile.password.description")}
              </p>

            </div>

            <Input
              label={t(
                "profile.password.currentPassword"
              )}
              type="password"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              placeholder={t(
                "profile.password.currentPlaceholder"
              )}
              required
            />

            <Input
              label={t(
                "profile.password.newPassword"
              )}
              type="password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              placeholder={t(
                "profile.password.newPlaceholder"
              )}
              required
            />

            <Input
              label={t(
                "profile.password.confirmPassword"
              )}
              type="password"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              placeholder={t(
                "profile.password.confirmPlaceholder"
              )}
              required
            />

            <Button
              type="submit"
              variant="primary"
              loading={changingPassword}
              className="w-full"
            >
              {changingPassword
                ? t("profile.password.changing")
                : t("profile.password.change")}
            </Button>

          </form>
        </Card>

        {/* =================================================
            TOAST
        ================================================= */}

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