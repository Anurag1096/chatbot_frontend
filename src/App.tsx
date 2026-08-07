import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <main className="app">
      <h1>Chatbot</h1>
      <p>React + TypeScript + Vite</p>
      <button type="button" onClick={() => setCount((value) => value + 1)}>
        Count is {count}
      </button>
    </main>
  )
}

export default App
