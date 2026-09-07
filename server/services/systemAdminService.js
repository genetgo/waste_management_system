const db = require("../config/db");
import React, { useEffect, useState } from "react";
import systemAdminService from "../../services/systemAdminService";
// Create Municipal Admin
const createMunicipalAdmin = async (data) => {
  const {
    full_name,
    phone_number,
    email,
    password_hash,
    assigned_kifle_ketema,
    profile_image,
  } = data;

  const result = await db.query(
    `INSERT INTO municipal_administrators
    (full_name,phone_number,email,password_hash,
    assigned_kifle_ketema,profile_image)
    VALUES($1,$2,$3,$4,$5,$6)
    RETURNING *`,
    [
      full_name,
      phone_number,
      email,
      password_hash,
      assigned_kifle_ketema,
      profile_image,
    ]
  );

  return result.rows[0];
};

// Create Collector
const createCollector = async (data) => {
  const {
    full_name,
    phone_number,
    email,
    password_hash,
    assigned_kifle_ketema,
    kebele,
    profile_image,
  } = data;

  const result = await db.query(
    `INSERT INTO collectors
    (full_name,phone_number,email,password_hash,
    assigned_kifle_ketema,kebele,profile_image)
    VALUES($1,$2,$3,$4,$5,$6,$7)
    RETURNING *`,
    [
      full_name,
      phone_number,
      email,
      password_hash,
      assigned_kifle_ketema,
      kebele,
      profile_image,
    ]
  );

  return result.rows[0];
};

// Get System Admin
const getSystemAdmin = async (id) => {
  const result = await db.query(
    "SELECT * FROM system_administrators WHERE system_admin_id=$1",
    [id]
  );

  return result.rows[0];
};

// Get All Municipal Admins
const getMunicipalAdmins = async () => {
  const result = await db.query(
    "SELECT * FROM municipal_administrators ORDER BY admin_id DESC"
  );

  return result.rows;
};

// Get All Collectors
const getCollectors = async () => {
  const result = await db.query(
    "SELECT * FROM collectors ORDER BY collector_id DESC"
  );

  return result.rows;
};

// Delete Municipal Admin
const deleteMunicipalAdmin = async (id) => {
  const result = await db.query(
    "DELETE FROM municipal_administrators WHERE admin_id=$1 RETURNING *",
    [id]
  );

  return result.rows[0];
};

// Delete Collector
const deleteCollector = async (id) => {
  const result = await db.query(
    "DELETE FROM collectors WHERE collector_id=$1 RETURNING *",
    [id]
  );

  return result.rows[0];
};


// ==========================================
// System Admin Profile
// ==========================================

const getProfile = async () => {
  return api.get("/system-admin/profile");
};

const updateProfile = async (profileData) => {
  return api.put(
    "/system-admin/profile",
    profileData
  );
};

// ==========================================
// Change Password
// ==========================================

const changePassword = async (passwordData) => {
  return api.put(
    "/system-admin/change-password",
    passwordData
  );
};



module.exports = {
  createMunicipalAdmin,
  createCollector,
  getSystemAdmin,
  getMunicipalAdmins,
  getCollectors,
  deleteMunicipalAdmin,
  deleteCollector,
  
  getProfile, updateProfile, changePassword,
};