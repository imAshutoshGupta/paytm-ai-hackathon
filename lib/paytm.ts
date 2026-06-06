import OpenAI from 'openai'

// Paytm Inference is OpenAI-compatible:
//   Base URL : https://api.inference.paytm.com/v1
//   Auth     : Authorization: Bearer <PAYTM_INFERENCE_KEY>  (sent by the OpenAI SDK)
//   Endpoint : POST /chat/completions
// Model is configurable via env so it can be swapped without code changes.
const TEXT_MODEL = process.env.PAYTM_INFERENCE_MODEL || 'llama-3.3-70b-versatile'

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
