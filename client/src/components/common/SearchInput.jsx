// src/components/common/SearchInput.jsx
import React from 'react';

const SearchInput = ({ value, onChange, placeholder = 'ፈልግ...', className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 text-xs">
        🔍
      </span>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:bg-white focus:border-emerald-600 focus:outline-none transition text-gray-800"
      />
    </div>
  );
};

export default SearchInput;