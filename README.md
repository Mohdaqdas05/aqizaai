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

### Method 1: Docker Compose (Self-hosted / VPS)

```bash
# Clone the repo
git clone https://github.com/Mohdaqdas05/aqizaai.git
cd aqizaai

# Create .env from template
cp .env.example .env
# Edit .env with your values (especially OPENROUTER_API_KEY)

# Start all services
docker compose up -d

# App available at:
# Frontend: http://localhost:3000
# Backend:  http://localhost:5000
# Health:   http://localhost:5000/health
```

### Method 2: Render.com (Recommended — Free Tier)

1. Fork this repo
2. Go to https://render.com and sign in with GitHub
3. Click "New" → "Blueprint" → select your forked repo
4. Render reads `render.yaml` and creates all services automatically
5. Set `OPENROUTER_API_KEY` and `FRONTEND_URL` in the Render dashboard
6. Initialize the database: connect to the Render PostgreSQL shell and run `backend/models/schema.sql`

### Method 3: Vercel (Frontend) + Railway (Backend + DB)

1. **Frontend on Vercel**:
   - Import the repo on Vercel
   - Set root directory to `frontend`
   - Add env var: `VITE_API_URL` = your Railway backend URL + `/api`
2. **Backend on Railway**:
   - Create a new project on Railway
   - Add PostgreSQL plugin
   - Deploy from GitHub, set root directory to `backend`
   - Add all required env vars from `backend/.env.example`
   - Run `schema.sql` via Railway's database shell
