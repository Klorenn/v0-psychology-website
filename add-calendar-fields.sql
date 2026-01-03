-- Agregar columnas para Google Calendar event ID y Meet link
-- Ejecutar este script en el SQL Editor de Supabase

DO $$ 
BEGIN
  -- Agregar calendar_event_id si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'appointments' 
    AND column_name = 'calendar_event_id'
  ) THEN
    ALTER TABLE appointments ADD COLUMN calendar_event_id TEXT;
  END IF;
  
  -- Agregar meet_link si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'appointments' 
    AND column_name = 'meet_link'
  ) THEN
    ALTER TABLE appointments ADD COLUMN meet_link TEXT;
  END IF;
END $$;

-- Crear índice para búsquedas por calendar_event_id
CREATE INDEX IF NOT EXISTS idx_appointments_calendar_event_id 
ON appointments(calendar_event_id) 
WHERE calendar_event_id IS NOT NULL;

