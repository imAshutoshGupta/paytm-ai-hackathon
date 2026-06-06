# Hisaab — AI Business Assistant

An AI-powered business assistant for India's small business sector — kirana stores, tuition teachers, and tailors. Track dues (udhaar), scan supplier bills, manage stock, and ask an AI assistant about your business in **English, हिंदी, or मराठी**.

Built for the Paytm AI Hackathon, Mumbai.

---

## Run it on a Mac (step by step)

### Prerequisites

Check these are installed (open **Terminal** and run):

```bash
node -v      # need v18 or higher — if missing: https://nodejs.org (download LTS)
git --version
```

### Path A — Instant demo (no keys, no database) ✅ recommended for the demo

The app ships with a built-in **demo mode**. If there is no database configured, it automatically serves realistic in-memory data for all three business types and uses smart canned AI responses. **No MongoDB, no API keys, nothing to set up.**

```bash
git clone https://github.com/AshutoshNewel/paytm.git hisaab
cd hisaab
npm install
npm run dev
```

Then open **http://localhost:3000** in your browser.

> If port 3000 is busy it will use 3001 — the terminal prints the exact URL.

Log in with any of the demo accounts below (OTP is always **1234**). Everything works: dashboard, dues, bills, stock, the AI chat, and the admin panel. This is the safe, zero-dependency way to run the demo.

| Phone | OTP | Owner | Business |
|-------|-----|-------|----------|
| 9999999001 | 1234 | Ramesh Gupta | Kirana Store |
| 9999999002 | 1234 | Sunita Patil | Tuition Classes |
| 9999999003 | 1234 | Abdul Rashid | Tailor |

You can also create a fresh account — enter any 10-digit number, OTP `1234`.

---

### Path B — Full live mode (real AI + real database)

Do this **only** when you have the real API keys and want live AI responses and persistent data. See [TOMORROW.md](TOMORROW.md) for the exact demo-day checklist.

1. Create your env file from the template:
   ```bash
   cp .env.local.example .env.local
   ```
2. Open `.env.local` and fill in your real values:
   ```
   PAYTM_INFERENCE_URL=https://your-paytm-endpoint/v1
   PAYTM_INFERENCE_KEY=your_paytm_key
   SARVAM_API_URL=https://api.sarvam.ai
   SARVAM_API_KEY=your_sarvam_key
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/hisaab
   NEXT_PUBLIC_APP_NAME=Hisaab
   ```
   > Keep `/hisaab` at the end of the MongoDB URI — that's the database name.
3. Load demo data into your real database:
   ```bash
   npm run seed
   ```
4. Start the app:
   ```bash
   npm run dev
   ```

**The switch is automatic.** The moment `MONGODB_URI` is set, the app uses MongoDB instead of the in-memory store. The moment `PAYTM_INFERENCE_KEY` is a real key (not the placeholder), it calls live AI. No code changes — just the env file.

---

## How "demo mode" works (so you can trust it)

| Condition | Behaviour |
|-----------|-----------|
| `MONGODB_URI` empty / missing | Data served from an in-memory store seeded from the `mock/*.json` files. Changes persist for the session. |
| `MONGODB_URI` set | Real MongoDB via Mongoose. |
| `PAYTM_INFERENCE_KEY` missing or `placeholder` | AI features (briefing, chat, reminders, udhaar voice extraction) return realistic canned responses in the selected language. |
| `PAYTM_INFERENCE_KEY` is a real key | Live Paytm Inference API calls. |
| `SARVAM_API_KEY` missing or `placeholder` | Voice input is disabled gracefully — typing always works. |

So: **with nothing configured, the whole app works end to end.** With real keys, it upgrades to live AI seamlessly.

---

## Admin panel

Open **http://localhost:3000/admin** (no login needed).

- **Seed Mock Data** — reload all demo data
- **Clear All Data** — reset to empty
- **API Health** — shows whether MongoDB / Paytm AI / Sarvam are live or in demo mode
- Merchant overview table for all registered users

Right before demoing, hit **Clear All Data** then **Seed Mock Data** for a clean, predictable state.

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router), TypeScript |
| Styling | Tailwind CSS (minimalist, shadcn-inspired), Inter font |
| Database | MongoDB Atlas via Mongoose (with in-memory fallback) |
| AI — LLM + Vision | Paytm Inference API (OpenAI-compatible) |
| AI — Speech | Sarvam API (STT + TTS) |
| Languages | English · हिंदी · मराठी |

---

## Project structure

```
hisaab/
├── app/                  # Pages + API routes (App Router)
│   ├── page.tsx          # Login / OTP flow
│   ├── dashboard/        # Home dashboard
│   ├── udhaar/           # Dues manager
│   ├── bills/            # Bill scanner
│   ├── inventory/        # Stock tracker
│   ├── ask/              # AI chat
│   ├── admin/            # Admin panel
│   └── api/              # Backend routes (auth, briefing, udhaar, bills, ...)
├── components/           # Navbar, MicButton, SummaryCard, cards, chat bubble
├── context/              # AppContext (user session + language)
├── lib/                  # mongodb, mockstore, paytm, sarvam, i18n
├── models/               # Mongoose schemas
├── mock/                 # Demo data for all 3 business types
└── scripts/seed.ts       # Seeds a real MongoDB
```

---

## Commands

| Command | What it does |
|---------|--------------|
| `npm install` | Install dependencies |
| `npm run dev` | Start dev server (http://localhost:3000) |
| `npm run build` | Production build |
| `npm start` | Run the production build |
| `npm run seed` | Seed a real MongoDB (live mode only) |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `npm install` fails | Confirm `node -v` ≥ 18. Retry with `npm install --legacy-peer-deps`. |
| Port 3000 in use | The app auto-switches to 3001 — check the terminal for the URL. Or run `npx next dev -p 3001`. |
| Voice input does nothing | Allow the microphone permission. Voice needs a real `SARVAM_API_KEY`; without it, type instead. |
| AI replies look generic | That's demo mode (no Paytm key). Add a real `PAYTM_INFERENCE_KEY` for live answers. |
| `npm run seed` errors | Only needed in live mode. Check `MONGODB_URI` (user, password, `/hisaab` suffix) and that Atlas Network Access allows your IP. |
| Want a clean slate | Admin panel → Clear All Data → Seed Mock Data. |

To stop the server, press `Ctrl + C` in the terminal.
