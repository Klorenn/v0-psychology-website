# 🗄️ Configuración de Base de Datos - Vercel Postgres

## ⚠️ IMPORTANTE: Base de Datos Requerida

Los archivos JSON **NO FUNCIONAN** en producción en Vercel porque el sistema de archivos es efímero.

**NECESITAS configurar Vercel Postgres** para que todo funcione correctamente.

---

## 🚀 Configuración Rápida (5 minutos)

### Paso 1: Crear Base de Datos en Vercel

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/)
2. Click en la pestaña **"Storage"**
3. Click en **"Create Database"**
4. Selecciona **"Postgres"**
5. Nombre: `psychology-db` (o el que prefieras)
6. Region: Selecciona la más cercana a Chile (ej: `us-east-1` o `sfo1`)
7. Click **"Create"**

### Paso 2: Conectar a tu Proyecto

1. En la página de la base de datos, ve a la pestaña **".env.local"**
2. Vercel automáticamente agregará estas variables a tu proyecto:
   ```
   POSTGRES_URL
   POSTGRES_PRISMA_URL
   POSTGRES_URL_NO_SSL
   POSTGRES_URL_NON_POOLING
   POSTGRES_USER
   POSTGRES_HOST
   POSTGRES_PASSWORD
   POSTGRES_DATABASE
   ```
3. **No necesitas hacer nada más** - Vercel las configura automáticamente

### Paso 3: Inicializar Tablas

Después de crear la base de datos y redesplegar:

1. Ve a: `https://tu-dominio.vercel.app/api/db/init`
2. Deberías ver: `{"success":true,"message":"Base de datos inicializada correctamente"}`
3. ✅ Las tablas se han creado automáticamente

---

## 📊 Tablas Creadas

### `appointments` - Citas
```sql
id TEXT PRIMARY KEY
patient_name TEXT NOT NULL
patient_email TEXT NOT NULL
patient_phone TEXT NOT NULL
consultation_reason TEXT
appointment_type TEXT NOT NULL
date TIMESTAMP NOT NULL
time TEXT NOT NULL
status TEXT NOT NULL
created_at TIMESTAMP NOT NULL
expires_at TIMESTAMP NOT NULL
receipt_url TEXT
payment_method TEXT
payment_id TEXT
```

### `site_config` - Configuración del Sitio
```sql
id INTEGER PRIMARY KEY DEFAULT 1
config JSONB NOT NULL
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

### `google_calendar_tokens` - Tokens de Google Calendar
```sql
id INTEGER PRIMARY KEY DEFAULT 1
access_token TEXT NOT NULL
refresh_token TEXT NOT NULL
expiry_date BIGINT NOT NULL
calendar_id TEXT
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

---

## 🔄 Migración Automática

El código está preparado para funcionar tanto con archivos JSON (desarrollo) como con Postgres (producción).

**En desarrollo (localhost):**
- Usa archivos JSON en `data/`

**En producción (Vercel):**
- Usa Vercel Postgres automáticamente

---

## ✅ Verificación

### Paso 1: Crear la base de datos en Vercel
```
✅ Vercel → Storage → Create Database → Postgres
```

### Paso 2: Esperar unos segundos
```
✅ Vercel configura las variables automáticamente
```

### Paso 3: Redesplegar
```
✅ Vercel → Deployments → Redeploy
```

### Paso 4: Inicializar tablas
```
✅ Visitar: https://tu-dominio.vercel.app/api/db/init
```

### Paso 5: Probar
```
✅ Hacer una reserva de prueba
✅ Verificar que aparezca en el dashboard
✅ La reserva debería persistir entre deploys
```

---

## 🎯 Beneficios de Vercel Postgres

✅ **Persistencia:** Los datos no se pierden entre deploys  
✅ **Escalabilidad:** Soporta múltiples instancias  
✅ **Velocidad:** Consultas rápidas con índices  
✅ **Seguridad:** Conexiones encriptadas  
✅ **Backups:** Automáticos  
✅ **Gratis:** Plan hobby incluido  

---

## 💰 Costos

### Plan Hobby (Gratis):
- ✅ 256 MB de almacenamiento
- ✅ 60 horas de compute por mes
- ✅ Suficiente para tu uso

### Plan Pro (si creces):
- 512 MB de almacenamiento
- 100 horas de compute
- $20/mes

**Para empezar, el plan gratis es más que suficiente.**

---

## 🔍 Troubleshooting

### Error: "Cannot connect to database"
**Solución:**
1. Verifica que la base de datos esté creada en Vercel
2. Verifica que las variables POSTGRES_* estén configuradas
3. Redesplegar el proyecto

### Error: "Table does not exist"
**Solución:**
1. Visita: `https://tu-dominio.vercel.app/api/db/init`
2. Esto creará las tablas automáticamente

### Error: "Connection pooling"
**Solución:**
- Usa la variable `POSTGRES_URL` que ya está configurada
- No necesitas configurar nada adicional

---

## 📝 Notas Importantes

1. **Desarrollo local:** Seguirá usando archivos JSON (no necesitas Postgres en local)
2. **Producción (Vercel):** Usa Postgres automáticamente
3. **Migración:** Los datos de archivos JSON NO se migran automáticamente
4. **Backups:** Vercel hace backups automáticos
5. **Costo:** Plan hobby es gratis y suficiente

---

## ✅ Checklist

- [ ] Crear base de datos en Vercel (Storage → Create Database)
- [ ] Esperar a que se configuren las variables automáticamente
- [ ] Redesplegar el proyecto
- [ ] Visitar `/api/db/init` para crear las tablas
- [ ] Hacer una reserva de prueba
- [ ] Verificar que aparezca en el dashboard
- [ ] ✅ ¡Listo!

---

## 🎉 Resultado

Con Vercel Postgres:
- ✅ Los datos persisten entre deploys
- ✅ Las citas no se pierden
- ✅ La configuración se mantiene
- ✅ Google Calendar tokens seguros
- ✅ Escalable y rápido

---

**✨ Configuración simple, resultado profesional ✨**

