
const feedbackService = require("../services/feedbackService");


// ==========================================
// CREATE BUSINESS FEEDBACK
// ==========================================

const createFeedback = async (req, res, next) => {
    try {

        console.log("=================================");
        console.log("CREATE BUSINESS FEEDBACK");
        console.log("USER:", req.user);
        console.log("BODY:", req.body);
        console.log("=================================");


        // ==========================================
        // AUTHENTICATION
        // ==========================================

        const userRole = String(
            req.user?.role || ""
        )
            .trim()
            .toUpperCase();

        const userId = req.user?.id;


        if (!userId) {
            return res.status(401).json({
                success: false,
                message:
                    "User authentication information is missing."
            });
        }


        // ==========================================
        // ONLY BUSINESS OWNER
        // ==========================================

        if (
            userRole !== "BUSINESS_OWNER" &&
            userRole !== "BUSINESS OWNER"
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "Only Business Owner can submit feedback."
            });
        }


        // ==========================================
        // GET BUSINESS KIFLE KETEMA
        // FROM JWT
        // ==========================================

        const kifle_ketema =
            req.user?.kifle_ketema ||
            req.user?.assigned_kifle_ketema;


        if (!kifle_ketema) {
            return res.status(400).json({
                success: false,
                message:
                    "Business owner Kifle Ketema is not assigned."
            });
        }


        // ==========================================
        // GET FEEDBACK DATA
        // ==========================================

        const {
            category,
            kebele,
            sefer,
            rating,
            description
        } = req.body;


        // ==========================================
        // VALIDATION
        // ==========================================

        if (!category?.trim()) {
            return res.status(400).json({
                success: false,
                message:
                    "Feedback category is required."
            });
        }


        if (!kebele?.trim()) {
            return res.status(400).json({
                success: false,
                message:
                    "Kebele is required."
            });
        }


        if (!sefer?.trim()) {
            return res.status(400).json({
                success: false,
                message:
                    "Sefer is required."
            });
        }


        if (
            rating === undefined ||
            rating === null ||
            rating === ""
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Rating is required."
            });
        }


        const numericRating = Number(rating);


        if (
            Number.isNaN(numericRating) ||
            numericRating < 1 ||
            numericRating > 5
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Rating must be between 1 and 5."
            });
        }


        // ==========================================
        // PREPARE BUSINESS FEEDBACK
        //
        // ALL CATEGORIES ALLOWED
        // COMMENT/DESCRIPTION OPTIONAL
        // ==========================================

        const feedbackData = {

            business_id: userId,

            category:
                category.trim(),

            kifle_ketema:
                kifle_ketema.trim(),

            kebele:
                kebele.trim(),

            sefer:
                sefer.trim(),

            rating:
                numericRating,

            description:
                description?.trim() || null
        };


        console.log(
            "FINAL BUSINESS FEEDBACK DATA:",
            feedbackData
        );


        // ==========================================
        // CREATE
        // ==========================================

        const feedback =
            await feedbackService.createFeedback(
                feedbackData
            );


        return res.status(201).json({
            success: true,

            message:
                "Business feedback submitted successfully.",

            data: feedback
        });

    } catch (error) {

        console.error(
            "Create Business Feedback Error:",
            error
        );

        next(error);
    }
};



// ==========================================
// CREATE PUBLIC FEEDBACK
// ==========================================

const createPublicFeedback = async (
    req,
    res,
    next
) => {

    try {

        console.log("=================================");
        console.log("CREATE PUBLIC FEEDBACK");
        console.log("BODY:", req.body);
        console.log("=================================");


        // ==========================================
        // GET DATA
        // ==========================================

        const {
            category,
            kifle_ketema,
            kebele,
            sefer,
            rating,
            description
        } = req.body;


        // ==========================================
        // VALIDATION
        // ==========================================

        if (!kifle_ketema?.trim()) {
            return res.status(400).json({
                success: false,
                message:
                    "Kifle Ketema is required."
            });
        }


        if (!kebele?.trim()) {
            return res.status(400).json({
                success: false,
                message:
                    "Kebele is required."
            });
        }


        if (!sefer?.trim()) {
            return res.status(400).json({
                success: false,
                message:
                    "Sefer is required."
            });
        }


        if (!category?.trim()) {
            return res.status(400).json({
                success: false,
                message:
                    "Feedback category is required."
            });
        }


        if (
            rating === undefined ||
            rating === null ||
            rating === ""
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Rating is required."
            });
        }


        const numericRating = Number(rating);


        if (
            Number.isNaN(numericRating) ||
            numericRating < 1 ||
            numericRating > 5
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Rating must be between 1 and 5."
            });
        }


        // ==========================================
        // PREPARE PUBLIC FEEDBACK
        //
        // business_id = NULL
        // ==========================================

        const feedbackData = {

            business_id: null,

            category:
                category.trim(),

            kifle_ketema:
                kifle_ketema.trim(),

            kebele:
                kebele.trim(),

            sefer:
                sefer.trim(),

            rating:
                numericRating,

            description:
                description?.trim() || null
        };


        console.log(
            "FINAL PUBLIC FEEDBACK DATA:",
            feedbackData
        );


        // ==========================================
        // CREATE
        // ==========================================

        const feedback =
            await feedbackService.createFeedback(
                feedbackData
            );


        return res.status(201).json({
            success: true,

            message:
                "Public feedback submitted successfully.",

            data: feedback
        });

    } catch (error) {

        console.error(
            "Create Public Feedback Error:",
            error
        );

        next(error);
    }
};



