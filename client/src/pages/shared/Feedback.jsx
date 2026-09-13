
import React, {
    useEffect,
    useState
} from "react";

import Card from "../../components/common/Card";
import Select from "../../components/common/Select";
import Button from "../../components/common/Button";
import Toast from "../../components/common/Toast";

import API from "../../services/api";

const Feedback = () => {

    // ==========================================
    // LOCATION DATA
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
    // FORM DATA
    // ==========================================

    const [formData, setFormData] = useState({

        category: "Service Quality",

        kifle_ketema: "",

        kebele: "",

        sefer: "",

        rating: "5"
    });


    // ==========================================
    // STATES
    // ==========================================

    const [submitting, setSubmitting] =
        useState(false);

    const [loadingFeedback, setLoadingFeedback] =
        useState(false);

    const [submittedFeedback, setSubmittedFeedback] =
        useState(null);

    const [toast, setToast] = useState({

        show: false,

        type: "success",

        message: ""
    });


    // ==========================================
    // LOAD SAVED PUBLIC FEEDBACK
    // ==========================================

    useEffect(() => {

        const feedbackId =
            localStorage.getItem(
                "public_feedback_id"
            );

        if (!feedbackId) {
            return;
        }

        loadFeedbackStatus(feedbackId);

    }, []);


    // ==========================================
    // LOAD FEEDBACK STATUS
    // ==========================================

    const loadFeedbackStatus = async (
        feedbackId
    ) => {

        try {

            setLoadingFeedback(true);

            console.log(
                "================================="
            );

            console.log(
                "LOAD PUBLIC FEEDBACK STATUS"
            );

            console.log(
                "Feedback ID:",
                feedbackId
            );

            console.log(
                "================================="
            );


            const response =
                await API.get(
                    `/feedback/public/${feedbackId}`
                );


            console.log(
                "PUBLIC FEEDBACK STATUS RESPONSE:",
                response.data
            );


            if (
                response.data?.success
            ) {

                setSubmittedFeedback(
                    response.data.data
                );

            }

        } catch (error) {

            console.error(
                "Load Public Feedback Error:",
                error
            );

            console.error(
                "Status:",
                error?.response?.status
            );

            console.error(
                "Server response:",
                error?.response?.data
            );

        } finally {

            setLoadingFeedback(false);
        }
    };


    // ==========================================
    // HANDLE CHANGE
    // ==========================================

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;


        setFormData((prev) => {

            // ==================================
            // KIFLE KETEMA
            // ==================================

            if (
                name === "kifle_ketema"
            ) {

                return {

                    ...prev,

                    kifle_ketema:
                        value,

                    kebele: "",

                    sefer: ""
                };
            }


            // ==================================
            // KEBELE
            // ==================================

            if (
                name === "kebele"
            ) {

                return {

                    ...prev,

                    kebele:
                        value,

                    sefer: ""
                };
            }


            return {

                ...prev,

                [name]:
                    value
            };

        });


        setToast({

            show: false,

            type: "",

            message: ""
        });
    };


    // ==========================================
    // SUBMIT FEEDBACK
    // ==========================================

    const handleSubmit = async (e) => {

        e.preventDefault();


        // ==================================
        // KIFLE KETEMA VALIDATION
        // ==================================

        if (
            !formData.kifle_ketema
        ) {

            setToast({

                show: true,

                type: "error",

                message:
                    "Please select your Kifle Ketema."
            });

            return;
        }


        // ==================================
        // KEBELE VALIDATION
        // ==================================

        if (
            !formData.kebele
        ) {

            setToast({

                show: true,

                type: "error",

                message:
                    "Please select your Kebele."
            });

            return;
        }


        // ==================================
        // SEFER VALIDATION
        // ==================================

        if (
            !formData.sefer
        ) {

            setToast({

                show: true,

                type: "error",

                message:
                    "Please select your Sefer."
            });

            return;
        }


        // ==================================
        // CATEGORY VALIDATION
        // ==================================

        if (
            !formData.category
        ) {

            setToast({

                show: true,

                type: "error",

                message:
                    "Please select a feedback category."
            });

            return;
        }


        // ==================================
        // RATING VALIDATION
        // ==================================

        if (
            !formData.rating
        ) {

            setToast({

                show: true,

                type: "error",

                message:
                    "Please select a rating."
            });

            return;
        }


        setSubmitting(true);


        setToast({

            show: false,

            type: "",

            message: ""
        });


        try {

            // ==================================
            // FEEDBACK DATA
            //
            // IMPORTANT:
            // category value is the FULL CATEGORY
            // name that will be stored in PostgreSQL.
            // ==================================

            const feedbackData = {

                category:
                    formData.category,

                kifle_ketema:
                    formData.kifle_ketema,

                kebele:
                    formData.kebele,

                sefer:
                    formData.sefer,

                rating:
                    Number(
                        formData.rating
                    )
            };


            console.log(
                "================================="
            );

            console.log(
                "PUBLIC FEEDBACK REQUEST"
            );

            console.log(
                "Feedback Data:",
                feedbackData
            );

            console.log(
                "================================="
            );


            // ==================================
            // SEND REQUEST
            // ==================================

            const response =
                await API.post(
                    "/feedback/public",
                    feedbackData
                );


            console.log(
                "PUBLIC FEEDBACK RESPONSE:",
                response.data
            );


            // ==================================
            // SUCCESS
            // ==================================

            if (
                response.data?.success
            ) {

                const createdFeedback =
                    response.data?.data;


                // ==================================
                // SAVE FEEDBACK ID
                // ==================================

                if (
                    createdFeedback?.feedback_id
                ) {

                    localStorage.setItem(

                        "public_feedback_id",

                        String(
                            createdFeedback.feedback_id
                        )
                    );


                    setSubmittedFeedback(
                        createdFeedback
                    );
                }


                // ==================================
                // SUCCESS TOAST
                // ==================================

                setToast({

                    show: true,

                    type: "success",

                    message:
                        response.data.message ||
                        "Your feedback has been submitted successfully."
                });


                // ==================================
                // RESET FORM
                // ==================================

                setFormData({

                    category:
                        "Service Quality",

                    kifle_ketema: "",

                    kebele: "",

                    sefer: "",

                    rating: "5"
                });


            } else {

                setToast({

                    show: true,

                    type: "error",

                    message:
                        response.data?.message ||
                        "Unable to submit your feedback."
                });
            }


        } catch (error) {

            console.error(
                "Public feedback error:",
                error
            );

            console.error(
                "Status:",
                error?.response?.status
            );

            console.error(
                "Server response:",
                error?.response?.data
            );


            const message =
                error?.response?.data?.message ||
                "Unable to submit your feedback. Please try again.";


            setToast({

                show: true,

                type: "error",

                message
            });


        } finally {

            setSubmitting(false);
        }
    };


    // ==========================================
    // CATEGORY OPTIONS
    //
    // IMPORTANT:
    // value = EXACT CATEGORY STORED IN DATABASE
    //
    // NO "Other"
    // NO DESCRIPTION
    // ==========================================

    const categoryOptions = [

        {
            value:
                "Service Quality",

            label:
                "Service Quality"
        },

        {
            value:
                "Collection Delay",

            label:
                "Collection Delay"
        },

        {
            value:
                "Collector",

            label:
                "Collector Service"
        },

        {
            value:
                "Schedule",

            label:
                "Collection Schedule"
        }

    ];


    // ==========================================
    // RATING OPTIONS
    // ==========================================

    const ratingOptions = [

        {
            value:
                "5",

            label:
                "★★★★★  Excellent"
        },

        {
            value:
                "4",

            label:
                "★★★★☆  Very Good"
        },

        {
            value:
                "3",

            label:
                "★★★☆☆  Good"
        },

        {
            value:
                "2",

            label:
                "★★☆☆☆  Fair"
        },

        {
            value:
                "1",

            label:
                "★☆☆☆☆  Poor"
        }

    ];


    // ==========================================
    // KIFLE KETEMA OPTIONS
    // ==========================================

    const kifleKetemaOptions =
        Object.keys(
            locations
        ).map((item) => ({

            value:
                item,

            label:
                item
        }));


    // ==========================================
    // KEBELE OPTIONS
    // ==========================================

    const kebeleOptions =

        formData.kifle_ketema

            ? Object.keys(

                locations[
                    formData.kifle_ketema
                ] || {}

            ).map((item) => ({

                value:
                    item,

                label:
                    item
            }))

            : [];


    // ==========================================
    // SEFER OPTIONS
    // ==========================================

    const seferOptions =

        formData.kifle_ketema &&
        formData.kebele

            ? (

                locations[
                    formData.kifle_ketema
                ]?.[
                    formData.kebele
                ] || []

            ).map((item) => ({

                value:
                    item,

                label:
                    item
            }))

            : [];


    // ==========================================
    // STATUS
    // ==========================================

    const feedbackStatus =
        submittedFeedback?.status ||
        "Pending";


    // ==========================================
    // UI
    // ==========================================

    return (

        <div
            className="
                p-6
                md:p-8
                max-w-3xl
                mx-auto
                space-y-6
            "
        >

            {/* ======================================
                HEADER
            ====================================== */}

            <div
                className="
                    bg-white
                    border
                    rounded-2xl
                    shadow-sm
                    p-6
                "
            >

                <div
                    className="
                        flex
                        items-start
                        gap-4
                    "
                >

                    <div
                        className="
                            w-12
                            h-12
                            rounded-xl
                            bg-blue-50
                            flex
                            items-center
                            justify-center
                            text-2xl
                            flex-shrink-0
                        "
                    >
                        💬
                    </div>


                    <div>

                        <h1
                            className="
                                text-2xl
                                font-bold
                                text-gray-800
                            "
                        >
                            Feedback & Complaints
                        </h1>


                        <p
                            className="
                                text-sm
                                text-gray-500
                                mt-1
                            "
                        >
                            Share your experience or report
                            a problem with the waste collection
                            service.
                        </p>

                    </div>

                </div>

            </div>


            {/* ======================================
                FORM
            ====================================== */}

            <Card>

                <div
                    className="mb-5"
                >

                    <h2
                        className="
                            text-lg
                            font-bold
                            text-gray-800
                        "
                    >
                        Submit Your Feedback
                    </h2>


                    <p
                        className="
                            text-xs
                            text-gray-500
                            mt-1
                        "
                    >
                        Select your location, feedback category,
                        and rating.
                    </p>

                </div>


                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >

                    {/* ==================================
                        KIFLE KETEMA
                    ================================== */}

                    <Select
                        label="Kifle Ketema"
                        name="kifle_ketema"
                        value={
                            formData.kifle_ketema
                        }
                        onChange={
                            handleChange
                        }
                        options={
                            kifleKetemaOptions
                        }
                        required
                    />


                    {/* ==================================
                        KEBELE
                    ================================== */}

                    <Select
                        label="Kebele"
                        name="kebele"
                        value={
                            formData.kebele
                        }
                        onChange={
                            handleChange
                        }
                        options={
                            kebeleOptions
                        }
                        required
                    />


                    {/* ==================================
                        SEFER
                    ================================== */}

                    <Select
                        label="Sefer"
                        name="sefer"
                        value={
                            formData.sefer
                        }
                        onChange={
                            handleChange
                        }
                        options={
                            seferOptions
                        }
                        required
                    />


                    {/* ==================================
                        CATEGORY
                    ================================== */}

                    <Select
                        label="Feedback Category"
                        name="category"
                        value={
                            formData.category
                        }
                        onChange={
                            handleChange
                        }
                        options={
                            categoryOptions
                        }
                        required
                    />


                    {/* ==================================
                        RATING
                    ================================== */}

                    <Select
                        label="Rating"
                        name="rating"
                        value={
                            formData.rating
                        }
                        onChange={
                            handleChange
                        }
                        options={
                            ratingOptions
                        }
                        required
                    />


                    {/* ==================================
                        INFORMATION
                    ================================== */}

                    <div
                        className="
                            bg-blue-50
                            border
                            border-blue-100
                            rounded-xl
                            p-4
                        "
                    >

                        <div
                            className="
                                flex
                                gap-3
                            "
                        >

                            <span
                                className="text-lg"
                            >
                                ℹ️
                            </span>


                            <div>

                                <p
                                    className="
                                        text-xs
                                        font-semibold
                                        text-blue-800
                                    "
                                >
                                    Before submitting
                                </p>


                                <p
                                    className="
                                        text-xs
                                        text-blue-700
                                        mt-1
                                    "
                                >
                                    Please select your Kifle
                                    Ketema, Kebele, Sefer,
                                    feedback category, and
                                    rating. No login is required.
                                </p>

                            </div>

                        </div>

                    </div>


                    {/* ==================================
                        SUBMIT BUTTON
                    ================================== */}

                    <div
                        className="
                            flex
                            justify-end
                            pt-2
                        "
                    >

                        <Button
                            type="submit"
                            variant="primary"
                            loading={
                                submitting
                            }
                            disabled={
                                submitting
                            }
                        >
                            {submitting
                                ? "Submitting..."
                                : "Submit Feedback"}
                        </Button>

                    </div>

                </form>

            </Card>


            {/* ======================================
                MY FEEDBACK STATUS
            ====================================== */}

            {submittedFeedback && (

                <div
                    className="
                        bg-white
                        border
                        rounded-2xl
                        shadow-sm
                        p-6
                    "
                >

                    <div
                        className="
                            flex
                            items-center
                            justify-between
                            gap-4
                            mb-5
                        "
                    >

                        <div>

                            <h2
                                className="
                                    text-lg
                                    font-bold
                                    text-gray-800
                                "
                            >
                                Your Feedback
                            </h2>


                            <p
                                className="
                                    text-xs
                                    text-gray-500
                                    mt-1
                                "
                            >
                                Feedback ID #
                                {
                                    submittedFeedback.feedback_id
                                }
                            </p>

                        </div>


                        {/* STATUS BADGE */}

                        <span
                            className={`
                                inline-flex
                                px-4
                                py-2
                                rounded-full
                                text-sm
                                font-semibold

                                ${
                                    feedbackStatus ===
                                    "Viewed"

                                        ? "bg-green-100 text-green-700"

                                        : "bg-yellow-100 text-yellow-700"
                                }
                            `}
                        >
                            {feedbackStatus}
                        </span>

                    </div>


                    {/* ==================================
                        FEEDBACK DETAILS
                    ================================== */}

                    <div
                        className="
                            grid
                            grid-cols-1
                            md:grid-cols-2
                            gap-4
                        "
                    >

                        <div
                            className="
                                bg-gray-50
                                rounded-xl
                                p-4
                            "
                        >

                            <p
                                className="
                                    text-xs
                                    text-gray-500
                                "
                            >
                                Kifle Ketema
                            </p>


                            <p
                                className="
                                    font-semibold
                                    text-gray-800
                                    mt-1
                                "
                            >
                                {
                                    submittedFeedback.kifle_ketema
                                }
                            </p>

                        </div>


                        <div
                            className="
                                bg-gray-50
                                rounded-xl
                                p-4
                            "
                        >

                            <p
                                className="
                                    text-xs
                                    text-gray-500
                                "
                            >
                                Kebele
                            </p>


                            <p
                                className="
                                    font-semibold
                                    text-gray-800
                                    mt-1
                                "
                            >
                                {
                                    submittedFeedback.kebele
                                }
                            </p>

                        </div>


                        <div
                            className="
                                bg-gray-50
                                rounded-xl
                                p-4
                            "
                        >

                            <p
                                className="
                                    text-xs
                                    text-gray-500
                                "
                            >
                                Sefer
                            </p>


                            <p
                                className="
                                    font-semibold
                                    text-gray-800
                                    mt-1
                                "
                            >
                                {
                                    submittedFeedback.sefer
                                }
                            </p>

                        </div>


                        <div
                            className="
                                bg-gray-50
                                rounded-xl
                                p-4
                            "
                        >

                            <p
                                className="
                                    text-xs
                                    text-gray-500
                                "
                            >
                                Category
                            </p>


                            <p
                                className="
                                    font-semibold
                                    text-gray-800
                                    mt-1
                                "
                            >
                                {
                                    submittedFeedback.category
                                }
                            </p>

                        </div>


                        <div
                            className="
                                bg-gray-50
                                rounded-xl
                                p-4
                                md:col-span-2
                            "
                        >

                            <p
                                className="
                                    text-xs
                                    text-gray-500
                                "
                            >
                                Rating
                            </p>


                            <p
                                className="
                                    font-semibold
                                    text-gray-800
                                    mt-1
                                "
                            >
                                {
                                    "★".repeat(
                                        Number(
                                            submittedFeedback.rating
                                        ) || 0
                                    )
                                }
                            </p>

                        </div>

                    </div>


                    {/* ==================================
                        REFRESH STATUS
                    ================================== */}

                    <div
                        className="
                            mt-5
                            flex
                            justify-end
                        "
                    >

                        <button
                            type="button"
                            onClick={() =>
                                loadFeedbackStatus(
                                    submittedFeedback.feedback_id
                                )
                            }
                            disabled={
                                loadingFeedback
                            }
                            className="
                                px-5
                                py-2.5
                                rounded-xl
                                bg-blue-600
                                text-white
                                text-sm
                                font-semibold
                                hover:bg-blue-700
                                disabled:opacity-50
                                disabled:cursor-not-allowed
                            "
                        >
                            {loadingFeedback
                                ? "Checking..."
                                : "🔄 Check Feedback Status"}
                        </button>

                    </div>

                </div>

            )}


            {/* ======================================
                TOAST
            ====================================== */}

            {toast.show && (

                <Toast
                    type={
                        toast.type
                    }

                    message={
                        toast.message
                    }

                    onClose={() =>
                        setToast({

                            show: false,

                            type: "success",

                            message: ""
                        })
                    }
                />

            )}

        </div>
    );
};


export default Feedback;
