export type Role = 'user' | 'assistant' | 'system'

export type MessageStatus = 'pending' | 'streaming' | 'complete' | 'error'

export interface Message {
  id: string
  role: Role
  content: string
  status: MessageStatus
  error?: string
  createdAt: number
}

/** A prior turn sent to the backend for context (no status/metadata). */
export interface HistoryMessage {
  role: Role
  content: string
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: number
  updatedAt: number
}

export interface ChatRequest {
  message: string
  conversationId?: string
  history: HistoryMessage[]
}

export interface StreamChunk {
  delta?: string
  error?: string
  done?: boolean
}

export interface ChatState {
  conversations: Conversation[]
  activeConversationId: string
  isStreaming: boolean
  globalError: string | null
}

export type ChatAction =
  | { type: 'ADD_USER_MESSAGE'; message: Message }
  | { type: 'ADD_ASSISTANT_PLACEHOLDER'; message: Message }
  | { type: 'APPEND_DELTA'; messageId: string; delta: string }
  | { type: 'COMPLETE_MESSAGE'; messageId: string }
  | { type: 'FAIL_MESSAGE'; messageId: string; error: string }
  | { type: 'SET_GLOBAL_ERROR'; error: string | null }
  | { type: 'SET_STREAMING'; isStreaming: boolean }
  | { type: 'RESET_ASSISTANT'; messageId: string }
  | { type: 'SELECT_CONVERSATION'; conversationId: string }
  | { type: 'NEW_CONVERSATION'; conversation: Conversation }
  | { type: 'DELETE_CONVERSATION'; conversationId: string }
  | { type: 'REPLACE_EMPTY_CONVERSATION'; conversation: Conversation }
