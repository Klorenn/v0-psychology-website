# Psychology website

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/kl0rens-projects/v0-psychology-website)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/nb7l7rbY5zi)

## Overview

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

## Deployment

Your project is live at:

**[https://vercel.com/kl0rens-projects/v0-psychology-website](https://vercel.com/kl0rens-projects/v0-psychology-website)**

## Build your app

Continue building your app on:

**[https://v0.app/chat/nb7l7rbY5zi](https://v0.app/chat/nb7l7rbY5zi)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## Configuración

### Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
# Configuración SMTP para envío de correos
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=ps.msanluis@gmail.com
SMTP_PASS=tu_contraseña_de_aplicación_de_google

# URL base de tu aplicación (para los enlaces de aceptar/rechazar en los correos)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
# En producción, usa tu dominio:
# NEXT_PUBLIC_BASE_URL=https://tu-dominio.com

# Configuración opcional de Google Calendar (si quieres sincronizar disponibilidad)
GOOGLE_CALENDAR_API_KEY=
GOOGLE_CALENDAR_ID=
```

### Configurar Gmail SMTP

Para que el sistema de correos funcione con Gmail:

1. Activa la verificación en 2 pasos en tu cuenta de Google:
   - Ve a https://myaccount.google.com/security
   - Activa "Verificación en 2 pasos"

2. Crea una contraseña de aplicación:
   - Ve a https://myaccount.google.com/apppasswords
   - Selecciona "Correo" y "Otro (nombre personalizado)"
   - Ingresa "Sistema de Citas" como nombre
   - Copia la contraseña generada y úsala en `SMTP_PASS`

### Persistencia de Datos

Las citas se guardan automáticamente en `data/appointments.json`. Este archivo se crea automáticamente cuando se guarda la primera cita.

**Nota:** El directorio `data/` está en `.gitignore` y no se subirá al repositorio.

## Características

- Sistema de reserva de citas con calendario
- Envío automático de correos a ps.msanluis@gmail.com
- Confirmación/rechazo de citas desde el correo electrónico
- Dashboard para gestión de citas
- Persistencia de datos en archivo JSON
- Soporte para citas online y presenciales
- Precios diferenciados ($20.000 online, $27.000 presencial)