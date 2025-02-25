const { Pool } = require('pg')
const config = require('../config/env')

const pool = new Pool({
  connectionString: config.DB_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

module.exports = pool
