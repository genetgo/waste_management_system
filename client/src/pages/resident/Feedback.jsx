// src/pages/resident/Feedback.jsx

import React, { useState } from "react";

import Card from "../../components/common/Card";
import Select from "../../components/common/Select";
import Textarea from "../../components/common/Textarea";
import Button from "../../components/common/Button";
import Toast from "../../components/common/Toast";

import API from "../../services/api";


const Feedback = () => {

    // ==========================================
    // USER
    // ==========================================

    const user = React.useMemo(() => {

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

        kebele:
            residentKebele,

        sefer:
            residentSefer,

        rating: "5",

        comment: ""

    });


    // ==========================================
    // STATES
    // ==========================================

    const [submitting, setSubmitting] =
        useState(false);


    const [toast, setToast] = useState({

        show: false,

        type: "success",

        message: ""

    });


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

                message:
                    "Your Kebele information is missing. Please contact the administrator."

            });

            return;
        }


        if (!formData.sefer?.trim()) {

            setToast({

                show: true,

                type: "error",

                message:
                    "Your Sefer information is missing. Please contact the administrator."

            });

            return;
        }


        if (!formData.comment?.trim()) {

            setToast({

                show: true,

                type: "error",

                message:
                    "Please enter your feedback."

            });

            return;
        }


        if (!formData.rating) {

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

            // ======================================
            // BACKEND REQUEST
            // ======================================

            const feedbackData = {

                category:
                    formData.category,

                kebele:
                    formData.kebele.trim(),

                sefer:
                    formData.sefer.trim(),

                rating:
                    Number(formData.rating),

                comment:
                    formData.comment.trim()

            };


            console.log(
                "================================="
            );

            console.log(
                "RESIDENT FEEDBACK REQUEST"
            );

            console.log(
                "Feedback Data:",
                feedbackData
            );

            console.log(
                "================================="
            );


            const response =
                await API.post(
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

                message:
                    "Your feedback has been submitted successfully."

            });


            // Keep resident location

            setFormData(prev => ({

                ...prev,

                comment: "",

                rating: "5"

            }));

        }

        catch (error) {

            console.error(
                "Resident feedback error:",
                error
            );


            const message =
                error?.response?.data?.message ||
                "Unable to submit your feedback. Please try again.";


            setToast({

                show: true,

                type: "error",

                message

            });

        }

        finally {

            setSubmitting(false);

        }

    };


    // ==========================================
    // CATEGORY
    // ==========================================

    const categoryOptions = [

        {
            value: "Service Quality",
            label: "Service Quality"
        },

        {
            value: "Delay",
            label: "Collection Delay"
        },

        {
            value: "Collector",
            label: "Collector Service"
        },

        {
            value: "Schedule",
            label: "Collection Schedule"
        },

        {
            value: "Other",
            label: "Other"
        }

    ];


    // ==========================================
    // RATING
    // ==========================================

    const ratingOptions = [

        {
            value: "5",
            label: "★★★★★  Excellent"
        },

        {
            value: "4",
            label: "★★★★☆  Very Good"
        },

        {
            value: "3",
            label: "★★★☆☆  Good"
        },

        {
            value: "2",
            label: "★★☆☆☆  Fair"
        },

        {
            value: "1",
            label: "★☆☆☆☆  Poor"
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
                            Feedback & Complaints
                        </h1>


                        <p className="
                            text-sm
                            text-gray-500
                            mt-1
                        ">
                            Share your experience or report
                            a problem with the waste collection service.
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
                        Submit Your Feedback
                    </h2>


                    <p className="
                        text-xs
                        text-gray-500
                        mt-1
                    ">
                        Your Kebele and Sefer are taken
                        automatically from your resident profile.
                    </p>

                </div>


                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >


                    {/* CATEGORY */}

                    <Select
                        label="Feedback Category"
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
                            Kebele
                        </label>

                        <input
                            type="text"
                            value={
                                formData.kebele ||
                                "Not assigned"
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
                            Sefer
                        </label>

                        <input
                            type="text"
                            value={
                                formData.sefer ||
                                "Not assigned"
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
                        label="Rating"
                        name="rating"
                        value={formData.rating}
                        onChange={handleChange}
                        options={ratingOptions}
                        required
                    />


                    {/* COMMENT */}

                    <Textarea
                        label="Feedback"
                        name="comment"
                        value={formData.comment}
                        onChange={handleChange}
                        placeholder="Describe your feedback, complaint, or experience..."
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
                                    Before submitting
                                </p>


                                <p className="
                                    text-xs
                                    text-blue-700
                                    mt-1
                                ">
                                    Your Kebele and Sefer are
                                    automatically included with your feedback.
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
                                ? "Submitting..."
                                : "Submit Feedback"}
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