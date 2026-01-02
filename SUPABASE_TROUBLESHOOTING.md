# 🔧 Solución de Problemas de Supabase

## ❌ Error: "fetch failed" o "Error connecting to database"

Este error generalmente significa que **el proyecto de Supabase está pausado**.

### ✅ Solución Rápida:

1. **Ve al Dashboard de Supabase:**
   - https://supabase.com/dashboard
   - Inicia sesión con tu cuenta

2. **Verifica el estado del proyecto:**
   - Busca el proyecto: `qihjcxitqtbivvxvezjg`
   - Si dice **"PAUSED"** o **"Paused"**, haz clic en él

3. **Reactivar el proyecto:**
   - Haz clic en **"Restore Project"** o **"Restart"**
   - Espera 1-2 minutos a que se reactive

4. **Verificar que esté activo:**
   - El proyecto debería mostrar estado **"Active"** o **"Running"**

### 🔍 Verificar Estado del Proyecto:

Puedes verificar el estado visitando:
```
https://supabase.com/dashboard/project/qihjcxitqtbivvxvezjg
```

### ⚠️ Por qué se pausa:

- **Plan Gratuito:** Los proyectos inactivos se pausan automáticamente después de 7 días de inactividad
- **Ahorro de recursos:** Supabase pausa proyectos para ahorrar recursos

### ✅ Después de Reactivar:

1. Espera 1-2 minutos
2. Prueba: `https://definitivo-website.vercel.app/api/db/test-connection`
3. Deberías ver conexiones exitosas
4. Luego prueba crear una cita: `https://definitivo-website.vercel.app/api/test/create-simple`

---

## 🔄 Alternativa: Usar Connection Pooler

Si el problema persiste, asegúrate de usar el **Connection Pooler** de Supabase:

1. Ve a Supabase Dashboard → Settings → Database
2. Busca **"Connection Pooling"**
3. Usa la URL del pooler (la que tiene `:6543` en el puerto)
4. Esta URL ya está en `POSTGRES_URL`

---

## 📋 Checklist de Verificación:

- [ ] Proyecto de Supabase está activo (no pausado)
- [ ] Variables `POSTGRES_URL` configuradas en Vercel
- [ ] Variables tienen los valores correctos
- [ ] Proyecto de Supabase no está en mantenimiento
- [ ] Red de Vercel puede acceder a Supabase

---

## 🆘 Si Nada Funciona:

1. **Reinicia el proyecto de Supabase:**
   - Dashboard → Settings → Database → Restart Database

2. **Verifica los logs de Vercel:**
   - Vercel → Deployments → Ver logs
   - Busca errores específicos

3. **Contacta soporte de Supabase:**
   - Si el proyecto está activo pero sigue fallando

