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
| `pnpm test` | Run tests in watch mode |
| `pnpm test:run` | Run tests once (CI) |

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

## GitHub Pages deployment

The repo includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that runs tests, builds, and deploys to GitHub Pages on every push to `main` or `master`.

### One-time setup

1. Open your repo on GitHub → **Settings** → **Pages**
2. Under **Build and deployment**, set **Source** to **Deploy from a branch**
3. Choose branch **`gh-pages`**, folder **`/ (root)`**, then **Save**
4. Push to `master`/`main` — the workflow builds your React app and publishes `dist/` to `gh-pages`

Your site will be published at:

`https://anurag1096.github.io/chatbot_frontend/`

> **Important:** Do **not** use the `master` branch as the Pages source. That serves raw source files (`/src/main.tsx`) and the app will not load. The workflow builds the React app and deploys the compiled `dist/` folder to `gh-pages`.

### Troubleshooting a blank page

If View Source shows `<script src="/src/main.tsx">`, GitHub Pages is serving source files instead of the build. Switch Pages source to the **`gh-pages`** branch.

### Backend on production

The Vite mock API only runs in local dev. On GitHub Pages the app is static, so chat requests need a real backend.

Set a repository variable (**Settings** → **Secrets and variables** → **Actions** → **Variables**):

| Variable | Example |
|----------|---------|
| `VITE_API_BASE_URL` | `https://your-api.example.com/api` |

Your backend must allow CORS from your GitHub Pages origin.

### Manual build for Pages

```bash
VITE_BASE_PATH=/chatbot_frontend/ pnpm build
```

Output is in `dist/`.
