# Guía de Despliegue en Vercel

## 🚀 Ventajas de Vercel

- ✅ URL fija y estable (no cambia como localtunnel)
- ✅ HTTPS automático
- ✅ Sin necesidad de túneles
- ✅ Despliegue automático desde Git
- ✅ Variables de entorno fáciles de configurar
- ✅ Perfecto para Next.js

---

## 📋 Paso 1: Preparar el proyecto

### 1.1. Verificar que el proyecto esté listo

El proyecto ya está listo para Vercel. Next.js funciona perfectamente en Vercel sin configuración adicional.

### 1.2. Asegurar que todo esté en Git

```bash
# Verificar el estado
git status

# Si hay cambios sin commitear, haz commit
git add .
git commit -m "Preparar para despliegue en Vercel"
```

---

## 📋 Paso 2: Crear cuenta en Vercel

1. Ve a: https://vercel.com
2. Haz clic en **"Sign Up"**
3. Inicia sesión con GitHub, GitLab o Bitbucket (recomendado) o crea una cuenta con email

---

## 📋 Paso 3: Desplegar el proyecto

### Opción A: Desde la interfaz web de Vercel (Recomendado)

1. Ve a: https://vercel.com/new
2. Conecta tu repositorio de Git (GitHub, GitLab, Bitbucket)
3. Selecciona el proyecto `v0-psychology-website`
4. Vercel detectará automáticamente que es un proyecto Next.js
5. **NO hagas clic en "Deploy" todavía** - primero configura las variables de entorno

### Opción B: Desde la CLI de Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Iniciar sesión
vercel login

# Desplegar
vercel

# Seguir las instrucciones en pantalla
```

---

## 📋 Paso 4: Configurar Variables de Entorno en Vercel

**IMPORTANTE:** Configura estas variables ANTES de hacer el primer despliegue.

### 4.1. Variables de SMTP (para correos)

En el dashboard de Vercel, ve a tu proyecto > Settings > Environment Variables:

```
SMTP_HOST = smtp.gmail.com
SMTP_PORT = 587
SMTP_USER = ps.msanluis@gmail.com
SMTP_PASS = tu_contraseña_de_aplicación_de_google
```

### 4.2. Variables de Google Calendar OAuth

```
GOOGLE_CLIENT_ID = 953104782981-abonftgsg034mckjn8qbnv4jqm1imosa.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET = 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
```

**NOTA:** `GOOGLE_REDIRECT_URI` se configurará después de obtener la URL de Vercel.

### 4.3. Variable de URL Base

**IMPORTANTE:** Esta variable se configurará DESPUÉS del primer despliegue, cuando tengas la URL de Vercel.

```
NEXT_PUBLIC_BASE_URL = https://tu-proyecto.vercel.app
```

---

## 📋 Paso 5: Hacer el primer despliegue

1. En Vercel, haz clic en **"Deploy"**
2. Espera a que termine el despliegue (2-5 minutos)
3. Vercel te dará una URL como: `https://v0-psychology-website.vercel.app` o similar
4. **Copia esta URL** - la necesitarás para los siguientes pasos

---

## 📋 Paso 6: Configurar la URL de redireccionamiento

### 6.1. Actualizar NEXT_PUBLIC_BASE_URL en Vercel

1. Ve a tu proyecto en Vercel > Settings > Environment Variables
2. Agrega o actualiza:
   ```
   NEXT_PUBLIC_BASE_URL = https://tu-url-de-vercel.vercel.app
   ```
   (Reemplaza con tu URL real de Vercel)

3. Agrega también:
   ```
   GOOGLE_REDIRECT_URI = https://tu-url-de-vercel.vercel.app/api/google-calendar/callback
   ```

4. Haz clic en **"Save"**
5. Ve a **"Deployments"** y haz clic en los 3 puntos del último despliegue > **"Redeploy"** para aplicar los cambios

### 6.2. Actualizar Google Cloud Console

1. Ve a: https://console.cloud.google.com/apis/credentials
2. Abre tu OAuth 2.0 Client ID
3. En "Authorized redirect URIs", agrega:
   ```
   https://tu-url-de-vercel.vercel.app/api/google-calendar/callback
   ```
   (Reemplaza con tu URL real de Vercel)

4. Haz clic en **"Save"**

---

## 📋 Paso 7: Verificar el despliegue

1. Ve a tu URL de Vercel: `https://tu-url-de-vercel.vercel.app`
2. Verifica que la página cargue correctamente
3. Prueba el dashboard: `https://tu-url-de-vercel.vercel.app/dashboard/login`
4. Prueba vincular Google Calendar desde el dashboard

---

## 🔄 Actualizaciones futuras

Cada vez que hagas `git push` a tu repositorio, Vercel desplegará automáticamente los cambios.

Para desplegar manualmente:
```bash
vercel --prod
```

---

## 📝 Resumen de Variables de Entorno en Vercel

Configura estas variables en Vercel (Settings > Environment Variables):

```
# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=ps.msanluis@gmail.com
SMTP_PASS=tu_contraseña_de_aplicación

# Google Calendar OAuth
GOOGLE_CLIENT_ID=953104782981-abonftgsg034mckjn8qbnv4jqm1imosa.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

# URL Base (configurar después del primer despliegue)
NEXT_PUBLIC_BASE_URL=https://tu-url-de-vercel.vercel.app
GOOGLE_REDIRECT_URI=https://tu-url-de-vercel.vercel.app/api/google-calendar/callback
```

---

## ⚠️ Notas importantes

1. **Archivos en `/data`**: Vercel tiene un sistema de archivos de solo lectura en producción. Los archivos en `/data` (como `appointments.json`, `site-config.json`) se perderán en cada despliegue. Considera usar una base de datos (Vercel Postgres, MongoDB, etc.) para producción.

2. **Receipts**: Los comprobantes subidos se guardan en `/data/receipts`. En producción, considera usar un servicio de almacenamiento como Vercel Blob, AWS S3, o Cloudinary.

3. **Google Calendar Tokens**: Los tokens se guardan en `/data/google-calendar-tokens.json`. En producción, considera usar Vercel KV o una base de datos.

---

## 🆘 Solución de problemas

### Error: "Environment variable not found"
- Verifica que todas las variables estén configuradas en Vercel
- Asegúrate de hacer "Redeploy" después de agregar variables

### Error: "redirect_uri_mismatch"
- Verifica que `GOOGLE_REDIRECT_URI` en Vercel coincida exactamente con la URL en Google Cloud Console
- Asegúrate de usar `https://` (no `http://`)

### Los archivos no se guardan
- Vercel tiene sistema de archivos de solo lectura. Considera usar una base de datos o servicio de almacenamiento.

---

## ✅ Listo

Una vez configurado, tendrás:
- ✅ URL fija y estable
- ✅ HTTPS automático
- ✅ Sin necesidad de túneles
- ✅ Despliegue automático desde Git
- ✅ Google Calendar funcionando correctamente

