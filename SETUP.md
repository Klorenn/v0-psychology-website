# Guía de Configuración - Sistema de Citas

Esta guía te ayudará a configurar el sistema de citas para que funcione completamente.

## Requisitos Previos

- Node.js 18+ instalado
- Cuenta de Gmail para envío de correos
- Acceso a la terminal/consola

## Paso 1: Instalar Dependencias

```bash
npm install
```

## Paso 2: Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Configuración SMTP (OBLIGATORIO para producción)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=ps.msanluis@gmail.com
SMTP_PASS=tu_contraseña_de_aplicación_aquí

# URL base (OBLIGATORIO)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
# En producción, cambia a tu dominio real:
# NEXT_PUBLIC_BASE_URL=https://tu-dominio.com
```

## Paso 3: Obtener Contraseña de Aplicación de Gmail

### Para Desarrollo Local:

Si no configuras `SMTP_PASS`, el sistema funcionará en modo desarrollo y mostrará los correos en la consola del servidor.

### Para Producción:

1. Ve a https://myaccount.google.com/security
2. Asegúrate de tener activada la "Verificación en 2 pasos"
3. Ve a https://myaccount.google.com/apppasswords
4. Selecciona:
   - Aplicación: "Correo"
   - Dispositivo: "Otro (nombre personalizado)" → escribe "Sistema de Citas"
5. Copia la contraseña de 16 caracteres generada
6. Pégala en `SMTP_PASS` en tu archivo `.env.local`

## Paso 4: Ejecutar el Proyecto

### Desarrollo:

```bash
npm run dev
```

El sitio estará disponible en http://localhost:3000

### Producción:

```bash
npm run build
npm start
```

## Paso 5: Verificar Funcionamiento

1. Abre http://localhost:3000
2. Completa el formulario de reserva
3. Verifica que:
   - Se guarde la cita en `data/appointments.json`
   - Se envíe el correo a ps.msanluis@gmail.com (o se muestre en consola si SMTP no está configurado)
   - El correo contenga botones para aceptar/rechazar

## Estructura de Datos

Las citas se guardan en `data/appointments.json` con el siguiente formato:

```json
[
  {
    "id": "uuid",
    "patientName": "Nombre del paciente",
    "patientEmail": "correo@ejemplo.com",
    "patientPhone": "+56 9 1234 5678",
    "appointmentType": "online" | "presencial",
    "date": "2024-01-15T00:00:00.000Z",
    "time": "10:00",
    "status": "pending" | "confirmed" | "cancelled" | "expired",
    "createdAt": "2024-01-10T12:00:00.000Z",
    "expiresAt": "2024-01-10T12:05:00.000Z"
  }
]
```

## Solución de Problemas

### Los correos no se envían

- Verifica que `SMTP_PASS` esté configurado correctamente
- Asegúrate de usar una contraseña de aplicación, no tu contraseña normal de Gmail
- Revisa los logs del servidor para ver errores específicos

### Las citas no persisten después de reiniciar

- Verifica que el directorio `data/` tenga permisos de escritura
- Revisa que `data/appointments.json` se esté creando correctamente

### Los enlaces de aceptar/rechazar no funcionan

- Verifica que `NEXT_PUBLIC_BASE_URL` esté configurado correctamente
- En producción, debe apuntar a tu dominio real (ej: https://tu-dominio.com)

### Error "Cita no encontrada" al hacer clic en el correo

- Esto puede pasar si el servidor se reinició y la cita no estaba guardada
- Con la persistencia implementada, esto no debería pasar
- Verifica que `data/appointments.json` contenga la cita

## Dashboard

Accede al dashboard en `/dashboard/login` para gestionar las citas.

Las credenciales por defecto están en `lib/auth-store.ts`.

## Soporte

Si tienes problemas, revisa:
1. Los logs del servidor (consola donde ejecutas `npm run dev`)
2. El archivo `data/appointments.json` para ver si las citas se están guardando
3. La configuración de variables de entorno

