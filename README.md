# WinBack — Customer Churn Predictor for Paytm for Business

Every Paytm merchant sits on a goldmine: the QR transaction history of every customer
who has ever paid them. **WinBack** mines it to answer one question the merchant can't
answer alone — *"which of my regulars are quietly slipping away?"* — and then writes the
message to bring them back.

- **Churn engine** scores each customer on their *own* visit rhythm (recency × frequency),
  not a flat "30 days" rule.
- **AI win-back** generates a warm, personal message (Paytm Inference LLM) in
  English / Hindi / Hinglish.
- **Voice note** turns that message into a WhatsApp-ready audio clip (Sarvam TTS).
- Built on the existing Paytm merchant stack — extends it, doesn't replace it.

> Product name is configurable — set `NEXT_PUBLIC_APP_NAME` in `.env`.

## Run

```bash
npm install
npm run dev          # http://localhost:3000
```

Login with OTP `1234`:

| Phone | Merchant | Type |
|-------|----------|------|
| 9999999001 | Sharma Kirana Store | Kirana |
| 9999999002 | Glow Unisex Salon | Salon |

Runs fully in **demo mode** with no database and no keys (in-memory data + canned AI).
Add real `PAYTM_INFERENCE_KEY` / `SARVAM_API_KEY` for live AI, and a `MONGODB_URI`
(then `npm run seed`) for persistence — each upgrades independently.

## Stack

Next.js 14 (App Router) · TypeScript · Tailwind (Paytm for Business design) ·
MongoDB/Mongoose with in-memory fallback · Paytm Inference API · Sarvam TTS.

See **[BUILD_NOTES.md](BUILD_NOTES.md)** for the churn model, the AI integration, and a
full reused-vs-added breakdown.
