const db = require("../config/db");

// ========================================
// Create Municipal Admin
// ========================================
const createMunicipalAdmin = async (data) => {
  const {
    full_name,
    phone_number,
    email,
    password_hash,
    assigned_kifle_ketema,
    profile_image,
    is_active = true,
  } = data;

  const result = await db.query(
    `INSERT INTO municipal_administrators
    (
      full_name,
      phone_number,
      email,
      password_hash,
      assigned_kifle_ketema,
      profile_image,
      is_active
    )
    VALUES($1,$2,LOWER($3),$4,$5,$6,$7)
    RETURNING *`,
    [
      full_name,
      phone_number,
      email,
      password_hash,
      assigned_kifle_ketema,
      profile_image,
      is_active,
    ]
  );

  return result.rows[0];
};

// ========================================
// Get All Municipal Admins
// ========================================
const getAllMunicipalAdmins = async () => {
  const result = await db.query(
    `SELECT *
     FROM municipal_administrators
     ORDER BY admin_id DESC`
  );

  return result.rows;
};

// ========================================
// Get Municipal Admin By ID
// ========================================
const getMunicipalAdminById = async (id) => {
  const result = await db.query(
    `SELECT *
     FROM municipal_administrators
     WHERE admin_id=$1`,
    [id]
  );

  return result.rows[0];
};

// ========================================
// Get Municipal Admin By Email
// ========================================
const getMunicipalAdminByEmail = async (email) => {
  const result = await db.query(
    `SELECT *
     FROM municipal_administrators
     WHERE LOWER(email)=LOWER($1)`,
    [email]
  );

  return result.rows[0];
};

// ========================================
// Update Municipal Admin
// ========================================
const updateMunicipalAdmin = async (id, data) => {
  const {
    full_name,
    phone_number,
    email,
    assigned_kifle_ketema,
    profile_image,
    is_active,
  } = data;

  const result = await db.query(
    `UPDATE municipal_administrators
     SET
       full_name=$1,
       phone_number=$2,
       email=LOWER($3),
       assigned_kifle_ketema=$4,
       profile_image=$5,
       is_active=$6,
       updated_at=CURRENT_TIMESTAMP
     WHERE admin_id=$7
     RETURNING *`,
    [
      full_name,
      phone_number,
      email,
      assigned_kifle_ketema,
      profile_image,
      is_active,
      id,
    ]
  );

  return result.rows[0];
};

// ========================================
// Delete Municipal Admin
// ========================================
const deleteMunicipalAdmin = async (id) => {
  const result = await db.query(
    `DELETE FROM municipal_administrators
     WHERE admin_id=$1
     RETURNING *`,
    [id]
  );

  return result.rows[0];
};

// ========================================
// Dashboard
// ========================================
const getDashboard = async (adminId) => {
  const admin = await getMunicipalAdminById(adminId);

  if (!admin) {
    return null;
  }

  const kifle = admin.assigned_kifle_ketema;

  const residents = await db.query(
    `SELECT COUNT(*) total
     FROM residents
     WHERE kifle_ketema=$1`,
    [kifle]
  );

  const businesses = await db.query(
    `SELECT COUNT(*) total
     FROM business_owners
     WHERE kifle_ketema=$1`,
    [kifle]
  );

  const collectors = await db.query(
    `SELECT COUNT(*) total
     FROM collectors
     WHERE assigned_kifle_ketema=$1`,
    [kifle]
  );

  const schedules = await db.query(
    `SELECT COUNT(*) total
     FROM collection_schedules
     WHERE kifle_ketema=$1`,
    [kifle]
  );

  return {
    admin,
    residents: Number(residents.rows[0].total),
    businesses: Number(businesses.rows[0].total),
    collectors: Number(collectors.rows[0].total),
    schedules: Number(schedules.rows[0].total),
  };
};

module.exports = {
  createMunicipalAdmin,
  getDashboard,
  getAllMunicipalAdmins,
  getMunicipalAdminById,
  getMunicipalAdminByEmail,
  getAdminByEmail: getMunicipalAdminByEmail,
  updateMunicipalAdmin,
  deleteMunicipalAdmin,
};