import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useChat } from '../hooks/useChat'

interface ChatLauncherContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  draftMessage: string | null
  requestPrompt: (prompt: string) => void
  clearDraftMessage: () => void
  chat: ReturnType<typeof useChat>
}

const ChatLauncherContext = createContext<ChatLauncherContextValue | null>(null)

export function ChatLauncherProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [draftMessage, setDraftMessage] = useState<string | null>(null)
  const chat = useChat()

  const requestPrompt = useCallback((prompt: string) => {
    setDraftMessage(prompt.trim())
    setOpen(true)
  }, [])

  const clearDraftMessage = useCallback(() => {
    setDraftMessage(null)
  }, [])

  const value = useMemo(
    () => ({
      open,
      setOpen,
      draftMessage,
      requestPrompt,
      clearDraftMessage,
      chat,
    }),
    [open, draftMessage, requestPrompt, clearDraftMessage, chat],
  )

  return (
    <ChatLauncherContext.Provider value={value}>{children}</ChatLauncherContext.Provider>
  )
}

export function useChatLauncher() {
  const context = useContext(ChatLauncherContext)
  if (!context) {
    throw new Error('useChatLauncher must be used within ChatLauncherProvider')
  }
  return context
}
