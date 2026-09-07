
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
    // LOAD REQUESTS + SCHEDULES
    // ==========================================
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {

        try {

            setLoading(true);

            // Assigned requests
            const requestResponse =
                await collectorService.getAssignedRequests();

            const filteredRequests =
                (requestResponse.data || []).filter(
                    req =>
                        req.status === "Assigned" ||
                        req.status === "In Progress" ||
                        req.status === "Collected" ||
                        req.status === "Completed"
                );

            setRequests(filteredRequests);

            // Collector schedules
            const scheduleResponse =
                await collectorService.getCollectorSchedules();

            console.log(
                "COLLECTOR SCHEDULES:",
                scheduleResponse
            );

            setSchedules(
                scheduleResponse.data || []
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
                t("assignedCollections.messages.collectionStarted")
            );

            await loadData();

        } catch (error) {

            console.error(error);

            alert(
                error.response?.data?.message ||
                t("assignedCollections.errors.startCollectionFailed")
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
                t("assignedCollections.messages.collectionCompleted")
            );

            await loadData();

        } catch (error) {

            console.error(error);

            alert(
                error.response?.data?.message ||
                t("assignedCollections.errors.completeCollectionFailed")
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
                        {t("assignedCollections.empty.requests")}
                    </div>

                ) : (

                    <div className="grid gap-5">

                        {requests.map(request => (

                            <div
                                key={request.request_id}
                                className="bg-white shadow rounded-xl p-5 border"
                            >

                                <h2 className="text-xl font-bold">
                                    {request.business_name}
                                </h2>

                                <p>
                                    <strong>
                                        {t("assignedCollections.request.owner")}:
                                    </strong>{" "}
                                    {request.owner_name}
                                </p>

                                <p>
                                    <strong>
                                        {t("assignedCollections.request.phone")}:
                                    </strong>{" "}
                                    {request.phone_number || "-"}
                                </p>

                                <hr className="my-3" />

                                <p>
                                    📍{" "}
                                    <strong>
                                        {t("assignedCollections.request.kifleKetema")}:
                                    </strong>{" "}
                                    {request.kifle_ketema}
                                </p>

                                <p>
                                    <strong>
                                        {t("assignedCollections.request.kebele")}:
                                    </strong>{" "}
                                    {request.kebele}
                                </p>

                                <p>
                                    <strong>
                                        {t("assignedCollections.request.sefer")}:
                                    </strong>{" "}
                                    {request.sefer}
                                </p>

                                <p>
                                    <strong>
                                        {t("assignedCollections.request.description")}:
                                    </strong>{" "}
                                    {request.description || "-"}
                                </p>

                                <p>
                                    <strong>
                                        {t("assignedCollections.request.date")}:
                                    </strong>{" "}
                                    {request.preferred_collection_date
                                        ? new Date(
                                            request.preferred_collection_date
                                        ).toLocaleString()
                                        : "-"
                                    }
                                </p>

                                <div className="mt-4 flex gap-3 flex-wrap">

                                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">
                                        {request.status}
                                    </span>

                                    {request.status === "Assigned" && (

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
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
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

                                    {request.status === "In Progress" && (

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
                                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
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

                                    {request.status === "Collected" && (

                                        <span className="text-green-700 font-semibold">
                                            ✅{" "}
                                            {t(
                                                "assignedCollections.messages.waitingBusinessConfirmation"
                                            )}
                                        </span>

                                    )}

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

                        ))}

                    </div>

                )}

            </section>

            {/* =====================================
                COLLECTION SCHEDULES
            ====================================== */}

            <section>

                <h1 className="text-3xl font-bold mb-6">
                    {t("assignedCollections.schedule.title")}
                </h1>

                {schedules.length === 0 ? (

                    <div className="bg-white shadow rounded-xl p-6 text-gray-500">
                        {t("assignedCollections.empty.schedules")}
                    </div>

                ) : (

                    <div className="grid gap-5">

                        {schedules.map(schedule => (

                            <div
                                key={schedule.schedule_id}
                                className="bg-white shadow rounded-xl p-5 border"
                            >

                                <div className="flex justify-between items-start">

                                    <h2 className="text-xl font-bold">
                                        📅 {schedule.day_of_week}
                                    </h2>

                                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">
                                        {schedule.status}
                                    </span>

                                </div>

                                <hr className="my-3" />

                                <p>
                                    📍{" "}
                                    <strong>
                                        {t("assignedCollections.schedule.kifleKetema")}:
                                    </strong>{" "}
                                    {schedule.kifle_ketema}
                                </p>

                                <p>
                                    <strong>
                                        {t("assignedCollections.schedule.kebele")}:
                                    </strong>{" "}
                                    {schedule.kebele}
                                </p>

                                <p>
                                    <strong>
                                        {t("assignedCollections.schedule.sefer")}:
                                    </strong>{" "}
                                    {schedule.sefer}
                                </p>

                                <p>
                                    🕐{" "}
                                    <strong>
                                        {t("assignedCollections.schedule.time")}:
                                    </strong>{" "}
                                    {schedule.start_time} -{" "}
                                    {schedule.end_time}
                                </p>

                                <p>
                                    <strong>
                                        {t("assignedCollections.schedule.frequency")}:
                                    </strong>{" "}
                                    {schedule.frequency}
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
