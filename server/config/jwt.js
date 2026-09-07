// config/jwt.js

const jwt = require("jsonwebtoken");
require("dotenv").config();

/**
 * @desc    Generate a new JWT Token
 * @param   {Object} payload - User data (e.g., { id, role })
 * @returns {String} JWT Token
 */
const generateToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    {
      // በ .env ላይ JWT_EXPIRE ስለሆነ እሱን እንዲጠቀም አስተካክለነዋል
      expiresIn: process.env.JWT_EXPIRE || "7d", 
    }
  );
};

/**
 * @desc    Verify JWT Token
 * @param   {String} token - JWT Token from client
 * @returns {Object} Decoded payload
 */
const verifyToken = (token) => {
  return jwt.verify(
    token,
    process.env.JWT_SECRET
  );
};

module.exports = {
  generateToken,
  verifyToken,
};