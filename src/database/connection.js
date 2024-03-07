const { Pool } = require("pg")
require("dotenv").config()

const isProduction = process.env.NODE_ENV === "production"
const connectionString = isProduction ? process.env.DATABASE_URL : process.env.DB_URL

console.log("Connecting to database:", connectionString) 

const pool = new Pool({
  connectionString,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
})

module.exports = pool
