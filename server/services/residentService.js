// services/residentService.js

const db = require("../config/db");

// ==============================
// Create Resident
// ==============================
const createResident = async (residentData) => {
  const {
    full_name,
    phone_number,
    email,
    password_hash,
  
    kebele,
    kifle_ketema,
    profile_image,
  } = residentData;

  const query = `
    INSERT INTO residents
    (
      full_name,
      phone_number,
      email,
      password_hash,
      
      kebele,
      kifle_ketema,
      profile_image
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    RETURNING *;
  `;

  const values = [
    full_name,
    
    phone_number,
    email,
    password_hash,
    
    kebele,
    kifle_ketema,
    profile_image,
  ];

  const result = await db.query(query, values);
  return result.rows[0];
};

// ==============================
// Get All Residents
// ==============================
const getAllResidents = async () => {
  const query = `
    SELECT *
    FROM residents
    ORDER BY resident_id DESC
  `;

  const result = await db.query(query);
  return result.rows;
};

// ==============================
// Get Resident By ID
// ==============================
const getResidentById = async (resident_id) => {
  const query = `
    SELECT *
    FROM residents
    WHERE resident_id=$1
  `;

  const result = await db.query(query, [resident_id]);
  return result.rows[0];
};

// ==============================
// Get Resident By Email
// ==============================
const getResidentByEmail = async (email) => {
  const query = `
    SELECT *
    FROM residents
    WHERE email=$1
  `;

  const result = await db.query(query, [email]);
  return result.rows[0];
};

// ==============================
// Get Resident By Phone
// ==============================
const getResidentByPhone = async (phone_number) => {
  const query = `
    SELECT *
    FROM residents
    WHERE phone_number=$1
  `;

  const result = await db.query(query, [phone_number]);
  return result.rows[0];
};

// ==============================
// Update Resident
// ==============================
const updateResident = async (resident_id, residentData) => {
  const {
    full_name,
    phone_number,
    email,
    
    kebele,
    kifle_ketema,
    profile_image,
  } = residentData;

  const query = `
    UPDATE residents
    SET
      full_name=$1,
      phone_number=$2,
      email=$3,
      
      kebele=$4,
      kifle_ketema=$5,
      profile_image=$6,
      updated_at=CURRENT_TIMESTAMP
    WHERE resident_id=$7
    RETURNING *;
  `;

  const values = [
    full_name,
    phone_number,
    email,
    
    kebele,
    kifle_ketema,
    profile_image,
    resident_id,
  ];

  const result = await db.query(query, values);
  return result.rows[0];
};

// ==============================
// Activate Resident
// ==============================
const activateResident = async (resident_id) => {
  const result = await db.query(
    `
    UPDATE residents
    SET
      is_active=true,
      updated_at=CURRENT_TIMESTAMP
    WHERE resident_id=$1
    RETURNING *;
  `,
    [resident_id]
  );

  return result.rows[0];
};

// ==============================
// Deactivate Resident
// ==============================
const deactivateResident = async (resident_id) => {
  const result = await db.query(
    `
    UPDATE residents
    SET
      is_active=false,
      updated_at=CURRENT_TIMESTAMP
    WHERE resident_id=$1
    RETURNING *;
  `,
    [resident_id]
  );

  return result.rows[0];
};

// ==============================
// Delete Resident
// ==============================
const deleteResident = async (resident_id) => {
  const result = await db.query(
    `
    DELETE FROM residents
    WHERE resident_id=$1
    RETURNING *;
  `,
    [resident_id]
  );

  return result.rows[0];
};

// ==============================
// Search Residents
// ==============================
const searchResidents = async (keyword) => {
  const query = `
    SELECT *
    FROM residents
    WHERE
      full_name ILIKE $1
  
      OR email ILIKE $1
      OR phone_number ILIKE $1

    ORDER BY resident_id DESC;
  `;

  const result = await db.query(query, [`%${keyword}%`]);
  return result.rows;
};

// ==============================
// Residents By Kebele
// ==============================
const getResidentsByKebele = async (kebele) => {
  const result = await db.query(
    `
    SELECT *
    FROM residents
    WHERE kebele=$1;
  `,
    [kebele]
  );

  return result.rows;
};

// ==============================
// Residents By Kifle Ketema
// ==============================
const getResidentsByKifleKetema = async (kifle_ketema) => {
  const result = await db.query(
    `
    SELECT *
    FROM residents
    WHERE kifle_ketema=$1;
  `,
    [kifle_ketema]
  );

  return result.rows;
};

// ==============================
// Resident Count
// ==============================
const countResidents = async () => {
  const result = await db.query(`
      SELECT COUNT(*) AS total
      FROM residents
  `);

  return Number(result.rows[0].total);
};

// ==============================
// Exports
// ==============================
module.exports = {
  createResident,
  getAllResidents,
  getResidentById,
  getResidentByEmail,
  getResidentByPhone,
  updateResident,
  activateResident,
  deactivateResident,
  deleteResident,
  searchResidents,
  getResidentsByKebele,
  getResidentsByKifleKetema,
  countResidents,
  getResidentByEmail,   
  getResidentByPhone,
};