import type { IncomingMessage, ServerResponse } from 'node:http'

interface MockChatBody {
  message?: string
  history?: Array<{ role: string; content: string }>
  conversationId?: string
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function buildMockReply(message: string, history: MockChatBody['history']): string {
  const priorTurns = history?.length ?? 0

  if (/^\/error\b/i.test(message.trim())) {
    throw new Error('Simulated server failure')
  }

  if (/^\/slow\b/i.test(message.trim())) {
    return `This is a slow mock response to: "${message.replace(/^\/slow\s*/i, '')}". Prior turns in context: ${priorTurns}.`
  }

  const trimmed = message.trim()
  const followUp = /^(what about that|tell me more|explain that|and\?)/i.test(trimmed)

  if (followUp && priorTurns > 0) {
    const lastUser = [...(history ?? [])].reverse().find((item) => item.role === 'user')
    return lastUser
      ? `Following up on your earlier question ("${lastUser.content}"): here is a mock expanded answer for "${trimmed}".`
      : `Here is a mock follow-up answer for "${trimmed}".`
  }

  return `Mock assistant reply to "${trimmed}". I received ${priorTurns} prior message(s) as conversation history.`
}

function writeSse(res: ServerResponse, payload: Record<string, unknown>): void {
  res.write(`data: ${JSON.stringify(payload)}\n\n`)
}

export async function handleMockChat(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  const chunks: Buffer[] = []

  for await (const chunk of req) {
    chunks.push(chunk as Buffer)
  }

  let body: MockChatBody = {}

  try {
    body = JSON.parse(Buffer.concat(chunks).toString('utf-8')) as MockChatBody
  } catch {
    res.statusCode = 400
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ message: 'Invalid JSON body' }))
    return
  }

  const message = body.message?.trim()

  if (!message) {
    res.statusCode = 400
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ message: 'message is required' }))
    return
  }

  if (/^\/http-error\b/i.test(message)) {
    res.statusCode = 503
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ message: 'Mock service unavailable' }))
    return
  }

  res.statusCode = 200
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  try {
    const reply = buildMockReply(message, body.history)
    const tokens = reply.match(/\S+\s*|\s+/g) ?? [reply]

    for (const token of tokens) {
      writeSse(res, { delta: token })
      await sleep(35 + Math.random() * 45)
    }

    writeSse(res, { done: true })
    res.end()
  } catch (error) {
    writeSse(res, {
      error: error instanceof Error ? error.message : 'Unknown mock error',
    })
    res.end()
  }
}
