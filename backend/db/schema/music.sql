

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'music_genre') THEN
    CREATE TYPE music_genre AS ENUM ('rnb', 'country', 'classic', 'rock', 'jazz');
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS music (
  id BIGSERIAL PRIMARY KEY,
  artist_id BIGINT NOT NULL,
  title TEXT NOT NULL,
  album_name TEXT,
  genre music_genre,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ NULL,
  CONSTRAINT fk_music_artist
    FOREIGN KEY (artist_id) 
    REFERENCES artists(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

ALTER TABLE music ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL;

CREATE INDEX IF NOT EXISTS idx_music_artist_id ON music (artist_id);
CREATE INDEX IF NOT EXISTS idx_music_artist_title ON music (artist_id, title);
CREATE INDEX IF NOT EXISTS idx_music_genre ON music (genre) WHERE genre IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_music_created_at_desc ON music (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_music_active ON music (artist_id, title) WHERE deleted_at IS NULL;

DROP TRIGGER IF EXISTS trg_music_set_updated_at ON music;
CREATE TRIGGER trg_music_set_updated_at
BEFORE UPDATE ON music
FOR EACH ROW
EXECUTE FUNCTION trigger_set_updated_at();