// ==========================================
// GET ALL FEEDBACK
// MUNICIPAL ADMIN
// ==========================================

const getFeedbacks = async (
    req,
    res,
    next
) => {

    try {

        console.log("=================================");
        console.log("MUNICIPAL ADMIN FEEDBACK");
        console.log("USER:", req.user);
        console.log("=================================");


        const kifle_ketema =
            req.user?.kifle_ketema ||
            req.user?.assigned_kifle_ketema ||
            null;


        console.log(
            "Admin Kifle Ketema:",
            kifle_ketema
        );


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
// GET FEEDBACK BY ID
// ==========================================

const getFeedbackById = async (
    req,
    res,
    next
) => {

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

    } catch (error) {

        console.error(
            "Get Feedback By ID Error:",
            error
        );

        next(error);
    }
};



// ==========================================
// GET PUBLIC FEEDBACK BY ID
//
// Used by public user to check:
// Pending -> Viewed
// ==========================================

const getPublicFeedbackById = async (
    req,
    res,
    next
) => {

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


        // ==========================================
        // PUBLIC FEEDBACK ONLY
        // business_id must be NULL
        // ==========================================

        if (feedback.business_id !== null) {
            return res.status(404).json({
                success: false,
                message:
                    "Public feedback not found."
            });
        }


        return res.status(200).json({
            success: true,
            data: feedback
        });

    } catch (error) {

        console.error(
            "Get Public Feedback Error:",
            error
        );

        next(error);
    }
};



// ==========================================
// MARK FEEDBACK AS VIEWED
// MUNICIPAL ADMIN
//
// Pending -> Viewed
// Already Viewed -> stays Viewed
// ==========================================

const markFeedbackAsViewed = async (
    req,
    res,
    next
) => {

    try {

        console.log("=================================");
        console.log("MARK FEEDBACK AS VIEWED");
        console.log("FEEDBACK ID:", req.params.id);
        console.log("USER:", req.user);
        console.log("=================================");


        const feedback =
            await feedbackService.markFeedbackAsViewed(
                req.params.id
            );


        if (!feedback) {
            return res.status(404).json({
                success: false,
                message:
                    "Feedback not found."
            });
        }


        console.log(
            "FEEDBACK STATUS:",
            feedback.status
        );


        return res.status(200).json({

            success: true,

            message:
                "Feedback marked as Viewed.",

            data: feedback
        });

    } catch (error) {

        console.error(
            "Mark Feedback As Viewed Error:",
            error
        );

        next(error);
    }
};



// ==========================================
// UPDATE FEEDBACK
// ==========================================

const updateFeedback = async (
    req,
    res,
    next
) => {

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

    } catch (error) {

        console.error(
            "Update Feedback Error:",
            error
        );

        next(error);
    }
};



// ==========================================
// DELETE FEEDBACK
// MUNICIPAL ADMIN
// ==========================================

const deleteFeedback = async (
    req,
    res,
    next
) => {

    try {

        console.log("=================================");
        console.log("DELETE FEEDBACK");
        console.log("FEEDBACK ID:", req.params.id);
        console.log("USER:", req.user);
        console.log("=================================");


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
                "Feedback deleted successfully.",

            data: deleted
        });

    } catch (error) {

        console.error(
            "Delete Feedback Error:",
            error
        );

        next(error);
    }
};



// ==========================================
// AVERAGE RATING
// ==========================================

const averageRating = async (
    req,
    res,
    next
) => {

    try {

        const rating =
            await feedbackService.averageRating();


        return res.status(200).json({

            success: true,

            data: rating
        });

    } catch (error) {

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

    createPublicFeedback,

    getFeedbacks,

    getFeedbackById,

    getPublicFeedbackById,

    markFeedbackAsViewed,

    updateFeedback,

    deleteFeedback,

    averageRating
};
