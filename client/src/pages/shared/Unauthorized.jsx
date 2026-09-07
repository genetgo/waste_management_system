import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div className="min-h-[75vh] flex flex-col justify-center items-center text-center p-6 space-y-4">
      <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-3xl font-bold mb-2">
        🔒
      </div>
      <h1 className="text-2xl font-bold text-gray-800"> Access Denied</h1>
      <p className="text-xs md:text-sm text-gray-500 max-w-md">
        You do not have the required permissions or role to access this page. Please log in with an authorized account and try again.
      </p>
      <div className="pt-4 flex gap-3">
        <Link
          to="/"
          className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition"
        >
          Go to Home
        </Link>
        <Link
          to="/login"
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow transition"
        >
          Log in with Another Account
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;