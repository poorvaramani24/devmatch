# DevMatch

A developer dating app — swipe on tech stacks, match on compatibility, chat in real-time.

## Architecture

Turborepo monorepo with npm workspaces.

```
apps/
  backend/    — FastAPI + PostgreSQL + Redis (Python)
  web/        — Vite + React 18 + Tailwind CSS + Zustand
  mobile/     — Expo SDK 54 + React Native + Zustand
  docs/       — Next.js docs app
packages/
  ui/         — Shared React component library (@repo/ui)
  eslint-config/    — Shared ESLint flat configs
  typescript-config/ — Shared tsconfig presets
```

## Prerequisites

- Node.js >= 18
- npm 11+
- Python 3.11+
- PostgreSQL 15+
- Redis
- Expo CLI (`npx expo`) for mobile
- iOS Simulator (macOS) or Android emulator for mobile

## Getting Started

### 1. Install dependencies

```bash
# From repo root — installs all workspaces
npm install
```

### 2. Start the backend

```bash
cd apps/backend

# Create a virtualenv and install deps
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Copy env and configure
cp .env.example .env        # Edit DATABASE_URL, REDIS_URL, SECRET_KEY

# Run migrations
alembic upgrade head

# Seed sample data (optional)
python seed.py

# Start the API server (port 8000)
uvicorn app.main:app --reload
```

The API runs at `http://localhost:8000`. Docs at `http://localhost:8000/docs`.

### 3. Start the web app

```bash
# From repo root
npm run dev --filter=web
```

Opens at `http://localhost:5173`. Expects the backend at `http://localhost:8000` (configurable via `VITE_API_URL`).

**Web tech stack:** React 18, React Router, Tailwind CSS, Zustand, Axios, Framer Motion, react-hot-toast, lucide-react.

### 4. Start the mobile app

```bash
cd apps/mobile

# Start Expo dev server
npx expo start --clear
```

Then press `i` for iOS Simulator or `a` for Android emulator.

**Mobile tech stack:** Expo SDK 54, React Native 0.81, expo-router (file-based routing), Zustand, Axios, expo-secure-store, react-native-reanimated, react-native-gesture-handler, react-native-toast-message.

The mobile app expects the backend at `http://localhost:8000` by default. To change this, set `apiUrl` and `wsUrl` in `app.json` under `expo.extra`, or update `apps/mobile/constants/api.ts`.

## Monorepo Commands

```bash
npm run dev                    # Run all apps in parallel
npm run build                  # Build all apps and packages
npm run lint                   # Lint all workspaces
npm run check-types            # Type-check all workspaces
npm run format                 # Format with Prettier

# Filter to one app
npm run dev --filter=web
npm run dev --filter=docs
```

## Project Structure — Web

```
apps/web/src/
  types/index.ts        — Shared TypeScript interfaces (User, Profile, Match, Message, Badge)
  services/api.ts       — Axios client with JWT interceptor, all API methods
  services/websocket.ts — WebSocket service for real-time chat
  hooks/useAuth.ts      — Zustand auth store (login, register, logout, profile)
  components/           — TechTag, CompatibilityBadge, Layout
  pages/                — Login, Register, ProfileSetup, Discover, Matches, Chat, MyProfile, Badges
```

## Project Structure — Mobile

```
apps/mobile/
  constants/            — colors, typography, spacing, api URL
  types/index.ts        — Same interfaces as web
  services/
    storage.ts          — expo-secure-store wrapper (JWT tokens)
    api.ts              — Axios client with async token interceptor
    websocket.ts        — WebSocket with async token retrieval
  hooks/useAuth.ts      — Zustand store with hydrate() for async SecureStore
  components/           — SafeScreen, Card, Button, Input, TechTag, CompatibilityBadge,
                          Avatar, DiscoverCard, MatchRow, MessageBubble, TypingIndicator, etc.
  app/
    _layout.tsx         — Root: auth hydration, splash screen, route protection
    (auth)/             — Login, Register screens
    (setup)/            — 5-step profile wizard
    (tabs)/             — Bottom tabs: Discover (swipe cards), Matches, Profile, Badges
    chat/[matchId].tsx  — Real-time chat with WebSocket
```

## Key Features

- **Discovery** — Swipeable profile cards with compatibility scoring
- **Stack Match %** — Compatibility based on shared tech stack, tools, work style
- **Real-time chat** — WebSocket messaging with typing indicators, code snippets, icebreakers
- **Badges** — Gamification (Bug Slayer, Polyglot Developer, First Match, etc.)
- **GitHub sync** — Pull languages and repo count from GitHub profiles
- **Profile setup** — 5-step wizard (basics, professional, tech stack, personality, fun prompts)

## Deploy to Railway

### Prerequisites

- A [Railway](https://railway.app) account
- Railway CLI installed (`npm i -g @railway/cli`)
- A GitHub repo connected to Railway (or use `railway up` for direct deploys)

### 1. Create a new Railway project

```bash
railway login
railway init
```

### 2. Provision databases

Add **PostgreSQL** and **Redis** plugins from the Railway dashboard (or via CLI):

```bash
railway add --plugin postgresql
railway add --plugin redis
```

Railway automatically injects `DATABASE_URL` and `REDIS_URL` into your services.

### 3. Deploy the backend

```bash
# Link to a new service for the backend
railway service create backend
railway link --service backend

# Set the root directory and environment variables
railway variables set \
  SECRET_KEY=<your-secret-key> \
  FRONTEND_URL=<your-web-railway-url>

# Deploy from the backend directory
railway up --detach -d apps/backend
```

The backend `railway.toml` is pre-configured with a Dockerfile build and `/api/health` health check.

### 4. Deploy the web app

```bash
# Link to a new service for the web frontend
railway service create web
railway link --service web

# Set the backend API URL (use your backend's Railway domain)
railway variables set \
  VITE_API_URL=https://<backend-service>.up.railway.app \
  VITE_WS_URL=wss://<backend-service>.up.railway.app

# Deploy from the web directory
railway up --detach -d apps/web
```

The web `railway.toml` builds with Vite and serves the static bundle via `npx serve`.

### 5. Generate public domains

In the Railway dashboard, go to each service's **Settings > Networking** and click **Generate Domain** to get public URLs, or use the CLI:

```bash
railway domain --service backend
railway domain --service web
```

### 6. Update cross-service URLs

After generating domains, update the environment variables so the services can talk to each other:

- **Backend** `FRONTEND_URL` → set to the web app's Railway URL
- **Web** `VITE_API_URL` / `VITE_WS_URL` → set to the backend's Railway URL

Redeploy or restart each service for the changes to take effect.

## Environment Variables

### Backend (`apps/backend/.env`)

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql+asyncpg://devmatch:devmatch@localhost:5432/devmatch` | PostgreSQL connection |
| `REDIS_URL` | `redis://localhost:6379/0` | Redis connection |
| `SECRET_KEY` | — | JWT signing key (change in production) |
| `GITHUB_CLIENT_ID` | — | GitHub OAuth (optional) |
| `GITHUB_CLIENT_SECRET` | — | GitHub OAuth (optional) |

### Web (`apps/web`)

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8000` | Backend API URL |
| `VITE_WS_URL` | `ws://localhost:8000` | WebSocket URL |

### Mobile (`apps/mobile/constants/api.ts`)

| Variable | Default | Description |
|---|---|---|
| `API_URL` | `http://localhost:8000` | Backend API URL |
| `WS_URL` | `ws://localhost:8000` | WebSocket URL |
