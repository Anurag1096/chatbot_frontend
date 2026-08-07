import { useCallback, useMemo, useReducer, useRef } from 'react'
import { sendChatMessage } from '../services/chatApi'
import type {
  ChatAction,
  ChatState,
  Conversation,
  HistoryMessage,
  Message,
} from '../types/chat'
import {
  buildInitialState,
  createConversation,
  truncateTitle,
} from '../utils/conversations'
import { getErrorMessage, isAbortError } from '../utils/errors'
import { createId } from '../utils/id'

function getActiveConversation(state: ChatState): Conversation | undefined {
  return state.conversations.find(
    (conversation) => conversation.id === state.activeConversationId,
  )
}

function mapActiveConversation(
  state: ChatState,
  mapper: (conversation: Conversation) => Conversation,
): ChatState {
  return {
    ...state,
    conversations: state.conversations.map((conversation) =>
      conversation.id === state.activeConversationId
        ? mapper(conversation)
        : conversation,
    ),
  }
}

function toHistory(messages: Message[]): HistoryMessage[] {
  return messages
    .filter(
      (message) =>
        message.status === 'complete' &&
        (message.role === 'user' || message.role === 'assistant'),
    )
    .map(({ role, content }) => ({ role, content }))
}

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'ADD_USER_MESSAGE':
      return {
        ...mapActiveConversation(state, (conversation) => ({
          ...conversation,
          messages: [...conversation.messages, action.message],
          title:
            conversation.messages.length === 0
              ? truncateTitle(action.message.content)
              : conversation.title,
          updatedAt: Date.now(),
        })),
        globalError: null,
      }
    case 'ADD_ASSISTANT_PLACEHOLDER':
      return {
        ...mapActiveConversation(state, (conversation) => ({
          ...conversation,
          messages: [...conversation.messages, action.message],
          updatedAt: Date.now(),
        })),
        isStreaming: true,
      }
    case 'APPEND_DELTA':
      return mapActiveConversation(state, (conversation) => ({
        ...conversation,
        messages: conversation.messages.map((message) =>
          message.id === action.messageId
            ? { ...message, content: message.content + action.delta }
            : message,
        ),
        updatedAt: Date.now(),
      }))
    case 'COMPLETE_MESSAGE':
      return {
        ...mapActiveConversation(state, (conversation) => ({
          ...conversation,
          messages: conversation.messages.map((message) =>
            message.id === action.messageId
              ? { ...message, status: 'complete' }
              : message,
          ),
          updatedAt: Date.now(),
        })),
        isStreaming: false,
      }
    case 'FAIL_MESSAGE':
      return {
        ...mapActiveConversation(state, (conversation) => ({
          ...conversation,
          messages: conversation.messages.map((message) =>
            message.id === action.messageId
              ? {
                  ...message,
                  status: 'error',
                  error: action.error,
                }
              : message,
          ),
          updatedAt: Date.now(),
        })),
        isStreaming: false,
      }
    case 'SET_GLOBAL_ERROR':
      return { ...state, globalError: action.error, isStreaming: false }
    case 'SET_STREAMING':
      return { ...state, isStreaming: action.isStreaming }
    case 'RESET_ASSISTANT':
      return {
        ...mapActiveConversation(state, (conversation) => ({
          ...conversation,
          messages: conversation.messages.map((message) =>
            message.id === action.messageId
              ? {
                  ...message,
                  content: '',
                  status: 'streaming',
                  error: undefined,
                }
              : message,
          ),
        })),
        isStreaming: true,
        globalError: null,
      }
    case 'SELECT_CONVERSATION':
      if (action.conversationId === state.activeConversationId) return state
      return {
        ...state,
        activeConversationId: action.conversationId,
        globalError: null,
        isStreaming: false,
      }
    case 'NEW_CONVERSATION':
      return {
        ...state,
        conversations: [action.conversation, ...state.conversations],
        activeConversationId: action.conversation.id,
        globalError: null,
        isStreaming: false,
      }
    case 'REPLACE_EMPTY_CONVERSATION':
      return {
        ...state,
        conversations: state.conversations.map((conversation) =>
          conversation.id === state.activeConversationId
            ? action.conversation
            : conversation,
        ),
        activeConversationId: action.conversation.id,
        globalError: null,
        isStreaming: false,
      }
    case 'DELETE_CONVERSATION': {
      const remaining = state.conversations.filter(
        (conversation) => conversation.id !== action.conversationId,
      )

      if (remaining.length === 0) {
        const conversation = createConversation()
        return {
          ...state,
          conversations: [conversation],
          activeConversationId: conversation.id,
          isStreaming: false,
          globalError: null,
        }
      }

      const nextActiveId =
        state.activeConversationId === action.conversationId
          ? remaining[0].id
          : state.activeConversationId

      return {
        ...state,
        conversations: remaining,
        activeConversationId: nextActiveId,
        isStreaming: false,
        globalError: null,
      }
    }
    default:
      return state
  }
}

