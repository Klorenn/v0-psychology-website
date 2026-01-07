# 📅 Configuración de Google Calendar OAuth

Guía paso a paso para configurar Google Calendar OAuth 2.0 en Google Cloud Console para el dominio `psicoterapiamaria.online`.

---

## 🎯 Paso 1: Acceder a Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Inicia sesión con tu cuenta de Google (la misma que usarás para Google Calendar)
3. Si no tienes un proyecto, crea uno nuevo:
   - Haz clic en el selector de proyectos (arriba)
   - Clic en **"Nuevo proyecto"**
   - Nombre: `Psicoterapia Maria Calendar` (o el que prefieras)
   - Clic en **"Crear"**

---

## 🔧 Paso 2: Habilitar Google Calendar API

1. En el menú lateral, ve a **"APIs y servicios"** → **"Biblioteca"**
2. Busca **"Google Calendar API"**
3. Haz clic en el resultado
4. Clic en **"Habilitar"**
5. Espera a que se habilite (puede tardar unos segundos)

---

## 🔑 Paso 3: Crear Credenciales OAuth 2.0

1. Ve a **"APIs y servicios"** → **"Credenciales"**
2. Haz clic en **"+ CREAR CREDENCIALES"** → **"ID de cliente de OAuth"**
3. Si es la primera vez, te pedirá configurar la pantalla de consentimiento:
   - **Tipo de usuario**: Selecciona **"Externo"** (a menos que tengas Google Workspace)
   - Clic en **"Crear"**
   - **Nombre de la app**: `Psicoterapia Maria`
   - **Email de soporte**: Tu email (ej: `ps.mariasanluis@gmail.com`)
   - **Dominios autorizados**: `psicoterapiamaria.online`
   - Clic en **"Guardar y continuar"**
   - **Scopes**: Por ahora puedes omitir, clic en **"Guardar y continuar"**
   - **Usuarios de prueba**: Agrega tu email de Google (el que usarás para Calendar)
   - Clic en **"Guardar y continuar"**
   - Revisa y clic en **"Volver al panel"**

4. Ahora crea el ID de cliente OAuth:
   - **Tipo de aplicación**: **"Aplicación web"**
   - **Nombre**: `Psicoterapia Maria Calendar`
   - **URI de redirección autorizadas**: Agrega estas URLs:
     ```
     https://psicoterapiamaria.online/api/google-calendar/callback
     ```
     ⚠️ **IMPORTANTE**: 
     - Debe ser exactamente `https://` (no `http://`)
     - No debe terminar con `/`
     - Debe coincidir exactamente con la variable `GOOGLE_REDIRECT_URI`
   
5. Clic en **"Crear"**

---

## 📋 Paso 4: Copiar Credenciales

Después de crear el ID de cliente, verás:
- **ID de cliente**: Algo como `380731710574-xxxxx.apps.googleusercontent.com`
- **Secreto de cliente**: Algo como `GOCSPX-xxxxx`

**Copia estos valores** - los necesitarás para las variables de entorno.

---

## ✅ Paso 5: Configurar Variables de Entorno

Agrega estas variables en **Vercel** (Settings → Environment Variables):

```env
GOOGLE_CLIENT_ID=tu_client_id_aqui
GOOGLE_CLIENT_SECRET=tu_client_secret_aqui
GOOGLE_REDIRECT_URI=https://psicoterapiamaria.online/api/google-calendar/callback
```

**Reemplaza:**
- `tu_client_id_aqui` → Tu ID de cliente de Google
- `tu_client_secret_aqui` → Tu secreto de cliente de Google

---

## 👥 Paso 6: Agregar Usuarios de Prueba (Si está en modo de prueba)

Si tu app OAuth está en **"Prueba"** (modo por defecto):

1. Ve a **"APIs y servicios"** → **"Pantalla de consentimiento de OAuth"**
2. En la sección **"Usuarios de prueba"**, haz clic en **"+ AGREGAR USUARIOS"**
3. Agrega el email de Google que usarás para Google Calendar
4. Clic en **"Agregar"**

**Nota**: En modo de prueba, solo los usuarios agregados pueden autorizar la app. Para producción, necesitarás verificar la app con Google.

---

## 🚀 Paso 7: Verificar Configuración

Antes de probar la conexión, verifica que todo esté configurado correctamente:

1. **Visita el endpoint de prueba:**
   ```
   https://psicoterapiamaria.online/api/google-calendar/test
   ```
   Esto te mostrará la configuración actual y te indicará si hay algo mal.

2. **Verifica las variables de entorno en Vercel:**
   - Ve a Vercel Dashboard → Settings → Environment Variables
   - Confirma que `GOOGLE_REDIRECT_URI` sea exactamente:
     ```
     https://psicoterapiamaria.online/api/google-calendar/callback
     ```

3. **Verifica en Google Cloud Console:**
   - Ve a Credenciales → Tu ID de cliente OAuth
   - Confirma que en "URIs de redirección autorizadas" esté:
     ```
     https://psicoterapiamaria.online/api/google-calendar/callback
     ```
   - **IMPORTANTE**: Debe ser exactamente igual, sin espacios, sin `/` al final

