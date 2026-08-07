import type { Message } from '../../types/chat'
import { StreamingIndicator } from './StreamingIndicator'
import './MessageBubble.css'

interface MessageBubbleProps {
  message: Message
  onRetry?: (messageId: string) => void
}

export function MessageBubble({ message, onRetry }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const isStreaming = message.status === 'streaming'
  const isError = message.status === 'error'

  return (
    <article
      className={`message-bubble ${isUser ? 'message-bubble--user' : 'message-bubble--assistant'}${isError ? ' message-bubble--error' : ''}`}
      aria-live={isStreaming ? 'polite' : undefined}
    >
      <header className="message-bubble__meta">
        <span className="message-bubble__role">{isUser ? 'You' : 'Assistant'}</span>
      </header>

      <div className="message-bubble__content">
        {message.content}
        {isStreaming && !message.content && <StreamingIndicator />}
        {isStreaming && message.content && (
          <span className="message-bubble__cursor" aria-hidden="true" />
        )}
      </div>

      {isError && (
        <footer className="message-bubble__footer">
          <p className="message-bubble__error">{message.error}</p>
          {onRetry && (
            <button
              type="button"
              className="message-bubble__retry"
              onClick={() => onRetry(message.id)}
            >
              Retry
            </button>
          )}
        </footer>
      )}
    </article>
  )
}
