# 📥 Archivo .env Listo para Importar

## ✅ Archivo Creado: `env-vercel.txt`

He creado el archivo `env-vercel.txt` con todas las variables de entorno listas para importar en Vercel.

---

## 🚀 Cómo Importar

### Opción 1: Script Automático (Recomendado)

```bash
# Ejecutar el script de importación
./importar-env-vercel.sh
```

El script:
- ✅ Verifica que Vercel CLI esté instalado
- ✅ Te pide iniciar sesión si es necesario
- ✅ Importa todas las variables automáticamente

**Nota:** Para `SMTP_PASS`, el script usará el placeholder. Debes actualizarlo manualmente en Vercel con tu contraseña real.

---

### Opción 2: Importar Manualmente en Vercel

1. **Abre el archivo:** `env-vercel.txt`
2. **Ve a Vercel:** https://vercel.com/dashboard
3. **Selecciona tu proyecto:** `v0-psychology-website`
4. **Ve a:** Settings > Environment Variables
5. **Para cada variable:**
   - Haz clic en "Add New"
   - Copia el nombre (ej: `GOOGLE_CLIENT_ID`)
   - Copia el valor (ej: `953104782981-abonftgsg034mckjn8qbnv4jqm1imosa.apps.googleusercontent.com`)
   - Selecciona: Production y Preview
   - Guarda

---

## 📋 Variables en el Archivo

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=ps.msanluis@gmail.com
SMTP_PASS=REEMPLAZA_CON_TU_CONTRASEÑA_DE_APLICACIÓN_DE_GOOGLE

GOOGLE_CLIENT_ID=953104782981-abonftgsg034mckjn8qbnv4jqm1imosa.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

NEXT_PUBLIC_BASE_URL=https://v0-psychology-website-ryco.vercel.app
GOOGLE_REDIRECT_URI=https://v0-psychology-website-ryco.vercel.app/api/google-calendar/callback
```

---

## ⚠️ IMPORTANTE: SMTP_PASS

**Debes reemplazar** `REEMPLAZA_CON_TU_CONTRASEÑA_DE_APLICACIÓN_DE_GOOGLE` con tu contraseña de aplicación real de Google (16 caracteres).

**NO es tu contraseña de Gmail**, es una contraseña de aplicación especial.

Si no la tienes:
1. Ve a: https://myaccount.google.com/apppasswords
2. O sigue las instrucciones en `CONFIGURACION_TUNEL.md`

---

## ✅ Después de Importar

1. **Actualiza SMTP_PASS** en Vercel con tu contraseña real
2. **Ve a Deployments**
3. **Haz clic en los 3 puntos** (⋯) del último despliegue
4. **Selecciona "Redeploy"**
5. **Espera 2-5 minutos**

---

## 🔍 Verificar que Funciona

1. Ve a: https://v0-psychology-website-ryco.vercel.app/dashboard/login
2. Inicia sesión: `ps.msanluis@gmail.com` / `misakki12_`
3. Ve a "Configuración del Sitio"
4. Haz clic en "Vincular con Google"
5. Deberías ser redirigido sin errores

---

## 📁 Archivos Relacionados

- `env-vercel.txt` - Archivo con todas las variables
- `importar-env-vercel.sh` - Script para importar automáticamente
- `COMO_IMPORTAR_ENV.md` - Guía detallada
- `VARIABLES_VERCEL.md` - Documentación completa

