
// src/pages/business/OnDemandRequest.jsx

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  ZoomControl,
  useMap,
  useMapEvents,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

import requestService from "../../services/requestService";
import businessService from "../../services/businessService";
import CurrentLocationButton from "../../components/maps/CurrentLocationButton";
import Toast from "../../components/common/Toast";

// ======================================================
// Leaflet Default Marker Fix
// ======================================================

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ======================================================
// Default Map Center - Debre Markos
// ======================================================

const DEFAULT_CENTER = [10.3333, 37.7333];

// ======================================================
// Recenter Map
// ======================================================

const RecenterMap = ({ position }) => {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(position, 17, {
        animate: true,
        duration: 1.5,
      });
    }
  }, [position, map]);

  return null;
};

// ======================================================
// Location Marker
// ======================================================

const LocationMarker = ({
  position,
  setPosition,
  fetchAddress,
}) => {
  useMapEvents({
    click(e) {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;

      setPosition([lat, lng]);

      if (fetchAddress) {
        fetchAddress(lat, lng);
      }
    },
  });

  if (!position) {
    return null;
  }

  return (
    <Marker
      draggable
      position={position}
      eventHandlers={{
        dragend(e) {
          const marker = e.target;
          const latlng = marker.getLatLng();

          setPosition([
            latlng.lat,
            latlng.lng,
          ]);

          if (fetchAddress) {
            fetchAddress(
              latlng.lat,
              latlng.lng
            );
          }
        },
      }}
    />
  );
};

// ======================================================
// Main Component
// ======================================================

