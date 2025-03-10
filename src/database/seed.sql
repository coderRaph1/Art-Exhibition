INSERT INTO users (username, email) VALUES
('john_doe', 'john@example.com'),
('jane_smith', 'jane@example.com');

INSERT INTO artworks (title, artist, museum, image_url) VALUES
('Mona Lisa', 'Leonardo da Vinci', 'Louvre Museum', 'https://example.com/mona_lisa.jpg'),
('Starry Night', 'Vincent van Gogh', 'MoMA', 'https://example.com/starry_night.jpg');

INSERT INTO collections (user_id, title, description) VALUES
(1, 'Famous Paintings', 'A collection of famous artworks'),
(2, 'Impressionist Art', 'Best impressionist paintings');

INSERT INTO collection_artworks (collection_id, artwork_id) VALUES
(1, 1), -- Mona Lisa in "Famous Paintings"
(1, 2), -- Starry Night in "Famous Paintings"
(2, 2); -- Starry Night in "Impressionist Art"

