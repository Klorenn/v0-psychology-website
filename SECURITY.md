# Políticas de Seguridad

Este documento describe las políticas y prácticas de seguridad implementadas en la plataforma.

## Autenticación y Autorización

### Sistema de Autenticación

- **Autenticación del Servidor**: Todas las operaciones administrativas requieren autenticación mediante JWT tokens
- **Credenciales**: Las credenciales de administrador están almacenadas en variables de entorno del servidor (NO en `NEXT_PUBLIC_*`)
- **Sesiones**: Las sesiones se gestionan mediante tokens JWT con expiración de 24 horas
- **APIs Protegidas**: Las siguientes APIs requieren autenticación:
  - `/api/appointments/clear-all`
  - `/api/appointments/update-status`
  - `/api/appointments/send-email`
  - `/api/site-config` (POST)
  - `/api/reviews/delete`
  - `/api/reviews/update-status`
  - `/api/upload-image`

### Variables de Entorno

- **Sensibles**: `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `JWT_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`
- **Públicas**: Solo `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_BASE_URL` (no contienen información sensible)

## Validación de Inputs

### Validaciones Implementadas

- **Tipos de Datos**: Todos los inputs se validan por tipo (string, number, etc.)
- **Rangos**: Validación de rangos para valores numéricos (ej: rating 1-5)
- **Formatos**: Validación de formatos (email, teléfono, UUID)
- **Longitudes**: Límites de longitud para strings
- **Sanitización**: Sanitización de strings para prevenir XSS

### Validación de Archivos

- **Magic Bytes**: Verificación de magic bytes para validar tipos de archivo reales
- **Tamaño**: Límite de 5MB por archivo
- **Tipos Permitidos**: Solo JPG y PNG
- **Dimensiones**: Validación de dimensiones máximas (4000x4000px)

## Seguridad de Base de Datos

### Row Level Security (RLS)

- **Habilitado**: RLS está habilitado en todas las tablas
- **Políticas**: Ver `supabase-rls-policies.sql` para políticas específicas
- **Service Role Key**: Se usa solo para operaciones administrativas autenticadas

### Protección contra Inyección SQL

- **Supabase Client**: Todas las consultas usan el cliente de Supabase que previene inyección SQL
- **Parámetros**: Todas las consultas usan parámetros preparados

## Manejo de Errores

### Principios

- **Sin Stack Traces en Producción**: Los errores en producción no exponen stack traces
- **Mensajes Genéricos**: Mensajes de error genéricos para usuarios finales
- **Logging Detallado**: Logs detallados solo en el servidor (no expuestos al cliente)

## Validación de Estado

### Transiciones de Estado

- **Appointments**: Validación de transiciones válidas de estado
  - `pending` → `confirmed`, `cancelled`, `expired`
  - `confirmed` → `cancelled`, `attended`, `expired`
  - Estados finales (`cancelled`, `expired`, `attended`) no pueden cambiar

## Webhooks

### Validación de Webhooks

- **Flow**: Validación de firma usando secret key
- **Transbank**: Validación de origen y firma
- **Idempotencia**: Los webhooks son idempotentes para prevenir procesamiento duplicado

## Actualización de Credenciales

### Proceso

1. Actualizar variables de entorno en el servidor (Vercel, etc.)
2. Reiniciar la aplicación
3. Los usuarios existentes deberán iniciar sesión nuevamente (tokens JWT anteriores serán inválidos)

## Respuesta a Incidentes

### En caso de compromiso

1. **Inmediato**: Cambiar todas las credenciales (admin, JWT secret, service role key)
2. **Revisar Logs**: Revisar logs de Supabase y del servidor para detectar accesos no autorizados
3. **Notificar**: Notificar a usuarios afectados si es necesario
4. **Auditoría**: Realizar auditoría completa de accesos y cambios

## Mejores Prácticas

### Desarrollo

- Nunca commitees archivos `.env` o `.env.local`
- Usa variables de entorno para todos los secretos
- Valida todos los inputs del usuario
- Usa HTTPS en producción
- Implementa rate limiting para prevenir abuso

### Producción

- Revisa logs regularmente
- Mantén dependencias actualizadas
- Usa un gestor de secretos (Vercel, AWS Secrets Manager, etc.)
- Implementa monitoreo y alertas
- Realiza backups regulares de la base de datos

## Contacto

Para reportar vulnerabilidades de seguridad, contacta al administrador del sistema.

