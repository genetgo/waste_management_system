
import React, {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

import API from "../../services/api";

const Reports = () => {

    // =========================================================
    // LOCAL DATE
    // =========================================================
    const getLocalDate = () => {
        const now = new Date();

        const year = now.getFullYear();
        const month = String(
            now.getMonth() + 1
        ).padStart(2, "0");

        const day = String(
            now.getDate()
        ).padStart(2, "0");

        return `${year}-${month}-${day}`;
    };

    // =========================================================
    // DEFAULT FILTERS
    // =========================================================
    const getDefaultFilters = () => ({
        reportType: "all",
        period: "all",
        date: "",
        startDate: "",
        endDate: "",
        status: "all",
        teamId: "all",
        kebele: "all",
        sefer: "all",
    });

    // =========================================================
    // EMPTY SUMMARY
    // =========================================================
    const getEmptySummary = () => ({
        totalBusinesses: 0,
        totalCollectors: 0,
        totalSchedules: 0,
        totalRequests: 0,
        completedRequests: 0,
        pendingRequests: 0,
    });

    // =========================================================
    // STATE
    // =========================================================
    const [loading, setLoading] = useState(false);

    const [errorMessage, setErrorMessage] =
        useState("");

    const [summary, setSummary] = useState(
        getEmptySummary()
    );

    const [requests, setRequests] =
        useState([]);

    const [schedules, setSchedules] =
        useState([]);

    const [serverTeams, setServerTeams] =
        useState([]);

    const [serverLocations, setServerLocations] =
        useState({
            kebeles: [],
            sefers: [],
        });

    const [filters, setFilters] =
        useState(getDefaultFilters());

    // =========================================================
    // REPORT GENERATED STATE
    // =========================================================
    const [reportGenerated, setReportGenerated] =
        useState(false);

    // =========================================================
    // REQUEST SEQUENCE
    // =========================================================
    const requestSequence = useRef(0);

    // =========================================================
    // CLEAR REPORT DATA
    // =========================================================
    const clearReportData = () => {
        setSummary(
            getEmptySummary()
        );

        setRequests([]);

        setSchedules([]);

        setReportGenerated(false);
    };

    // =========================================================
    // BUILD API PARAMS
    // =========================================================
    const buildParams = (
        currentFilters
    ) => {

        const params = {
            reportType:
                currentFilters.reportType ||
                "all",

            period:
                currentFilters.period ||
                "all",

            status:
                currentFilters.status ||
                "all",
        };

        // =====================================================
        // DAILY / WEEKLY / MONTHLY
        // =====================================================
        if (
            currentFilters.period ===
                "daily" ||
            currentFilters.period ===
                "weekly" ||
            currentFilters.period ===
                "monthly"
        ) {
            if (currentFilters.date) {
                params.date =
                    currentFilters.date;
            }
        }

        // =====================================================
        // CUSTOM DATE RANGE
        // =====================================================
        if (
            currentFilters.period ===
            "custom"
        ) {
            if (currentFilters.startDate) {
                params.startDate =
                    currentFilters.startDate;
            }

            if (currentFilters.endDate) {
                params.endDate =
                    currentFilters.endDate;
            }
        }

        // =====================================================
        // TEAM
        // =====================================================
        if (
            currentFilters.teamId !==
                undefined &&
            currentFilters.teamId !==
                null &&
            currentFilters.teamId !== "" &&
            currentFilters.teamId !== "all"
        ) {
            const teamId = Number(
                currentFilters.teamId
            );

            if (
                Number.isInteger(teamId) &&
                teamId > 0
            ) {
                params.teamId =
                    teamId;
            }
        }

        // =====================================================
        // KEBELE
        // =====================================================
        if (
            currentFilters.kebele !==
                undefined &&
            currentFilters.kebele !==
                null &&
            currentFilters.kebele !== "" &&
            currentFilters.kebele !== "all"
        ) {
            params.kebele =
                String(
                    currentFilters.kebele
                ).trim();
        }

        // =====================================================
        // SEFER
        // =====================================================
        if (
            currentFilters.sefer !==
                undefined &&
            currentFilters.sefer !==
                null &&
            currentFilters.sefer !== "" &&
            currentFilters.sefer !== "all"
        ) {
            params.sefer =
                String(
                    currentFilters.sefer
                ).trim();
        }

        console.log(
            "=========================================="
        );

        console.log(
            "REPORT FILTER STATE:",
            currentFilters
        );

        console.log(
            "REPORT API PARAMS:",
            params
        );

        console.log(
            "TEAM PARAM:",
            params.teamId ??
                "ALL"
        );

        console.log(
            "KEBELE PARAM:",
            params.kebele ??
                "ALL"
        );

        console.log(
            "SEFER PARAM:",
            params.sefer ??
                "ALL"
        );

        console.log(
            "=========================================="
        );

        return params;
    };

    // =========================================================
    // NORMALIZE TEXT
    // =========================================================
    const normalizeText = (
        value
    ) => {
        return String(
            value ?? ""
        )
            .trim()
            .toLowerCase();
    };

    // =========================================================
    // CHECK TEAM
    // =========================================================
    const matchesTeam = (
        item,
        selectedTeamId
    ) => {

        if (
            !selectedTeamId ||
            selectedTeamId === "all"
        ) {
            return true;
        }

        const selectedId =
            Number(
                selectedTeamId
            );

        const itemTeamId =
            Number(
                item.team_id
            );

        return (
            Number.isInteger(
                selectedId
            ) &&
            selectedId > 0 &&
            Number.isInteger(
                itemTeamId
            ) &&
            itemTeamId ===
                selectedId
        );
    };

    // =========================================================
    // CHECK KEBELE
    // =========================================================
    const matchesKebele = (
        item,
        selectedKebele
    ) => {

        if (
            !selectedKebele ||
            selectedKebele === "all"
        ) {
            return true;
        }

        return (
            normalizeText(
                item.kebele
            ) ===
            normalizeText(
                selectedKebele
            )
        );
    };

    // =========================================================
    // CHECK SEFER
    // =========================================================
    const matchesSefer = (
        item,
        selectedSefer
    ) => {

        if (
            !selectedSefer ||
            selectedSefer === "all"
        ) {
            return true;
        }

        return (
            normalizeText(
                item.sefer
            ) ===
            normalizeText(
                selectedSefer
            )
        );
    };

    // =========================================================
    // APPLY CLIENT-SIDE FILTERS
    // =========================================================
    const applyLocalFilters = (
        serverRequests,
        serverSchedules,
        activeFilters
    ) => {

        const filteredRequests =
            serverRequests.filter(
                (request) =>
                    matchesTeam(
                        request,
                        activeFilters.teamId
                    ) &&
                    matchesKebele(
                        request,
                        activeFilters.kebele
                    ) &&
                    matchesSefer(
                        request,
                        activeFilters.sefer
                    )
            );

        const filteredSchedules =
            serverSchedules.filter(
                (schedule) =>
                    matchesTeam(
                        schedule,
                        activeFilters.teamId
                    ) &&
                    matchesKebele(
                        schedule,
                        activeFilters.kebele
                    ) &&
                    matchesSefer(
                        schedule,
                        activeFilters.sefer
                    )
            );

        return {
            filteredRequests,
            filteredSchedules,
        };
    };

    // =========================================================
    // FETCH REPORT DATA
    // =========================================================
    const fetchReports = async (
        customFilters = null
    ) => {

        const activeFilters =
            customFilters ||
            filters;

        const currentRequest =
            ++requestSequence.current;

        try {

            setLoading(true);

            setErrorMessage("");

            // =================================================
            // CUSTOM DATE VALIDATION
            // =================================================
            if (
                activeFilters.period ===
                "custom"
            ) {

                if (
                    !activeFilters.startDate ||
                    !activeFilters.endDate
                ) {

                    setErrorMessage(
                        "Please select both start date and end date."
                    );

                    clearReportData();

                    return;
                }

                if (
                    activeFilters.startDate >
                    activeFilters.endDate
                ) {

                    setErrorMessage(
                        "Start date cannot be later than end date."
                    );

                    clearReportData();

                    return;
                }
            }

            // =================================================
            // BUILD PARAMS
            // =================================================
            const params =
                buildParams(
                    activeFilters
                );

            // =================================================
            // GET REPORT DATA
            // =================================================
            const res =
                await API.get(
                    "/reports/municipal",
                    {
                        params,
                    }
                );

            // =================================================
            // IGNORE OLD RESPONSE
            // =================================================
            if (
                currentRequest !==
                requestSequence.current
            ) {
                return;
            }

            console.log(
                "MUNICIPAL REPORT RESPONSE:",
                res.data
            );

            if (
                !res.data?.success
            ) {

                throw new Error(
                    res.data?.message ||
                    "Failed to load municipal reports."
                );
            }

            // =================================================
            // SERVER REQUESTS
            // =================================================
            const serverRequests =
                Array.isArray(
                    res.data.requests
                )
                    ? res.data.requests
                    : [];

            // =================================================
            // SERVER SCHEDULES
            // =================================================
            const serverSchedules =
                Array.isArray(
                    res.data.schedules
                )
                    ? res.data.schedules
                    : [];

            // =================================================
            // SERVER TEAMS
            // =================================================
            const backendTeams =
                Array.isArray(
                    res.data.teams
                )
                    ? res.data.teams
                    : [];

            // =================================================
            // SERVER LOCATIONS
            // =================================================
            const backendLocations =
                res.data.locations &&
                typeof res.data.locations ===
                    "object"
                    ? res.data.locations
                    : {};

            const backendKebeles =
                Array.isArray(
                    backendLocations.kebeles
                )
                    ? backendLocations.kebeles
                    : [];

            const backendSefers =
                Array.isArray(
                    backendLocations.sefers
                )
                    ? backendLocations.sefers
                    : [];

            // =================================================
            // LOCAL FILTER
            // =================================================
            const {
                filteredRequests,
                filteredSchedules,
            } =
                applyLocalFilters(
                    serverRequests,
                    serverSchedules,
                    activeFilters
                );

            // =================================================
            // UPDATE DATA
            // =================================================
            setRequests(
                filteredRequests
            );

            setSchedules(
                filteredSchedules
            );

            // =================================================
            // KEEP ALL TEAMS
            // =================================================
            if (
                backendTeams.length >
                0
            ) {
                setServerTeams(
                    backendTeams
                );
            }

            // =================================================
            // KEEP ALL LOCATIONS
            // =================================================
            if (
                backendKebeles.length >
                    0 ||
                backendSefers.length >
                    0
            ) {

                setServerLocations({
                    kebeles:
                        backendKebeles,

                    sefers:
                        backendSefers,
                });
            }

            // =================================================
            // SERVER SUMMARY
            // =================================================
            const serverSummary =
                res.data.summary ||
                {};

            // =================================================
            // FILTERED COUNTS
            // =================================================
            const completedCount =
                filteredRequests.filter(
                    (request) =>
                        normalizeText(
                            request.status
                        ) ===
                        "completed"
                ).length;

            const pendingCount =
                filteredRequests.filter(
                    (request) =>
                        normalizeText(
                            request.status
                        ) ===
                        "pending"
                ).length;

            // =================================================
            // SUMMARY
            // =================================================
            setSummary({

                totalBusinesses:
                    Number(
                        serverSummary.totalBusinesses
                    ) || 0,

                totalCollectors:
                    Number(
                        serverSummary.totalCollectors
                    ) || 0,

                totalSchedules:
                    filteredSchedules.length,

                totalRequests:
                    filteredRequests.length,

                completedRequests:
                    completedCount,

                pendingRequests:
                    pendingCount,
            });

        } catch (error) {

            if (
                currentRequest !==
                requestSequence.current
            ) {
                return;
            }

            console.error(
                "MUNICIPAL REPORT ERROR:",
                error.response?.data ||
                error.message ||
                error
            );

            const message =
                error.response?.data
                    ?.message ||
                error.message ||
                "Unable to load municipal reports.";

            setErrorMessage(
                message
            );

            clearReportData();

        } finally {

            if (
                currentRequest ===
                requestSequence.current
            ) {
                setLoading(false);
            }
        }
    };

    // =========================================================
    // INITIAL LOAD
    // =========================================================
    useEffect(() => {

        const defaultFilters =
            getDefaultFilters();

        fetchReports(
            defaultFilters
        );

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // =========================================================
    // GENERATE REPORT
    // =========================================================
    const handleGenerateReport =
        async () => {

            console.log(
                "========== GENERATE REPORT =========="
            );

            console.log(
                "GENERATING WITH FILTERS:",
                filters
            );

            try {

                setLoading(true);

                setErrorMessage("");

                // =================================================
                // CUSTOM DATE VALIDATION
                // =================================================
                if (
                    filters.period ===
                    "custom"
                ) {

                    if (
                        !filters.startDate ||
                        !filters.endDate
                    ) {

                        setErrorMessage(
                            "Please select both start date and end date."
                        );

                        setReportGenerated(
                            false
                        );

                        return;
                    }

                    if (
                        filters.startDate >
                        filters.endDate
                    ) {

                        setErrorMessage(
                            "Start date cannot be later than end date."
                        );

                        setReportGenerated(
                            false
                        );

                        return;
                    }
                }

                // =================================================
                // BUILD PARAMS
                // =================================================
                const params =
                    buildParams(
                        filters
                    );

                console.log(
                    "GENERATE REPORT PARAMS:",
                    params
                );

                // =================================================
                // IMPORTANT:
                // GET ONLY
                // NO POST /generate
                // =================================================
                const res =
                    await API.get(
                        "/reports/municipal",
                        {
                            params,
                        }
                    );

                console.log(
                    "GENERATED REPORT RESPONSE:",
                    res.data
                );

                if (
                    !res.data?.success
                ) {

                    throw new Error(
                        res.data?.message ||
                        "Failed to generate report."
                    );
                }

                // =================================================
                // SERVER DATA
                // =================================================
                const generatedRequests =
                    Array.isArray(
                        res.data.requests
                    )
                        ? res.data.requests
                        : [];

                const generatedSchedules =
                    Array.isArray(
                        res.data.schedules
                    )
                        ? res.data.schedules
                        : [];

                // =================================================
                // APPLY LOCAL FILTERS
                // =================================================
                const {
                    filteredRequests,
                    filteredSchedules,
                } =
                    applyLocalFilters(
                        generatedRequests,
                        generatedSchedules,
                        filters
                    );

                // =================================================
                // UPDATE REQUESTS
                // =================================================
                setRequests(
                    filteredRequests
                );

                // =================================================
                // UPDATE SCHEDULES
                // =================================================
                setSchedules(
                    filteredSchedules
                );

                // =================================================
                // UPDATE TEAMS
                // =================================================
                if (
                    Array.isArray(
                        res.data.teams
                    )
                ) {

                    setServerTeams(
                        res.data.teams
                    );
                }

                // =================================================
                // UPDATE LOCATIONS
                // =================================================
                if (
                    res.data.locations &&
                    typeof res.data.locations ===
                        "object"
                ) {

                    setServerLocations({
                        kebeles:
                            Array.isArray(
                                res.data.locations
                                    .kebeles
                            )
                                ? res.data.locations
                                      .kebeles
                                : [],

                        sefers:
                            Array.isArray(
                                res.data.locations
                                    .sefers
                            )
                                ? res.data.locations
                                      .sefers
                                : [],
                    });
                }

                // =================================================
                // SUMMARY
                // =================================================
                const serverSummary =
                    res.data.summary ||
                    {};

                const completedCount =
                    filteredRequests.filter(
                        (request) =>
                            normalizeText(
                                request.status
                            ) ===
                            "completed"
                    ).length;

                const pendingCount =
                    filteredRequests.filter(
                        (request) =>
                            normalizeText(
                                request.status
                            ) ===
                            "pending"
                    ).length;

                setSummary({

                    totalBusinesses:
                        Number(
                            serverSummary.totalBusinesses
                        ) || 0,

                    totalCollectors:
                        Number(
                            serverSummary.totalCollectors
                        ) || 0,

                    totalSchedules:
                        filteredSchedules.length,

                    totalRequests:
                        filteredRequests.length,

                    completedRequests:
                        completedCount,

                    pendingRequests:
                        pendingCount,
                });

                // =================================================
                // SHOW DOWNLOAD BUTTONS
                // =================================================
                setReportGenerated(
                    true
                );

                console.log(
                    "========== REPORT GENERATED =========="
                );

            } catch (error) {

                console.error(
                    "GENERATE REPORT ERROR:",
                    error.response?.data ||
                    error.message ||
                    error
                );

                setErrorMessage(
                    error.response?.data
                        ?.message ||
                    error.message ||
                    "Unable to generate report."
                );

                setReportGenerated(
                    false
                );

            } finally {

                setLoading(false);
            }
        };

    // =========================================================
    // REFRESH CURRENT REPORT
    // =========================================================
    const handleRefresh =
        async () => {

            console.log(
                "========== REFRESH REPORT =========="
            );

            await fetchReports(
                filters
            );
        };

    // =========================================================
    // HANDLE FILTER CHANGE
    // =========================================================
    const handleFilterChange =
        (e) => {

            const {
                name,
                value,
            } = e.target;

            setFilters(
                (previous) => {

                    const next = {
                        ...previous,
                        [name]: value,
                    };

                    // =============================================
                    // REPORT TYPE
                    // =============================================
                    if (
                        name ===
                        "reportType"
                    ) {
                        next.status =
                            "all";
                    }

                    // =============================================
                    // PERIOD
                    // =============================================
                    if (
                        name ===
                        "period"
                    ) {

                        if (
                            value ===
                            "all"
                        ) {

                            next.date =
                                "";

                            next.startDate =
                                "";

                            next.endDate =
                                "";
                        }

                        if (
                            value ===
                                "daily" ||
                            value ===
                                "weekly" ||
                            value ===
                                "monthly"
                        ) {

                            next.date =
                                previous.date ||
                                getLocalDate();

                            next.startDate =
                                "";

                            next.endDate =
                                "";
                        }

                        if (
                            value ===
                            "custom"
                        ) {

                            next.date =
                                "";

                            next.startDate =
                                "";

                            next.endDate =
                                "";
                        }
                    }

                    return next;
                }
            );

            // New filters require a new Generate action
            setReportGenerated(
                false
            );
        };

    // =========================================================
    // RESET FILTERS
    // =========================================================
    const resetFilters =
        () => {

            setErrorMessage("");

            setReportGenerated(
                false
            );

            const defaultFilters =
                getDefaultFilters();

            setFilters(
                defaultFilters
            );

            fetchReports(
                defaultFilters
            );
        };

    // =========================================================
    // TEAM OPTIONS
    // =========================================================
    const teams = useMemo(() => {

        return serverTeams
            .map((team) => ({

                id: Number(
                    team.team_id ??
                    team.id
                ),

                name:
                    team.team_name ||
                    team.name ||
                    "-",

                leader:
                    team.team_leader_name ||
                    team.leader_name ||
                    "-",

                kebele:
                    team.kebele ||
                    "",

                status:
                    team.status ||
                    "",
            }))

            .filter(
                (team) =>
                    Number.isInteger(
                        team.id
                    ) &&
                    team.id > 0 &&
                    team.name !== "-"
            )

            .filter(
                (team, index, array) =>
                    index ===
                    array.findIndex(
                        (item) =>
                            item.id ===
                            team.id
                    )
            )

            .sort(
                (a, b) =>
                    String(
                        a.name
                    ).localeCompare(
                        String(
                            b.name
                        )
                    )
            );

    }, [serverTeams]);

    // =========================================================
    // KEBELE OPTIONS
    // =========================================================
    const kebeles = useMemo(() => {

        return Array.from(
            new Set(
                serverLocations
                    .kebeles
                    .filter(Boolean)
                    .map(
                        (value) =>
                            String(
                                value
                            ).trim()
                    )
                    .filter(Boolean)
            )
        ).sort(
            (a, b) =>
                a.localeCompare(b)
        );

    }, [
        serverLocations.kebeles,
    ]);

    // =========================================================
    // SEFER OPTIONS
    // =========================================================
    const sefers = useMemo(() => {

        return Array.from(
            new Set(
                serverLocations
                    .sefers
                    .filter(Boolean)
                    .map(
                        (value) =>
                            String(
                                value
                            ).trim()
                    )
                    .filter(Boolean)
            )
        ).sort(
            (a, b) =>
                a.localeCompare(b)
        );

    }, [
        serverLocations.sefers,
    ]);

    // =========================================================
    // STATUS CLASS
    // =========================================================
    const getStatusClass =
        (status) => {

            const normalized =
                String(
                    status || ""
                )
                    .trim()
                    .toLowerCase();

            if (
                normalized ===
                "completed"
            ) {
                return "bg-green-100 text-green-700";
            }

            if (
                normalized ===
                "collected"
            ) {
                return "bg-purple-100 text-purple-700";
            }

            if (
                normalized ===
                    "in progress" ||
                normalized ===
                    "in_progress"
            ) {
                return "bg-blue-100 text-blue-700";
            }

            if (
                normalized ===
                "assigned"
            ) {
                return "bg-indigo-100 text-indigo-700";
            }

            if (
                normalized ===
                "pending"
            ) {
                return "bg-yellow-100 text-yellow-700";
            }

            if (
                normalized ===
                    "cancelled" ||
                normalized ===
                    "canceled"
            ) {
                return "bg-red-100 text-red-700";
            }

            if (
                normalized ===
                "rejected"
            ) {
                return "bg-red-100 text-red-700";
            }

            if (
                normalized ===
                "approved"
            ) {
                return "bg-green-100 text-green-700";
            }

            if (
                normalized ===
                "active"
            ) {
                return "bg-green-100 text-green-700";
            }

            if (
                normalized ===
                "inactive"
            ) {
                return "bg-gray-100 text-gray-700";
            }

            return "bg-gray-100 text-gray-700";
        };

    // =========================================================
    // FORMAT DATE
    // =========================================================
    const formatDate =
        (value) => {

            if (!value) {
                return "-";
            }

            if (
                typeof value ===
                    "string" &&
                /^\d{4}-\d{2}-\d{2}$/.test(
                    value
                )
            ) {

                const [
                    year,
                    month,
                    day,
                ] =
                    value.split(
                        "-"
                    );

                return `${month}/${day}/${year}`;
            }

            const parsedDate =
                new Date(value);

            if (
                Number.isNaN(
                    parsedDate.getTime()
                )
            ) {
                return String(
                    value
                );
            }

            return parsedDate.toLocaleDateString();
        };

    // =========================================================
    // FORMAT TIME
    // =========================================================
    const formatTime =
        (value) => {

            if (!value) {
                return "-";
            }

            return String(
                value
            ).substring(
                0,
                5
            );
        };

    // =========================================================
    // REQUEST LEADER
    // =========================================================
    const getRequestLeaderName =
        (request) => {

            return (
                request.team_leader_name ||
                request.leader_name ||
                request.collector_name ||
                request.team_leader ||
                "Not Assigned"
            );
        };

    const getRequestLeaderPhone =
        (request) => {

            return (
                request.team_leader_phone ||
                request.leader_phone ||
                request.collector_phone ||
                ""
            );
        };

    // =========================================================
    // SCHEDULE LEADER
    // =========================================================
    const getScheduleLeaderName =
        (schedule) => {

            return (
                schedule.team_leader_name ||
                schedule.leader_name ||
                schedule.collector_name ||
                schedule.team_leader ||
                "Not Assigned"
            );
        };

    const getScheduleLeaderPhone =
        (schedule) => {

            return (
                schedule.team_leader_phone ||
                schedule.leader_phone ||
                schedule.collector_phone ||
                ""
            );
        };

    // =========================================================
    // DOWNLOAD PDF
    // =========================================================
    const handleDownloadPDF =
        () => {

            try {

                if (
                    !reportGenerated
                ) {

                    setErrorMessage(
                        "Please generate the report first."
                    );

                    return;
                }

                const doc =
                    new jsPDF({
                        orientation:
                            "landscape",

                        unit: "mm",

                        format: "a4",
                    });

                // =============================================
                // TITLE
                // =============================================
                doc.setFontSize(
                    18
                );

                doc.setFont(
                    "helvetica",
                    "bold"
                );

                doc.text(
                    "Municipal Waste Collection Report",
                    148,
                    15,
                    {
                        align:
                            "center",
                    }
                );

                // =============================================
                // REPORT INFORMATION
                // =============================================
                doc.setFontSize(
                    10
                );

                doc.setFont(
                    "helvetica",
                    "normal"
                );

                const reportTypeLabel =
                    filters.reportType ===
                    "all"
                        ? "All"
                        : filters.reportType ===
                          "requests"
                        ? "Collection Requests"
                        : "Collection Schedules";

                const periodLabel =
                    filters.period ===
                    "all"
                        ? "All Dates"
                        : filters.period;

                doc.text(
                    `Report Type: ${reportTypeLabel}`,
                    14,
                    25
                );

                doc.text(
                    `Period: ${periodLabel}`,
                    14,
                    31
                );

                doc.text(
                    `Team: ${
                        filters.teamId ===
                        "all"
                            ? "All Teams"
                            : filters.teamId
                    }`,
                    14,
                    37
                );

                doc.text(
                    `Kebele: ${
                        filters.kebele ===
                        "all"
                            ? "All Kebeles"
                            : filters.kebele
                    }`,
                    90,
                    37
                );

                doc.text(
                    `Sefer: ${
                        filters.sefer ===
                        "all"
                            ? "All Sefer"
                            : filters.sefer
                    }`,
                    180,
                    37
                );

                let currentY =
                    45;

                // =============================================
                // DATE
                // =============================================
                if (
                    filters.period ===
                    "custom"
                ) {

                    doc.text(
                        `Date Range: ${filters.startDate} to ${filters.endDate}`,
                        14,
                        currentY
                    );

                    currentY +=
                        7;

                } else if (
                    filters.period ===
                        "daily" ||
                    filters.period ===
                        "weekly" ||
                    filters.period ===
                        "monthly"
                ) {

                    doc.text(
                        `Date: ${
                            filters.date ||
                            "-"
                        }`,
                        14,
                        currentY
                    );

                    currentY +=
                        7;
                }

                // =============================================
                // SUMMARY
                // =============================================
                doc.setFont(
                    "helvetica",
                    "bold"
                );

                doc.text(
                    "Summary",
                    14,
                    currentY
                );

                currentY +=
                    5;

                autoTable(
                    doc,
                    {
                        startY:
                            currentY,

                        head: [
                            [
                                "Businesses",
                                "Collectors",
                                "Requests",
                                "Completed",
                                "Pending",
                                "Schedules",
                            ],
                        ],

                        body: [
                            [
                                summary.totalBusinesses,
                                summary.totalCollectors,
                                summary.totalRequests,
                                summary.completedRequests,
                                summary.pendingRequests,
                                summary.totalSchedules,
                            ],
                        ],

                        theme: "grid",

                        styles: {
                            fontSize:
                                9,
                            cellPadding:
                                3,
                        },
                    }
                );

                currentY =
                    doc.lastAutoTable
                        .finalY +
                    10;

                // =============================================
                // REQUEST REPORT
                // =============================================
                if (
                    filters.reportType ===
                        "all" ||
                    filters.reportType ===
                        "requests"
                ) {

                    doc.setFont(
                        "helvetica",
                        "bold"
                    );

                    doc.text(
                        "Collection Request Report",
                        14,
                        currentY
                    );

                    currentY +=
                        3;

                    const requestRows =
                        requests.map(
                            (
                                request,
                                index
                            ) => [
                                index + 1,

                                request.request_id ||
                                    "-",

                                request.business_name ||
                                    "-",

                                request.team_name ||
                                    "Not Assigned",

                                getRequestLeaderName(
                                    request
                                ),

                                `${
                                    request.kebele ||
                                    "-"
                                } / ${
                                    request.sefer ||
                                    "-"
                                }`,

                                formatDate(
                                    request.preferred_collection_date ||
                                    request.requested_date
                                ),

                                formatDate(
                                    request.created_at
                                ),

                                request.status ||
                                    "-",
                            ]
                        );

                    autoTable(
                        doc,
                        {
                            startY:
                                currentY,

                            head: [
                                [
                                    "#",
                                    "Request ID",
                                    "Business",
                                    "Team",
                                    "Leader / Driver",
                                    "Location",
                                    "Requested",
                                    "Created",
                                    "Status",
                                ],
                            ],

                            body:
                                requestRows.length >
                                0
                                    ? requestRows
                                    : [
                                          [
                                              "-",
                                              "-",
                                              "No collection requests found",
                                              "-",
                                              "-",
                                              "-",
                                              "-",
                                              "-",
                                              "-",
                                          ],
                                      ],

                            theme: "grid",

                            styles: {
                                fontSize:
                                    7,

                                cellPadding:
                                    2,
                            },

                            headStyles: {
                                fontStyle:
                                    "bold",
                            },
                        }
                    );

                    currentY =
                        doc.lastAutoTable
                            .finalY +
                        10;
                }

                // =============================================
                // SCHEDULE REPORT
                // =============================================
                if (
                    filters.reportType ===
                        "all" ||
                    filters.reportType ===
                        "schedules"
                ) {

                    if (
                        currentY >
                        175
                    ) {

                        doc.addPage();

                        currentY =
                            15;
                    }

                    doc.setFont(
                        "helvetica",
                        "bold"
                    );

                    doc.text(
                        "Collection Schedule Report",
                        14,
                        currentY
                    );

                    currentY +=
                        3;

                    const scheduleRows =
                        schedules.map(
                            (
                                schedule,
                                index
                            ) => [
                                index + 1,

                                schedule.schedule_id ||
                                    "-",

                                schedule.team_name ||
                                    "Not Assigned",

                                getScheduleLeaderName(
                                    schedule
                                ),

                                `${
                                    schedule.kebele ||
                                    "-"
                                } / ${
                                    schedule.sefer ||
                                    "-"
                                }`,

                                schedule.day_of_week ||
                                    "-",

                                formatDate(
                                    schedule.initial_date
                                ),

                                schedule.frequency ||
                                    "-",

                                `${
                                    formatTime(
                                        schedule.start_time
                                    )
                                } - ${
                                    formatTime(
                                        schedule.end_time
                                    )
                                }`,

                                schedule.status ||
                                    "-",
                            ]
                        );

                    autoTable(
                        doc,
                        {
                            startY:
                                currentY,

                            head: [
                                [
                                    "#",
                                    "Schedule ID",
                                    "Team",
                                    "Leader / Driver",
                                    "Location",
                                    "Day",
                                    "Date",
                                    "Frequency",
                                    "Time",
                                    "Status",
                                ],
                            ],

                            body:
                                scheduleRows.length >
                                0
                                    ? scheduleRows
                                    : [
                                          [
                                              "-",
                                              "-",
                                              "No collection schedules found",
                                              "-",
                                              "-",
                                              "-",
                                              "-",
                                              "-",
                                              "-",
                                              "-",
                                          ],
                                      ],

                            theme: "grid",

                            styles: {
                                fontSize:
                                    7,

                                cellPadding:
                                    2,
                            },

                            headStyles: {
                                fontStyle:
                                    "bold",
                            },
                        }
                    );
                }

                // =============================================
                // FOOTER
                // =============================================
                const pageCount =
                    doc.internal.getNumberOfPages();

                for (
                    let i = 1;
                    i <=
                    pageCount;
                    i++
                ) {

                    doc.setPage(
                        i
                    );

                    doc.setFontSize(
                        8
                    );

                    doc.setFont(
                        "helvetica",
                        "normal"
                    );

                    doc.text(
                        `Page ${i} of ${pageCount}`,
                        148,
                        202,
                        {
                            align:
                                "center",
                        }
                    );
                }

                // =============================================
                // FILE NAME
                // =============================================
                doc.save(
                    `municipal-waste-report-${getLocalDate()}.pdf`
                );

                console.log(
                    "PDF DOWNLOADED SUCCESSFULLY"
                );

            } catch (error) {

                console.error(
                    "PDF DOWNLOAD ERROR:",
                    error
                );

                setErrorMessage(
                    "Failed to download PDF report."
                );
            }
        };

    // =========================================================
    // DOWNLOAD EXCEL
    // =========================================================
    const handleDownloadExcel =
        () => {

            try {

                if (
                    !reportGenerated
                ) {

                    setErrorMessage(
                        "Please generate the report first."
                    );

                    return;
                }

                // =============================================
                // CREATE WORKBOOK
                // =============================================
                const workbook =
                    XLSX.utils.book_new();

                // =============================================
                // REPORT TYPE
                // =============================================
                const reportTypeLabel =
                    filters.reportType ===
                    "all"
                        ? "All"
                        : filters.reportType ===
                          "requests"
                        ? "Collection Requests"
                        : "Collection Schedules";

                // =============================================
                // SUMMARY
                // =============================================
                const summaryData = [
                    [
                        "Municipal Waste Collection Report",
                    ],

                    [],

                    [
                        "Report Type",
                        reportTypeLabel,
                    ],

                    [
                        "Period",
                        filters.period,
                    ],

                    [
                        "Team",
                        filters.teamId ===
                        "all"
                            ? "All Teams"
                            : filters.teamId,
                    ],

                    [
                        "Kebele",
                        filters.kebele ===
                        "all"
                            ? "All Kebeles"
                            : filters.kebele,
                    ],

                    [
                        "Sefer",
                        filters.sefer ===
                        "all"
                            ? "All Sefer"
                            : filters.sefer,
                    ],

                    [],
                ];

                // =============================================
                // DATE INFO
                // =============================================
                if (
                    filters.period ===
                    "custom"
                ) {

                    summaryData.push(
                        [
                            "Start Date",
                            filters.startDate,
                        ],
                        [
                            "End Date",
                            filters.endDate,
                        ]
                    );

                } else if (
                    filters.period ===
                        "daily" ||
                    filters.period ===
                        "weekly" ||
                    filters.period ===
                        "monthly"
                ) {

                    summaryData.push(
                        [
                            "Date",
                            filters.date,
                        ]
                    );
                }

                summaryData.push(
                    [],

                    [
                        "Metric",
                        "Count",
                    ],

                    [
                        "Business Owners",
                        summary.totalBusinesses,
                    ],

                    [
                        "Collectors",
                        summary.totalCollectors,
                    ],

                    [
                        "Collection Requests",
                        summary.totalRequests,
                    ],

                    [
                        "Completed Requests",
                        summary.completedRequests,
                    ],

                    [
                        "Pending Requests",
                        summary.pendingRequests,
                    ],

                    [
                        "Collection Schedules",
                        summary.totalSchedules,
                    ]
                );

                const summarySheet =
                    XLSX.utils.aoa_to_sheet(
                        summaryData
                    );

                summarySheet[
                    "!cols"
                ] = [
                    {
                        wch: 30,
                    },
                    {
                        wch: 30,
                    },
                ];

                XLSX.utils.book_append_sheet(
                    workbook,
                    summarySheet,
                    "Summary"
                );

                // =============================================
                // REQUESTS SHEET
                // =============================================
                if (
                    filters.reportType ===
                        "all" ||
                    filters.reportType ===
                        "requests"
                ) {

                    const requestData =
                        requests.map(
                            (
                                request,
                                index
                            ) => ({

                                "#":
                                    index + 1,

                                "Request ID":
                                    request.request_id ||
                                    "-",

                                Business:
                                    request.business_name ||
                                    "-",

                                "Business Phone":
                                    request.business_phone ||
                                    "-",

                                Team:
                                    request.team_name ||
                                    "Not Assigned",

                                "Team ID":
                                    request.team_id ||
                                    "-",

                                "Leader / Driver":
                                    getRequestLeaderName(
                                        request
                                    ),

                                "Leader Phone":
                                    getRequestLeaderPhone(
                                        request
                                    ),

                                Kebele:
                                    request.kebele ||
                                    "-",

                                Sefer:
                                    request.sefer ||
                                    "-",

                                "Requested Date":
                                    formatDate(
                                        request.preferred_collection_date ||
                                        request.requested_date
                                    ),

                                Created:
                                    formatDate(
                                        request.created_at
                                    ),

                                Status:
                                    request.status ||
                                    "-",
                            })
                        );

                    const requestSheet =
                        XLSX.utils.json_to_sheet(
                            requestData.length >
                            0
                                ? requestData
                                : [
                                      {
                                          Message:
                                              "No collection requests found for the selected filters.",
                                      },
                                  ]
                        );

                    requestSheet[
                        "!cols"
                    ] = [
                        {
                            wch: 6,
                        },
                        {
                            wch: 12,
                        },
                        {
                            wch: 22,
                        },
                        {
                            wch: 18,
                        },
                        {
                            wch: 18,
                        },
                        {
                            wch: 10,
                        },
                        {
                            wch: 22,
                        },
                        {
                            wch: 18,
                        },
                        {
                            wch: 15,
                        },
                        {
                            wch: 15,
                        },
                        {
                            wch: 18,
                        },
                        {
                            wch: 18,
                        },
                        {
                            wch: 15,
                        },
                    ];

                    XLSX.utils.book_append_sheet(
                        workbook,
                        requestSheet,
                        "Requests"
                    );
                }

                // =============================================
                // SCHEDULES SHEET
                // =============================================
                if (
                    filters.reportType ===
                        "all" ||
                    filters.reportType ===
                        "schedules"
                ) {

                    const scheduleData =
                        schedules.map(
                            (
                                schedule,
                                index
                            ) => ({

                                "#":
                                    index + 1,

                                "Schedule ID":
                                    schedule.schedule_id ||
                                    "-",

                                Team:
                                    schedule.team_name ||
                                    "Not Assigned",

                                "Team ID":
                                    schedule.team_id ||
                                    "-",

                                "Leader / Driver":
                                    getScheduleLeaderName(
                                        schedule
                                    ),

                                "Leader Phone":
                                    getScheduleLeaderPhone(
                                        schedule
                                    ),

                                Kebele:
                                    schedule.kebele ||
                                    "-",

                                Sefer:
                                    schedule.sefer ||
                                    "-",

                                Day:
                                    schedule.day_of_week ||
                                    "-",

                                Date:
                                    formatDate(
                                        schedule.initial_date
                                    ),

                                Frequency:
                                    schedule.frequency ||
                                    "-",

                                "Start Time":
                                    formatTime(
                                        schedule.start_time
                                    ),

                                "End Time":
                                    formatTime(
                                        schedule.end_time
                                    ),

                                Status:
                                    schedule.status ||
                                    "-",
                            })
                        );

                    const scheduleSheet =
                        XLSX.utils.json_to_sheet(
                            scheduleData.length >
                            0
                                ? scheduleData
                                : [
                                      {
                                          Message:
                                              "No collection schedules found for the selected filters.",
                                      },
                                  ]
                        );

                    scheduleSheet[
                        "!cols"
                    ] = [
                        {
                            wch: 6,
                        },
                        {
                            wch: 13,
                        },
                        {
                            wch: 18,
                        },
                        {
                            wch: 10,
                        },
                        {
                            wch: 22,
                        },
                        {
                            wch: 18,
                        },
                        {
                            wch: 15,
                        },
                        {
                            wch: 15,
                        },
                        {
                            wch: 15,
                        },
                        {
                            wch: 18,
                        },
                        {
                            wch: 20,
                        },
                        {
                            wch: 14,
                        },
                        {
                            wch: 14,
                        },
                        {
                            wch: 15,
                        },
                    ];

                    XLSX.utils.book_append_sheet(
                        workbook,
                        scheduleSheet,
                        "Schedules"
                    );
                }

                // =============================================
                // TEAMS SHEET
                // =============================================
                const teamData =
                    teams.map(
                        (
                            team,
                            index
                        ) => ({

                            "#":
                                index + 1,

                            Team:
                                team.name,

                            "Team ID":
                                team.id,

                            "Leader / Driver":
                                team.leader,

                            Kebele:
                                team.kebele ||
                                "-",

                            Status:
                                team.status ||
                                "-",
                        })
                    );

                const teamSheet =
                    XLSX.utils.json_to_sheet(
                        teamData.length >
                        0
                            ? teamData
                            : [
                                  {
                                      Message:
                                          "No collection teams found.",
                                  },
                              ]
                    );

                teamSheet[
                    "!cols"
                ] = [
                    {
                        wch: 6,
                    },
                    {
                        wch: 20,
                    },
                    {
                        wch: 10,
                    },
                    {
                        wch: 25,
                    },
                    {
                        wch: 15,
                    },
                    {
                        wch: 15,
                    },
                ];

                XLSX.utils.book_append_sheet(
                    workbook,
                    teamSheet,
                    "Teams"
                );

                // =============================================
                // DOWNLOAD EXCEL
                // =============================================
                XLSX.writeFile(
                    workbook,
                    `municipal-waste-report-${getLocalDate()}.xlsx`
                );

                console.log(
                    "EXCEL DOWNLOADED SUCCESSFULLY"
                );

            } catch (error) {

                console.error(
                    "EXCEL DOWNLOAD ERROR:",
                    error
                );

                setErrorMessage(
                    "Failed to download Excel report."
                );
            }
        };

    // =========================================================
    // LOADING
    // =========================================================
    if (loading) {

        return (
            <div className="p-10 text-center">

                <div className="text-lg font-semibold">
                    Loading Municipal Reports...
                </div>

            </div>
        );
    }

    // =========================================================
    // RENDER
    // =========================================================
    return (
        <div className="p-6 space-y-6">

            {/* =================================================
                HEADER
            ================================================= */}
            <div>

                <h1 className="text-3xl font-bold text-gray-800">
                    Municipal Reports
                </h1>

                <p className="text-gray-500 mt-2">
                    Waste Collection Management Reports
                </p>

            </div>

            {/* =================================================
                ERROR
            ================================================= */}
            {errorMessage && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">

                    <div className="font-bold">
                        Report Error
                    </div>

                    <div className="text-sm mt-1">
                        {errorMessage}
                    </div>

                </div>
            )}

            {/* =================================================
                FILTERS
            ================================================= */}
            <div className="bg-white rounded-2xl shadow border p-6">

                <h2 className="text-xl font-bold text-gray-800 mb-5">
                    Report Selection
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                    {/* REPORT TYPE */}
                    <div>

                        <label className="block text-sm font-semibold text-gray-600 mb-2">
                            Report Type
                        </label>

                        <select
                            name="reportType"
                            value={
                                filters.reportType
                            }
                            onChange={
                                handleFilterChange
                            }
                            className="w-full border rounded-lg px-3 py-2 bg-white"
                        >

                            <option value="all">
                                All
                            </option>

                            <option value="requests">
                                Collection Requests
                            </option>

                            <option value="schedules">
                                Collection Schedules
                            </option>

                        </select>

                    </div>

                    {/* PERIOD */}
                    <div>

                        <label className="block text-sm font-semibold text-gray-600 mb-2">
                            Period
                        </label>

                        <select
                            name="period"
                            value={
                                filters.period
                            }
                            onChange={
                                handleFilterChange
                            }
                            className="w-full border rounded-lg px-3 py-2 bg-white"
                        >

                            <option value="all">
                                All Dates
                            </option>

                            <option value="daily">
                                Daily
                            </option>

                            <option value="weekly">
                                Weekly
                            </option>

                            <option value="monthly">
                                Monthly
                            </option>

                            <option value="custom">
                                Custom Date Range
                            </option>

                        </select>

                    </div>

                    {/* DATE */}
                    {(
                        filters.period ===
                            "daily" ||
                        filters.period ===
                            "weekly" ||
                        filters.period ===
                            "monthly"
                    ) && (
                        <div>

                            <label className="block text-sm font-semibold text-gray-600 mb-2">
                                Date
                            </label>

                            <input
                                type="date"
                                name="date"
                                value={
                                    filters.date
                                }
                                onChange={
                                    handleFilterChange
                                }
                                className="w-full border rounded-lg px-3 py-2"
                            />

                        </div>
                    )}

                    {/* STATUS */}
                    <div>

                        <label className="block text-sm font-semibold text-gray-600 mb-2">
                            Status
                        </label>

                        <select
                            name="status"
                            value={
                                filters.status
                            }
                            onChange={
                                handleFilterChange
                            }
                            className="w-full border rounded-lg px-3 py-2 bg-white"
                        >

                            <option value="all">
                                All Statuses
                            </option>

                            {(
                                filters.reportType ===
                                    "all" ||
                                filters.reportType ===
                                    "requests"
                            ) && (
                                <>
                                    <option value="Pending">
                                        Pending
                                    </option>

                                    <option value="Approved">
                                        Approved
                                    </option>

                                    <option value="Assigned">
                                        Assigned
                                    </option>

                                    <option value="In Progress">
                                        In Progress
                                    </option>

                                    <option value="Collected">
                                        Collected
                                    </option>

                                    <option value="Completed">
                                        Completed
                                    </option>

                                    <option value="Rejected">
                                        Rejected
                                    </option>

                                    <option value="Cancelled">
                                        Cancelled
                                    </option>
                                </>
                            )}

                            {filters.reportType ===
                                "schedules" && (
                                <>
                                    <option value="Active">
                                        Active
                                    </option>

                                    <option value="Inactive">
                                        Inactive
                                    </option>
                                </>
                            )}

                        </select>

                    </div>

                    {/* CUSTOM START */}
                    {filters.period ===
                        "custom" && (
                        <div>

                            <label className="block text-sm font-semibold text-gray-600 mb-2">
                                Start Date
                            </label>

                            <input
                                type="date"
                                name="startDate"
                                value={
                                    filters.startDate
                                }
                                onChange={
                                    handleFilterChange
                                }
                                className="w-full border rounded-lg px-3 py-2"
                            />

                        </div>
                    )}

                    {/* CUSTOM END */}
                    {filters.period ===
                        "custom" && (
                        <div>

                            <label className="block text-sm font-semibold text-gray-600 mb-2">
                                End Date
                            </label>

                            <input
                                type="date"
                                name="endDate"
                                value={
                                    filters.endDate
                                }
                                onChange={
                                    handleFilterChange
                                }
                                className="w-full border rounded-lg px-3 py-2"
                            />

                        </div>
                    )}

                    {/* COLLECTION TEAM */}
                    <div>

                        <label className="block text-sm font-semibold text-gray-600 mb-2">
                            Collection Team
                        </label>

                        <select
                            name="teamId"
                            value={
                                filters.teamId
                            }
                            onChange={
                                handleFilterChange
                            }
                            className="w-full border rounded-lg px-3 py-2 bg-white"
                        >

                            <option value="all">
                                All Teams
                            </option>

                            {teams.map(
                                (team) => (
                                    <option
                                        key={
                                            team.id
                                        }
                                        value={String(
                                            team.id
                                        )}
                                    >
                                        {
                                            team.name
                                        }
                                    </option>
                                )
                            )}

                        </select>

                    </div>

                    {/* KEBELE */}
                    <div>

                        <label className="block text-sm font-semibold text-gray-600 mb-2">
                            Kebele
                        </label>

                        <select
                            name="kebele"
                            value={
                                filters.kebele
                            }
                            onChange={
                                handleFilterChange
                            }
                            className="w-full border rounded-lg px-3 py-2 bg-white"
                        >

                            <option value="all">
                                All Kebeles
                            </option>

                            {kebeles.map(
                                (item) => (
                                    <option
                                        key={
                                            item
                                        }
                                        value={
                                            item
                                        }
                                    >
                                        {
                                            item
                                        }
                                    </option>
                                )
                            )}

                        </select>

                    </div>

                    {/* SEFER */}
                    <div>

                        <label className="block text-sm font-semibold text-gray-600 mb-2">
                            Sefer
                        </label>

                        <select
                            name="sefer"
                            value={
                                filters.sefer
                            }
                            onChange={
                                handleFilterChange
                            }
                            className="w-full border rounded-lg px-3 py-2 bg-white"
                        >

                            <option value="all">
                                All Sefer
                            </option>

                            {sefers.map(
                                (item) => (
                                    <option
                                        key={
                                            item
                                        }
                                        value={
                                            item
                                        }
                                    >
                                        {
                                            item
                                        }
                                    </option>
                                )
                            )}

                        </select>

                    </div>

                </div>

                {/* =================================================
                    BUTTONS
                ================================================= */}
                <div className="flex flex-wrap gap-3 mt-6">

                    {/* GENERATE */}
                    <button
                        type="button"
                        onClick={
                            handleGenerateReport
                        }
                        disabled={
                            loading
                        }
                        className={`px-6 py-2 rounded-lg font-semibold text-white ${
                            loading
                                ? "bg-blue-300 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700"
                        }`}
                    >
                        {loading
                            ? "Generating..."
                            : "Generate Report"}
                    </button>

                    {/* DOWNLOAD PDF */}
                    {reportGenerated && (
                        <button
                            type="button"
                            onClick={
                                handleDownloadPDF
                            }
                            disabled={
                                loading
                            }
                            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50"
                        >
                            Download PDF
                        </button>
                    )}

                    {/* DOWNLOAD EXCEL */}
                    {reportGenerated && (
                        <button
                            type="button"
                            onClick={
                                handleDownloadExcel
                            }
                            disabled={
                                loading
                            }
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50"
                        >
                            Download Excel
                        </button>
                    )}

                    {/* RESET */}
                    <button
                        type="button"
                        onClick={
                            resetFilters
                        }
                        disabled={
                            loading
                        }
                        className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50"
                    >
                        Reset
                    </button>

                    {/* REFRESH */}
                    <button
                        type="button"
                        onClick={
                            handleRefresh
                        }
                        disabled={
                            loading
                        }
                        className="bg-green-700 hover:bg-green-800 text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50"
                    >
                        Refresh
                    </button>

                </div>

                {/* FILTER STATUS */}
                <div className="mt-4 text-sm text-gray-500">

                    Select your report filters, then click

                    <span className="font-semibold text-blue-600 mx-1">
                        Generate Report
                    </span>

                    to display the report.

                    {reportGenerated && (
                        <span className="ml-2 text-green-600 font-semibold">
                            Report generated successfully. You can now download it as PDF or Excel.
                        </span>
                    )}

                </div>

            </div>

            {/* =================================================
                SUMMARY
            ================================================= */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                <div className="bg-white rounded-2xl shadow border p-5">

                    <p className="text-gray-500 text-sm">
                        Business Owners
                    </p>

                    <h2 className="text-3xl font-bold text-green-600 mt-2">
                        {
                            summary.totalBusinesses
                        }
                    </h2>

                    <p className="text-xs text-gray-400 mt-2">
                        Registered businesses
                    </p>

                </div>

                <div className="bg-white rounded-2xl shadow border p-5">

                    <p className="text-gray-500 text-sm">
                        Collectors
                    </p>

                    <h2 className="text-3xl font-bold text-indigo-600 mt-2">
                        {
                            summary.totalCollectors
                        }
                    </h2>

                    <p className="text-xs text-gray-400 mt-2">
                        Registered collectors
                    </p>

                </div>

                <div className="bg-white rounded-2xl shadow border p-5">

                    <p className="text-gray-500 text-sm">
                        Collection Requests
                    </p>

                    <h2 className="text-3xl font-bold text-red-600 mt-2">
                        {
                            summary.totalRequests
                        }
                    </h2>

                    <p className="text-xs text-gray-400 mt-2">
                        Requests in selected report
                    </p>

                </div>

            </div>

            {/* =================================================
                PERFORMANCE
            ================================================= */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                <div className="bg-green-50 border border-green-200 rounded-2xl p-5">

                    <p className="text-green-700 text-sm font-semibold">
                        Completed Requests
                    </p>

                    <h2 className="text-3xl font-bold text-green-700 mt-2">
                        {
                            summary.completedRequests
                        }
                    </h2>

                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5">

                    <p className="text-yellow-700 text-sm font-semibold">
                        Pending Requests
                    </p>

                    <h2 className="text-3xl font-bold text-yellow-700 mt-2">
                        {
                            summary.pendingRequests
                        }
                    </h2>

                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">

                    <p className="text-blue-700 text-sm font-semibold">
                        Collection Schedules
                    </p>

                    <h2 className="text-3xl font-bold text-blue-700 mt-2">
                        {
                            summary.totalSchedules
                        }
                    </h2>

                </div>

            </div>

            {/* =================================================
                TEAM INFORMATION
            ================================================= */}
            {teams.length >
                0 && (
                <div className="bg-white rounded-2xl shadow border overflow-hidden">

                    <div className="px-6 py-4 border-b">

                        <h2 className="text-xl font-bold text-gray-800">
                            Collection Teams
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                            Registered collection teams and their leaders
                        </p>

                    </div>

                    <div className="overflow-x-auto">

                        <table className="min-w-full">

                            <thead className="bg-gray-100">

                                <tr>

                                    <th className="px-4 py-3 text-left">
                                        #
                                    </th>

                                    <th className="px-4 py-3 text-left">
                                        Team
                                    </th>

                                    <th className="px-4 py-3 text-left">
                                        Team Leader / Driver
                                    </th>

                                    <th className="px-4 py-3 text-left">
                                        Kebele
                                    </th>

                                    <th className="px-4 py-3 text-left">
                                        Status
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {teams.map(
                                    (
                                        team,
                                        index
                                    ) => (

                                        <tr
                                            key={
                                                team.id
                                            }
                                            className="border-b hover:bg-gray-50"
                                        >

                                            <td className="px-4 py-4">
                                                {
                                                    index +
                                                    1
                                                }
                                            </td>

                                            <td className="px-4 py-4 font-semibold">
                                                {
                                                    team.name
                                                }
                                            </td>

                                            <td className="px-4 py-4">
                                                {
                                                    team.leader
                                                }
                                            </td>

                                            <td className="px-4 py-4">
                                                {
                                                    team.kebele ||
                                                    "-"
                                                }
                                            </td>

                                            <td className="px-4 py-4">

                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusClass(
                                                        team.status
                                                    )}`}
                                                >
                                                    {
                                                        team.status ||
                                                        "-"
                                                    }
                                                </span>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                </div>
            )}

            {/* =================================================
                REQUEST REPORT
            ================================================= */}
            {(
                filters.reportType ===
                    "all" ||
                filters.reportType ===
                    "requests"
            ) && (
                <div className="bg-white rounded-2xl shadow border overflow-hidden">

                    <div className="px-6 py-4 border-b">

                        <h2 className="text-xl font-bold text-gray-800">
                            Collection Request Report
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                            Requests created during the selected reporting period
                        </p>

                    </div>

                    <div className="overflow-x-auto">

                        <table className="min-w-full">

                            <thead className="bg-gray-100">

                                <tr>

                                    <th className="px-4 py-3 text-left">
                                        #
                                    </th>

                                    <th className="px-4 py-3 text-left">
                                        Request ID
                                    </th>

                                    <th className="px-4 py-3 text-left">
                                        Business
                                    </th>

                                    <th className="px-4 py-3 text-left">
                                        Team
                                    </th>

                                    <th className="px-4 py-3 text-left">
                                        Leader / Driver
                                    </th>

                                    <th className="px-4 py-3 text-left">
                                        Location
                                    </th>

                                    <th className="px-4 py-3 text-left">
                                        Requested Date
                                    </th>

                                    <th className="px-4 py-3 text-left">
                                        Created
                                    </th>

                                    <th className="px-4 py-3 text-left">
                                        Status
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {requests.length >
                                0 ? (

                                    requests.map(
                                        (
                                            request,
                                            index
                                        ) => {

                                            const leaderName =
                                                getRequestLeaderName(
                                                    request
                                                );

                                            const leaderPhone =
                                                getRequestLeaderPhone(
                                                    request
                                                );

                                            return (

                                                <tr
                                                    key={
                                                        request.request_id ||
                                                        `request-${index}`
                                                    }
                                                    className="border-b hover:bg-gray-50"
                                                >

                                                    <td className="px-4 py-4">
                                                        {
                                                            index +
                                                            1
                                                        }
                                                    </td>

                                                    <td className="px-4 py-4 font-semibold">
                                                        {
                                                            request.request_id
                                                        }
                                                    </td>

                                                    <td className="px-4 py-4">

                                                        <div className="font-semibold">
                                                            {
                                                                request.business_name ||
                                                                "-"
                                                            }
                                                        </div>

                                                        {request.business_phone && (
                                                            <div className="text-xs text-gray-500">
                                                                {
                                                                    request.business_phone
                                                                }
                                                            </div>
                                                        )}

                                                    </td>

                                                    <td className="px-4 py-4">

                                                        <div className="font-semibold">
                                                            {
                                                                request.team_name ||
                                                                "Not Assigned"
                                                            }
                                                        </div>

                                                        {request.team_id && (
                                                            <div className="text-xs text-gray-500">
                                                                Team ID:{" "}
                                                                {
                                                                    request.team_id
                                                                }
                                                            </div>
                                                        )}

                                                    </td>

                                                    <td className="px-4 py-4">

                                                        <div className="font-semibold">
                                                            {
                                                                leaderName
                                                            }
                                                        </div>

                                                        {leaderPhone && (
                                                            <div className="text-xs text-gray-500">
                                                                {
                                                                    leaderPhone
                                                                }
                                                            </div>
                                                        )}

                                                    </td>

                                                    <td className="px-4 py-4">

                                                        <div>
                                                            {
                                                                request.kebele ||
                                                                "-"
                                                            }
                                                        </div>

                                                        <div className="text-xs text-gray-500">
                                                            {
                                                                request.sefer ||
                                                                "-"
                                                            }
                                                        </div>

                                                    </td>

                                                    <td className="px-4 py-4">
                                                        {
                                                            formatDate(
                                                                request.preferred_collection_date ||
                                                                request.requested_date
                                                            )
                                                        }
                                                    </td>

                                                    <td className="px-4 py-4">
                                                        {
                                                            formatDate(
                                                                request.created_at
                                                            )
                                                        }
                                                    </td>

                                                    <td className="px-4 py-4">

                                                        <span
                                                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusClass(
                                                                request.status
                                                            )}`}
                                                        >
                                                            {
                                                                request.status ||
                                                                "-"
                                                            }
                                                        </span>

                                                    </td>

                                                </tr>

                                            );
                                        }
                                    )

                                ) : (

                                    <tr>

                                        <td
                                            colSpan="9"
                                            className="text-center py-8 text-gray-500"
                                        >
                                            No collection requests found for the selected filters.
                                        </td>

                                    </tr>

                                )}

                            </tbody>

                        </table>

                    </div>

                </div>
            )}

            {/* =================================================
                SCHEDULE REPORT
            ================================================= */}
            {(
                filters.reportType ===
                    "all" ||
                filters.reportType ===
                    "schedules"
            ) && (
                <div className="bg-white rounded-2xl shadow border overflow-hidden">

                    <div className="px-6 py-4 border-b">

                        <h2 className="text-xl font-bold text-gray-800">
                            Collection Schedule Report
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                            Detailed collection schedules based on selected filters
                        </p>

                    </div>

                    <div className="overflow-x-auto">

                        <table className="min-w-full">

                            <thead className="bg-gray-100">

                                <tr>

                                    <th className="px-4 py-3 text-left">
                                        #
                                    </th>

                                    <th className="px-4 py-3 text-left">
                                        Schedule ID
                                    </th>

                                    <th className="px-4 py-3 text-left">
                                        Team
                                    </th>

                                    <th className="px-4 py-3 text-left">
                                        Leader / Driver
                                    </th>

                                    <th className="px-4 py-3 text-left">
                                        Location
                                    </th>

                                    <th className="px-4 py-3 text-left">
                                        Day
                                    </th>

                                    <th className="px-4 py-3 text-left">
                                        Date
                                    </th>

                                    <th className="px-4 py-3 text-left">
                                        Frequency
                                    </th>

                                    <th className="px-4 py-3 text-left">
                                        Time
                                    </th>

                                    <th className="px-4 py-3 text-left">
                                        Status
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {schedules.length >
                                0 ? (

                                    schedules.map(
                                        (
                                            schedule,
                                            index
                                        ) => {

                                            const leaderName =
                                                getScheduleLeaderName(
                                                    schedule
                                                );

                                            const leaderPhone =
                                                getScheduleLeaderPhone(
                                                    schedule
                                                );

                                            return (

                                                <tr
                                                    key={
                                                        schedule.schedule_id ||
                                                        `schedule-${index}`
                                                    }
                                                    className="border-b hover:bg-gray-50"
                                                >

                                                    <td className="px-4 py-4">
                                                        {
                                                            index +
                                                            1
                                                        }
                                                    </td>

                                                    <td className="px-4 py-4 font-semibold">
                                                        {
                                                            schedule.schedule_id
                                                        }
                                                    </td>

                                                    <td className="px-4 py-4">

                                                        <div className="font-semibold">
                                                            {
                                                                schedule.team_name ||
                                                                "Not Assigned"
                                                            }
                                                        </div>

                                                        {schedule.team_id && (
                                                            <div className="text-xs text-gray-500">
                                                                Team ID:{" "}
                                                                {
                                                                    schedule.team_id
                                                                }
                                                            </div>
                                                        )}

                                                    </td>

                                                    <td className="px-4 py-4">

                                                        <div className="font-semibold">
                                                            {
                                                                leaderName
                                                            }
                                                        </div>

                                                        {leaderPhone && (
                                                            <div className="text-xs text-gray-500">
                                                                {
                                                                    leaderPhone
                                                                }
                                                            </div>
                                                        )}

                                                    </td>

                                                    <td className="px-4 py-4">

                                                        <div>
                                                            {
                                                                schedule.kebele ||
                                                                "-"
                                                            }
                                                        </div>

                                                        <div className="text-xs text-gray-500">
                                                            {
                                                                schedule.sefer ||
                                                                "-"
                                                            }
                                                        </div>

                                                    </td>

                                                    <td className="px-4 py-4">
                                                        {
                                                            schedule.day_of_week ||
                                                            "-"
                                                        }
                                                    </td>

                                                    <td className="px-4 py-4">
                                                        {
                                                            formatDate(
                                                                schedule.initial_date
                                                            )
                                                        }
                                                    </td>

                                                    <td className="px-4 py-4">
                                                        {
                                                            schedule.frequency ||
                                                            "-"
                                                        }
                                                    </td>

                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        {
                                                            formatTime(
                                                                schedule.start_time
                                                            )
                                                        }
                                                        {" - "}
                                                        {
                                                            formatTime(
                                                                schedule.end_time
                                                            )
                                                        }
                                                    </td>

                                                    <td className="px-4 py-4">

                                                        <span
                                                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusClass(
                                                                schedule.status
                                                            )}`}
                                                        >
                                                            {
                                                                schedule.status ||
                                                                "-"
                                                            }
                                                        </span>

                                                    </td>

                                                </tr>

                                            );
                                        }
                                    )

                                ) : (

                                    <tr>

                                        <td
                                            colSpan="10"
                                            className="text-center py-8 text-gray-500"
                                        >
                                            No collection schedules found for the selected filters.
                                        </td>

                                    </tr>

                                )}

                            </tbody>

                        </table>

                    </div>

                </div>
            )}

        </div>
    );
};

export default Reports;
