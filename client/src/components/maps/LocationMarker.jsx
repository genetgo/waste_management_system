// src/components/map/LocationMarker.jsx

import React, { useMemo, useRef } from "react";
import { Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix Leaflet Default Icon
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const LocationMarker = ({
  position,
  setPosition,
  fetchAddress,
  readOnly = false,
}) => {
  const markerRef = useRef(null);

  // Click on Map
  const map = useMapEvents({
    click(e) {
      if (readOnly) return;

      const lat = e.latlng.lat;
      const lng = e.latlng.lng;

      const newLocation = {
        lat: lat,
        lng: lng,
        accuracy: position?.accuracy,
      };

      if (setPosition) {
        setPosition(newLocation);
      }

      // አድራሻውን መፈለጊያ Function መጥራት
      if (fetchAddress) {
        fetchAddress(lat, lng);
      }

      map.flyTo([lat, lng], 17, {
        animate: true,
        duration: 1,
      });
    },
  });

  // Drag Marker
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (!marker) return;

        const latlng = marker.getLatLng();

        if (setPosition) {
          setPosition({
            lat: latlng.lat,
            lng: latlng.lng,
            accuracy: position?.accuracy,
          });
        }

        // አድራሻውን መፈለጊያ Function መጥራት
        if (fetchAddress) {
          fetchAddress(latlng.lat, latlng.lng);
        }
      },
    }),
    [setPosition, position, fetchAddress]
  );

  if (!position) return null;

  // Handles both object {lat, lng} and array [lat, lng]
  const markerPos = Array.isArray(position)
    ? position
    : [position.lat, position.lng];

  return (
    <Marker
      draggable={!readOnly}
      position={markerPos}
      ref={markerRef}
      eventHandlers={eventHandlers}
    >
      <Popup>
        <div className="space-y-2 text-sm min-w-[180px]">
          <h3 className="font-bold text-green-700">📍 Pickup Location</h3>

          <div>
            <span className="font-semibold">Latitude</span>
            <br />
            <span className="font-mono">
              {Number(markerPos[0]).toFixed(6)}
            </span>
          </div>

          <div>
            <span className="font-semibold">Longitude</span>
            <br />
            <span className="font-mono">
              {Number(markerPos[1]).toFixed(6)}
            </span>
          </div>

          {position.accuracy && (
            <div>
              <span className="font-semibold">GPS Accuracy</span>
              <br />± {Math.round(position.accuracy)} meters
            </div>
          )}

          {!readOnly && (
            <div className="text-xs text-gray-500 italic border-t pt-2">
              💡 Click anywhere on the map or drag the marker to adjust the pickup location.
            </div>
          )}
        </div>
      </Popup>
    </Marker>
  );
};

export default LocationMarker;