const OnDemandRequest = () => {
  const { t } = useTranslation();

  // ====================================================
  // STATE
  // ====================================================

  const [loading, setLoading] = useState(false);

  const [profileLoading, setProfileLoading] =
    useState(true);

  const [geoLoading, setGeoLoading] =
    useState(false);

  // ====================================================
  // TOAST
  // ====================================================

  const [toast, setToast] = useState({
    show: false,
    type: "success",
    message: "",
  });

  // ====================================================
  // BUSINESS PROFILE
  // ====================================================

  const [business, setBusiness] =
    useState(null);

  // ====================================================
  // MAP
  // ====================================================

  const [position, setPosition] =
    useState(DEFAULT_CENTER);

  const [accuracy, setAccuracy] =
    useState(null);

  // ====================================================
  // FORM STATE
  // ====================================================

  // NOTE:
  // Kifle Ketema, Kebele, Sefer and House Number
  // are NOT user inputs.
  // They come from Business Profile.
  const [formData, setFormData] = useState({
    collectionAddress: "",
    preferredCollectionDate: "",
    description: "",
  });

  // ====================================================
  // LOAD BUSINESS PROFILE
  // ====================================================

  useEffect(() => {
    const loadBusinessProfile = async () => {
      try {
        setProfileLoading(true);

        const response =
          await businessService.getProfile();

        console.log(
          "Business Profile Response:",
          response
        );

        let profileData = null;

        if (
          response?.success &&
          response?.data
        ) {
          profileData = response.data;
        } else if (
          response?.data?.data
        ) {
          profileData =
            response.data.data;
        } else if (
          response?.data
        ) {
          profileData =
            response.data;
        }

        if (!profileData) {
          throw new Error(
            t(
              "onDemand.businessProfileCouldNotLoad"
            )
          );
        }

        console.log(
          "Loaded Business:",
          profileData
        );

        setBusiness(profileData);
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
            t(
              "onDemand.failedToLoadBusiness"
            ),
        });
      } finally {
        setProfileLoading(false);
      }
    };

    loadBusinessProfile();
  }, [t]);

  // ====================================================
  // REVERSE GEOCODING
  // ====================================================

  const fetchAddressFromCoords = async (
    lat,
    lng
  ) => {
    console.log("LAT:", lat);
    console.log("LNG:", lng);

    try {
      setGeoLoading(true);

      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      );

      if (!response.ok) {
        throw new Error(
          `HTTP Error: ${response.status}`
        );
      }

      const data =
        await response.json();

      const locationName =
        data.locality ||
        data.city ||
        data.principalSubdivision ||
        data.countryName ||
        `Location (${lat.toFixed(
          4
        )}, ${lng.toFixed(4)})`;

      setFormData((prev) => ({
        ...prev,
        collectionAddress:
          locationName,
      }));
    } catch (error) {
      console.warn(
        "Geocoding failed:",
        error
      );

      setFormData((prev) => ({
        ...prev,
        collectionAddress:
          `Location (${lat.toFixed(
            4
          )}, ${lng.toFixed(4)})`,
      }));
    } finally {
      setGeoLoading(false);
    }
  };

  // ====================================================
  // AUTOMATICALLY DETECT CURRENT LOCATION
  // ====================================================

  useEffect(() => {
    if (!navigator.geolocation) {
      return;
    }

    setGeoLoading(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat =
          pos.coords.latitude;

        const lng =
          pos.coords.longitude;

        setPosition([
          lat,
          lng,
        ]);

        setAccuracy(
          pos.coords.accuracy
        );

        fetchAddressFromCoords(
          lat,
          lng
        );
      },

      () => {
        setGeoLoading(false);
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ====================================================
  // CURRENT LOCATION BUTTON
  // ====================================================

  const handleCurrentLocation =
    () => {
      if (!navigator.geolocation) {
        setToast({
          show: true,
          type: "error",
          message: t(
            "onDemand.geolocationNotSupported"
          ),
        });

        return;
      }

      setGeoLoading(true);

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat =
            pos.coords.latitude;

          const lng =
            pos.coords.longitude;

          setPosition([
            lat,
            lng,
          ]);

          setAccuracy(
            pos.coords.accuracy
          );

          fetchAddressFromCoords(
            lat,
            lng
          );
        },

        () => {
          setToast({
            show: true,
            type: "error",
            message: t(
              "onDemand.unableToRetrieveLocation"
            ),
          });

          setGeoLoading(false);
        },

        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    };

  // ====================================================
  // HANDLE INPUT
  // ====================================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ====================================================
  // SUBMIT REQUEST
  // ====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // -----------------------------------------------
    // Validate Business Profile
    // -----------------------------------------------

    if (!business) {
      setToast({
        show: true,
        type: "error",
        message: t(
          "onDemand.businessInformationNotLoaded"
        ),
      });

      return;
    }

    // -----------------------------------------------
    // Registered Business Location
    // -----------------------------------------------

    const kifleKetema =
      business.kifle_ketema ||
      business.assigned_kifle_ketema ||
      "";

    const kebele =
      business.kebele || "";

    const sefer =
      business.sefer || "";

    const houseNumber =
      business.house_number || "";

    // -----------------------------------------------
    // Validate Kifle Ketema
    // -----------------------------------------------

    if (!kifleKetema) {
      setToast({
        show: true,
        type: "error",
        message: t(
          "onDemand.kifleKetemaNotRegistered"
        ),
      });

      return;
    }

    // -----------------------------------------------
    // Validate Kebele
    // -----------------------------------------------

    if (!kebele) {
      setToast({
        show: true,
        type: "error",
        message: t(
          "onDemand.kebeleNotRegistered"
        ),
      });

      return;
    }

    // -----------------------------------------------
    // Validate Sefer
    // -----------------------------------------------

    if (!sefer) {
      setToast({
        show: true,
        type: "error",
        message: t(
          "onDemand.seferNotRegistered"
        ),
      });

      return;
    }

    // -----------------------------------------------
    // Validate House Number
    // -----------------------------------------------
    // House Number is READ-ONLY and comes
    // directly from Business Profile.

    if (!houseNumber) {
      setToast({
        show: true,
        type: "error",
        message:
          t("onDemand.houseNumberNotRegistered") ||
          "House number is not registered in your business profile.",
      });

      return;
    }

    // -----------------------------------------------
    // Validate Date
    // -----------------------------------------------

    if (
      !formData.preferredCollectionDate
    ) {
      setToast({
        show: true,
        type: "error",
        message: t(
          "onDemand.selectPreferredDate"
        ),
      });

      return;
    }

    // -----------------------------------------------
    // Validate Coordinates
    // -----------------------------------------------

    if (
      !Array.isArray(position) ||
      position.length < 2 ||
      !Number.isFinite(position[0]) ||
      !Number.isFinite(position[1])
    ) {
      setToast({
        show: true,
        type: "error",
        message:
          t("onDemand.locationRequired") ||
          "Please select a valid location.",
      });

      return;
    }

    try {
      setLoading(true);

      // =============================================
      // REQUEST PAYLOAD
      // =============================================

      const payload = {
        collection_address:
          formData.collectionAddress.trim(),

        // From Business Profile
        kifle_ketema:
          kifleKetema,

        kebele:
          kebele,

        sefer:
          sefer,

        // From Business Profile
        // NOT user input
        house_number:
          houseNumber,

        preferred_collection_date:
          formData.preferredCollectionDate,

        latitude:
          position[0],

        longitude:
          position[1],

        description:
          formData.description.trim(),
      };

      console.log(
        "SEND ON-DEMAND REQUEST:",
        payload
      );

      // =============================================
      // SEND REQUEST TO SERVER
      // =============================================

      const response =
        await requestService.createOnDemandRequest(
          payload
        );

      console.log(
        "SERVER RESPONSE:",
        response
      );

      // =============================================
      // SUCCESS TOAST
      // =============================================

      setToast({
        show: true,
        type: "success",
        message:
          response?.message ||
          response?.data?.message ||
          t(
            "onDemand.requestSubmitted"
          ),
      });

      // =============================================
      // RESET ONLY USER-ENTERED FIELDS
      // =============================================

      setFormData({
        collectionAddress: "",
        preferredCollectionDate: "",
        description: "",
      });
    } catch (error) {
      console.error(
        "Submit On-Demand Request Error:",
        error.response?.data || error
      );

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        t("onDemand.unableToSubmit");

      console.log(
        "TOAST ERROR MESSAGE:",
        errorMessage
      );

      setToast({
        show: true,
        type: "error",
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  // ====================================================
  // LOADING BUSINESS PROFILE
  // ====================================================

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white rounded-xl shadow p-8 text-center">

          <div className="animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto mb-4">
          </div>

          <p className="text-gray-600 font-semibold">
            {t(
              "onDemand.loadingBusinessInformation"
            )}
          </p>

        </div>
      </div>
    );
  }

  // ====================================================
  // REGISTERED BUSINESS LOCATION
  // ====================================================

  const registeredKifleKetema =
    business?.kifle_ketema ||
    business?.assigned_kifle_ketema ||
    t("common.notSet");

  const registeredKebele =
    business?.kebele ||
    t("common.notSet");

  const registeredSefer =
    business?.sefer ||
    t("common.notSet");

  const registeredHouseNumber =
    business?.house_number ||
    t("common.notSet");

  // ====================================================
  // JSX
  // ====================================================

  return (
    <>
      {/* =================================================
          TOAST
      ================================================= */}

      <Toast
        show={toast.show}
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

      <div className="max-w-7xl mx-auto p-6 space-y-6">

        {/* =============================================
            HEADER
        ============================================= */}

        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            {t("onDemand.title")}
          </h1>

          <p className="text-gray-500 mt-1">
            {t("onDemand.subtitle")}
          </p>
        </div>

        {/* =============================================
            FORM + MAP
        ============================================= */}

        <div className="grid lg:grid-cols-12 gap-6">

          {/* ==========================================
              FORM
          =========================================== */}

          <form
            onSubmit={handleSubmit}
            className="lg:col-span-5 bg-white shadow rounded-xl p-6 space-y-5"
          >

            {/* ========================================
                REGISTERED BUSINESS LOCATION
            ========================================= */}

            <div className="border rounded-xl bg-gray-50 p-4">

              <div className="flex items-center justify-between mb-4">

                <div>
                  <h2 className="font-bold text-gray-800">
                    {t(
                      "onDemand.businessLocation"
                    )}
                  </h2>

                  <p className="text-xs text-gray-500 mt-1">
                    {t(
                      "onDemand.registeredBusinessLocation"
                    )}
                  </p>
                </div>

                <span className="text-xl">
                  🏢
                </span>

              </div>

              {/* Kifle Ketema */}

              <div className="mb-3">
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  {t(
                    "common.kifleKetema"
                  )}
                </label>

                <div className="w-full border rounded-lg p-3 bg-white text-gray-700 font-semibold">
                  {registeredKifleKetema}
                </div>
              </div>

              {/* Kebele */}

              <div className="mb-3">
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  {t("common.kebele")}
                </label>

                <div className="w-full border rounded-lg p-3 bg-white text-gray-700 font-semibold">
                  {registeredKebele}
                </div>
              </div>

              {/* Sefer */}

              <div className="mb-3">
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  {t("common.sefer")}
                </label>

                <div className="w-full border rounded-lg p-3 bg-white text-gray-700 font-semibold">
                  {registeredSefer}
                </div>
              </div>

              {/* House Number */}

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  {t("onDemand.houseNumber") ||
                    "House Number"}
                </label>

                <div className="w-full border rounded-lg p-3 bg-white text-gray-700 font-semibold">
                  {registeredHouseNumber}
                </div>

                
              </div>

            </div>

            {/* ========================================
                PREFERRED COLLECTION DATE
            ========================================= */}

            <div>
              <label className="block text-sm font-medium mb-1">
                {t(
                  "onDemand.preferredCollectionDate"
                )}
              </label>

              <input
                type="date"
                name="preferredCollectionDate"
                min={
                  new Date()
                    .toISOString()
                    .split("T")[0]
                }
                value={
                  formData.preferredCollectionDate
                }
                onChange={handleChange}
                required
                className="
                  w-full
                  border
                  rounded-lg
                  p-3
                  focus:ring-2
                  focus:ring-emerald-500
                  outline-none
                "
              />
            </div>

            {/* ========================================
                DESCRIPTION
            ========================================= */}

            <div>
              <label className="block text-sm font-medium mb-1">
                {t(
                  "common.description"
                )}
              </label>

              <textarea
                rows={4}
                name="description"
                value={
                  formData.description
                }
                onChange={handleChange}
                placeholder={t(
                  "onDemand.descriptionPlaceholder"
                )}
                className="
                  w-full
                  border
                  rounded-lg
                  p-3
                  resize-none
                  focus:ring-2
                  focus:ring-emerald-500
                  outline-none
                "
              />
            </div>

            {/* ========================================
                COORDINATES
            ========================================= */}

            <div className="rounded-lg bg-gray-50 border p-4 space-y-2 text-sm">

              <div>
                <strong>
                  {t("common.latitude")}:
                </strong>{" "}

                {position[0].toFixed(6)}
              </div>

              <div>
                <strong>
                  {t("common.longitude")}:
                </strong>{" "}

                {position[1].toFixed(6)}
              </div>

            </div>

            {/* ========================================
                SUBMIT
            ========================================= */}

            <button
              type="submit"
              disabled={loading}
              className="
                w-full
                bg-emerald-600
                hover:bg-emerald-700
                disabled:bg-gray-400
                text-white
                rounded-lg
                py-3
                font-semibold
                transition
              "
            >
              {loading
                ? t("common.submitting")
                : t(
                    "onDemand.submitRequest"
                  )}
            </button>

          </form>

          {/* ==========================================
              MAP SECTION
          =========================================== */}

          <div className="lg:col-span-7 flex flex-col">

            <div className="flex justify-between items-center mb-3">

              <span className="text-sm text-gray-600">
                {t(
                  "onDemand.mapInstruction"
                )}
              </span>

              {geoLoading && (
                <span className="text-emerald-600 text-sm animate-pulse">
                  {t(
                    "onDemand.detectingLocation"
                  )}
                </span>
              )}

            </div>

            {/* Current Location */}

            <div className="mb-3">
              <CurrentLocationButton
                onClick={
                  handleCurrentLocation
                }
                loading={geoLoading}
              />
            </div>

            {/* Map */}

            <div className="relative h-[650px] rounded-xl overflow-hidden border shadow">

              <MapContainer
                center={position}
                zoom={15}
                zoomControl={false}
                className="w-full h-full"
              >

                <ZoomControl
                  position="bottomright"
                />

                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <RecenterMap
                  position={position}
                />

                <LocationMarker
                  position={position}
                  setPosition={
                    setPosition
                  }
                  fetchAddress={
                    fetchAddressFromCoords
                  }
                />

                {accuracy && (
                  <Circle
                    center={position}
                    radius={accuracy}
                    pathOptions={{
                      color: "#10b981",
                      fillColor: "#10b981",
                      fillOpacity: 0.15,
                    }}
                  />
                )}

              </MapContainer>

            </div>

            {/* Selected Details */}

            <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">

              <p className="font-semibold text-blue-700">
                📍{" "}
                {t(
                  "onDemand.selectedDetails"
                )}
              </p>

              <p className="mt-1">
                {t("common.location")}:

                <strong className="ml-1 text-gray-700">
                  {formData.collectionAddress ||
                    t(
                      "onDemand.notSelectedYet"
                    )}
                </strong>
              </p>

              {accuracy && (
                <p className="mt-1">
                  {t(
                    "onDemand.gpsAccuracy"
                  )}:

                  <strong>
                    {" "}
                    {Math.round(
                      accuracy
                    )}{" "}
                    {t("common.meters")}
                  </strong>
                </p>
              )}

            </div>

          </div>

        </div>

      </div>
    </>
  );
};

export default OnDemandRequest;
