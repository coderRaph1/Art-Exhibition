process.env.PORT = 3001

const request = require("supertest")
const app = require("../server")
const db = require("../src/database/connection")
const axios = require("axios")

jest.mock("axios")
jest.mock("../src/database/connection")

const mockHarvardData = {
  data: {
    records: [
      { title: "Artwork 1", artist: "Artist 1", primaryimageurl: "image1.jpg" },
      { title: "Artwork 2", artist: "Artist 2", primaryimageurl: "image2.jpg" },
    ],
  },
}

const mockChicagoData = {
  data: {
    data: [
      {
        id: 1,
        title: "Artwork 3",
        artist_title: "Artist 3",
        thumbnail: { url: "image3.jpg" },
      },
      {
        id: 2,
        title: "Artwork 4",
        artist_title: "Artist 4",
        thumbnail: { url: "image4.jpg" },
      },
    ],
  },
}

describe("Artwork API Tests", () => {

    beforeEach(() => {
    axios.get.mockResolvedValueOnce(mockHarvardData)
    axios.get.mockResolvedValueOnce(mockChicagoData)
  })


  beforeAll(() => {
    db.query.mockImplementation((query, params) => {
      if (query.includes("WHERE artist")) { 
        const artistName = params[0].toLowerCase() 
        if (artistName === 'van gogh') {
          return Promise.resolve({
            rows: [
              { title: "Starry Night", artist: "Van Gogh", date_created: "1889" },
              { title: "Sunflowers", artist: "Van Gogh", date_created: "1888" },
            ],
          })
        } else {
          return Promise.resolve({ rows: [] }) 
        }
      } else if (query.includes("ORDER BY title")) { 
        return Promise.resolve({
          rows: [
            { title: "Starry Night", artist: "Van Gogh", date_created: "1889" },
            { title: "Sunflowers", artist: "Van Gogh", date_created: "1888" },
          ],
        })
      } else if (query.includes("ORDER BY date_created")) { 
        return Promise.resolve({
          rows: [
            { title: "Sunflowers", artist: "Van Gogh", date_created: "1888" },
            { title: "Starry Night", artist: "Van Gogh", date_created: "1889" },
          ],
        })
      }
      return Promise.resolve({ rows: [] })
    })
  })


  afterAll(() => {
    jest.resetAllMocks()
  })


  it("Should create a new collection", () => {
    db.query.mockResolvedValueOnce({
      rows: [{ id: 2, title: "My Favorite Artworks", user_id: 1 }],
    })

    return request(app)
      .post("/api/collections")
      .send({
        user_id: 1,
        title: "My Favorite Artworks",
      })
      .then((response) => {
        expect(response.body).toHaveProperty("collection")
        expect(response.body.collection).toHaveProperty("id")
        expect(response.body.collection).toHaveProperty(
          "title",
          "My Favorite Artworks"
        )
        expect(response.body.collection).toHaveProperty("user_id", 1)
      })
  })

// it("Should remove artwork from collection", () => {
//     const collectionId = 2
//     const artworkId = 1
  
  
//     // Mock DB response for deleting the artwork (should return the deleted row)
//     db.query.mockResolvedValueOnce({
//       rows: [{ collection_id: collectionId, artwork_id: artworkId }],
//     })
  
//     return request(app)
//       .delete(`/api/collections/${collectionId}/artworks/${artworkId}`)
//       .send()
//       .then((removeResponse) => {
//         // Expect 200 success response
//         expect(removeResponse.status).toBe(204)
//         expect(removeResponse.body).toHaveProperty(
//           "message",
//           "Artwork removed from collection"
//         )
//       })
//   })
  

  it("Should fetch all collections for a user", () => {
    db.query.mockResolvedValueOnce({
      rows: [{ id: 1, title: "Test Collection", user_id: 1 }],
    })
    return request(app)
      .get("/api/collections/user/1")
      .then((response) => {
        expect(response.status).toBe(200)
        expect(Array.isArray(response.body.collections)).toBe(true)
        expect(response.body.collections.length).toBeGreaterThanOrEqual(1)
      })
      .catch((err) => {
        throw new Error(err)
      })
  })

  it("Should fetch all artworks in a collection", () => {
    db.query.mockResolvedValueOnce({
        rows: [{ id: 2, title: "My Favorite Artworks", user_id: 1 }],
      })
      .mockResolvedValueOnce({ rows: [{ collection_id: 2, artwork_id: 15 }] })

    return request(app)
      .post("/api/collections")
      .send({
        user_id: 1,
        title: "My Favorite Artworks",
      })
      .then((collectionResponse) => {
        const collectionId = collectionResponse.body.collection.id

        return request(app).get(`/api/collections/${collectionId}/artworks`)
      })
      .then((artworksResponse) => {
        expect(artworksResponse.status).toBe(200)
        expect(Array.isArray(artworksResponse.body.artworks)).toBe(true)
        expect(artworksResponse.body.artworks.length).toBeGreaterThanOrEqual(1)
      })
      .catch((err) => {
        throw new Error(err)
      })
  })

  it("Should return an error if required fields are missing when creating a collection", () => {
    return request(app)
      .post("/api/collections")
      .send({
        user_id: 1,
      })
      .then((response) => {
        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty("error", "Title is required")
      })
  })

  it("Should return an error if the user_id is invalid", () => {
    return request(app)
      .post("/api/collections")
      .send({
        user_id: "invalid",
        title: "My Art Collection",
      })
      .then((response) => {
        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty("error", "Invalid user_id")
      })
  })

  it("Should fetch artwork by ID", () => {
    const artworkId = 34
    db.query.mockResolvedValueOnce({
      rows: [{ id: artworkId, title: "Mona Lisa", artist: "Da Vinci" }],
    })

    return request(app)
      .get(`/api/artworks/${artworkId}`)
      .then((response) => {
        expect(response.status).toBe(200)
        expect(response.body.artwork).toHaveProperty("id", artworkId)
        expect(response.body.artwork).toHaveProperty("title", "Mona Lisa")
        expect(response.body.artwork).toHaveProperty("artist", "Da Vinci")
      })
  })

  it("Should fetch all artworks", () => {
    db.query.mockResolvedValueOnce({
      rows: [
        { id: 1, title: "Mona Lisa" },
        { id: 2, title: "Starry Night" },
      ],
    })
    return request(app)
      .get("/api/artworks")
      .then((response) => {
        expect(response.status).toBe(200)
        expect(response.body.artworks.length).toBeGreaterThanOrEqual(2)
        expect(response.body.artworks[0]).toHaveProperty("title", "Mona Lisa")
      })
  })

  it("Should return an error when fetching a non-existent artwork", () => {
    const artworkId = 999
    db.query.mockResolvedValueOnce({ rows: [] })
    return request(app)
      .get(`/api/artworks/${artworkId}`)
      .then((response) => {
        expect(response.status).toBe(404)
        expect(response.body).toHaveProperty(
          "error",
          `Artwork with ID ${artworkId} not found`
        )
      })
  })

  it("Should fetch all collections for a specific user", () => {
    const userId = 1
    db.query.mockResolvedValueOnce({
      rows: [
        { id: 1, title: "Collection 1", user_id: userId },
        { id: 2, title: "Collection 2", user_id: userId },
      ],
    })
    return request(app)
      .get(`/api/collections/user/${userId}`)
      .then((response) => {
        expect(response.status).toBe(200)
        expect(response.body.collections.length).toBeGreaterThan(0)
      })
  })

  it("Should return an error when adding artwork to collection with missing data", () => {
    return request(app)
      .post("/api/collections/:collection_id/artworks")
      .send({ collection_id: 117 })
      .then((response) => {
        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty("error", "Artwork ID is required")
      })
  })

//   it("Should return an error when removing artwork not in the collection", () => {
//     const collectionId = 117
//     const artworkId = 999

//     db.query.mockResolvedValueOnce({ rows: [] })
//     return request(app)
//     .delete(`/api/collections/${collectionId}/artworks/${artworkId}`)
//     .send()
//       .then((response) => {
//         expect(response.status).toBe(400)
//         expect(response.body).toHaveProperty(
//           "error",
//           "Artwork not found in the collection"
//         )
//       })
//   })

  it("Should filter artworks by artist", () => {
    db.query.mockResolvedValueOnce({
      rows: [
        { id: 1, title: "Mona Lisa", artist: "Da Vinci" },
        { id: 2, title: "The Last Supper", artist: "Da Vinci" },
      ],
    })
    return request(app)
      .get("/api/artworks?artist=Da Vinci")
      .then((response) => {
        expect(response.status).toBe(200)
        expect(response.body.artworks.length).toBeGreaterThanOrEqual(2)
        expect(response.body.artworks[0]).toHaveProperty("artist", "Da Vinci")
      })
  })

  it("Should return a limited number of results per page", () => {
    db.query.mockResolvedValueOnce({
      rows: [
        { id: 1, title: "Artwork A" },
        { id: 2, title: "Artwork B" },
      ],
    })

    return request(app)
      .get("/api/artworks?page=1&limit=2")
      .then((response) => {
        expect(response.status).toBe(200)
        expect(response.body.artworks).toHaveLength(2)
        expect(db.query).toHaveBeenCalledWith(
          expect.stringContaining("LIMIT"),
          expect.arrayContaining([2, 0])
        )
      })
      .catch((err) => {
        throw new Error(err)
      })
  })

  it("Should return the next page of results", () => {
    db.query.mockResolvedValueOnce({
      rows: [
        { id: 3, title: "Artwork C" },
        { id: 4, title: "Artwork D" },
      ],
    })

    return request(app)
      .get("/api/artworks?page=2&limit=2")
      .then((response) => {
        expect(response.status).toBe(200)
        expect(response.body.artworks).toHaveLength(2)
        expect(db.query).toHaveBeenCalledWith(
          expect.stringContaining("LIMIT"),
          expect.arrayContaining([2, 2])
        )
      })
      .catch((err) => {
        throw new Error(err)
      })
  })

  it("Should not allow a negative page number", () => {
    return request(app)
      .get("/api/artworks?page=-1&limit=2")
      .then((response) => {
        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty(
          "error",
          "Page number must be positive"
        )
      })
      .catch((err) => {
        throw new Error(err)
      })
  })

  it("Should return an empty array if there are no more results", () => {
    db.query.mockResolvedValueOnce({
      rows: [],
    })

    return request(app)
      .get("/api/artworks?page=100&limit=2")
      .then((response) => {
        expect(response.status).toBe(200)
        expect(response.body.artworks).toEqual([])
      })
      .catch((err) => {
        throw new Error(err)
      })
  })

  it("should filter artworks by artist with different casing (e.g., 'van gogh' vs. 'Van Gogh')", () => {
    return request(app)
      .get("/api/artworks?artist=van%20gogh")
      .then((response) => {
        expect(response.status).toBe(200)
        expect(response.body.artworks).toHaveLength(2)
        expect(response.body.artworks[0].artist).toBe("Van Gogh")
      })
  })

//   it("should handle case where no artworks match the filter", () => {
//     return request(app)
//       .get("/artworks?artist=NonExistentArtist")  // Filtering by an artist that doesn't exist
//       .then((response) => {
//         expect(response.status).toBe(200)
//         expect(response.body.artworks).toHaveLength(0) // Expecting an empty array
//       })
//   })

  it("should sort artworks by date in ascending order", () => {
    return request(app)
      .get("/api/artworks?sort_by=date_created&sort_order=ASC")
      .then((response) => {
        expect(response.status).toBe(200)
        expect(response.body.artworks[0].title).toBe("Sunflowers")
        expect(response.body.artworks[1].title).toBe("Starry Night")
      })
  })

  it("should sort artworks by title in ascending order", () => {
    return request(app)
      .get("/api/artworks?sort_by=title&sort_order=ASC")
      .then((response) => {
          expect(response.status).toBe(200)
          expect(response.body.artworks[0].title).toBe("Starry Night")
        expect(response.body.artworks[1].title).toBe("Sunflowers")
      })
  })

  it("should prevent duplicate artwork from being added to the same collection", () => {
    db.query.mockResolvedValueOnce({ rows: [] }) 
  
    return request(app)
      .post("/api/collections/:collection_id/artworks")
      .send({ artwork_id: 1 })
      .expect(409)
      .then((response) => {
        expect(response.body.error).toBe("Artwork already exists in the collection")
      })
  })


  it("should return 404 when trying to remove artwork from a non-existent collection", () => {
    db.query.mockResolvedValueOnce({ rows: [] }) 
  
    return request(app)
      .delete("/api/collections/999/artworks/1")
      .expect(404)
      .then((response) => {
        console.log(response.body, '<<<<<')
        expect(response.body.error).toBe("Collection not found")
      })
  })

//   it("should persist collections correctly after updates", () => {
//     db.query.mockResolvedValueOnce({ rowCount: 1 }) // Simulating successful update

//     db.query.mockResolvedValueOnce({
//       rows: [{ id: 1, name: "Updated Collection", description: "A test collection" }],
//     })

//     return request(app)
//       .patch("/api/collections/1")
//       .send({ name: "Updated Collection" })
//       .expect(200)
//       .then(() => {
//         return request(app)
//           .get("/collections/1")
//           .expect(200)
//           .then((response) => {
//             expect(response.body.collection.name).toBe("Updated Collection")
//           })
//       })
//   })
})
