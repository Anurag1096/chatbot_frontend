import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import type { Plugin } from 'vite'
import { handleMockChat } from './server/mockSseHandler.js'

function mockChatApiPlugin(): Plugin {
  return {
    name: 'mock-chat-api',
    configureServer(server) {
      server.middlewares.use('/api/chat', (req, res, next) => {
        if (req.method !== 'POST') {
          next()
          return
        }

        void handleMockChat(req, res)
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), mockChatApiPlugin()],
})
