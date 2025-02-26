const { Pool } = require("pg")
require("dotenv").config()

const isProduction = process.env.NODE_ENV === "production"
const connectionString = isProduction ? process.env.DATABASE_URL : process.env.DB_URL

console.log("Connecting to database:", connectionString) 

const pool = new Pool({
  connectionString,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
})

// module.exports = pool


// const { Pool } = require('pg'); // Assuming you're using pg to connect to PostgreSQL

// const ENV = process.env.NODE_ENV || "development";

// // Use the correct database URL based on environment
// const databaseUrl = ENV === "production" ? process.env.DATABASE_URL : process.env.DB_URL;

// const pool = new Pool({
//   connectionString: databaseUrl,
//   ssl: ENV === "production" ? { rejectUnauthorized: false } : false, // SSL for production
// });

// module.exports = pool;

// const { Pool } = require('pg')
// const config = require('../config/env')

// const ENV = config.NODE_ENV; // Use the environment variable from config

// const ENV = process.env.NODE_ENV || 'development'

// if(!process.env.DB_URL && !process.env.DATABASE_URL){
//   throw new Error("DB_URL or DATABASE_URL not set")
// }

// if (ENV === "production") {
//   config.connectionString = process.env.DATABASE_URL;
//   config.max = 2;
// }

// module.exports = new Pool(config)

// require('dotenv').config();  // This will load variables from .env

// // const { Pool } = require("pg");
// // const config = require("../config/env")

// // const ENV = config.NODE_ENV;
// // const isProduction = ENV === "production"

// // if (!process.env.DATABASE_URL) {
// //   throw new Error("DB_URL or DATABASE_URL not set")
// // }

// // const poolConfig = {
// //   connectionString: isProduction ? process.env.DATABASE_URL : config.DB_URL,
// //   max: isProduction ? 5 : 10,
// //   ssl: isProduction ? { rejectUnauthorized: false } : false,
// // }

// // // console.log("Connecting to database:", poolConfig.connectionString);

// // const pool = new Pool(poolConfig)

// // module.exports = pool


const { Pool } = require("pg");
require("dotenv").config(); // Ensure environment variables are loaded

const isProduction = process.env.NODE_ENV === "production";
const connectionString = isProduction ? process.env.DATABASE_URL : process.env.DB_URL;

console.log("Connecting to database:", connectionString); 

const pool = new Pool({
  connectionString,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

module.exports = pool;
