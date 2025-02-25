const db = require('../database/connection')

exports.fetchArtworks = (filters = {}, limit = 100, offset = 0, sort_by = 'title', sort_order = 'ASC') => {
  let query = 'SELECT * FROM artworks'
  const queryParams = []
  const conditions = []

  if (filters.artist) {
    queryParams.push(filters.artist)
    conditions.push(`artist ILIKE $${queryParams.length}`) 
  }

  if (filters.museum) {
    queryParams.push(filters.museum)
    conditions.push(`museum ILIKE $${queryParams.length}`)
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ')
  }

  const validSortFields = ['title', 'artist', 'date_created'] 
  if (!validSortFields.includes(sort_by)) {
    sort_by = 'title' 
  }

  const order = sort_order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC'

  query += ` ORDER BY ${sort_by} ${order}`

  queryParams.push(limit, offset)
  query += ` LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}`

  return db.query(query, queryParams).then(({ rows }) => {
    if (rows.length === 0) {
      return []
    }
    return rows
  })
}

exports.fetchArtworkById = (artwork_id) => {
  return db.query('SELECT * FROM artworks WHERE id = $1', [artwork_id])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: `Artwork with ID ${artwork_id} not found`
        })
      }
      return rows[0]
    })
}

exports.createArtwork = (title, artist, museum, image_url) => {
  if (!title || !artist || !museum || !image_url) {
    return Promise.reject({
      status: 400,
      msg: 'All artwork fields are required'
    })
  }

  return db.query(
    'INSERT INTO artworks (title, artist, museum, image_url) VALUES ($1, $2, $3, $4) RETURNING *;',
    [title, artist, museum, image_url]
  ).then(({ rows }) => rows[0])
}

exports.deleteArtwork = (artwork_id) => {
  return db.query('DELETE FROM artworks WHERE id = $1 RETURNING *;', [artwork_id])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: `Artwork with ID ${artwork_id} not found`
        })
      }
      return rows[0]
    })
}

exports.createCollection = (user_id, title) => {
  return db.query(
    'INSERT INTO collections (user_id, title) VALUES ($1, $2) RETURNING *;',
    [user_id, title]
  ).then(({ rows }) => rows[0])
}

exports.addArtworkToCollection = (collection_id, artwork_id) => {
  return db.query(
    "INSERT INTO collection_artworks (collection_id, artwork_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *;",
    [collection_id, artwork_id]
  ).then(({ rows }) => (rows.length > 0 ? rows[0] : null)) 
}


exports.doesCollectionExist = (collection_id) => {
  return db.query('SELECT * FROM collections WHERE id = $1', [collection_id])
    .then(({ rows }) => rows.length > 0) 
}

exports.doesArtworkExistInCollection = (collection_id, artwork_id) => {
  return db.query('SELECT * FROM collection_artworks WHERE collection_id = $1 AND artwork_id = $2', [collection_id, artwork_id])
    .then(({ rows }) => rows.length > 0)
}

exports.removeArtworkFromCollection = (collection_id, artwork_id) => {
  return db.query('DELETE FROM collection_artworks WHERE collection_id = $1 AND artwork_id = $2 RETURNING *;', [collection_id, artwork_id])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: 'Artwork not found in collection' })
      }
      return rows[0]
    })
}

exports.getCollectionsByUser = (user_id) => {
  return db.query('SELECT * FROM collections WHERE user_id = $1;', [user_id])
    .then(({ rows }) => rows)
}

exports.getCollectionArtworks = (collection_id) => {
  return db.query(
    `SELECT artworks.* FROM artworks
    JOIN collection_artworks ON artworks.id = collection_artworks.artwork_id
    WHERE collection_artworks.collection_id = $1;`,
    [collection_id]
  ).then(({ rows }) => rows)
}

exports.deleteCollection = (collection_id) => {
  return db.query(
    'DELETE FROM collections WHERE id = $1',
    [collection_id]
  ).then(() => {
    return { success: true, message: 'Collection deleted successfully' }
  })
}