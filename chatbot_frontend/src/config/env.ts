const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api'

export const config = {
  apiBaseUrl,
  chatEndpoint: `${apiBaseUrl}/chat`,
  requestTimeoutMs: 30_000,
} as const
