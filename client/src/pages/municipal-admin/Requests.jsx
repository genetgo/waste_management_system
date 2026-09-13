import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import socket from "../../services/socket";

const Requests = () => {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectDescription, setRejectDescription] = useState("");

  // ==========================================
  // Load Requests
  // ==========================================
  const loadRequests = async () => {
    try {
      setLoading(true);

      const res = await API.get("/requests");

      console.log("REQUESTS API RESPONSE:", res.data);

      const data = res.data?.data || res.data || [];

      setRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(
        "Load requests error:",
        error.response?.data || error.message
      );

      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // Initial Load
  // ==========================================
  useEffect(() => {
    loadRequests();
  }, []);

  // ==========================================
  // SOCKET
  // Real-time request updates
  // ==========================================
  useEffect(() => {
    if (!socket) {
      console.warn("Socket is not available");
      return;
    }

    console.log("Municipal Admin Requests socket connected");

    // ------------------------------------------
    // New Request
    // ------------------------------------------
    const handleNewRequest = (data) => {
      console.log("NEW REQUEST SOCKET EVENT:", data);

      loadRequests();
    };

    // ------------------------------------------
    // Request Updated
    // ------------------------------------------
    const handleRequestUpdated = (data) => {
      console.log("REQUEST UPDATED SOCKET EVENT:", data);

      loadRequests();
    };

    // ------------------------------------------
    // Request Status Changed
    // ------------------------------------------
    const handleRequestStatusChanged = (data) => {
      console.log(
        "REQUEST STATUS CHANGED SOCKET EVENT:",
        data
      );

      loadRequests();
    };

    // ------------------------------------------
    // Request Approved
    // ------------------------------------------
    const handleRequestApproved = (data) => {
      console.log(
        "REQUEST APPROVED SOCKET EVENT:",
        data
      );

      loadRequests();
    };

    // ------------------------------------------
    // Request Rejected
    // ------------------------------------------
    const handleRequestRejected = (data) => {
      console.log(
        "REQUEST REJECTED SOCKET EVENT:",
        data
      );

      loadRequests();
    };

    // ------------------------------------------
    // Request Assigned
    // ------------------------------------------
    const handleRequestAssigned = (data) => {
      console.log(
        "REQUEST ASSIGNED SOCKET EVENT:",
        data
      );

      loadRequests();
    };

    // ------------------------------------------
    // Register socket listeners
    // ------------------------------------------
    socket.on(
      "new_request",
      handleNewRequest
    );

    socket.on(
      "request_created",
      handleNewRequest
    );

    socket.on(
      "request_updated",
      handleRequestUpdated
    );

    socket.on(
      "request_status_changed",
      handleRequestStatusChanged
    );

    socket.on(
      "request_approved",
      handleRequestApproved
    );

    socket.on(
      "request_rejected",
      handleRequestRejected
    );

    socket.on(
      "request_assigned",
      handleRequestAssigned
    );

    // ------------------------------------------
    // Cleanup
    // ------------------------------------------
    return () => {
      socket.off(
        "new_request",
        handleNewRequest
      );

      socket.off(
        "request_created",
        handleNewRequest
      );

      socket.off(
        "request_updated",
        handleRequestUpdated
      );

      socket.off(
        "request_status_changed",
        handleRequestStatusChanged
      );

      socket.off(
        "request_approved",
        handleRequestApproved
      );

      socket.off(
        "request_rejected",
        handleRequestRejected
      );

      socket.off(
        "request_assigned",
        handleRequestAssigned
      );

      console.log(
        "Municipal Admin Requests socket listeners removed"
      );
    };
  }, []);

  // ==========================================
  // Approve Request
  // Pending → Approved
  // ==========================================
  const approveRequest = async (id) => {
    try {
      const res = await API.patch(
        `/requests/${id}/approve`
      );

      console.log(
        "Approve response:",
        res.data
      );

      alert(
        "Request Approved Successfully"
      );

      await loadRequests();
    } catch (error) {
      console.error(
        "Approve error:",
        error.response?.data ||
          error.message
      );

      alert(
        error.response?.data?.message ||
          "Approval Failed"
      );
    }
  };

  // ==========================================
  // Open Reject Form
  // ==========================================
  const openRejectForm = (id) => {
    setRejectingId(id);
    setRejectDescription("");
  };

  // ==========================================
  // Cancel Reject
  // ==========================================
  const cancelReject = () => {
    setRejectingId(null);
    setRejectDescription("");
  };

  // ==========================================
  // Reject Request
  // Pending → Rejected
  // Admin MUST provide description
  // ==========================================
  const rejectRequest = async () => {
    if (!rejectingId) {
      return;
    }

    const description =
      rejectDescription.trim();

    if (!description) {
      alert(
        "Reject description is required."
      );
      return;
    }

    try {
      const res = await API.patch(
        `/requests/${rejectingId}/reject`,
        {
          description: description,
        }
      );

      console.log(
        "Reject response:",
        res.data
      );

      alert(
        "Request Rejected Successfully"
      );

      setRejectingId(null);
      setRejectDescription("");

      await loadRequests();
    }catch (error) {
    console.error("Reject error:", error);

    console.error(
        "Reject response:",
        error?.response?.data
    );

    console.error(
        "Reject status:",
        error?.response?.status
    );

    console.error(
        "Reject message:",
        error?.response?.data?.message ||
        error?.message
    );

    alert(
        error?.response?.data?.message ||
        "Failed to reject request."
    );
}
    
  };

  // ==========================================
  // Assign Collector
  // Approved → Assign Collector
  // ==========================================
  const assignCollector = (id) => {
    navigate(
      `/municipal-admin/assign-collector/${id}`
    );
  };

  // ==========================================
  // Format Date
  // ==========================================
  const formatDate = (date) => {
  if (!date) {
    return "-";
  }

  const parsedDate = new Date(date);

  if (isNaN(parsedDate.getTime())) {
    return "-";
  }

  return parsedDate.toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric"
  });
};

  // ==========================================
  // Status Badge
  // ==========================================
  const getStatusClass = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";

      case "approved":
        return "bg-green-100 text-green-700";

      case "assigned":
        return "bg-blue-100 text-blue-700";

      case "in progress":
        return "bg-purple-100 text-purple-700";

      case "collected":
        return "bg-indigo-100 text-indigo-700";

      case "completed":
        return "bg-green-200 text-green-800";

      case "rejected":
        return "bg-red-100 text-red-700";

      case "cancelled":
        return "bg-gray-100 text-gray-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // ==========================================
  // Loading
  // ==========================================
  if (loading) {
    return (
      <div className="p-6">
        <div className="text-gray-600">
          Loading requests...
        </div>
      </div>
    );
  }

  // ==========================================
  // UI
  // ==========================================
  return (
    <div className="p-6">

      {/* ======================================
          Page Header
      ======================================= */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Collection Requests
        </h1>

        <p className="text-gray-500 mt-1">
          Manage on-demand waste collection requests.
        </p>
      </div>

      {/* ======================================
          Reject Description Modal
      ======================================= */}
      {rejectingId && (
        <div className="
          fixed
          inset-0
          z-[100]
          bg-black
          bg-opacity-50
          flex
          items-center
          justify-center
          p-4
        ">
          <div className="
            bg-white
            rounded-xl
            shadow-2xl
            w-full
            max-w-lg
            p-6
          ">

            <h2 className="
              text-xl
              font-bold
              text-gray-800
              mb-2
            ">
              Reject Collection Request
            </h2>

            <p className="
              text-sm
              text-gray-500
              mb-4
            ">
              Please provide a reason for rejecting
              this request.
            </p>

            <label className="
              block
              text-sm
              font-semibold
              text-gray-700
              mb-2
            ">
              Reject Description
            </label>

            <textarea
              value={rejectDescription}
              onChange={(e) =>
                setRejectDescription(
                  e.target.value
                )
              }
              placeholder="Enter the reason for rejection..."
              rows={5}
              className="
                w-full
                border
                border-gray-300
                rounded-lg
                px-4
                py-3
                outline-none
                focus:ring-2
                focus:ring-red-500
                focus:border-red-500
                resize-none
              "
            />

            <div className="
              flex
              justify-end
              gap-3
              mt-5
            ">

              <button
                type="button"
                onClick={cancelReject}
                className="
                  px-5
                  py-2
                  rounded-lg
                  border
                  border-gray-300
                  text-gray-700
                  hover:bg-gray-100
                  transition
                "
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={rejectRequest}
                className="
                  px-5
                  py-2
                  rounded-lg
                  bg-red-600
                  hover:bg-red-700
                  text-white
                  font-semibold
                  transition
                "
              >
                Confirm Reject
              </button>

            </div>
          </div>
        </div>
      )}

      {/* ======================================
          Empty State
      ======================================= */}
      {requests.length === 0 ? (
        <div className="
          bg-white
          rounded-xl
          shadow
          p-8
          text-center
        ">
          <p className="text-gray-500">
            No collection requests found.
          </p>
        </div>
      ) : (

        /* ====================================
           Table
        ===================================== */
        <div className="
          overflow-x-auto
          bg-white
          rounded-xl
          shadow
        ">

          <table className="w-full">

            {/* ==================================
                Table Header
            =================================== */}
            <thead className="
              bg-blue-700
              text-white
            ">

              <tr>

                <th className="p-3 text-left">
                  ID
                </th>

                <th className="p-3 text-left">
                  Business
                </th>

                <th className="p-3 text-left">
                  Owner
                </th>

                <th className="p-3 text-left">
                  Phone
                </th>

                <th className="p-3 text-left">
                  Kifle Ketema
                </th>

                <th className="p-3 text-left">
                  Kebele
                </th>

                <th className="p-3 text-left">
                  Sefer
                </th>

                <th className="p-3 text-left">
                  House Number
                </th>

                <th className="p-3 text-left">
                  Request Date
                </th>

                <th className="p-3 text-left">
                  Status
                </th>

                <th className="p-3 text-left">
                  Rejection Reason
                </th>

                <th className="p-3 text-left">
                  Action
                </th>

              </tr>

            </thead>

            {/* ==================================
                Table Body
            =================================== */}
            <tbody>

              {requests.map((request) => {

                // Normalize status
                const status =
                  String(
                    request.status || ""
                  )
                    .trim()
                    .toLowerCase();

                return (
                  <tr
                    key={request.request_id}
                    className="
                      border-b
                      hover:bg-gray-50
                    "
                  >

                    {/* =========================
                        ID
                    ========================== */}
                    <td className="p-3">
                      {request.request_id || "-"}
                    </td>

                    {/* =========================
                        Business
                    ========================== */}
                    <td className="p-3">
                      {request.business_name || "-"}
                    </td>

                    {/* =========================
                        Owner
                    ========================== */}
                    <td className="p-3">
                      {request.owner_name || "-"}
                    </td>

                    {/* =========================
                        Phone
                    ========================== */}
                    <td className="p-3">
                      {request.phone_number ||
                        request.phone ||
                        "-"}
                    </td>

                    {/* =========================
                        Kifle Ketema
                    ========================== */}
                    <td className="p-3">
                      {request.kifle_ketema || "-"}
                    </td>

                    {/* =========================
                        Kebele
                    ========================== */}
                    <td className="p-3">
                      {request.kebele || "-"}
                    </td>

                    {/* =========================
                        Sefer
                    ========================== */}
                    <td className="p-3">
                      {request.sefer || "-"}
                    </td>

                    {/* =========================
                        House Number
                    ========================== */}
                    <td className="p-3">
                      {request.house_number || "-"}
                    </td>

                    {/* =========================
                        Request Date
                    ========================== */}
                    <td className="p-3">
                      {formatDate(
                        request.preferred_collection_date ||
                        request.request_date ||
                        request.created_at
                      )}
                    </td>

                    {/* =========================
                        Status
                    ========================== */}
                    <td className="p-3">

                      <span
                        className={`
                          inline-block
                          px-3
                          py-1
                          rounded-full
                          text-sm
                          font-semibold
                          ${getStatusClass(status)}
                        `}
                      >
                        {request.status || "-"}
                      </span>

                    </td>

                    {/* =========================
                        Rejection Reason
                    ========================== */}
                    <td className="p-3">

                      {status === "rejected" ? (
                        <div className="
                          max-w-xs
                          text-sm
                          text-red-600
                          break-words
                        ">
                          {request.rejection_reason ||
                            request.reject_description ||
                            request.description ||
                            "-"}
                        </div>
                      ) : (
                        <span className="text-gray-400">
                          -
                        </span>
                      )}

                    </td>

                    {/* =========================
                        Actions
                    ========================== */}
                    <td className="p-3">

                      <div className="
                        flex
                        flex-wrap
                        gap-2
                      ">

                        {/* =====================
                            Pending
                        ====================== */}
                        {status === "pending" && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                approveRequest(
                                  request.request_id
                                )
                              }
                              className="
                                bg-green-600
                                hover:bg-green-700
                                text-white
                                px-3
                                py-1
                                rounded
                                transition
                              "
                            >
                              Approve
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                openRejectForm(
                                  request.request_id
                                )
                              }
                              className="
                                bg-red-600
                                hover:bg-red-700
                                text-white
                                px-3
                                py-1
                                rounded
                                transition
                              "
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {/* =====================
                            Approved
                        ====================== */}
                        {status === "approved" && (
                          <button
                            type="button"
                            onClick={() =>
                              assignCollector(
                                request.request_id
                              )
                            }
                            className="
                              bg-blue-600
                              hover:bg-blue-700
                              text-white
                              px-3
                              py-1
                              rounded
                              transition
                            "
                          >
                            Assign Collector
                          </button>
                        )}

                        {/* =====================
                            Assigned
                        ====================== */}
                        {status === "assigned" && (
                          <span className="
                            text-sm
                            text-blue-600
                            font-medium
                          ">
                            Collector Assigned
                          </span>
                        )}

                        {/* =====================
                            In Progress
                        ====================== */}
                        {status === "in progress" && (
                          <span className="
                            text-sm
                            text-purple-600
                            font-medium
                          ">
                            Collection In Progress
                          </span>
                        )}

                        {/* =====================
                            Collected
                        ====================== */}
                        {status === "collected" && (
                          <span className="
                            text-sm
                            text-indigo-600
                            font-medium
                          ">
                            Waiting for Business Confirmation
                          </span>
                        )}

                        {/* =====================
                            Completed
                        ====================== */}
                        {status === "completed" && (
                          <span className="
                            text-sm
                            text-green-600
                            font-medium
                          ">
                            Completed
                          </span>
                        )}

                        {/* =====================
                            Rejected
                        ====================== */}
                        {status === "rejected" && (
                          <span className="
                            text-sm
                            text-red-600
                            font-medium
                          ">
                            Rejected
                          </span>
                        )}

                        {/* =====================
                            Cancelled
                        ====================== */}
                        {status === "cancelled" && (
                          <span className="
                            text-sm
                            text-gray-500
                            font-medium
                          ">
                            Cancelled
                          </span>
                        )}

                      </div>

                    </td>

                  </tr>
                );
              })}

            </tbody>

          </table>

        </div>
      )}

    </div>
  );
};

export default Requests;