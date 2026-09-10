const { pool } = require("../config/db");

// ===========================================
// Get All Feedback
// Municipal Admin
//
// business_id != NULL  => Business Feedback
// business_id == NULL  => Public Feedback
// ===========================================
const getAllFeedback = async (kifle_ketema = null) => {
    let query = `
        SELECT
            f.feedback_id,
            f.business_id,
            f.category,
            f.kifle_ketema,
            f.kebele,
            f.sefer,
            f.rating,
            f.description,
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
    // ===========================================
    if (kifle_ketema) {
        query += `
            WHERE f.kifle_ketema = $1
        `;

        values.push(kifle_ketema);
    }

    // ===========================================
    // ORDER
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
// Get Feedback By ID
// ===========================================
const getFeedbackById = async (id) => {
    const { rows } = await pool.query(
        `
        SELECT
            f.feedback_id,
            f.business_id,
            f.category,
            f.kifle_ketema,
            f.kebele,
            f.sefer,
            f.rating,
            f.description,
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
// Get Business Feedback
// ===========================================
const getBusinessFeedback = async (businessId) => {
    const { rows } = await pool.query(
        `
        SELECT
            f.feedback_id,
            f.business_id,
            f.category,
            f.kifle_ketema,
            f.kebele,
            f.sefer,
            f.rating,
            f.description,
            f.feedback_date,
            f.created_at,

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
// Create Feedback
//
// Business Feedback:
// business_id = business owner's ID
//
// Public Feedback:
// business_id = null
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
            description
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
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
// Update Feedback
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
// Delete Feedback
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
// Average Rating
// ===========================================
const averageRating = async () => {
    const { rows } = await pool.query(
        `
        SELECT
            ROUND(AVG(rating)::numeric, 2) AS average_rating,
            COUNT(*) AS total_feedback
        FROM feedback
        `
    );

    return rows[0];
};


module.exports = {
    getAllFeedback,
    getFeedbackById,
    getBusinessFeedback,
    createFeedback,
    updateFeedback,
    deleteFeedback,
    averageRating
};