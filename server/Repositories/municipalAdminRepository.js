
const { pool } = require("../config/db");

// ==========================================
// Create Municipal Administrator
// ==========================================
const createMunicipalAdmin = async (adminData) => {
    const {
        full_name,
        phone_number,
        email,
        password_hash,
        assigned_kifle_ketema,
        profile_image,
        is_active
    } = adminData;

    const query = `
        INSERT INTO municipal_administrators
        (
            full_name,
            phone_number,
            email,
            password_hash,
            assigned_kifle_ketema,
            profile_image,
            is_active
        )
        VALUES ($1,$2,LOWER($3),$4,$5,$6,$7)
        RETURNING *;
    `;

    const values = [
        full_name,
        phone_number,
        email ? email.trim() : null,
        password_hash,
        assigned_kifle_ketema,
        profile_image,
        is_active
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
};

// ==========================================
// Get All Municipal Administrators
// ==========================================
const getAllMunicipalAdmins = async () => {

    const query = `
        SELECT *
        FROM municipal_administrators
        ORDER BY admin_id ASC;
    `;

    const result = await pool.query(query);

    return result.rows;
};

// ==========================================
// Get Municipal Administrator By ID
// ==========================================
const getMunicipalAdminById = async (adminId) => {

    const query = `
        SELECT *
        FROM municipal_administrators
        WHERE admin_id=$1;
    `;

    const result = await pool.query(query, [adminId]);

    return result.rows[0];
};

// ==========================================
// Get Municipal Administrator By Email
// ==========================================
const getMunicipalAdminByEmail = async (email) => {

    if (!email) return null;

    const query = `
        SELECT *
        FROM municipal_administrators
        WHERE LOWER(email)=LOWER($1);
    `;

    const result = await pool.query(query, [email.trim()]);

    return result.rows[0];
};

// ==========================================
// Get Municipal Administrators By Kifle Ketema
// ==========================================
const getMunicipalAdminsByKifleKetema = async (
    kifleKetema
) => {

    const query = `
        SELECT *
        FROM municipal_administrators
        WHERE assigned_kifle_ketema = $1
        AND is_active = true
        ORDER BY full_name ASC;
    `;

    const result =
        await pool.query(
            query,
            [kifleKetema]
        );

    return result.rows;
};

// ==========================================
// Update Municipal Administrator
// ==========================================
const updateMunicipalAdmin = async (adminId, adminData) => {

    const {
        full_name,
        phone_number,
        email,
        assigned_kifle_ketema,
        profile_image,
        is_active,
        password_hash
    } = adminData;

    const query = `
        UPDATE municipal_administrators
SET
    full_name = COALESCE($1, full_name),
    phone_number = COALESCE($2, phone_number),
    email = COALESCE(LOWER($3), email),
    assigned_kifle_ketema = COALESCE($4, assigned_kifle_ketema),
    profile_image = COALESCE($5, profile_image),
    is_active = COALESCE($6, is_active),
    password_hash = COALESCE($7, password_hash),
    updated_at = CURRENT_TIMESTAMP
WHERE admin_id = $8
RETURNING *;
    `;

    const values = [
        full_name,
        phone_number,
        email ? email.trim() : null,
        assigned_kifle_ketema,
        profile_image,
        is_active,
        password_hash || null,
        adminId
    ];

    const result = await pool.query(query, values);

    return result.rows[0];
};

// ==========================================
// Delete Municipal Administrator
// ==========================================
const deleteMunicipalAdmin = async (adminId) => {

    const query = `
        DELETE FROM municipal_administrators
        WHERE admin_id=$1
        RETURNING *;
    `;

    const result = await pool.query(query, [adminId]);

    return result.rows[0];
};

// ==========================================
// Municipal Admin Dashboard
// ==========================================
const getDashboard = async (adminId) => {

    const admin = await getMunicipalAdminById(adminId);

    if (!admin) return null;

    const kifleKetema = admin.assigned_kifle_ketema;

    const residents = await pool.query(
        `
        SELECT COUNT(*) total
        FROM residents
        WHERE kifle_ketema=$1
        `,
        [kifleKetema]
    );

    const businesses = await pool.query(
        `
        SELECT COUNT(*) total
        FROM business_owners
        WHERE kifle_ketema=$1
        `,
        [kifleKetema]
    );

    const collectors = await pool.query(
        `
        SELECT COUNT(*) total
        FROM collectors
        WHERE assigned_kifle_ketema=$1
        AND status='Active'
        `,
        [kifleKetema]
    );

    const requests = await pool.query(
        `
        SELECT COUNT(*) total
        FROM on_demand_requests
        WHERE kifle_ketema=$1
        AND status='Pending'
        `,
        [kifleKetema]
    );

    return {
        admin,
        totalResidents:Number(residents.rows[0].total),
        totalBusinesses:Number(businesses.rows[0].total),
        activeCollectors:Number(collectors.rows[0].total),
        pendingRequests:Number(requests.rows[0].total),
    };
};
// ==========================================
// Activate / Deactivate Administrator
// ==========================================
const changeMunicipalAdminStatus = async (adminId, status) => {

    const query = `
        UPDATE municipal_administrators
        SET
            is_active=$1,
            updated_at=CURRENT_TIMESTAMP
        WHERE admin_id=$2
        RETURNING *;
    `;

    const result = await pool.query(query, [status, adminId]);

    return result.rows[0];
};

// ==========================================
// Module Exports
// ==========================================
module.exports = {
    createMunicipalAdmin,
    getDashboard,
    getAllMunicipalAdmins,
    getMunicipalAdminById,
    getMunicipalAdminByEmail,
    getMunicipalAdminsByKifleKetema,
    updateMunicipalAdmin,
    deleteMunicipalAdmin,
    changeMunicipalAdminStatus,

    
    createAdmin: createMunicipalAdmin,
    getAdmins: getAllMunicipalAdmins,
    getAdminById: getMunicipalAdminById,
    updateAdmin: updateMunicipalAdmin,
    deleteAdmin: deleteMunicipalAdmin,
    dashboard: getDashboard,
    getAdminByEmail: getMunicipalAdminByEmail,
};