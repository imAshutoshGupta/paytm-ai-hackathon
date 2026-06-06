# WinBack — Build Notes

**Customer Churn Predictor for Paytm for Business.**
Predicts which customers are slipping away (from Paytm QR transaction patterns) and
generates AI win-back messages — as editable text and as a Sarvam voice note —
in English / Hindi / Hinglish.

> The product name is configurable. Set `NEXT_PUBLIC_APP_NAME` in `.env.local` to
> rename the entire UI (currently `WinBack`).

---

## Reused vs Added (audit)

### ✅ Reused as-is from the existing project base
| Piece | File | Notes |
|-------|------|-------|
| Sarvam TTS wrapper | `lib/sarvam.ts` (`textToSpeech`) | Powers win-back voice notes |
| Paytm Inference client | `lib/paytm.ts` (`getClient`, OpenAI-compatible) | Now points at `llama-3.3-70b-versatile` |
| Mongo connection + mock fallback | `lib/mongodb.ts` | `isMockMode()` switch kept |
| OTP auth flow | `app/api/auth/route.ts` | Adapted to merchant model |
| Next.js 14 App Router, Tailwind, TS setup | — | Build config reused |
| TTS API route | `app/api/sarvam/tts/route.ts` | Returns base64 WAV |

### 🆕 Added new
| Piece | File |
|-------|------|
| Churn scoring engine (recency × frequency) | `lib/churn.ts` |
| Configurable branding | `lib/brand.ts` |
| Customer data model | `models/Customer.ts` |
| Customers API (normalises mock + DB → churn input) | `app/api/customers/route.ts` |
| Win-back message generation | `app/api/winback/route.ts` + `generateWinBack()` |
| Shared churn state (engine run, sent status, persisted) | `context/ChurnContext.tsx` |
| Merchant session context | `context/AppContext.tsx` (rewritten) |
| Paytm-style shell (sidebar + topbar) | `components/AppShell.tsx` |
| Metric cards, customer table, explorer, engine banner, win-back modal, toasts | `components/*` |
| Login, Dashboard, Customers, Win-Back, Settings | `app/*/page.tsx` |
| Realistic seed data (2 merchants, 25 customers) | `mock/merchants.json` + `scripts/seed.ts` |
| Paytm for Business design tokens (DM Sans, navy/blue palette) | `tailwind.config.ts`, `app/globals.css` |

### 🗑 Stripped (old Hisaab bookkeeping)
- Pages: `udhaar`, `bills`, `inventory`, `ask`, `admin`
- API: `udhaar`, `udhaar/voice`, `bills`, `bills/scan`, `briefing`, `inventory`, `reminder`, `ask`, `sarvam/stt`
- Models: `Udhaar`, `Bill`, `Inventory`, `Transaction`
- Components: `UdhaarList`, `BillCard`, `InventoryItem`, `SummaryCard`, `ChatBubble`, `MicButton`, `Navbar`
- Data/i18n: `mock/kirana|tuition|tailor.json`, `lib/i18n.ts`

---

## Churn model
```
recency_days    = days since last visit
avg_gap_days    = mean gap between consecutive visits
frequency_score = transaction_count / max(transaction_count across customers)

base     = min(recency_days / (avg_gap_days * 2.5), 1.0)
churn_pct= round((base * 0.6 + (1 - frequency_score) * 0.4) * 100)
```
`>= 70` High · `45–69` Medium · `< 45` Active.
The score is **personal** — a monthly customer 5 weeks out is fine; a twice-weekly
customer 5 weeks out is a red alert.

## AI roles
- **Paytm Inference (LLM)** → writes the win-back message from customer context.
- **Sarvam (TTS)** → turns that message into a Hindi/English voice note for WhatsApp.
- Without keys, both fall back to realistic canned output so the demo always runs.

---

## Run
```bash
npm install
npm run dev        # http://localhost:3000
```
Demo logins (OTP always `1234`):
- `9999999001` — Sharma Kirana Store (kirana)
- `9999999002` — Glow Unisex Salon (salon)

**Live database (optional):** put a working Atlas URI in `MONGODB_URI`, run
`npm run seed`, restart. Empty `MONGODB_URI` = in-memory demo store (auto-seeded).

## 90-second demo
1. Login `9999999001` / `1234`
2. Dashboard → **Run Churn Engine** → customers score live, ~7 flagged
3. Sidebar Win-Back badge updates → open **Win-Back**
4. Pick a high-risk customer → **Generate** → AI Hinglish message appears
5. **Voice Note** → Sarvam reads it aloud → **Send via WhatsApp** → status flips to Sent
