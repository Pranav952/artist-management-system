
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('admin');
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(500) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  dob TIMESTAMP WITH TIME ZONE NOT NULL,
  gender VARCHAR(6) NOT NULL CHECK (gender IN ('m','f','o')),
  address VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE NULL
);

DROP INDEX IF EXISTS ux_users_email;
CREATE UNIQUE INDEX IF NOT EXISTS ux_users_email_active ON users (email) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_created_at_desc ON users (created_at DESC);
