import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../services/api";

const AssignCollector = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [collectors, setCollectors] = useState([]);
  const [selectedCollector, setSelectedCollector] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ==========================================
  // Load Collectors
  // ==========================================
  useEffect(() => {
    loadCollectors();
  }, []);

  const loadCollectors = async () => {
    try {
      setLoading(true);

      const res = await API.get("/collectors");

      console.log("=================================");
      console.log("COLLECTORS RESPONSE:");
      console.log(res.data);
      console.log("=================================");

      const data = res.data?.data || res.data || [];

      // ==========================================
      // Only Active Collectors
      // ==========================================
      const activeCollectors = Array.isArray(data)
        ? data.filter(
            (collector) =>
              collector.is_active === true
          )
        : [];

      console.log(
        "ACTIVE COLLECTORS:",
        activeCollectors
      );

      setCollectors(activeCollectors);

    } catch (error) {
      console.error(
        "Load collectors error:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
        "Failed to load collectors."
      );

      setCollectors([]);

    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // Assign Collector
  // Approved → Assigned
  // ==========================================
  const assignCollector = async () => {

    if (!id) {
      alert("Request ID is missing.");
      return;
    }

    if (!selectedCollector) {
      alert("Please select a collector.");
      return;
    }

    try {
      setSaving(true);

      console.log("=================================");
      console.log("ASSIGN COLLECTOR");
      console.log("REQUEST ID:", id);
      console.log(
        "COLLECTOR ID:",
        selectedCollector
      );
      console.log("=================================");

      const res = await API.patch(
        `/requests/${id}/assign`,
        {
          collector_id: selectedCollector,
        }
      );

      console.log(
        "ASSIGN RESPONSE:",
        res.data
      );

      alert("Collector Assigned Successfully");

      // ==========================================
      // Return to Collection Requests page
      // ==========================================
      navigate("/municipal-admin/requests");

    } catch (error) {

      console.error(
        "Assign collector error:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
        "Failed to assign collector."
      );

    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // Cancel
  // ==========================================
  const handleCancel = () => {
    navigate("/municipal-admin/requests");
  };

  // ==========================================
  // Loading
  // ==========================================
  if (loading) {
    return (
      <div className="flex justify-center items-center h-72">
        <h2 className="text-lg font-semibold">
          Loading Collectors...
        </h2>
      </div>
    );
  }

  // ==========================================
  // UI
  // ==========================================
  return (
    <div className="max-w-3xl mx-auto mt-8 bg-white shadow-lg rounded-xl p-8">

      {/* ======================================
          Header
      ======================================= */}
      <div className="mb-6">

        <h1 className="text-3xl font-bold text-gray-800">
          Assign Collector
        </h1>

        <p className="text-gray-500 mt-2">
          Select the appropriate collector for this
          collection request.
        </p>

        <p className="text-sm text-gray-400 mt-1">
          Request ID: {id || "-"}
        </p>

      </div>

      {/* ======================================
          Collector Selection
      ======================================= */}
      <div className="space-y-2">

        <label className="font-semibold text-gray-700">
          Collector
        </label>

        <select
          value={selectedCollector}
          onChange={(e) =>
            setSelectedCollector(e.target.value)
          }
          className="
            w-full
            border
            border-gray-300
            rounded-lg
            p-3
            focus:outline-none
            focus:ring-2
            focus:ring-blue-500
          "
        >

          <option value="">
            ----- Select Collector -----
          </option>

          {collectors.length === 0 ? (

            <option disabled>
              No active collectors available
            </option>

          ) : (

            collectors.map((collector) => (

              <option
                key={collector.collector_id}
                value={collector.collector_id}
              >
                {collector.full_name}
                {" | "}
                {collector.assigned_kifle_ketema || "-"}
                {" | "}
                {collector.kebele || "-"}
              </option>

            ))

          )}

        </select>

      </div>

      {/* ======================================
          Buttons
      ======================================= */}
      <div className="mt-8 flex gap-4">

        {/* Cancel */}
        <button
          type="button"
          onClick={handleCancel}
          disabled={saving}
          className="
            flex-1
            bg-gray-500
            hover:bg-gray-600
            disabled:bg-gray-400
            text-white
            py-3
            rounded-lg
            font-semibold
            transition
          "
        >
          Cancel
        </button>

        {/* Assign */}
        <button
          type="button"
          onClick={assignCollector}
          disabled={
            saving ||
            !selectedCollector ||
            collectors.length === 0
          }
          className="
            flex-1
            bg-blue-600
            hover:bg-blue-700
            disabled:bg-gray-400
            text-white
            py-3
            rounded-lg
            font-semibold
            transition
          "
        >
          {saving
            ? "Assigning..."
            : "Assign Collector"}
        </button>

      </div>

      {/* ======================================
          Available Collectors
      ======================================= */}
      <div
        className="
          mt-8
          bg-blue-50
          border
          border-blue-200
          rounded-lg
          p-4
        "
      >

        <h3
          className="
            font-semibold
            text-blue-700
            mb-3
          "
        >
          Available Collectors
        </h3>

        {collectors.length === 0 ? (

          <p className="text-gray-500">
            No active collectors available.
          </p>

        ) : (

          <div className="space-y-3">

            {collectors.map((collector) => (

              <div
                key={collector.collector_id}
                className="
                  flex
                  justify-between
                  items-center
                  border-b
                  border-blue-100
                  pb-3
                "
              >

                <div>

                  <p className="font-semibold text-gray-800">
                    {collector.full_name}
                  </p>

                  <p className="text-sm text-gray-600">
                    {collector.assigned_kifle_ketema || "-"}
                    {" | "}
                    {collector.kebele || "-"}
                  </p>

                </div>

                <span
                  className="
                    font-bold
                    text-green-600
                  "
                >
                  Active
                </span>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
};

export default AssignCollector;