// src/components/common/Loader.jsx
import React from 'react';

const Loader = ({ text = 'loading info...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-3">
      <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      {text && <p className="text-xs text-gray-500 font-medium animate-pulse">{text}</p>}
    </div>
  );
};

export default Loader;