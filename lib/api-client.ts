import { authStore } from "./auth-store"

/**
 * Helper para hacer requests autenticados a las APIs
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = authStore.getToken()
  
  const headers = new Headers(options.headers)
  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }
  
  return fetch(url, {
    ...options,
    headers,
  })
}

