// src/components/common/Toast.jsx
import React, { useEffect } from 'react';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    if (duration && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const bgStyles = {
    success: 'bg-emerald-600 text-white',
    error: 'bg-red-600 text-white',
    warning: 'bg-amber-500 text-white',
    info: 'bg-blue-600 text-white',
  };

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  };

  if (!message) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-bounce">
      <div
        className={`flex items-center gap-2 text-xs font-medium px-4 py-3 rounded-xl shadow-lg ${
          bgStyles[type] || bgStyles.success
        }`}
      >
        <span>{icons[type]}</span>
        <span>{message}</span>
        {onClose && (
          <button onClick={onClose} className="ml-2 font-bold hover:opacity-80">
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

export default Toast;