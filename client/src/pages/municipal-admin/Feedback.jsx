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

      console.log("=================================");
      console.log("MUNICIPAL FEEDBACK RESPONSE");
      console.log(response.data);
      console.log("=================================");

      setFeedbacks(response.data?.data || []);
    } catch (error) {
      console.error("Feedback Load Error:", error);
      console.error("Response:", error.response?.data);

      setError(
        error.response?.data?.message ||
          "Failed to load feedback."
      );

      setFeedbacks([]);
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
    const value = Math.min(
      5,
      Math.max(0, Number(rating) || 0)
    );

    return (
      <div className="flex items-center gap-1 whitespace-nowrap">
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
  // BUSINESS OR PUBLIC
  // ==========================================

  const getSenderName = (feedback) => {
    if (feedback.business_id) {
      return (
        feedback.business_name ||
        feedback.business_owner_name ||
        "Business Owner"
      );
    }

    return "Public User";
  };

  // ==========================================
  // GET PHONE
  // BUSINESS PHONE ONLY
  // ==========================================

  const getSenderPhone = (feedback) => {
    if (!feedback.business_id) {
      return "-";
    }

    return (
      feedback.business_phone ||
      feedback.phone_number ||
      feedback.business_owner_phone ||
      "-"
    );
  };

  // ==========================================
  // GET SENDER TYPE
  // BUSINESS OR PUBLIC
  // ==========================================

  const getSenderType = (feedback) => {
    if (feedback.business_id) {
      return (
        <span
          className="
            inline-flex
            px-3
            py-1
            rounded-full
            text-xs
            font-semibold
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
          px-3
          py-1
          rounded-full
          text-xs
          font-semibold
          bg-green-100
          text-green-700
        "
      >
        Public
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

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleDateString();
  };

  // ==========================================
  // GET KEBELE
  // ==========================================

  const getKebele = (feedback) => {
    return feedback.kebele || "-";
  };

  // ==========================================
  // GET SEFER
  // ==========================================

  const getSefer = (feedback) => {
    return feedback.sefer || "-";
  };

  // ==========================================
  // GET FEEDBACK
  // CATEGORY + DESCRIPTION
  // ==========================================

  const getFeedbackText = (feedback) => {
    const category = feedback.category || "";
    const description = feedback.description || "";

    if (category && description) {
      return `${category}: ${description}`;
    }

    if (category) {
      return category;
    }

    if (description) {
      return description;
    }

    return "-";
  };

  // ==========================================
  // COUNTS
  // ==========================================

  const businessFeedbackCount = feedbacks.filter(
    (feedback) =>
      Boolean(feedback.business_id)
  ).length;

  const publicFeedbackCount = feedbacks.filter(
    (feedback) =>
      !feedback.business_id
  ).length;

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="p-6">
        <div
          className="
            bg-white
            rounded-2xl
            border
            shadow-sm
            p-8
            text-center
          "
        >
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

      <div
        className="
          bg-white
          border
          rounded-2xl
          shadow-sm
          p-6
        "
      >
        <div
          className="
            flex
            items-start
            justify-between
            gap-4
          "
        >

          <div
            className="
              flex
              items-start
              gap-4
            "
          >

            {/* ICON */}

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

            {/* TITLE */}

            <div>
              <h1
                className="
                  text-2xl
                  font-bold
                  text-gray-800
                "
              >
                Feedback Management
              </h1>

              <p
                className="
                  text-sm
                  text-gray-500
                  mt-1
                "
              >
                View feedback submitted by
                business owners and public users.
              </p>
            </div>

          </div>

          {/* REFRESH */}

          <button
            type="button"
            onClick={loadFeedbacks}
            disabled={loading}
            className="
              px-4
              py-2
              rounded-lg
              bg-blue-600
              text-white
              text-sm
              font-medium
              hover:bg-blue-700
              disabled:opacity-50
              disabled:cursor-not-allowed
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

      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-3
          gap-4
        "
      >

        {/* TOTAL */}

        <div
          className="
            bg-white
            border
            rounded-xl
            p-5
            shadow-sm
          "
        >
          <p className="text-sm text-gray-500">
            Total Feedback
          </p>

          <p
            className="
              text-3xl
              font-bold
              text-gray-800
              mt-2
            "
          >
            {feedbacks.length}
          </p>
        </div>

        {/* BUSINESS */}

        <div
          className="
            bg-white
            border
            rounded-xl
            p-5
            shadow-sm
          "
        >
          <p className="text-sm text-gray-500">
            Business Feedback
          </p>

          <p
            className="
              text-3xl
              font-bold
              text-purple-600
              mt-2
            "
          >
            {businessFeedbackCount}
          </p>
        </div>

        {/* PUBLIC */}

        <div
          className="
            bg-white
            border
            rounded-xl
            p-5
            shadow-sm
          "
        >
          <p className="text-sm text-gray-500">
            Public Feedback
          </p>

          <p
            className="
              text-3xl
              font-bold
              text-green-600
              mt-2
            "
          >
            {publicFeedbackCount}
          </p>
        </div>

      </div>

      {/* ======================================
          ALL FEEDBACK TABLE
      ====================================== */}

      <div
        className="
          bg-white
          border
          rounded-2xl
          shadow-sm
          overflow-hidden
        "
      >

        {/* TABLE HEADER */}

        <div className="p-5 border-b">

          <h2
            className="
              font-bold
              text-gray-800
            "
          >
            All Feedback
          </h2>

          <p
            className="
              text-xs
              text-gray-500
              mt-1
            "
          >
            Feedback submitted by business
            owners and public users.
          </p>

        </div>

        {/* ==================================
            EMPTY
        ================================== */}

        {feedbacks.length === 0 ? (

          <div className="p-10 text-center">

            <div className="text-4xl mb-3">
              💬
            </div>

            <p
              className="
                font-medium
                text-gray-700
              "
            >
              No feedback found
            </p>

            <p
              className="
                text-sm
                text-gray-500
                mt-1
              "
            >
              There is currently no feedback
              submitted.
            </p>

          </div>

        ) : (

          /* ==================================
             TABLE
          ================================== */

          <div className="overflow-x-auto">

            <table className="w-full">

              {/* TABLE HEAD */}

              <thead className="bg-gray-50">

                <tr>

                  <th
                    className="
                      px-5
                      py-4
                      text-left
                      text-xs
                      font-semibold
                      text-gray-600
                    "
                  >
                    User
                  </th>

                  <th
                    className="
                      px-5
                      py-4
                      text-left
                      text-xs
                      font-semibold
                      text-gray-600
                    "
                  >
                    Phone
                  </th>

                  <th
                    className="
                      px-5
                      py-4
                      text-left
                      text-xs
                      font-semibold
                      text-gray-600
                    "
                  >
                    Type
                  </th>

                  <th
                    className="
                      px-5
                      py-4
                      text-left
                      text-xs
                      font-semibold
                      text-gray-600
                    "
                  >
                    Kebele
                  </th>

                  <th
                    className="
                      px-5
                      py-4
                      text-left
                      text-xs
                      font-semibold
                      text-gray-600
                    "
                  >
                    Sefer
                  </th>

                  <th
                    className="
                      px-5
                      py-4
                      text-left
                      text-xs
                      font-semibold
                      text-gray-600
                    "
                  >
                    Rating
                  </th>

                  <th
                    className="
                      px-5
                      py-4
                      text-left
                      text-xs
                      font-semibold
                      text-gray-600
                    "
                  >
                    Feedback
                  </th>

                  <th
                    className="
                      px-5
                      py-4
                      text-left
                      text-xs
                      font-semibold
                      text-gray-600
                    "
                  >
                    Date
                  </th>

                </tr>

              </thead>

              {/* TABLE BODY */}

              <tbody className="divide-y">

                {feedbacks.map((feedback) => (

                  <tr
                    key={feedback.feedback_id}
                    className="hover:bg-gray-50"
                  >

                    {/* USER */}

                    <td className="px-5 py-4">

                      <div
                        className="
                          font-medium
                          text-gray-800
                          whitespace-nowrap
                        "
                      >
                        {getSenderName(feedback)}
                      </div>

                    </td>

                    {/* PHONE */}

                    <td className="px-5 py-4">

                      {feedback.business_id ? (
                        <a
                          href={`tel:${getSenderPhone(
                            feedback
                          )}`}
                          className="
                            text-sm
                            text-blue-600
                            hover:underline
                            whitespace-nowrap
                          "
                        >
                          {getSenderPhone(feedback)}
                        </a>
                      ) : (
                        <span
                          className="
                            text-sm
                            text-gray-500
                          "
                        >
                          -
                        </span>
                      )}

                    </td>

                    {/* TYPE */}

                    <td className="px-5 py-4">
                      {getSenderType(feedback)}
                    </td>

                    {/* KEBELE */}

                    <td className="px-5 py-4">

                      <span
                        className="
                          inline-flex
                          px-3
                          py-1
                          rounded-lg
                          bg-gray-100
                          text-gray-700
                          text-sm
                          whitespace-nowrap
                        "
                      >
                        {getKebele(feedback)}
                      </span>

                    </td>

                    {/* SEFER */}

                    <td className="px-5 py-4">

                      <span
                        className="
                          inline-flex
                          px-3
                          py-1
                          rounded-lg
                          bg-gray-100
                          text-gray-700
                          text-sm
                          whitespace-nowrap
                        "
                      >
                        {getSefer(feedback)}
                      </span>

                    </td>

                    {/* RATING */}

                    <td className="px-5 py-4">
                      {renderRating(
                        feedback.rating
                      )}
                    </td>

                    {/* FEEDBACK */}

                    <td
                      className="
                        px-5
                        py-4
                        max-w-md
                      "
                    >
                      <div
                        className="
                          text-sm
                          font-medium
                          text-gray-800
                        "
                      >
                        {feedback.category || "-"}
                      </div>

                      {feedback.description && (
                        <p
                          className="
                            text-sm
                            text-gray-500
                            mt-1
                            whitespace-normal
                            break-words
                          "
                        >
                          {feedback.description}
                        </p>
                      )}
                    </td>

                    {/* DATE */}

                    <td
                      className="
                        px-5
                        py-4
                        text-sm
                        text-gray-500
                        whitespace-nowrap
                      "
                    >
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