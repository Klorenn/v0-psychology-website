# 🔍 Debug: Error al Subir Comprobante

## ✅ Mejoras Implementadas

1. **Mejor manejo de errores** - Ahora muestra el error específico del servidor
2. **Validación de tamaño** - Limita archivos muy grandes (10MB base64)
3. **Logging mejorado** - Errores detallados en consola del servidor
4. **Validación de respuesta** - Verifica que se reciban todos los datos

## 🔍 Pasos para Debug

### 1. Verificar Base de Datos

Asegúrate de que las tablas estén actualizadas con los nuevos campos:

```bash
# Visita en tu navegador:
https://tu-dominio.vercel.app/api/db/init
```

Esto creará/actualizará las tablas con los campos:
- `receipt_data TEXT`
- `receipt_filename TEXT`
- `receipt_mimetype TEXT`

### 2. Verificar Error Específico

Abre la **Consola del Navegador** (F12) y busca:
- Errores en rojo
- Mensajes que digan "Error del servidor:" o "Error parseando respuesta:"

### 3. Verificar Logs de Vercel

1. Ve a tu proyecto en Vercel
2. Click en "Deployments"
3. Click en el último deployment
4. Click en "Functions" → `/api/appointments/upload-receipt`
5. Revisa los logs para ver el error exacto

### 4. Errores Comunes

#### Error: "value too long"
**Solución:** El archivo es demasiado grande. Usa un archivo más pequeño (máximo 2MB original = ~2.7MB base64)

#### Error: "No se recibieron los datos del comprobante"
**Solución:** El servidor no está retornando los datos. Revisa los logs de Vercel.

#### Error: "Error al procesar el archivo"
**Solución:** Revisa los logs de Vercel para ver el error específico.

### 5. Probar con Archivo Pequeño

Intenta subir un archivo muy pequeño (ej: 100KB) para verificar que el sistema funciona.

## 📝 Información Necesaria

Si el error persiste, necesito:

1. **Mensaje de error exacto** que aparece en la pantalla
2. **Error en consola del navegador** (F12 → Console)
3. **Logs de Vercel** del endpoint `/api/appointments/upload-receipt`
4. **Tamaño del archivo** que estás intentando subir
5. **Tipo de archivo** (JPG, PNG, PDF)

