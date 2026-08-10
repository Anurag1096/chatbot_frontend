import { useEffect } from 'react'
import { useChatLauncher } from '../../context/ChatLauncherContext'
import { ChatInput } from '../chat/ChatInput'
import { ErrorBanner } from '../chat/ErrorBanner'
import { MessageList } from '../chat/MessageList'
import './ChatWidget.css'

interface ChatWidgetProps {
  title?: string
  subtitle?: string
}

export function ChatWidget({
  title = 'Books to Scrape Assistant',
  subtitle = 'Search our demo catalog with natural language',
}: ChatWidgetProps) {
  const { open, setOpen, requestPrompt, draftMessage, clearDraftMessage, chat } =
    useChatLauncher()

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  return (
    <div className="chat-widget" data-open={open}>
      {open && (
        <section className="chat-widget__panel" aria-label="Chat widget">
          <header className="chat-widget__header">
            <div>
              <h2>{title}</h2>
              <p>{subtitle}</p>
            </div>
            <button
              type="button"
              className="chat-widget__close"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              ×
            </button>
          </header>

          <div className="chat-widget__body">
            <ErrorBanner message={chat.globalError ?? ''} onDismiss={chat.clearError} />
            <MessageList
              messages={chat.messages}
              onRetry={chat.retry}
              onSuggestionClick={requestPrompt}
              isActive={open}
            />
            <ChatInput
              disabled={chat.isStreaming}
              isStreaming={chat.isStreaming}
              onSend={chat.sendMessage}
              onCancel={chat.cancel}
              draftMessage={draftMessage}
              onDraftApplied={clearDraftMessage}
            />
          </div>
        </section>
      )}

      <button
        type="button"
        className="chat-widget__launcher"
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Close chat' : 'Open chat'}
        aria-expanded={open}
      >
        {open ? (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M21 12c0 4.418-4.03 8-9 8-1.01 0-1.98-.14-2.88-.4L3 21l1.4-5.12A7.7 7.7 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            />
          </svg>
        )}
      </button>
    </div>
  )
}
