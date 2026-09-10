import React, { useEffect, useState } from "react";
import collectionTeamService from "../../services/collectionTeamService";

// ==========================================
// KIFLE KETEMA -> KEBELE MAPPING
// ==========================================
const KEBELES = {
    Abima: [
        "Kebele 01",
        "Kebele 02",
        "Kebele 03",
        "Kebele 04"
    ],

    Menkorer: [
        "Kebele 05",
        "Kebele 06",
        "Kebele 07",
        "Kebele 08"
    ],

    "Nigus Teklehaymanot": [
        "Kebele 09",
        "Kebele 10",
        "Kebele 11",
        "Kebele 12",
        "Kebele 13"
    ],

    "Tedila Gualu": [
        "Kebele 14",
        "Kebele 15",
        "Kebele 16",
        "Kebele 17",
        "Kebele 18"
    ]
};


// ==========================================
// NORMALIZE KIFLE NAME
// ==========================================
const normalizeText = (value) => {
    return String(value || "")
        .trim()
        .toLowerCase();
};


// ==========================================
// GET LOGGED-IN USER
// ==========================================
const getLoggedInUser = () => {
    try {
        const user = localStorage.getItem("user");

        if (!user) {
            return null;
        }

        return JSON.parse(user);

    } catch (error) {
        console.error("USER PARSE ERROR:", error);
        return null;
    }
};


