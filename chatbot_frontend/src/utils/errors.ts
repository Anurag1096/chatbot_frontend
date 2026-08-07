export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export class NetworkError extends Error {
  constructor(message = 'Unable to reach the server. Check your connection.') {
    super(message)
    this.name = 'NetworkError'
  }
}

export class StreamError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'StreamError'
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message
  if (error instanceof NetworkError) return error.message
  if (error instanceof StreamError) return error.message
  if (error instanceof DOMException && error.name === 'AbortError') return ''
  if (error instanceof Error) return error.message
  return 'Something went wrong. Please try again.'
}

export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}
