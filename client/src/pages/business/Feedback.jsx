
import React, {
    useEffect,
    useMemo,
    useState
} from "react";

import { useTranslation } from "react-i18next";

import Card from "../../components/common/Card";
import Select from "../../components/common/Select";
import Textarea from "../../components/common/Textarea";
import Button from "../../components/common/Button";
import Toast from "../../components/common/Toast";

import API from "../../services/api";

const Feedback = () => {

    const { t } = useTranslation();

    // ==========================================
    // USER
    // ==========================================

    const user = useMemo(() => {
        try {
            return (
                JSON.parse(
                    localStorage.getItem("user")
                ) || {}
            );
        } catch (error) {
            console.error(
                "Failed to read user:",
                error
            );

            return {};
        }
    }, []);

    // ==========================================
    // BUSINESS OWNER LOCATION
    // ==========================================

    const businessKebele =
        user?.kebele ||
        user?.assigned_kebele ||
        user?.kifle_ketema_kebele ||
        "";

    const businessSefer =
        user?.sefer ||
        user?.assigned_sefer ||
        "";

    const businessKifleKetema =
        user?.kifle_ketema ||
        user?.assigned_kifle_ketema ||
        "";

    // ==========================================
    // FORM DATA
    // ==========================================

    const [formData, setFormData] = useState({
        category: "Service Quality",
        kebele: businessKebele,
        sefer: businessSefer,
        rating: "5",
        comment: ""
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
    // LOAD SAVED FEEDBACK
    // ==========================================

    useEffect(() => {

        const feedbackId =
            localStorage.getItem(
                "business_feedback_id"
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

            const response = await API.get(
                `/feedback/${feedbackId}`
            );

            if (response.data?.success) {

                setSubmittedFeedback(
                    response.data.data
                );
            }

        } catch (error) {

            console.error(
                "Load Business Feedback Error:",
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

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        setToast({
            show: false,
            type: "",
            message: ""
        });

        // --------------------------------------
        // CLEAR OLD COMMENT WHEN CATEGORY
        // CHANGES FROM OTHER
        // --------------------------------------

        if (
            name === "category" &&
            value !== "Other"
        ) {

            setFormData(prev => ({
                ...prev,
                category: value,
                comment: ""
            }));
        }
    };

    // ==========================================
    // SUBMIT
    // ==========================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        // --------------------------------------
        // KEBELE VALIDATION
        // --------------------------------------

        if (!formData.kebele?.trim()) {

            setToast({
                show: true,
                type: "error",
                message:
                    t(
                        "feedback.validation.kebeleMissing"
                    )
            });

            return;
        }

        // --------------------------------------
        // SEFER VALIDATION
        // --------------------------------------

        if (!formData.sefer?.trim()) {

            setToast({
                show: true,
                type: "error",
                message:
                    t(
                        "feedback.validation.seferMissing"
                    )
            });

            return;
        }

        // --------------------------------------
        // CATEGORY VALIDATION
        // --------------------------------------

        if (!formData.category?.trim()) {

            setToast({
                show: true,
                type: "error",
                message:
                    "Category is required."
            });

            return;
        }

        // --------------------------------------
        // COMMENT VALIDATION
        //
        // ONLY OTHER NEEDS COMMENT
        // --------------------------------------

        if (
            formData.category === "Other" &&
            !formData.comment?.trim()
        ) {

            setToast({
                show: true,
                type: "error",
                message:
                    "Please describe your feedback."
            });

            return;
        }

        // --------------------------------------
        // RATING VALIDATION
        // --------------------------------------

        if (!formData.rating) {

            setToast({
                show: true,
                type: "error",
                message:
                    t(
                        "feedback.validation.ratingRequired"
                    )
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
            // BACKEND DATA
            // ==================================
            //
            // Category = FULL CATEGORY NAME
            //
            // Comment is sent ONLY for Other.
            // ==================================

            const feedbackData = {

                category:
                    formData.category.trim(),

                kifle_ketema:
                    businessKifleKetema?.trim(),

                kebele:
                    formData.kebele.trim(),

                sefer:
                    formData.sefer.trim(),

                rating:
                    Number(formData.rating),

                description:
                    formData.category === "Other"
                        ? formData.comment.trim()
                        : null
            };

            console.log(
                "================================="
            );

            console.log(
                "BUSINESS OWNER FEEDBACK REQUEST"
            );

            console.log(
                "Feedback Data:",
                feedbackData
            );

            console.log(
                "Category:",
                feedbackData.category
            );

            console.log(
                "Description:",
                feedbackData.description
            );

            console.log(
                "================================="
            );

            // ==================================
            // SUBMIT
            // ==================================

            const response = await API.post(
                "/feedback",
                feedbackData
            );

            console.log(
                "FEEDBACK RESPONSE:",
                response.data
            );

            // ==================================
            // SUCCESS
            // ==================================

            if (response.data?.success) {

                const createdFeedback =
                    response.data?.data;

                // --------------------------------
                // SAVE FEEDBACK ID
                // --------------------------------

                if (
                    createdFeedback?.feedback_id
                ) {

                    localStorage.setItem(
                        "business_feedback_id",
                        String(
                            createdFeedback.feedback_id
                        )
                    );

                    setSubmittedFeedback(
                        createdFeedback
                    );
                }

                // --------------------------------
                // SUCCESS MESSAGE
                // --------------------------------

                setToast({
                    show: true,
                    type: "success",
                    message:
                        t(
                            "feedback.success"
                        )
                });

                // --------------------------------
                // RESET
                // --------------------------------

                setFormData(prev => ({
                    ...prev,
                    comment: "",
                    rating: "5"
                }));

            } else {

                setToast({
                    show: true,
                    type: "error",
                    message:
                        response.data?.message ||
                        t(
                            "feedback.errors.unable"
                        )
                });
            }

        } catch (error) {

            console.error(
                "Business feedback error:",
                error
            );

            console.error(
                "Server response:",
                error?.response?.data
            );

            const message =
                error?.response?.data?.message ||
                t(
                    "feedback.errors.unable"
                );

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
    // CATEGORY
    // ==========================================
    //
    // IMPORTANT:
    // VALUE = FULL CATEGORY NAME
    // ==========================================

    const categoryOptions = [

        {
            value: "Service Quality",
            label:
                t(
                    "feedback.categories.serviceQuality"
                )
        },

        {
            value: "Collection Delay",
            label:
                t(
                    "feedback.categories.delay"
                )
        },

        {
            value: "Collector Service",
            label:
                t(
                    "feedback.categories.collector"
                )
        },

        {
            value: "Collection Schedule",
            label:
                t(
                    "feedback.categories.schedule"
                )
        },

        {
            value: "Other",
            label:
                t(
                    "feedback.categories.other"
                )
        }

    ];

    // ==========================================
    // RATING
    // ==========================================

    const ratingOptions = [

        {
            value: "5",
            label:
                t(
                    "feedback.ratings.excellent"
                )
        },

        {
            value: "4",
            label:
                t(
                    "feedback.ratings.veryGood"
                )
        },

        {
            value: "3",
            label:
                t(
                    "feedback.ratings.good"
                )
        },

        {
            value: "2",
            label:
                t(
                    "feedback.ratings.fair"
                )
        },

        {
            value: "1",
            label:
                t(
                    "feedback.ratings.poor"
                )
        }

    ];

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

            {/* ==================================
                HEADER
            ================================== */}

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
                            {t(
                                "feedback.title"
                            )}
                        </h1>

                        <p
                            className="
                                text-sm
                                text-gray-500
                                mt-1
                            "
                        >
                            {t(
                                "feedback.description"
                            )}
                        </p>

                    </div>

                </div>

            </div>

            {/* ==================================
                FORM
            ================================== */}

            <Card>

                <div className="mb-5">

                    <h2
                        className="
                            text-lg
                            font-bold
                            text-gray-800
                        "
                    >
                        {t(
                            "feedback.form.title"
                        )}
                    </h2>

                    <p
                        className="
                            text-xs
                            text-gray-500
                            mt-1
                        "
                    >
                        {t(
                            "feedback.form.description"
                        )}
                    </p>

                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >

                    {/* ==================================
                        KIFLE KETEMA
                    ================================== */}

                    <div>

                        <label
                            className="
                                block
                                text-sm
                                font-medium
                                text-gray-700
                                mb-1
                            "
                        >
                            Kifle Ketema
                        </label>

                        <input
                            type="text"
                            value={
                                businessKifleKetema ||
                                t(
                                    "feedback.notAssigned"
                                )
                            }
                            readOnly
                            className="
                                w-full
                                rounded-lg
                                border
                                border-gray-300
                                bg-gray-100
                                px-4
                                py-3
                                text-gray-700
                                cursor-not-allowed
                            "
                        />

                    </div>

                    {/* ==================================
                        CATEGORY
                    ================================== */}

                    <Select
                        label={t(
                            "feedback.fields.category"
                        )}
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
                        KEBELE
                    ================================== */}

                    <div>

                        <label
                            className="
                                block
                                text-sm
                                font-medium
                                text-gray-700
                                mb-1
                            "
                        >
                            {t(
                                "feedback.fields.kebele"
                            )}
                        </label>

                        <input
                            type="text"
                            value={
                                formData.kebele ||
                                t(
                                    "feedback.notAssigned"
                                )
                            }
                            readOnly
                            className="
                                w-full
                                rounded-lg
                                border
                                border-gray-300
                                bg-gray-100
                                px-4
                                py-3
                                text-gray-700
                                cursor-not-allowed
                            "
                        />

                    </div>

                    {/* ==================================
                        SEFER
                    ================================== */}

                    <div>

                        <label
                            className="
                                block
                                text-sm
                                font-medium
                                text-gray-700
                                mb-1
                            "
                        >
                            {t(
                                "feedback.fields.sefer"
                            )}
                        </label>

                        <input
                            type="text"
                            value={
                                formData.sefer ||
                                t(
                                    "feedback.notAssigned"
                                )
                            }
                            readOnly
                            className="
                                w-full
                                rounded-lg
                                border
                                border-gray-300
                                bg-gray-100
                                px-4
                                py-3
                                text-gray-700
                                cursor-not-allowed
                            "
                        />

                    </div>

                    {/* ==================================
                        RATING
                    ================================== */}

                    <Select
                        label={t(
                            "feedback.fields.rating"
                        )}
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
                        COMMENT / DESCRIPTION
                        SHOW ONLY FOR OTHER
                    ================================== */}

                    {formData.category === "Other" && (

                        <Textarea
                            label={t(
                                "feedback.fields.comment"
                            )}
                            name="comment"
                            value={
                                formData.comment
                            }
                            onChange={
                                handleChange
                            }
                            placeholder="Please describe your feedback..."
                            rows={6}
                            required
                        />

                    )}

                    {/* ==================================
                        OTHER INFO
                    ================================== */}

                    {formData.category === "Other" && (

                        <div
                            className="
                                bg-yellow-50
                                border
                                border-yellow-200
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

                                <span className="text-lg">
                                    ⚠️
                                </span>

                                <div>

                                    <p
                                        className="
                                            text-xs
                                            font-semibold
                                            text-yellow-800
                                        "
                                    >
                                        Other Feedback
                                    </p>

                                    <p
                                        className="
                                            text-xs
                                            text-yellow-700
                                            mt-1
                                        "
                                    >
                                        Please explain your
                                        feedback clearly in
                                        the comment field.
                                    </p>

                                </div>

                            </div>

                        </div>

                    )}

                    {/* ==================================
                        INFO
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

                            <span className="text-lg">
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
                                    {t(
                                        "feedback.beforeSubmitting.title"
                                    )}
                                </p>

                                <p
                                    className="
                                        text-xs
                                        text-blue-700
                                        mt-1
                                    "
                                >
                                    {t(
                                        "feedback.beforeSubmitting.description"
                                    )}
                                </p>

                            </div>

                        </div>

                    </div>

                    {/* ==================================
                        BUTTON
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
                                ? t(
                                    "feedback.buttons.submitting"
                                )
                                : t(
                                    "feedback.buttons.submit"
                                )}
                        </Button>

                    </div>

                </form>

            </Card>

            {/* ==================================
                SUBMITTED FEEDBACK STATUS
            ================================== */}

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

                    {/* ==================================
                        STATUS HEADER
                    ================================== */}

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
                        DETAILS
                    ================================== */}

                    <div
                        className="
                            grid
                            grid-cols-1
                            md:grid-cols-2
                            gap-4
                        "
                    >

                        {/* KIFLE KETEMA */}

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
                                    submittedFeedback.kifle_ketema ||
                                    businessKifleKetema ||
                                    "-"
                                }
                            </p>

                        </div>

                        {/* KEBELE */}

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
                                    submittedFeedback.kebele ||
                                    "-"
                                }
                            </p>

                        </div>

                        {/* SEFER */}

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
                                    submittedFeedback.sefer ||
                                    "-"
                                }
                            </p>

                        </div>

                        {/* FULL CATEGORY */}

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
                                    submittedFeedback.category ||
                                    "-"
                                }
                            </p>

                        </div>

                        {/* RATING */}

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

                                <span
                                    className="
                                        ml-2
                                        text-gray-500
                                        text-sm
                                    "
                                >
                                    (
                                    {
                                        submittedFeedback.rating
                                    }
                                    /5)
                                </span>

                            </p>

                        </div>

                        {/* ==================================
                            COMMENT / DESCRIPTION
                            ONLY SHOW IF IT EXISTS
                        ================================== */}

                        {submittedFeedback.description && (

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
                                    Comment / Description
                                </p>

                                <p
                                    className="
                                        text-gray-700
                                        mt-1
                                        whitespace-pre-wrap
                                        break-words
                                    "
                                >
                                    {
                                        submittedFeedback.description
                                    }
                                </p>

                            </div>

                        )}

                    </div>

                    {/* ==================================
                        CHECK STATUS
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

            {/* ==================================
                TOAST
            ================================== */}

            {toast.show && (

                <Toast
                    type={toast.type}
                    message={toast.message}
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
