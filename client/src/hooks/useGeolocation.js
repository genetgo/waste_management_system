// src/hooks/useGeolocation.js
// የንግድ ድርጅቶች በሞባይል/ብራውዘር ጂፒኤስ (Browser Geolocation API) የቆሻሻ ማንሳት ቦታቸውን በትክክል እንዲመርጡ የሚረዳ Custom Hook

import { useState, useEffect } from 'react';

export const useGeolocation = (options = {}) => {
  const [location, setLocation] = useState({
    loaded: false,
    coordinates: { lat: '', lng: '' },
    error: null,
  });

  const onSuccess = (position) => {
    setLocation({
      loaded: true,
      coordinates: {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      },
      error: null,
    });
  };

  const onError = (error) => {
    setLocation({
      loaded: true,
      coordinates: { lat: '', lng: '' },
      error: {
        code: error.code,
        message: error.message || 'የመገኛ ቦታን (Location) ማግኘት አልተቻለም',
      },
    });
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      setLocation((prev) => ({
        ...prev,
        loaded: true,
        error: {
          code: 0,
          message: 'ይህ ብራውዘር የጂኦሎኬሽን (Geolocation) አገልግሎትን አይደግፍም',
        },
      }));
      return;
    }

    navigator.geolocation.getCurrentPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
      ...options,
    });
  };

  useEffect(() => {
    getLocation();
  }, []);

  return { ...location, refetchLocation: getLocation };
};

export default useGeolocation;