# Demo Day Checklist — Paytm AI Hackathon

## 🛟 First, the safety net (read this)

**The app already runs with zero setup.** If anything goes wrong with keys or the database tomorrow, you can always fall back to:

```bash
cd hisaab
npm install
npm run dev
```

Open **http://localhost:3000**, log in with `9999999001` / OTP `1234`, and demo everything — dashboard, dues, bills, stock, AI chat, admin. It uses built-in demo data and smart canned AI responses. **No keys, no MongoDB needed.** This always works.

Everything below is to *upgrade* the demo to live AI + real database. If you run out of time, the safety net above is a perfectly good demo.

---

## The 3 things to do for the full live demo

1. Fill `.env.local` with real keys
2. Run `npm run seed`
3. `npm run dev` and verify

---

## Step 1 — Get your API keys

### Paytm Inference API
From the Paytm hackathon portal:
```
PAYTM_INFERENCE_URL=https://inference.paytm.com/v1   ← exact URL from portal
PAYTM_INFERENCE_KEY=ptm_xxxxxxxxxxxxxxxxxxxx
```

### Sarvam API
From https://dashboard.sarvam.ai → API Keys → Copy:
```
SARVAM_API_URL=https://api.sarvam.ai
SARVAM_API_KEY=your-sarvam-key
```

### MongoDB Atlas (do this tonight if you can)
1. https://cloud.mongodb.com → create a free **M0** cluster (~2 min)
2. **Database Access** → Add User → Read & Write → note username + password
3. **Network Access** → Add IP → Allow from Anywhere (`0.0.0.0/0`)
4. **Connect → Drivers** → copy the connection string:
   ```
   MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/hisaab
   ```
   Replace USERNAME/PASSWORD. Keep `/hisaab` at the end.

---

## Step 2 — Create and fill `.env.local`

```bash
cd hisaab
cp .env.local.example .env.local
```

Open `.env.local` and paste your real values:

```
PAYTM_INFERENCE_URL=https://YOUR-REAL-ENDPOINT/v1
PAYTM_INFERENCE_KEY=YOUR-REAL-PAYTM-KEY
SARVAM_API_URL=https://api.sarvam.ai
SARVAM_API_KEY=YOUR-REAL-SARVAM-KEY
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/hisaab
NEXT_PUBLIC_APP_NAME=Hisaab
```

Save. No code changes anywhere — the app switches to live mode automatically.

> Tip: To run a real database but keep canned AI (e.g. if only Mongo is ready), just leave the Paytm/Sarvam keys as the placeholder. Each service upgrades independently.

---

## Step 3 — Seed the database

```bash
npm run seed
```

Success looks like:
```
✓ Created user: Ramesh Gupta
✓ Seeded 15 udhaar entries
✓ Seeded 8 bills
...
✅ Seeding complete!
```

If it fails → it's almost always the `MONGODB_URI` (check username, password, `/hisaab` suffix, and Atlas Network Access).

---

## Step 4 — Start the server

```bash
npm run dev
```

Open **http://localhost:3000** — the login screen should load.

---

## Step 5 — Pre-demo verification (10 min)

- [ ] Login with `9999999001`, OTP `1234` → dashboard loads
- [ ] Dashboard → tap "Generate" → AI briefing appears
- [ ] Switch language to हिंदी → all labels change
- [ ] Udhaar page → 15 entries load
- [ ] Tap a pending entry → "Reminder" → WhatsApp message appears → Copy works
- [ ] Bills page → bill list loads
- [ ] Inventory → "Get Insight" → AI stock advice appears
- [ ] Ask Hisaab → "Who owes me the most?" → answer uses real data
- [ ] `/admin` → API Health: MongoDB / Paytm / Sarvam status shown

If a green tick is missing on `/admin`, that service is still in demo mode — re-check the matching key in `.env.local`, then refresh.

---

## Step 6 — Clean state right before going on stage

1. Go to **http://localhost:3000/admin**
2. **Clear All Data**
3. **Seed Mock Data**
4. Log in fresh as `9999999001`

---

## If something breaks on stage

| Problem | Fix |
|---------|-----|
| Anything AI-related fails | The app keeps working with canned responses — keep going |
| Database connection drops | App auto-falls back to in-memory demo data — no visible break |
| Voice input fails | Switch to typing — the text box is right there |
| Bill scan fails | Skip the upload, show the pre-seeded bills list |
| Server crashes | `npm run dev` again — back in ~3 seconds |
| Total meltdown | Remove/rename `.env.local`, `npm run dev` → guaranteed demo mode |
| Forgot the port | Terminal prints `Local: http://localhost:XXXX` |

---

## The 5-minute demo script

1. **Admin** → Seed Mock Data (30s)
2. **Login** `9999999001`, OTP `1234`, Kirana (30s)
3. **Dashboard** → switch to Hindi → Generate AI briefing → read it (45s)
4. **Udhaar** → mic → say *"Suresh ka 300 rupaye udhaar hai"* → it saves (60s)
5. **Udhaar** → Reminder on any entry → WhatsApp message → Copy (30s)
6. **Bills** → upload an invoice photo → it parses vendor + items (60s)
7. **Inventory** → low stock in amber → Get Insight → AI reorder advice (30s)
8. **Ask Hisaab** → "Who owes me the most?" → contextual answer (30s)
9. **Switch to Marathi** → labels change → login as `9999999003` (Tailor) → labels adapt to "Fabric & Supplies" (30s)

Stay ~5 seconds per screen so judges can read it.

---

## Numbers to know by heart

- App: **http://localhost:3000**
- OTP: always **1234**
- Demo phones: **9999999001** (Kirana) · **9999999002** (Tuition) · **9999999003** (Tailor)
- Admin: **http://localhost:3000/admin**
