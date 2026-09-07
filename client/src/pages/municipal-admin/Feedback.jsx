// src/pages/municipal-admin/Feedback.jsx

import React, { useEffect, useState } from "react";
import API from "../../services/api";

const Feedback = () => {

  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // LOAD FEEDBACK
  // ==========================================

  const loadFeedbacks = async () => {

    try {

      setLoading(true);
      setError("");

      const response = await API.get("/feedback");

      console.log(
        "Feedback Response:",
        response.data
      );

      setFeedbacks(
        response.data?.data || []
      );

    } catch (error) {

      console.error(
        "Feedback Load Error:",
        error
      );

      console.error(
        "Response:",
        error.response?.data
      );

      setError(
        error.response?.data?.message ||
        "Failed to load feedback."
      );

    } finally {

      setLoading(false);

    }

  };

  // ==========================================
  // LOAD ON PAGE OPEN
  // ==========================================

  useEffect(() => {

    loadFeedbacks();

  }, []);

  // ==========================================
  // RATING DISPLAY
  // ==========================================

  const renderRating = (rating) => {

    const value = Number(rating) || 0;

    return (
      <div className="flex items-center gap-1">

        <span className="text-yellow-500">
          {"★".repeat(value)}
        </span>

        <span className="text-gray-300">
          {"★".repeat(5 - value)}
        </span>

        <span className="text-xs text-gray-500 ml-1">
          ({value}/5)
        </span>

      </div>
    );

  };

  // ==========================================
  // GET SENDER NAME
  // ==========================================

  const getSenderName = (feedback) => {

    if (feedback.business_id) {

      return (
        feedback.business_name ||
        feedback.business_owner_name ||
        "Business Owner"
      );

    }

    if (feedback.resident_id) {

      return (
        feedback.resident_name ||
        "Resident"
      );

    }

    return "Unknown";

  };

  // ==========================================
  // GET SENDER TYPE
  // ==========================================

  const getSenderType = (feedback) => {

    if (feedback.business_id) {

      return (
        <span
          className="
            inline-flex
            px-2
            py-1
            rounded-full
            text-xs
            font-medium
            bg-purple-100
            text-purple-700
          "
        >
          Business
        </span>
      );

    }

    return (
      <span
        className="
          inline-flex
          px-2
          py-1
          rounded-full
          text-xs
          font-medium
          bg-blue-100
          text-blue-700
        "
      >
        Resident
      </span>
    );

  };

  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (date) => {

    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString();

  };

  // ==========================================
  // GET KEBELE
  // ==========================================

  const getKebele = (feedback) => {

    if (feedback.resident_id) {

      return (
        feedback.resident_kebele ||
        feedback.kebele ||
        "-"
      );

    }

    return "-";

  };

  // ==========================================
  // GET SEFER
  // ==========================================

  const getSefer = (feedback) => {

    return (
      feedback.sefer ||
      feedback.resident_sefer ||
      "-"
    );

  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {

    return (

      <div className="p-6">

        <div className="bg-white rounded-2xl border shadow-sm p-8 text-center">

          <div
            className="
              animate-spin
              mx-auto
              mb-4
              w-8
              h-8
              border-4
              border-blue-500
              border-t-transparent
              rounded-full
            "
          ></div>

          <p className="text-gray-500">
            Loading feedback...
          </p>

        </div>

      </div>

    );

  }

  // ==========================================
  // PAGE
  // ==========================================

  return (

    <div className="space-y-6">

      {/* ======================================
          HEADER
      ====================================== */}

      <div className="bg-white border rounded-2xl shadow-sm p-6">

        <div className="flex items-start justify-between gap-4">

          <div className="flex items-start gap-4">

            <div
              className="
                w-12
                h-12
                rounded-xl
                bg-blue-50
                flex
                items-center
                justify-center
                text-2xl
              "
            >
              💬
            </div>

            <div>

              <h1 className="text-2xl font-bold text-gray-800">
                Feedback Management
              </h1>

              <p className="text-sm text-gray-500 mt-1">
                View feedback submitted by residents
                and business owners.
              </p>

            </div>

          </div>

          {/* REFRESH */}

          <button
            onClick={loadFeedbacks}
            className="
              px-4
              py-2
              rounded-lg
              bg-blue-600
              text-white
              text-sm
              hover:bg-blue-700
            "
          >
            🔄 Refresh
          </button>

        </div>

      </div>


      {/* ======================================
          ERROR
      ====================================== */}

      {error && (

        <div
          className="
            bg-red-50
            border
            border-red-200
            text-red-700
            rounded-xl
            p-4
          "
        >
          {error}
        </div>

      )}


      {/* ======================================
          SUMMARY
      ====================================== */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <div className="bg-white border rounded-xl p-5 shadow-sm">

          <p className="text-sm text-gray-500">
            Total Feedback
          </p>

          <p className="text-3xl font-bold text-gray-800 mt-2">
            {feedbacks.length}
          </p>

        </div>


        <div className="bg-white border rounded-xl p-5 shadow-sm">

          <p className="text-sm text-gray-500">
            Resident Feedback
          </p>

          <p className="text-3xl font-bold text-blue-600 mt-2">

            {
              feedbacks.filter(
                (feedback) =>
                  feedback.resident_id
              ).length
            }

          </p>

        </div>


        <div className="bg-white border rounded-xl p-5 shadow-sm">

          <p className="text-sm text-gray-500">
            Business Feedback
          </p>

          <p className="text-3xl font-bold text-purple-600 mt-2">

            {
              feedbacks.filter(
                (feedback) =>
                  feedback.business_id
              ).length
            }

          </p>

        </div>

      </div>


      {/* ======================================
          FEEDBACK TABLE
      ====================================== */}

      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">

        <div className="p-5 border-b">

          <h2 className="font-bold text-gray-800">
            All Feedback
          </h2>

          <p className="text-xs text-gray-500 mt-1">
            Feedback submitted by system users.
          </p>

        </div>


        {feedbacks.length === 0 ? (

          <div className="p-10 text-center">

            <div className="text-4xl mb-3">
              💬
            </div>

            <p className="font-medium text-gray-700">
              No feedback found
            </p>

            <p className="text-sm text-gray-500 mt-1">
              There is currently no feedback submitted.
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full">

             <thead className="bg-gray-50">
  <tr>

    <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600">
  User
</th>

<th className="px-5 py-4 text-left text-xs font-semibold text-gray-600">
  Phone
</th>

<th className="px-5 py-4 text-left text-xs font-semibold text-gray-600">
  Type
</th>

<th className="px-5 py-4 text-left text-xs font-semibold text-gray-600">
  Kebele
</th>

<th className="px-5 py-4 text-left text-xs font-semibold text-gray-600">
  Sefer
</th>
    <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600">
      Rating
    </th>

    <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600">
      Feedback
    </th>

    <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600">
      Date
    </th>

  </tr>
</thead>
              <tbody className="divide-y">

                {feedbacks.map((feedback) => (

                  <tr
                    key={feedback.feedback_id}
                    className="hover:bg-gray-50"
                  >

                    {/* USER */}
<td className="px-5 py-4">
  <div className="font-medium text-gray-800">
    {feedback.user_name || "Unknown"}
  </div>
</td>

{/* PHONE */}
<td className="px-5 py-4">
  <span className="text-sm text-gray-600">
    {feedback.phone_number || "-"}
  </span>
</td>

{/* TYPE */}
<td className="px-5 py-4">
  {getSenderType(feedback)}
</td>

{/* KEBELE */}
<td className="px-5 py-4">
  <span className="
    px-3
    py-1
    rounded-lg
    bg-gray-100
    text-gray-700
    text-sm
  ">
    {feedback.kebele || "-"}
  </span>
</td>

{/* SEFER */}
<td className="px-5 py-4">
  <span className="
    px-3
    py-1
    rounded-lg
    bg-gray-100
    text-gray-700
    text-sm
  ">
    {feedback.sefer || "-"}
  </span>
</td>
                    {/* RATING */}

                    <td className="px-5 py-4">

                      {renderRating(
                        feedback.rating
                      )}

                    </td>


                    {/* COMMENT */}

                    <td className="px-5 py-4 max-w-md">

                      <p className="text-sm text-gray-700 whitespace-normal">

                        {feedback.comment}

                      </p>

                    </td>


                    {/* DATE */}

                    <td className="px-5 py-4 text-sm text-gray-500 whitespace-nowrap">

                      {formatDate(
                        feedback.feedback_date ||
                        feedback.created_at
                      )}

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>

  );

};

export default Feedback;