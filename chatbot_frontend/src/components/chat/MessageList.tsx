import { useEffect, useRef } from 'react'
import type { Message } from '../../types/chat'
import { MessageBubble } from './MessageBubble'
import './MessageList.css'

interface MessageListProps {
  messages: Message[]
  onRetry: (messageId: string) => void
}

export function MessageList({ messages, onRetry }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div
      ref={containerRef}
      className="message-list"
      role="log"
      aria-live="polite"
      aria-relevant="additions text"
    >
      {messages.length === 0 ? (
        <div className="message-list__empty">
          <h2>Ask anything</h2>
          <p>
            Messages stream in via SSE. Try a follow-up like “tell me more” to
            see multi-turn context in action.
          </p>
        </div>
      ) : (
        messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            onRetry={message.role === 'assistant' ? onRetry : undefined}
          />
        ))
      )}
      <div ref={bottomRef} />
    </div>
  )
}
