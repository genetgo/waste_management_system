
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSignOutAlt } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

export default function Logout() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    logout();

    setTimeout(() => {
      navigate("/login");
    }, 1500);
  }, [logout, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-red-500 to-orange-500 flex items-center justify-center px-6">

      <div className="bg-white rounded-3xl shadow-2xl p-10 text-center max-w-md w-full">

        <div className="flex justify-center mb-6">
          <div className="bg-red-100 p-5 rounded-full">
            <FaSignOutAlt className="text-5xl text-red-600" />
          </div>
        </div>

        <h2 className="text-3xl font-bold text-gray-800">
          Logging Out...
        </h2>

        <p className="text-gray-500 mt-3">
          Please wait while we securely sign you out.
        </p>

        <div className="mt-8 flex justify-center">
          <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
        </div>

      </div>

    </div>
  );
}

