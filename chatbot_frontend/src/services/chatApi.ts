import { config } from '../config/env'
import type { ChatRequest } from '../types/chat'
import { ApiError, NetworkError } from '../utils/errors'
import { parseSseStream } from './streamParser'

export interface SendMessageOptions {
  request: ChatRequest
  onChunk: (delta: string) => void
  signal?: AbortSignal
}

async function parseErrorResponse(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string; error?: string }
    return body.message ?? body.error ?? `Request failed (${response.status})`
  } catch {
    return `Request failed (${response.status})`
  }
}

export async function sendChatMessage({
  request,
  onChunk,
  signal,
}: SendMessageOptions): Promise<void> {
  let response: Response

  try {
    response = await fetch(config.chatEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
      body: JSON.stringify(request),
      signal,
    })
  } catch (error) {
    if (signal?.aborted) return
    throw new NetworkError()
  }

  if (!response.ok) {
    throw new ApiError(await parseErrorResponse(response), response.status)
  }

  if (!response.body) {
    throw new NetworkError('Server returned an empty response body.')
  }

  await parseSseStream(
    response.body,
    {
      onChunk,
      onError: (message) => {
        throw new ApiError(message, response.status)
      },
    },
    signal,
  )
}
