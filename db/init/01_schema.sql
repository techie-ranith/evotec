-- Evotec PostgreSQL schema (runs once on first container start)
-- Matches the domain model used by the API (users + form submissions)

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('CUSTOMER', 'ADMIN');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE gender_type AS ENUM ('MALE', 'FEMALE', 'OTHER');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role user_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

CREATE TABLE IF NOT EXISTS form_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  gender gender_type NOT NULL,
  mobile_number VARCHAR(20) NOT NULL,
  address TEXT NOT NULL,
  feedback TEXT,
  user_created UUID NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
  date_created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_modified UUID REFERENCES users (id) ON DELETE SET NULL,
  date_modified TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_form_submissions_gender ON form_submissions (gender);
CREATE INDEX IF NOT EXISTS idx_form_submissions_name ON form_submissions (first_name, last_name);
CREATE INDEX IF NOT EXISTS idx_form_submissions_user_created ON form_submissions (user_created);
