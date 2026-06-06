import OpenAI from 'openai'

// Paytm Inference is OpenAI-compatible:
//   Base URL : https://api.inference.paytm.com/v1
//   Auth     : Authorization: Bearer <PAYTM_INFERENCE_KEY>  (sent by the OpenAI SDK)
//   Endpoint : POST /chat/completions
// Model is configurable via env so it can be swapped without code changes.
const TEXT_MODEL = process.env.PAYTM_INFERENCE_MODEL || 'llama-3.3-70b-versatile'

export function getInferenceModel() { return TEXT_MODEL }

function isPlaceholder() {
  const key = process.env.PAYTM_INFERENCE_KEY
  return !key || key === 'placeholder'
}

function getClient() {
  return new OpenAI({
    apiKey: process.env.PAYTM_INFERENCE_KEY!,
    baseURL: process.env.PAYTM_INFERENCE_URL || 'https://api.inference.paytm.com/v1',
  })
}

// ─── AI churn scoring ─────────────────────────────────────────────────────────

export interface ChurnFeature {
  id: string
  visits: number
  recencyDays: number
  avgGapDays: number
  avgSpend: number
}
export interface ChurnVerdict {
  id: string
  churnPct: number
  reason: string
}

const CHURN_BATCH = 12

function extractJsonArray(text: string): unknown[] | null {
  const m = text.match(/\[[\s\S]*\]/)
  if (!m) return null
  try { return JSON.parse(m[0]) } catch { return null }
}

async function scoreChunk(features: ChurnFeature[], businessType: string): Promise<ChurnVerdict[]> {
  const system = `You are a customer-retention analyst for an Indian ${businessType} business that accepts payments via Paytm QR.
For each customer, estimate churn risk as a probability 0-100, judged mainly on whether they have broken their OWN visit rhythm:
- recencyDays much larger than their avgGapDays => high risk (they are overdue for a visit)
- still within their usual gap => low risk, even if they visit rarely
- more past visits (loyalty) slightly lowers risk
Return ONLY a compact JSON array, one object per customer, no prose:
[{"id":"<id>","churnPct":<0-100>,"reason":"<max 12 words, specific to this customer>"}]`

  const user = `Customers:\n${JSON.stringify(features)}`

  const res = await getClient().chat.completions.create({
    model: TEXT_MODEL,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    temperature: 0.2,
    max_tokens: 2048,
  })
  const arr = extractJsonArray(res.choices[0]?.message?.content ?? '')
  if (!arr) throw new Error('Could not parse churn JSON')
  return arr
    .map((o) => {
      const v = o as Record<string, unknown>
      const pct = Math.max(0, Math.min(100, Math.round(Number(v.churnPct))))
      if (!v.id || Number.isNaN(pct)) return null
      return { id: String(v.id), churnPct: pct, reason: String(v.reason ?? '').slice(0, 120) }
    })
    .filter((x): x is ChurnVerdict => x !== null)
}

/**
 * AI-scores all customers via Paytm Inference. Returns a verdict per customer id.
 * Returns null when no key is configured (caller falls back to the heuristic).
 * Any individual batch that fails is skipped (those customers fall back too).
 */
export async function scoreChurnAI(
  features: ChurnFeature[],
  businessType: string,
): Promise<ChurnVerdict[] | null> {
  if (isPlaceholder()) return null

  const chunks: ChurnFeature[][] = []
  for (let i = 0; i < features.length; i += CHURN_BATCH) chunks.push(features.slice(i, i + CHURN_BATCH))

  const results = await Promise.all(
    chunks.map((c) => scoreChunk(c, businessType).catch(() => [] as ChurnVerdict[])),
  )
  return results.flat()
}

export type WinBackLanguage = 'en' | 'hi' | 'hinglish'

export interface WinBackInput {
  customerName: string
  merchantName: string
  businessName: string
  businessType: string
  lastAmount: number
  recencyDays: number
  language: WinBackLanguage
}

// ─── Mock responses (used when Paytm key is not configured) ───────────────────

function mockWinBack(i: WinBackInput): string {
  const first = i.customerName.split(' ')[0]
  if (i.language === 'hi') {
    return `नमस्ते ${first} जी! ${i.businessName} से बात कर रहे हैं। काफ़ी दिनों से आप नहीं आए। इस हफ़्ते आइए — आपके लिए 15% की छूट रखी है। 🙏 — ${i.merchantName}`
  }
  if (i.language === 'hinglish') {
    return `Hi ${first}! ${i.businessName} se ${i.merchantName} bol raha hoon. Bahut din ho gaye aapko aaye hue 😊 Is week aaiye, aapke liye 15% off rakha hai! — ${i.merchantName}`
  }
  return `Hi ${first}! It's ${i.merchantName} from ${i.businessName}. We've missed you these past ${i.recencyDays} days. Come by this week and enjoy 15% off your next visit! 🙏`
}

// ─── Public API ───────────────────────────────────────────────────────────────

const LANG_NAME: Record<WinBackLanguage, string> = {
  en: 'English',
  hi: 'Hindi (Devanagari script)',
  hinglish: 'Hinglish (Hindi written in Roman/English letters)',
}

export async function generateWinBack(input: WinBackInput): Promise<string> {
  if (isPlaceholder()) return mockWinBack(input)

  const system = `You are a friendly Indian shopkeeper. Write a short, warm win-back SMS (max 160 characters) in ${LANG_NAME[input.language]} to bring back a customer who hasn't visited in ${input.recencyDays} days. Offer a small discount. Keep it personal, never salesy. Sign off as ${input.merchantName}. Return a single SMS string only — no quotes, no preamble.`

  const user = `Customer: ${input.customerName}, Last purchase: ₹${input.lastAmount}, Business: ${input.businessName} (${input.businessType}), Days away: ${input.recencyDays}`

  const res = await getClient().chat.completions.create({
    model: TEXT_MODEL,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    temperature: 0.8,
    max_tokens: 200,
  })
  return (res.choices[0]?.message?.content ?? '').trim() || mockWinBack(input)
}
