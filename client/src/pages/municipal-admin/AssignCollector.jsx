import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../services/api";

const AssignCollector = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [request, setRequest] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ==========================================
  // Load Request + Collection Teams
  // ==========================================
  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);

      // ========================================
      // Load Request
      // ========================================
      const requestRes = await API.get(`/requests/${id}`);

      console.log("=================================");
      console.log("REQUEST RESPONSE:");
      console.log(requestRes.data);
      console.log("=================================");

      const requestData =
        requestRes.data?.data ||
        requestRes.data?.request ||
        requestRes.data;

      if (!requestData) {
        throw new Error("Request not found.");
      }

      setRequest(requestData);

      // ========================================
      // Load Collection Teams
      // ========================================
      const teamsRes =
        await API.get("/collection-teams");

      console.log("=================================");
      console.log("COLLECTION TEAMS RESPONSE:");
      console.log(teamsRes.data);
      console.log("=================================");

      const teamData =
        teamsRes.data?.data ||
        teamsRes.data ||
        [];

      if (!Array.isArray(teamData)) {
        setTeams([]);
        return;
      }

      // ========================================
      // Only ACTIVE teams
      // ========================================
      const activeTeams = teamData.filter(
        (team) =>
          String(team.status).toUpperCase() === "ACTIVE"
      );

      // ========================================
      // Only teams with Team Leader / Driver
      // ========================================
      const teamsWithLeader = activeTeams.filter(
        (team) =>
          team.team_leader_id ||
          team.team_leader_name
      );

      // ========================================
      // Match Request Location
      //
      // Request:
      //   kifle_ketema
      //   kebele
      //
      // Team:
      //   kifle_ketema
      //   kebele
      // ========================================
      const matchingTeams = teamsWithLeader.filter(
        (team) => {
          const sameKifle =
            String(team.kifle_ketema || "")
              .trim()
              .toLowerCase() ===
            String(requestData.kifle_ketema || "")
              .trim()
              .toLowerCase();

          const sameKebele =
            String(team.kebele || "")
              .trim()
              .toLowerCase() ===
            String(requestData.kebele || "")
              .trim()
              .toLowerCase();

          return sameKifle && sameKebele;
        }
      );

      console.log(
        "ACTIVE TEAMS:",
        activeTeams
      );

      console.log(
        "MATCHING TEAMS:",
        matchingTeams
      );

      setTeams(matchingTeams);

    } catch (error) {
      console.error(
        "Load assign data error:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          error.message ||
          "Failed to load request and collection teams."
      );

      setRequest(null);
      setTeams([]);

    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // Assign Collection Team
  // Approved → Assigned
  // ==========================================
  const assignCollector = async () => {
    if (!id) {
      alert("Request ID is missing.");
      return;
    }

    if (!selectedTeam) {
      alert("Please select a collection team.");
      return;
    }

    const selectedTeamData = teams.find(
      (team) =>
        String(team.team_id) ===
        String(selectedTeam)
    );

    if (!selectedTeamData) {
      alert("Selected collection team was not found.");
      return;
    }

    // ========================================
    // Safety Check
    // ========================================
    if (
      !selectedTeamData.team_leader_id &&
      !selectedTeamData.team_leader_name
    ) {
      alert(
        "This team does not have a Team Leader / Driver."
      );
      return;
    }

    try {
      setSaving(true);

      console.log("=================================");
      console.log("ASSIGN COLLECTION TEAM");
      console.log("REQUEST ID:", id);
      console.log(
        "TEAM ID:",
        selectedTeamData.team_id
      );
      console.log(
        "TEAM NAME:",
        selectedTeamData.team_name
      );
      console.log(
        "TEAM LEADER:",
        selectedTeamData.team_leader_name
      );
      console.log("=================================");

      const res = await API.patch(
        `/requests/${id}/assign`,
        {
          team_id: Number(
            selectedTeamData.team_id
          ),
        }
      );

      console.log(
        "ASSIGN TEAM RESPONSE:",
        res.data
      );

      alert(
        "Collection Team Assigned Successfully"
      );

      navigate("/municipal-admin/requests");

    } catch (error) {
      console.error(
        "Assign team error:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          "Failed to assign collection team."
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
          Loading Collection Teams...
        </h2>
      </div>
    );
  }

  // ==========================================
  // Request Not Found
  // ==========================================
  if (!request) {
    return (
      <div className="max-w-3xl mx-auto mt-8 bg-white shadow-lg rounded-xl p-8">
        <h2 className="text-xl font-bold text-red-600">
          Request not found.
        </h2>

        <button
          onClick={handleCancel}
          className="
            mt-6
            bg-gray-600
            hover:bg-gray-700
            text-white
            px-6
            py-3
            rounded-lg
          "
        >
          Back to Requests
        </button>
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
          Select a collection team for this
          collection request.
        </p>

        <p className="text-sm text-gray-400 mt-1">
          Request ID: {id || "-"}
        </p>

      </div>

      {/* ======================================
          Request Information
      ======================================= */}
      <div
        className="
          mb-6
          bg-gray-50
          border
          border-gray-200
          rounded-lg
          p-4
        "
      >

        <h3 className="font-semibold text-gray-700 mb-3">
          Request Information
        </h3>

        <div className="space-y-1 text-sm">

          <p>
            <span className="font-semibold">
              Business:
            </span>{" "}
            {request.business_name || "-"}
          </p>

          <p>
            <span className="font-semibold">
              Kifle Ketema:
            </span>{" "}
            {request.kifle_ketema || "-"}
          </p>

          <p>
            <span className="font-semibold">
              Kebele:
            </span>{" "}
            {request.kebele || "-"}
          </p>

          <p>
            <span className="font-semibold">
              Sefer:
            </span>{" "}
            {request.sefer || "-"}
          </p>

          <p>
            <span className="font-semibold">
              Status:
            </span>{" "}
            {request.status || "-"}
          </p>

        </div>

      </div>

      {/* ======================================
          Collection Team Selection
      ======================================= */}
      <div className="space-y-3">

        <label className="font-semibold text-gray-700">
          Collection Team
        </label>

        {teams.length === 0 ? (

          <div
            className="
              border
              border-yellow-300
              bg-yellow-50
              rounded-lg
              p-4
            "
          >

            <p className="font-semibold text-yellow-700">
              No suitable collection team available.
            </p>

            <p className="text-sm text-gray-600 mt-1">
              An ACTIVE team with a Team Leader /
              Driver is required for{" "}
              <span className="font-semibold">
                {request.kifle_ketema}
              </span>
              {" / "}
              <span className="font-semibold">
                {request.kebele}
              </span>
              .
            </p>

          </div>

        ) : (

          <div className="space-y-3">

            {teams.map((team) => {

              const teamId =
                String(team.team_id);

              const isSelected =
                selectedTeam === teamId;

              return (
                <label
                  key={team.team_id}
                  className={`
                    flex
                    items-start
                    gap-4
                    border
                    rounded-lg
                    p-4
                    cursor-pointer
                    transition
                    ${
                      isSelected
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 hover:bg-gray-50"
                    }
                  `}
                >

                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {
                      if (isSelected) {
                        setSelectedTeam("");
                      } else {
                        setSelectedTeam(teamId);
                      }
                    }}
                    className="mt-1 w-5 h-5"
                  />

                  {/* Team Information */}
                  <div className="flex-1">

                    <div className="flex justify-between items-start">

                      <p className="font-bold text-gray-800 text-lg">
                        {team.team_name ||
                          `Team ${team.team_id}`}
                      </p>

                      <span
                        className="
                          text-xs
                          font-semibold
                          bg-green-100
                          text-green-700
                          px-2
                          py-1
                          rounded
                        "
                      >
                        ACTIVE
                      </span>

                    </div>

                    <p className="text-sm text-gray-600 mt-2">
                      Kifle Ketema:{" "}
                      <span className="font-semibold">
                        {team.kifle_ketema || "-"}
                      </span>
                    </p>

                    <p className="text-sm text-gray-600">
                      Kebele:{" "}
                      <span className="font-semibold">
                        {team.kebele || "-"}
                      </span>
                    </p>

                    <p className="text-sm text-gray-600 mt-2">
                      Team Leader / Driver:{" "}
                      <span className="font-semibold text-gray-800">
                        {team.team_leader_name ||
                          "Not Assigned"}
                      </span>
                    </p>

                    <p className="text-sm text-gray-600">
                      Members:{" "}
                      <span className="font-semibold">
                        {team.member_count ?? 0}
                      </span>
                    </p>

                  </div>

                </label>
              );
            })}

          </div>
        )}

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
            !selectedTeam ||
            teams.length === 0
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
          Team Information
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

        <h3 className="font-semibold text-blue-700 mb-2">
          Collection Team
        </h3>

        <p className="text-sm text-gray-600">
          The Team Leader will serve as the Driver.
          The other collectors will work together
          with the Driver during waste collection.
        </p>

      </div>

    </div>
  );
};

export default AssignCollector;