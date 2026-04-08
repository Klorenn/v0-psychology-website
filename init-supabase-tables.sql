-- ============================================================
-- SCHEMA COMPLETO - Psicoterapia María
-- Ejecutar en: Supabase → SQL Editor → New query → Run
-- ============================================================

-- ── 1. TABLA: appointments ──────────────────────────────────
CREATE TABLE IF NOT EXISTS appointments (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name              TEXT NOT NULL,
  patient_email             TEXT NOT NULL,
  patient_phone             TEXT NOT NULL,
  consultation_reason       TEXT,
  emergency_contact_relation TEXT,
  emergency_contact_name    TEXT,
  emergency_contact_phone   TEXT,
  appointment_type          TEXT NOT NULL CHECK (appointment_type IN ('online', 'presencial')),
  date                      TIMESTAMPTZ NOT NULL,
  time                      TEXT NOT NULL,
  status                    TEXT NOT NULL DEFAULT 'pending'
                              CHECK (status IN ('pending', 'confirmed', 'attended', 'cancelled', 'expired')),
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at                TIMESTAMPTZ,
  receipt_url               TEXT,
  receipt_data              TEXT,
  receipt_filename          TEXT,
  receipt_mimetype          TEXT,
  payment_method            TEXT,
  payment_id                TEXT,
  calendar_event_id         TEXT,
  meet_link                 TEXT
);

-- ── 2. TABLA: site_config ───────────────────────────────────
CREATE TABLE IF NOT EXISTS site_config (
  id         INTEGER PRIMARY KEY DEFAULT 1,
  config     JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Solo puede haber una fila (id=1)
ALTER TABLE site_config ADD CONSTRAINT site_config_single_row CHECK (id = 1);

-- ── 3. TABLA: google_calendar_tokens ────────────────────────
CREATE TABLE IF NOT EXISTS google_calendar_tokens (
  id            INTEGER PRIMARY KEY DEFAULT 1,
  access_token  TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expiry_date   BIGINT,
  calendar_id   TEXT,
  user_email    TEXT,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Solo puede haber una fila (id=1)
ALTER TABLE google_calendar_tokens ADD CONSTRAINT google_tokens_single_row CHECK (id = 1);

-- ── 4. TABLA: reviews ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content          TEXT NOT NULL,
  rating           INTEGER CHECK (rating >= 1 AND rating <= 5),
  author_name      TEXT,
  author_pill_name TEXT,
  is_anonymous     BOOLEAN NOT NULL DEFAULT false,
  status           TEXT NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at      TIMESTAMPTZ
);

-- ── ÍNDICES ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_appointments_status     ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_date       ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_created_at ON appointments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_status          ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at      ON reviews(created_at DESC);

-- ── ROW LEVEL SECURITY ──────────────────────────────────────
-- Deshabilitado para que el backend pueda operar sin service_role key.
-- Si añades autenticación de usuarios finales, habilita y configura policies.

ALTER TABLE appointments          DISABLE ROW LEVEL SECURITY;
ALTER TABLE site_config           DISABLE ROW LEVEL SECURITY;
ALTER TABLE google_calendar_tokens DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews               DISABLE ROW LEVEL SECURITY;

-- ── VERIFICACIÓN FINAL ──────────────────────────────────────
SELECT table_name, COUNT(*) AS filas
FROM (
  SELECT 'appointments'           AS table_name, COUNT(*) FROM appointments
  UNION ALL
  SELECT 'site_config'            AS table_name, COUNT(*) FROM site_config
  UNION ALL
  SELECT 'google_calendar_tokens' AS table_name, COUNT(*) FROM google_calendar_tokens
  UNION ALL
  SELECT 'reviews'                AS table_name, COUNT(*) FROM reviews
) t
GROUP BY table_name
ORDER BY table_name;
