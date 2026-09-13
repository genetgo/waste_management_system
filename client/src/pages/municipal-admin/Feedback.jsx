
// src/pages/municipal-admin/Feedback.jsx

import React, { useEffect, useState } from "react";
import API from "../../services/api";

const Feedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Selected feedback for View Feedback modal
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  // Delete loading
  const [deletingFeedbackId, setDeletingFeedbackId] = useState(null);

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
  // VIEW FEEDBACK
  //
  // Municipal Admin clicks View Feedback
  // Pending -> Viewed
  // ==========================================

  const handleViewFeedback = async (feedback) => {
    try {
      console.log("=================================");
      console.log("VIEW FEEDBACK");
      console.log("FEEDBACK:", feedback);
      console.log("FEEDBACK ID:", feedback.feedback_id);
      console.log("=================================");

      const response = await API.patch(
        `/feedback/${feedback.feedback_id}/view`
      );

      console.log(
        "MARK VIEWED RESPONSE:",
        response.data
      );

      if (response.data?.success) {
        const updatedFeedback =
          response.data.data || {
            ...feedback,
            status: "Viewed",
          };

        // Open modal with updated information
        setSelectedFeedback(updatedFeedback);

        // Update table immediately
        setFeedbacks((previousFeedbacks) =>
          previousFeedbacks.map((item) =>
            item.feedback_id === feedback.feedback_id
              ? {
                  ...item,
                  ...updatedFeedback,
                  status:
                    updatedFeedback.status || "Viewed",
                }
              : item
          )
        );

        return;
      }

      // Fallback: open feedback even if response is unexpected
      setSelectedFeedback(feedback);
    } catch (error) {
      console.error(
        "Mark Feedback Viewed Error:",
        error
      );

      console.error(
        "Response:",
        error.response?.data
      );

      // Still open feedback if marking Viewed fails
      setSelectedFeedback(feedback);
    }
  };

  // ==========================================
  // DELETE FEEDBACK
  // ==========================================

  const handleDeleteFeedback = async (feedback) => {
    const feedbackId = feedback?.feedback_id;

    if (!feedbackId) {
      alert("Feedback ID is missing.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete Feedback #${feedbackId}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingFeedbackId(feedbackId);
      setError("");

      console.log("=================================");
      console.log("DELETE FEEDBACK");
      console.log("FEEDBACK ID:", feedbackId);
      console.log("=================================");

      const response = await API.delete(
        `/feedback/${feedbackId}`
      );

      console.log(
        "DELETE FEEDBACK RESPONSE:",
        response.data
      );

      if (response.data?.success) {
        // Remove from table immediately
        setFeedbacks((previousFeedbacks) =>
          previousFeedbacks.filter(
            (item) => item.feedback_id !== feedbackId
          )
        );

        // Close modal if deleted feedback is open
        if (
          selectedFeedback?.feedback_id === feedbackId
        ) {
          setSelectedFeedback(null);
        }

        return;
      }

      alert(
        response.data?.message ||
          "Failed to delete feedback."
      );
    } catch (error) {
      console.error(
        "Delete Feedback Error:",
        error
      );

      console.error(
        "Response:",
        error.response?.data
      );

      alert(
        error.response?.data?.message ||
          "Failed to delete feedback."
      );
    } finally {
      setDeletingFeedbackId(null);
    }
  };

  // ==========================================
  // CLOSE MODAL
  // ==========================================

  const handleCloseModal = () => {
    setSelectedFeedback(null);
  };

  // ==========================================
  // CLOSE MODAL WITH ESC KEY
  // ==========================================

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setSelectedFeedback(null);
      }
    };

    if (selectedFeedback) {
      document.addEventListener(
        "keydown",
        handleKeyDown
      );
    }

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [selectedFeedback]);

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
        <span className="text-yellow-500 text-lg">
          {"★".repeat(value)}
        </span>

        <span className="text-gray-300 text-lg">
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

    return "Public User";
  };

  // ==========================================
  // GET PHONE
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
  // GET EMAIL
  // ==========================================

  const getSenderEmail = (feedback) => {
    if (!feedback.business_id) {
      return "-";
    }

    return (
      feedback.business_email ||
      feedback.email ||
      feedback.business_owner_email ||
      "-"
    );
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
  // GET STATUS
  // ==========================================

  const getStatus = (feedback) => {
    return feedback?.status || "Pending";
  };

  // ==========================================
  // STATUS BADGE
  // ==========================================

  const renderStatus = (feedback) => {
    const status = getStatus(feedback);

    if (status === "Viewed") {
      return (
        <span
          className="
            inline-flex
            items-center
            gap-1
            px-3
            py-1
            rounded-full
            bg-green-100
            text-green-700
            text-xs
            font-semibold
            whitespace-nowrap
          "
        >
          ✓ Viewed
        </span>
      );
    }

    return (
      <span
        className="
          inline-flex
          items-center
          gap-1
          px-3
          py-1
          rounded-full
          bg-yellow-100
          text-yellow-700
          text-xs
          font-semibold
          whitespace-nowrap
        "
      >
        ● Pending
      </span>
    );
  };

  // ==========================================
  // FORMAT DATE
  // ==========================================

  
// ==========================================
// FORMAT DATE ONLY
// ==========================================

const formatDate = (date) => {
  if (!date) {
    return "-";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return parsedDate.toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric"
  });
};

