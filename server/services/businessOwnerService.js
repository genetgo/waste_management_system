// services/businessOwnerService.js

const db = require("../config/db");

// =====================================
// Create Business Owner
// =====================================
const createBusinessOwner = async (businessData) => {
  const {
    business_name,
    owner_name,
    phone_number,
    email,
    password_hash,
    
    
    kebele,
    kifle_ketema,
    profile_image,
  } = businessData;

  const result = await db.query(
    `
    INSERT INTO business_owners
    (
      business_name,
      owner_name,
      phone_number,
      email,
      password_hash,
      address,
      business_type,
      kebele,
      kifle_ketema,
      profile_image
    )
    VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    RETURNING *;
    `,
    [
      business_name,
      owner_name,
      phone_number,
      email,
      password_hash,
      address,
      business_type,
      kebele,
      kifle_ketema,
      profile_image,
    ]
  );

  return result.rows[0];
};

// =====================================
// Get All Business Owners
// =====================================
const getAllBusinessOwners = async () => {
  const result = await db.query(`
      SELECT *
      FROM business_owners
      ORDER BY business_id DESC
  `);

  return result.rows;
};

// =====================================
// Get Business By ID
// =====================================
const getBusinessById = async (business_id) => {
  const result = await db.query(
    `
      SELECT *
      FROM business_owners
      WHERE business_id=$1
  `,
    [business_id]
  );

  return result.rows[0];
};

// =====================================
// Get Business By Email
// =====================================
const getBusinessByEmail = async (email) => {
  const result = await db.query(
    `
      SELECT *
      FROM business_owners
      WHERE email=$1
  `,
    [email]
  );

  return result.rows[0];
};

// =====================================
// Get Business By Phone
// =====================================
const getBusinessByPhone = async (phone_number) => {
  const result = await db.query(
    `
      SELECT *
      FROM business_owners
      WHERE phone_number=$1
  `,
    [phone_number]
  );

  return result.rows[0];
};

// =====================================
// Update Business Owner
// =====================================
const updateBusinessOwner = async (business_id, data) => {
  const {
    business_name,
    owner_name,
    phone_number,
    email,
    address,
    business_type,
    kebele,
    kifle_ketema,
    profile_image,
  } = data;

  const result = await db.query(
    `
    UPDATE business_owners
    SET
      business_name=$1,
      owner_name=$2,
      phone_number=$3,
      email=$4,
      address=$5,
      business_type=$6,
      kebele=$7,
      kifle_ketema=$8,
      profile_image=$9,
      updated_at=CURRENT_TIMESTAMP
    WHERE business_id=$10
    RETURNING *;
    `,
    [
      business_name,
      owner_name,
      phone_number,
      email,
      address,
      business_type,
      kebele,
      kifle_ketema,
      profile_image,
      business_id,
    ]
  );

  return result.rows[0];
};

// =====================================
// Delete Business Owner
// =====================================
const deleteBusinessOwner = async (business_id) => {
  const result = await db.query(
    `
      DELETE FROM business_owners
      WHERE business_id=$1
      RETURNING *;
  `,
    [business_id]
  );

  return result.rows[0];
};

// =====================================
// Activate Business
// =====================================
const activateBusiness = async (business_id) => {
  const result = await db.query(
    `
      UPDATE business_owners
      SET is_active=true,
          updated_at=CURRENT_TIMESTAMP
      WHERE business_id=$1
      RETURNING *;
  `,
    [business_id]
  );

  return result.rows[0];
};

// =====================================
// Deactivate Business
// =====================================
const deactivateBusiness = async (business_id) => {
  const result = await db.query(
    `
      UPDATE business_owners
      SET is_active=false,
          updated_at=CURRENT_TIMESTAMP
      WHERE business_id=$1
      RETURNING *;
  `,
    [business_id]
  );

  return result.rows[0];
};

// =====================================
// Search Businesses
// =====================================
const searchBusinesses = async (keyword) => {
  const result = await db.query(
    `
    SELECT *
    FROM business_owners
    WHERE
      business_name ILIKE $1
      OR owner_name ILIKE $1
      OR email ILIKE $1
      OR phone_number ILIKE $1
      OR business_type ILIKE $1
      OR address ILIKE $1
    ORDER BY business_id DESC;
    `,
    [`%${keyword}%`]
  );

  return result.rows;
};

// =====================================
// Businesses By Type
// =====================================
const getBusinessesByType = async (business_type) => {
  const result = await db.query(
    `
      SELECT *
      FROM business_owners
      WHERE business_type=$1
  `,
    [business_type]
  );

  return result.rows;
};

// =====================================
// Businesses By Kebele
// =====================================
const getBusinessesByKebele = async (kebele) => {
  const result = await db.query(
    `
      SELECT *
      FROM business_owners
      WHERE kebele=$1
  `,
    [kebele]
  );

  return result.rows;
};

// =====================================
// Businesses By Kifle Ketema
// =====================================
const getBusinessesByKifleKetema = async (kifle_ketema) => {
  const result = await db.query(
    `
      SELECT *
      FROM business_owners
      WHERE kifle_ketema=$1
  `,
    [kifle_ketema]
  );

  return result.rows;
};

// =====================================
// Count Businesses
// =====================================
const countBusinesses = async () => {
  const result = await db.query(`
      SELECT COUNT(*) AS total
      FROM business_owners
  `);

  return Number(result.rows[0].total);
};

module.exports = {
  createBusinessOwner,
  getAllBusinessOwners,
  getBusinessById,
  getBusinessByEmail,
  getBusinessByPhone,
  updateBusinessOwner,
  deleteBusinessOwner,
  activateBusiness,
  deactivateBusiness,
  searchBusinesses,
  getBusinessesByType,
  getBusinessesByKebele,
  getBusinessesByKifleKetema,
  countBusinesses,
};