import React, { useEffect, useState } from "react";
import API from "../../services/api";

const Residents = () => {
  const [residents, setResidents] = useState([]);
  const [filteredResidents, setFilteredResidents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadResidents();
  }, []);

  useEffect(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      setFilteredResidents(residents);
      return;
    }

    const filtered = residents.filter((resident) => {
      const fullName =
        resident.full_name ||
        `${resident.first_name || ""} ${resident.last_name || ""}`;

      return (
        fullName.toLowerCase().includes(keyword) ||
        (resident.email || "").toLowerCase().includes(keyword) ||
        (resident.phone_number || "").includes(keyword) ||
        (resident.kifle_ketema || "").toLowerCase().includes(keyword) ||
        (resident.kebele || "").toLowerCase().includes(keyword) ||
        (resident.sefer || "").toLowerCase().includes(keyword)
      );
    });

    setFilteredResidents(filtered);
  }, [search, residents]);

  // ==========================================
  // Load Residents
  // ==========================================
  const loadResidents = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await API.get("/residents");

      const data = res.data?.data || [];

      setResidents(Array.isArray(data) ? data : []);
      setFilteredResidents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Load residents error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load residents."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // Delete Resident
  // ==========================================
  const deleteResident = async (residentId) => {
    if (!residentId) {
      alert("Resident ID is missing.");
      return;
    }

    const resident = residents.find(
      (item) => item.resident_id === residentId
    );

    const name =
      resident?.full_name ||
      `${resident?.first_name || ""} ${resident?.last_name || ""}`.trim() ||
      "this resident";

    const confirmed = window.confirm(
      `Are you sure you want to delete ${name}?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(residentId);
      setError("");

      const response = await API.delete(
        `/residents/${residentId}`
      );

      // Remove immediately from UI
      setResidents((prev) =>
        prev.filter(
          (item) => item.resident_id !== residentId
        )
      );

      setFilteredResidents((prev) =>
        prev.filter(
          (item) => item.resident_id !== residentId
        )
      );

      alert(
        response.data?.message ||
          "Resident deleted successfully."
      );
    } catch (error) {
  console.error("========== DELETE RESIDENT ERROR ==========");

  console.error("Status:", error.response?.status);

  console.error("Response data:", error.response?.data);

  console.error("Response headers:", error.response?.headers);

  console.error("Message:", error.message);

  console.error("Full error:", error);

  const backendMessage =
    error.response?.data?.message ||
    error.response?.data?.error ||
    error.message ||
    "Failed to delete resident.";

  setError(backendMessage);

  alert(backendMessage);

    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-10 text-center text-lg font-semibold">
        Loading Residents...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-3xl font-bold">
          Registered Residents
        </h1>

        <input
          type="text"
          placeholder="Search resident,name, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 w-full md:w-72 outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 rounded-lg p-4">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow border">

        <table className="w-full">

          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Full Name</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Email</th>
              <th className="p-3">Kifle Ketema</th>
              <th className="p-3">Kebele</th>
              <th className="p-3">Sefer</th>
              <th className="p-3">Status</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredResidents.length === 0 ? (
              <tr>
                <td
                  colSpan="9"
                  className="text-center py-10 text-gray-500"
                >
                  No residents found.
                </td>
              </tr>
            ) : (
              filteredResidents.map((resident) => (
                <tr
                  key={resident.resident_id}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="p-3">
                    {resident.resident_id}
                  </td>

                  <td className="p-3 font-semibold">
                    {resident.full_name ||
                      `${resident.first_name || ""} ${resident.last_name || ""}`}
                  </td>

                  <td className="p-3">
                    {resident.phone_number || "-"}
                  </td>

                  <td className="p-3">
                    {resident.email || "-"}
                  </td>

                  <td className="p-3">
                    {resident.kifle_ketema || "-"}
                  </td>

                  <td className="p-3">
                    {resident.kebele || "-"}
                  </td>

                  <td className="p-3">
                    {resident.sefer || "-"}
                  </td>

                  <td className="p-3">
                    {resident.is_active ? (
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                        Active
                      </span>
                    ) : (
                      <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold">
                        Inactive
                      </span>
                    )}
                  </td>

                  <td className="p-3">
                    <button
                      onClick={() =>
                        deleteResident(
                          resident.resident_id
                        )
                      }
                      disabled={
                        deletingId ===
                        resident.resident_id
                      }
                      className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-3 py-1 rounded-lg"
                    >
                      {deletingId ===
                      resident.resident_id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>

        </table>
      </div>
    </div>
  );
};

export default Residents;