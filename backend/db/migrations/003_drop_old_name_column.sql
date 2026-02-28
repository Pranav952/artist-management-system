BEGIN;

-- Drop the old 'name' column since we now use first_name and last_name
ALTER TABLE users DROP COLUMN IF EXISTS name;

COMMIT;
