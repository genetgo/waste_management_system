
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import collectorService from "../../services/collectorService";

const AssignedCollections = () => {
    const { t } = useTranslation();

    const [requests, setRequests] = useState([]);
    const [schedules, setSchedules] = useState([]);

    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);

    // ==========================================
    // CURRENT LOGGED-IN COLLECTOR
    // ==========================================
    const storedUser = localStorage.getItem("user");

    let currentUser = null;

    try {
        currentUser = storedUser
            ? JSON.parse(storedUser)
            : null;
    } catch (error) {
        console.error("USER PARSE ERROR:", error);
        currentUser = null;
    }

    const currentCollectorId =
        Number(
            currentUser?.id ||
            currentUser?.collector_id ||
            currentUser?.user_id
        );

    // ==========================================
    // LOAD REQUESTS + SCHEDULES
    // ==========================================
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);

            // ==========================================
            // ASSIGNED REQUESTS
            // ==========================================
            const requestResponse =
                await collectorService.getAssignedRequests();

            console.log(
                "COLLECTOR ASSIGNED REQUESTS:",
                requestResponse
            );

            const requestData =
                requestResponse?.data?.data ||
                requestResponse?.data ||
                [];

            const filteredRequests =
                (Array.isArray(requestData)
                    ? requestData
                    : []
                ).filter(
                    (req) =>
                        req.status === "Assigned" ||
                        req.status === "In Progress" ||
                        req.status === "Collected" ||
                        req.status === "Completed"
                );

            console.log(
                "FILTERED ASSIGNED REQUESTS:",
                filteredRequests
            );

            setRequests(filteredRequests);

            // ==========================================
            // COLLECTOR SCHEDULES
            // ==========================================
            const scheduleResponse =
                await collectorService.getCollectorSchedules();

            console.log(
                "COLLECTOR SCHEDULES:",
                scheduleResponse
            );

            const scheduleData =
                scheduleResponse?.data?.data ||
                scheduleResponse?.data ||
                [];

            setSchedules(
                Array.isArray(scheduleData)
                    ? scheduleData
                    : []
            );

        } catch (error) {
            console.error(
                "Assigned Collections Error:",
                error
            );
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // START COLLECTION
    // ==========================================
    const startCollection = async (requestId) => {
        try {
            setUpdatingId(requestId);

            await collectorService.startCollection(
                requestId
            );

            alert(
                t(
                    "assignedCollections.messages.collectionStarted"
                )
            );

            await loadData();

        } catch (error) {
            console.error(error);

            alert(
                error.response?.data?.message ||
                t(
                    "assignedCollections.errors.startCollectionFailed"
                )
            );

        } finally {
            setUpdatingId(null);
        }
    };

    // ==========================================
    // COMPLETE COLLECTION
    // ==========================================
    const completeCollection = async (requestId) => {
        try {
            setUpdatingId(requestId);

            await collectorService.completeCollection(
                requestId
            );

            alert(
                t(
                    "assignedCollections.messages.collectionCompleted"
                )
            );

            await loadData();

        } catch (error) {
            console.error(error);

            alert(
                error.response?.data?.message ||
                t(
                    "assignedCollections.errors.completeCollectionFailed"
                )
            );

        } finally {
            setUpdatingId(null);
        }
    };

    // ==========================================
    // LOADING
    // ==========================================
    if (loading) {
        return (
            <div className="p-6">
                {t("assignedCollections.loading")}
            </div>
        );
    }

    return (
        <div className="p-6 space-y-8">

            {/* =====================================
                ASSIGNED REQUESTS
            ====================================== */}
            <section>

                <h1 className="text-3xl font-bold mb-6">
                    {t("assignedCollections.title")}
                </h1>

                {requests.length === 0 ? (

                    <div className="bg-white shadow rounded-xl p-6 text-gray-500">
                        {t(
                            "assignedCollections.empty.requests"
                        )}
                    </div>

                ) : (

                    <div className="grid gap-5">

                        {requests.map((request) => {

                            // ==========================================
                            // CHECK TEAM LEADER / DRIVER
                            // ==========================================
                            const isTeamLeader =
                                Number(request.team_leader_id) ===
                                currentCollectorId;

                            // ==========================================
                            // REMOVE LEADER FROM MEMBER LIST
                            // SO HE/SHE DOES NOT APPEAR TWICE
                            // ==========================================
                            const teamMembers =
                                Array.isArray(request.team_members)
                                    ? request.team_members.filter(
                                        (member) =>
                                            Number(
                                                member.collector_id
                                            ) !==
                                            Number(
                                                request.team_leader_id
                                            )
                                    )
                                    : [];

                            return (

                                <div
                                    key={request.request_id}
                                    className="bg-white shadow rounded-xl p-5 border"
                                >

                                    {/* =================================
                                        BUSINESS
                                    ================================== */}

                                    <h2 className="text-xl font-bold">
                                        {request.business_name || "-"}
                                    </h2>

                                    <p>
                                        <strong>
                                            {t(
                                                "assignedCollections.request.owner"
                                            )}:
                                        </strong>{" "}
                                        {request.owner_name || "-"}
                                    </p>

                                    <p>
                                        <strong>
                                            {t(
                                                "assignedCollections.request.phone"
                                            )}:
                                        </strong>{" "}
                                        {request.phone_number || "-"}
                                    </p>

                                    <hr className="my-3" />

                                    {/* =================================
                                        LOCATION
                                    ================================== */}

                                    <p>
                                        📍{" "}
                                        <strong>
                                            {t(
                                                "assignedCollections.request.kifleKetema"
                                            )}:
                                        </strong>{" "}
                                        {request.kifle_ketema || "-"}
                                    </p>

                                    <p>
                                        <strong>
                                            {t(
                                                "assignedCollections.request.kebele"
                                            )}:
                                        </strong>{" "}
                                        {request.kebele || "-"}
                                    </p>

                                    <p>
                                        <strong>
                                            {t(
                                                "assignedCollections.request.sefer"
                                            )}:
                                        </strong>{" "}
                                        {request.sefer || "-"}
                                    </p>

                                    {/* =================================
                                        HOUSE NUMBER
                                    ================================== */}

                                    <p>
                                        <strong>
                                            {t(
                                                "assignedCollections.request.houseNumber"
                                            ) || "House Number"}:
                                        </strong>{" "}
                                        {request.house_number || "-"}
                                    </p>

                                    {/* =================================
                                        DESCRIPTION
                                    ================================== */}

                                    <p>
                                        <strong>
                                            {t(
                                                "assignedCollections.request.description"
                                            )}:
                                        </strong>{" "}
                                        {request.description || "-"}
                                    </p>

                                    {/* =================================
                                        DATE
                                    ================================== */}

                                    <p>
                                        <strong>
                                            {t(
                                                "assignedCollections.request.date"
                                            )}:
                                        </strong>{" "}
                                        {request.preferred_collection_date
                                            ? new Date(
                                                request.preferred_collection_date
                                            ).toLocaleDateString()
                                            : "-"
                                        }
                                    </p>

                                    {/* =================================
                                        COLLECTION TEAM
                                    ================================== */}

                                    {request.team_id && (

                                        <div className="mt-5 border-t pt-4">

                                            <h3 className="text-lg font-bold text-gray-800 mb-3">
                                                👥 Collection Team
                                            </h3>

                                            <div className="bg-gray-50 rounded-lg p-4">

                                                {/* TEAM NAME */}

                                                <p className="font-semibold mb-3">
                                                    Team:{" "}
                                                    <span className="font-normal">
                                                        {request.team_name || "-"}
                                                    </span>
                                                </p>

                                                {/* =================================
                                                    TEAM LEADER / DRIVER
                                                ================================== */}

                                                <div className="border-t pt-3 mt-3">

                                                    <h4 className="font-bold text-blue-700 mb-2">
                                                        🚛 Team Leader / Driver
                                                    </h4>

                                                    <div className="bg-white border rounded-lg p-3">

                                                        <p>
                                                            <strong>
                                                                Name:
                                                            </strong>{" "}
                                                            {request.team_leader_name || "-"}
                                                        </p>

                                                        <p>
                                                            <strong>
                                                                Phone:
                                                            </strong>{" "}
                                                            {request.team_leader_phone || "-"}
                                                        </p>

                                                        <p>
                                                            <strong>
                                                                Email:
                                                            </strong>{" "}
                                                            {request.team_leader_email || "-"}
                                                        </p>

                                                        {/* CURRENT USER ROLE */}

                                                        {isTeamLeader ? (

                                                            <span className="inline-block mt-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                                                                You are the Team Leader / Driver
                                                            </span>

                                                        ) : (

                                                            <span className="inline-block mt-2 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-semibold">
                                                                Team Leader / Driver
                                                            </span>

                                                        )}

                                                    </div>

                                                </div>

                                                {/* =================================
                                                    TEAM MEMBERS
                                                ================================== */}

                                                <div className="border-t pt-3 mt-4">

                                                    <h4 className="font-bold text-green-700 mb-3">
                                                        👤 Team Members
                                                    </h4>

                                                    {teamMembers.length > 0 ? (

                                                        <div className="space-y-3">

                                                            {teamMembers.map(
                                                                (member) => (

                                                                    <div
                                                                        key={
                                                                            member.collector_id
                                                                        }
                                                                        className="bg-white border rounded-lg p-3"
                                                                    >

                                                                        <p>
                                                                            <strong>
                                                                                Name:
                                                                            </strong>{" "}
                                                                            {member.full_name ||
                                                                                "-"}
                                                                        </p>

                                                                        <p>
                                                                            <strong>
                                                                                Phone:
                                                                            </strong>{" "}
                                                                            {member.phone_number ||
                                                                                "-"}
                                                                        </p>

                                                                        <p>
                                                                            <strong>
                                                                                Email:
                                                                            </strong>{" "}
                                                                            {member.email ||
                                                                                "-"}
                                                                        </p>

                                                                        <p>
                                                                            <strong>
                                                                                Kifle Ketema:
                                                                            </strong>{" "}
                                                                            {member.assigned_kifle_ketema ||
                                                                                "-"}
                                                                        </p>

                                                                        <p>
                                                                            <strong>
                                                                                Kebele:
                                                                            </strong>{" "}
                                                                            {member.kebele ||
                                                                                "-"}
                                                                        </p>

                                                                    </div>

                                                                )
                                                            )}

                                                        </div>

                                                    ) : (

                                                        <p className="text-gray-500">
                                                            No other team members assigned.
                                                        </p>

                                                    )}

                                                </div>

                                            </div>

                                        </div>

                                    )}

                                    {/* =================================
                                        STATUS + ACTIONS
                                    ================================== */}

                                    <div className="mt-4 flex gap-3 flex-wrap">

                                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">
                                            {request.status}
                                        </span>

                                        {/* =================================
                                            LEADER / DRIVER ONLY
                                            ASSIGNED → START
                                        ================================== */}

                                        {isTeamLeader &&
                                        request.status === "Assigned" && (

                                            <button
                                                disabled={
                                                    updatingId ===
                                                    request.request_id
                                                }
                                                onClick={() =>
                                                    startCollection(
                                                        request.request_id
                                                    )
                                                }
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:bg-gray-400"
                                            >

                                                {updatingId ===
                                                request.request_id
                                                    ? t(
                                                        "assignedCollections.actions.updating"
                                                    )
                                                    : t(
                                                        "assignedCollections.actions.startCollection"
                                                    )
                                                }

                                            </button>

                                        )}

                                        {/* =================================
                                            LEADER / DRIVER ONLY
                                            IN PROGRESS → COMPLETE
                                        ================================== */}

                                        {isTeamLeader &&
                                        request.status === "In Progress" && (

                                            <button
                                                disabled={
                                                    updatingId ===
                                                    request.request_id
                                                }
                                                onClick={() =>
                                                    completeCollection(
                                                        request.request_id
                                                    )
                                                }
                                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg disabled:bg-gray-400"
                                            >

                                                {updatingId ===
                                                request.request_id
                                                    ? t(
                                                        "assignedCollections.actions.updating"
                                                    )
                                                    : t(
                                                        "assignedCollections.actions.completeCollection"
                                                    )
                                                }

                                            </button>

                                        )}

                                      

                                        {/* =================================
                                            COLLECTED
                                        ================================== */}

                                        {request.status === "Collected" && (

                                            <span className="text-green-700 font-semibold">
                                                ✅{" "}
                                                {t(
                                                    "assignedCollections.messages.waitingBusinessConfirmation"
                                                )}
                                            </span>

                                        )}

                                        {/* =================================
                                            COMPLETED
                                        ================================== */}

                                        {request.status === "Completed" && (

                                            <span className="text-blue-700 font-semibold">
                                                ✔{" "}
                                                {t(
                                                    "assignedCollections.messages.collectionCompletedStatus"
                                                )}
                                            </span>

                                        )}

                                    </div>

                                </div>

                            );

                        })}

                    </div>

                )}

            </section>

            {/* =====================================
                COLLECTION SCHEDULES
            ====================================== */}

            <section>

                <h1 className="text-3xl font-bold mb-6">
                    {t(
                        "assignedCollections.schedule.title"
                    )}
                </h1>

                {schedules.length === 0 ? (

                    <div className="bg-white shadow rounded-xl p-6 text-gray-500">
                        {t(
                            "assignedCollections.empty.schedules"
                        )}
                    </div>

                ) : (

                    <div className="grid gap-5">

                        {schedules.map((schedule) => (

                            <div
                                key={schedule.schedule_id}
                                className="bg-white shadow rounded-xl p-5 border"
                            >

                                <div className="flex justify-between items-start">

                                    <h2 className="text-xl font-bold">
                                        📅{" "}
                                        {schedule.day_of_week}
                                    </h2>

                                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">
                                        {schedule.status}
                                    </span>

                                </div>

                                <hr className="my-3" />

                                <p>
                                    📍{" "}
                                    <strong>
                                        {t(
                                            "assignedCollections.schedule.kifleKetema"
                                        )}:
                                    </strong>{" "}
                                    {schedule.kifle_ketema || "-"}
                                </p>

                                <p>
                                    <strong>
                                        {t(
                                            "assignedCollections.schedule.kebele"
                                        )}:
                                    </strong>{" "}
                                    {schedule.kebele || "-"}
                                </p>

                                <p>
                                    <strong>
                                        {t(
                                            "assignedCollections.schedule.sefer"
                                        )}:
                                    </strong>{" "}
                                    {schedule.sefer || "-"}
                                </p>

                                <p>
                                    🕐{" "}
                                    <strong>
                                        {t(
                                            "assignedCollections.schedule.time"
                                        )}:
                                    </strong>{" "}
                                    {schedule.start_time || "-"} -{" "}
                                    {schedule.end_time || "-"}
                                </p>

                                <p>
                                    <strong>
                                        {t(
                                            "assignedCollections.schedule.frequency"
                                        )}:
                                    </strong>{" "}
                                    {schedule.frequency || "-"}
                                </p>

                            </div>

                        ))}

                    </div>

                )}

            </section>

        </div>
    );
};

export default AssignedCollections;
