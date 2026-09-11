import React, { useEffect, useState } from "react";
import API from "../../services/api";

// ==========================================
// Decode Logged-in User
// Only ROLE is taken from JWT.
// Kifle Ketema comes from SERVER.
// ==========================================
const getUserFromToken = () => {
    try {
        const token = localStorage.getItem("token");

        if (!token) return {};

        const payload = token.split(".")[1];

        return JSON.parse(
            atob(
                payload
                    .replace(/-/g, "+")
                    .replace(/_/g, "/")
            )
        );
    } catch (error) {
        console.error("Token decode error:", error);
        return {};
    }
};


// ==========================================
// Location Data
// Kebele + Sefer stay HARD-CODED
// ==========================================
const locations = {

    Abima: {
        "Kebele 01": [
            "Sefer 01",
            "Sefer 02",
            "Sefer 03",
            "Sefer 04"
        ],
        "Kebele 02": [
            "Sefer 01",
            "Sefer 02",
            "Sefer 03",
            "Sefer 04"
        ],
        "Kebele 03": [
            "Sefer 01",
            "Sefer 02",
            "Sefer 03",
            "Sefer 04"
        ],
        "Kebele 04": [
            "Sefer 01",
            "Sefer 02",
            "Sefer 03",
            "Sefer 04"
        ]
    },

    Menkorer: {
        "Kebele 05": [
            "Sefer 01",
            "Sefer 02",
            "Sefer 03",
            "Sefer 04"
        ],
        "Kebele 06": [
            "Sefer 01",
            "Sefer 02",
            "Sefer 03",
            "Sefer 04"
        ],
        "Kebele 07": [
            "Sefer 01",
            "Sefer 02",
            "Sefer 03",
            "Sefer 04"
        ],
        "Kebele 08": [
            "Sefer 01",
            "Sefer 02",
            "Sefer 03",
            "Sefer 04"
        ]
    },

    "Nigus Teklehaymanot": {
        "Kebele 09": [
            "Sefer 01",
            "Sefer 02",
            "Sefer 03",
            "Sefer 04"
        ],
        "Kebele 10": [
            "Sefer 01",
            "Sefer 02",
            "Sefer 03",
            "Sefer 04"
        ],
        "Kebele 11": [
            "Sefer 01",
            "Sefer 02",
            "Sefer 03",
            "Sefer 04"
        ],
        "Kebele 12": [
            "Sefer 01",
            "Sefer 02",
            "Sefer 03",
            "Sefer 04"
        ],
        "Kebele 13": [
            "Sefer 01",
            "Sefer 02",
            "Sefer 03",
            "Sefer 04"
        ]
    },

    "Tedila Gualu": {
        "Kebele 14": [
            "Sefer 01",
            "Sefer 02",
            "Sefer 03",
            "Sefer 04"
        ],
        "Kebele 15": [
            "Sefer 01",
            "Sefer 02",
            "Sefer 03",
            "Sefer 04"
        ],
        "Kebele 16": [
            "Sefer 01",
            "Sefer 02",
            "Sefer 03",
            "Sefer 04"
        ],
        "Kebele 17": [
            "Sefer 01",
            "Sefer 02",
            "Sefer 03",
            "Sefer 04"
        ],
        "Kebele 18": [
            "Sefer 01",
            "Sefer 02",
            "Sefer 03",
            "Sefer 04"
        ]
    }
};


