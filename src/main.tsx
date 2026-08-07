import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { clearStoredState } from './utils/conversations'
import './index.css'
import App from './App.tsx'

clearStoredState()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
