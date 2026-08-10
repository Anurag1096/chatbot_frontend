import { useCallback, useLayoutEffect, useRef } from 'react'
import { BOOKSTORE_INTRO, EXAMPLE_PROMPTS } from '../../config/bookstorePrompts'
import type { Message } from '../../types/chat'
import { MessageBubble } from './MessageBubble'
import './MessageList.css'

interface MessageListProps {
  messages: Message[]
  onRetry: (messageId: string) => void
  onSuggestionClick?: (text: string) => void
  /** When true, keeps the list pinned to the latest message (e.g. widget open). */
  isActive?: boolean
}

export function MessageList({
  messages,
  onRetry,
  onSuggestionClick,
  isActive = true,
}: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const lastMessageContent = messages.at(-1)?.content ?? ''

  const scrollToBottom = useCallback(() => {
    const container = containerRef.current
    if (!container) return
    container.scrollTop = container.scrollHeight
  }, [])

  useLayoutEffect(() => {
    if (!isActive) return
    scrollToBottom()
    const frame = requestAnimationFrame(scrollToBottom)
    return () => cancelAnimationFrame(frame)
  }, [isActive, messages, lastMessageContent, scrollToBottom])

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
          <h2>{BOOKSTORE_INTRO.title}</h2>
          <p>{BOOKSTORE_INTRO.description}</p>
          {onSuggestionClick && (
            <div className="message-list__suggestions">
              <p className="message-list__suggestions-label">Try asking:</p>
              <div className="message-list__suggestion-list">
                {EXAMPLE_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    className="message-list__suggestion"
                    onClick={() => onSuggestionClick(prompt)}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}
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
    </div>
  )
}
