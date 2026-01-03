-- Agregar estado 'attended' a la tabla appointments
-- Ejecuta este script en el SQL Editor de Supabase

-- Verificar si el estado 'attended' ya está permitido
-- Si no, necesitarías agregar una constraint CHECK, pero como status es TEXT,
-- simplemente podemos usar el nuevo estado directamente

-- Crear índice para búsquedas por estado attended
CREATE INDEX IF NOT EXISTS idx_appointments_status_attended 
ON appointments(status) 
WHERE status = 'attended';

-- Nota: Si tienes una constraint CHECK en la columna status, 
-- necesitarías ejecutar algo como esto (pero primero verifica si existe):
-- ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_status_check;
-- ALTER TABLE appointments ADD CONSTRAINT appointments_status_check 
-- CHECK (status IN ('pending', 'confirmed', 'cancelled', 'expired', 'attended'));

