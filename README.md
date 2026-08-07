# Chatbot Frontend

A custom chat interface built with **React 19**, **TypeScript**, and **Vite**. It streams assistant replies over **SSE**, supports conversation history, and includes a responsive sidebar.

## Prerequisites

- Node.js 18+
- [pnpm](https://pnpm.io/) (recommended)

## Getting started

```bash
pnpm install
pnpm dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

Optional environment config:

```bash
cp .env.example .env
```

By default the app uses a built-in mock API at `/api/chat`. To use a real backend:

```env
VITE_API_BASE_URL=https://your-backend.example.com/api
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server with mock SSE API |
| `pnpm build` | Typecheck and production build |
| `pnpm preview` | Preview production build |
| `pnpm lint` | Run ESLint |

## Using the app

- Type a message and press **Enter** to send (**Shift+Enter** for newline)
- Use **Stop** to cancel a streaming response
- Open **History** in the sidebar to switch between conversations
- On mobile, tap the **menu icon** to slide the sidebar in

## Mock commands (development)

| Message | Result |
|---------|--------|
| `/error` | Stream error |
| `/http-error` | HTTP 503 |
| `/slow hello` | Slow streaming response |

## Project structure

```
src/              React components, hooks, services
server/           Dev-only mock SSE backend
public/           Static assets
vite.config.ts    Vite + mock API middleware
```
