// src/components/map/LeafletMap.jsx

import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  useMap,
  ZoomControl,
  Circle,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

import LocationMarker from "./LocationMarker";
import CurrentLocationButton from "./CurrentLocationButton";

const DEBRE_MARKOS_COORDS = [10.3333, 37.7333];

// ===============================================
// Recenter Map
// ===============================================
const MapRecenter = ({ location }) => {
  const map = useMap();

  useEffect(() => {
    if (location) {
      map.flyTo(
        [location.lat, location.lng],
        17,
        {
          animate: true,
          duration: 1.5,
        }
      );
    }
  }, [location, map]);

  return null;
};

const LeafletMap = ({
  selectedLocation,
  onLocationSelect,
  readOnly = false,
}) => {

  const [loadingLocation, setLoadingLocation] = useState(false);

  // ===============================================
  // Current GPS Location
  // ===============================================
  const handleGetCurrentLocation = () => {

    if (!navigator.geolocation) {
      alert("Geolocation is not supported.");
      return;
    }

    setLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(

      (position) => {

        const coords = {

          lat: position.coords.latitude,

          lng: position.coords.longitude,

          accuracy: position.coords.accuracy,

        };

        if (onLocationSelect) {
          onLocationSelect(coords);
        }

        setLoadingLocation(false);

      },

      (error) => {

        console.error(error);

        alert("Unable to retrieve current location.");

        setLoadingLocation(false);

      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }

    );

  };

  return (

    <div className="relative h-96 w-full rounded-xl overflow-hidden border shadow-md">

      {/* Loading Overlay */}

      {loadingLocation && (

        <div className="absolute inset-0 bg-white/70 z-[999] flex items-center justify-center">

          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>

        </div>

      )}

      {/* Current Location Button */}

      {!readOnly && (

        <div className="absolute top-3 right-3 z-[1000]">

          <CurrentLocationButton

            onClick={handleGetCurrentLocation}

            loading={loadingLocation}

          />

        </div>

      )}

      <MapContainer
        center={
          selectedLocation
            ? [selectedLocation.lat, selectedLocation.lng]
            : DEBRE_MARKOS_COORDS
        }
        zoom={14}
        scrollWheelZoom={true}
        zoomControl={false}
        className="w-full h-full"
      >

        {/* Zoom Buttons */}

        <ZoomControl position="bottomright" />

        {/* Map Tiles */}

        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Smooth Animation */}

        <MapRecenter location={selectedLocation} />

        {/* Marker */}

        <LocationMarker
          position={selectedLocation}
          setPosition={onLocationSelect}
          readOnly={readOnly}
        />

        {/* GPS Accuracy Circle */}

        {selectedLocation && (

          <Circle

            center={[selectedLocation.lat, selectedLocation.lng]}

            radius={selectedLocation.accuracy || 20}

            pathOptions={{

              color: "#2563eb",

              fillColor: "#3b82f6",

              fillOpacity: 0.15,

            }}

          />

        )}

      </MapContainer>

    </div>

  );
};

export default LeafletMap;