-- ============================================
-- Script de Inicialización de Tablas Supabase
-- ============================================
-- Copia y pega este script en el SQL Editor de Supabase
-- Dashboard → SQL Editor → New Query → Pegar → Run

-- Crear tabla de citas
CREATE TABLE IF NOT EXISTS appointments (
  id TEXT PRIMARY KEY,
  patient_name TEXT NOT NULL,
  patient_email TEXT NOT NULL,
  patient_phone TEXT NOT NULL,
  consultation_reason TEXT,
  emergency_contact_relation TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  appointment_type TEXT NOT NULL,
  date TIMESTAMP NOT NULL,
  time TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  receipt_url TEXT,
  receipt_data TEXT,
  receipt_filename TEXT,
  receipt_mimetype TEXT,
  payment_method TEXT,
  payment_id TEXT
);

-- Crear índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_appointments_date 
ON appointments(date);

CREATE INDEX IF NOT EXISTS idx_appointments_status 
ON appointments(status);

-- Crear tabla de configuración del sitio
CREATE TABLE IF NOT EXISTS site_config (
  id INTEGER PRIMARY KEY DEFAULT 1,
  config JSONB NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de tokens de Google Calendar
CREATE TABLE IF NOT EXISTS google_calendar_tokens (
  id INTEGER PRIMARY KEY DEFAULT 1,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expiry_date BIGINT NOT NULL,
  calendar_id TEXT,
  user_email TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de reseñas
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  author_name TEXT,
  author_pill_name TEXT,
  is_anonymous BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL,
  approved_at TIMESTAMP,
  rejected_at TIMESTAMP
);

-- Crear índices para reseñas
CREATE INDEX IF NOT EXISTS idx_reviews_status 
ON reviews(status);

CREATE INDEX IF NOT EXISTS idx_reviews_created_at 
ON reviews(created_at DESC);

-- Verificar que las tablas se crearon correctamente
SELECT 
  'appointments' as table_name, 
  COUNT(*) as row_count 
FROM appointments
UNION ALL
SELECT 
  'site_config' as table_name, 
  COUNT(*) as row_count 
FROM site_config
UNION ALL
SELECT 
  'google_calendar_tokens' as table_name, 
  COUNT(*) as row_count 
FROM google_calendar_tokens
UNION ALL
SELECT 
  'reviews' as table_name, 
  COUNT(*) as row_count 
FROM reviews;

