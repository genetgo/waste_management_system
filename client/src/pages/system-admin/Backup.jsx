import React, { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import API from "../../services/api";

const Backup = () => {
  // =====================================================
  // State
  // =====================================================

  const [backingUp, setBackingUp] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [backupType, setBackupType] = useState("full");

  const [lastBackup, setLastBackup] = useState("No backups yet");
  const [backupSize, setBackupSize] = useState("0 MB");
  const [currentBackupTypeCard, setCurrentBackupTypeCard] =
    useState("None");

  const [history, setHistory] = useState([]);

  // =====================================================
  // Load Backup History
  // =====================================================

  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = async () => {
    try {
      const res = await API.get("/system-admin/backups");

      const backups = res.data?.data || [];

      setHistory(backups);

      if (backups.length > 0) {
        const latest = backups[0];

        setLastBackup(
          latest.created_at
            ? new Date(latest.created_at).toLocaleString()
            : "Unknown"
        );

        setBackupSize(
          latest.file_size ||
            latest.size ||
            "0 MB"
        );

        const latestType =
          latest.backup_type ||
          latest.type ||
          "Full Backup";

        setCurrentBackupTypeCard(
          formatBackupType(latestType)
        );
      } else {
        setLastBackup("No backups yet");
        setBackupSize("0 MB");
        setCurrentBackupTypeCard("None");
      }
    } catch (error) {
      console.error(
        "Load backups error:",
        error.response?.data || error
      );
    }
  };

  // =====================================================
  // Format Backup Type
  // =====================================================

  const formatBackupType = (type) => {
    if (!type) return "Full Backup";

    const value = String(type).toLowerCase();

    if (
      value === "full" ||
      value === "full backup"
    ) {
      return "Full Backup";
    }

    if (
      value === "incremental" ||
      value === "incremental backup"
    ) {
      return "Incremental Backup";
    }

    return type;
  };

  // =====================================================
  // Create Backup
  // =====================================================

  const handleBackup = async () => {
    try {
      setBackingUp(true);
      setMessage("");
      setMessageType("");

      console.log(
        "Creating backup type:",
        backupType
      );

      const res = await API.post(
        "/system-admin/backup",
        {
          type: backupType,
        }
      );

      console.log(
        "Backup response:",
        res.data
      );

      setMessage(
        res.data?.message ||
          "Database backup created successfully."
      );

      setMessageType("success");

      await loadBackups();

    } catch (error) {
      console.error(
        "Backup error:",
        error.response?.data || error
      );

      setMessage(
        error.response?.data?.message ||
          "Database backup failed."
      );

      setMessageType("error");

    } finally {
      setBackingUp(false);
    }
  };

  // =====================================================
  // Delete Backup
  // =====================================================

  const handleRemoveHistory = async (id) => {
    if (!window.confirm(
      "Are you sure you want to delete this backup?"
    )) {
      return;
    }

    try {
      await API.delete(
        `/system-admin/backups/${id}`
      );

      setMessage(
        "Backup deleted successfully."
      );

      setMessageType("success");

      await loadBackups();

    } catch (error) {
      console.error(
        "Delete backup error:",
        error.response?.data || error
      );

      setMessage(
        error.response?.data?.message ||
          "Delete failed."
      );

      setMessageType("error");
    }
  };

  // =====================================================
  // Restore Backup
  // =====================================================

  const handleRestore = async (id) => {
    if (!window.confirm(
      "Are you sure you want to restore this backup? This may replace current database data."
    )) {
      return;
    }

    try {
      const res = await API.post(
        `/system-admin/backups/${id}/restore`
      );

      console.log(
        "Restore Success:",
        res.data
      );

      setMessage(
        res.data?.message ||
          "Backup restored successfully."
      );

      setMessageType("success");

    } catch (error) {
      console.error(
        "Restore Error:",
        error.response?.data || error
      );

      setMessage(
        error.response?.data?.message ||
          "Restore failed."
      );

      setMessageType("error");
    }
  };

  // =====================================================
  // Download Latest Backup
  // =====================================================

  const handleDownload = async () => {
    try {
      const res = await API.get(
        "/system-admin/backups"
      );

      const backups =
        res.data?.data || [];

      if (backups.length === 0) {
        setMessage(
          "No backup available."
        );

        setMessageType("error");

        return;
      }

      const latest = backups[0];

      if (!latest.file_path) {
        setMessage(
          "Backup file path is not available."
        );

        setMessageType("error");

        return;
      }

      window.open(
        `http://localhost:5000/${latest.file_path}`,
        "_blank"
      );

    } catch (error) {
      console.error(
        "Download error:",
        error.response?.data || error
      );

      setMessage(
        "Download failed."
      );

      setMessageType("error");
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="space-y-6">

      {/* =================================================
          HEADER
      ================================================= */}

      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Database Backup
        </h1>

        <p className="text-gray-500 mt-2">
          Protect your system by creating secure
          database backups.
        </p>
      </div>


      {/* =================================================
          MESSAGE
      ================================================= */}

      {message && (
        <div
          className={`rounded-xl p-4 border ${
            messageType === "success"
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          {message}
        </div>
      )}


      {/* =================================================
          BACKUP INFORMATION CARDS
      ================================================= */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Last Backup */}
        <div className="bg-white border rounded-2xl p-5 shadow-sm">
          <p className="text-xs text-gray-500">
            Last Backup
          </p>

          <h3 className="font-bold mt-2 text-gray-800">
            {lastBackup}
          </h3>
        </div>


        {/* Backup Type */}
        <div className="bg-white border rounded-2xl p-5 shadow-sm">
          <p className="text-xs text-gray-500">
            Backup Type
          </p>

          <h3 className="font-bold mt-2 text-gray-800">
            {currentBackupTypeCard}
          </h3>
        </div>


        {/* Backup Size */}
        <div className="bg-white border rounded-2xl p-5 shadow-sm">
          <p className="text-xs text-gray-500">
            Backup Size
          </p>

          <h3 className="font-bold mt-2 text-gray-800">
            {backupSize}
          </h3>
        </div>


        {/* Database Status */}
        <div className="bg-white border rounded-2xl p-5 shadow-sm">
          <p className="text-xs text-gray-500">
            Database Status
          </p>

          <h3 className="text-green-600 font-bold mt-2">
            ● Online
          </h3>
        </div>

      </div>


      {/* =================================================
          CREATE BACKUP
      ================================================= */}

      <div className="bg-white rounded-2xl shadow-sm border p-6">

        <div className="max-w-xl">

          <label className="block font-semibold text-sm text-gray-700 mb-2">
            Backup Type
          </label>

          <select
            value={backupType}
            onChange={(e) =>
              setBackupType(e.target.value)
            }
            disabled={backingUp}
            className="
              w-full
              border
              border-gray-300
              rounded-xl
              p-3
              bg-white
              text-gray-800
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
            "
          >

            <option value="full">
              Full Backup
            </option>

            <option value="incremental">
              Incremental Backup
            </option>

          </select>


          {/* Selected Type Information */}

          <div className="mt-3 bg-blue-50 border border-blue-100 rounded-xl p-3">

            {backupType === "full" ? (
              <p className="text-sm text-blue-700">
                <strong>Full Backup:</strong>{" "}
                Creates a complete backup of the
                database.
              </p>
            ) : (
              <p className="text-sm text-blue-700">
                <strong>Incremental Backup:</strong>{" "}
                Creates a backup containing only
                changes since the previous backup.
              </p>
            )}

          </div>


          {/* Create Button */}

          <button
            type="button"
            onClick={handleBackup}
            disabled={backingUp}
            className="
              mt-5
              w-fil
              bg-green-600
              hover:bg-green-700
              disabled:bg-gray-400
              disabled:cursor-not-allowed
              text-white
              py-3
              px-6
              rounded-xl
              font-semibold
              flex
              items-center
              justify-center
              gap-2
              transition
            "
          >

            {backingUp ? (
              <>
                <span className="animate-spin">
                  ⏳
                </span>

                Creating Backup...
              </>
            ) : (
              <>
                💾 Create Database Backup
              </>
            )}

          </button>

        </div>

      </div>


      {/* =================================================
          BACKUP HISTORY
      ================================================= */}

      <div className="bg-white rounded-2xl shadow-sm border p-6">

        <h2 className="text-xl font-bold mb-5">
          Backup History
        </h2>


        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>
              <tr className="border-b text-gray-500">

                <th className="text-left py-3">
                  Date
                </th>

                <th className="text-left py-3">
                  Type
                </th>

                <th className="text-left py-3">
                  Size
                </th>

                <th className="text-left py-3">
                  Status
                </th>

                <th className="text-center py-3">
                  Action
                </th>

              </tr>
            </thead>


            <tbody>

              {history.length > 0 ? (

                history.map((item) => (

                  <tr
                    key={item.backup_id}
                    className="border-b hover:bg-slate-50"
                  >

                    <td className="py-3">
                      {item.created_at
                        ? new Date(
                            item.created_at
                          ).toLocaleString()
                        : "-"}
                    </td>


                    <td>
                      {formatBackupType(
                        item.backup_type ||
                        item.type
                      )}
                    </td>


                    <td>
                      {item.file_size ||
                        item.size ||
                        "0 MB"}
                    </td>


                    <td>
                      <span className="text-green-600 font-semibold">
                        {item.status ||
                          "Success"}
                      </span>
                    </td>


                    <td>
                      <div className="flex justify-center gap-2">

                        <button
                          type="button"
                          onClick={() =>
                            handleRestore(
                              item.backup_id
                            )
                          }
                          className="
                            bg-green-600
                            hover:bg-green-700
                            text-white
                            px-3
                            py-1.5
                            rounded-lg
                            text-sm
                          "
                        >
                          Restore
                        </button>


                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveHistory(
                              item.backup_id
                            )
                          }
                          className="
                            bg-red-600
                            hover:bg-red-700
                            text-white
                            px-3
                            py-1.5
                            rounded-lg
                            flex
                            items-center
                            justify-center
                          "
                        >
                          <FaTrash />
                        </button>

                      </div>
                    </td>

                  </tr>

                ))

              ) : (

                <tr>

                  <td
                    colSpan="5"
                    className="
                      text-center
                      py-8
                      text-gray-400
                    "
                  >
                    No backup history found.
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>


      {/* =================================================
          DOWNLOAD
      ================================================= */}

      <div className="flex justify-end">

        <button
          type="button"
          onClick={handleDownload}
          className="
            bg-blue-600
            hover:bg-blue-700
            text-white
            py-3
            px-6
            rounded-xl
            font-semibold
            flex
            items-center
            justify-center
            gap-2
          "
        >
          ⬇ Download Latest Backup
        </button>

      </div>

    </div>
  );
};

export default Backup;