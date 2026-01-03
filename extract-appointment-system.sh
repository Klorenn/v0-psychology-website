#!/bin/bash

# Script para extraer SOLO el sistema de citas a un nuevo directorio

DEST_DIR="../psychology-system-quotes"
SOURCE_DIR="."

echo "📦 Extrayendo sistema de citas a: $DEST_DIR"
echo ""

# Crear directorio destino
mkdir -p "$DEST_DIR"
mkdir -p "$DEST_DIR/lib"
mkdir -p "$DEST_DIR/app/api/appointments/update-status"
mkdir -p "$DEST_DIR/app/api/appointments/send-confirmation-email"
mkdir -p "$DEST_DIR/app/api/google-calendar/auth"
mkdir -p "$DEST_DIR/app/api/google-calendar/callback"
mkdir -p "$DEST_DIR/app/api/google-calendar/status"
mkdir -p "$DEST_DIR/sql"
mkdir -p "$DEST_DIR/examples"

echo "📁 Copiando archivos core..."

# Core files
cp "$SOURCE_DIR/lib/appointment-automation.ts" "$DEST_DIR/lib/"
cp "$SOURCE_DIR/lib/googleCalendar.ts" "$DEST_DIR/lib/"
cp "$SOURCE_DIR/lib/email-service.ts" "$DEST_DIR/lib/"
cp "$SOURCE_DIR/lib/google-calendar-auth.ts" "$DEST_DIR/lib/"
cp "$SOURCE_DIR/lib/google-calendar-auth-db.ts" "$DEST_DIR/lib/"
cp "$SOURCE_DIR/lib/timezone-service.ts" "$DEST_DIR/lib/"
cp "$SOURCE_DIR/lib/api-auth.ts" "$DEST_DIR/lib/" 2>/dev/null || echo "⚠️  api-auth.ts no encontrado (opcional)"

echo "📡 Copiando API routes..."

# API Routes
cp "$SOURCE_DIR/app/api/appointments/update-status/route.ts" "$DEST_DIR/app/api/appointments/update-status/" 2>/dev/null || echo "⚠️  update-status no encontrado"
cp "$SOURCE_DIR/app/api/appointments/send-confirmation-email/route.ts" "$DEST_DIR/app/api/appointments/send-confirmation-email/" 2>/dev/null || echo "⚠️  send-confirmation-email no encontrado"
cp "$SOURCE_DIR/app/api/google-calendar/auth/route.ts" "$DEST_DIR/app/api/google-calendar/auth/" 2>/dev/null || echo "⚠️  google-calendar/auth no encontrado"
cp "$SOURCE_DIR/app/api/google-calendar/callback/route.ts" "$DEST_DIR/app/api/google-calendar/callback/" 2>/dev/null || echo "⚠️  google-calendar/callback no encontrado"
cp "$SOURCE_DIR/app/api/google-calendar/status/route.ts" "$DEST_DIR/app/api/google-calendar/status/" 2>/dev/null || echo "⚠️  google-calendar/status no encontrado"

echo "🗄️  Copiando scripts SQL..."

# SQL Scripts
cp "$SOURCE_DIR/add-calendar-fields.sql" "$DEST_DIR/sql/calendar-fields.sql" 2>/dev/null || echo "⚠️  calendar-fields.sql no encontrado"
cp "$SOURCE_DIR/init-database.sql" "$DEST_DIR/sql/appointments-table.sql" 2>/dev/null || echo "⚠️  appointments-table.sql no encontrado"

# Crear script SQL para tokens de Google
cat > "$DEST_DIR/sql/google-tokens-table.sql" << 'EOF'
-- Tabla para almacenar tokens de OAuth de Google Calendar
-- Adapta según tu sistema de BD (PostgreSQL, MySQL, etc.)

-- PostgreSQL
CREATE TABLE IF NOT EXISTS google_calendar_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL UNIQUE,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expiry_date TIMESTAMP,
  token_type TEXT DEFAULT 'Bearer',
  scope TEXT,
  calendar_id TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_google_tokens_user_email ON google_calendar_tokens(user_email);

-- MySQL/MariaDB (alternativa)
-- CREATE TABLE IF NOT EXISTS google_calendar_tokens (
--   id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
--   user_email VARCHAR(255) NOT NULL UNIQUE,
--   access_token TEXT NOT NULL,
--   refresh_token TEXT,
--   expiry_date DATETIME,
--   token_type VARCHAR(50) DEFAULT 'Bearer',
--   scope TEXT,
--   calendar_id VARCHAR(255),
--   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
--   updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
-- );
-- CREATE INDEX idx_google_tokens_user_email ON google_calendar_tokens(user_email);
EOF

