const axios = require('axios')
const db = require('../database/connection')
const { HARVARD_API_KEY } = process.env

const harvardApiUrl = `https://api.harvardartmuseums.org/object?apikey=${HARVARD_API_KEY}`
const chicagoApiUrl = 'https://api.artic.edu/api/v1/artworks'

function seedArtworks() {

  const checkIfArtworkExists = (title) => {
    return db.query('SELECT 1 FROM artworks WHERE title = $1', [title])
      .then(res => res.rows.length > 0) 
  }

  const fetchHarvardData = () => {
    return axios.get(harvardApiUrl)
      .then(response => {
        // console.log('Harvard data fetched:', response.data.records);  // Add this log
        const harvardArtworks = response.data.records
        const harvardArtworkPromises = harvardArtworks.map(artwork => {
          return checkIfArtworkExists(artwork.title)
            .then(exists => {
              if (!exists) {
                return db.query(
                  'INSERT INTO artworks (title, artist, museum, image_url) VALUES ($1, $2, $3, $4)',
                  [artwork.title, artwork.artist, 'Harvard Art Museums', artwork.primaryimageurl]
                )
              } else {
                console.log(`Artwork already exists: ${artwork.title}`)
              }
            })
        })
        return Promise.all(harvardArtworkPromises)
      })
      .catch(err => {
        console.error('Error fetching data from Harvard API:', err)
      })
  }
  
  const fetchChicagoData = () => {
    return axios.get(chicagoApiUrl)
      .then(response => {
        // console.log('Chicago data fetched:', response.data.data);  // Add this log
        const chicagoArtworks = response.data.data
        const chicagoArtworkPromises = chicagoArtworks.map(artwork => {
          const title = artwork.title || 'Untitled'
          const artist = artwork.artist_title || 'Unknown Artist'
          const imageUrl = artwork.thumbnail ? artwork.thumbnail.url : 'default_image_url'
          const museum = 'Chicago Art Institute' 
          const createdAt = new Date().toISOString() 
  
          return db.query('SELECT id FROM artworks WHERE id = $1', [artwork.id])
            .then(result => {
              if (result.rows.length === 0) {
                return db.query(
                  'INSERT INTO artworks (id, title, artist, museum, image_url, created_at) VALUES ($1, $2, $3, $4, $5, $6)',
                  [artwork.id, title, artist, museum, imageUrl, createdAt]
                )
              }
              console.log(`Artwork with ID ${artwork.id} already exists, skipping insertion.`)
            })
        })
  
        return Promise.all(chicagoArtworkPromises)
      })
      .catch(err => {
        console.error('Error fetching data from Chicago API:', err)
      })
  }

  return Promise.all([fetchHarvardData(), fetchChicagoData()])
    .then(() => {
      console.log('Artworks data seeded successfully!')
    })
    .catch(err => {
      console.error('Error seeding data:', err)
    })
}

seedArtworks().then(() => {
  console.log('Seeding completed.')
}).catch(err => {
  console.error('Seeding failed:', err)
})

module.exports = { seedArtworks }