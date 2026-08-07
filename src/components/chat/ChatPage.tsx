import { useCallback, useEffect, useState } from 'react'
import { useChat } from '../../hooks/useChat'
import { ChatInput } from './ChatInput'
import { ErrorBanner } from './ErrorBanner'
import { HistorySidebar } from './HistorySidebar'
import { MessageList } from './MessageList'
import './ChatPage.css'

const SIDEBAR_EXPANDED_KEY = 'chatbot_sidebar_expanded'
const MOBILE_BREAKPOINT = '(max-width: 768px)'

function readSidebarExpanded(): boolean {
  try {
    const stored = localStorage.getItem(SIDEBAR_EXPANDED_KEY)
    if (stored !== null) return stored === 'true'
  } catch {
    // Ignore storage failures.
  }

  return !window.matchMedia(MOBILE_BREAKPOINT).matches
}

function persistSidebarExpanded(expanded: boolean): void {
  try {
    localStorage.setItem(SIDEBAR_EXPANDED_KEY, String(expanded))
  } catch {
    // Ignore storage failures.
  }
}

export function ChatPage() {
  const [sidebarExpanded, setSidebarExpanded] = useState(readSidebarExpanded)

  const {
    messages,
    conversations,
    activeConversationId,
    isStreaming,
    globalError,
    sendMessage,
    cancel,
    retry,
    clearError,
    startNewConversation,
    selectConversation,
    deleteConversation,
  } = useChat()

  const setExpanded = useCallback((expanded: boolean) => {
    setSidebarExpanded(expanded)
    persistSidebarExpanded(expanded)
  }, [])

  const toggleSidebar = useCallback(() => {
    setSidebarExpanded((current) => {
      const next = !current
      persistSidebarExpanded(next)
      return next
    })
  }, [])

  const closeSidebar = useCallback(() => {
    setExpanded(false)
  }, [setExpanded])

  const handleSelectConversation = useCallback(
    (conversationId: string) => {
      selectConversation(conversationId)

      if (window.matchMedia(MOBILE_BREAKPOINT).matches) {
        closeSidebar()
      }
    },
    [closeSidebar, selectConversation],
  )

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_BREAKPOINT)

    const handleChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setExpanded(false)
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [setExpanded])

  useEffect(() => {
    const isMobile = window.matchMedia(MOBILE_BREAKPOINT).matches
    if (!sidebarExpanded || !isMobile) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [sidebarExpanded])

  return (
    <div
      className={`chat-shell${sidebarExpanded ? ' chat-shell--sidebar-open' : ' chat-shell--sidebar-collapsed'}`}
    >
      {sidebarExpanded && (
        <button
          type="button"
          className="chat-shell__backdrop"
          onClick={closeSidebar}
          aria-label="Close sidebar"
        />
      )}

      <HistorySidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        isStreaming={isStreaming}
        expanded={sidebarExpanded}
        onToggle={toggleSidebar}
        onSelect={handleSelectConversation}
        onNewChat={startNewConversation}
        onDelete={deleteConversation}
      />

      <div className="chat-page">
        <header className="chat-page__header">
          <div className="chat-page__header-start">
            <button
              type="button"
              className="chat-page__sidebar-toggle"
              onClick={toggleSidebar}
              aria-label={sidebarExpanded ? 'Close sidebar' : 'Open sidebar'}
              title={sidebarExpanded ? 'Close history' : 'Show history'}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path
                  d="M4 6h16M4 12h16M4 18h16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </button>

            <div>
              <h1>Chat</h1>
              <p className="chat-page__subtitle">Streaming assistant powered by SSE</p>
            </div>
          </div>
        </header>

        <ErrorBanner message={globalError ?? ''} onDismiss={clearError} />

        <MessageList messages={messages} onRetry={retry} />

        <ChatInput
          disabled={isStreaming}
          isStreaming={isStreaming}
          onSend={sendMessage}
          onCancel={cancel}
        />
      </div>
    </div>
  )
}