// ==========================================
// COMPONENT
// ==========================================
const CollectionTeams = () => {

    // ==========================================
    // STATE
    // ==========================================

    const [teams, setTeams] = useState([]);
    const [collectors, setCollectors] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showManageModal, setShowManageModal] = useState(false);

    const [selectedTeam, setSelectedTeam] = useState(null);

    const [formData, setFormData] = useState({
        team_name: "",
        kebele: ""
    });


    // ==========================================
    // LOGGED-IN MUNICIPAL ADMIN
    // ==========================================

    const loggedInUser = getLoggedInUser();

    const assignedKifle =
        loggedInUser?.assigned_kifle_ketema ||
        loggedInUser?.assignedKifleKetema ||
        "";

    const assignedKebeles =
        Object.keys(KEBELES).find(
            (kifle) =>
                normalizeText(kifle) ===
                normalizeText(assignedKifle)
        )
            ? KEBELES[
                  Object.keys(KEBELES).find(
                      (kifle) =>
                          normalizeText(kifle) ===
                          normalizeText(assignedKifle)
                  )
              ]
            : [];


    // ==========================================
    // LOAD TEAMS ON PAGE LOAD
    // ==========================================

    useEffect(() => {
        loadTeams();
    }, []);


    // ==========================================
    // LOAD TEAMS
    // ==========================================

    const loadTeams = async () => {

        try {

            setLoading(true);
            setError("");

            const response =
                await collectionTeamService.getAllTeams();

            if (response.success) {

                setTeams(response.data || []);

            } else {

                setTeams([]);

                setError(
                    response.message ||
                    "Failed to load collection teams."
                );
            }

        } catch (err) {

            console.error("LOAD TEAMS ERROR:", err);

            setError(
                err.response?.data?.message ||
                "Failed to load collection teams."
            );

        } finally {

            setLoading(false);

        }
    };


    // ==========================================
    // RESET CREATE FORM
    // ==========================================

    const resetCreateForm = () => {

        setFormData({
            team_name: "",
            kebele: ""
        });

    };


    // ==========================================
    // OPEN CREATE MODAL
    // ==========================================

    const openCreateModal = () => {

        setError("");
        setSuccess("");

        resetCreateForm();

        setShowCreateModal(true);

    };


    // ==========================================
    // CLOSE CREATE MODAL
    // ==========================================

    const closeCreateModal = () => {

        if (saving) {
            return;
        }

        setShowCreateModal(false);

        resetCreateForm();

    };


    // ==========================================
    // CREATE TEAM
    // ==========================================

    const handleCreateTeam = async (e) => {

        e.preventDefault();

        setError("");
        setSuccess("");


        // Team name validation
        if (!formData.team_name.trim()) {

            setError("Team name is required.");
            return;

        }


        if (formData.team_name.trim().length < 2) {

            setError("Team name must contain at least 2 characters.");
            return;

        }


        // Kebele validation
        if (!formData.kebele) {

            setError("Please select Kebele.");
            return;

        }


        // Kifle validation
        if (!assignedKifle) {

            setError(
                "Your assigned Kifle Ketema could not be found."
            );

            return;

        }


        // Security check on frontend
        const validKebele = assignedKebeles.some(
            (kebele) =>
                normalizeText(kebele) ===
                normalizeText(formData.kebele)
        );


        if (!validKebele) {

            setError(
                "You can only create a team in your assigned Kifle Ketema."
            );

            return;

        }


        try {

            setSaving(true);


            const response =
                await collectionTeamService.createTeam({
                    team_name: formData.team_name.trim(),
                    kebele: formData.kebele
                });


            if (response.success) {

                setSuccess(
                    "Collection Team created successfully."
                );

                resetCreateForm();

                setShowCreateModal(false);

                await loadTeams();

            } else {

                setError(
                    response.message ||
                    "Failed to create team."
                );

            }

        } catch (err) {

            console.error("CREATE TEAM ERROR:", err);

            setError(
                err.response?.data?.message ||
                "Failed to create team."
            );

        } finally {

            setSaving(false);

        }
    };


    // ==========================================
    // OPEN TEAM / MANAGE TEAM
    // ==========================================

    const handleManageTeam = async (team) => {

        try {

            setError("");
            setSuccess("");

            const response =
                await collectionTeamService.getTeamById(
                    team.team_id
                );


            if (response.success) {

                setSelectedTeam(response.data);

                setShowManageModal(true);

                await loadCollectors(
                    response.data.kebele
                );

            } else {

                setError(
                    response.message ||
                    "Failed to load team."
                );

            }

        } catch (err) {

            console.error("GET TEAM ERROR:", err);

            setError(
                err.response?.data?.message ||
                "Failed to load team."
            );

        }
    };


    // ==========================================
    // CLOSE MANAGE MODAL
    // ==========================================

    const closeManageModal = () => {

        if (saving) {
            return;
        }

        setShowManageModal(false);
        setSelectedTeam(null);
        setCollectors([]);

    };


    // ==========================================
    // LOAD AVAILABLE COLLECTORS
    // ==========================================

    const loadCollectors = async (kebele) => {

        try {

            if (!kebele) {

                setCollectors([]);
                return;

            }


            const response =
                await collectionTeamService
                    .getAvailableCollectors(kebele);


            if (response.success) {

                setCollectors(response.data || []);

            } else {

                setCollectors([]);

                setError(
                    response.message ||
                    "Failed to load collectors."
                );

            }

        } catch (err) {

            console.error(
                "LOAD COLLECTORS ERROR:",
                err
            );

            setCollectors([]);

            setError(
                err.response?.data?.message ||
                "Failed to load collectors."
            );

        }
    };


    // ==========================================
    // ADD COLLECTOR
    // ==========================================

    const handleAddCollector = async (collectorId) => {

        if (!selectedTeam) {
            return;
        }


        try {

            setSaving(true);
            setError("");
            setSuccess("");


            const response =
                await collectionTeamService.addCollector(
                    selectedTeam.team_id,
                    collectorId
                );


            if (response.success) {

                setSuccess(
                    "Collector added to team successfully."
                );


                const updated =
                    await collectionTeamService.getTeamById(
                        selectedTeam.team_id
                    );


                if (updated.success) {

                    setSelectedTeam(updated.data);

                    await loadCollectors(
                        updated.data.kebele
                    );

                }


                await loadTeams();

            } else {

                setError(
                    response.message ||
                    "Failed to add collector."
                );

            }

        } catch (err) {

            console.error(
                "ADD COLLECTOR ERROR:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to add collector."
            );

        } finally {

            setSaving(false);

        }
    };


    // ==========================================
    // REMOVE COLLECTOR
    // ==========================================

    const handleRemoveCollector = async (collectorId) => {

        if (!selectedTeam) {
            return;
        }


        const confirmed = window.confirm(
            "Are you sure you want to remove this collector from the team?"
        );


        if (!confirmed) {
            return;
        }


        try {

            setSaving(true);
            setError("");
            setSuccess("");


            const response =
                await collectionTeamService.removeCollector(
                    selectedTeam.team_id,
                    collectorId
                );


            if (response.success) {

                setSuccess(
                    "Collector removed successfully."
                );


                const updated =
                    await collectionTeamService.getTeamById(
                        selectedTeam.team_id
                    );


                if (updated.success) {

                    setSelectedTeam(updated.data);

                    await loadCollectors(
                        updated.data.kebele
                    );

                }


                await loadTeams();

            } else {

                setError(
                    response.message ||
                    "Failed to remove collector."
                );

            }

        } catch (err) {

            console.error(
                "REMOVE COLLECTOR ERROR:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to remove collector."
            );

        } finally {

            setSaving(false);

        }
    };


    // ==========================================
    // SET TEAM LEADER / DRIVER
    // ==========================================

    const handleSetLeader = async (collectorId) => {

        if (!selectedTeam) {
            return;
        }


        try {

            setSaving(true);
            setError("");
            setSuccess("");


            const response =
                await collectionTeamService.setTeamLeader(
                    selectedTeam.team_id,
                    collectorId
                );


            if (response.success) {

                setSuccess(
                    "Team Leader / Driver assigned successfully."
                );


                const updated =
                    await collectionTeamService.getTeamById(
                        selectedTeam.team_id
                    );


                if (updated.success) {

                    setSelectedTeam(updated.data);

                }


                await loadTeams();

            } else {

                setError(
                    response.message ||
                    "Failed to assign Team Leader."
                );

            }

        } catch (err) {

            console.error(
                "SET LEADER ERROR:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to assign Team Leader."
            );

        } finally {

            setSaving(false);

        }
    };


    // ==========================================
    // REMOVE TEAM LEADER
    // ==========================================

    const handleRemoveLeader = async () => {

        if (!selectedTeam) {
            return;
        }


        const confirmed = window.confirm(
            "Are you sure you want to remove the Team Leader / Driver?"
        );


        if (!confirmed) {
            return;
        }


        try {

            setSaving(true);
            setError("");
            setSuccess("");


            const response =
                await collectionTeamService.removeTeamLeader(
                    selectedTeam.team_id
                );


            if (response.success) {

                setSuccess(
                    "Team Leader / Driver removed successfully."
                );


                const updated =
                    await collectionTeamService.getTeamById(
                        selectedTeam.team_id
                    );


                if (updated.success) {

                    setSelectedTeam(updated.data);

                }


                await loadTeams();

            } else {

                setError(
                    response.message ||
                    "Failed to remove Team Leader."
                );

            }

        } catch (err) {

            console.error(
                "REMOVE LEADER ERROR:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to remove Team Leader."
            );

        } finally {

            setSaving(false);

        }
    };


    // ==========================================
    // DELETE TEAM
    // ==========================================

    const handleDeleteTeam = async (teamId) => {

        const confirmed = window.confirm(
            "Are you sure you want to delete this collection team?"
        );


        if (!confirmed) {
            return;
        }


        try {

            setSaving(true);
            setError("");
            setSuccess("");


            const response =
                await collectionTeamService.deleteTeam(
                    teamId
                );


            if (response.success) {

                setSuccess(
                    "Collection Team deleted successfully."
                );


                if (
                    selectedTeam &&
                    selectedTeam.team_id === teamId
                ) {

                    setSelectedTeam(null);
                    setShowManageModal(false);

                }


                await loadTeams();

            } else {

                setError(
                    response.message ||
                    "Failed to delete team."
                );

            }

        } catch (err) {

            console.error(
                "DELETE TEAM ERROR:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to delete team."
            );

        } finally {

            setSaving(false);

        }
    };


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (
            <div className="p-6 flex justify-center items-center min-h-[300px]">

                <p className="text-gray-600">
                    Loading collection teams...
                </p>

            </div>
        );

    }


    // ==========================================
    // MAIN UI
    // ==========================================

    return (

        <div className="p-6 max-w-7xl mx-auto space-y-6">


            {/* ==========================================
                HEADER
            ========================================== */}

            <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">

                <div>

                    <h1 className="text-2xl font-bold text-gray-800">
                        Collection Teams
                    </h1>

                    <p className="text-gray-500 mt-1">
                        Manage collection teams and collectors
                    </p>

                    {assignedKifle && (

                        <p className="text-sm text-blue-600 mt-2 font-medium">
                            Assigned Kifle Ketema: {assignedKifle}
                        </p>

                    )}

                </div>


                <button
                    onClick={openCreateModal}
                    className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition"
                >
                    + Create Team
                </button>

            </div>


            {/* ==========================================
                MESSAGES
            ========================================== */}

            {error && (

                <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg">

                    {error}

                </div>

            )}


            {success && (

                <div className="bg-green-100 border border-green-200 text-green-700 px-4 py-3 rounded-lg">

                    {success}

                </div>

            )}


            {/* ==========================================
                TEAM LIST
            ========================================== */}

            {teams.length === 0 ? (

                <div className="bg-white border rounded-xl p-10 text-center">

                    <h2 className="text-lg font-semibold text-gray-700">
                        No Collection Teams
                    </h2>

                    <p className="text-gray-500 mt-2">
                        Create your first team to start assigning collectors.
                    </p>

                </div>

            ) : (

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

                    {teams.map((team) => (

                        <div
                            key={team.team_id}
                            className="bg-white border rounded-xl p-5 shadow-sm"
                        >

                            {/* TEAM HEADER */}

                            <div className="flex justify-between items-start gap-3">

                                <div>

                                    <h2 className="text-lg font-bold text-gray-800">
                                        {team.team_name}
                                    </h2>

                                    <p className="text-sm text-gray-500 mt-1">
                                        {team.kifle_ketema}
                                    </p>

                                    <p className="text-sm text-gray-500">
                                        {team.kebele}
                                    </p>

                                </div>


                                <span
                                    className={`px-2.5 py-1 text-xs rounded-full ${
                                        team.status === "ACTIVE"
                                            ? "bg-green-100 text-green-700"
                                            : "bg-gray-100 text-gray-600"
                                    }`}
                                >
                                    {team.status}
                                </span>

                            </div>


                            {/* TEAM INFO */}

                            <div className="mt-4 border-t pt-4">

                                <p className="text-sm text-gray-600">

                                    Collectors:

                                    <span className="font-semibold ml-1">
                                        {team.collector_count || 0}
                                    </span>

                                </p>


                                <p className="text-sm text-gray-600 mt-1">

                                    Team Leader:

                                    <span className="font-semibold ml-1">

                                        {team.team_leader_name ||
                                            "Not assigned"}

                                    </span>

                                </p>

                            </div>


                            {/* ACTIONS */}

                            <div className="flex gap-2 mt-5">

                                <button
                                    onClick={() =>
                                        handleManageTeam(team)
                                    }
                                    disabled={saving}
                                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                                >
                                    Manage
                                </button>


                                <button
                                    onClick={() =>
                                        handleDeleteTeam(
                                            team.team_id
                                        )
                                    }
                                    disabled={saving}
                                    className="px-4 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50 transition"
                                >
                                    Delete
                                </button>

                            </div>

                        </div>

                    ))}

                </div>

            )}


            {/* ==========================================
                CREATE TEAM MODAL
            ========================================== */}

            {showCreateModal && (

                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">

                    <div className="bg-white rounded-xl w-full max-w-md p-6">

                        <div className="flex justify-between items-center">

                            <h2 className="text-xl font-bold text-gray-800">
                                Create Collection Team
                            </h2>


                            <button
                                type="button"
                                onClick={closeCreateModal}
                                disabled={saving}
                                className="text-gray-500 hover:text-gray-800 text-xl"
                            >
                                ✕
                            </button>

                        </div>


                        <form
                            onSubmit={handleCreateTeam}
                            className="space-y-4 mt-5"
                        >

                            {/* TEAM NAME */}

                            <div>

                                <label className="block text-sm font-medium mb-1">
                                    Team Name
                                </label>

                                <input
                                    type="text"
                                    value={formData.team_name}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            team_name: e.target.value
                                        })
                                    }
                                    placeholder="e.g. Team 1"
                                    disabled={saving}
                                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />

                            </div>


                            {/* KIFLE */}

                            <div>

                                <label className="block text-sm font-medium mb-1">
                                    Kifle Ketema
                                </label>

                                <input
                                    type="text"
                                    value={
                                        assignedKifle ||
                                        "Not assigned"
                                    }
                                    disabled
                                    className="w-full border rounded-lg px-3 py-2 bg-gray-100 text-gray-600"
                                />

                            </div>


                            {/* KEBELE */}

                            <div>

                                <label className="block text-sm font-medium mb-1">
                                    Kebele
                                </label>

                                <select
                                    value={formData.kebele}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            kebele: e.target.value
                                        })
                                    }
                                    disabled={
                                        saving ||
                                        assignedKebeles.length === 0
                                    }
                                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >

                                    <option value="">
                                        Select Kebele
                                    </option>


                                    {assignedKebeles.map(
                                        (kebele) => (

                                            <option
                                                key={kebele}
                                                value={kebele}
                                            >
                                                {kebele}
                                            </option>

                                        )
                                    )}

                                </select>

                            </div>


                            {/* BUTTONS */}

                            <div className="flex gap-3 pt-3">

                                <button
                                    type="button"
                                    onClick={closeCreateModal}
                                    disabled={saving}
                                    className="flex-1 border py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    disabled={
                                        saving ||
                                        !assignedKifle ||
                                        assignedKebeles.length === 0
                                    }
                                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >

                                    {saving
                                        ? "Creating..."
                                        : "Create Team"}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}


            {/* ==========================================
                MANAGE TEAM MODAL
            ========================================== */}

            {showManageModal && selectedTeam && (

                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">

                    <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">


                        {/* MODAL HEADER */}

                        <div className="flex justify-between items-start">

                            <div>

                                <h2 className="text-xl font-bold text-gray-800">
                                    {selectedTeam.team_name}
                                </h2>

                                <p className="text-sm text-gray-500">
                                    {selectedTeam.kifle_ketema}
                                    {" • "}
                                    {selectedTeam.kebele}
                                </p>

                            </div>


                            <button
                                onClick={closeManageModal}
                                disabled={saving}
                                className="text-gray-500 text-xl hover:text-gray-800 disabled:opacity-50"
                            >
                                ✕
                            </button>

                        </div>


                        {/* ==========================================
                            TEAM LEADER
                        ========================================== */}

                        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">

                            <h3 className="font-semibold text-blue-800">
                                Team Leader / Driver
                            </h3>


                            {selectedTeam.team_leader_name ? (

                                <div className="flex justify-between items-center mt-3">

                                    <div>

                                        <p className="font-medium">
                                            {selectedTeam.team_leader_name}
                                        </p>

                                        <p className="text-sm text-gray-500">
                                            Team Leader • Driver
                                        </p>

                                    </div>


                                    <button
                                        onClick={handleRemoveLeader}
                                        disabled={saving}
                                        className="text-red-600 text-sm hover:underline disabled:opacity-50"
                                    >
                                        Remove
                                    </button>

                                </div>

                            ) : (

                                <p className="text-sm text-gray-600 mt-2">
                                    No Team Leader assigned.
                                </p>

                            )}

                        </div>


                        {/* ==========================================
                            CURRENT MEMBERS
                        ========================================== */}

                        <div className="mt-6">

                            <h3 className="font-semibold text-gray-800">
                                Team Members
                            </h3>


                            {selectedTeam.collectors?.length > 0 ? (

                                <div className="space-y-2 mt-3">

                                    {selectedTeam.collectors.map(
                                        (collector) => (

                                            <div
                                                key={
                                                    collector.collector_id
                                                }
                                                className="border rounded-lg p-3 flex flex-col sm:flex-row justify-between gap-3 sm:items-center"
                                            >

                                                <div>

                                                    <p className="font-medium">
                                                        {
                                                            collector.full_name
                                                        }
                                                    </p>


                                                    <p className="text-sm text-gray-500">
                                                        {
                                                            collector.phone_number ||
                                                            collector.email ||
                                                            "No contact information"
                                                        }
                                                    </p>


                                                    {selectedTeam.team_leader_id ===
                                                        collector.collector_id && (

                                                        <span className="text-xs text-blue-600">

                                                            Team Leader • Driver

                                                        </span>

                                                    )}

                                                </div>


                                                <div className="flex gap-3">

                                                    {selectedTeam.team_leader_id !==
                                                        collector.collector_id && (

                                                        <button
                                                            onClick={() =>
                                                                handleSetLeader(
                                                                    collector.collector_id
                                                                )
                                                            }
                                                            disabled={saving}
                                                            className="text-blue-600 text-sm hover:underline disabled:opacity-50"
                                                        >
                                                            Make Leader
                                                        </button>

                                                    )}


                                                    <button
                                                        onClick={() =>
                                                            handleRemoveCollector(
                                                                collector.collector_id
                                                            )
                                                        }
                                                        disabled={saving}
                                                        className="text-red-600 text-sm hover:underline disabled:opacity-50"
                                                    >
                                                        Remove
                                                    </button>

                                                </div>

                                            </div>

                                        )
                                    )}

                                </div>

                            ) : (

                                <p className="text-gray-500 text-sm mt-3">
                                    No collectors assigned yet.
                                </p>

                            )}

                        </div>


                        {/* ==========================================
                            AVAILABLE COLLECTORS
                        ========================================== */}

                        <div className="mt-7">

                            <h3 className="font-semibold text-gray-800">
                                Add Collector
                            </h3>


                            <p className="text-sm text-gray-500 mb-3">

                                Only active collectors assigned to{" "}

                                {selectedTeam.kifle_ketema}

                                {", "}

                                {selectedTeam.kebele}

                                {" are shown."}

                            </p>


                            {collectors.filter(
                                (collector) =>
                                    !selectedTeam.collectors?.some(
                                        (member) =>
                                            Number(
                                                member.collector_id
                                            ) ===
                                            Number(
                                                collector.collector_id
                                            )
                                    )
                            ).length > 0 ? (

                                <div className="space-y-2">

                                    {collectors

                                        .filter(
                                            (collector) =>
                                                !selectedTeam.collectors?.some(
                                                    (member) =>
                                                        Number(
                                                            member.collector_id
                                                        ) ===
                                                        Number(
                                                            collector.collector_id
                                                        )
                                                )
                                        )

                                        .map((collector) => (

                                            <div
                                                key={
                                                    collector.collector_id
                                                }
                                                className="border rounded-lg p-3 flex flex-col sm:flex-row justify-between gap-3 sm:items-center"
                                            >

                                                <div>

                                                    <p className="font-medium">
                                                        {
                                                            collector.full_name
                                                        }
                                                    </p>


                                                    <p className="text-sm text-gray-500">

                                                        {
                                                            collector.phone_number ||
                                                            collector.email ||
                                                            "No contact information"
                                                        }

                                                    </p>

                                                </div>


                                                <button
                                                    onClick={() =>
                                                        handleAddCollector(
                                                            collector.collector_id
                                                        )
                                                    }
                                                    disabled={saving}
                                                    className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"
                                                >
                                                    + Add
                                                </button>

                                            </div>

                                        ))}

                                </div>

                            ) : (

                                <p className="text-sm text-gray-500">
                                    No active collectors available for this Kebele.
                                </p>

                            )}

                        </div>


                        {/* ==========================================
                            CLOSE BUTTON
                        ========================================== */}

                        <div className="mt-7 flex justify-end">

                            <button
                                onClick={closeManageModal}
                                disabled={saving}
                                className="border px-5 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50"
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


export default CollectionTeams;