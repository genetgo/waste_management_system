import React, { useEffect, useMemo, useState } from "react";
import API from "../../services/api";

const BusinessOwners = () => {
  const [businesses, setBusinesses] = useState([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const [search, setSearch] = useState("");
  const [selectedKifleKetema, setSelectedKifleKetema] =
    useState("All");

  const [error, setError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState(null);

  // ==========================================
  // Load Business Owners
  // ==========================================
  useEffect(() => {
    loadBusinesses();
  }, []);

  // ==========================================
  // Kifle Ketema Options
  // ==========================================
  const kifleKetemas = useMemo(() => {
    return [
      "All",
      ...new Set(
        businesses
          .map((business) => business.kifle_ketema)
          .filter(Boolean)
      ),
    ];
  }, [businesses]);

  // ==========================================
  // Search + Filter
  // ==========================================
  useEffect(() => {
    let data = Array.isArray(businesses)
      ? [...businesses]
      : [];

    const keyword = search.trim().toLowerCase();

    if (keyword) {
      data = data.filter((business) => {
        return (
          (business.business_name || "")
            .toLowerCase()
            .includes(keyword) ||

          (business.owner_name || "")
            .toLowerCase()
            .includes(keyword) ||

          (business.email || "")
            .toLowerCase()
            .includes(keyword) ||

          (business.phone_number || "")
            .toLowerCase()
            .includes(keyword) ||

          (business.business_type || "")
            .toLowerCase()
            .includes(keyword) ||

          (business.kifle_ketema || "")
            .toLowerCase()
            .includes(keyword) ||

          (business.kebele || "")
            .toLowerCase()
            .includes(keyword) ||

          (business.sefer || "")
            .toLowerCase()
            .includes(keyword)
        );
      });
    }

    if (selectedKifleKetema !== "All") {
      data = data.filter(
        (business) =>
          business.kifle_ketema ===
          selectedKifleKetema
      );
    }

    setFilteredBusinesses(data);
  }, [
    businesses,
    search,
    selectedKifleKetema,
  ]);

  // ==========================================
  // Load Businesses
  // ==========================================
  const loadBusinesses = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await API.get("/business");

      const data = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];

      setBusinesses(data);
      setFilteredBusinesses(data);

    } catch (error) {
      console.error(
        "Load business owners error:",
        error.response?.data || error
      );

      setError(
        error.response?.data?.message ||
        "Failed to load business owners."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // Open Delete Confirmation
  // ==========================================
  const askDeleteBusiness = (business) => {
    setDeleteTarget(business);
  };

  // ==========================================
  // Confirm Delete Business
  // ==========================================
  const confirmDeleteBusiness = async () => {
    if (!deleteTarget) return;

    const businessId = deleteTarget.business_id;

    try {
      setDeletingId(businessId);
      setError("");

      const response = await API.delete(
        `/business/${businessId}`
      );

      setBusinesses((prev) =>
        prev.filter(
          (item) =>
            item.business_id !== businessId
        )
      );

      setFilteredBusinesses((prev) =>
        prev.filter(
          (item) =>
            item.business_id !== businessId
        )
      );

      setDeleteTarget(null);

      alert(
        response.data?.message ||
        "Business owner deleted successfully."
      );

    } catch (error) {
      console.error(
        "Delete business owner error:",
        error.response?.data || error
      );

      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to delete business owner.";

      setError(message);
    } finally {
      setDeletingId(null);
    }
  };

  // ==========================================
  // Statistics
  // ==========================================
  const totalBusinesses = businesses.length;

  const activeBusinesses = businesses.filter(
    (business) => business.is_active
  ).length;

  const inactiveBusinesses = businesses.filter(
    (business) => !business.is_active
  ).length;

  // ==========================================
  // Loading
  // ==========================================
  if (loading) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-lg font-semibold">
          Loading Business Owners...
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div>
          <h1 className="text-3xl font-bold">
            Business Owners
          </h1>

          <p className="text-gray-500 mt-1">
            Manage all registered business owners
          </p>
        </div>

        

      </div>

      {/* Error */}
      {error && (
        <div className="
          bg-red-50
          border border-red-300
          text-red-700
          rounded-lg
          p-4
        ">
          {error}
        </div>
      )}

      
      

      {/* Search + Filter */}
      <div className="
        bg-white
        shadow
        rounded-xl
        p-5
      ">

        <div className="
          grid
          grid-cols-1
          md:grid-cols-2
          gap-4
        ">

          <input
            type="text"
            placeholder="Search business, owner, email..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="
              border
              border-gray-300
              rounded-lg
              p-3
              outline-none
              focus:ring-2
              focus:ring-indigo-500
            "
          />

          

        </div>

      </div>

      {/* Table */}
      <div className="
        bg-white
        rounded-xl
        shadow
        overflow-x-auto
        border
      ">

        <table className="w-full">

          <thead className="
            bg-indigo-600
            text-white
          ">

            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Business Name</th>
              <th className="p-3">Owner</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Email</th>
              <th className="p-3">Business Type</th>
              <th className="p-3">Kifle Ketema</th>
              <th className="p-3">Kebele</th>
              <th className="p-3">Sefer</th>
              <th className="p-3">Status</th>
              <th className="p-3">Action</th>
            </tr>

          </thead>

          <tbody>

            {filteredBusinesses.length === 0 ? (

              <tr>
                <td
                  colSpan="11"
                  className="
                    text-center
                    py-10
                    text-gray-500
                  "
                >
                  No Business Owners Found
                </td>
              </tr>

            ) : (

              filteredBusinesses.map((business) => (

                <tr
                  key={business.business_id}
                  className="
                    border-b
                    hover:bg-gray-50
                  "
                >

                  <td className="p-3">
                    {business.business_id}
                  </td>

                  <td className="p-3 font-semibold">
                    {business.business_name || "-"}
                  </td>

                  <td className="p-3">
                    {business.owner_name || "-"}
                  </td>

                  <td className="p-3">
                    {business.phone_number || "-"}
                  </td>

                  <td className="p-3">
                    {business.email || "-"}
                  </td>

                  <td className="p-3">
                    {business.business_type || "-"}
                  </td>

                  <td className="p-3">
                    {business.kifle_ketema || "-"}
                  </td>

                  <td className="p-3">
                    {business.kebele || "-"}
                  </td>

                  <td className="p-3">
                    {business.sefer || "-"}
                  </td>

                  <td className="p-3">

                    {business.is_active ? (

                      <span className="
                        bg-green-100
                        text-green-700
                        px-3 py-1
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
                        px-3 py-1
                        rounded-full
                        text-sm
                        font-semibold
                      ">
                        Inactive
                      </span>

                    )}

                  </td>

                  <td className="p-3">

                    <button
                      type="button"
                      onClick={() =>
                        askDeleteBusiness(business)
                      }
                      disabled={
                        deletingId ===
                        business.business_id
                      }
                      className="
                        bg-red-600
                        hover:bg-red-700
                        disabled:bg-gray-400
                        text-white
                        px-3 py-1.5
                        rounded-lg
                        font-semibold
                        transition
                      "
                    >
                      Delete
                    </button>

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

      {/* ==========================================
          Delete Confirmation Modal
      =========================================== */}
      {deleteTarget && (
        <div className="
          fixed
          inset-0
          z-50
          flex
          items-center
          justify-center
          bg-black/50
          px-4
        ">

          <div className="
            w-full
            max-w-md
            rounded-2xl
            bg-white
            shadow-2xl
            p-6
          ">

            <div className="
              flex
              items-center
              gap-3
              mb-4
            ">

              <div className="
                w-11
                h-11
                rounded-full
                bg-red-100
                flex
                items-center
                justify-center
                text-red-600
                text-xl
              ">
                ⚠️
              </div>

              <div>
                <h2 className="
                  text-xl
                  font-bold
                  text-gray-800
                ">
                  Delete Business Owner
                </h2>

                <p className="text-sm text-gray-500">
                  This action cannot be undone.
                </p>
              </div>

            </div>

            <p className="text-gray-700 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-bold">
                {deleteTarget?.business_name ||
                  deleteTarget?.owner_name ||
                  "this business owner"}
              </span>
              ?
            </p>

            <div className="
              flex
              justify-end
              gap-3
            ">

              <button
                type="button"
                onClick={() =>
                  setDeleteTarget(null)
                }
                disabled={
                  deletingId ===
                  deleteTarget?.business_id
                }
                className="
                  px-5 py-2.5
                  rounded-lg
                  border
                  border-gray-300
                  text-gray-700
                  hover:bg-gray-100
                  font-semibold
                "
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDeleteBusiness}
                disabled={
                  deletingId ===
                  deleteTarget?.business_id
                }
                className="
                  px-5 py-2.5
                  rounded-lg
                  bg-red-600
                  hover:bg-red-700
                  disabled:bg-gray-400
                  text-white
                  font-semibold
                "
              >
                {deletingId ===
                deleteTarget?.business_id
                  ? "Deleting..."
                  : " Delete"}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default BusinessOwners;