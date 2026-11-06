const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});

pool.on('connect', () => {
  console.log('Conexión exitosa a la base de datos.');
});

pool.on('error', (err) => {
  console.error('Error inesperado en el pool de Postgres:', err.message);
});

module.exports = pool;