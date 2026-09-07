// src/components/common/Select.jsx
import React from 'react';

const Select = ({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = '-- select --',
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
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={`w-full px-3 py-2 bg-gray-50 border ${
          error ? 'border-red-500' : 'border-gray-200'
        } rounded-lg text-xs focus:bg-white focus:border-emerald-600 focus:outline-none transition disabled:bg-gray-100 text-gray-800`}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((opt, i) => {
          const optValue = typeof opt === 'object' ? opt.value : opt;
          const optLabel = typeof opt === 'object' ? opt.label : opt;
          return (
            <option key={i} value={optValue}>
              {optLabel}
            </option>
          );
        })}
      </select>
      {error && <p className="text-[10px] text-red-500 font-medium mt-0.5">{error}</p>}
    </div>
  );
};

export default Select;