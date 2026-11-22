CREATE TABLE IF NOT EXISTS gallery_images(
  id TEXT PRIMARY KEY,
  image_data TEXT NOT NULL,
  alt_text TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);
