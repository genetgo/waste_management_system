const { pool } = require("../config/db");

class AuthRepository {


// =====================================================
// RESIDENT
// =====================================================

async findResidentByPhone(phoneNumber) {
    const query = `
        SELECT *
        FROM residents
        WHERE phone_number = $1
    `;

    const { rows } = await pool.query(query, [phoneNumber]);

    return rows[0];
}


async createResident(residentData) {

    const {
        full_name,
        phone_number,
        password_hash,
        kifle_ketema,
        woreda,
        house_number
    } = residentData;

    const query = `
        INSERT INTO residents (
            full_name,
            phone_number,
            password_hash,
            kifle_ketema,
            woreda,
            house_number
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
    `;

    const values = [
        full_name,
        phone_number,
        password_hash,
        kifle_ketema,
        woreda,
        house_number
    ];

    const { rows } = await pool.query(query, values);

    return rows[0];
}


// =====================================================
// BUSINESS OWNER
// =====================================================

async findBusinessOwnerByPhone(phoneNumber) {

    const query = `
        SELECT *
        FROM business_owners
        WHERE phone_number = $1
    `;

    const { rows } = await pool.query(query, [phoneNumber]);

    return rows[0];
}


async createBusinessOwner(businessData) {

    const {
        business_name,
        owner_name,
        phone_number,
        password_hash,
        kifle_ketema,
        woreda,
        tin_number
    } = businessData;

    const query = `
        INSERT INTO business_owners (
            business_name,
            owner_name,
            phone_number,
            password_hash,
            kifle_ketema,
            woreda,
            tin_number
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;
    `;

    const values = [
        business_name,
        owner_name,
        phone_number,
        password_hash,
        kifle_ketema,
        woreda,
        tin_number
    ];

    const { rows } = await pool.query(query, values);

    return rows[0];
}


// =====================================================
// COLLECTOR
// =====================================================

async findCollectorByPhone(phoneNumber) {

    const query = `
        SELECT *
        FROM collectors
        WHERE phone_number = $1
    `;

    const { rows } = await pool.query(query, [phoneNumber]);

    return rows[0];
}


// =====================================================
// MUNICIPAL ADMIN
// =====================================================

async findMunicipalAdminByPhone(phoneNumber) {

    const query = `
        SELECT *
        FROM municipal_administrators
        WHERE phone_number = $1
    `;

    const { rows } = await pool.query(query, [phoneNumber]);

    return rows[0];
}


// =====================================================
// SYSTEM ADMIN
// =====================================================

async findSystemAdminByUsername(username) {

    const query = `
        SELECT *
        FROM system_administrators
        WHERE username = $1
    `;

    const { rows } = await pool.query(query, [username]);

    return rows[0];
}


// =====================================================
// FORGOT PASSWORD
// FIND USER BY EMAIL OR PHONE
// =====================================================

async findUserByEmailOrPhone(identifier) {

    // -------------------------------------------------
    // Resident
    // -------------------------------------------------

    let result = await pool.query(
        `
        SELECT
            resident_id AS user_id,
            full_name,
            email,
            phone_number,
            password_hash,
            'RESIDENT' AS user_role
        FROM residents
        WHERE email = $1
           OR phone_number = $1
        LIMIT 1
        `,
        [identifier]
    );

    if (result.rows.length > 0) {
        return result.rows[0];
    }


    // -------------------------------------------------
    // Business Owner
    // -------------------------------------------------

    result = await pool.query(
        `
        SELECT
            business_id AS user_id,
            owner_name AS full_name,
            email,
            phone_number,
            password_hash,
            'BUSINESS_OWNER' AS user_role
        FROM business_owners
        WHERE email = $1
           OR phone_number = $1
        LIMIT 1
        `,
        [identifier]
    );

    if (result.rows.length > 0) {
        return result.rows[0];
    }


    // -------------------------------------------------
    // Collector
    // -------------------------------------------------

    result = await pool.query(
        `
        SELECT
            collector_id AS user_id,
            full_name,
            email,
            phone_number,
            password_hash,
            'COLLECTOR' AS user_role
        FROM collectors
        WHERE email = $1
           OR phone_number = $1
        LIMIT 1
        `,
        [identifier]
    );

    if (result.rows.length > 0) {
        return result.rows[0];
    }


    // -------------------------------------------------
    // Municipal Admin
    // -------------------------------------------------

    result = await pool.query(
        `
        SELECT
            admin_id AS user_id,
            full_name,
            email,
            phone_number,
            password_hash,
            'MUNICIPAL_ADMIN' AS user_role
        FROM municipal_administrators
        WHERE email = $1
           OR phone_number = $1
        LIMIT 1
        `,
        [identifier]
    );

    if (result.rows.length > 0) {
        return result.rows[0];
    }


    // -------------------------------------------------
    // System Admin
    // -------------------------------------------------

    result = await pool.query(
        `
        SELECT
            admin_id AS user_id,
            full_name,
            email,
            phone_number,
            password_hash,
            'SYSTEM_ADMIN' AS user_role
        FROM system_administrators
        WHERE email = $1
           OR phone_number = $1
        LIMIT 1
        `,
        [identifier]
    );

    if (result.rows.length > 0) {
        return result.rows[0];
    }


    // -------------------------------------------------
    // User Not Found
    // -------------------------------------------------

    return null;
}


// =====================================================
// UPDATE PASSWORD
// =====================================================

async updateUserPassword(
    userId,
    userRole,
    passwordHash
) {

    let query;
    let values = [
        passwordHash,
        userId
    ];


    // -------------------------------------------------
    // Resident
    // -------------------------------------------------

    if (userRole === "RESIDENT") {

        query = `
            UPDATE residents
            SET
                password_hash = $1,
                updated_at = CURRENT_TIMESTAMP
            WHERE resident_id = $2
            RETURNING resident_id;
        `;
    }


    // -------------------------------------------------
    // Business Owner
    // -------------------------------------------------

    else if (userRole === "BUSINESS_OWNER") {

        query = `
            UPDATE business_owners
            SET
                password_hash = $1,
                updated_at = CURRENT_TIMESTAMP
            WHERE business_id = $2
            RETURNING business_id;
        `;
    }


    // -------------------------------------------------
    // Collector
    // -------------------------------------------------

    else if (userRole === "COLLECTOR") {

        query = `
            UPDATE collectors
            SET
                password_hash = $1,
                updated_at = CURRENT_TIMESTAMP
            WHERE collector_id = $2
            RETURNING collector_id;
        `;
    }


    // -------------------------------------------------
    // Municipal Admin
    // -------------------------------------------------

    else if (userRole === "MUNICIPAL_ADMIN") {

        query = `
            UPDATE municipal_administrators
            SET
                password_hash = $1,
                updated_at = CURRENT_TIMESTAMP
            WHERE admin_id = $2
            RETURNING admin_id;
        `;
    }


    // -------------------------------------------------
    // System Admin
    // -------------------------------------------------

    else if (userRole === "SYSTEM_ADMIN") {

        query = `
            UPDATE system_administrators
            SET
                password_hash = $1,
                updated_at = CURRENT_TIMESTAMP
            WHERE admin_id = $2
            RETURNING admin_id;
        `;
    }


    else {
        throw new Error("Invalid user role.");
    }


    const { rows } = await pool.query(
        query,
        values
    );


    return rows[0] || null;
}
// =====================================================
// CREATE PASSWORD RESET TOKEN
// =====================================================

async createPasswordResetToken(
    userId,
    userRole,
    tokenHash,
    expiresAt
) {

    const query = `
        INSERT INTO password_reset_tokens (
            user_id,
            user_role,
            token_hash,
            expires_at
        )
        VALUES ($1, $2, $3, $4)
        RETURNING id;
    `;

    const { rows } = await pool.query(
        query,
        [
            userId,
            userRole,
            tokenHash,
            expiresAt
        ]
    );

    return rows[0];
}


// =====================================================
// FIND PASSWORD RESET TOKEN
// =====================================================

async findPasswordResetToken(tokenHash) {

    const query = `
        SELECT *
        FROM password_reset_tokens
        WHERE token_hash = $1
        AND used_at IS NULL
        AND expires_at > CURRENT_TIMESTAMP
        LIMIT 1;
    `;

    const { rows } = await pool.query(
        query,
        [tokenHash]
    );

    return rows[0] || null;
}


// =====================================================
// MARK RESET TOKEN AS USED
// =====================================================

async markPasswordResetTokenUsed(tokenId) {

    const query = `
        UPDATE password_reset_tokens
        SET used_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *;
    `;

    const { rows } = await pool.query(
        query,
        [tokenId]
    );

    return rows[0] || null;
}
}

module.exports = new AuthRepository();
