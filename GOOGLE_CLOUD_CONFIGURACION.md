# Configuración de Google Cloud Console - Instrucciones Exactas

## 📋 URL que debes poner en Google Cloud Console

Copia y pega EXACTAMENTE esta URL en "URIs de redireccionamiento autorizados":

```
https://green-hornets-shout.loca.lt/api/google-calendar/callback
```

---

## 🔧 Pasos detallados en Google Cloud Console

### 1. Accede a Google Cloud Console
- Ve a: https://console.cloud.google.com/apis/credentials
- Inicia sesión con tu cuenta de Google (`ps.msanluis@gmail.com`)

### 2. Selecciona tu proyecto
- Si tienes múltiples proyectos, selecciona el que creaste para esta aplicación
- Si no tienes un proyecto, crea uno nuevo

### 3. Abre tu OAuth 2.0 Client ID
- En la lista de "OAuth 2.0 Client IDs", haz clic en tu cliente
- Si no tienes uno, crea uno nuevo:
  - Haz clic en "Create Credentials" > "OAuth client ID"
  - Tipo: **Web application**
  - Nombre: "Sistema de Citas - Google Calendar"

### 4. Agrega la URL de redireccionamiento
- En la sección **"Authorized redirect URIs"** (URIs de redireccionamiento autorizados)
- Haz clic en **"+ ADD URI"** o el botón de agregar
- Pega EXACTAMENTE esta URL:
  ```
  https://green-hornets-shout.loca.lt/api/google-calendar/callback
  ```
- **IMPORTANTE:** 
  - Debe ser EXACTAMENTE igual (sin espacios, sin barra final)
  - Debe usar `https://` (no `http://`)
  - La ruta debe ser exactamente `/api/google-calendar/callback`

### 5. Guarda los cambios
- Haz clic en **"SAVE"** o **"Guardar"** en la parte inferior
- Espera unos segundos a que se guarden los cambios

---

## ✅ Verificación

Después de guardar, verifica que:

1. La URL aparece en la lista de "Authorized redirect URIs"
2. No hay espacios extra o caracteres raros
3. El protocolo es `https://` (no `http://`)
4. No hay barra final (`/`) al final de la URL

---

## 🔄 Si el túnel cambia de URL

Si reinicias el túnel y obtienes una nueva URL (ej: `https://nueva-url.loca.lt`):

1. **Actualiza `.env.local`:**
   ```bash
   # La nueva URL se actualiza automáticamente si usas el script mantener-tunel.sh
   ```

2. **Agrega la nueva URL en Google Cloud Console:**
   - Ve a tu OAuth 2.0 Client ID
   - Agrega la nueva URL a "Authorized redirect URIs"
   - Puedes tener múltiples URLs, así que agrega la nueva sin eliminar la anterior

---

## 📝 Resumen de URLs actuales

**URL del túnel:**
```
https://green-hornets-shout.loca.lt
```

**URL de redireccionamiento (para Google Cloud Console):**
```
https://green-hornets-shout.loca.lt/api/google-calendar/callback
```

**URL del dashboard:**
```
https://green-hornets-shout.loca.lt/dashboard
```

---

## ⚠️ Nota importante

La URL del túnel puede cambiar cada vez que lo reinicias. Si necesitas una URL fija:
- Usa ngrok con un plan de pago
- O configura tu dominio en producción

Por ahora, cada vez que cambies el túnel, deberás actualizar Google Cloud Console con la nueva URL.

