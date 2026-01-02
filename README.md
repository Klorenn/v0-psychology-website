# 🧠 Psychology Website - María Jesús Chavez San Luis

Website profesional para psicóloga clínica con sistema de reservas, pagos integrados y gestión de citas.

## ✨ Características

### 🎯 Sistema de Reservas
- Calendario interactivo con horarios disponibles
- Sincronización con Google Calendar
- Formulario con validación completa
- Selector de país para citas internacionales
- Dos modalidades: Online ($20.000) y Presencial ($27.000)

### 💳 Métodos de Pago
- **Flow:** Tarjeta, transferencia bancaria o efectivo
- **Transferencia Bancaria:** Upload de comprobante con validación

### 📅 Google Calendar
- Integración OAuth2
- Creación automática de eventos
- Google Meet para citas online
- Sincronización de horarios disponibles

### 📧 Notificaciones
- Email automático al recibir reserva
- Confirmación al paciente con detalles completos
- Plantillas personalizables desde el dashboard

### 🎨 Dashboard Administrativo
- Gestión de citas (aprobar/rechazar)
- Editor visual de contenido
- Configuración de Google Calendar
- Selector de temas y colores
- Editor de plantillas de email
- Upload de imágenes

### 🌓 Personalización
- 8 paletas de colores
- 4 temas oscuros especializados
- Modo oscuro optimizado
- Editor visual drag & drop

---

## 🚀 Inicio Rápido

### 1. Instalación
```bash
npm install
```

### 2. Configuración
Crea un archivo `.env.local` con las variables necesarias (ver `ENV_SETUP.md`):

```env
# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=ps.msanluis@gmail.com
SMTP_PASS=tu_contraseña_de_aplicacion

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Google Calendar
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:3000/api/google-calendar/callback

# Flow
FLOW_API_KEY=...
FLOW_SECRET_KEY=...
FLOW_ENVIRONMENT=sandbox
```

### 3. Desarrollo
```bash
npm run dev
# Abre http://localhost:3000
```

### 4. Build
```bash
npm run build
# ✅ Compila sin errores
```

---

## 📚 Documentación

- **[ENV_SETUP.md](ENV_SETUP.md)** - Guía completa de configuración de variables de entorno
- **[FLOW_INTEGRATION.md](FLOW_INTEGRATION.md)** - Documentación de integración con Flow
- **[REVISION_COMPLETA.md](REVISION_COMPLETA.md)** - Revisión completa del código
- **[ESTADO_ACTUAL.md](ESTADO_ACTUAL.md)** - Estado actual del proyecto
- **[VERIFICACION_RAPIDA.md](VERIFICACION_RAPIDA.md)** - Checklist de verificación rápida
- **[RESUMEN_FINAL.md](RESUMEN_FINAL.md)** - Resumen ejecutivo

---

## 🔧 Stack Tecnológico

- **Framework:** Next.js 16 (App Router)
- **UI:** React 19 + Tailwind CSS
- **Estilos:** Tailwind CSS v4 + CSS Variables
- **Temas:** next-themes
- **Emails:** Nodemailer
- **Pagos:** Flow API (Chile)
- **Calendar:** Google Calendar API (OAuth2)
- **Deployment:** Vercel
- **Analytics:** Vercel Analytics

---

## 📂 Estructura del Proyecto

```
v0-psychology-website/
├── app/
│   ├── api/                    # API Routes
│   │   ├── appointments/       # Gestión de citas
│   │   ├── calendar/           # Disponibilidad
│   │   ├── flow/               # Pagos Flow
│   │   ├── google-calendar/    # OAuth Google
│   │   └── site-config/        # Configuración
│   ├── booking/                # Páginas de resultado
│   ├── dashboard/              # Dashboard admin
│   └── page.tsx                # Página principal
├── components/
│   ├── booking-section.tsx     # Sistema de reservas
│   ├── bank-transfer-details.tsx
│   ├── file-upload.tsx
│   ├── google-calendar-settings.tsx
│   ├── theme-selector-extended.tsx
│   ├── visual-page-editor.tsx
│   └── ui/                     # Componentes UI
├── lib/
│   ├── appointments-store.ts   # Store de citas
│   ├── auth-store.ts           # Autenticación
│   ├── flow-auth.ts            # Flow API
│   ├── google-calendar.ts      # Google Calendar API
│   ├── validation.ts           # Validación y sanitización
│   └── site-config.ts          # Configuración del sitio
└── data/                       # Persistencia (JSON)
    ├── appointments.json
    ├── site-config.json
    └── google-calendar-tokens.json
```

---

## 🎯 Funcionalidades Principales

### Para Pacientes:
1. Ver información de la psicóloga
2. Agendar cita online o presencial
3. Pagar con Flow (tarjeta/transferencia/efectivo)
4. O pagar con transferencia bancaria directa
5. Recibir confirmación por email
6. Recibir Google Meet link (citas online)

### Para la Psicóloga:
1. Recibir notificaciones de nuevas reservas
2. Aprobar o rechazar citas desde el dashboard
3. Ver comprobantes de transferencia
4. Gestionar contenido del sitio (editor visual)
5. Configurar Google Calendar
6. Personalizar temas y colores
7. Editar plantillas de email

---

## 🔐 Credenciales del Dashboard

```
Email: ps.msanluis@gmail.com
Password: misakki12_
```

---

## 🌐 URLs Importantes

### Desarrollo:
- **Sitio:** http://localhost:3000
- **Dashboard:** http://localhost:3000/dashboard

### Producción:
- **Sitio:** https://tu-dominio.vercel.app
- **Dashboard:** https://tu-dominio.vercel.app/dashboard

### Webhooks:
- **Flow:** https://tu-dominio.vercel.app/api/flow/webhook
- **Google Calendar Callback:** https://tu-dominio.vercel.app/api/google-calendar/callback

---

## 📞 Contacto

- **Email:** ps.msanluis@gmail.com
- **Instagram:** [@ps.msanluis](https://www.instagram.com/ps.msanluis/)
- **LinkedIn:** [María San Luis](https://www.linkedin.com/in/maria-san-luis-03481b337/)

---

## 📄 Licencia

© 2026 María Chavez · Todos los derechos reservados

---

## 🎉 Estado del Proyecto

**✅ COMPLETAMENTE FUNCIONAL Y LISTO PARA PRODUCCIÓN**

- ✅ Build sin errores
- ✅ Todas las funcionalidades implementadas
- ✅ Seguridad implementada
- ✅ Documentación completa
- ✅ Responsive design
- ✅ Modo oscuro
- ✅ Optimizado para SEO
- ✅ Analytics integrado

**Desarrollado con ❤️ por v0**
