
const feedbackRepository = require("../repositories/feedbackRepository");

// ===========================================
// Get All Feedback
// Municipal Admin
// ===========================================

const getAllFeedback = async (kifle_ketema = null) => {
    try {
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
        if (!id) {
            throw new Error("Feedback ID is required.");
        }

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
// Get Business Feedback
// ===========================================

const getBusinessFeedback = async (businessId) => {
    try {
        if (!businessId) {
            throw new Error("Business ID is required.");
        }

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
//
// business_id != null => Business Feedback
// business_id == null => Public Feedback
//
// Supported Categories:
// - Service Quality
// - Delay / Collection Delay
// - Collector
// - Schedule
// ===========================================

const createFeedback = async (feedback) => {
    try {

        if (!feedback) {
            throw new Error("Feedback data is required.");
        }


        // ---------------------------------------
        // Category
        // ---------------------------------------

        if (!feedback.category?.trim()) {
            throw new Error(
                "Feedback category is required."
            );
        }


        // ---------------------------------------
        // Kifle Ketema
        // ---------------------------------------

        if (!feedback.kifle_ketema?.trim()) {
            throw new Error(
                "Kifle Ketema is required."
            );
        }


        // ---------------------------------------
        // Kebele
        // ---------------------------------------

        if (!feedback.kebele?.trim()) {
            throw new Error(
                "Kebele is required."
            );
        }


        // ---------------------------------------
        // Sefer
        // ---------------------------------------

        if (!feedback.sefer?.trim()) {
            throw new Error(
                "Sefer is required."
            );
        }


        // ---------------------------------------
        // Rating
        // ---------------------------------------

        if (
            feedback.rating === undefined ||
            feedback.rating === null ||
            feedback.rating === ""
        ) {
            throw new Error(
                "Rating is required."
            );
        }


        const rating = Number(feedback.rating);


        if (
            Number.isNaN(rating) ||
            rating < 1 ||
            rating > 5
        ) {
            throw new Error(
                "Rating must be between 1 and 5."
            );
        }


        // ---------------------------------------
        // Prepare Data
        // ---------------------------------------

        const feedbackData = {

            business_id:
                feedback.business_id || null,

            category:
                feedback.category.trim(),

            kifle_ketema:
                feedback.kifle_ketema.trim(),

            kebele:
                feedback.kebele.trim(),

            sefer:
                feedback.sefer.trim(),

            rating,

            description:
                feedback.description?.trim() || null
        };


        console.log(
            "FINAL FEEDBACK SERVICE DATA:",
            feedbackData
        );


        // ---------------------------------------
        // Save Feedback
        // ---------------------------------------

        const createdFeedback =
            await feedbackRepository.createFeedback(
                feedbackData
            );

        return createdFeedback;

    } catch (error) {

        console.error(
            "Create Feedback Service Error:",
            error
        );

        throw error;
    }
};


// ===========================================
// Mark Feedback As Viewed
//
// Pending -> Viewed
// Already Viewed -> stays Viewed
// ===========================================

// ===========================================
// Mark Feedback As Viewed
//
// Pending -> Viewed
// Already Viewed -> stays Viewed
// ===========================================

const markFeedbackAsViewed = async (id) => {
    try {

        if (!id) {
            throw new Error(
                "Feedback ID is required."
            );
        }

        // 1. Change status to Viewed
        await feedbackRepository.markFeedbackAsViewed(id);

        // 2. Get complete feedback information
        //    This includes business phone and email
        const feedback =
            await feedbackRepository.getFeedbackById(id);

        if (!feedback) {
            throw new Error("Feedback not found.");
        }

        return feedback;

    } catch (error) {

        console.error(
            "Mark Feedback As Viewed Service Error:",
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


        // ---------------------------------------
        // Category
        // ---------------------------------------

        if (!feedback.category?.trim()) {
            throw new Error(
                "Feedback category is required."
            );
        }


        // ---------------------------------------
        // Kifle Ketema
        // ---------------------------------------

        if (!feedback.kifle_ketema?.trim()) {
            throw new Error(
                "Kifle Ketema is required."
            );
        }


        // ---------------------------------------
        // Kebele
        // ---------------------------------------

        if (!feedback.kebele?.trim()) {
            throw new Error(
                "Kebele is required."
            );
        }


        // ---------------------------------------
        // Sefer
        // ---------------------------------------

        if (!feedback.sefer?.trim()) {
            throw new Error(
                "Sefer is required."
            );
        }


        // ---------------------------------------
        // Rating
        // ---------------------------------------

        if (
            feedback.rating === undefined ||
            feedback.rating === null ||
            feedback.rating === ""
        ) {
            throw new Error(
                "Rating is required."
            );
        }


        const rating = Number(feedback.rating);


        if (
            Number.isNaN(rating) ||
            rating < 1 ||
            rating > 5
        ) {
            throw new Error(
                "Rating must be between 1 and 5."
            );
        }


        // ---------------------------------------
        // Update Data
        // ---------------------------------------

        const updatedFeedback =
            await feedbackRepository.updateFeedback(
                id,
                {
                    category:
                        feedback.category.trim(),

                    kifle_ketema:
                        feedback.kifle_ketema.trim(),

                    kebele:
                        feedback.kebele.trim(),

                    sefer:
                        feedback.sefer.trim(),

                    rating,

                    description:
                        feedback.description?.trim() ||
                        null
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

    getBusinessFeedback,

    createFeedback,

    markFeedbackAsViewed,

    updateFeedback,

    deleteFeedback,

    averageRating
};