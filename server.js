const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const artworkRoutes = require('./src/routes/artwork')
const collectionsRoutes = require('./src/routes/collections')
const { errorHandler, notFound } = require('./src/middleware/error_handler')
const { seedArtworks } = require('./src/seeds/seedArtworkData')

if (process.env.NODE_ENV !== 'test') {
  seedArtworks()
}

app.use(cors())

app.use(express.json())

app.use('/api/artworks', artworkRoutes)
app.use('/api/', collectionsRoutes)

app.use(notFound)
app.use(errorHandler)

// const PORT = process.env.PORT || (process.env.NODE_ENV === 'test' ? 3001 : 3000)

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

module.exports = app