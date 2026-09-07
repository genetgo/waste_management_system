
// src/pages/business/MyRequests.jsx

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import businessService from "../../services/businessService";

const MyRequests = () => {

    // ==========================================
    // TRANSLATION
    // ==========================================

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

            setRequests(
                response?.data || []
            );

        } catch (error) {

            console.error(
                "Failed to load requests:",
                error
            );

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
                t("myRequests.messages.collectionConfirmed")
            );

            await loadRequests();

        } catch (error) {

            console.error(
                "Confirm Collection Error:",
                error
            );

            alert(
                error?.response?.data?.message ||
                t("myRequests.messages.confirmFailed")
            );

        } finally {

            setUpdatingId(null);

        }

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

            Cancelled: "cancelled"

        };


        const key =
            statusKeys[status];


        return key
            ? t(`myRequests.status.${key}`)
            : status;

    };


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (

            <div className="
                min-h-[300px]
                flex
                items-center
                justify-center
            ">

                <div className="
                    text-gray-500
                    text-lg
                ">

                    {t("myRequests.common.loading")}

                </div>

            </div>

        );

    }


    // ==========================================
    // PAGE
    // ==========================================

    return (

        <div className="
            p-4
            md:p-6
        ">


            {/* ================================= */}
            {/* HEADER */}
            {/* ================================= */}

            <div className="mb-6">

                <h1 className="
                    text-2xl
                    md:text-3xl
                    font-bold
                    text-gray-800
                ">

                    {t("myRequests.title")}

                </h1>


                <p className="
                    text-gray-500
                    mt-1
                ">

                    {t("myRequests.subtitle")}

                </p>

            </div>


            {/* ================================= */}
            {/* EMPTY */}
            {/* ================================= */}

            {requests.length === 0 ? (

                <div className="
                    bg-white
                    rounded-xl
                    shadow
                    border
                    p-8
                    text-center
                ">

                    <div className="
                        text-4xl
                        mb-3
                    ">
                        📋
                    </div>


                    <p className="
                        text-lg
                        font-semibold
                        text-gray-700
                        mb-1
                    ">

                        {t("myRequests.empty.title")}

                    </p>


                    <p className="
                        text-gray-500
                    ">

                        {t("myRequests.empty.description")}

                    </p>

                </div>

            ) : (

                /* ================================= */
                /* REQUEST CARDS */
                /* ================================= */

                <div className="grid gap-5">

                    {requests.map((request) => (

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

                            <div className="
                                flex
                                flex-col
                                sm:flex-row
                                sm:items-center
                                sm:justify-between
                                gap-3
                            ">


                                {/* STATUS */}

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

                            <div className="
                                grid
                                grid-cols-1
                                sm:grid-cols-2
                                lg:grid-cols-4
                                gap-5
                            ">


                                {/* KIFLE KETEMA */}

                                <div className="
                                    bg-gray-50
                                    rounded-lg
                                    p-3
                                ">

                                    <p className="
                                        text-xs
                                        text-gray-500
                                        uppercase
                                        font-semibold
                                    ">

                                        {t(
                                            "myRequests.fields.kifleKetema"
                                        )}

                                    </p>


                                    <p className="
                                        font-semibold
                                        text-gray-800
                                        mt-1
                                    ">

                                        {request.kifle_ketema ||
                                            t(
                                                "myRequests.common.notAvailable"
                                            )}

                                    </p>

                                </div>


                                {/* KEBELE */}

                                <div className="
                                    bg-gray-50
                                    rounded-lg
                                    p-3
                                ">

                                    <p className="
                                        text-xs
                                        text-gray-500
                                        uppercase
                                        font-semibold
                                    ">

                                        {t(
                                            "myRequests.fields.kebele"
                                        )}

                                    </p>


                                    <p className="
                                        font-semibold
                                        text-gray-800
                                        mt-1
                                    ">

                                        {request.kebele ||
                                            t(
                                                "myRequests.common.notAvailable"
                                            )}

                                    </p>

                                </div>


                                {/* SEFER */}

                                <div className="
                                    bg-gray-50
                                    rounded-lg
                                    p-3
                                ">

                                    <p className="
                                        text-xs
                                        text-gray-500
                                        uppercase
                                        font-semibold
                                    ">

                                        {t(
                                            "myRequests.fields.sefer"
                                        )}

                                    </p>


                                    <p className="
                                        font-semibold
                                        text-gray-800
                                        mt-1
                                    ">

                                        {request.sefer ||
                                            t(
                                                "myRequests.common.notAvailable"
                                            )}

                                    </p>

                                </div>


                                {/* COLLECTION DATE */}

                                <div className="
                                    bg-gray-50
                                    rounded-lg
                                    p-3
                                ">

                                    <p className="
                                        text-xs
                                        text-gray-500
                                        uppercase
                                        font-semibold
                                    ">

                                        {t(
                                            "myRequests.fields.collectionDate"
                                        )}

                                    </p>


                                    <p className="
                                        font-semibold
                                        text-gray-800
                                        mt-1
                                    ">

                                        {request.preferred_collection_date
                                            ? new Date(
                                                request.preferred_collection_date
                                            ).toLocaleDateString()
                                            : t(
                                                "myRequests.common.notAvailable"
                                            )
                                        }

                                    </p>

                                </div>

                            </div>


                            {/* ================================= */}
                            {/* COLLECTOR INFORMATION */}
                            {/* ================================= */}

                            <div className="
                                mt-5
                                bg-indigo-50
                                border
                                border-indigo-100
                                rounded-xl
                                p-4
                            ">


                                <h3 className="
                                    text-lg
                                    font-bold
                                    text-indigo-800
                                    mb-3
                                ">

                                    👷{" "}

                                    {t(
                                        "myRequests.collector.title"
                                    )}

                                </h3>


                                <div className="
                                    grid
                                    grid-cols-1
                                    sm:grid-cols-2
                                    gap-4
                                ">


                                    {/* COLLECTOR NAME */}

                                    <div>

                                        <p className="
                                            text-xs
                                            text-gray-500
                                            uppercase
                                            font-semibold
                                        ">

                                            {t(
                                                "myRequests.fields.collectorName"
                                            )}

                                        </p>


                                        <p className="
                                            font-semibold
                                            text-gray-800
                                            mt-1
                                        ">

                                            {request.collector_name ||
                                                t(
                                                    "myRequests.common.notAvailable"
                                                )}

                                        </p>

                                    </div>


                                    {/* COLLECTOR PHONE */}

                                    <div>

                                        <p className="
                                            text-xs
                                            text-gray-500
                                            uppercase
                                            font-semibold
                                        ">

                                            {t(
                                                "myRequests.fields.collectorPhone"
                                            )}

                                        </p>


                                        <p className="
                                            font-semibold
                                            text-gray-800
                                            mt-1
                                        ">

                                            {request.collector_phone ||
                                                t(
                                                    "myRequests.common.notAvailable"
                                                )}

                                        </p>

                                    </div>

                                </div>

                            </div>


                            {/* ================================= */}
                            {/* ACTIONS */}
                            {/* ================================= */}

                            <div className="
                                mt-5
                                flex
                                flex-wrap
                                items-center
                                gap-3
                            ">


                                {/* ================================= */}
                                {/* COLLECTED */}
                                {/* ================================= */}

                                {request.status === "Collected" && (

                                    <>

                                        <span className="
                                            bg-green-100
                                            text-green-700
                                            px-3
                                            py-2
                                            rounded-lg
                                            font-semibold
                                        ">

                                            ✅{" "}

                                            {t(
                                                "myRequests.actions.collectionFinished"
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
                                                    "myRequests.actions.confirming"
                                                )

                                                : t(
                                                    "myRequests.actions.confirmCollection"
                                                )
                                            }

                                        </button>

                                    </>

                                )}


                                {/* ================================= */}
                                {/* COMPLETED */}
                                {/* ================================= */}

                                {request.status === "Completed" && (

                                    <div className="
                                        w-full
                                        bg-emerald-50
                                        border
                                        border-emerald-200
                                        rounded-lg
                                        p-3
                                    ">

                                        <span className="
                                            text-emerald-700
                                            font-semibold
                                        ">

                                            ✔{" "}

                                            {t(
                                                "myRequests.actions.collectionCompleted"
                                            )}

                                        </span>

                                    </div>

                                )}


                                {/* ================================= */}
                                {/* ASSIGNED */}
                                {/* ================================= */}

                                {request.status === "Assigned" && (

                                    <span className="
                                        text-indigo-700
                                        bg-indigo-50
                                        px-4
                                        py-2
                                        rounded-lg
                                        font-semibold
                                    ">

                                        👷{" "}

                                        {t(
                                            "myRequests.actions.collectorAssigned"
                                        )}

                                    </span>

                                )}


                                {/* ================================= */}
                                {/* IN PROGRESS */}
                                {/* ================================= */}

                                {request.status === "In Progress" && (

                                    <span className="
                                        text-purple-700
                                        bg-purple-50
                                        px-4
                                        py-2
                                        rounded-lg
                                        font-semibold
                                    ">

                                        🚛{" "}

                                        {t(
                                            "myRequests.actions.collectionInProgress"
                                        )}

                                    </span>

                                )}


                                {/* ================================= */}
                                {/* PENDING */}
                                {/* ================================= */}

                                {request.status === "Pending" && (

                                    <span className="
                                        text-yellow-700
                                        bg-yellow-50
                                        px-4
                                        py-2
                                        rounded-lg
                                        font-semibold
                                    ">

                                        ⏳{" "}

                                        {t(
                                            "myRequests.actions.waitingApproval"
                                        )}

                                    </span>

                                )}


                                {/* ================================= */}
                                {/* APPROVED */}
                                {/* ================================= */}

                                {request.status === "Approved" && (

                                    <span className="
                                        text-blue-700
                                        bg-blue-50
                                        px-4
                                        py-2
                                        rounded-lg
                                        font-semibold
                                    ">

                                        ✓{" "}

                                        {t(
                                            "myRequests.actions.requestApproved"
                                        )}

                                    </span>

                                )}


                                {/* ================================= */}
                                {/* REJECTED */}
                                {/* ================================= */}

                                {request.status === "Rejected" && (

                                    <span className="
                                        text-red-700
                                        bg-red-50
                                        px-4
                                        py-2
                                        rounded-lg
                                        font-semibold
                                    ">

                                        ✕{" "}

                                        {t(
                                            "myRequests.actions.requestRejected"
                                        )}

                                    </span>

                                )}


                                {/* ================================= */}
                                {/* CANCELLED */}
                                {/* ================================= */}

                                {request.status === "Cancelled" && (

                                    <span className="
                                        text-gray-700
                                        bg-gray-100
                                        px-4
                                        py-2
                                        rounded-lg
                                        font-semibold
                                    ">

                                        {t(
                                            "myRequests.actions.requestCancelled"
                                        )}

                                    </span>

                                )}

                            </div>

                        </div>

                    ))}

                </div>

            )}

        </div>

    );

};


export default MyRequests;

