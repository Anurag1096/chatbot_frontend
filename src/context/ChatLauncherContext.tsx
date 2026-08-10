import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useChat } from '../hooks/useChat'

interface ChatLauncherContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  requestPrompt: (prompt: string) => void
  chat: ReturnType<typeof useChat>
}

const ChatLauncherContext = createContext<ChatLauncherContextValue | null>(null)

export function ChatLauncherProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null)
  const chat = useChat()

  const requestPrompt = useCallback((prompt: string) => {
    setPendingPrompt(prompt.trim())
    setOpen(true)
  }, [])

  useEffect(() => {
    if (!open || !pendingPrompt || chat.isStreaming) return

    const prompt = pendingPrompt
    setPendingPrompt(null)
    void chat.sendMessage(prompt)
  }, [open, pendingPrompt, chat.isStreaming, chat.sendMessage])

  const value = useMemo(
    () => ({
      open,
      setOpen,
      requestPrompt,
      chat,
    }),
    [open, requestPrompt, chat],
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
