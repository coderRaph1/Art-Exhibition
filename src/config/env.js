require('dotenv').config()

module.exports = {
  PORT: process.env.PORT || 3000,
  DB_URL: process.env.DB_URL || 'postgres://localhost:5432/mydatabase',
  HARVARD_API_KEY: process.env.HARVARD_API_KEY,
  HARVARD_BASE_URL: 'https://api.harvardartmuseums.org',
  CHICAGO_BASE_URL: 'https://api.artic.edu/api/v1/artworks',
  NODE_ENV: process.env.NODE_ENV || 'development'
};


