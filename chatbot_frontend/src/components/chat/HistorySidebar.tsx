import type { Conversation } from '../../types/chat'
import { formatConversationTime } from '../../utils/format'
import './HistorySidebar.css'

interface HistorySidebarProps {
  conversations: Conversation[]
  activeConversationId: string
  isStreaming: boolean
  expanded: boolean
  onToggle: () => void
  onSelect: (conversationId: string) => void
  onNewChat: () => void
  onDelete: (conversationId: string) => void
}

function ChevronIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg
      className="history-sidebar__icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      {direction === 'left' ? (
        <path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="2" />
      ) : (
        <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" />
      )}
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg
      className="history-sidebar__icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

export function HistorySidebar({
  conversations,
  activeConversationId,
  isStreaming,
  expanded,
  onToggle,
  onSelect,
  onNewChat,
  onDelete,
}: HistorySidebarProps) {
  return (
    <aside
      className={`history-sidebar${expanded ? '' : ' history-sidebar--collapsed'}`}
      aria-label="Chat history"
      aria-expanded={expanded}
    >
      <div className="history-sidebar__header">
        {expanded && <h2>History</h2>}

        <div className="history-sidebar__header-actions">
          <button
            type="button"
            className="history-sidebar__toggle"
            onClick={onToggle}
            aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
            title={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <ChevronIcon direction={expanded ? 'left' : 'right'} />
          </button>

          <button
            type="button"
            className="history-sidebar__new"
            onClick={onNewChat}
            disabled={isStreaming}
            aria-label="New chat"
            title="New chat"
          >
            <PlusIcon />
            {expanded && <span className="history-sidebar__new-label">New chat</span>}
          </button>
        </div>
      </div>

      <nav className="history-sidebar__list" hidden={!expanded}>
        {conversations.length === 0 ? (
          <p className="history-sidebar__empty">No conversations yet</p>
        ) : (
          conversations.map((conversation) => {
            const isActive = conversation.id === activeConversationId

            return (
              <div
                key={conversation.id}
                className={`history-sidebar__item${isActive ? ' history-sidebar__item--active' : ''}`}
              >
                <button
                  type="button"
                  className="history-sidebar__select"
                  onClick={() => onSelect(conversation.id)}
                  disabled={isStreaming && !isActive}
                  aria-current={isActive ? 'page' : undefined}
                  title={conversation.title}
                >
                  <span className="history-sidebar__title">{conversation.title}</span>
                  <span className="history-sidebar__time">
                    {formatConversationTime(conversation.updatedAt)}
                  </span>
                </button>

                <button
                  type="button"
                  className="history-sidebar__delete"
                  aria-label={`Delete ${conversation.title}`}
                  onClick={() => onDelete(conversation.id)}
                  disabled={isStreaming}
                >
                  ×
                </button>
              </div>
            )
          })
        )}
      </nav>

      {!expanded && conversations.length > 0 && (
        <div className="history-sidebar__collapsed-indicator" aria-hidden="true">
          <span>{conversations.length}</span>
        </div>
      )}
    </aside>
  )
}
