# Integración con Transbank Webpay Plus

Esta aplicación está integrada con Transbank Webpay Plus como método de pago para las citas.

## Configuración

### Variables de Entorno

Agregar las siguientes variables de entorno en Vercel o en tu archivo `.env.local`:

```env
# Transbank Webpay Plus Credentials
TRANSBANK_COMMERCE_CODE=tu_commerce_code_aqui
TRANSBANK_API_KEY=tu_api_key_aqui
TRANSBANK_ENVIRONMENT=integration  # o "production" para producción
```

### Obtener Credenciales

#### Ambiente de Integración (Pruebas)

Para pruebas, puedes usar las credenciales de integración de Transbank:

- **Commerce Code:** `597055555532`
- **API Key:** `579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C`

#### Ambiente de Producción

1. **Contratar Webpay Plus:**
   - Si ya eres cliente: [Portal de Clientes Transbank](https://www.transbank.cl/)
   - Si no eres cliente: [Contratar Webpay Plus](https://publico.transbank.cl/productos-y-servicios/soluciones-para-ventas-internet/webpay-plus)

2. **Obtener credenciales:**
   - Una vez contratado, recibirás un **Código de Comercio** único
   - Para obtener tu API Key, contacta a Transbank

3. **Validar integración:**
   - Realiza pruebas en ambiente de integración
   - Completa el documento de evidencia de integración
   - Envíalo a `soporte@transbank.cl`
   - Una vez validado, recibirás las credenciales de producción

### Tarjetas de Prueba

Para probar en ambiente de integración:

- **Tarjeta aprobada:** VISA `4051 8856 0044 6623`
  - CVV: `123`
  - Fecha de vencimiento: Cualquier fecha futura
- **RUT autenticación bancaria:** `11.111.111-1`
  - Clave: `123`

## Endpoints

### Crear Transacción
- **POST** `/api/transbank/create-transaction`
- Crea una transacción en Webpay Plus y devuelve el token y URL para redirigir al checkout

**Body:**
```json
{
  "appointmentId": "uuid",
  "amount": 20000,
  "description": "Sesión Online",
  "patientEmail": "paciente@ejemplo.com",
  "patientName": "Juan Pérez"
}
```

**Response:**
```json
{
  "success": true,
  "token": "token_ws",
  "url": "https://webpay3gint.transbank.cl/webpayserver/initTransaction",
  "buyOrder": "buy_order",
  "sessionId": "session_id"
}
```

### Confirmar Transacción
- **GET** `/api/transbank/confirm-transaction?token_ws=xxx&appointment_id=xxx`
- Confirma una transacción después de que el usuario completa el pago en Webpay
- Redirige automáticamente a `/booking/success` o `/booking/failure`

## Flujo de Pago

1. **Usuario selecciona Webpay Plus** como método de pago
2. **Sistema crea la cita** con estado `pending`
3. **Sistema crea la transacción** en Transbank
4. **Usuario es redirigido** a Webpay Plus para completar el pago
5. **Transbank redirige de vuelta** con el `token_ws`
6. **Sistema confirma la transacción** y verifica el estado
7. **Si el pago es aprobado:**
   - La cita se confirma automáticamente
   - Se crea un evento en Google Calendar (si está conectado)
   - Se envía un email de confirmación al paciente

## Estados de Transacción

Transbank devuelve los siguientes estados:

- `AUTHORIZED` = Pagado y aprobado
- `FAILED` = Pago rechazado
- `REVERSED` = Transacción reversada
- `NULLIFIED` = Transacción anulada

Cuando el pago es exitoso (`AUTHORIZED`):
- La cita se confirma automáticamente
- Se crea un evento en Google Calendar (si está conectado)
- Se envía un email de confirmación al paciente

## Documentación

- [Documentación oficial de Transbank](https://www.transbankdevelopers.cl/documentacion/webpay-plus)
- [Referencia API](https://www.transbankdevelopers.cl/referencia)
- [Portal de Desarrolladores](https://www.transbankdevelopers.cl/)

## Notas Importantes

1. **Ambientes separados:** Transbank tiene ambientes separados para integración y producción
2. **Validación requerida:** Para usar producción, debes validar tu integración con Transbank
3. **Tarjetas de prueba:** Solo funcionan en ambiente de integración
4. **Timeout:** Las transacciones tienen un tiempo límite para completarse

