
// src/pages/resident/Feedback.jsx

import React, { useState } from "react";
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

    const user = React.useMemo(() => {
        try {
            return (
                JSON.parse(localStorage.getItem("user")) || {}
            );
        } catch (error) {
            console.error("Failed to read user:", error);
            return {};
        }
    }, []);

    // ==========================================
    // RESIDENT LOCATION
    // ==========================================

    const residentKebele =
        user?.kebele ||
        user?.assigned_kebele ||
        user?.kifle_ketema_kebele ||
        "";

    const residentSefer =
        user?.sefer ||
        user?.assigned_sefer ||
        "";

    // ==========================================
    // FORM DATA
    // ==========================================

    const [formData, setFormData] = useState({
        category: "Service Quality",
        kebele: residentKebele,
        sefer: residentSefer,
        rating: "5",
        comment: ""
    });

    // ==========================================
    // STATES
    // ==========================================

    const [submitting, setSubmitting] = useState(false);

    const [toast, setToast] = useState({
        show: false,
        type: "success",
        message: ""
    });

    // ==========================================
    // HANDLE CHANGE
    // ==========================================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // ==========================================
    // SUBMIT
    // ==========================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.kebele?.trim()) {
            setToast({
                show: true,
                type: "error",
                message: t("feedback.validation.kebeleMissing")
            });
            return;
        }

        if (!formData.sefer?.trim()) {
            setToast({
                show: true,
                type: "error",
                message: t("feedback.validation.seferMissing")
            });
            return;
        }

        if (!formData.comment?.trim()) {
            setToast({
                show: true,
                type: "error",
                message: t("feedback.validation.commentRequired")
            });
            return;
        }

        if (!formData.rating) {
            setToast({
                show: true,
                type: "error",
                message: t("feedback.validation.ratingRequired")
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
            const feedbackData = {
                category: formData.category,
                kebele: formData.kebele.trim(),
                sefer: formData.sefer.trim(),
                rating: Number(formData.rating),
                comment: formData.comment.trim()
            };

            console.log("=================================");
            console.log("RESIDENT FEEDBACK REQUEST");
            console.log("Feedback Data:", feedbackData);
            console.log("=================================");

            const response = await API.post(
                "/feedback",
                feedbackData
            );

            console.log(
                "FEEDBACK RESPONSE:",
                response.data
            );

            // ======================================
            // SUCCESS
            // ======================================

            setToast({
                show: true,
                type: "success",
                message: t("feedback.success")
            });

            // Keep resident location
            setFormData(prev => ({
                ...prev,
                comment: "",
                rating: "5"
            }));

        } catch (error) {
            console.error(
                "Resident feedback error:",
                error
            );

            const message =
                error?.response?.data?.message ||
                t("feedback.errors.unable");

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

    const categoryOptions = [
        {
            value: "Service Quality",
            label: t("feedback.categories.serviceQuality")
        },
        {
            value: "Delay",
            label: t("feedback.categories.delay")
        },
        {
            value: "Collector",
            label: t("feedback.categories.collector")
        },
        {
            value: "Schedule",
            label: t("feedback.categories.schedule")
        },
        {
            value: "Other",
            label: t("feedback.categories.other")
        }
    ];

    // ==========================================
    // RATING
    // ==========================================

    const ratingOptions = [
        {
            value: "5",
            label: t("feedback.ratings.excellent")
        },
        {
            value: "4",
            label: t("feedback.ratings.veryGood")
        },
        {
            value: "3",
            label: t("feedback.ratings.good")
        },
        {
            value: "2",
            label: t("feedback.ratings.fair")
        },
        {
            value: "1",
            label: t("feedback.ratings.poor")
        }
    ];

    // ==========================================
    // UI
    // ==========================================

    return (
        <div className="
            p-6
            md:p-8
            max-w-3xl
            mx-auto
            space-y-6
        ">

            {/* HEADER */}

            <div className="
                bg-white
                border
                rounded-2xl
                shadow-sm
                p-6
            ">

                <div className="
                    flex
                    items-start
                    gap-4
                ">

                    <div className="
                        w-12
                        h-12
                        rounded-xl
                        bg-blue-50
                        flex
                        items-center
                        justify-center
                        text-2xl
                        flex-shrink-0
                    ">
                        💬
                    </div>

                    <div>

                        <h1 className="
                            text-2xl
                            font-bold
                            text-gray-800
                        ">
                            {t("feedback.title")}
                        </h1>

                        <p className="
                            text-sm
                            text-gray-500
                            mt-1
                        ">
                            {t("feedback.description")}
                        </p>

                    </div>

                </div>

            </div>

            {/* FORM */}

            <Card>

                <div className="mb-5">

                    <h2 className="
                        text-lg
                        font-bold
                        text-gray-800
                    ">
                        {t("feedback.form.title")}
                    </h2>

                    <p className="
                        text-xs
                        text-gray-500
                        mt-1
                    ">
                        {t("feedback.form.description")}
                    </p>

                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >

                    {/* CATEGORY */}

                    <Select
                        label={t("feedback.fields.category")}
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        options={categoryOptions}
                        required
                    />

                    {/* KEBELE */}

                    <div>

                        <label className="
                            block
                            text-sm
                            font-medium
                            text-gray-700
                            mb-1
                        ">
                            {t("feedback.fields.kebele")}
                        </label>

                        <input
                            type="text"
                            value={
                                formData.kebele ||
                                t("feedback.notAssigned")
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

                    {/* SEFER */}

                    <div>

                        <label className="
                            block
                            text-sm
                            font-medium
                            text-gray-700
                            mb-1
                        ">
                            {t("feedback.fields.sefer")}
                        </label>

                        <input
                            type="text"
                            value={
                                formData.sefer ||
                                t("feedback.notAssigned")
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

                    {/* RATING */}

                    <Select
                        label={t("feedback.fields.rating")}
                        name="rating"
                        value={formData.rating}
                        onChange={handleChange}
                        options={ratingOptions}
                        required
                    />

                    {/* COMMENT */}

                    <Textarea
                        label={t("feedback.fields.comment")}
                        name="comment"
                        value={formData.comment}
                        onChange={handleChange}
                        placeholder={t(
                            "feedback.placeholders.comment"
                        )}
                        rows={6}
                        required
                    />

                    {/* INFO */}

                    <div className="
                        bg-blue-50
                        border
                        border-blue-100
                        rounded-xl
                        p-4
                    ">

                        <div className="flex gap-3">

                            <span className="text-lg">
                                ℹ️
                            </span>

                            <div>

                                <p className="
                                    text-xs
                                    font-semibold
                                    text-blue-800
                                ">
                                    {t("feedback.beforeSubmitting.title")}
                                </p>

                                <p className="
                                    text-xs
                                    text-blue-700
                                    mt-1
                                ">
                                    {t("feedback.beforeSubmitting.description")}
                                </p>

                            </div>

                        </div>

                    </div>

                    {/* BUTTON */}

                    <div className="
                        flex
                        justify-end
                        pt-2
                    ">

                        <Button
                            type="submit"
                            variant="primary"
                            loading={submitting}
                        >
                            {submitting
                                ? t("feedback.buttons.submitting")
                                : t("feedback.buttons.submit")}
                        </Button>

                    </div>

                </form>

            </Card>

            {/* TOAST */}

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
