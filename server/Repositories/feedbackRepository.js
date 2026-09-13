
const { pool } = require("../config/db");

// ===========================================
// GET ALL FEEDBACK
// Municipal Admin
//
// business_id != NULL  => Business Feedback
// business_id == NULL  => Public Feedback
//
// Returns:
// - Business information
// - Kifle Ketema
// - Kebele
// - Sefer
// - Category
// - Rating
// - FULL DESCRIPTION / COMMENT
// - Status
// - Date
// ===========================================

const getAllFeedback = async (kifle_ketema = null) => {
    let query = `
        SELECT
            f.feedback_id,
            f.business_id,

            -- FEEDBACK INFORMATION
            f.category,
            f.kifle_ketema,
            f.kebele,
            f.sefer,
            f.rating,
            f.description,
            f.status,
            f.feedback_date,
            f.created_at,

            -- BUSINESS INFORMATION
            b.business_name,
            b.owner_name AS business_owner_name,
            b.phone_number AS business_phone,
            b.email AS business_email

        FROM feedback f

        LEFT JOIN business_owners b
            ON f.business_id = b.business_id
    `;

    const values = [];

    // ===========================================
    // FILTER BY KIFLE KETEMA
    //
    // Municipal Admin sees only assigned
    // Kifle Ketema feedback.
    // ===========================================

    if (kifle_ketema) {
        query += `
            WHERE LOWER(f.kifle_ketema) = LOWER($1)
        `;

        values.push(kifle_ketema);
    }

    // ===========================================
    // ORDER
    // Newest feedback first
    // ===========================================

    query += `
        ORDER BY f.created_at DESC
    `;

    const { rows } = await pool.query(
        query,
        values
    );

    return rows;
};


// ===========================================
// GET FEEDBACK BY ID
//
// Returns COMPLETE feedback information.
// Used by Municipal Admin View Feedback
// and Business Owner feedback status.
// ===========================================

const getFeedbackById = async (id) => {
    const { rows } = await pool.query(
        `
        SELECT
            f.feedback_id,
            f.business_id,

            -- FEEDBACK INFORMATION
            f.category,
            f.kifle_ketema,
            f.kebele,
            f.sefer,
            f.rating,
            f.description,
            f.status,
            f.feedback_date,
            f.created_at,

            -- BUSINESS INFORMATION
            b.business_name,
            b.owner_name AS business_owner_name,
            b.phone_number AS business_phone,
            b.email AS business_email

        FROM feedback f

        LEFT JOIN business_owners b
            ON f.business_id = b.business_id

        WHERE f.feedback_id = $1
        `,
        [id]
    );

    return rows[0] || null;
};


// ===========================================
// GET BUSINESS FEEDBACK
//
// Business Owner can see their own feedback.
//
// Returns:
// - Category
// - Kifle Ketema
// - Kebele
// - Sefer
// - Rating
// - FULL COMMENT
// - Status
// - Date
// ===========================================

const getBusinessFeedback = async (businessId) => {
    const { rows } = await pool.query(
        `
        SELECT
            f.feedback_id,
            f.business_id,

            -- FEEDBACK INFORMATION
            f.category,
            f.kifle_ketema,
            f.kebele,
            f.sefer,
            f.rating,
            f.description,
            f.status,
            f.feedback_date,
            f.created_at,

            -- BUSINESS INFORMATION
            b.business_name,
            b.owner_name AS business_owner_name,
            b.phone_number AS business_phone,
            b.email AS business_email

        FROM feedback f

        LEFT JOIN business_owners b
            ON f.business_id = b.business_id

        WHERE f.business_id = $1

        ORDER BY f.created_at DESC
        `,
        [businessId]
    );

    return rows;
};


// ===========================================
// CREATE FEEDBACK
//
// Business Feedback:
// business_id = Business Owner ID
//
// Public Feedback:
// business_id = NULL
//
// ALL CATEGORIES ARE ALLOWED.
//
// FULL COMMENT is saved in:
// description
//
// New feedback:
// status = Pending
// ===========================================

const createFeedback = async (feedback) => {
    const {
        business_id,
        category,
        kifle_ketema,
        kebele,
        sefer,
        rating,
        description
    } = feedback;

    const { rows } = await pool.query(
        `
        INSERT INTO feedback
        (
            business_id,
            category,
            kifle_ketema,
            kebele,
            sefer,
            rating,
            description,
            status
        )
        VALUES
        (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            'Pending'
        )
        RETURNING *
        `,
        [
            business_id || null,
            category,
            kifle_ketema,
            kebele,
            sefer,
            rating,
            description || null
        ]
    );

    return rows[0];
};


// ===========================================
// MARK FEEDBACK AS VIEWED
//
// Municipal Admin:
// View Feedback
//
// Pending -> Viewed
//
// Already Viewed:
// remains Viewed
// ===========================================

const markFeedbackAsViewed = async (id) => {
    const { rows } = await pool.query(
        `
        UPDATE feedback
        SET
            status = CASE
                WHEN status = 'Pending'
                    THEN 'Viewed'
                ELSE status
            END
        WHERE feedback_id = $1

        RETURNING *
        `,
        [id]
    );

    return rows[0] || null;
};


// ===========================================
// UPDATE FEEDBACK
//
// Updates complete feedback information.
// ===========================================

const updateFeedback = async (id, feedback) => {
    const {
        category,
        kifle_ketema,
        kebele,
        sefer,
        rating,
        description
    } = feedback;

    const { rows } = await pool.query(
        `
        UPDATE feedback
        SET
            category = $1,
            kifle_ketema = $2,
            kebele = $3,
            sefer = $4,
            rating = $5,
            description = $6
        WHERE feedback_id = $7

        RETURNING *
        `,
        [
            category,
            kifle_ketema,
            kebele,
            sefer,
            rating,
            description || null,
            id
        ]
    );

    return rows[0] || null;
};


// ===========================================
// DELETE FEEDBACK
//
// Municipal Admin can delete feedback
// if route permission allows it.
//
// Returns deleted feedback.
// ===========================================

const deleteFeedback = async (id) => {
    const { rows } = await pool.query(
        `
        DELETE FROM feedback
        WHERE feedback_id = $1

        RETURNING *
        `,
        [id]
    );

    return rows[0] || null;
};


// ===========================================
// AVERAGE RATING
//
// Returns:
// - Average rating
// - Total feedback
// ===========================================

const averageRating = async () => {
    const { rows } = await pool.query(
        `
        SELECT
            ROUND(
                AVG(rating)::numeric,
                2
            ) AS average_rating,

            COUNT(*) AS total_feedback

        FROM feedback
        `
    );

    return rows[0];
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
