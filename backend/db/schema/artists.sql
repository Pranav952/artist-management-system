

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'artist_gender') THEN
    CREATE TYPE artist_gender AS ENUM ('male', 'female', 'other');
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS artists (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  dob DATE,
  gender artist_gender,
  address TEXT,
  first_release_year INTEGER,
  no_of_albums_released INTEGER NOT NULL DEFAULT 0 CHECK (no_of_albums_released >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ NULL,
  CHECK (
    first_release_year IS NULL
    OR (first_release_year >= 1800 AND first_release_year <= EXTRACT(YEAR FROM NOW())::INT)
  )
);

ALTER TABLE artists ADD COLUMN IF NOT EXISTS dob DATE;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS gender artist_gender;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS first_release_year INTEGER;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS no_of_albums_released INTEGER NOT NULL DEFAULT 0;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE artists ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE artists ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL;

CREATE INDEX IF NOT EXISTS idx_artists_name ON artists (name);
CREATE INDEX IF NOT EXISTS idx_artists_created_at_desc ON artists (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_artists_active_name ON artists (name) WHERE deleted_at IS NULL;


DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'trigger_set_updated_at') THEN
    CREATE OR REPLACE FUNCTION trigger_set_updated_at()
    RETURNS TRIGGER LANGUAGE plpgsql AS $fn$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $fn$;
  END IF;
END$$;

DROP TRIGGER IF EXISTS trg_artists_set_updated_at ON artists;
CREATE TRIGGER trg_artists_set_updated_at
BEFORE UPDATE ON artists
FOR EACH ROW
EXECUTE FUNCTION trigger_set_updated_at();

