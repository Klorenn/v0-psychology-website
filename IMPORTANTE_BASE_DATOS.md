# ⚠️ IMPORTANTE: Base de Datos Requerida

## 🚨 ACCIÓN REQUERIDA

**Los archivos JSON NO FUNCIONAN en producción en Vercel.**

Vercel usa un sistema de archivos **efímero** que se resetea en cada deploy.

**NECESITAS configurar Vercel Postgres para que los datos persistan.**

---

## ✅ SOLUCIÓN: Vercel Postgres (5 minutos)

### Paso 1: Crear Base de Datos

1. Ve a [Vercel Dashboard](https://vercel.com/)
2. Selecciona tu proyecto: `v0-psychology-website-ryco`
3. Click en la pestaña **"Storage"**
4. Click en **"Create Database"**
5. Selecciona **"Postgres"**
6. Configuración:
   - **Name:** `psychology-db`
   - **Region:** `us-east-1` (o la más cercana)
7. Click **"Create"**

### Paso 2: Esperar (30 segundos)

Vercel automáticamente:
- ✅ Crea la base de datos
- ✅ Configura las variables de entorno
- ✅ Las conecta a tu proyecto

### Paso 3: Redesplegar

1. Ve a **"Deployments"**
2. Click en los 3 puntos del último deployment
3. Click **"Redeploy"**

### Paso 4: Inicializar Tablas

Después de que termine el deploy:

1. Ve a: `https://v0-psychology-website-ryco.vercel.app/api/db/init`
2. Deberías ver: `{"success":true,"message":"Base de datos inicializada correctamente"}`
3. ✅ ¡Listo!

---

## 🎯 Qué Hace la Base de Datos

### Almacena:
- ✅ **Citas:** Todas las reservas y su estado
- ✅ **Configuración:** Contenido del sitio, temas, textos
- ✅ **Tokens de Google Calendar:** Para mantener la conexión

### Beneficios:
- ✅ **Persistencia:** Los datos NO se pierden entre deploys
- ✅ **Velocidad:** Consultas rápidas con índices
- ✅ **Escalabilidad:** Soporta múltiples usuarios simultáneos
- ✅ **Seguridad:** Conexiones encriptadas
- ✅ **Backups:** Automáticos por Vercel

---

## 💡 Cómo Funciona

### En Desarrollo (localhost):
```
✅ Usa archivos JSON en data/
✅ No necesitas Postgres en local
✅ Fácil de debuggear
```

### En Producción (Vercel):
```
✅ Usa Vercel Postgres automáticamente
✅ Detecta la variable POSTGRES_URL
✅ Cambia automáticamente sin configuración
```

**El código detecta automáticamente dónde está corriendo y usa el método correcto.**

---

## 📊 Variables de Entorno

Vercel agrega automáticamente estas variables cuando creas la DB:

```env
POSTGRES_URL=postgres://...
POSTGRES_PRISMA_URL=postgres://...
POSTGRES_URL_NO_SSL=postgres://...
POSTGRES_URL_NON_POOLING=postgres://...
POSTGRES_USER=...
POSTGRES_HOST=...
POSTGRES_PASSWORD=...
POSTGRES_DATABASE=...
```

**No necesitas configurarlas manualmente** - Vercel lo hace automáticamente.

---

## ✅ Verificación

### Antes de configurar la DB:
```
❌ Las citas se pierden al redesplegar
❌ La configuración se resetea
❌ Google Calendar se desconecta
```

### Después de configurar la DB:
```
✅ Las citas persisten
✅ La configuración se mantiene
✅ Google Calendar permanece conectado
✅ Todo funciona correctamente
```

---

## 🧪 Testing

### Probar que funciona:

1. **Hacer una reserva:**
   ```
   - Ir al sitio
   - Hacer una reserva de prueba
   - Verificar que aparezca en el dashboard
   ```

2. **Redesplegar:**
   ```
   - Vercel → Deployments → Redeploy
   - Esperar a que termine
   ```

3. **Verificar:**
   ```
   - Ir al dashboard
   - ✅ La reserva debería seguir ahí
   - ✅ La configuración debería estar igual
   ```

---

## 💰 Costo

### Plan Hobby (Gratis):
- ✅ 256 MB de almacenamiento
- ✅ 60 horas de compute/mes
- ✅ **Suficiente para tu uso**

**No necesitas pagar nada para empezar.**

---

## 🚀 Resumen de Pasos

```
1. Vercel → Storage → Create Database → Postgres
2. Name: psychology-db
3. Region: us-east-1
4. Create
5. Esperar 30 segundos
6. Deployments → Redeploy
7. Visitar: /api/db/init
8. ✅ ¡Listo!
```

**Tiempo total: 5 minutos**

---

## 🎉 Resultado

Con Vercel Postgres configurado:
- ✅ Los datos persisten
- ✅ Las citas no se pierden
- ✅ La configuración se mantiene
- ✅ Google Calendar funciona
- ✅ Todo profesional y confiable

---

## 📝 Nota Final

**SIN la base de datos:**
- ❌ Los datos se pierden en cada deploy
- ❌ Las citas desaparecen
- ❌ La configuración se resetea

**CON la base de datos:**
- ✅ Todo funciona perfectamente
- ✅ Datos persistentes
- ✅ Producción lista

---

**✨ Configura Vercel Postgres ahora para que todo funcione ✨**

**Es GRATIS y toma solo 5 minutos.**

