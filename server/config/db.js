const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on("error", (err) => {
  console.error("PostgreSQL Error:", err);
});

const connectDB = async () => {
  try {
    const client = await pool.connect();

    console.log("✅ PostgreSQL Connected");

    const info = await client.query(`
      SELECT
        current_database(),
        current_user,
        inet_server_addr(),
        inet_server_port()
    `);

    console.log(info.rows[0]);

    client.release();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

const query = (text, params) => pool.query(text, params);

module.exports = {
  pool,
  query,
  connectDB,
};