const express = require('express')
const artworkController = require('../controllers/artwork_controller')
const router = express.Router()

router.get('/', artworkController.getArtworks)

router.get('/:artwork_id', artworkController.getArtworkById)

router.post('/', artworkController.createArtwork)

router.delete('/:artwork_id', artworkController.deleteArtwork)

module.exports = router