## 🚀 Paso 8: Probar la Conexión

1. **Redesplega tu proyecto en Vercel** después de agregar las variables de entorno
2. Ve a tu dashboard: `https://psicoterapiamaria.online/dashboard`
3. Busca la sección **"Google Calendar"**
4. Haz clic en **"Vincular con Google"**
5. Se abrirá una ventana de Google pidiendo autorización
6. Acepta los permisos (Calendar y email)
7. Deberías ver un mensaje de éxito

---

## 🔍 Verificación de Configuración

### ✅ Checklist

- [ ] Google Calendar API habilitada
- [ ] ID de cliente OAuth creado (tipo "Aplicación web")
- [ ] URI de redirección agregada: `https://psicoterapiamaria.online/api/google-calendar/callback`
- [ ] Variables de entorno configuradas en Vercel:
  - [ ] `GOOGLE_CLIENT_ID`
  - [ ] `GOOGLE_CLIENT_SECRET`
  - [ ] `GOOGLE_REDIRECT_URI`
- [ ] Usuario de prueba agregado (si está en modo de prueba)
- [ ] Proyecto redesplegado en Vercel

---

## 🐛 Solución de Problemas

### Error: "redirect_uri_mismatch"

**Causa**: La URI de redirección no coincide exactamente entre Google Cloud Console y Vercel.

**Solución paso a paso**:

1. **Verifica en Google Cloud Console:**
   - Ve a [Google Cloud Console](https://console.cloud.google.com/)
   - APIs y servicios → Credenciales
   - Haz clic en tu ID de cliente OAuth
   - En "URIs de redirección autorizadas", debe estar EXACTAMENTE:
     ```
     https://psicoterapiamaria.online/api/google-calendar/callback
     ```
   - Si no está, agrégalo y guarda

2. **Verifica en Vercel:**
   - Ve a tu proyecto en Vercel
   - Settings → Environment Variables
   - Busca `GOOGLE_REDIRECT_URI`
   - Debe ser EXACTAMENTE:
     ```
     https://psicoterapiamaria.online/api/google-calendar/callback
     ```
   - Si es diferente, edítala y guarda

3. **Verifica que coincidan:**
   - Copia la URI de Google Cloud Console
   - Copia la URI de Vercel
   - Compara carácter por carácter
   - Deben ser IDÉNTICAS

4. **Reglas importantes:**
   - ✅ Debe empezar con `https://` (nunca `http://`)
   - ✅ No debe terminar con `/`
   - ✅ No debe tener espacios al inicio o final
   - ✅ El dominio debe ser exactamente `psicoterapiamaria.online` (sin `www.`)

5. **Después de corregir:**
   - Guarda los cambios en Google Cloud Console
   - Guarda los cambios en Vercel
   - **Redesplega el proyecto en Vercel** (esto es crucial)
   - Espera 1-2 minutos para que los cambios se propaguen
   - Intenta conectar nuevamente

6. **Verifica con el endpoint de prueba:**
   - Visita: `https://psicoterapiamaria.online/api/google-calendar/test`
   - Revisa que `redirectUri` sea correcto

### Error: "access_denied"

**Causa**: Tu email no está en la lista de usuarios de prueba.

**Solución**:
1. Ve a Google Cloud Console → Pantalla de consentimiento
2. Agrega tu email a "Usuarios de prueba"
3. Intenta nuevamente

### Error: "invalid_client"

**Causa**: El Client ID o Client Secret son incorrectos.

**Solución**:
1. Verifica que copiaste correctamente las credenciales
2. Asegúrate de que las variables de entorno estén configuradas en Vercel
3. Redesplega el proyecto después de agregar las variables

### Error: "Google Calendar no está conectado"

**Causa**: La autorización no se completó correctamente.

**Solución**:
1. Ve a `/api/google-calendar/disconnect` para limpiar tokens anteriores
2. Intenta conectar nuevamente desde el dashboard
3. Revisa los logs en Vercel para ver errores específicos

---

## 📚 Recursos Adicionales

- [Google Cloud Console](https://console.cloud.google.com/)
- [Google Calendar API Documentation](https://developers.google.com/calendar/api)
- [OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)

---

## 🔐 Seguridad

- **NUNCA** compartas tu `GOOGLE_CLIENT_SECRET` públicamente
- Mantén las credenciales solo en variables de entorno de Vercel
- Si expusiste accidentalmente el secreto, revócalo y crea nuevas credenciales en Google Cloud Console

---

## 📝 Notas Importantes

1. **Modo de Prueba**: Por defecto, las apps OAuth están en modo de prueba. Solo los usuarios agregados pueden autorizar. Para producción, necesitarás verificar la app con Google (proceso que puede tardar varios días).

2. **Dominio**: Asegúrate de que `psicoterapiamaria.online` esté correctamente configurado en Vercel y apunte a tu proyecto.

3. **HTTPS**: Google requiere HTTPS para OAuth en producción. Vercel lo proporciona automáticamente.

4. **Refresh Tokens**: El sistema guarda automáticamente los tokens de refresco, así que no necesitarás reautorizar frecuentemente.

---

¿Necesitas ayuda? Revisa los logs en Vercel o contacta al soporte.


