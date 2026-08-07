import type { ChatState, Conversation } from '../types/chat'
import { createId } from './id'

export const STORAGE_KEY = 'chatbot_conversation_history'

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

export function clearStoredState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Ignore private-mode storage failures.
  }
}

export function buildInitialState(): ChatState {
  const conversation = createConversation()

  return {
    conversations: [conversation],
    activeConversationId: conversation.id,
    isStreaming: false,
    globalError: null,
  }
}
