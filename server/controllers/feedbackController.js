
// server/controllers/feedbackController.js

const feedbackService = require("../services/feedbackService");

// ==========================================
// Create Feedback
// ==========================================

const createFeedback = async (req, res, next) => {

    try {

        const userRole = req.user?.role;
        const userId = req.user?.id;

        if (!userId) {

            return res.status(401).json({
                success: false,
                message: "User authentication information is missing."
            });

        }

        const feedbackData = {

            ...req.body,

            resident_id:
                userRole === "RESIDENT"
                    ? userId
                    : null,

            business_id:
                userRole === "BUSINESS_OWNER"
                    ? userId
                    : null
        };


        // ==========================================
        // VALIDATION
        // ==========================================

        if (!feedbackData.comment?.trim()) {

            return res.status(400).json({
                success: false,
                message: "Feedback comment is required."
            });

        }


        if (!feedbackData.rating) {

            return res.status(400).json({
                success: false,
                message: "Feedback rating is required."
            });

        }


        if (!feedbackData.sefer?.trim()) {

            return res.status(400).json({
                success: false,
                message: "Sefer is required."
            });

        }


        if (!feedbackData.kebele?.trim()) {

            return res.status(400).json({
                success: false,
                message: "Kebele is required."
            });

        }


        const feedback =
            await feedbackService.createFeedback(
                feedbackData
            );


        return res.status(201).json({

            success: true,

            message:
                "Feedback submitted successfully.",

            data: feedback

        });

    }

    catch (error) {

        console.error(
            "Create Feedback Error:",
            error
        );

        next(error);
    }
};
// ==========================================
// Get All Feedback
// Municipal Admin / System Admin
// ==========================================

const getFeedbacks = async (req, res, next) => {

    try {

        const kifle_ketema =
            req.user?.kifle_ketema ||
            req.user?.assigned_kifle_ketema;

        console.log(
            "Municipal Admin:",
            req.user
        );

        console.log(
            "Admin Kifle Ketema:",
            kifle_ketema
        );

        if (!kifle_ketema) {

            return res.status(400).json({
                success: false,
                message:
                    "Municipal administrator Kifle Ketema is not assigned."
            });

        }

        const feedbacks =
            await feedbackService.getAllFeedback(
                kifle_ketema
            );

        return res.status(200).json({
            success: true,
            data: feedbacks
        });

    } catch (error) {

        console.error(
            "Get Feedback Error:",
            error
        );

        next(error);
    }
};

// ==========================================
// Get Feedback By ID
// ==========================================

const getFeedbackById = async (req, res, next) => {

    try {

        const feedback =
            await feedbackService.getFeedbackById(
                req.params.id
            );


        if (!feedback) {

            return res.status(404).json({

                success: false,

                message:
                    "Feedback not found."

            });

        }


        return res.status(200).json({

            success: true,

            data: feedback

        });

    }

    catch (error) {

        console.error(
            "Get Feedback By ID Error:",
            error
        );

        next(error);

    }

};


// ==========================================
// Update Feedback
// ==========================================

const updateFeedback = async (req, res, next) => {

    try {

        const feedback =
            await feedbackService.updateFeedback(

                req.params.id,

                req.body

            );


        if (!feedback) {

            return res.status(404).json({

                success: false,

                message:
                    "Feedback not found."

            });

        }


        return res.status(200).json({

            success: true,

            message:
                "Feedback updated successfully.",

            data: feedback

        });

    }

    catch (error) {

        console.error(
            "Update Feedback Error:",
            error
        );

        next(error);

    }

};


// ==========================================
// Delete Feedback
// ==========================================

const deleteFeedback = async (req, res, next) => {

    try {

        const deleted =
            await feedbackService.deleteFeedback(
                req.params.id
            );


        if (!deleted) {

            return res.status(404).json({

                success: false,

                message:
                    "Feedback not found."

            });

        }


        return res.status(200).json({

            success: true,

            message:
                "Feedback deleted successfully."

        });

    }

    catch (error) {

        console.error(
            "Delete Feedback Error:",
            error
        );

        next(error);

    }

};


// ==========================================
// Average Rating
// ==========================================

const averageRating = async (req, res, next) => {

    try {

        const rating =
            await feedbackService.averageRating();


        return res.status(200).json({

            success: true,

            data: rating

        });

    }

    catch (error) {

        console.error(
            "Average Rating Error:",
            error
        );

        next(error);

    }

};


// ==========================================
// EXPORT
// ==========================================

module.exports = {

    createFeedback,

    getFeedbacks,

    getFeedbackById,

    updateFeedback,

    deleteFeedback,

    averageRating

};
