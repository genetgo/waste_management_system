// src/components/map/CurrentLocationButton.jsx
import React from 'react';

const CurrentLocationButton = ({ onClick, loading }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={`bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-3 border border-gray-300 rounded shadow-md text-xs flex items-center gap-2 transition-all ${
        loading ? 'opacity-60 cursor-not-allowed' : 'active:scale-95'
      }`}
    >
      {loading ? (
        // Animated Loading Spinner
        <svg
          className="animate-spin h-3.5 w-3.5 text-blue-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : (
        <span>📍</span>
      )}
      <span>{loading ? 'Locating...' : 'Use My Current Location'}</span>
    </button>
  );
};

export default CurrentLocationButton;