// import mysql from 'mysql2/promise';  // <-- note 'promise' here
// import dotenv from 'dotenv';
// dotenv.config();

// const db = mysql.createPool({
//   host: process.env.DB_HOST || 'localhost',
//   user: process.env.DB_USER || 'root',
//   password: process.env.DB_PASSWORD || 'SHRU@1504',
//   database: process.env.DB_NAME || 'shopping_db',
// });

// export default db;
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'SHRU@1504',
  database: process.env.DB_NAME || 'shopping_db',
});

module.exports = pool;
