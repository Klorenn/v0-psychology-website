# 🗄️ Guía Completa: Base de Datos Neon

## ✅ Estado Actual

Tu base de datos Neon está **conectada y lista**. Solo necesitas inicializar las tablas.

---

## 🚀 Opción 1: Inicialización Automática (Recomendada)

### Paso 1: Esperar al Redeploy
Espera 1-2 minutos a que Vercel termine de redesplegar.

### Paso 2: Visitar el Endpoint
Abre en tu navegador la URL de tu deployment más reciente:

```
https://TU-DEPLOYMENT-URL.vercel.app/api/db/init
```

**Deberías ver:**
```json
{
  "success": true,
  "message": "Base de datos inicializada correctamente"
}
```

✅ **Listo!** Las tablas se crean automáticamente.

---

## 🛠️ Opción 2: Inicialización Manual (SQL Editor)

Si prefieres hacerlo manualmente desde el SQL Editor de Neon:

### Paso 1: Abrir SQL Editor
1. Ve a tu proyecto en Vercel Dashboard
2. Click en **"Storage"** → **"Neon"**
3. Click en **"Open in Neon Console"**
4. Ve a **"SQL Editor"**

### Paso 2: Ejecutar el Script
Copia y pega el contenido del archivo `init-database.sql` en el SQL Editor y ejecuta.

**O ejecuta este script directamente:**

```sql
-- Crear tabla de citas
CREATE TABLE IF NOT EXISTS appointments (
  id TEXT PRIMARY KEY,
  patient_name TEXT NOT NULL,
  patient_email TEXT NOT NULL,
  patient_phone TEXT NOT NULL,
  consultation_reason TEXT,
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

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_appointments_date 
ON appointments(date);

CREATE INDEX IF NOT EXISTS idx_appointments_status 
ON appointments(status);

-- Crear tabla de configuración
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

-- Agregar columna user_email si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'google_calendar_tokens' 
    AND column_name = 'user_email'
  ) THEN
    ALTER TABLE google_calendar_tokens ADD COLUMN user_email TEXT;
  END IF;
END $$;
```

### Paso 3: Verificar
Ejecuta esta consulta para verificar que las tablas se crearon:

```sql
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
FROM google_calendar_tokens;
```

Deberías ver las 3 tablas con 0 filas cada una.

---

## 📊 Estructura de las Tablas

### 1. `appointments` - Citas
Guarda todas las reservas de pacientes:
- Información del paciente (nombre, email, teléfono)
- Fecha y hora de la cita
- Estado (pending, confirmed, cancelled, expired)
- Información de pago (método, ID de pago)
- Comprobantes de transferencia (base64)

### 2. `site_config` - Configuración
Guarda la configuración del sitio:
- Plantilla de emails
- Configuración general
- Preferencias

### 3. `google_calendar_tokens` - Tokens de Google
Guarda los tokens de OAuth de Google Calendar:
- Access token y refresh token
- Email del usuario vinculado
- ID del calendario

---

## ✅ Verificar que Funciona

### Test 1: Hacer una Reserva
1. Ve a tu sitio web
2. Haz una reserva de prueba
3. Ve al dashboard
4. ✅ La reserva debería aparecer

### Test 2: Verificar en Neon
1. Abre Neon Console → SQL Editor
2. Ejecuta: `SELECT * FROM appointments;`
3. ✅ Deberías ver tu reserva de prueba

### Test 3: Google Calendar
1. Dashboard → Google Calendar → Vincular
2. Haz una reserva y confírmala
3. ✅ Debería aparecer en tu calendario de Google

---

## 🔧 Variables de Entorno

Neon automáticamente configuró estas variables en Vercel:

- ✅ `DATABASE_URL` - Para conexiones normales
- ✅ `DATABASE_URL_UNPOOLED` - Para conexiones directas (opcional)

**No necesitas hacer nada más.** Ya están configuradas.

---

## 💰 Plan Gratuito de Neon

Tu plan gratuito incluye:
- ✅ 3 proyectos
- ✅ 512 MB de almacenamiento
- ✅ 100 horas de compute/mes
- ✅ Más que suficiente para tu sitio

**No necesitas pagar nada.**

---

## 🎯 Resumen

### ✅ Ya está hecho:
1. ✅ Neon conectado a Vercel
2. ✅ Driver instalado (`@neondatabase/serverless`)
3. ✅ Código actualizado
4. ✅ Variables de entorno configuradas

### 🔄 Solo falta:
1. ⏳ Inicializar las tablas (Opción 1 o 2 arriba)
2. ✅ ¡Listo!

---

## 🆘 Si Algo No Funciona

### Error: "DATABASE_URL no está configurado"
- Verifica en Vercel Dashboard → Settings → Environment Variables
- Debería estar `DATABASE_URL` con el valor de Neon

### Error: "Table does not exist"
- Ejecuta el script SQL manualmente (Opción 2)
- O visita `/api/db/init` (Opción 1)

### Error: "Connection refused"
- Verifica que Neon esté activo en Vercel Dashboard
- Revisa los logs de Vercel para más detalles

---

## 📝 Notas Importantes

1. **Solo necesitas inicializar UNA VEZ** - Después de esto, las tablas permanecen
2. **Los datos persisten** - Aunque redesplegues, los datos se mantienen
3. **Automático** - El sistema inicializa las tablas automáticamente si no existen (desde el último update)
4. **Gratis** - El plan gratuito es más que suficiente

---

**✨ Tu base de datos está lista. Solo inicializa las tablas y todo funcionará perfectamente! ✨**

