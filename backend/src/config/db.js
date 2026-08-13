const mysql = require('mysql2/promise');
require('dotenv').config();

// Létrehozunk egy connection pool-t, ami hatékonyan kezeli a kapcsolatokat
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'trapp2',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = {
  // Ez a függvény futtatja majd le az SQL parancsainkat
  query: async (sql, params) => {
    const [results] = await pool.execute(sql, params);
    return results;
  }
};