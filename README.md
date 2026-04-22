# Rankflow

> **Climb smarter.** — Your Valorant performance coach.

Rankflow is a player improvement and coaching analytics platform for Valorant. Unlike traditional stat trackers, Rankflow transforms match history into actionable coaching signals, helping players understand their weaknesses and climb ranks.

🔗 **Live:** https://rankflow-xi.vercel.app

---

## 📖 Table of Contents

- [Vision & Philosophy](#vision--philosophy)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [Design System](#design-system)
- [Code Conventions](#code-conventions)
- [Roadmap](#roadmap)
- [Setup](#setup)

---

## 🎯 Vision & Philosophy

Rankflow is designed as a **pre-game decision tool + post-game feedback loop** for competitive Valorant players.

**Core philosophy:**
- **Simple > complex** — a player should understand their stats at a glance
- **Actionable > data-heavy** — every insight must lead to a decision
- **Fast > feature-overloaded** — the site respects the player's time

**Key differentiator vs tracker.gg:**
Rankflow translates raw stats into human advice. A Bronze player with 50% headshot rate doesn't know this is irrelevant for climbing — Rankflow tells them what actually matters at their rank.

**Target audience:** Competitive Valorant players (Iron to Radiant) who want structured improvement.

---

## 🛠 Tech Stack

- **Framework:** Next.js 16 (App Router, Server Components)
- **Language:** JavaScript
- **Styling:** Tailwind CSS
- **Font:** Space Grotesk (via next/font/google)
- **Deployment:** Vercel (auto-deploy on git push)
- **APIs:**
  - **Henrik API** (primary, free tier) — https://api.henrikdev.xyz
  - **Riot API** (pending official access) — currently limited developer key

**Environment variables (`.env.local` + Vercel):**
- `HENRIK_API_KEY` — HDEV-... key for Henrik API
- `RIOT_API_KEY` — RGAPI-... key (not actively used yet)

---

## 📁 Project Structure
app/
├── layout.js                          # Root layout (font, header, background)
├── page.js                            # Home page with search bar
├── globals.css                        # Global styles + utility classes
└── player/[name]/[tag]/
├── page.js                        # Dashboard (profile, rank, curve, recap)
├── coach/page.js                  # Coach (session plan, tips, alerts)
├── maps/page.js                   # Maps list (3 columns by WR)
├── map/[mapName]/page.js          # Map detail (stats, agents, matches)
├── agents/page.js                 # Agents list (3 columns by WR)
├── agent/[agentName]/page.js      # Agent detail (KDA, maps, matches)
├── advanced/
│   ├── page.js                    # Server component (data fetching)
│   └── AdvancedView.js            # Client component (interactive UI)
└── history/
├── page.js                    # Server component (data fetching)
└── HistoryView.js             # Client component (filters)

---

## ✨ Features

### 🔍 Home Page
- Large RANKFLOW branding with red Valorant glow effect
- "Climb smarter." signature slogan
- Riot ID search bar (Name#TAG format)
- 3 feature teasers (Dashboard, Coach, Progression)

### 📊 Dashboard (`/player/[name]/[tag]`)
- Player profile (card, name, level)
- Current rank with RR and last game change
- Rank progression curve with dynamic rank-based Y-axis
- Session recap (wins/losses/winrate) with link to Coach

### 🎯 Coach (`/player/[name]/[tag]/coach`)
- **Session Plan** — best map to play, worst map to avoid, suggested agent
- **Rank-based tips** — 4 brackets (Iron/Bronze, Silver/Gold, Plat/Diamond, Ascendant+)
- **Smart alerts:**
  - Loss streak detection (3+ consecutive losses) — red Valorant alert
  - Win streak detection (3+ consecutive wins) — emerald alert
  - Agent warning (3+ games, WR ≤ 35%)
  - Map warning (3+ games, WR ≤ 35%)
- Best/Worst map cards
- Best/Worst agent cards

### 🗺️ Maps (`/player/[name]/[tag]/maps`)
- 3-column layout by performance:
  - **À privilégier** (WR > 55%) — emerald
  - **À consolider** (WR 45-55%) — indigo
  - **À éviter** (WR < 45%) — rose
- Click any map → detail page with stats, agents played, recent matches

### 🎭 Agents (`/player/[name]/[tag]/agents`)
- Same 3-column structure as Maps
- Click any agent → detail page with KDA averages, maps played, recent matches

### ⚡ Advanced Stats (`/player/[name]/[tag]/advanced`)
Interactive UI with overview grid + expandable detail cards:
- **⚔️ First Duel Rate** — % of first duels won
- **🤝 Trade Rate** — % of deaths traded within 5s
- **⭐ KAST** — Kill/Assist/Survive/Trade percentage
- **🔫 Pistol Rounds** — winrate on rounds 1 and 13
- **💥 Damage per Round** — average DPR with pro benchmark
- **💰 Eco vs Full Buy** — kills per round by economy state

Each metric includes a **coach insight** in plain language.

### 📜 History (`/player/[name]/[tag]/history`)
- Total session RR net (+/- X RR)
- Filters: All / Wins / Losses
- Each match: map, agent icon, score, KDA, RR change

---

## 🎨 Design System

### Colors

**Primary palette:**
- Background: `slate-950` (darkest)
- Cards: `slate-900` / `slate-800`
- Borders: `slate-800` / `slate-700`
- Text: `white` / `slate-300` / `slate-400`

**Accent: Rouge Valorant** `#FF4654`
Used for:
- Logo hover
- Search button
- Critical alerts (loss streak)
- RANKFLOW glow on home page
- Identity signature point (after "Climb smarter.")

**Status colors:**
- **Good:** `emerald-400` / `emerald-500`
- **Neutral:** `indigo-400` / `indigo-500`
- **Warning:** `amber-400` / `orange-400`
- **Bad:** `rose-400` / `rose-500`

### Typography

**Font:** Space Grotesk (Google Fonts via next/font)
- Variable CSS: `--font-space-grotesk`
- Used everywhere via `font-sans` (Tailwind default overridden in config)

**Conventions:**
- `tracking-tighter` for big titles (hero)
- `tracking-tight` for numbers and stats
- `tracking-wider` for uppercase labels

### Utility Classes (in `globals.css`)

```css
.card-hover        /* Subtle lift + border highlight */
.card-interactive  /* Bigger lift + indigo border + shadow */
.fade-in           /* Progressive appearance animation */
```

### Micro-interactions

- Back arrows (`←`) slide left on hover
- Forward arrows (`→`) slide right on hover
- Cards lift slightly on hover
- Active navigation tab has gradient + border
- Home page: red pulsing dot on "Valorant Performance Tracker" badge

---

## 💻 Code Conventions

### Server vs Client Components

- **Server Components (default)** for pages that only fetch and display data
- **Client Components (`"use client"`)** only when interactivity is needed (useState, onClick)
- **Pattern for interactive pages:** Server `page.js` fetches data → passes to Client `XxxView.js` component

Example: `advanced/page.js` (server) + `advanced/AdvancedView.js` (client)

### Data Flow

All data comes from Henrik API. Routes used:
- `v1/account/{name}/{tag}` — player profile
- `v2/mmr/eu/{name}/{tag}` — current rank
- `v1/mmr-history/eu/{name}/{tag}` — rank history for curves and RR changes
- `v4/matches/eu/pc/{name}/{tag}?mode=competitive&size=20` — detailed match data

**Known limits:**
- Henrik free tier returns **10 matches max** even if `size=20` is requested
- Official Riot API access would unlock real-time data, full match history, and more granular signals

### Navigation Pattern

All player pages share a **sub-navigation** bar:
Dashboard | Coach | Maps | Agents | Stats avancées | Historique
The active tab uses:
---

## 🗺️ Roadmap

### ✅ Done
- [x] Home page with search
- [x] Dashboard with profile, rank, progression curve
- [x] Coach with session plan, tips, alerts
- [x] Maps (list + 3 columns + detail)
- [x] Agents (list + 3 columns + detail)
- [x] Advanced stats (6 metrics with interactive accordions)
- [x] History with RR per match and filters
- [x] Design polish (typography, palette, micro-interactions)
- [x] Deployment on Vercel with env vars

### 🔄 To Consider
- [ ] Apply "3 columns" logic to Coach page (best/worst map and agent)
- [ ] Add "New" badge on Advanced Stats tab
- [ ] Week-over-week progression comparison (requires DB storage)
- [ ] More advanced metrics:
  - Clutch rate (1vX situations)
  - Positional heatmaps (x/y death zones)
  - Synergy analysis (teammates with highest WR together)
  - Time-of-day performance patterns
- [ ] More coach detections:
  - Tilt detection via KDA drop
  - Agent pool too wide warning
  - Time-based fatigue warning

### 🔮 Long-term
- [ ] Official Riot API access (pending)
- [ ] User accounts with historical data storage
- [ ] Comparison between players
- [ ] Mobile-first optimizations
- [ ] More languages (currently FR)

---

## 🚀 Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- A Henrik API key (free at https://docs.henrikdev.xyz)

### Local Development

```bash
# Clone the repo
git clone https://github.com/Rankflowapp/Rankflow.git
cd Rankflow

# Install dependencies
npm install

# Create .env.local
echo "HENRIK_API_KEY=HDEV-your-key-here" > .env.local

# Run dev server
npm run dev
```

Open http://localhost:3000

### Deployment

The project auto-deploys to Vercel on every push to `main`. Environment variables must be configured in Vercel Settings.

---

## 📧 Contact

**Project owner:** Aurel (Sparni#EUW)

Rankflow complies with Riot's Developer Policies. It does not offer boosting, account marketplaces, gambling features, or unofficial game modifications.

---

*Built with Next.js, Tailwind, and a lot of ranked games.*