// ==========================================
// Component
// ==========================================
const Schedules = () => {

    const tokenUser = getUserFromToken();

    const userRole = String(
        tokenUser?.role || ""
    ).toUpperCase();


    // ==========================================
    // State
    // Kifle Ketema comes from SERVER
    // ==========================================
    const [assignedKifleKetema, setAssignedKifleKetema] =
        useState("");

    const [kifleKetemas, setKifleKetemas] =
        useState([]);


    const [schedules, setSchedules] =
        useState([]);

    const [teams, setTeams] =
        useState([]);

    const [loading, setLoading] =
        useState(true);


    // ==========================================
    // Form
    // ==========================================
    const [formData, setFormData] = useState({

        team_id: "",

        // Team Leader = Driver
        collector_id: "",

        kifle_ketema: "",

        kebele: "",

        sefers: [],

        day_of_week: "",

        frequency: "Every 2 Weeks",

        initial_date: "",

        start_time: "",

        end_time: "",

        status: "ACTIVE"
    });


    // ==========================================
    // Available Kebeles
    // FROM LOCAL locations ONLY
    // ==========================================
    const kebeles =
        formData.kifle_ketema
            ? Object.keys(
                locations[
                    formData.kifle_ketema
                ] || {}
            )
            : [];


    // ==========================================
    // Available Sefers
    // FROM LOCAL locations ONLY
    // ==========================================
    const sefers =
        formData.kifle_ketema &&
        formData.kebele
            ? locations[
                formData.kifle_ketema
            ]?.[
                formData.kebele
            ] || []
            : [];


    // ==========================================
    // Available Teams
    // Filter Kifle + Kebele
    // ==========================================
    const availableTeams = teams.filter((team) => {

        const teamKifle =
            String(
                team.kifle_ketema || ""
            )
                .trim()
                .toLowerCase();

        const selectedKifle =
            String(
                formData.kifle_ketema || ""
            )
                .trim()
                .toLowerCase();

        const teamKebele =
            String(
                team.kebele || ""
            )
                .trim()
                .toLowerCase();

        const selectedKebele =
            String(
                formData.kebele || ""
            )
                .trim()
                .toLowerCase();

        return (
            teamKifle === selectedKifle &&
            teamKebele === selectedKebele &&
            String(
                team.status || ""
            ).toUpperCase() === "ACTIVE"
        );
    });


    // ==========================================
    // Selected Team
    // ==========================================
    const selectedTeam =
        teams.find(
            (team) =>
                Number(team.team_id) ===
                Number(formData.team_id)
        ) || null;


    // ==========================================
    // LOAD KIFLE KETEMA
    // ONLY KIFLE COMES FROM SERVER
    // ==========================================
    const loadKifleKetemas = async () => {

        try {

            const res =
                await API.get(
                    "/schedules/kifle-ketemas"
                );

            const rawData =
                Array.isArray(res.data?.data)
                    ? res.data.data
                    : [];

            const kifles =
                rawData
                    .map((item) => {

                        if (
                            typeof item ===
                            "string"
                        ) {
                            return item;
                        }

                        return (
                            item?.kifle_ketema ||
                            item?.assigned_kifle_ketema ||
                            ""
                        );
                    })
                    .filter(Boolean);

            const uniqueKifles =
                [
                    ...new Set(kifles)
                ];

            console.log(
                "KIFLE KETEMAS FROM SERVER:",
                uniqueKifles
            );

            setKifleKetemas(
                uniqueKifles
            );


            // ==========================================
            // Municipal Admin
            // Only assigned Kifle
            // ==========================================
            if (
                userRole ===
                    "MUNICIPAL_ADMIN" &&
                uniqueKifles.length > 0
            ) {

                const serverKifle =
                    uniqueKifles[0];

                setAssignedKifleKetema(
                    serverKifle
                );

                setFormData((prev) => ({
                    ...prev,
                    kifle_ketema:
                        serverKifle
                }));
            }

            // ==========================================
            // System Admin
            // First Kifle can be selected
            // ==========================================
            if (
                userRole ===
                    "SYSTEM_ADMIN" &&
                uniqueKifles.length > 0 &&
                !formData.kifle_ketema
            ) {

                setFormData((prev) => ({
                    ...prev,
                    kifle_ketema:
                        prev.kifle_ketema ||
                        uniqueKifles[0]
                }));
            }

            return uniqueKifles;

        } catch (error) {

            console.error(
                "Kifle Ketema Load Error:",
                error.response?.data ||
                error
            );

            setKifleKetemas([]);

            return [];
        }
    };


    // ==========================================
    // LOAD ALL DATA
    // ==========================================
    useEffect(() => {

        const loadData = async () => {

            try {

                setLoading(true);

                const serverKifles =
                    await loadKifleKetemas();

                let currentKifle = "";

                if (
                    userRole ===
                    "MUNICIPAL_ADMIN"
                ) {

                    currentKifle =
                        serverKifles[0] || "";

                } else {

                    currentKifle =
                        serverKifles[0] || "";
                }


                await Promise.all([
                    loadSchedules(
                        currentKifle
                    ),
                    loadTeams(
                        currentKifle
                    )
                ]);

            } catch (error) {

                console.error(
                    "Load Data Error:",
                    error
                );

            } finally {

                setLoading(false);
            }
        };

        loadData();

    }, []);


    // ==========================================
    // LOAD COLLECTION TEAMS
    // ==========================================
    const loadTeams = async (
        kifleOverride = ""
    ) => {

        try {

            const res =
                await API.get(
                    "/collection-teams"
                );

            const data =
                Array.isArray(
                    res.data?.data
                )
                    ? res.data.data
                    : Array.isArray(
                        res.data
                    )
                        ? res.data
                        : [];


            console.log(
                "ALL COLLECTION TEAMS:",
                data
            );


            // ==========================================
            // Filter using SERVER KIFLE
            // ==========================================
            if (
                kifleOverride
            ) {

                const filteredTeams =
                    data.filter(
                        (team) =>
                            String(
                                team.kifle_ketema ||
                                ""
                            )
                                .trim()
                                .toLowerCase()
                            ===
                            String(
                                kifleOverride
                            )
                                .trim()
                                .toLowerCase()
                    );

                setTeams(
                    filteredTeams
                );

            } else {

                setTeams(data);
            }

        } catch (error) {

            console.error(
                "Collection Teams Load Error:",
                error.response?.data ||
                error
            );

            setTeams([]);
        }
    };


    // ==========================================
    // LOAD SCHEDULES
    // ==========================================
    const loadSchedules = async (
        kifleOverride = ""
    ) => {

        try {

            const res =
                await API.get(
                    "/schedules"
                );

            const data =
                Array.isArray(
                    res.data?.data
                )
                    ? res.data.data
                    : Array.isArray(
                        res.data
                    )
                        ? res.data
                        : [];


            console.log(
                "ALL SCHEDULES:",
                data
            );


            // ==========================================
            // Filter using SERVER KIFLE
            // ==========================================
            if (
                kifleOverride
            ) {

                const filteredSchedules =
                    data.filter(
                        (schedule) =>
                            String(
                                schedule.kifle_ketema ||
                                ""
                            )
                                .trim()
                                .toLowerCase()
                            ===
                            String(
                                kifleOverride
                            )
                                .trim()
                                .toLowerCase()
                    );

                setSchedules(
                    filteredSchedules
                );

            } else {

                setSchedules(data);
            }

        } catch (error) {

            console.error(
                "Schedule Load Error:",
                error.response?.data ||
                error
            );

            setSchedules([]);
        }
    };


    // ==========================================
    // Generic Input Change
    // ==========================================
    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };


    // ==========================================
    // KIFLE CHANGE
    // Kifle comes from SERVER
    // Kebele + Sefer stay LOCAL
    // ==========================================
    const handleKifleChange = async (e) => {

        const value =
            e.target.value;

        setFormData((prev) => ({
            ...prev,

            kifle_ketema: value,

            kebele: "",

            team_id: "",

            collector_id: "",

            sefers: []
        }));


        // Reload teams/schedules for selected Kifle
        await Promise.all([
            loadTeams(value),
            loadSchedules(value)
        ]);
    };


    // ==========================================
    // Kebele Change
    // ==========================================
    const handleKebeleChange = (e) => {

        const value =
            e.target.value;

        setFormData((prev) => ({
            ...prev,

            kebele: value,

            team_id: "",

            collector_id: "",

            sefers: []
        }));
    };


    // ==========================================
    // TEAM CHANGE
    // Team Leader = Driver
    // ==========================================
    const handleTeamChange = async (e) => {

        const teamId =
            e.target.value;

        if (!teamId) {

            setFormData((prev) => ({
                ...prev,

                team_id: "",

                collector_id: ""
            }));

            return;
        }


        try {

            const res =
                await API.get(
                    `/collection-teams/${teamId}`
                );

            const team =
                res.data?.data ||
                null;


            console.log(
                "SELECTED TEAM:",
                team
            );


            setFormData((prev) => ({
                ...prev,

                team_id:
                    teamId,

                // Team Leader = Driver
                collector_id:
                    team?.team_leader_id
                        ? String(
                            team.team_leader_id
                        )
                        : ""
            }));


            // Update detailed team
            if (team) {

                setTeams(
                    (prevTeams) =>
                        prevTeams.map(
                            (item) =>
                                Number(
                                    item.team_id
                                ) ===
                                Number(
                                    team.team_id
                                )
                                    ? {
                                        ...item,
                                        ...team
                                    }
                                    : item
                        )
                );
            }

        } catch (error) {

            console.error(
                "Load Selected Team Error:",
                error.response?.data ||
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to load collection team."
            );
        }
    };


    // ==========================================
    // SEFER CHANGE
    // ==========================================
    const handleSeferChange = (sefer) => {

        setFormData((prev) => {

            let selected = [
                ...prev.sefers
            ];

            if (
                selected.includes(
                    sefer
                )
            ) {

                selected =
                    selected.filter(
                        (item) =>
                            item !==
                            sefer
                    );

            } else {

                selected.push(
                    sefer
                );
            }

            return {
                ...prev,
                sefers:
                    selected
            };
        });
    };


    // ==========================================
    // CREATE SCHEDULE
    // ==========================================
    const createSchedule = async (e) => {

        e.preventDefault();


        // ==========================================
        // Validation
        // ==========================================
        if (
            !formData.kifle_ketema
        ) {

            alert(
                "Kifle Ketema is required."
            );

            return;
        }


        if (
            !formData.kebele
        ) {

            alert(
                "Please select Kebele."
            );

            return;
        }


        if (
            !formData.team_id
        ) {

            alert(
                "Please select Collection Team."
            );

            return;
        }


        if (!selectedTeam) {

            alert(
                "Selected Collection Team was not found."
            );

            return;
        }


        if (
            !selectedTeam.team_leader_id
        ) {

            alert(
                "This team does not have a Team Leader / Driver."
            );

            return;
        }


        if (
            !formData.sefers ||
            formData.sefers.length === 0
        ) {

            alert(
                "Please select at least one Sefer."
            );

            return;
        }


        if (
            !formData.initial_date
        ) {

            alert(
                "Please select initial date."
            );

            return;
        }


        if (
            !formData.day_of_week
        ) {

            alert(
                "Please select day."
            );

            return;
        }


        if (
            !formData.start_time ||
            !formData.end_time
        ) {

            alert(
                "Please select start and end time."
            );

            return;
        }


        if (
            formData.start_time >=
            formData.end_time
        ) {

            alert(
                "End time must be after start time."
            );

            return;
        }


        // ==========================================
        // CREATE
        // One schedule for each Sefer
        // ==========================================
        try {

            setLoading(true);


            for (
                const sefer
                of formData.sefers
            ) {

                try {

                    await API.post(
                        "/schedules",
                        {

                            team_id:
                                Number(
                                    selectedTeam.team_id
                                ),

                            // Team Leader = Driver
                            collector_id:
                                Number(
                                    selectedTeam.team_leader_id
                                ),

                            // Kifle from SERVER
                            kifle_ketema:
                                formData.kifle_ketema,

                            // Kebele from LOCAL locations
                            kebele:
                                formData.kebele,

                            // Sefer from LOCAL locations
                            sefer:
                                sefer,

                            day_of_week:
                                formData.day_of_week,

                            frequency:
                                formData.frequency,

                            initial_date:
                                formData.initial_date,

                            start_time:
                                formData.start_time,

                            end_time:
                                formData.end_time,

                            status:
                                "ACTIVE"
                        }
                    );

                } catch (error) {

                    if (
                        error.response?.status ===
                        409
                    ) {

                        alert(
                            error.response?.data?.message ||
                            `Schedule conflict found for ${sefer}.`
                        );

                        return;
                    }

                    throw error;
                }
            }


            alert(
                "Schedule created successfully."
            );


            // ==========================================
            // RESET
            // ==========================================
            setFormData({

                team_id: "",

                collector_id: "",

                // Keep server Kifle
                kifle_ketema:
                    userRole ===
                    "MUNICIPAL_ADMIN"
                        ? assignedKifleKetema
                        : "",

                kebele: "",

                sefers: [],

                day_of_week: "",

                frequency:
                    "Every 2 Weeks",

                initial_date: "",

                start_time: "",

                end_time: "",

                status: "ACTIVE"
            });


            await loadSchedules(
                assignedKifleKetema ||
                formData.kifle_ketema
            );

        } catch (error) {

            console.error(
                "Create Schedule Error:",
                error.response?.data ||
                error
            );

            alert(
                error.response?.data?.message ||
                "Create schedule failed."
            );

        } finally {

            setLoading(false);
        }
    };


    // ==========================================
    // DELETE SCHEDULE
    // ==========================================
    const deleteSchedule = async (id) => {

        if (
            !window.confirm(
                "Are you sure you want to delete this schedule?"
            )
        ) {

            return;
        }


        try {

            await API.delete(
                `/schedules/${id}`
            );

            await loadSchedules(
                formData.kifle_ketema
            );

        } catch (error) {

            console.error(
                "Delete Schedule Error:",
                error.response?.data ||
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to delete schedule."
            );
        }
    };


    // ==========================================
    // LOADING
    // ==========================================
    if (loading) {

        return (

            <div className="p-6">

                <div className="
                    bg-white
                    rounded-xl
                    shadow
                    p-10
                    text-center
                ">

                    <p className="
                        text-gray-600
                        font-semibold
                    ">
                        Loading schedules...
                    </p>

                </div>

            </div>
        );
    }


    // ==========================================
    // UI
    // ==========================================
    return (

        <div className="p-6 space-y-6">


            {/* ==========================================
                HEADER
            ========================================== */}
            <div>

                <h1 className="
                    text-2xl
                    font-bold
                    text-gray-800
                ">
                    Collection Schedule Management
                </h1>


                {userRole ===
                    "MUNICIPAL_ADMIN" &&
                    assignedKifleKetema && (

                        <p className="
                            mt-2
                            text-sm
                            text-gray-500
                        ">

                            Managing schedules for:

                            <span className="
                                ml-1
                                font-bold
                                text-blue-600
                            ">
                                {
                                    assignedKifleKetema
                                }
                            </span>

                        </p>
                    )}

            </div>


            {/* ==========================================
                CREATE FORM
            ========================================== */}
            <form
                onSubmit={
                    createSchedule
                }
                className="
                    bg-white
                    p-6
                    rounded-xl
                    shadow
                    grid
                    grid-cols-1
                    md:grid-cols-2
                    gap-4
                "
            >


                {/* ==========================================
                    KIFLE KETEMA
                ========================================== */}
                <div>

                    <label className="
                        block
                        font-medium
                        mb-1
                    ">
                        Select Kifle Ketema
                    </label>


                    {userRole ===
                    "MUNICIPAL_ADMIN" ? (

                        <div className="
                            border
                            p-3
                            rounded
                            w-full
                            bg-gray-100
                            font-semibold
                            text-gray-700
                        ">

                            {
                                assignedKifleKetema ||
                                "Loading..."
                            }

                        </div>

                    ) : (

                        <select
                            value={
                                formData.kifle_ketema
                            }
                            onChange={
                                handleKifleChange
                            }
                            className="
                                border
                                p-3
                                rounded
                                w-full
                            "
                            required
                        >

                            <option value="">
                                Select Kifle Ketema
                            </option>


                            {kifleKetemas.map(
                                (kifle) => (

                                    <option
                                        key={kifle}
                                        value={kifle}
                                    >
                                        {kifle}
                                    </option>

                                )
                            )}

                        </select>
                    )}

                </div>


                {/* ==========================================
                    KEBELE
                    LOCAL ONLY
                ========================================== */}
                <div>

                    <label className="
                        block
                        font-medium
                        mb-1
                    ">
                        Select Kebele
                    </label>


                    <select
                        value={
                            formData.kebele
                        }
                        onChange={
                            handleKebeleChange
                        }
                        disabled={
                            !formData.kifle_ketema
                        }
                        className="
                            border
                            p-3
                            rounded
                            w-full
                        "
                        required
                    >

                        <option value="">
                            Select Kebele
                        </option>


                        {kebeles.map(
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


                {/* ==========================================
                    COLLECTION TEAM
                ========================================== */}
                <div>

                    <label className="
                        block
                        font-medium
                        mb-1
                    ">
                        Select Collection Team
                    </label>


                    <select
                        value={
                            formData.team_id
                        }
                        onChange={
                            handleTeamChange
                        }
                        disabled={
                            !formData.kebele
                        }
                        className="
                            border
                            p-3
                            rounded
                            w-full
                        "
                        required
                    >

                        <option value="">

                            {!formData.kebele
                                ? "Select Kebele first"
                                : "Select Collection Team"
                            }

                        </option>


                        {formData.kebele &&
                        availableTeams.length ===
                            0 ? (

                            <option
                                value=""
                                disabled
                            >
                                No active teams for this Kebele
                            </option>

                        ) : (

                            availableTeams.map(
                                (team) => (

                                    <option
                                        key={
                                            team.team_id
                                        }
                                        value={
                                            team.team_id
                                        }
                                    >
                                        {
                                            team.team_name
                                        }
                                    </option>

                                )
                            )
                        )}

                    </select>


                    {/* ==========================================
                        TEAM INFORMATION
                    ========================================== */}
                    {selectedTeam && (

                        <div className="
                            mt-3
                            bg-blue-50
                            border
                            border-blue-200
                            rounded-lg
                            p-4
                            text-sm
                            space-y-3
                        ">


                            {/* Team */}
                            <div>

                                <p className="
                                    font-bold
                                    text-blue-800
                                    text-base
                                ">
                                    Collection Team
                                </p>


                                <p>
                                    <strong>
                                        Team:
                                    </strong>{" "}
                                    {
                                        selectedTeam.team_name ||
                                        "-"
                                    }
                                </p>


                                <p>
                                    <strong>
                                        Kifle Ketema:
                                    </strong>{" "}
                                    {
                                        selectedTeam.kifle_ketema ||
                                        "-"
                                    }
                                </p>


                                <p>
                                    <strong>
                                        Kebele:
                                    </strong>{" "}
                                    {
                                        selectedTeam.kebele ||
                                        "-"
                                    }
                                </p>

                            </div>


                            {/* Team Leader / Driver */}
                            <div className="
                                border-t
                                pt-3
                            ">

                                <p className="
                                    font-bold
                                    text-green-700
                                ">
                                    Team Leader / Driver
                                </p>


                                <p>
                                    <strong>
                                        Name:
                                    </strong>{" "}
                                    {
                                        selectedTeam.team_leader_name ||
                                        "-"
                                    }
                                </p>


                                <p>
                                    <strong>
                                        Phone:
                                    </strong>{" "}
                                    {
                                        selectedTeam.team_leader_phone ||
                                        "-"
                                    }
                                </p>


                                <p>
                                    <strong>
                                        Email:
                                    </strong>{" "}
                                    {
                                        selectedTeam.team_leader_email ||
                                        "-"
                                    }
                                </p>


                                <p className="
                                    text-xs
                                    text-green-700
                                    mt-1
                                ">
                                    The Team Leader will serve as
                                    the Driver.
                                </p>

                            </div>


                            {/* Team Members */}
                            <div className="
                                border-t
                                pt-3
                            ">

                                <p className="
                                    font-bold
                                    text-purple-700
                                    mb-2
                                ">
                                    Team Members
                                </p>


                                {Array.isArray(
                                    selectedTeam.collectors
                                ) &&
                                selectedTeam.collectors.length >
                                    0 ? (

                                    <div className="
                                        space-y-2
                                    ">

                                        {
                                            selectedTeam.collectors.map(
                                                (member) => (

                                                    <div
                                                        key={
                                                            member.collector_id
                                                        }
                                                        className="
                                                            bg-white
                                                            border
                                                            rounded-lg
                                                            p-3
                                                        "
                                                    >

                                                        <p className="
                                                            font-semibold
                                                        ">
                                                            {
                                                                member.full_name ||
                                                                "-"
                                                            }
                                                        </p>


                                                        <p>
                                                            Phone:{" "}
                                                            {
                                                                member.phone_number ||
                                                                "-"
                                                            }
                                                        </p>


                                                        <p>
                                                            Email:{" "}
                                                            {
                                                                member.email ||
                                                                "-"
                                                            }
                                                        </p>


                                                        <p>
                                                            Kifle Ketema:{" "}
                                                            {
                                                                member.assigned_kifle_ketema ||
                                                                "-"
                                                            }
                                                        </p>


                                                        <p>
                                                            Kebele:{" "}
                                                            {
                                                                member.kebele ||
                                                                "-"
                                                            }
                                                        </p>

                                                    </div>
                                                )
                                            )
                                        }

                                    </div>

                                ) : (

                                    <p className="
                                        text-gray-500
                                    ">
                                        No team members found.
                                    </p>
                                )}

                            </div>


                            {/* Member Count */}
                            <div className="
                                border-t
                                pt-2
                                font-semibold
                            ">

                                Members:{" "}

                                {
                                    Number(
                                        selectedTeam.collector_count
                                    ) ||
                                    (
                                        Array.isArray(
                                            selectedTeam.collectors
                                        )
                                            ? selectedTeam.collectors.length
                                            : 0
                                    )
                                }

                            </div>

                        </div>
                    )}

                </div>


                {/* ==========================================
                    SEFER
                    LOCAL ONLY
                ========================================== */}
                <div>

                    <label className="
                        block
                        font-medium
                        mb-2
                    ">
                        Select Sefer
                    </label>


                    {!formData.kebele ? (

                        <p className="
                            text-gray-500
                            text-sm
                        ">
                            Select Kebele first.
                        </p>

                    ) : (

                        <div className="
                            grid
                            grid-cols-2
                            gap-2
                        ">

                            {sefers.map(
                                (sefer) => (

                                    <label
                                        key={sefer}
                                        className="
                                            flex
                                            items-center
                                            gap-2
                                            border
                                            p-2
                                            rounded
                                            cursor-pointer
                                            hover:bg-gray-50
                                        "
                                    >

                                        <input
                                            type="checkbox"
                                            checked={
                                                formData.sefers.includes(
                                                    sefer
                                                )
                                            }
                                            onChange={() =>
                                                handleSeferChange(
                                                    sefer
                                                )
                                            }
                                        />

                                        {sefer}

                                    </label>
                                )
                            )}

                        </div>
                    )}

                </div>


                {/* ==========================================
                    INITIAL DATE
                ========================================== */}
                <div>

                    <label className="
                        block
                        font-medium
                        mb-1
                    ">
                        Initial Date
                    </label>


                    <input
                        type="date"
                        name="initial_date"
                        value={
                            formData.initial_date
                        }
                        onChange={
                            handleChange
                        }
                        className="
                            border
                            p-3
                            rounded
                            w-full
                        "
                        required
                    />


                    <p className="
                        text-xs
                        text-gray-500
                        mt-1
                    ">
                        Select the first collection date.
                    </p>

                </div>


                {/* ==========================================
                    DAY
                ========================================== */}
                <div>

                    <label className="
                        block
                        font-medium
                        mb-1
                    ">
                        Select Day
                    </label>


                    <select
                        name="day_of_week"
                        value={
                            formData.day_of_week
                        }
                        onChange={
                            handleChange
                        }
                        className="
                            border
                            p-3
                            rounded
                            w-full
                        "
                        required
                    >

                        <option value="">
                            Select Day
                        </option>

                        <option value="Monday">
                            Monday
                        </option>

                        <option value="Tuesday">
                            Tuesday
                        </option>

                        <option value="Wednesday">
                            Wednesday
                        </option>

                        <option value="Thursday">
                            Thursday
                        </option>

                        <option value="Friday">
                            Friday
                        </option>

                        <option value="Saturday">
                            Saturday
                        </option>

                    </select>

                </div>


                {/* ==========================================
                    FREQUENCY
                ========================================== */}
                <div>

                    <label className="
                        block
                        font-medium
                        mb-1
                    ">
                        Frequency
                    </label>


                    <select
                        name="frequency"
                        value={
                            formData.frequency
                        }
                        onChange={
                            handleChange
                        }
                        className="
                            border
                            p-3
                            rounded
                            w-full
                        "
                    >

                        <option value="Every Week">
                            Every Week
                        </option>

                        <option value="Every 2 Weeks">
                            Every 2 Weeks
                        </option>

                        <option value="Monthly">
                            Monthly
                        </option>

                    </select>

                </div>


                {/* ==========================================
                    START TIME
                ========================================== */}
                <div>

                    <label className="
                        block
                        font-medium
                        mb-1
                    ">
                        Start Time
                    </label>


                    <input
                        type="time"
                        name="start_time"
                        value={
                            formData.start_time
                        }
                        onChange={
                            handleChange
                        }
                        className="
                            border
                            p-3
                            rounded
                            w-full
                        "
                        required
                    />

                </div>


                {/* ==========================================
                    END TIME
                ========================================== */}
                <div>

                    <label className="
                        block
                        font-medium
                        mb-1
                    ">
                        End Time
                    </label>


                    <input
                        type="time"
                        name="end_time"
                        value={
                            formData.end_time
                        }
                        onChange={
                            handleChange
                        }
                        className="
                            border
                            p-3
                            rounded
                            w-full
                        "
                        required
                    />

                </div>


                {/* ==========================================
                    CREATE BUTTON
                ========================================== */}
                <button
                    type="submit"
                    disabled={
                        !formData.kifle_ketema ||
                        !formData.kebele ||
                        !formData.team_id ||
                        !formData.collector_id ||
                        !selectedTeam ||
                        !selectedTeam.team_leader_id ||
                        formData.sefers.length === 0
                    }
                    className="
                        bg-blue-600
                        text-white
                        rounded
                        p-3
                        md:col-span-2
                        hover:bg-blue-700
                        disabled:bg-gray-400
                        font-semibold
                    "
                >
                    Create Team Schedule
                </button>

            </form>


            {/* ==========================================
                EXISTING SCHEDULES
            ========================================== */}
            <div className="
                bg-white
                rounded-xl
                shadow
                p-5
                overflow-x-auto
            ">

                <div className="
                    flex
                    justify-between
                    items-center
                    mb-4
                ">

                    <h2 className="
                        font-bold
                        text-lg
                    ">
                        Existing Schedules
                    </h2>


                    {userRole ===
                        "MUNICIPAL_ADMIN" &&
                        assignedKifleKetema && (

                            <span className="
                                bg-blue-100
                                text-blue-700
                                px-3
                                py-1
                                rounded-full
                                text-sm
                                font-semibold
                            ">
                                {
                                    assignedKifleKetema
                                }
                            </span>
                        )}

                </div>


                {schedules.length === 0 ? (

                    <div className="
                        text-center
                        py-10
                        text-gray-500
                    ">
                        No schedules found.
                    </div>

                ) : (

                    <table className="
                        w-full
                        border
                        min-w-[1200px]
                    ">

                        <thead>

                            <tr className="
                                bg-gray-100
                            ">

                                <th className="border p-2">
                                    Team
                                </th>

                                <th className="border p-2">
                                    Team Leader / Driver
                                </th>

                                <th className="border p-2">
                                    Kifle Ketema
                                </th>

                                <th className="border p-2">
                                    Kebele
                                </th>

                                <th className="border p-2">
                                    Sefer
                                </th>

                                <th className="border p-2">
                                    Initial Date
                                </th>

                                <th className="border p-2">
                                    Day
                                </th>

                                <th className="border p-2">
                                    Time
                                </th>

                                <th className="border p-2">
                                    Frequency
                                </th>

                                <th className="border p-2">
                                    Action
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {schedules.map(
                                (schedule) => (

                                    <tr
                                        key={
                                            schedule.schedule_id
                                        }
                                        className="
                                            hover:bg-gray-50
                                        "
                                    >

                                        <td className="
                                            border
                                            p-2
                                            font-semibold
                                        ">
                                            {
                                                schedule.team_name ||
                                                "Not Assigned"
                                            }
                                        </td>


                                        <td className="
                                            border
                                            p-2
                                        ">
                                            {
                                                schedule.team_leader_name ||
                                                schedule.collector_name ||
                                                "Not Assigned"
                                            }
                                        </td>


                                        <td className="
                                            border
                                            p-2
                                        ">
                                            {
                                                schedule.kifle_ketema ||
                                                "-"
                                            }
                                        </td>


                                        <td className="
                                            border
                                            p-2
                                        ">
                                            {
                                                schedule.kebele ||
                                                "-"
                                            }
                                        </td>


                                        <td className="
                                            border
                                            p-2
                                        ">
                                            {
                                                schedule.sefer ||
                                                "-"
                                            }
                                        </td>


                                        <td className="
                                            border
                                            p-2
                                        ">
                                            {
                                                schedule.initial_date
                                                    ? String(
                                                        schedule.initial_date
                                                    ).slice(
                                                        0,
                                                        10
                                                    )
                                                    : "-"
                                            }
                                        </td>


                                        <td className="
                                            border
                                            p-2
                                        ">
                                            {
                                                schedule.day_of_week ||
                                                "-"
                                            }
                                        </td>


                                        <td className="
                                            border
                                            p-2
                                        ">
                                            {
                                                schedule.start_time ||
                                                "-"
                                            }

                                            {" - "}

                                            {
                                                schedule.end_time ||
                                                "-"
                                            }
                                        </td>


                                        <td className="
                                            border
                                            p-2
                                        ">
                                            {
                                                schedule.frequency ||
                                                "-"
                                            }
                                        </td>


                                        <td className="
                                            border
                                            p-2
                                        ">

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    deleteSchedule(
                                                        schedule.schedule_id
                                                    )
                                                }
                                                className="
                                                    bg-red-600
                                                    hover:bg-red-700
                                                    text-white
                                                    px-3
                                                    py-1
                                                    rounded
                                                "
                                            >
                                                Delete
                                            </button>

                                        </td>

                                    </tr>

                                )
                            )}

                        </tbody>

                    </table>
                )}

            </div>

        </div>
    );
};


export default Schedules;