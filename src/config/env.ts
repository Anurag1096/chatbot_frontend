const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL
const apiBaseUrl =
  typeof configuredBaseUrl === 'string' && configuredBaseUrl.trim().length > 0
    ? configuredBaseUrl
    : '/api'

export const config = {
  apiBaseUrl,
  chatEndpoint: `${apiBaseUrl}/chat`,
  requestTimeoutMs: 30_000,
} as const
