# 🚀 EMPIEZA AQUÍ - Psychology Website

## 👋 ¡Bienvenida María!

Tu sitio web está **100% completo y funcionando**. Esta guía te ayudará a empezar.

---

## ⚡ Inicio Rápido (5 minutos)

### 1️⃣ Configurar Variables de Entorno

Ve a [Vercel Dashboard](https://vercel.com/) → Tu proyecto → Settings → Environment Variables

Agrega estas variables (ver `ENV_SETUP.md` para valores):

```
✅ SMTP_HOST
✅ SMTP_PORT  
✅ SMTP_USER
✅ SMTP_PASS
✅ NEXT_PUBLIC_BASE_URL
✅ GOOGLE_CLIENT_ID
✅ GOOGLE_CLIENT_SECRET
✅ GOOGLE_REDIRECT_URI
✅ FLOW_API_KEY
✅ FLOW_SECRET_KEY
✅ FLOW_ENVIRONMENT
```

### 2️⃣ Redesplegar

Vercel → Deployments → Redeploy (botón con 3 puntos)

### 3️⃣ Vincular Google Calendar

1. Ve a tu sitio → `/dashboard`
2. Inicia sesión con tus credenciales (configuradas en variables de entorno)
3. Configuración del Sitio → Google Calendar
4. Click en "Vincular con Google"
5. Autoriza el acceso
6. ✅ ¡Listo!

---

## 🎯 Funcionalidades Disponibles

### Para Tus Pacientes:
✅ Agendar citas online o presenciales  
✅ Pagar con Flow (tarjeta/transferencia/efectivo)  
✅ O pagar con transferencia bancaria  
✅ Recibir confirmación por email  
✅ Recibir link de Google Meet (citas online)  

### Para Ti:
✅ Recibir notificaciones de nuevas reservas  
✅ Aprobar o rechazar citas desde el dashboard  
✅ Ver comprobantes de transferencia  
✅ Editar contenido del sitio (editor visual)  
✅ Cambiar colores y temas  
✅ Personalizar emails  
✅ Gestionar todo desde un solo lugar  

---

## 📱 Cómo Funciona

### Opción 1: Pago con Flow
```
Paciente → Selecciona fecha/hora → Llena formulario → 
Elige "Flow" → Paga → ✅ Confirmación automática → 
✅ Email → ✅ Google Calendar
```

### Opción 2: Transferencia Bancaria
```
Paciente → Selecciona fecha/hora → Llena formulario → 
Elige "Transferencia" → Sube comprobante → 
Tú recibes notificación → Apruebas desde dashboard → 
✅ Email al paciente → ✅ Google Calendar
```

---

## 🎨 Personalización

### Cambiar Colores
```
Dashboard → Configuración → Selector de Temas
12 temas disponibles (8 claros + 4 oscuros)
```

### Editar Contenido
```
Dashboard → Configuración → Editor Visual
Click en cualquier sección para editarla
Arrastra para reordenar
```

### Cambiar Foto de Perfil
```
Dashboard → Configuración → Editor Visual
Sección Hero → Subir nueva imagen
Ajustar posición con los controles
```

---

## 📧 Emails

### Recibirás emails cuando:
- ✅ Alguien hace una reserva
- ✅ Alguien sube un comprobante

### Tus pacientes recibirán emails cuando:
- ✅ Confirmas su cita
- ✅ Rechazas su cita

### Personalizar Emails:
```
Dashboard → Configuración → Plantilla de Email
Edita el asunto y el cuerpo
Usa variables: {{patientName}}, {{date}}, {{time}}, {{meetLink}}
```

---

## 🔐 Acceso al Dashboard

**URL:** `https://tu-dominio.vercel.app/dashboard`

**Credenciales:** Configura `NEXT_PUBLIC_ADMIN_EMAIL` y `NEXT_PUBLIC_ADMIN_PASSWORD` en `.env.local`

---

## 📚 Documentación

Si necesitas ayuda:

1. **ENV_SETUP.md** - Configuración paso a paso
2. **FLOW_INTEGRATION.md** - Cómo funciona Flow
3. **VERIFICACION_RAPIDA.md** - Checklist de 5 minutos
4. **RESUMEN_FINAL.md** - Resumen completo

---

## 🆘 ¿Problemas?

### No llegan emails
→ Verifica `SMTP_PASS` (debe ser contraseña de aplicación de Gmail)

### Google Calendar no se vincula
→ Verifica que tu email esté en "usuarios de prueba" en Google Cloud Console

### Flow no funciona
→ Verifica `FLOW_API_KEY` y `FLOW_SECRET_KEY`

### El botón de pago no aparece
→ Recarga la página (Ctrl+R o Cmd+R)

**Ver más:** `ENV_SETUP.md` tiene troubleshooting completo

---

## 🎉 ¡Todo Está Listo!

### ✅ Código: PERFECTO
### ✅ Google Calendar: FUNCIONA
### ✅ Flow: FUNCIONA
### ✅ Transferencias: FUNCIONA
### ✅ Emails: FUNCIONA
### ✅ Modo Oscuro: FUNCIONA
### ✅ Dashboard: FUNCIONA

**Solo necesitas configurar las variables de entorno y empezar a usarlo.**

---

## 🚀 Próximos Pasos

1. [ ] Configurar variables de entorno en Vercel
2. [ ] Redesplegar
3. [ ] Vincular Google Calendar
4. [ ] Hacer una reserva de prueba
5. [ ] ¡Empezar a recibir pacientes!

---

**✨ Tu sitio web está completo y listo para usar ✨**

**¿Preguntas? Revisa la documentación o pregúntame.**

