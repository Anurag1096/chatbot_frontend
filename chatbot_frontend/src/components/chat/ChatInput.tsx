import { useState, type FormEvent, type KeyboardEvent } from 'react'
import './ChatInput.css'

interface ChatInputProps {
  disabled: boolean
  isStreaming: boolean
  onSend: (text: string) => void
  onCancel: () => void
}

export function ChatInput({
  disabled,
  isStreaming,
  onSend,
  onCancel,
}: ChatInputProps) {
  const [value, setValue] = useState('')

  const submit = () => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    submit()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      submit()
    }
  }

  return (
    <form className="chat-input" onSubmit={handleSubmit}>
      <label className="chat-input__label" htmlFor="chat-message">
        Message
      </label>
      <textarea
        id="chat-message"
        className="chat-input__field"
        rows={3}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask a question… (Enter to send, Shift+Enter for newline)"
        disabled={disabled}
      />

      <div className="chat-input__actions">
        {isStreaming ? (
          <button type="button" className="chat-input__button chat-input__button--stop" onClick={onCancel}>
            Stop
          </button>
        ) : (
          <button
            type="submit"
            className="chat-input__button chat-input__button--send"
            disabled={disabled || !value.trim()}
          >
            Send
          </button>
        )}
      </div>
    </form>
  )
}
