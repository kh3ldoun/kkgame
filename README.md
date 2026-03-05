# 🔢 Secret Numbers

Real-time multiplayer number guessing game. Two players pick a secret 3-digit number and take turns guessing each other's number.

## ✨ Features
- Real-time multiplayer (Supabase Realtime)
- Spectator mode with live watch link
- Player stats & leaderboard
- Match history
- How to Play guide
- Mobile friendly

## 🚀 Deployment (Cloudflare Pages + Supabase)

### Step 1 — Supabase Setup
1. Go to [supabase.com](https://supabase.com) → create a new project
2. Go to **SQL Editor** → paste the contents of `supabase/migrations/20240101000000_init.sql` → Run
3. Go to **Project Settings → API** → copy:
   - `Project URL`
   - `anon / public` key

### Step 2 — GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/kkgame.git
git push -u origin main
```

### Step 3 — Cloudflare Pages
1. Go to [pages.cloudflare.com](https://pages.cloudflare.com)
2. **Create a project → Connect to Git** → select your repo
3. Build settings:
   - Framework preset: **Vite**
   - Build command: `npm run build`
   - Build output directory: `dist`
4. **Environment variables** (Settings → Environment variables):
   ```
   VITE_SUPABASE_URL     = https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY = eyJhbGci...
   ```
5. Deploy 🎉

### Local Development
```bash
cp .env.example .env
# Fill in your Supabase values in .env
npm install
npm run dev
```

## 🗂 Project Structure
```
src/
├── components/
│   ├── ui/           # shadcn/ui base components
│   ├── GameRoom.tsx  # Main game layout
│   ├── GameStatus.tsx
│   ├── GuessHistory.tsx
│   ├── GuessInput.tsx
│   ├── SecretInput.tsx
│   ├── JoinRoom.tsx
│   ├── ShareLink.tsx
│   ├── SpectatorView.tsx
│   ├── StatsPanel.tsx
│   └── HowToPlay.tsx
├── hooks/
│   └── useGameRoom.ts   # All game logic & Supabase
├── lib/
│   ├── gameUtils.ts
│   └── utils.ts
├── types/
│   └── game.ts
└── pages/
    └── Index.tsx
supabase/
└── migrations/
    └── 20240101000000_init.sql
```

## ⚠️ Security Notes
- Never commit `.env` to git (already in `.gitignore`)
- Use Cloudflare Pages environment variables for production keys
- Supabase `anon` key is safe to expose (public by design)
- Regenerate keys if they were ever accidentally committed
