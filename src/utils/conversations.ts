import type { ChatState, Conversation } from '../types/chat'
import { createId } from './id'

const STORAGE_KEY = 'chatbot_conversation_history'

interface StoredState {
  conversations: Conversation[]
  activeConversationId: string
}

export function createConversation(): Conversation {
  const now = Date.now()

  return {
    id: createId(),
    title: 'New chat',
    messages: [],
    createdAt: now,
    updatedAt: now,
  }
}

export function truncateTitle(text: string, maxLength = 48): string {
  const trimmed = text.trim().replace(/\s+/g, ' ')
  if (trimmed.length <= maxLength) return trimmed
  return `${trimmed.slice(0, maxLength - 1)}…`
}

export function loadStoredState(): StoredState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as StoredState
    if (!parsed.conversations?.length || !parsed.activeConversationId) return null

    return parsed
  } catch {
    return null
  }
}

export function saveStoredState(state: ChatState): void {
  try {
    const payload: StoredState = {
      conversations: state.conversations,
      activeConversationId: state.activeConversationId,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // Ignore quota or private-mode storage failures.
  }
}

export function buildInitialState(): ChatState {
  const stored = loadStoredState()
  if (stored) {
    return {
      conversations: stored.conversations,
      activeConversationId: stored.activeConversationId,
      isStreaming: false,
      globalError: null,
    }
  }

  const conversation = createConversation()

  return {
    conversations: [conversation],
    activeConversationId: conversation.id,
    isStreaming: false,
    globalError: null,
  }
}