export function useChat() {
  const [state, dispatch] = useReducer(chatReducer, undefined, buildInitialState)
  const abortRef = useRef<AbortController | null>(null)

  const activeConversation = getActiveConversation(state)
  const messages = activeConversation?.messages ?? []

  const conversations = useMemo(
    () =>
      [...state.conversations].sort(
        (left, right) => right.updatedAt - left.updatedAt,
      ),
    [state.conversations],
  )

  const streamAssistantReply = useCallback(
    async (
      userText: string,
      history: HistoryMessage[],
      assistantId: string,
      conversationId: string,
    ) => {
      const controller = new AbortController()
      abortRef.current = controller

      try {
        await sendChatMessage({
          request: {
            message: userText,
            conversationId,
            history,
          },
          signal: controller.signal,
          onChunk: (delta) => {
            dispatch({ type: 'APPEND_DELTA', messageId: assistantId, delta })
          },
        })

        dispatch({ type: 'COMPLETE_MESSAGE', messageId: assistantId })
      } catch (error) {
        if (isAbortError(error)) {
          dispatch({
            type: 'FAIL_MESSAGE',
            messageId: assistantId,
            error: 'Response cancelled.',
          })
          return
        }

        const message = getErrorMessage(error)
        dispatch({ type: 'FAIL_MESSAGE', messageId: assistantId, error: message })
        dispatch({ type: 'SET_GLOBAL_ERROR', error: message })
      } finally {
        abortRef.current = null
      }
    },
    [],
  )

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || state.isStreaming || !activeConversation) return

      const history = toHistory(messages)
      const userMessage: Message = {
        id: createId(),
        role: 'user',
        content: trimmed,
        status: 'complete',
        createdAt: Date.now(),
      }

      const assistantMessage: Message = {
        id: createId(),
        role: 'assistant',
        content: '',
        status: 'streaming',
        createdAt: Date.now(),
      }

      dispatch({ type: 'ADD_USER_MESSAGE', message: userMessage })
      dispatch({ type: 'ADD_ASSISTANT_PLACEHOLDER', message: assistantMessage })

      await streamAssistantReply(
        trimmed,
        history,
        assistantMessage.id,
        activeConversation.id,
      )
    },
    [activeConversation, messages, state.isStreaming, streamAssistantReply],
  )

  const cancel = useCallback(() => {
    abortRef.current?.abort()
    dispatch({ type: 'SET_STREAMING', isStreaming: false })
  }, [])

  const retry = useCallback(
    async (assistantMessageId: string) => {
      if (state.isStreaming || !activeConversation) return

      const assistantIndex = messages.findIndex(
        (message) => message.id === assistantMessageId,
      )
      if (assistantIndex <= 0) return

      const userMessage = messages[assistantIndex - 1]
      if (userMessage.role !== 'user') return

      const history = toHistory(messages.slice(0, assistantIndex - 1))

      dispatch({ type: 'RESET_ASSISTANT', messageId: assistantMessageId })

      await streamAssistantReply(
        userMessage.content,
        history,
        assistantMessageId,
        activeConversation.id,
      )
    },
    [activeConversation, messages, state.isStreaming, streamAssistantReply],
  )

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_GLOBAL_ERROR', error: null })
  }, [])

  const startNewConversation = useCallback(() => {
    abortRef.current?.abort()

    const current = getActiveConversation(state)
    const nextConversation = createConversation()

    if (current && current.messages.length === 0) {
      dispatch({ type: 'REPLACE_EMPTY_CONVERSATION', conversation: nextConversation })
      return
    }

    dispatch({ type: 'NEW_CONVERSATION', conversation: nextConversation })
  }, [state])

  const selectConversation = useCallback(
    (conversationId: string) => {
      if (conversationId === state.activeConversationId) return
      abortRef.current?.abort()
      dispatch({ type: 'SELECT_CONVERSATION', conversationId })
    },
    [state.activeConversationId],
  )

  const deleteConversation = useCallback(
    (conversationId: string) => {
      abortRef.current?.abort()
      dispatch({ type: 'DELETE_CONVERSATION', conversationId })
    },
    [],
  )

  return {
    messages,
    conversations,
    activeConversationId: state.activeConversationId,
    isStreaming: state.isStreaming,
    globalError: state.globalError,
    sendMessage,
    cancel,
    retry,
    clearError,
    startNewConversation,
    selectConversation,
    deleteConversation,
  }
}
