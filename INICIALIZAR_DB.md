# 🗄️ Inicializar Base de Datos - Guía Rápida

## ✅ Paso a Paso

### 1. Obtener la URL de tu Deployment

Si estás usando el deployment "8v7", la URL debería ser algo como:

```
https://v0-psychology-website-8v7.vercel.app
```

O si es un deployment específico:

```
https://v0-psychology-website-git-main-tu-usuario.vercel.app
```

### 2. Visitar el Endpoint

Abre en tu navegador:

```
https://TU-URL-DEL-DEPLOYMENT/api/db/init
```

**Ejemplo:**
```
https://v0-psychology-website-8v7.vercel.app/api/db/init
```

### 3. Verificar Respuesta

Deberías ver algo como:

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

## 🔍 Si No Funciona

### Opción 1: Verificar en Vercel Dashboard

1. Ve a: https://vercel.com/dashboard
2. Click en tu proyecto
3. Ve a "Deployments"
4. Busca el deployment "8v7" o el más reciente
5. Click en el deployment
6. Verás la URL exacta en la parte superior

### Opción 2: Usar la URL de Producción

Si tienes un dominio personalizado configurado:

```
https://tu-dominio.com/api/db/init
```

### Opción 3: Verificar Logs

1. En Vercel Dashboard → Tu proyecto → Deployments
2. Click en el deployment "8v7"
3. Ve a "Functions" → `/api/db/init`
4. Revisa los logs para ver si hay errores

---

## ✅ Después de Inicializar

Una vez que veas el mensaje de éxito:

1. ✅ Las tablas estarán creadas en Neon
2. ✅ El upload de comprobantes funcionará
3. ✅ Los datos se guardarán correctamente
4. ✅ Puedes hacer reservas sin problemas

---

## 📝 Nota

**Solo necesitas ejecutar esto UNA VEZ** después de conectar Neon a Vercel.

No es necesario ejecutarlo en cada deployment.

