import { ChatLauncherProvider } from './context/ChatLauncherContext'
import { WidgetHostPage } from './components/widget/WidgetHostPage'
import './index.css'

function App() {
  return (
    <ChatLauncherProvider>
      <WidgetHostPage />
    </ChatLauncherProvider>
  )
}

export default App