echo "📝 Copiando configuración..."

# Config files
cp "$SOURCE_DIR/.env.example" "$DEST_DIR/" 2>/dev/null || echo "⚠️  .env.example no encontrado"

# Crear package.json mínimo
cat > "$DEST_DIR/package.json" << 'EOF'
{
  "name": "psychology-system-quotes",
  "version": "1.0.0",
  "description": "Sistema de gestión de citas con Google Calendar y Resend",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "dependencies": {
    "googleapis": "^169.0.0",
    "resend": "^6.6.0",
    "jose": "^6.1.3"
  },
  "keywords": [
    "appointments",
    "google-calendar",
    "resend",
    "automation"
  ],
  "author": "",
  "license": "MIT"
}
EOF

echo "📚 Copiando documentación..."

# Documentation
cp "$SOURCE_DIR/SETUP.md" "$DEST_DIR/" 2>/dev/null || echo "⚠️  SETUP.md no encontrado"
cp "$SOURCE_DIR/INTEGRATION_GUIDE.md" "$DEST_DIR/" 2>/dev/null || echo "⚠️  INTEGRATION_GUIDE.md no encontrado"
cp "$SOURCE_DIR/APPOINTMENT_AUTOMATION.md" "$DEST_DIR/" 2>/dev/null || echo "⚠️  APPOINTMENT_AUTOMATION.md no encontrado"

# Copiar ejemplos
echo "📝 Copiando ejemplos..."
cp "$SOURCE_DIR/examples/basic-integration.ts" "$DEST_DIR/examples/" 2>/dev/null || echo "⚠️  basic-integration.ts no encontrado"
cp "$SOURCE_DIR/examples/db-adaptation-example.ts" "$DEST_DIR/examples/" 2>/dev/null || echo "⚠️  db-adaptation-example.ts no encontrado"

# Crear README específico para el sistema de citas
cat > "$DEST_DIR/README.md" << 'EOF'
# Psychology System Quotes

Sistema reutilizable de gestión de citas con integración de Google Calendar y envío automático de emails.

## 🚀 Características

- ✅ Creación automática de eventos en Google Calendar
- ✅ Google Meet para sesiones online
- ✅ Envío automático de emails con Resend
- ✅ Templates personalizables
- ✅ Idempotencia (no duplica eventos)
- ✅ Timezone correcto

## 📦 Instalación

```bash
npm install googleapis resend jose
```

## 🔧 Configuración

1. Copia `.env.example` a `.env.local`
2. Completa las variables de entorno
3. Ejecuta los scripts SQL en tu base de datos
4. Configura Google Calendar OAuth
5. Configura Resend

Ver [SETUP.md](./SETUP.md) para detalles.

## 📚 Uso

```typescript
import { automateAppointmentConfirmation } from './lib/appointment-automation'

// Cuando una cita se confirma
const result = await automateAppointmentConfirmation(appointmentId)

if (result.success) {
  console.log('Evento creado:', result.calendarEventId)
  console.log('Meet link:', result.meetLink)
}
```

Ver [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) para más ejemplos.

## 📁 Estructura

```
lib/
  ├── appointment-automation.ts  # Función central
  ├── googleCalendar.ts          # Google Calendar API
  ├── email-service.ts           # Resend emails
  └── google-calendar-auth.ts    # OAuth handling

app/api/
  └── google-calendar/           # OAuth endpoints

sql/
  └── *.sql                      # Scripts de BD
```

## 📝 Licencia

MIT
EOF

# Crear .gitignore
cat > "$DEST_DIR/.gitignore" << 'EOF'
node_modules/
.env.local
.env
*.log
.DS_Store
EOF

echo ""
echo "✅ Sistema de citas extraído a: $DEST_DIR"
echo ""
echo "📋 Próximos pasos:"
echo "   1. cd $DEST_DIR"
echo "   2. npm install"
echo "   3. Revisa y adapta los archivos según tu proyecto"
echo "   4. git init"
echo "   5. git add ."
echo "   6. git commit -m 'Initial commit: Sistema de citas'"
echo "   7. Crea repo en GitHub: psychology-system-quotes"
echo "   8. git push"

