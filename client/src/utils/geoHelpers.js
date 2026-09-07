/**
 * Geolocation helpers for Debre Markos Municipality area and Leaflet integration.
 */

// Default map view centered at Debre Markos, Ethiopia
export const DEBRE_MARKOS_CENTER = {
  lat: 10.3333,
  lng: 37.7333,
  zoom: 14,
};

/**
 * Retrieves the current user position using Browser Geolocation API
 * @returns {Promise<{lat: number, lng: number}>}
 */
export const getCurrentPosition = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        let msg = 'Failed to get location.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            msg = 'User denied the request for Geolocation.';
            break;
          case error.POSITION_UNAVAILABLE:
            msg = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            msg = 'The request to get user location timed out.';
            break;
          default:
            break;
        }
        reject(new Error(msg));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
};

/**
 * Validates whether given coordinates fall within reasonable bounds
 */
export const isValidCoordinates = (lat, lng) => {
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);
  return (
    !isNaN(latitude) &&
    !isNaN(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
};