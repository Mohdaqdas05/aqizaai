# AQIZA AI

A production-grade ChatGPT-like AI platform with streaming responses, multi-conversation support, and Google OAuth.

## Tech Stack

**Frontend:** React + Vite + Tailwind CSS + Framer Motion  
**Backend:** Node.js + Express + PostgreSQL  
**Auth:** JWT + Google OAuth (Passport.js)  
**AI:** OpenRouter API with SSE streaming  

## Project Structure

```
aqizaai/
├── backend/          # Node.js + Express API
│   ├── ai/           # AI routing + OpenRouter provider
│   ├── config/       # DB, Passport, AI models config
│   ├── controllers/  # Auth, Chat, Admin controllers
│   ├── middleware/   # Auth, rate limiting, validation
│   ├── models/       # PostgreSQL schema
│   └── routes/       # API routes
└── frontend/         # React + Vite SPA
    └── src/
        ├── api/        # Axios instance with auth interceptors
        ├── components/ # Sidebar, ChatWindow, MessageBubble, etc.
        ├── context/    # Auth, Chat, Toast contexts
        ├── hooks/      # useLocalStorage, useMediaQuery
        └── pages/      # Landing, Login, Register, Dashboard, Admin
```

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- OpenRouter API key (free at https://openrouter.ai)
- Google OAuth credentials (optional)

### Backend Setup

```bash
cd backend
cp .env.example .env
# Fill in your DATABASE_URL, JWT_SECRET, OPENROUTER_API_KEY
npm install

# Initialize database
psql -U postgres -d aqizaai < models/schema.sql

npm run dev
```

### Frontend Setup

```bash
cd frontend
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000/api
npm install
npm run dev
```

App will be available at http://localhost:5173

## Environment Variables

### Backend (`backend/.env`)
| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | JWT signing secret |
| `JWT_REFRESH_SECRET` | Refresh token secret |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `OPENROUTER_API_KEY` | OpenRouter API key for AI |
| `FRONTEND_URL` | Frontend URL for CORS |

### Frontend (`frontend/.env`)
| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API URL |
| `VITE_APP_NAME` | App display name |

## Features

- **Authentication** – Email/password + Google OAuth, JWT with refresh token rotation
- **Chat** – Multi-conversation support, streaming AI responses via SSE
- **Sidebar** – Collapsible with Framer Motion animations, chat history, profile menu
- **AI Models** – Plan-gated model selection via OpenRouter
- **Admin Panel** – User management, stats dashboard
- **Dark Mode** – Default dark theme with light mode toggle
- **Security** – Rate limiting, CSRF protection, bcrypt password hashing

## Deployment

### Frontend — GitHub Pages

The frontend is automatically deployed to GitHub Pages at:  
**https://Mohdaqdas05.github.io/aqizaai/**

Deployment triggers on every push to `main` that changes files under `frontend/`.

To enable GitHub Pages:
1. Go to **Settings → Pages**
2. Set **Source** to **GitHub Actions**

### Backend CI

The backend CI workflow runs on every push to `main` and on pull requests that change files under `backend/`. It installs dependencies and runs a health-check smoke test against the server.

### Required GitHub Secrets

Configure the following secret in **Settings → Secrets and variables → Actions**:

| Secret | Description |
|--------|-------------|
| `VITE_API_URL` | Production backend API URL (e.g. `https://your-app.onrender.com/api`) |

### Local / Self-Hosted Deployment

**Frontend:** Deploy `frontend/` to Vercel or GitHub Pages  
**Backend:** Deploy `backend/` to Railway, Render, or Fly.io  
**Database:** Supabase (PostgreSQL)
