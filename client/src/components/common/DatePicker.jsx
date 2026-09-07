// src/components/common/DatePicker.jsx
import React from 'react';

const DatePicker = ({ label, name, value, onChange, error, required = false, min, max, className = '' }) => {
  return (
    <div className={`space-y-1 mb-3 ${className}`}>
      {label && (
        <label htmlFor={name} className="block text-xs font-semibold text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        type="date"
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        required={required}
        className={`w-full px-3 py-2 bg-gray-50 border ${
          error ? 'border-red-500' : 'border-gray-200'
        } rounded-lg text-xs focus:bg-white focus:border-emerald-600 focus:outline-none transition text-gray-800`}
      />
      {error && <p className="text-[10px] text-red-500 font-medium mt-0.5">{error}</p>}
    </div>
  );
};

export default DatePicker;