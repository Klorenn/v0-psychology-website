// Usar DB en producción, JSON en desarrollo
const useDatabase = process.env.POSTGRES_URL !== undefined

let siteConfigPersistence: any

if (useDatabase) {
  // En producción (Vercel con Postgres/Supabase)
  siteConfigPersistence = require("./site-config-persistence-db").siteConfigPersistence
} else {
  // En desarrollo (archivos JSON)
  siteConfigPersistence = require("./site-config-persistence-json").siteConfigPersistence
}

export { siteConfigPersistence }

