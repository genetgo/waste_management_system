// src/components/common/Textarea.jsx
import React from 'react';

const Textarea = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  rows = 3,
  error,
  required = false,
  disabled = false,
  className = '',
  ...props
}) => {
  return (
    <div className={`space-y-1 mb-3 ${className}`}>
      {label && (
        <label htmlFor={name} className="block text-xs font-semibold text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <textarea
        id={name}
        name={name}
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`w-full px-3 py-2 bg-gray-50 border ${
          error ? 'border-red-500' : 'border-gray-200'
        } rounded-lg text-xs focus:bg-white focus:border-emerald-600 focus:outline-none transition disabled:bg-gray-100 text-gray-800`}
        {...props}
      />
      {error && <p className="text-[10px] text-red-500 font-medium mt-0.5">{error}</p>}
    </div>
  );
};

export default Textarea;