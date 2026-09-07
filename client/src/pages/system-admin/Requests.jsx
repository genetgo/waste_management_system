import React, { useEffect, useState } from "react";
import API from "../../services/api";

const Requests = () => {

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");

  // ==========================================
  // Load All Requests
  // ==========================================
  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {

    try {

      setLoading(true);

      const response =
        await API.get("/requests");

      console.log(
        "SYSTEM ADMIN REQUESTS RESPONSE:",
        response.data
      );

      const data =
        response.data?.data ||
        response.data ||
        [];

      setRequests(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (error) {

      console.error(
        "Load Requests Error:",
        error.response?.data ||
        error.message
      );

      setRequests([]);

    } finally {

      setLoading(false);

    }
  };


  // ==========================================
  // Delete Request
  // SYSTEM ADMIN ONLY
  // ==========================================
  const handleDelete = async (id) => {

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this request?"
      );

    if (!confirmed) {
      return;
    }

    try {

      setDeletingId(id);

      const response =
        await API.delete(
          `/requests/${id}`
        );

      console.log(
        "DELETE REQUEST RESPONSE:",
        response.data
      );

      alert(
        "Request deleted successfully."
      );

      // Remove from current table
      setRequests((prev) =>
        prev.filter(
          (request) =>
            Number(request.request_id) !==
            Number(id)
        )
      );

    } catch (error) {

      console.error(
        "Delete Request Error:",
        error.response?.data ||
        error.message
      );

      alert(
        error.response?.data?.message ||
        "Failed to delete request."
      );

    } finally {

      setDeletingId(null);

    }
  };


  // ==========================================
  // Format Date
  // ==========================================
  const formatDate = (date) => {

    if (!date) {
      return "-";
    }

    const parsedDate =
      new Date(date);

    if (
      isNaN(
        parsedDate.getTime()
      )
    ) {
      return "-";
    }

    return parsedDate.toLocaleDateString();

  };


  // ==========================================
  // Status Class
  // ==========================================
  const getStatusClass = (status) => {

    switch (
      String(status || "")
        .trim()
        .toLowerCase()
    ) {

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
  // Search
  // ==========================================
  const filteredRequests =
    requests.filter((request) => {

      const keyword =
        search
          .trim()
          .toLowerCase();

      if (!keyword) {
        return true;
      }

      return (

        String(
          request.request_id || ""
        )
          .toLowerCase()
          .includes(keyword)

        ||

        String(
          request.business_name || ""
        )
          .toLowerCase()
          .includes(keyword)

        ||

        String(
          request.owner_name || ""
        )
          .toLowerCase()
          .includes(keyword)

        ||

        String(
          request.phone_number ||
          request.phone ||
          ""
        )
          .toLowerCase()
          .includes(keyword)

        ||

        String(
          request.kifle_ketema || ""
        )
          .toLowerCase()
          .includes(keyword)

        ||

        String(
          request.kebele || ""
        )
          .toLowerCase()
          .includes(keyword)

        ||

        String(
          request.sefer || ""
        )
          .toLowerCase()
          .includes(keyword)

        ||

        String(
          request.status || ""
        )
          .toLowerCase()
          .includes(keyword)

      );

    });


  // ==========================================
  // Loading
  // ==========================================
  if (loading) {

    return (

      <div className="p-6">

        <div className="
          bg-white
          rounded-xl
          shadow
          p-8
          text-center
        ">

          <p className="text-gray-600">
            Loading requests...
          </p>

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
          Header
      ======================================= */}
      <div className="mb-6">

        <h1 className="
          text-3xl
          font-bold
          text-gray-800
        ">
          Collection Requests
        </h1>

        <p className="
          text-gray-500
          mt-1
        ">
          View and manage all collection
          requests.
        </p>

      </div>


      {/* ======================================
          Search
      ======================================= */}
      <div className="
        bg-white
        rounded-xl
        shadow
        p-4
        mb-6
      ">

        <input
          type="text"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Search requests..."
          className="
            w-full
            border
            border-gray-300
            rounded-lg
            px-4
            py-3
            outline-none
            focus:ring-2
            focus:ring-blue-500
          "
        />

      </div>


      {/* ======================================
          Statistics
      ======================================= */}
      <div className="
        mb-4
        text-sm
        text-gray-600
      ">

        Showing{" "}
        <span className="font-semibold">
          {filteredRequests.length}
        </span>{" "}
        of{" "}
        <span className="font-semibold">
          {requests.length}
        </span>{" "}
        requests

      </div>


      {/* ======================================
          Empty
      ======================================= */}
      {filteredRequests.length === 0 ? (

        <div className="
          bg-white
          rounded-xl
          shadow
          p-10
          text-center
        ">

          <div className="
            text-5xl
            mb-4
          ">
            📋
          </div>

          <h2 className="
            text-xl
            font-semibold
            text-gray-700
          ">
            No Requests Found
          </h2>

          <p className="
            text-gray-500
            mt-2
          ">
            There are no collection requests
            matching your search.
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
                Header
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
                  Request Date
                </th>

                <th className="p-3 text-left">
                  Status
                </th>

                <th className="p-3 text-left">
                  Action
                </th>

              </tr>

            </thead>


            {/* ==================================
                Body
            =================================== */}
            <tbody>

              {filteredRequests.map(
                (request) => {

                  const status =
                    String(
                      request.status || ""
                    )
                      .trim()
                      .toLowerCase();

                  return (

                    <tr
                      key={
                        request.request_id
                      }
                      className="
                        border-b
                        hover:bg-gray-50
                      "
                    >

                      {/* ID */}
                      <td className="p-3">

                        {request.request_id || "-"}

                      </td>


                      {/* Business */}
                      <td className="p-3">

                        {request.business_name || "-"}

                      </td>


                      {/* Owner */}
                      <td className="p-3">

                        {request.owner_name || "-"}

                      </td>


                      {/* Phone */}
                      <td className="p-3">

                        {request.phone_number ||
                          request.phone ||
                          "-"}

                      </td>


                      {/* Kifle Ketema */}
                      <td className="p-3">

                        {request.kifle_ketema ||
                          "-"}

                      </td>


                      {/* Kebele */}
                      <td className="p-3">

                        {request.kebele || "-"}

                      </td>


                      {/* Sefer */}
                      <td className="p-3">

                        {request.sefer || "-"}

                      </td>


                      {/* Date */}
                      <td className="p-3">

                        {formatDate(
                          request.request_date ||
                          request.created_at
                        )}

                      </td>


                      {/* Status */}
                      <td className="p-3">

                        <span
                          className={`
                            inline-block
                            px-3
                            py-1
                            rounded-full
                            text-sm
                            font-semibold
                            ${getStatusClass(
                              request.status
                            )}
                          `}
                        >

                          {request.status || "-"}

                        </span>

                      </td>


                      {/* Delete */}
                      <td className="p-3">

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              request.request_id
                            )
                          }
                          disabled={
                            deletingId ===
                            request.request_id
                          }
                          className="
                            bg-red-600
                            hover:bg-red-700
                            disabled:bg-gray-400
                            text-white
                            px-3
                            py-1
                            rounded-lg
                            transition
                            font-medium
                          "
                        >

                          {deletingId ===
                          request.request_id
                            ? "Deleting..."
                            : "Delete"}

                        </button>

                      </td>

                    </tr>

                  );

                }
              )}

            </tbody>

          </table>

        </div>

      )}

    </div>

  );
};

export default Requests;