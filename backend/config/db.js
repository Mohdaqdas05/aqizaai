const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err);
});

/**
 * Execute a parameterised query.
 * @param {string} text - SQL query string
 * @param {Array}  params - Query parameters
 */
const query = (text, params) => pool.query(text, params);

module.exports = { pool, query };
