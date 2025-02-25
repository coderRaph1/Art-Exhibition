const express = require('express')
const artworkController = require('../controllers/artwork_controller')
const router = express.Router()

router.get('/collections/:collection_id/artworks', artworkController.getCollectionArtworks)

router.get('/collections/user/:user_id', artworkController.getCollectionsByUser)

router.post('/collections', artworkController.createCollection)

router.post("/collections/:collection_id/artworks", artworkController.addArtworkToCollection);

router.delete("/collections/:collection_id/artworks/:artwork_id", artworkController.removeArtworkFromCollection)

router.delete('/collections/:collection_id', artworkController.deleteCollection)

module.exports = router
