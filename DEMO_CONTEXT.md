# Hisaab — Demo Context Sheet
### Paytm AI Hackathon, Mumbai — June 2026

---

## The Pitch (30 seconds)

> "250 million small business owners in India run on gut feel and paper notebooks. They can't afford an accountant, don't know how to use Excel, and lose thousands every month to forgotten dues and poor stock decisions. Hisaab gives every kirana owner, tuition teacher, and tailor an AI accountant in their pocket — that speaks Hindi, Marathi, and English — for free."

---

## The Problem

- A kirana owner forgets who owes him ₹500. He writes it in a notebook. The notebook gets lost.
- A tuition teacher collects fees in cash. She has no way to track who paid, who didn't.
- A tailor takes advance from 10 customers. He can't remember delivery dates without a physical diary.
- None of them have smartphones capable of using Tally, Zoho, or QuickBooks.
- None of them would sit and "learn software."

**Hisaab meets them where they are — voice-first, multilingual, zero learning curve.**

---

## What Hisaab Does (Feature by Feature)

### 1. Mocked OTP Login
- Enter any phone number → OTP is always `1234`
- Select business type: Kirana / Tuition / Tailor
- Enter name + business name → done, session stored in localStorage
- **Demo phones pre-seeded:** 9999999001 (Kirana), 9999999002 (Tuition), 9999999003 (Tailor)

### 2. Dashboard (`/dashboard`)
- Personalized greeting with business owner's name
- 4 live summary cards: Total Dues | Pending Bills | Low Stock Count | Today's Date
- Quick action buttons to all key features
- **AI Morning Briefing** — tap "Generate" → Paytm Inference API writes a personalized business summary in the selected language
- Recent activity feed

### 3. Udhaar Manager (`/udhaar`)
- Full list of all credit/dues with status (pending / partial / paid)
- **Voice input**: Tap mic → say "Ramesh ka 500 rupaye udhaar hai" → Sarvam STT transcribes → LLM extracts name + amount → saves to MongoDB in English
- Manual form fallback
- Mark as Paid button
- **AI Reminder**: Tap "Reminder" → LLM generates a polite WhatsApp message in selected language → copy to clipboard
- For tuition teachers: label changes to "Fee Dues"; for tailors: "Customer Advances"

### 4. Bill Scanner (`/bills`)
- Upload/drag-drop a photo of a paper distributor bill
- Paytm Inference vision API reads the image → extracts vendor, items, quantities, prices (all in English)
- Saves structured bill to MongoDB
- Natural language query box: "How much do I owe Sharma Wholesale?" → LLM answers from bill data
- Mark bills as paid

### 5. Stock Tracker (`/inventory`)
- Full inventory list with quantities and reorder thresholds
- Items at or below threshold highlighted in amber with warning icon
- **AI Stock Insight**: One-tap → LLM analyzes current stock and gives reorder recommendations in selected language
- Update quantity inline
- Business-type adaptive labels (Stock → Materials → Fabric & Supplies)

### 6. Ask Hisaab (`/ask`)
- Full conversational AI chat interface
- Voice or text input
- LLM has full context: all dues, bills, inventory, recent transactions
- Example questions it can answer:
  - "Who owes me the most money?"
  - "Which items will run out soon?"
  - "How much do I owe my suppliers?"
  - "What did I earn this week?"
- Responds in selected UI language (Hindi/Marathi/English)

### 7. Admin Panel (`/admin`)
- Live API health check: MongoDB ✓/✗ | Paytm AI ✓/✗ | Sarvam ✓/✗
- One-click **Seed Demo Data** button (loads all 3 business types)
- One-click **Clear All Data** button
- Merchant overview table (all registered users, sortable by dues/bills/txns)
- Demo login credentials displayed

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 App Router, TypeScript |
| Styling | Tailwind CSS, Glassmorphism, Framer Motion |
| Database | MongoDB Atlas via Mongoose |
| AI — LLM + Vision | Paytm Inference API (OpenAI-compatible) |
| AI — Speech | Sarvam API (saaras:v3 STT, bulbul:v3 TTS) |
| Auth | Mocked OTP (always 1234) |
| Language | EN / हिंदी / मराठी |
| Hosting | Local / Vercel-ready |

---

## Demo Script (Recommended Flow)

**Total time: ~5 minutes**

1. **Open `/admin`** → click "Seed Mock Data" (loads 30 days of realistic data)
2. **Login** with `9999999001`, OTP `1234` → select Kirana → Ramesh Gupta
3. **Dashboard** → switch language to Hindi → tap "Generate" on AI briefing → show the Hindi summary
4. **Udhaar page** → tap mic → say *"Suresh ka 300 rupaye udhaar hai"* → show auto-save
5. **Tap Reminder** on any pending entry → show WhatsApp-style message in Hindi
6. **Bills page** → upload any invoice photo → show AI parsing vendor + items
7. **Inventory** → show low stock items → tap "Get Insight" → show AI recommendation
8. **Ask Hisaab** → type "Who owes me the most?" → show contextual AI answer
9. **Switch to Marathi** (top-right toggle) → show UI instantly changes language
10. **Back to `/admin`** → switch to demo user 9999999003 → login as Abdul (Tailor) → show how entire UI adapts (labels change to "Customer Advances", "Fabric & Supplies" etc.)

---

## Key Differentiators to Highlight

1. **Voice-first in Indian languages** — not English-only like every other app
2. **Zero training required** — if you can speak, you can use it
3. **Business-type adaptive** — same app feels completely different for kirana vs tailor
4. **All data stored in English** — LLM extracts and normalizes regardless of input language
5. **End-to-end AI** — STT (Sarvam) + LLM extraction + vision scanning + chat (Paytm) all working together
6. **Offline-first UX** — localStorage session, no login required after first use

---

## Data Rules (for judges)

- All MongoDB data is **always stored in English** regardless of input language
- Voice in Hindi → Sarvam transcribes → LLM extracts English fields → stored in English
- UI switches language but source of truth never changes
- No real SMS/OTP, no real payments — hackathon demo scope only

---

## Environment Variables (optional)

The app runs fully in **demo mode with none of these set** — in-memory data + canned AI responses. Provide real values to upgrade to live AI and a persistent database (each upgrades independently).

```
PAYTM_INFERENCE_URL=   # Paytm inference endpoint
PAYTM_INFERENCE_KEY=   # Your Paytm AI key
SARVAM_API_URL=        # https://api.sarvam.ai
SARVAM_API_KEY=        # Your Sarvam key
MONGODB_URI=           # MongoDB Atlas connection string (empty = in-memory demo data)
```

See [README.md](README.md) to run it and [TOMORROW.md](TOMORROW.md) for the demo-day checklist.

---

## Folder Structure at a Glance

```
hisaab/
├── app/               ← All pages + API routes
├── components/        ← Reusable UI (Navbar, MicButton, BillCard, etc.)
├── context/           ← AppContext (user session + language state)
├── lib/               ← mongodb, mockstore, paytm, sarvam, i18n wrappers
├── models/            ← Mongoose schemas (User, Udhaar, Bill, Inventory, Transaction)
├── mock/              ← Realistic seed data for all 3 business types
└── scripts/           ← seed.ts for populating MongoDB
```
