y 
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

