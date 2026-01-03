-- Agregar columna rating a la tabla reviews
-- Ejecuta este script en el SQL Editor de Supabase

ALTER TABLE reviews 
ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating >= 1 AND rating <= 5);

-- Crear índice para búsquedas por rating
CREATE INDEX IF NOT EXISTS idx_reviews_rating 
ON reviews(rating);

