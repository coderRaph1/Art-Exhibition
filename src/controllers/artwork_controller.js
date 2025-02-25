const Artwork = require('../models/Artwork')

exports.getArtworks = (req, res) => {
  const { limit, offset, sort_by, sort_order, ...filters } = req.query

  const page = parseInt(req.query.page, 10) || 1 
  const pageLimit = parseInt(limit, 10) || 100
  const pageOffset = (page - 1) * pageLimit

  if (page < 1) {
    return res.status(400).json({ error: "Page number must be positive" })
  }

  if (pageLimit < 1) {
    return res.status(400).json({ error: "Limit must be at least 1" })
  }

  Artwork.fetchArtworks(filters, pageLimit, pageOffset, sort_by, sort_order)
    .then((artworks) => {
      if (artworks.length === 0) {
        return res.status(200).json({ artworks: [] })
      }
      res.status(200).json({ artworks })
    })
    .catch((err) => {
      res.status(500).json({ error: err.message })
    })
}

exports.getArtworkById = (req, res) => {
  const { artwork_id } = req.params
  
  Artwork.fetchArtworkById(artwork_id)
    .then((artwork) => {
      res.status(200).json({ artwork })
    })
    .catch((err) => {
      res.status(err.status || 500).json({ error: err.msg || err.message })
    })}

exports.createArtwork = (req, res) => {
  const { title, artist, museum, image_url } = req.body
  
  Artwork.createArtwork(title, artist, museum, image_url)
    .then((newArtwork) => {
      res.status(201).json({ artwork: newArtwork })
    })
    .catch((err) => {
      res.status(err.status || 500).json({ error: err.msg || err.message })
    })
}

exports.deleteArtwork = (req, res) => {
  const { artwork_id } = req.params
  
  Artwork.deleteArtwork(artwork_id)
    .then((deletedArtwork) => {
      res.status(200).json({ message: 'Artwork deleted successfully', artwork: deletedArtwork })
    })
    .catch((err) => {
      res.status(err.status || 500).json({ error: err.msg || err.message })
    })
}

exports.createCollection = (req, res, next) => {
  const { user_id, title } = req.body

  if (!user_id || isNaN(user_id)) {
    return res.status(400).json({ error: 'Invalid user_id' })
  }

    if (!title) {
      return res.status(400).json({ error: 'Title is required' })
    }  

  Artwork.createCollection(user_id, title)
    .then(collection => res.status(201).json({ collection }))
    .catch(next)
}

exports.addArtworkToCollection = (req, res) => {
  const { artwork_id } = req.body
  const { collection_id } = req.params 

  if (!artwork_id) {
    return res.status(400).json({ error: "Artwork ID is required" })
  }

  Artwork.addArtworkToCollection(collection_id, artwork_id)
    .then((entry) => {
      if (!entry) {
        return res.status(409).json({ error: "Artwork already exists in the collection" })
      }
      res.status(201).json({
        message: "Artwork added to collection",
        entry,
      })
    })
    .catch((err) => {
      res.status(500).json({ error: err.message })
    })
}

exports.removeArtworkFromCollection = (req, res) => {
  const { collection_id, artwork_id } = req.params 

  Artwork.doesCollectionExist(collection_id)
    .then((exists) => {
      if (!exists) {
        return res.status(404).json({ error: 'Collection not found' })
      }

      Artwork.doesArtworkExistInCollection(collection_id, artwork_id)
        .then((existsInCollection) => {
          if (!existsInCollection) {
            return res.status(400).json({ error: 'Artwork not found in collection' })
          }

          Artwork.removeArtworkFromCollection(collection_id, artwork_id)
            .then((result) => {
              if (result && result.status === 404) {
                return res.status(404).json({ error: result.msg })
              }
              return res.status(204).json({ message: 'Artwork removed from collection' })
            })
            .catch((err) => {
              return res.status(500).json({ error: err.message })
            })
        })
        .catch((err) => {
          res.status(500).json({ error: err.message })
        })
    })
    .catch((err) => {
      res.status(500).json({ error: err.message })
    })
}


exports.getCollectionsByUser = (req, res, next) => {
  const { user_id } = req.params

  Artwork.getCollectionsByUser(user_id)
    .then(collections => res.status(200).json({ collections }))
    .catch(next)
}

exports.getCollectionArtworks = (req, res, next) => {
  const { collection_id } = req.params

  Artwork.getCollectionArtworks(collection_id)
    .then(artworks => res.status(200).json({ artworks }))
    .catch(next)
}

exports.deleteCollection = (req, res, next) => {
  const { collection_id } = req.params
  Artwork.deleteCollection(collection_id)
    .then(() => res.status(200).json({ message: 'Collection removed' }))
    .catch(next)
}