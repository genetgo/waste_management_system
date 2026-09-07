
// server/services/feedbackService.js

const feedbackRepository = require("../repositories/feedbackRepository");

// ===========================================
// Get All Feedback
// Municipal Admin / System Admin
// ===========================================

const getAllFeedback = async (kifle_ketema) => {
try{
    const feedbacks =
        await feedbackRepository.getAllFeedback(
            kifle_ketema
        );

    return feedbacks;

    } catch (error) {

        console.error(
            "Get All Feedback Service Error:",
            error
        );

        throw error;
    }
};


// ===========================================
// Get Feedback By ID
// ===========================================

const getFeedbackById = async (id) => {
    try {

        const feedback =
            await feedbackRepository.getFeedbackById(id);

        return feedback;

    } catch (error) {

        console.error(
            "Get Feedback By ID Service Error:",
            error
        );

        throw error;
    }
};


// ===========================================
// Get Resident Feedback
// ===========================================

const getResidentFeedback = async (residentId) => {
    try {

        const feedbacks =
            await feedbackRepository.getResidentFeedback(
                residentId
            );

        return feedbacks;

    } catch (error) {

        console.error(
            "Get Resident Feedback Service Error:",
            error
        );

        throw error;
    }
};


// ===========================================
// Get Business Feedback
// ===========================================

const getBusinessFeedback = async (businessId) => {
    try {

        const feedbacks =
            await feedbackRepository.getBusinessFeedback(
                businessId
            );

        return feedbacks;

    } catch (error) {

        console.error(
            "Get Business Feedback Service Error:",
            error
        );

        throw error;
    }
};


// ===========================================
// Create Feedback
// ===========================================

const createFeedback = async (feedback) => {

    try {

        if (!feedback) {
            throw new Error(
                "Feedback data is required."
            );
        }


        if (!feedback.comment?.trim()) {
            throw new Error(
                "Feedback comment is required."
            );
        }


        if (!feedback.rating) {
            throw new Error(
                "Feedback rating is required."
            );
        }


        const rating = Number(
            feedback.rating
        );


        if (
            Number.isNaN(rating) ||
            rating < 1 ||
            rating > 5
        ) {
            throw new Error(
                "Rating must be between 1 and 5."
            );
        }


        if (!feedback.sefer?.trim()) {
            throw new Error(
                "Sefer is required."
            );
        }


        if (!feedback.kebele?.trim()) {
            throw new Error(
                "Kebele is required."
            );
        }


        return await feedbackRepository.createFeedback({

            ...feedback,

            rating,

            sefer:
                feedback.sefer.trim(),

            kebele:
                feedback.kebele.trim(),

            comment:
                feedback.comment.trim()

        });

    }

    catch (error) {

        console.error(
            "Create Feedback Service Error:",
            error
        );

        throw error;
    }
};


// ===========================================
// Update Feedback
// ===========================================

const updateFeedback = async (
    id,
    feedback
) => {

    try {

        if (!id) {
            throw new Error(
                "Feedback ID is required."
            );
        }

        if (!feedback) {
            throw new Error(
                "Feedback data is required."
            );
        }

        const rating =
            Number(feedback.rating);

        if (
            Number.isNaN(rating) ||
            rating < 1 ||
            rating > 5
        ) {
            throw new Error(
                "Rating must be between 1 and 5."
            );
        }

        const updatedFeedback =
            await feedbackRepository.updateFeedback(
                id,
                {
                    comment: feedback.comment,
                    rating
                }
            );

        return updatedFeedback;

    } catch (error) {

        console.error(
            "Update Feedback Service Error:",
            error
        );

        throw error;
    }
};


// ===========================================
// Delete Feedback
// ===========================================

const deleteFeedback = async (id) => {

    try {

        if (!id) {
            throw new Error(
                "Feedback ID is required."
            );
        }

        const deletedFeedback =
            await feedbackRepository.deleteFeedback(
                id
            );

        return deletedFeedback;

    } catch (error) {

        console.error(
            "Delete Feedback Service Error:",
            error
        );

        throw error;
    }
};


// ===========================================
// Average Rating
// ===========================================

const averageRating = async () => {

    try {

        const result =
            await feedbackRepository.averageRating();

        return result;

    } catch (error) {

        console.error(
            "Average Rating Service Error:",
            error
        );

        throw error;
    }
};


// ===========================================
// EXPORT
// ===========================================

module.exports = {

    getAllFeedback,

    getFeedbackById,

    getResidentFeedback,

    getBusinessFeedback,

    createFeedback,

    updateFeedback,

    deleteFeedback,

    averageRating

};
