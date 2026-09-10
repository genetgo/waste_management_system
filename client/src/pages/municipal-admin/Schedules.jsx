
import React, { useEffect, useState } from "react";
import API from "../../services/api";

// ==========================================
// Decode Logged-in User
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

    const userRole = tokenUser?.role || "";

    const assignedKifleKetema =
        tokenUser?.assigned_kifle_ketema || "";


    // ==========================================
    // State
    // ==========================================

    const [schedules, setSchedules] = useState([]);

    const [collectors, setCollectors] = useState([]);

    const [loading, setLoading] = useState(true);


    const [formData, setFormData] = useState({

        collector_id: "",

        kifle_ketema:
            assignedKifleKetema || "",

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
    // ==========================================

    const kebeles =
        formData.kifle_ketema
            ? Object.keys(
                locations[formData.kifle_ketema] || {}
            )
            : [];


    // ==========================================
    // Available Sefers
    // ==========================================

    const sefers =
        formData.kifle_ketema &&
        formData.kebele
            ? locations[
                formData.kifle_ketema
            ]?.[formData.kebele] || []
            : [];


    // ==========================================
    // Load Data
    // ==========================================

    useEffect(() => {

        const loadData = async () => {

            setLoading(true);

            await Promise.all([
                loadSchedules(),
                loadCollectors()
            ]);

            setLoading(false);
        };

        loadData();

    }, []);


    // ==========================================
    // Load Collectors
    // ==========================================

    const loadCollectors = async () => {

        try {

            const res = await API.get("/collectors");

            const data =
                Array.isArray(res.data?.data)
                    ? res.data.data
                    : Array.isArray(res.data)
                        ? res.data
                        : [];


            console.log(
                "ALL COLLECTORS:",
                data
            );


            // ==========================================
            // Municipal Admin → Own Kifle Only
            // ==========================================

            if (
                userRole === "MUNICIPAL_ADMIN" &&
                assignedKifleKetema
            ) {

                const filteredCollectors =
                    data.filter(
                        (collector) =>
                            String(
                                collector.assigned_kifle_ketema || ""
                            ).trim().toLowerCase()
                            ===
                            String(
                                assignedKifleKetema
                            ).trim().toLowerCase()
                    );


                console.log(
                    "COLLECTORS FOR",
                    assignedKifleKetema,
                    ":",
                    filteredCollectors
                );


                setCollectors(
                    filteredCollectors
                );

            } else {

                setCollectors(data);

            }

        } catch (error) {

            console.error(
                "Collectors Load Error:",
                error.response?.data || error
            );

            setCollectors([]);

        }

    };


    // ==========================================
    // Load Schedules
    // ==========================================

    const loadSchedules = async () => {

        try {

            const res = await API.get(
                "/schedules"
            );


            const data =
                Array.isArray(res.data?.data)
                    ? res.data.data
                    : Array.isArray(res.data)
                        ? res.data
                        : [];


            console.log(
                "ALL SCHEDULES:",
                data
            );


            // ==========================================
            // Municipal Admin → Own Kifle Only
            // ==========================================

            if (
                userRole === "MUNICIPAL_ADMIN" &&
                assignedKifleKetema
            ) {

                const filteredSchedules =
                    data.filter(
                        (schedule) =>
                            String(
                                schedule.kifle_ketema || ""
                            ).trim().toLowerCase()
                            ===
                            String(
                                assignedKifleKetema
                            ).trim().toLowerCase()
                    );


                console.log(
                    "SCHEDULES FOR",
                    assignedKifleKetema,
                    ":",
                    filteredSchedules
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
                error.response?.data || error
            );

            setSchedules([]);

        }

    };


    // ==========================================
    // Handle Input Change
    // ==========================================

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;


        setFormData(prev => ({

            ...prev,

            [name]: value

        }));

    };


    // ==========================================
    // Collector Change
    // ==========================================

    const handleCollectorChange = (e) => {

        setFormData(prev => ({

            ...prev,

            collector_id: e.target.value

        }));

    };


    // ==========================================
    // Kifle Change
    // ==========================================

    const handleKifleChange = (e) => {

        setFormData(prev => ({

            ...prev,

            kifle_ketema: e.target.value,

            kebele: "",

            sefers: [],

            collector_id: ""

        }));

    };


    // ==========================================
    // Kebele Change
    // ==========================================

    const handleKebeleChange = (e) => {

        setFormData(prev => ({

            ...prev,

            kebele: e.target.value,

            sefers: []

        }));

    };


    // ==========================================
    // Multiple Sefer
    // ==========================================

    const handleSeferChange = (sefer) => {

        setFormData(prev => {

            let selected = [
                ...prev.sefers
            ];


            if (
                selected.includes(sefer)
            ) {

                selected =
                    selected.filter(
                        item => item !== sefer
                    );

            } else {

                selected.push(sefer);

            }


            return {

                ...prev,

                sefers: selected

            };

        });

    };


    
// ==========================================
// Create Schedule
// ==========================================

const createSchedule = async (e) => {

    e.preventDefault();


    // ==========================================
    // Required Validation
    // ==========================================

    if (!formData.collector_id) {

        alert(
            "Please select collector."
        );

        return;

    }


    if (!formData.kifle_ketema) {

        alert(
            "Kifle Ketema is required."
        );

        return;

    }


    if (!formData.kebele) {

        alert(
            "Please select kebele."
        );

        return;

    }


    if (
        !formData.sefers ||
        formData.sefers.length === 0
    ) {

        alert(
            "Please select at least one sefer."
        );

        return;

    }


    // ==========================================
    // Initial Date Required
    // ==========================================

    if (!formData.initial_date) {

        alert(
            "Please select initial date."
        );

        return;

    }


    // ==========================================
    // Day Required
    // ==========================================

    if (!formData.day_of_week) {

        alert(
            "Please select day."
        );

        return;

    }


    // ==========================================
    // Time Validation
    // ==========================================

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
    // Create Schedule
    // ==========================================

    try {

        // ------------------------------------------
        // Create one schedule for each selected Sefer
        // ------------------------------------------

        for (
            const sefer of formData.sefers
        ) {

            try {

                await API.post(
                    "/schedules",
                    {

                        collector_id:
                            formData.collector_id,

                        kifle_ketema:
                            formData.kifle_ketema,

                        kebele:
                            formData.kebele,

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

                // ------------------------------------------
                // Backend duplicate/conflict
                // ------------------------------------------

                if (
                    error.response?.status === 409
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


        // ==========================================
        // Success
        // ==========================================

        alert(
            "Schedule created successfully."
        );


        // ==========================================
        // Reset Form
        // ==========================================

        setFormData({

            collector_id: "",

            kifle_ketema:
                userRole === "MUNICIPAL_ADMIN"
                    ? assignedKifleKetema
                    : "",

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
        // Reload Schedules
        // ==========================================

        await loadSchedules();


    } catch (error) {

        console.error(
            "Create Schedule Error:",
            error.response?.data || error
        );


        alert(
            error.response?.data?.message ||
            "Create schedule failed."
        );

    }

};

            
    // ==========================================
    // Delete Schedule
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


            await loadSchedules();

        } catch (error) {

            console.error(
                "Delete Schedule Error:",
                error.response?.data || error
            );


            alert(
                error.response?.data?.message ||
                "Failed to delete schedule."
            );

        }

    };


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


                {userRole === "MUNICIPAL_ADMIN" &&
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
                                {assignedKifleKetema}
                            </span>

                        </p>

                    )}

            </div>


            {/* ==========================================
                CREATE SCHEDULE FORM
            ========================================== */}

            <form
                onSubmit={createSchedule}
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


                {/* Collector */}

                <div>

                    <label className="
                        block
                        font-medium
                        mb-1
                    ">
                        Select Collector
                    </label>


                    <select
                        value={
                            formData.collector_id
                        }
                        onChange={
                            handleCollectorChange
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
                            Select Collector
                        </option>


                        {collectors.length === 0 ? (

                            <option disabled>
                                No collectors available
                            </option>

                        ) : (

                            collectors.map(
                                collector => (

                                    <option
                                        key={
                                            collector.collector_id
                                        }
                                        value={
                                            collector.collector_id
                                        }
                                    >
                                        {collector.full_name}
                                    </option>

                                )
                            )

                        )}

                    </select>

                </div>


                {/* Kifle Ketema */}

                <div>

                    <label className="
                        block
                        font-medium
                        mb-1
                    ">
                        Select Kifle Ketema
                    </label>


                    {userRole === "MUNICIPAL_ADMIN" ? (

                        <div className="
                            border
                            p-3
                            rounded
                            w-full
                            bg-gray-100
                            font-semibold
                            text-gray-700
                        ">
                            {assignedKifleKetema || "-"}
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

                            {Object.keys(
                                locations
                            ).map(kifle => (

                                <option
                                    key={kifle}
                                    value={kifle}
                                >
                                    {kifle}
                                </option>

                            ))}

                        </select>

                    )}

                </div>


                {/* Kebele */}

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
                            kebele => (

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


                {/* Sefer */}

                <div>

                    <label className="
                        block
                        font-medium
                        mb-2
                    ">
                        Select Sefer
                    </label>


                    <div className="
                        grid
                        grid-cols-2
                        gap-2
                    ">

                        {sefers.map(
                            sefer => (

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

                </div>


                {/* Initial Date */}

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


                {/* Day */}

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

                        <option>
                            Monday
                        </option>

                        <option>
                            Tuesday
                        </option>

                        <option>
                            Wednesday
                        </option>

                        <option>
                            Thursday
                        </option>

                        <option>
                            Friday
                        </option>

                        <option>
                            Saturday
                        </option>

                    </select>

                </div>


                {/* Frequency */}

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

                        <option>
                            Every Week
                        </option>

                        <option>
                            Every 2 Weeks
                        </option>

                        <option>
                            Monthly
                        </option>

                    </select>

                </div>


                {/* Start Time */}

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


                {/* End Time */}

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


                {/* Create */}

                <button
                    type="submit"
                    disabled={
                        collectors.length === 0
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

                    Create Schedule

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


                    {userRole === "MUNICIPAL_ADMIN" &&
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
                                {assignedKifleKetema}
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
                        min-w-[1050px]
                    ">

                        <thead>

                            <tr className="
                                bg-gray-100
                            ">

                                <th className="border p-2">
                                    Collector
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
                                schedule => {

                                    const collectorName =
                                        schedule.collector_name ||
                                        collectors.find(
                                            collector =>
                                                String(
                                                    collector.collector_id
                                                ) ===
                                                String(
                                                    schedule.collector_id
                                                )
                                        )?.full_name ||
                                        "Not Assigned";


                                    return (

                                        <tr
                                            key={
                                                schedule.schedule_id
                                            }
                                            className="
                                                hover:bg-gray-50
                                            "
                                        >

                                            {/* Collector */}

                                            <td className="
                                                border
                                                p-2
                                                font-semibold
                                            ">

                                                {collectorName}

                                            </td>


                                            {/* Kifle */}

                                            <td className="
                                                border
                                                p-2
                                            ">
                                                {
                                                    schedule.kifle_ketema
                                                }
                                            </td>


                                            {/* Kebele */}

                                            <td className="
                                                border
                                                p-2
                                            ">
                                                {
                                                    schedule.kebele
                                                }
                                            </td>


                                            {/* Sefer */}

                                            <td className="
                                                border
                                                p-2
                                            ">
                                                {
                                                    schedule.sefer
                                                }
                                            </td>


                                            {/* Initial Date */}

                                            <td className="
                                                border
                                                p-2
                                            ">
                                                <td className="border p-2">
    {schedule.initial_date
        ? String(schedule.initial_date).slice(0, 10)
        : "-"}
</td>
                                            </td>


                                            {/* Day */}

                                            <td className="
                                                border
                                                p-2
                                            ">
                                                {
                                                    schedule.day_of_week
                                                }
                                            </td>


                                            {/* Time */}

                                            <td className="
                                                border
                                                p-2
                                            ">

                                                {
                                                    schedule.start_time
                                                }

                                                {" - "}

                                                {
                                                    schedule.end_time
                                                }

                                            </td>


                                            {/* Frequency */}

                                            <td className="
                                                border
                                                p-2
                                            ">

                                                {
                                                    schedule.frequency
                                                }

                                            </td>


                                            {/* Delete */}

                                            <td className="
                                                border
                                                p-2
                                            ">

                                                <button
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

                                    );

                                }
                            )}

                        </tbody>

                    </table>

                )}

            </div>

        </div>

    );

};


export default Schedules;
