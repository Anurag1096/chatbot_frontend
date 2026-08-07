import './ErrorBanner.css'

interface ErrorBannerProps {
  message: string
  onDismiss: () => void
}

export function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  if (!message) return null

  return (
    <div className="error-banner" role="alert">
      <p>{message}</p>
      <button type="button" className="error-banner__dismiss" onClick={onDismiss}>
        Dismiss
      </button>
    </div>
  )
}
