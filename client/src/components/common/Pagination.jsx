// src/components/common/Pagination.jsx
import React from 'react';

const Pagination = ({ currentPage = 1, totalPages = 1, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-gray-100 pt-4 text-xs">
      <button
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-gray-700 font-medium disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        ← ቀደመ
      </button>

      <span className="text-gray-500 font-medium">
        ገጽ <span className="font-bold text-gray-800">{currentPage}</span> ከ <span className="font-bold text-gray-800">{totalPages}</span>
      </span>

      <button
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-gray-700 font-medium disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        ቀጣይ →
      </button>
    </div>
  );
};

export default Pagination;