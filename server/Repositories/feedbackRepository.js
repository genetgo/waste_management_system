const { pool } = require("../config/db");

// ===========================================
// Get Feedback By Kifle Ketema
// ===========================================
const getAllFeedback = async (kifle_ketema) => {

    const { rows } = await pool.query(
        `
        SELECT
            f.feedback_id,
            f.resident_id,
            f.business_id,
            f.comment,
            f.rating,
            f.feedback_date,
            f.created_at,
            f.sefer,

            -- USER
            COALESCE(
                r.full_name,
                b.owner_name,
                b.business_name
            ) AS user_name,

            -- PHONE
            COALESCE(
                r.phone_number,
                b.phone_number
            ) AS phone_number,

            -- EMAIL
            COALESCE(
                r.email,
                b.email
            ) AS email,

            -- KEBELE
            COALESCE(
                r.kebele,
                b.kebele
            ) AS kebele,

            -- KIFLE KETEMA
            COALESCE(
                r.kifle_ketema,
                b.kifle_ketema
            ) AS kifle_ketema,

            -- BUSINESS
            b.business_name,
            b.owner_name AS business_owner_name,

            -- RESIDENT
            r.full_name AS resident_name

        FROM feedback f

        LEFT JOIN residents r
            ON f.resident_id = r.resident_id

        LEFT JOIN business_owners b
            ON f.business_id = b.business_id

        WHERE
            COALESCE(
                r.kifle_ketema,
                b.kifle_ketema
            ) = $1

        ORDER BY f.created_at DESC
        `,
        [kifle_ketema]
    );

    return rows;
};
// ===========================================
// Get Feedback By ID
// ===========================================
const getFeedbackById = async (id) => {

    const { rows } = await pool.query(`
        SELECT
            f.feedback_id,
            f.resident_id,
            f.business_id,
            f.comment,
            f.rating,
            f.feedback_date,
            f.created_at,
            f.sefer,
            f.kebele,

            r.full_name AS resident_name,
            r.phone_number AS resident_phone,

            b.business_name,
            b.owner_name AS business_owner_name,
            b.phone_number AS business_phone

        FROM feedback f

        LEFT JOIN residents r
            ON f.resident_id = r.resident_id

        LEFT JOIN business_owners b
            ON f.business_id = b.business_id

        WHERE f.feedback_id = $1
    `, [id]);

    return rows[0] || null;
};


// ===========================================
// Get Resident Feedback
// ===========================================
const getResidentFeedback = async (residentId) => {

    const { rows } = await pool.query(`
        SELECT *
        FROM feedback
        WHERE resident_id = $1
        ORDER BY created_at DESC
    `, [residentId]);

    return rows;
};


// ===========================================
// Get Business Feedback
// ===========================================
const getBusinessFeedback = async (businessId) => {

    const { rows } = await pool.query(`
        SELECT *
        FROM feedback
        WHERE business_id = $1
        ORDER BY created_at DESC
    `, [businessId]);

    return rows;
};


// ===========================================
// Create Feedback
// ===========================================
const createFeedback = async (feedback) => {

    const {
        resident_id,
        business_id,
        comment,
        rating,
        sefer
        
    } = feedback;

    const { rows } = await pool.query(`
        INSERT INTO feedback
        (
            resident_id,
            business_id,
            comment,
            rating,
            sefer
            
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
    `, [
        resident_id || null,
        business_id || null,
        comment,
        rating,
        sefer,
        
    ]);

    return rows[0];
};


// ===========================================
// Update Feedback
// ===========================================
const updateFeedback = async (id, feedback) => {

    const {
        comment,
        rating,
        sefer,
        kebele
    } = feedback;

    const { rows } = await pool.query(`
        UPDATE feedback
        SET
            comment = $1,
            rating = $2,
            sefer = $3,
            kebele = $4
        WHERE feedback_id = $5
        RETURNING *
    `, [
        comment,
        rating,
        sefer,
        kebele,
        id
    ]);

    return rows[0] || null;
};


// ===========================================
// Delete Feedback
// ===========================================
const deleteFeedback = async (id) => {

    const { rows } = await pool.query(`
        DELETE FROM feedback
        WHERE feedback_id = $1
        RETURNING *
    `, [id]);

    return rows[0] || null;
};


// ===========================================
// Average Rating
// ===========================================
const averageRating = async () => {

    const { rows } = await pool.query(`
        SELECT
            ROUND(AVG(rating)::numeric, 2) AS average_rating,
            COUNT(*) AS total_feedback
        FROM feedback
    `);

    return rows[0];
};


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