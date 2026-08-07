import type { StreamChunk } from '../types/chat'
import { StreamError } from '../utils/errors'

export interface StreamHandlers {
  onChunk: (delta: string) => void
  onError?: (message: string) => void
  onDone?: () => void
}

function parseSseData(raw: string): StreamChunk | null {
  const trimmed = raw.trim()
  if (!trimmed || trimmed === '[DONE]') {
    return { done: true }
  }

  try {
    return JSON.parse(trimmed) as StreamChunk
  } catch {
    return { delta: trimmed }
  }
}

function handleChunk(
  chunk: StreamChunk,
  handlers: StreamHandlers,
): 'continue' | 'stop' {
  if (chunk.error) {
    handlers.onError?.(chunk.error)
    return 'stop'
  }

  if (chunk.done) {
    handlers.onDone?.()
    return 'stop'
  }

  if (chunk.delta) {
    handlers.onChunk(chunk.delta)
  }

  return 'continue'
}

/**
 * Reads an SSE response body and invokes handlers for each parsed chunk.
 */
export async function parseSseStream(
  body: ReadableStream<Uint8Array>,
  handlers: StreamHandlers,
  signal?: AbortSignal,
): Promise<void> {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  const abort = () => {
    reader.cancel().catch(() => undefined)
  }

  signal?.addEventListener('abort', abort, { once: true })

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        if (!line.startsWith('data:')) continue

        const raw = line.slice(5).trim()
        const result = handleChunk(parseSseData(raw) ?? { done: true }, handlers)
        if (result === 'stop') return
      }
    }

    if (buffer.trim()) {
      const trailing = buffer
        .split('\n')
        .filter((line) => line.startsWith('data:'))
        .map((line) => line.slice(5).trim())

      for (const raw of trailing) {
        const result = handleChunk(parseSseData(raw) ?? { done: true }, handlers)
        if (result === 'stop') return
      }
    }

    handlers.onDone?.()
  } catch (error) {
    if (signal?.aborted) return
    throw new StreamError(
      error instanceof Error ? error.message : 'Stream interrupted unexpectedly.',
    )
  } finally {
    signal?.removeEventListener('abort', abort)
    reader.releaseLock()
  }
}
