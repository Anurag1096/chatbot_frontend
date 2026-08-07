import { describe, expect, it, vi } from 'vitest'
import { parseSseStream } from './streamParser'

function createSseStream(parts: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder()

  return new ReadableStream({
    start(controller) {
      for (const part of parts) {
        controller.enqueue(encoder.encode(part))
      }
      controller.close()
    },
  })
}

describe('parseSseStream', () => {
  it('parses delta chunks from SSE lines', async () => {
    const onChunk = vi.fn()
    const onDone = vi.fn()

    await parseSseStream(
      createSseStream([
        'data: {"delta":"Hello"}\n\n',
        'data: {"delta":" world"}\n\n',
        'data: {"done":true}\n\n',
      ]),
      { onChunk, onDone },
    )

    expect(onChunk).toHaveBeenCalledTimes(2)
    expect(onChunk).toHaveBeenNthCalledWith(1, 'Hello')
    expect(onChunk).toHaveBeenNthCalledWith(2, ' world')
    expect(onDone).toHaveBeenCalledOnce()
  })

  it('handles chunks split across reads', async () => {
    const onChunk = vi.fn()

    await parseSseStream(
      createSseStream(['data: {"delta":"Hel', 'lo"}\n\n']),
      { onChunk },
    )

    expect(onChunk).toHaveBeenCalledOnce()
    expect(onChunk).toHaveBeenCalledWith('Hello')
  })

  it('stops on error payloads', async () => {
    const onError = vi.fn()
    const onChunk = vi.fn()

    await parseSseStream(
      createSseStream(['data: {"error":"Something failed"}\n\n']),
      { onChunk, onError },
    )

    expect(onError).toHaveBeenCalledWith('Something failed')
    expect(onChunk).not.toHaveBeenCalled()
  })

  it('calls onDone when stream ends without explicit done flag', async () => {
    const onChunk = vi.fn()
    const onDone = vi.fn()

    await parseSseStream(createSseStream(['data: {"delta":"Hi"}\n\n']), {
      onChunk,
      onDone,
    })

    expect(onChunk).toHaveBeenCalledWith('Hi')
    expect(onDone).toHaveBeenCalledOnce()
  })

  it('does not throw when signal is aborted', async () => {
    const controller = new AbortController()
    controller.abort()

    await expect(
      parseSseStream(
        createSseStream(['data: {"delta":"Hi"}\n\n']),
        { onChunk: vi.fn() },
        controller.signal,
      ),
    ).resolves.toBeUndefined()
  })
})
