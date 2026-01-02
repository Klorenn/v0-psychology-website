# 📥 Cómo Importar Variables de Entorno en Vercel

## 🚀 Método Rápido: Copiar y Pegar desde .env.example

### Paso 1: Abrir el archivo .env.example

Abre el archivo `.env.example` en este proyecto. Contiene todas las variables que necesitas.

### Paso 2: Ir a Vercel

1. Ve a: **https://vercel.com/dashboard**
2. Selecciona tu proyecto: **`v0-psychology-website`**
3. Ve a: **Settings** > **Environment Variables**

### Paso 3: Agregar Variables (Una por Una)

Para cada variable en `.env.example`:

1. Haz clic en **"Add New"** o **"Agregar nueva"**
2. Copia el **nombre** de la variable (ej: `GOOGLE_CLIENT_ID`)
3. Pega en el campo **"Key"** (Clave)
4. Copia el **valor** de la variable (ej: `953104782981-abonftgsg034mckjn8qbnv4jqm1imosa.apps.googleusercontent.com`)
5. Pega en el campo **"Value"** (Valor)
6. Selecciona los entornos:
   - ✅ **Production**
   - ✅ **Preview**
   - ⚪ **Development** (opcional)
7. Haz clic en **"Save"**
8. Repite para cada variable

---

## 📋 Lista de Variables a Agregar

### 1. SMTP (Correo Electrónico)

```
SMTP_HOST = smtp.gmail.com
SMTP_PORT = 587
SMTP_USER = ps.msanluis@gmail.com
SMTP_PASS = [TU_CONTRASEÑA_DE_APLICACIÓN_DE_GOOGLE]
```

**⚠️ IMPORTANTE:** `SMTP_PASS` debe ser la **contraseña de aplicación** de Google (16 caracteres), NO tu contraseña de Gmail.

### 2. Google Calendar

```
GOOGLE_CLIENT_ID = 953104782981-abonftgsg034mckjn8qbnv4jqm1imosa.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET = 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
```

### 3. URLs

```
NEXT_PUBLIC_BASE_URL = https://v0-psychology-website-ryco.vercel.app
GOOGLE_REDIRECT_URI = https://v0-psychology-website-ryco.vercel.app/api/google-calendar/callback
```

---

## 🔄 Después de Agregar Todas las Variables

### Paso 4: Redesplegar

1. Ve a la pestaña **"Deployments"**
2. Haz clic en los **3 puntos** (⋯) del último despliegue
3. Selecciona **"Redeploy"**
4. Espera a que termine (2-5 minutos)

---

## ✅ Verificación

Después de redesplegar:

1. Ve a: **https://v0-psychology-website-ryco.vercel.app/dashboard/login**
2. Inicia sesión con: `ps.msanluis@gmail.com` / `misakki12_`
3. Ve a la pestaña **"Configuración del Sitio"**
4. Haz clic en **"Vincular con Google"**
5. Deberías ser redirigido a Google sin errores

---

## 🆘 Solución de Problemas

### Error: "Google Client ID no configurado"

**Solución:**
- Verifica que `GOOGLE_CLIENT_ID` esté configurada correctamente
- Asegúrate de haber hecho **Redeploy** después de agregar las variables

### Error: "SMTP authentication failed"

**Solución:**
- Verifica que `SMTP_PASS` sea la **contraseña de aplicación** de Google
- NO uses tu contraseña de Gmail normal
- Si no tienes una contraseña de aplicación, créala siguiendo las instrucciones en `CONFIGURACION_TUNEL.md`

---

## 📝 Notas

- **NO** subas el archivo `.env.example` a producción con valores reales
- El archivo `.env.example` está en `.gitignore` para proteger tus credenciales
- Vercel encripta todas las variables de entorno automáticamente

