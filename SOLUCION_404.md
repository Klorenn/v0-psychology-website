# 🔧 Solución: Error 404 DEPLOYMENT_NOT_FOUND

## ❌ Problema

```
404: NOT_FOUND
Code: DEPLOYMENT_NOT_FOUND
```

Esto significa que el deployment que estás intentando acceder no existe o aún no está listo.

---

## ✅ Solución Paso a Paso

### Paso 1: Verificar Deployment en Vercel

1. Ve a: https://vercel.com/dashboard
2. Click en tu proyecto: `v0-psychology-website`
3. Ve a la pestaña **"Deployments"**
4. Busca el deployment más reciente (debería tener un check verde ✅)
5. **Copia la URL del deployment** (ejemplo: `https://v0-psychology-website-xxxxx.vercel.app`)

### Paso 2: Usar la URL Correcta

**NO uses:** `https://v0-psychology-website-ryco.vercel.app` (puede estar desactualizado)

**USA la URL del deployment actual** que copiaste en el Paso 1.

### Paso 3: Inicializar Base de Datos

Una vez que tengas la URL correcta, visita:

```
https://TU-URL-DEL-DEPLOYMENT.vercel.app/api/db/init
```

**Ejemplo:**
```
https://v0-psychology-website-abc123.vercel.app/api/db/init
```

### Paso 4: Verificar Respuesta

Deberías ver:

```json
{
  "success": true,
  "message": "Base de datos inicializada correctamente",
  "tables": [
    "appointments (con campos: receipt_data, receipt_filename, receipt_mimetype)",
    "site_config",
    "google_calendar_tokens"
  ]
}
```

---

## 🔍 Si Sigue Dando 404

### Opción 1: Esperar al Redeploy

1. Ve a Vercel → Deployments
2. Si ves "Building..." o "Queued", **espera 1-2 minutos**
3. Cuando veas el check verde ✅, intenta de nuevo

### Opción 2: Forzar Nuevo Deployment

1. Ve a Vercel → Tu proyecto → Settings → Git
2. Click en "Redeploy" o haz un pequeño cambio y push a GitHub
3. Espera a que termine el deployment
4. Usa la nueva URL

### Opción 3: Usar la URL de Producción

Si tienes un dominio personalizado configurado:

```
https://tu-dominio.com/api/db/init
```

---

## 🎯 Después de Inicializar

Una vez que `/api/db/init` funcione:

1. ✅ Las tablas estarán creadas
2. ✅ El upload de comprobantes funcionará
3. ✅ Los datos se guardarán en Neon
4. ✅ Todo estará listo para usar

---

## 📝 Nota Importante

**El endpoint `/api/db/init` solo necesita ejecutarse UNA VEZ** después de conectar Neon a Vercel.

No necesitas ejecutarlo cada vez que haces un deployment, solo la primera vez.

