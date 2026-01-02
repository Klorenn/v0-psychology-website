# Integración con Flow

Esta aplicación está integrada con Flow como método de pago para las citas.

## Configuración

### Variables de Entorno

Agregar las siguientes variables de entorno en Vercel o en tu archivo `.env.local`:

```env
# Flow API Credentials
FLOW_API_KEY=tu_api_key_aqui
FLOW_SECRET_KEY=tu_secret_key_aqui
FLOW_ENVIRONMENT=sandbox  # o "production" para producción
```

### Obtener Credenciales

1. **Sandbox (Pruebas)**: Regístrate en [sandbox.flow.cl](https://sandbox.flow.cl/)
2. **Producción**: Regístrate en [flow.cl](https://www.flow.cl/)

Una vez registrado:
- Ve a "Mis Datos" > "Integraciones"
- Copia tu **API Key** y **Secret Key**

## Endpoints

### Crear Pago
- **POST** `/api/flow/create-payment`
- Crea un pago en Flow y devuelve la URL para redirigir al checkout

### Webhook
- **POST** `/api/flow/webhook`
- Recibe notificaciones de Flow cuando cambia el estado de un pago
- Configurar esta URL en el panel de Flow: `https://tu-dominio.com/api/flow/webhook`

## Estados de Pago

Flow devuelve los siguientes estados:
- `1` = Pendiente
- `2` = Pagado
- `3` = Pagado y marcado
- `4` = Rechazado
- `5` = Anulado

Cuando el pago es exitoso (estado 2 o 3):
- La cita se confirma automáticamente
- Se crea un evento en Google Calendar (si está conectado)
- Se envía un email de confirmación al paciente

## Documentación

- [Documentación oficial de Flow](https://developers.flow.cl/docs/intro)
- [API Reference](https://developers.flow.cl/docs/api-reference)

