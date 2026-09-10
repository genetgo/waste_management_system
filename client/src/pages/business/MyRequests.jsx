// src/pages/business/MyRequests.jsx

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import businessService from "../../services/businessService";

const MyRequests = () => {
    const { t } = useTranslation();

    // ==========================================
    // STATES
    // ==========================================

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);

    // ==========================================
    // LOAD MY REQUESTS
    // ==========================================

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        try {
            setLoading(true);

            const response =
                await businessService.getMyRequests();

            console.log(
                "MY REQUESTS RESPONSE:",
                response
            );

            const data = Array.isArray(response?.data)
                ? response.data
                : Array.isArray(response?.data?.data)
                    ? response.data.data
                    : Array.isArray(response?.data?.requests)
                        ? response.data.requests
                        : [];

            console.log(
                "MY REQUESTS DATA:",
                data
            );

            setRequests(data);

        } catch (error) {
            console.error(
                "Failed to load requests:",
                error
            );

            console.error(
                "REQUEST ERROR RESPONSE:",
                error?.response?.data
            );

            setRequests([]);

        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // CONFIRM COLLECTION
    // Collected -> Completed
    // ==========================================

    const confirmCollection = async (requestId) => {
        try {
            setUpdatingId(requestId);

            const response =
                await businessService.confirmCompletion(
                    requestId
                );

            alert(
                response?.message ||
                t(
                    "myRequests.messages.collectionConfirmed"
                )
            );

            await loadRequests();

        } catch (error) {
            console.error(
                "Confirm Collection Error:",
                error
            );

            console.error(
                "Confirm Response:",
                error?.response?.data
            );

            alert(
                error?.response?.data?.message ||
                t(
                    "myRequests.messages.confirmFailed"
                )
            );

        } finally {
            setUpdatingId(null);
        }
    };

    // ==========================================
    // FORMAT DATE
    // ==========================================

    const formatDate = (date) => {
        if (!date) {
            return t(
                "myRequests.common.notAvailable",
                {
                    defaultValue: "-"
                }
            );
        }

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return t(
                "myRequests.common.notAvailable",
                {
                    defaultValue: "-"
                }
            );
        }

        return parsedDate.toLocaleDateString();
    };

    // ==========================================
    // GET HOUSE NUMBER
    // ==========================================

    const getHouseNumber = (request) => {
        const houseNumber =
            request?.house_number ??
            request?.houseNumber ??
            request?.house_no ??
            request?.houseNo;

        if (
            houseNumber === undefined ||
            houseNumber === null ||
            String(houseNumber).trim() === ""
        ) {
            return t(
                "myRequests.common.notAvailable",
                {
                    defaultValue: "-"
                }
            );
        }

        return String(houseNumber).trim();
    };

    // ==========================================
    // GET REJECTION REASON
    // ==========================================

    const getRejectionReason = (request) => {
        const reason =
            request?.rejection_reason ??
            request?.reject_description ??
            request?.rejection_description;

        if (
            reason === undefined ||
            reason === null ||
            String(reason).trim() === ""
        ) {
            return null;
        }

        return String(reason).trim();
    };

    // ==========================================
    // STATUS STYLE
    // ==========================================

    const getStatusStyle = (status) => {
        switch (status) {
            case "Pending":
                return "bg-yellow-100 text-yellow-700";

            case "Approved":
                return "bg-blue-100 text-blue-700";

            case "Assigned":
                return "bg-indigo-100 text-indigo-700";

            case "In Progress":
                return "bg-purple-100 text-purple-700";

            case "Collected":
                return "bg-green-100 text-green-700";

            case "Completed":
                return "bg-emerald-100 text-emerald-700";

            case "Rejected":
                return "bg-red-100 text-red-700";

            case "Cancelled":
                return "bg-gray-200 text-gray-700";

            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    // ==========================================
    // STATUS LABEL
    // ==========================================

    const getStatusLabel = (status) => {
        const statusKeys = {
            Pending: "pending",
            Approved: "approved",
            Assigned: "assigned",
            "In Progress": "inProgress",
            Collected: "collected",
            Completed: "completed",
            Rejected: "rejected",
            Cancelled: "cancelled",
        };

        const key = statusKeys[status];

        return key
            ? t(`myRequests.status.${key}`, {
                defaultValue: status
            })
            : status;
    };

    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {
        return (
            <div className="min-h-[300px] flex items-center justify-center">
                <div className="text-gray-500 text-lg">
                    {t(
                        "myRequests.common.loading",
                        {
                            defaultValue: "Loading..."
                        }
                    )}
                </div>
            </div>
        );
    }

    // ==========================================
    // PAGE
    // ==========================================

    return (
        <div className="p-4 md:p-6">

            {/* HEADER */}

            <div className="mb-6">

                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                    {t(
                        "myRequests.title",
                        {
                            defaultValue:
                                "My Collection Requests"
                        }
                    )}
                </h1>

                <p className="text-gray-500 mt-1">
                    {t(
                        "myRequests.subtitle",
                        {
                            defaultValue:
                                "View your submitted waste collection requests and their status."
                        }
                    )}
                </p>

            </div>

            {/* EMPTY */}

            {requests.length === 0 ? (

                <div className="bg-white rounded-xl shadow border p-8 text-center">

                    <div className="text-4xl mb-3">
                        📋
                    </div>

                    <p className="text-lg font-semibold text-gray-700 mb-1">
                        {t(
                            "myRequests.empty.title",
                            {
                                defaultValue:
                                    "No requests found"
                            }
                        )}
                    </p>

                    <p className="text-gray-500">
                        {t(
                            "myRequests.empty.description",
                            {
                                defaultValue:
                                    "You have not submitted any collection requests yet."
                            }
                        )}
                    </p>

                </div>

            ) : (

                <div className="grid gap-5">

                    {requests.map((request) => {

                        const rejectionReason =
                            getRejectionReason(request);

                        const houseNumber =
                            getHouseNumber(request);

                        return (

                            <div
                                key={request.request_id}
                                className="
                                    bg-white
                                    rounded-xl
                                    shadow-sm
                                    border
                                    border-gray-200
                                    p-5
                                    hover:shadow-md
                                    transition
                                "
                            >

                                {/* ================================= */}
                                {/* TOP SECTION */}
                                {/* ================================= */}

                                <div
                                    className="
                                        flex
                                        flex-col
                                        sm:flex-row
                                        sm:items-center
                                        sm:justify-between
                                        gap-3
                                    "
                                >

                                    

                                    <span
                                        className={`
                                            inline-flex
                                            w-fit
                                            px-3
                                            py-1
                                            rounded-full
                                            text-sm
                                            font-semibold
                                            ${getStatusStyle(
                                                request.status
                                            )}
                                        `}
                                    >
                                        {getStatusLabel(
                                            request.status
                                        )}
                                    </span>

                                </div>

                                <hr className="my-5" />

                                {/* ================================= */}
                                {/* REQUEST INFORMATION */}
                                {/* ================================= */}

                                <div
                                    className="
                                        grid
                                        grid-cols-1
                                        sm:grid-cols-2
                                        lg:grid-cols-3
                                        xl:grid-cols-4
                                        gap-5
                                    "
                                >

                                    {/* KIFLE KETEMA */}

                                    <div className="bg-gray-50 rounded-lg p-3">

                                        <p className="text-xs text-gray-500 uppercase font-semibold">
                                            {t(
                                                "myRequests.fields.kifleKetema",
                                                {
                                                    defaultValue:
                                                        "Kifle Ketema"
                                                }
                                            )}
                                        </p>

                                        <p className="font-semibold text-gray-800 mt-1">
                                            {request.kifle_ketema ||
                                                t(
                                                    "myRequests.common.notAvailable",
                                                    {
                                                        defaultValue: "-"
                                                    }
                                                )}
                                        </p>

                                    </div>

                                    {/* KEBELE */}

                                    <div className="bg-gray-50 rounded-lg p-3">

                                        <p className="text-xs text-gray-500 uppercase font-semibold">
                                            {t(
                                                "myRequests.fields.kebele",
                                                {
                                                    defaultValue:
                                                        "Kebele"
                                                }
                                            )}
                                        </p>

                                        <p className="font-semibold text-gray-800 mt-1">
                                            {request.kebele ||
                                                t(
                                                    "myRequests.common.notAvailable",
                                                    {
                                                        defaultValue: "-"
                                                    }
                                                )}
                                        </p>

                                    </div>

                                    {/* SEFER */}

                                    <div className="bg-gray-50 rounded-lg p-3">

                                        <p className="text-xs text-gray-500 uppercase font-semibold">
                                            {t(
                                                "myRequests.fields.sefer",
                                                {
                                                    defaultValue:
                                                        "Sefer"
                                                }
                                            )}
                                        </p>

                                        <p className="font-semibold text-gray-800 mt-1">
                                            {request.sefer ||
                                                t(
                                                    "myRequests.common.notAvailable",
                                                    {
                                                        defaultValue: "-"
                                                    }
                                                )}
                                        </p>

                                    </div>

                                    {/* HOUSE NUMBER */}

                                    <div className="bg-gray-50 rounded-lg p-3">

                                        <p className="text-xs text-gray-500 uppercase font-semibold">
                                            {t(
                                                "myRequests.fields.houseNumber",
                                                {
                                                    defaultValue:
                                                        "House Number"
                                                }
                                            )}
                                        </p>

                                        <p className="font-semibold text-gray-800 mt-1">
                                            {houseNumber}
                                        </p>

                                    </div>

                                    {/* COLLECTION DATE */}

                                    <div className="bg-gray-50 rounded-lg p-3">

                                        <p className="text-xs text-gray-500 uppercase font-semibold">
                                            {t(
                                                "myRequests.fields.collectionDate",
                                                {
                                                    defaultValue:
                                                        "Collection Date"
                                                }
                                            )}
                                        </p>

                                        <p className="font-semibold text-gray-800 mt-1">
                                            {formatDate(
                                                request.preferred_collection_date
                                            )}
                                        </p>

                                    </div>

                                    {/* REQUEST DATE */}

                                    <div className="bg-gray-50 rounded-lg p-3">

                                        <p className="text-xs text-gray-500 uppercase font-semibold">
                                            {t(
                                                "myRequests.fields.requestDate",
                                                {
                                                    defaultValue:
                                                        "Request Date"
                                                }
                                            )}
                                        </p>

                                        <p className="font-semibold text-gray-800 mt-1">
                                            {formatDate(
                                                request.created_at ||
                                                request.request_date
                                            )}
                                        </p>

                                    </div>

                                </div>

                                {/* ================================= */}
                                {/* REJECTION REASON */}
                                {/* ================================= */}

                                {request.status === "Rejected" && (

                                    <div
                                        className="
                                            mt-5
                                            bg-red-50
                                            border
                                            border-red-200
                                            rounded-xl
                                            p-4
                                        "
                                    >

                                        <div className="flex items-center gap-2 mb-2">

                                            <span className="text-red-600 text-lg">
                                                ⚠️
                                            </span>

                                            <h3 className="text-lg font-bold text-red-800">
                                                {t(
                                                    "myRequests.fields.rejectionReason",
                                                    {
                                                        defaultValue:
                                                            "Rejection Reason"
                                                    }
                                                )}
                                            </h3>

                                        </div>

                                        <p
                                            className="
                                                text-red-700
                                                bg-white
                                                border
                                                border-red-100
                                                rounded-lg
                                                p-3
                                                whitespace-pre-wrap
                                            "
                                        >
                                            {rejectionReason ||
                                                t(
                                                    "myRequests.common.notAvailable",
                                                    {
                                                        defaultValue: "-"
                                                    }
                                                )}
                                        </p>

                                    </div>

                                )}

                                {/* ================================= */}
                                {/* COLLECTOR INFORMATION */}
                                {/* ================================= */}

                                <div
                                    className="
                                        mt-5
                                        bg-indigo-50
                                        border
                                        border-indigo-100
                                        rounded-xl
                                        p-4
                                    "
                                >

                                    <h3 className="text-lg font-bold text-indigo-800 mb-3">
                                        👷{" "}
                                        {t(
                                            "myRequests.collector.title",
                                            {
                                                defaultValue:
                                                    "Assigned Collector"
                                            }
                                        )}
                                    </h3>

                                    <div
                                        className="
                                            grid
                                            grid-cols-1
                                            sm:grid-cols-2
                                            gap-4
                                        "
                                    >

                                        {/* COLLECTOR NAME */}

                                        <div>

                                            <p className="text-xs text-gray-500 uppercase font-semibold">
                                                {t(
                                                    "myRequests.fields.collectorName",
                                                    {
                                                        defaultValue:
                                                            "Collector Name"
                                                    }
                                                )}
                                            </p>

                                            <p className="font-semibold text-gray-800 mt-1">
                                                {request.collector_name ||
                                                    t(
                                                        "myRequests.common.notAvailable",
                                                        {
                                                            defaultValue:
                                                                "-"
                                                        }
                                                    )}
                                            </p>

                                        </div>

                                        {/* COLLECTOR PHONE */}

                                        <div>

                                            <p className="text-xs text-gray-500 uppercase font-semibold">
                                                {t(
                                                    "myRequests.fields.collectorPhone",
                                                    {
                                                        defaultValue:
                                                            "Collector Phone"
                                                    }
                                                )}
                                            </p>

                                            <p className="font-semibold text-gray-800 mt-1">
                                                {request.collector_phone ||
                                                    t(
                                                        "myRequests.common.notAvailable",
                                                        {
                                                            defaultValue:
                                                                "-"
                                                        }
                                                    )}
                                            </p>

                                        </div>

                                    </div>

                                </div>

                                {/* ================================= */}
                                {/* ACTIONS */}
                                {/* ================================= */}

                                <div
                                    className="
                                        mt-5
                                        flex
                                        flex-wrap
                                        items-center
                                        gap-3
                                    "
                                >

                                    {/* COLLECTED */}

                                    {request.status === "Collected" && (

                                        <>
                                            <span
                                                className="
                                                    bg-green-100
                                                    text-green-700
                                                    px-3
                                                    py-2
                                                    rounded-lg
                                                    font-semibold
                                                "
                                            >
                                                ✅{" "}
                                                {t(
                                                    "myRequests.actions.collectionFinished",
                                                    {
                                                        defaultValue:
                                                            "Collection Finished"
                                                    }
                                                )}
                                            </span>

                                            <button
                                                onClick={() =>
                                                    confirmCollection(
                                                        request.request_id
                                                    )
                                                }
                                                disabled={
                                                    updatingId ===
                                                    request.request_id
                                                }
                                                className="
                                                    bg-green-600
                                                    hover:bg-green-700
                                                    disabled:bg-gray-400
                                                    text-white
                                                    px-5
                                                    py-2
                                                    rounded-lg
                                                    font-semibold
                                                    transition
                                                "
                                            >
                                                {updatingId ===
                                                request.request_id
                                                    ? t(
                                                        "myRequests.actions.confirming",
                                                        {
                                                            defaultValue:
                                                                "Confirming..."
                                                        }
                                                    )
                                                    : t(
                                                        "myRequests.actions.confirmCollection",
                                                        {
                                                            defaultValue:
                                                                "Confirm Collection"
                                                        }
                                                    )}
                                            </button>
                                        </>

                                    )}

                                    {/* COMPLETED */}

                                    {request.status === "Completed" && (

                                        <div
                                            className="
                                                w-full
                                                bg-emerald-50
                                                border
                                                border-emerald-200
                                                rounded-lg
                                                p-3
                                            "
                                        >

                                            <span className="text-emerald-700 font-semibold">
                                                ✔{" "}
                                                {t(
                                                    "myRequests.actions.collectionCompleted",
                                                    {
                                                        defaultValue:
                                                            "Collection Completed"
                                                    }
                                                )}
                                            </span>

                                        </div>

                                    )}

                                    {/* ASSIGNED */}

                                    {request.status === "Assigned" && (

                                        <span
                                            className="
                                                text-indigo-700
                                                bg-indigo-50
                                                px-4
                                                py-2
                                                rounded-lg
                                                font-semibold
                                            "
                                        >
                                            👷{" "}
                                            {t(
                                                "myRequests.actions.collectorAssigned",
                                                {
                                                    defaultValue:
                                                        "Collector Assigned"
                                                }
                                            )}
                                        </span>

                                    )}

                                    {/* IN PROGRESS */}

                                    {request.status === "In Progress" && (

                                        <span
                                            className="
                                                text-purple-700
                                                bg-purple-50
                                                px-4
                                                py-2
                                                rounded-lg
                                                font-semibold
                                            "
                                        >
                                            🚛{" "}
                                            {t(
                                                "myRequests.actions.collectionInProgress",
                                                {
                                                    defaultValue:
                                                        "Collection In Progress"
                                                }
                                            )}
                                        </span>

                                    )}

                                    {/* PENDING */}

                                    {request.status === "Pending" && (

                                        <span
                                            className="
                                                text-yellow-700
                                                bg-yellow-50
                                                px-4
                                                py-2
                                                rounded-lg
                                                font-semibold
                                            "
                                        >
                                            ⏳{" "}
                                            {t(
                                                "myRequests.actions.waitingApproval",
                                                {
                                                    defaultValue:
                                                        "Waiting for Approval"
                                                }
                                            )}
                                        </span>

                                    )}

                                    {/* APPROVED */}

                                    {request.status === "Approved" && (

                                        <span
                                            className="
                                                text-blue-700
                                                bg-blue-50
                                                px-4
                                                py-2
                                                rounded-lg
                                                font-semibold
                                            "
                                        >
                                            ✓{" "}
                                            {t(
                                                "myRequests.actions.requestApproved",
                                                {
                                                    defaultValue:
                                                        "Request Approved"
                                                }
                                            )}
                                        </span>

                                    )}

                                    {/* REJECTED */}

                                    {request.status === "Rejected" && (

                                        <span
                                            className="
                                                text-red-700
                                                bg-red-50
                                                px-4
                                                py-2
                                                rounded-lg
                                                font-semibold
                                            "
                                        >
                                            ✕{" "}
                                            {t(
                                                "myRequests.actions.requestRejected",
                                                {
                                                    defaultValue:
                                                        "Request Rejected"
                                                }
                                            )}
                                        </span>

                                    )}

                                    {/* CANCELLED */}

                                    {request.status === "Cancelled" && (

                                        <span
                                            className="
                                                text-gray-700
                                                bg-gray-100
                                                px-4
                                                py-2
                                                rounded-lg
                                                font-semibold
                                            "
                                        >
                                            {t(
                                                "myRequests.actions.requestCancelled",
                                                {
                                                    defaultValue:
                                                        "Request Cancelled"
                                                }
                                            )}
                                        </span>

                                    )}

                                </div>

                            </div>
                        );
                    })}

                </div>
            )}

        </div>
    );
};

export default MyRequests;