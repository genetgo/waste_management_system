import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-[75vh] flex flex-col justify-center items-center text-center p-6 space-y-4">
      <div className="text-6xl font-black text-emerald-600 font-mono">404</div>
      <h1 className="text-2xl font-bold text-gray-800">Page Not Found</h1>
      <p className="text-xs md:text-sm text-gray-500 max-w-md">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable. Please check the URL and try again.
      </p>
      <div className="pt-4">
        <Link
          to="/"
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow transition"
        >
          Back to Homepage
        </Link>
      </div>
    </div>
  );
};

export default NotFound;