// ==========================================
// FORMAT DATE + TIME
// ==========================================

const formatDateTime = (date) => {
  if (!date) {
    return "-";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return parsedDate.toLocaleString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit"
  });
};


  // ==========================================
  // GET KIFLE KETEMA
  // ==========================================

  const getKifleKetema = (feedback) => {
    return (
      feedback.kifle_ketema ||
      feedback.kifleKetema ||
      "-"
    );
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
  // GET CATEGORY
  //
  // ALL CATEGORIES ARE ALLOWED
  // ==========================================

  const getCategory = (feedback) => {
    return feedback.category || "-";
  };

  // ==========================================
  // GET FULL DESCRIPTION / COMMENT
  // ==========================================

  const getDescription = (feedback) => {
    return (
      feedback.description ||
      feedback.feedback ||
      feedback.comment ||
      "-"
    );
  };

  // ==========================================
  // SEPARATE BUSINESS / PUBLIC
  // ==========================================

  const businessFeedbacks = feedbacks.filter(
    (feedback) => Boolean(feedback.business_id)
  );

  const publicFeedbacks = feedbacks.filter(
    (feedback) => !feedback.business_id
  );

  // ==========================================
  // COUNTS
  // ==========================================

  const businessFeedbackCount =
    businessFeedbacks.length;

  const publicFeedbackCount =
    publicFeedbacks.length;

  const pendingFeedbackCount =
    feedbacks.filter(
      (feedback) => getStatus(feedback) === "Pending"
    ).length;

  const viewedFeedbackCount =
    feedbacks.filter(
      (feedback) => getStatus(feedback) === "Viewed"
    ).length;

  // ==========================================
  // EMPTY TABLE
  // ==========================================

  const EmptyTable = ({ type }) => {
    return (
      <div className="p-10 text-center">
        <div className="text-4xl mb-3">
          {type === "business" ? "🏢" : "👥"}
        </div>

        <p className="font-medium text-gray-700">
          No{" "}
          {type === "business"
            ? "business"
            : "public"}{" "}
          feedback found
        </p>

        <p className="text-sm text-gray-500 mt-1">
          There is currently no feedback submitted by{" "}
          {type === "business"
            ? "business owners."
            : "public users."}
        </p>
      </div>
    );
  };

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
                View and manage feedback submitted by
                business owners and public users.
              </p>
            </div>
          </div>

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
          md:grid-cols-5
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

        {/* PENDING */}

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
            Pending
          </p>

          <p
            className="
              text-3xl
              font-bold
              text-yellow-600
              mt-2
            "
          >
            {pendingFeedbackCount}
          </p>
        </div>

        {/* VIEWED */}

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
            Viewed
          </p>

          <p
            className="
              text-3xl
              font-bold
              text-green-600
              mt-2
            "
          >
            {viewedFeedbackCount}
          </p>
        </div>
      </div>

      {/* =====================================================
          BUSINESS FEEDBACK TABLE
      ===================================================== */}

      <div
        className="
          bg-white
          border
          rounded-2xl
          shadow-sm
          overflow-hidden
        "
      >
        <div className="p-5 border-b">
          <div className="flex items-center gap-3">

            <div
              className="
                w-10
                h-10
                rounded-lg
                bg-purple-50
                flex
                items-center
                justify-center
                text-xl
              "
            >
              🏢
            </div>

            <div>
              <h2
                className="
                  font-bold
                  text-gray-800
                "
              >
                Business Feedback
              </h2>

              <p
                className="
                  text-xs
                  text-gray-500
                  mt-1
                "
              >
                All feedback submitted by business
                owners.
              </p>
            </div>

          </div>
        </div>

        {businessFeedbacks.length === 0 ? (

          <EmptyTable type="business" />

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-purple-50">

                <tr>

                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600">
                    Business
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600">
                    Phone
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600">
                    Kebele
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600">
                    Sefer
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600">
                    Category
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600">
                    Rating
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600">
                    Status
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600">
                    Date
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y">

                {businessFeedbacks.map((feedback) => (

                  <tr
                    key={feedback.feedback_id}
                    className="hover:bg-gray-50"
                  >

                    <td className="px-5 py-4">

                      <div className="font-medium text-gray-800 whitespace-nowrap">
                        {getSenderName(feedback)}
                      </div>

                      <div className="text-xs text-gray-500 mt-1">
                        Business Owner
                      </div>

                    </td>

                    <td className="px-5 py-4">

                      {getSenderPhone(feedback) !== "-" ? (

                        <a
                          href={`tel:${getSenderPhone(feedback)}`}
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

                        <span className="text-sm text-gray-500">
                          -
                        </span>

                      )}

                    </td>

                    <td className="px-5 py-4">

                      <span className="inline-flex px-3 py-1 rounded-lg bg-gray-100 text-gray-700 text-sm whitespace-nowrap">
                        {getKebele(feedback)}
                      </span>

                    </td>

                    <td className="px-5 py-4">

                      <span className="inline-flex px-3 py-1 rounded-lg bg-gray-100 text-gray-700 text-sm whitespace-nowrap">
                        {getSefer(feedback)}
                      </span>

                    </td>

                    <td className="px-5 py-4">

                      <span className="inline-flex px-3 py-1 rounded-lg bg-purple-100 text-purple-700 text-sm font-medium whitespace-nowrap">
                        {getCategory(feedback)}
                      </span>

                    </td>

                    <td className="px-5 py-4">
                      {renderRating(feedback.rating)}
                    </td>

                    <td className="px-5 py-4">
                      {renderStatus(feedback)}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {formatDate(
                        feedback.feedback_date ||
                          feedback.created_at
                      )}
                    </td>

                    {/* ACTIONS */}

                    <td className="px-5 py-4">

                      <div className="flex items-center gap-2">

                        <button
                          type="button"
                          onClick={() =>
                            handleViewFeedback(feedback)
                          }
                          className="
                            inline-flex
                            items-center
                            gap-2
                            px-4
                            py-2
                            rounded-lg
                            bg-blue-600
                            text-white
                            text-sm
                            font-semibold
                            hover:bg-blue-700
                            transition
                            whitespace-nowrap
                          "
                        >
                          👁️ View
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteFeedback(feedback)
                          }
                          disabled={
                            deletingFeedbackId ===
                            feedback.feedback_id
                          }
                          className="
                            inline-flex
                            items-center
                            gap-2
                            px-4
                            py-2
                            rounded-lg
                            bg-red-600
                            text-white
                            text-sm
                            font-semibold
                            hover:bg-red-700
                            disabled:opacity-50
                            disabled:cursor-not-allowed
                            transition
                            whitespace-nowrap
                          "
                        >
                          {deletingFeedbackId ===
                          feedback.feedback_id
                            ? "Deleting..."
                            : "🗑️ Delete"}
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* =====================================================
          PUBLIC FEEDBACK TABLE
      ===================================================== */}

      <div
        className="
          bg-white
          border
          rounded-2xl
          shadow-sm
          overflow-hidden
        "
      >

        <div className="p-5 border-b">

          <div className="flex items-center gap-3">

            <div
              className="
                w-10
                h-10
                rounded-lg
                bg-green-50
                flex
                items-center
                justify-center
                text-xl
              "
            >
              👥
            </div>

            <div>
              <h2
                className="
                  font-bold
                  text-gray-800
                "
              >
                Public Feedback
              </h2>

              <p
                className="
                  text-xs
                  text-gray-500
                  mt-1
                "
              >
                All feedback submitted by public users.
              </p>
            </div>

          </div>

        </div>

        {publicFeedbacks.length === 0 ? (

          <EmptyTable type="public" />

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-green-50">

                <tr>

                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600">
                    User
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600">
                    Kifle Ketema
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600">
                    Kebele
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600">
                    Sefer
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600">
                    Category
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600">
                    Rating
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600">
                    Status
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600">
                    Date
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y">

                {publicFeedbacks.map((feedback) => (

                  <tr
                    key={feedback.feedback_id}
                    className="hover:bg-gray-50"
                  >

                    <td className="px-5 py-4">

                      <div className="font-medium text-gray-800 whitespace-nowrap">
                        Public User
                      </div>

                      <div className="mt-1 inline-flex px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                        Public
                      </div>

                    </td>

                    <td className="px-5 py-4">

                      <span className="inline-flex px-3 py-1 rounded-lg bg-gray-100 text-gray-700 text-sm whitespace-nowrap">
                        {getKifleKetema(feedback)}
                      </span>

                    </td>

                    <td className="px-5 py-4">

                      <span className="inline-flex px-3 py-1 rounded-lg bg-gray-100 text-gray-700 text-sm whitespace-nowrap">
                        {getKebele(feedback)}
                      </span>

                    </td>

                    <td className="px-5 py-4">

                      <span className="inline-flex px-3 py-1 rounded-lg bg-gray-100 text-gray-700 text-sm whitespace-nowrap">
                        {getSefer(feedback)}
                      </span>

                    </td>

                    <td className="px-5 py-4">

                      <span className="inline-flex px-3 py-1 rounded-lg bg-green-100 text-green-700 text-sm font-medium whitespace-nowrap">
                        {getCategory(feedback)}
                      </span>

                    </td>

                    <td className="px-5 py-4">
                      {renderRating(feedback.rating)}
                    </td>

                    <td className="px-5 py-4">
                      {renderStatus(feedback)}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {formatDate(
                        feedback.feedback_date ||
                          feedback.created_at
                      )}
                    </td>

                    {/* ACTIONS */}

                    <td className="px-5 py-4">

                      <div className="flex items-center gap-2">

                        <button
                          type="button"
                          onClick={() =>
                            handleViewFeedback(feedback)
                          }
                          className="
                            inline-flex
                            items-center
                            gap-2
                            px-4
                            py-2
                            rounded-lg
                            bg-blue-600
                            text-white
                            text-sm
                            font-semibold
                            hover:bg-blue-700
                            transition
                            whitespace-nowrap
                          "
                        >
                          👁️ View
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteFeedback(feedback)
                          }
                          disabled={
                            deletingFeedbackId ===
                            feedback.feedback_id
                          }
                          className="
                            inline-flex
                            items-center
                            gap-2
                            px-4
                            py-2
                            rounded-lg
                            bg-red-600
                            text-white
                            text-sm
                            font-semibold
                            hover:bg-red-700
                            disabled:opacity-50
                            disabled:cursor-not-allowed
                            transition
                            whitespace-nowrap
                          "
                        >
                          {deletingFeedbackId ===
                          feedback.feedback_id
                            ? "Deleting..."
                            : "🗑️ Delete"}
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* =====================================================
          VIEW FEEDBACK MODAL
      ===================================================== */}

      {selectedFeedback && (

        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/50
            p-4
          "
          onClick={handleCloseModal}
        >

          <div
            className="
              bg-white
              w-full
              max-w-3xl
              max-h-[90vh]
              overflow-y-auto
              rounded-2xl
              shadow-2xl
            "
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* ==========================================
                MODAL HEADER
            ========================================== */}

            <div
              className="
                sticky
                top-0
                bg-white
                border-b
                px-6
                py-5
                flex
                items-center
                justify-between
                gap-4
                z-10
              "
            >

              <div className="flex items-center gap-3">

                <div
                  className="
                    w-11
                    h-11
                    rounded-xl
                    bg-blue-50
                    flex
                    items-center
                    justify-center
                    text-xl
                  "
                >
                  💬
                </div>

                <div>

                  <h2
                    className="
                      text-xl
                      font-bold
                      text-gray-800
                    "
                  >
                    Feedback Details
                  </h2>

                  <p
                    className="
                      text-xs
                      text-gray-500
                      mt-1
                    "
                  >
                    Complete feedback submitted by
                    the user.
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                className="
                  w-10
                  h-10
                  rounded-full
                  bg-gray-100
                  text-gray-600
                  hover:bg-gray-200
                  text-xl
                  font-bold
                "
                aria-label="Close"
              >
                ×
              </button>

            </div>

            {/* ==========================================
                MODAL CONTENT
            ========================================== */}

            <div className="p-6 space-y-6">

              {/* ======================================
                  STATUS
              ====================================== */}

              <div
                className="
                  bg-blue-50
                  border
                  border-blue-100
                  rounded-xl
                  p-4
                "
              >

                <div className="flex items-center justify-between gap-4">

                  <div>

                    <p className="text-xs text-gray-500">
                      Feedback Status
                    </p>

                    <p className="text-sm text-gray-600 mt-1">
                      This feedback was opened by Municipal Admin.
                    </p>

                  </div>

                  <div>
                    {renderStatus(selectedFeedback)}
                  </div>

                </div>

              </div>

              {/* ======================================
                  SENDER INFORMATION
              ====================================== */}

              <div>

                <h3
                  className="
                    text-sm
                    font-bold
                    text-gray-800
                    mb-3
                  "
                >
                  👤 Sender Information
                </h3>

                <div
                  className="
                    grid
                    grid-cols-1
                    md:grid-cols-2
                    gap-4
                  "
                >

                  {/* NAME */}

                  <div className="bg-gray-50 rounded-xl p-4">

                    <p className="text-xs text-gray-500 mb-1">
                      Name
                    </p>

                    <p className="font-semibold text-gray-800">
                      {getSenderName(selectedFeedback)}
                    </p>

                  </div>

                  {/* TYPE */}

                  <div className="bg-gray-50 rounded-xl p-4">

                    <p className="text-xs text-gray-500 mb-1">
                      User Type
                    </p>

                    {getSenderType(selectedFeedback)}

                  </div>

                  {/* PHONE */}

                  <div className="bg-gray-50 rounded-xl p-4">

                    <p className="text-xs text-gray-500 mb-1">
                      Phone
                    </p>

                    {getSenderPhone(selectedFeedback) !== "-" ? (

                      <a
                        href={`tel:${getSenderPhone(
                          selectedFeedback
                        )}`}
                        className="
                          font-semibold
                          text-blue-600
                          hover:underline
                        "
                      >
                        {getSenderPhone(selectedFeedback)}
                      </a>

                    ) : (

                      <p className="text-gray-700">
                        -
                      </p>

                    )}

                  </div>

                  {/* EMAIL */}

                  <div className="bg-gray-50 rounded-xl p-4">

                    <p className="text-xs text-gray-500 mb-1">
                      Email
                    </p>

                    <p
                      className="
                        font-semibold
                        text-gray-800
                        break-all
                      "
                    >
                      {getSenderEmail(selectedFeedback)}
                    </p>

                  </div>

                </div>

              </div>

              {/* ======================================
                  LOCATION INFORMATION
              ====================================== */}

              <div>

                <h3
                  className="
                    text-sm
                    font-bold
                    text-gray-800
                    mb-3
                  "
                >
                  📍 Location Information
                </h3>

                <div
                  className="
                    grid
                    grid-cols-1
                    md:grid-cols-3
                    gap-4
                  "
                >

                  <div className="bg-gray-50 rounded-xl p-4">

                    <p className="text-xs text-gray-500 mb-1">
                      Kifle Ketema
                    </p>

                    <p className="font-semibold text-gray-800">
                      {getKifleKetema(selectedFeedback)}
                    </p>

                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">

                    <p className="text-xs text-gray-500 mb-1">
                      Kebele
                    </p>

                    <p className="font-semibold text-gray-800">
                      {getKebele(selectedFeedback)}
                    </p>

                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">

                    <p className="text-xs text-gray-500 mb-1">
                      Sefer
                    </p>

                    <p className="font-semibold text-gray-800">
                      {getSefer(selectedFeedback)}
                    </p>

                  </div>

                </div>

              </div>

              {/* ======================================
                  FEEDBACK INFORMATION
              ====================================== */}

              <div>

                <h3
                  className="
                    text-sm
                    font-bold
                    text-gray-800
                    mb-3
                  "
                >
                  ⭐ Feedback Information
                </h3>

                <div className="space-y-4">

                  {/* CATEGORY */}

                  <div className="bg-gray-50 rounded-xl p-4">

                    <p className="text-xs text-gray-500 mb-1">
                      Category
                    </p>

                    <div className="mt-2">

                      <span
                        className="
                          inline-flex
                          px-3
                          py-1.5
                          rounded-full
                          bg-blue-100
                          text-blue-700
                          text-sm
                          font-semibold
                        "
                      >
                        {getCategory(selectedFeedback)}
                      </span>

                    </div>

                  </div>

                  {/* RATING */}

                  <div className="bg-gray-50 rounded-xl p-4">

                    <p className="text-xs text-gray-500 mb-2">
                      Rating
                    </p>

                    {renderRating(
                      selectedFeedback.rating
                    )}

                  </div>

                  {/* FULL COMMENT */}

                  <div className="bg-gray-50 rounded-xl p-4">

                    <div className="flex items-center justify-between gap-3 mb-2">

                      <p className="text-xs text-gray-500">
                        Full Comment
                      </p>

                      <span className="text-xs text-gray-400">
                        Complete feedback
                      </span>

                    </div>

                    <div
                      className="
                        bg-white
                        border
                        border-gray-200
                        rounded-xl
                        p-5
                        min-h-[120px]
                      "
                    >

                      <p
                        className="
                          text-gray-700
                          whitespace-pre-wrap
                          break-words
                          leading-7
                        "
                      >
                        {getDescription(
                          selectedFeedback
                        )}
                      </p>

                    </div>

                  </div>

                </div>

              </div>

              {/* ======================================
                  SUBMISSION INFORMATION
              ====================================== */}

              <div>

                <h3
                  className="
                    text-sm
                    font-bold
                    text-gray-800
                    mb-3
                  "
                >
                  🗓️ Submission Information
                </h3>

                <div
                  className="
                    grid
                    grid-cols-1
                    md:grid-cols-2
                    gap-4
                  "
                >

                  {/* FEEDBACK ID */}

                  <div className="bg-gray-50 rounded-xl p-4">

                    <p className="text-xs text-gray-500 mb-1">
                      Feedback ID
                    </p>

                    <p className="font-semibold text-gray-800">
                      #{selectedFeedback.feedback_id || "-"}
                    </p>

                  </div>

                  {/* DATE */}

                  <div className="bg-gray-50 rounded-xl p-4">

                    <p className="text-xs text-gray-500 mb-1">
                      Submitted Date
                    </p>

                    <p className="font-semibold text-gray-800">
                      {formatDateTime(
                        selectedFeedback.feedback_date ||
                          selectedFeedback.created_at
                      )}
                    </p>

                  </div>

                </div>

              </div>

            </div>

            {/* ==========================================
                MODAL FOOTER
            ========================================== */}

            <div
              className="
                border-t
                bg-gray-50
                px-6
                py-4
                flex
                items-center
                justify-between
                gap-3
              "
            >

              {/* DELETE FROM MODAL */}

              <button
                type="button"
                onClick={() =>
                  handleDeleteFeedback(selectedFeedback)
                }
                disabled={
                  deletingFeedbackId ===
                  selectedFeedback.feedback_id
                }
                className="
                  px-5
                  py-2.5
                  rounded-lg
                  bg-red-600
                  text-white
                  text-sm
                  font-semibold
                  hover:bg-red-700
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                "
              >
                {deletingFeedbackId ===
                selectedFeedback.feedback_id
                  ? "Deleting..."
                  : "🗑️ Delete Feedback"}
              </button>

              <button
                type="button"
                onClick={handleCloseModal}
                className="
                  px-5
                  py-2.5
                  rounded-lg
                  bg-gray-800
                  text-white
                  text-sm
                  font-semibold
                  hover:bg-gray-900
                "
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};

export default Feedback;
