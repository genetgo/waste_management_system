// src/components/common/Card.jsx
import React from 'react';

const Card = ({ children, className = '', title, subtitle, headerAction }) => {
  return (
    <div className={`bg-white p-5 rounded-xl border border-gray-100 shadow-sm ${className}`}>
      {(title || subtitle || headerAction) && (
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
          <div>
            {title && <h3 className="text-sm font-bold text-gray-800">{title}</h3>}
            {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
};

export default Card;