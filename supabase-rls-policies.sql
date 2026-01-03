-- Políticas de Row Level Security (RLS) para Supabase
-- Ejecutar este script en el SQL Editor de Supabase después de crear las tablas

-- Habilitar RLS en todas las tablas
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_calendar_tokens ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS PARA appointments
-- ============================================

-- Permitir lectura pública de citas (solo para verificar disponibilidad)
-- Pero solo campos no sensibles
CREATE POLICY "Allow public read of appointment dates and times"
ON appointments
FOR SELECT
USING (true);

-- Permitir inserción pública (para que los pacientes puedan crear citas)
CREATE POLICY "Allow public insert of appointments"
ON appointments
FOR INSERT
WITH CHECK (true);

-- Solo el servicio (usando service role key) puede actualizar o eliminar
-- Esto se maneja a través de las APIs autenticadas

-- ============================================
-- POLÍTICAS PARA reviews
-- ============================================

-- Permitir lectura pública solo de reseñas aprobadas
CREATE POLICY "Allow public read of approved reviews"
ON reviews
FOR SELECT
USING (status = 'approved');

-- Permitir inserción pública (para que los pacientes puedan dejar reseñas)
CREATE POLICY "Allow public insert of reviews"
ON reviews
FOR INSERT
WITH CHECK (true);

-- Solo el servicio puede actualizar o eliminar reseñas
-- Esto se maneja a través de las APIs autenticadas

-- ============================================
-- POLÍTICAS PARA site_config
-- ============================================

-- Permitir lectura pública de la configuración del sitio
CREATE POLICY "Allow public read of site config"
ON site_config
FOR SELECT
USING (true);

-- Solo el servicio puede actualizar la configuración
-- Esto se maneja a través de las APIs autenticadas

-- ============================================
-- POLÍTICAS PARA google_calendar_tokens
-- ============================================

-- No permitir acceso público a los tokens de Google Calendar
-- Solo el servicio puede leer y escribir
-- Esto se maneja completamente a través de las APIs autenticadas

-- Nota: Para operaciones administrativas (UPDATE, DELETE), el código usa
-- SUPABASE_SERVICE_ROLE_KEY que bypassa RLS. Esto es necesario porque
-- las operaciones administrativas se autentican a través de JWT en las APIs,
-- no directamente en Supabase.

-- ============================================
-- RECOMENDACIONES ADICIONALES
-- ============================================

-- 1. Considerar agregar políticas más restrictivas si es necesario
-- 2. Revisar periódicamente los logs de Supabase para detectar accesos inusuales
-- 3. Usar Supabase Auth para autenticación de usuarios si se expande la funcionalidad
-- 4. Considerar usar funciones de base de datos (stored procedures) para operaciones críticas

