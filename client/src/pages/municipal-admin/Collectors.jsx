import React, { useEffect, useState } from "react";
import API from "../../services/api";

const Collectors = () => {
  const [collectors, setCollectors] = useState([]);
  const [filteredCollectors, setFilteredCollectors] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");

  // ==========================================
  // Load Collectors
  // ==========================================
  useEffect(() => {
    loadCollectors();
  }, []);

  // ==========================================
  // Search Filter
  // ==========================================
  useEffect(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      setFilteredCollectors(collectors);
      return;
    }

    const filtered = collectors.filter((collector) => {
      return (
        (collector.full_name || "")
          .toLowerCase()
          .includes(keyword) ||

        (collector.phone_number || "")
          .toLowerCase()
          .includes(keyword) ||

        (collector.email || "")
          .toLowerCase()
          .includes(keyword) ||

        (collector.assigned_kifle_ketema || "")
          .toLowerCase()
          .includes(keyword) ||

        (collector.kebele || "")
          .toLowerCase()
          .includes(keyword)
      );
    });

    setFilteredCollectors(filtered);
  }, [search, collectors]);

  // ==========================================
  // Load Collectors
  // ==========================================
  const loadCollectors = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await API.get("/collectors");

      console.log("Collectors response:", res.data);

      const data = res.data?.data || res.data || [];

      setCollectors(Array.isArray(data) ? data : []);
      setFilteredCollectors(Array.isArray(data) ? data : []);

    } catch (error) {
      console.error(
        "Load collectors error:",
        error.response?.data || error
      );

      const message =
        error.response?.data?.message ||
        "Unable to load collectors.";

      setError(message);

    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // Delete Collector
  // ==========================================
  const deleteCollector = async (collectorId) => {
    if (!collectorId) {
      alert("Collector ID is missing.");
      return;
    }

    const collector = collectors.find(
      (item) => item.collector_id === collectorId
    );

    const collectorName =
      collector?.full_name || "this collector";

    const confirmed = window.confirm(
      `Are you sure you want to delete ${collectorName}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(collectorId);
      setError("");

      const response = await API.delete(
        `/collectors/${collectorId}`
      );

      // Remove from UI
      setCollectors((prev) =>
        prev.filter(
          (item) =>
            item.collector_id !== collectorId
        )
      );

      setFilteredCollectors((prev) =>
        prev.filter(
          (item) =>
            item.collector_id !== collectorId
        )
      );

      alert(
        response.data?.message ||
          "Collector deleted successfully."
      );

    } catch (error) {
      console.error(
        "Delete collector error:",
        error.response?.data || error
      );

      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to delete collector.";

      setError(message);

      alert(message);

    } finally {
      setDeletingId(null);
    }
  };

  // ==========================================
  // Loading
  // ==========================================
  if (loading) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-lg font-semibold">
          Loading Collectors...
        </h2>
      </div>
    );
  }

  // ==========================================
  // JSX
  // ==========================================
  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="
        flex
        flex-col
        md:flex-row
        md:justify-between
        md:items-center
        gap-4
      ">

        <h1 className="text-3xl font-bold">
          Waste Collectors
        </h1>

        <input
          type="text"
          placeholder="Search collector ,name ,email..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="
            border
            border-gray-300
            rounded-lg
            px-4
            py-2
            w-full
            md:w-72
            outline-none
            focus:ring-2
            focus:ring-green-500
          "
        />

      </div>

      {/* Error */}
      {error && (
        <div className="
          bg-red-50
          border
          border-red-300
          text-red-700
          rounded-lg
          p-4
        ">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="
        overflow-x-auto
        bg-white
        rounded-xl
        shadow
        border
      ">

        <table className="w-full">

          <thead className="
            bg-blue-600
            text-white
          ">

            <tr>

              <th className="p-3">
                ID
              </th>

              <th className="p-3">
                Full Name
              </th>

              <th className="p-3">
                Phone
              </th>

              <th className="p-3">
                Email
              </th>

              <th className="p-3">
                Assigned Kifle Ketema
              </th>

              <th className="p-3">
                Kebele
              </th>

              <th className="p-3">
                Status
              </th>

              <th className="p-3">
                Action
              </th>

            </tr>

          </thead>

          <tbody>

            {filteredCollectors.length === 0 ? (

              <tr>

                <td
                  colSpan="8"
                  className="
                    text-center
                    py-10
                    text-gray-500
                  "
                >
                  No collectors found.
                </td>

              </tr>

            ) : (

              filteredCollectors.map((collector) => {

                // ==================================
                // Status comes from DB
                // Active / Inactive
                // ==================================
               const isActive =
  collector.is_active === true ||
  collector.is_active === "true" ||
  collector.is_active === 1;
                return (
                  <tr
                    key={collector.collector_id}
                    className="
                      border-b
                      hover:bg-gray-50
                    "
                  >

                    {/* ID */}
                    <td className="p-3">
                      {collector.collector_id}
                    </td>

                    {/* Full Name */}
                    <td className="
                      p-3
                      font-semibold
                    ">
                      {collector.full_name || "-"}
                    </td>

                    {/* Phone */}
                    <td className="p-3">
                      {collector.phone_number || "-"}
                    </td>

                    {/* Email */}
                    <td className="p-3">
                      {collector.email || "-"}
                    </td>

                    {/* Kifle Ketema */}
                    <td className="p-3">
                      {collector.assigned_kifle_ketema || "-"}
                    </td>

                    {/* Kebele */}
                    <td className="p-3">
                      {collector.kebele || "-"}
                    </td>

                    {/* Status */}
                    <td className="p-3">

                      {isActive ? (

                        <span className="
                          bg-green-100
                          text-green-700
                          px-3
                          py-1
                          rounded-full
                          text-sm
                          font-semibold
                        ">
                          Active
                        </span>

                      ) : (

                        <span className="
                          bg-red-100
                          text-red-700
                          px-3
                          py-1
                          rounded-full
                          text-sm
                          font-semibold
                        ">
                          Inactive
                        </span>

                      )}

                    </td>

                    {/* Action */}
                    <td className="p-3">

                      <button
                        type="button"
                        onClick={() =>
                          deleteCollector(
                            collector.collector_id
                          )
                        }
                        disabled={
                          deletingId ===
                          collector.collector_id
                        }
                        className="
                          bg-red-600
                          hover:bg-red-700
                          disabled:bg-gray-400
                          text-white
                          px-3
                          py-1.5
                          rounded-lg
                          font-semibold
                          transition
                        "
                      >

                        {deletingId ===
                        collector.collector_id
                          ? "Deleting..."
                          : "Delete"}

                      </button>

                    </td>

                  </tr>
                );
              })

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
};

export default Collectors;