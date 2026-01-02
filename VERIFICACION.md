# Verificación del Sistema

## ✅ Cambios Realizados

### 1. Copyright Actualizado
- ✅ Footer actualizado: "© 2026 María Chavez · Todos los derechos reservados"

## 🔧 Configuración Requerida

### Variables de Entorno Necesarias

Crea un archivo `.env.local` en la raíz del proyecto con:

```env
# ⚠️ OBLIGATORIO para que funcionen los correos
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=ps.msanluis@gmail.com
SMTP_PASS=tu_contraseña_de_aplicación_de_google

# ⚠️ OBLIGATORIO para los enlaces de aceptar/rechazar
NEXT_PUBLIC_BASE_URL=http://localhost:3000
# En producción cambia a: https://tu-dominio.com

# ⚠️ OPCIONAL - Para sincronizar con Google Calendar
GOOGLE_CALENDAR_API_KEY=tu_api_key
GOOGLE_CALENDAR_ID=tu_calendar_id@gmail.com
```

## 📧 Configuración de Correos (OBLIGATORIO)

### Paso 1: Activar Verificación en 2 Pasos
1. Ve a https://myaccount.google.com/security
2. Activa "Verificación en 2 pasos"

### Paso 2: Crear Contraseña de Aplicación
1. Ve a https://myaccount.google.com/apppasswords
2. Selecciona "Correo" y "Otro (nombre personalizado)"
3. Ingresa "Sistema de Citas" como nombre
4. Copia la contraseña generada (16 caracteres)
5. Pégala en `SMTP_PASS` en tu `.env.local`

### Verificación de Correos
- ✅ Correos se envían a: `ps.msanluis@gmail.com`
- ✅ Correos incluyen: nombre, email, teléfono, tipo de cita, fecha, hora
- ✅ Correos incluyen enlaces para aceptar/rechazar
- ✅ Si `SMTP_PASS` no está configurado, los correos se muestran en consola (modo desarrollo)

## 📅 Configuración de Calendario (OPCIONAL)

### Si NO configuras Google Calendar:
- ✅ El sistema funciona con horarios por defecto: 09:00, 10:00, 11:00, 12:00, 15:00, 16:00, 17:00, 18:00
- ✅ Los pacientes pueden reservar en estos horarios

### Si SÍ configuras Google Calendar:
1. Ve a https://console.cloud.google.com
2. Crea un proyecto o selecciona uno existente
3. Habilita "Google Calendar API"
4. Crea una API Key (para acceso público)
5. Asegúrate de que tu calendario tenga la información de disponibilidad pública
6. Agrega `GOOGLE_CALENDAR_API_KEY` y `GOOGLE_CALENDAR_ID` a tu `.env.local`

### Verificación de Calendario
- ✅ Si Google Calendar NO está configurado: usa horarios por defecto
- ✅ Si Google Calendar SÍ está configurado: sincroniza con tu calendario y oculta horarios ocupados

## 🧪 Cómo Verificar que Todo Funciona

### 1. Verificar Correos
```bash
# Inicia el servidor
npm run dev

# Haz una reserva de prueba desde la página
# Verifica:
# - Si SMTP_PASS está configurado: deberías recibir un correo en ps.msanluis@gmail.com
# - Si SMTP_PASS NO está configurado: verás el correo en la consola del servidor
```

### 2. Verificar Calendario
```bash
# Abre la página de reserva
# Selecciona una fecha
# Verifica:
# - Si Google Calendar NO está configurado: verás todos los horarios disponibles
# - Si Google Calendar SÍ está configurado: solo verás horarios disponibles (no ocupados)
```

### 3. Verificar Dashboard
```bash
# Ve a /dashboard/login
# Inicia sesión con: ps.msanluis@gmail.com / misakki12_
# Verifica:
# - Puedes ver las citas pendientes
# - Puedes aceptar/rechazar citas
# - Puedes editar la configuración del sitio
```

## 📝 Checklist de Configuración

- [ ] Archivo `.env.local` creado
- [ ] `SMTP_HOST` configurado (smtp.gmail.com)
- [ ] `SMTP_PORT` configurado (587)
- [ ] `SMTP_USER` configurado (ps.msanluis@gmail.com)
- [ ] `SMTP_PASS` configurado (contraseña de aplicación de Google)
- [ ] `NEXT_PUBLIC_BASE_URL` configurado (http://localhost:3000 o tu dominio)
- [ ] `GOOGLE_CALENDAR_API_KEY` configurado (opcional)
- [ ] `GOOGLE_CALENDAR_ID` configurado (opcional)

## ⚠️ Notas Importantes

1. **Sin SMTP_PASS**: El sistema funcionará pero los correos solo se mostrarán en la consola (modo desarrollo)
2. **Sin Google Calendar**: El sistema funcionará con horarios por defecto
3. **En Producción**: Asegúrate de configurar todas las variables de entorno en tu plataforma de hosting (Vercel, etc.)

## 🚀 Despliegue en Producción

Cuando despliegues en producción (Vercel, etc.):

1. Agrega todas las variables de entorno en la configuración de tu plataforma
2. Cambia `NEXT_PUBLIC_BASE_URL` a tu dominio real (ej: https://tu-dominio.com)
3. Reinicia el servidor para que tome las nuevas variables

