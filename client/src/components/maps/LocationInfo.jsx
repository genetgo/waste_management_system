import React from "react";

const LocationInfo = ({ address, location }) => {
  if (!location) return null;

  return (
    <div className="bg-white border rounded-lg shadow mt-3 p-3">

      <h3 className="font-semibold text-blue-600 mb-2">
        Selected Location
      </h3>

      <p>
        <strong>Latitude:</strong>{" "}
        {location.lat.toFixed(6)}
      </p>

      <p>
        <strong>Longitude:</strong>{" "}
        {location.lng.toFixed(6)}
      </p>

      {address && (
        <>

          <hr className="my-2"/>

          <p className="text-sm">
            {address}
          </p>

        </>
      )}

    </div>
  );
};

export default LocationInfo;