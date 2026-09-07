const { pool } = require("../config/db");

class BusinessOwnerRepository {


    // =============================
    // Register Business Owner
    // =============================
    async createBusinessOwner(data) {

        const query = `
            INSERT INTO business_owners (
                business_name,
                owner_name,
                phone_number,
                email,
                password_hash,
                business_type,
                business_description,
                kebele,
                kifle_ketema,
                sefer,
                profile_image
            )

            VALUES ($1,$2,$3,LOWER($4),$5,$6,$7,$8,$9,$10,$11)

            RETURNING *;
        `;


        const values = [

            data.business_name,

            data.owner_name,

            data.phone_number,

            data.email ? data.email.trim() : null,

            data.password_hash,

            data.business_type,

            data.business_description || null,

            data.kebele,

            data.kifle_ketema,

            data.sefer,

            data.profile_image || null

        ];


        const { rows } = await pool.query(query, values);


        console.log("BUSINESS INSERT RESULT:", rows[0]);


        return rows[0];

    }



    // =============================
    // Get All Business Owners
    // =============================
    async getAllBusinessOwners(kifleKetema = null) {

    let query = `
        SELECT *
        FROM business_owners
    `;

    const values = [];

    if (kifleKetema) {
        query += `
            WHERE LOWER(kifle_ketema) = LOWER($1)
        `;
        values.push(kifleKetema);
    }

    query += `
        ORDER BY business_id DESC
    `;

    const { rows } = await pool.query(query, values);

    return rows;
}


    // =============================
    // Get By ID
    // =============================
    async getBusinessOwnerById(id) {

        const query = `
            SELECT *
            FROM business_owners
            WHERE business_id=$1;
        `;


        const { rows } = await pool.query(query,[id]);

        return rows[0];

    }



    // =============================
    // Get By Email
    // =============================
    async getBusinessOwnerByEmail(email){

        if(!email) return null;


        const query = `
            SELECT *
            FROM business_owners
            WHERE LOWER(email)=LOWER($1);
        `;


        const {rows}=await pool.query(query,[email.trim()]);


        return rows[0] || null;

    }



    // =============================
    // Update Business Owner
    // =============================
    async updateBusinessOwner(id,data){


        const query=`

        UPDATE business_owners

        SET

        business_name=$1,
        owner_name=$2,
        phone_number=$3,
        email=LOWER($4),
        business_type=$5,
        business_description=$6,
        kebele=$7,
        kifle_ketema=$8,
        sefer=$9,
        profile_image=$10,
        password_hash=COALESCE($11,password_hash)


        WHERE business_id=$12

        RETURNING *;

        `;


        const values=[

            data.business_name,

            data.owner_name,

            data.phone_number,

            data.email,

            data.business_type,

            data.business_description || null,

            data.kebele,

            data.kifle_ketema,

            data.sefer,

            data.profile_image || null,

            data.password_hash || null,

            id

        ];


        const {rows}=await pool.query(query,values);


        return rows[0];

    }



// ==========================================
// UPDATE BUSINESS OWNER PASSWORD ONLY
// ==========================================
async updatePassword(id, passwordHash) {
  const query = `
    UPDATE business_owners
    SET password_hash = $1,
        updated_at = CURRENT_TIMESTAMP
    WHERE business_id = $2
    RETURNING business_id;
  `;

  const values = [passwordHash, id];

  const { rows } = await pool.query(query, values);

  if (rows.length === 0) {
    throw new Error("Business owner not found.");
  }

  return rows[0];
}


    // =============================
    // Delete
    // =============================
    async deleteBusinessOwner(id){

        const query=`

        DELETE FROM business_owners

        WHERE business_id=$1

        RETURNING *;

        `;


        const {rows}=await pool.query(query,[id]);


        return rows[0];

    }



    // =============================
    // Search
    // =============================
    async searchBusinessOwners(keyword){

        const query=`

        SELECT *

        FROM business_owners

        WHERE

        business_name ILIKE $1

        OR owner_name ILIKE $1

        OR phone_number ILIKE $1

        OR email ILIKE $1


        ORDER BY business_id DESC;

        `;


        const {rows}=await pool.query(query,[`%${keyword}%`]);


        return rows;

    }



    // =============================
    // Count
    // =============================
    async countBusinessOwners(){

        const query=`

        SELECT COUNT(*) AS total

        FROM business_owners;

        `;


        const {rows}=await pool.query(query);


        return Number(rows[0].total);

    }


}


module.exports = new BusinessOwnerRepository();