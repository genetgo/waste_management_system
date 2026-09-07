// src/components/common/EmptyState.jsx
import React from 'react';

const EmptyState = ({
  icon = '📦',
  title = 'No data found',
  message = 'There is currently no data to display or your search yielded no results.',
  actionLabel,
  onAction,
}) => {
  return (
    <div className="p-8 text-center bg-white rounded-xl border border-dashed border-gray-200 flex flex-col items-center justify-center space-y-3">
      <div className="text-4xl">{icon}</div>
      <div className="space-y-1">
        <h4 className="text-xs font-bold text-gray-700">{title}</h4>
        <p className="text-xs text-gray-400 max-w-sm">{message}</p>
      </div>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-2 px-4 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg transition"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;