# 📦 Psychology System Quotes

Sistema completo de gestión de citas con integración de Google Calendar y envío automático de emails.

## 🎯 ¿Qué incluye?

- ✅ Dashboard administrativo completo
- ✅ Integración con Google Calendar (OAuth 2.0)
- ✅ Creación automática de eventos y Google Meet
- ✅ Envío automático de emails con Resend
- ✅ Sistema de reseñas/testimonios
- ✅ Editor visual de página
- ✅ Temas personalizables
- ✅ Autenticación JWT segura

## 🚀 Inicio Rápido

1. **Clonar y configurar:**
   ```bash
   git clone <este-repo>
   cd psychology-system-quotes
   npm install
   cp .env.example .env.local
   # Edita .env.local con tus credenciales
   ```

2. **Configurar base de datos:**
   - Ejecuta los scripts SQL en Supabase (ver SETUP.md)

3. **Iniciar:**
   ```bash
   npm run dev
   ```

Ver [QUICK_START.md](./QUICK_START.md) para más detalles.

## 📚 Documentación

- **[QUICK_START.md](./QUICK_START.md)** - Inicio rápido (5 min)
- **[SETUP.md](./SETUP.md)** - Guía completa de configuración
- **[INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)** - Cómo reutilizar en otro proyecto
- **[README.md](./README.md)** - Documentación general

## 🔑 Solo necesitas configurar:

1. Variables de entorno (`.env.local`)
2. Base de datos (scripts SQL)
3. Google Calendar OAuth
4. Resend API Key

¡Y listo! Todo lo demás está implementado.

## 📦 Archivos Clave para Reutilización

Si solo quieres la parte de automatización de citas:

- `lib/appointment-automation.ts` - Función central
- `lib/googleCalendar.ts` - Integración Google Calendar
- `lib/email-service.ts` - Servicio de emails
- `lib/db.ts` - Funciones de BD (adaptar a tu BD)

Ver [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) para detalles.

## 🛠️ Stack Tecnológico

- **Next.js 16** - Framework React
- **TypeScript** - Tipado estático
- **Supabase** - Base de datos PostgreSQL
- **Google Calendar API** - Gestión de eventos
- **Resend** - Envío de emails
- **JWT** - Autenticación
- **Tailwind CSS** - Estilos

## 📝 Licencia

[Especificar licencia]

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o pull request.

---

**Hecho con ❤️ para facilitar la gestión de citas**
