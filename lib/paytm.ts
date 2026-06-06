import OpenAI from 'openai'

const TEXT_MODEL = 'llama-3.3-70b-versatile'
const VISION_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct'

function isPlaceholder() {
  const key = process.env.PAYTM_INFERENCE_KEY
  return !key || key === 'placeholder'
}

function getClient() {
  return new OpenAI({
    apiKey: process.env.PAYTM_INFERENCE_KEY!,
    baseURL: process.env.PAYTM_INFERENCE_URL!,
  })
}

export interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface BusinessContext {
  businessType: string
  businessName: string
  ownerName: string
  totalDues?: number
  lowStockItems?: string[]
  pendingBillsAmount?: number
  recentActivity?: string[]
}

// ─── Mock responses (used when API key is not configured) ─────────────────────

function mockBriefing(ctx: BusinessContext, language: string): string {
  const name = ctx.ownerName.split(' ')[0]
  if (language === 'hi') {
    return `नमस्ते ${name} जी! आज आपके ₹${ctx.totalDues?.toLocaleString('en-IN') ?? 0} उधार बाकी हैं। ${ctx.lowStockItems?.length ? `${ctx.lowStockItems.slice(0, 2).join(' और ')} का स्टॉक कम हो रहा है।` : 'स्टॉक ठीक है।'} मेहनत करते रहें, आज का दिन अच्छा जाएगा! 💪`
  }
  if (language === 'mr') {
    return `नमस्कार ${name}! आज ₹${ctx.totalDues?.toLocaleString('en-IN') ?? 0} उधार बाकी आहे. ${ctx.lowStockItems?.length ? `${ctx.lowStockItems.slice(0, 2).join(' आणि ')} चा साठा कमी होत आहे.` : 'साठा ठीक आहे.'} आजचा दिवस चांगला जाईल!`
  }
  return `Good morning ${name}! You have ₹${ctx.totalDues?.toLocaleString('en-IN') ?? 0} in outstanding dues. ${ctx.lowStockItems?.length ? `${ctx.lowStockItems.slice(0, 2).join(' and ')} are running low.` : 'Stock levels look fine.'} ${ctx.pendingBillsAmount ? `Pending bills: ₹${ctx.pendingBillsAmount.toLocaleString('en-IN')}.` : ''} Have a productive day!`
}

function mockExtract(text: string): { name: string; amount: number; note: string } {
  const amountMatch = text.match(/(\d+(?:,\d+)?(?:\.\d+)?)\s*(?:rupees?|rs\.?|₹)?/i)
    || text.match(/(?:rs\.?|₹)\s*(\d+(?:,\d+)?)/i)
  const amount = amountMatch ? parseFloat(amountMatch[1].replace(',', '')) : 0

  const namePatterns = [
    /^([A-Z][a-z]+(?: [A-Z][a-z]+)?)/,
    /([A-Z][a-z]+(?: [A-Z][a-z]+)?)\s+(?:owes?|ka|ne|has)/i,
    /(?:from|to)\s+([A-Z][a-z]+(?: [A-Z][a-z]+)?)/i,
  ]
  let name = 'Unknown Customer'
  for (const pat of namePatterns) {
    const m = text.match(pat)
    if (m) { name = m[1]; break }
  }

  return { name, amount, note: text.slice(0, 80) }
}

function mockReminder(customerName: string, amount: number, days: number, businessName: string, language: string): string {
  if (language === 'hi') {
    return `नमस्ते ${customerName} जी,\n${businessName} से बोल रहे हैं। आपके ₹${amount} बाकी हैं${days > 0 ? ` (${days} दिन से)` : ''}। कृपया जल्दी भुगतान करें। 🙏`
  }
  if (language === 'mr') {
    return `नमस्कार ${customerName},\n${businessName} कडून सांगतो. तुमचे ₹${amount} बाकी आहेत${days > 0 ? ` (${days} दिवसांपासून)` : ''}. कृपया लवकर भरा. 🙏`
  }
  return `Hi ${customerName},\nThis is a reminder from ${businessName}. You have an outstanding balance of ₹${amount}${days > 0 ? ` (${days} days overdue)` : ''}. Kindly clear it at your earliest convenience. Thank you! 🙏`
}

function mockChat(messages: Message[], ctx: BusinessContext, language: string): string {
  const last = messages[messages.length - 1]?.content?.toLowerCase() ?? ''
  const lang = language

  if (last.includes('most') || last.includes('highest') || last.includes('zyada') || last.includes('जास्त') || last.includes('सबसे')) {
    const summary = `Based on your records, the customer with the highest outstanding due is your top debtor. Total dues: ₹${ctx.totalDues?.toLocaleString('en-IN') ?? 0}.`
    if (lang === 'hi') return `आपके रिकॉर्ड के अनुसार, कुल उधार ₹${ctx.totalDues?.toLocaleString('en-IN') ?? 0} है। सबसे ज्यादा बाकी वाले ग्राहक से पहले बात करें।`
    if (lang === 'mr') return `तुमच्या नोंदींनुसार, एकूण उधार ₹${ctx.totalDues?.toLocaleString('en-IN') ?? 0} आहे.`
    return summary
  }
  if (last.includes('stock') || last.includes('low') || last.includes('कम') || last.includes('कमी')) {
    const items = ctx.lowStockItems?.length ? ctx.lowStockItems.join(', ') : 'none'
    if (lang === 'hi') return `कम स्टॉक वाले आइटम: ${items || 'कोई नहीं'}। जल्दी ऑर्डर करें।`
    if (lang === 'mr') return `कमी स्टॉक: ${items || 'काहीही नाही'}.`
    return `Low stock items: ${items}. Consider reordering soon.`
  }
  if (last.includes('earn') || last.includes('income') || last.includes('कमा') || last.includes('कमाई')) {
    if (lang === 'hi') return `आपकी हाल की कमाई का विवरण देखने के लिए असली Paytm AI key की जरूरत है। अभी डेमो मोड में हैं।`
    return `To see detailed earnings analysis, connect your Paytm AI key. Currently in demo mode.`
  }
  if (last.includes('supplier') || last.includes('bill') || last.includes('owe') || last.includes('बाकी')) {
    if (lang === 'hi') return `आपके सप्लायर को कुल ₹${ctx.pendingBillsAmount?.toLocaleString('en-IN') ?? 0} बाकी है।`
    if (lang === 'mr') return `तुमच्या पुरवठादाराला ₹${ctx.pendingBillsAmount?.toLocaleString('en-IN') ?? 0} द्यायचे आहे.`
    return `You owe your suppliers a total of ₹${ctx.pendingBillsAmount?.toLocaleString('en-IN') ?? 0} in unpaid bills.`
  }

  if (lang === 'hi') return `मैं समझ गया। आपके ${ctx.businessName} में कुल ₹${ctx.totalDues?.toLocaleString('en-IN') ?? 0} उधार है। Paytm AI key मिलने के बाद और सटीक जवाब दे सकूंगा।`
  if (lang === 'mr') return `समजलो. ${ctx.businessName} मध्ये एकूण ₹${ctx.totalDues?.toLocaleString('en-IN') ?? 0} उधार आहे.`
  return `I understand. ${ctx.businessName} currently has ₹${ctx.totalDues?.toLocaleString('en-IN') ?? 0} in total dues and ₹${ctx.pendingBillsAmount?.toLocaleString('en-IN') ?? 0} in pending supplier bills. Connect your Paytm AI key tomorrow for full AI-powered answers.`
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function generateText(
  prompt: string,
  systemPrompt?: string,
  language?: string,
): Promise<string> {
  if (isPlaceholder()) {
    return `[Demo mode — Paytm AI key not configured. Prompt received: "${prompt.slice(0, 60)}..."]`
  }
  const langInstruction =
    language === 'hi' ? 'Respond in Hindi (Devanagari script).' :
    language === 'mr' ? 'Respond in Marathi (Devanagari script).' : 'Respond in English.'
  const msgs: OpenAI.Chat.ChatCompletionMessageParam[] = []
  if (systemPrompt) msgs.push({ role: 'system', content: `${systemPrompt}\n${langInstruction}` })
  msgs.push({ role: 'user', content: prompt })
  const res = await getClient().chat.completions.create({ model: TEXT_MODEL, messages: msgs, temperature: 0.7, max_tokens: 1024 })
  return res.choices[0]?.message?.content ?? ''
}

export async function analyzeImage(base64Image: string, prompt: string): Promise<string> {
  if (isPlaceholder()) {
    return JSON.stringify({
      vendorName: 'Demo Vendor',
      billDate: new Date().toLocaleDateString('en-IN'),
      items: [
        { name: 'Item A', quantity: 2, unit: 'pcs', price: 500 },
        { name: 'Item B', quantity: 1, unit: 'kg', price: 300 },
      ],
      totalAmount: 800,
      notes: 'Demo mode — real bill scanning requires Paytm AI key',
    })
  }
  const res = await getClient().chat.completions.create({
    model: VISION_MODEL,
    messages: [{
      role: 'user',
      content: [
        { type: 'text', text: `${prompt}\n\nIMPORTANT: Extract ALL data fields in English only. Return as valid JSON.` },
        { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } },
      ],
    }],
    max_tokens: 2048,
  })
  return res.choices[0]?.message?.content ?? ''
}

export async function chatWithContext(
  messages: Message[],
  context: BusinessContext,
  language = 'en',
): Promise<string> {
  if (isPlaceholder()) return mockChat(messages, context, language)

  const langStr =
    language === 'hi' ? 'Hindi (Devanagari script)' :
    language === 'mr' ? 'Marathi (Devanagari script)' : 'English'

  const systemPrompt = `You are Hisaab, an AI business assistant for Indian small business owners.
You are helping ${context.ownerName}, owner of "${context.businessName}" (${context.businessType}).
Current data: dues ₹${context.totalDues ?? 0}, pending bills ₹${context.pendingBillsAmount ?? 0}, low stock: ${context.lowStockItems?.join(', ') || 'none'}.
Recent: ${context.recentActivity?.join('; ') || 'none'}.
Rules: respond in ${langStr}. Use ₹ symbol. Be concise and friendly.`

  const oaiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ]
  const res = await getClient().chat.completions.create({ model: TEXT_MODEL, messages: oaiMessages, temperature: 0.7, max_tokens: 1024 })
  return res.choices[0]?.message?.content ?? ''
}

export async function generateMorningBriefing(context: BusinessContext, language = 'en'): Promise<string> {
  if (isPlaceholder()) return mockBriefing(context, language)
  const langStr = language === 'hi' ? 'Hindi' : language === 'mr' ? 'Marathi' : 'English'
  const prompt = `Generate a warm, concise morning briefing for ${context.ownerName} of "${context.businessName}". Include: dues ₹${context.totalDues}, low stock: ${context.lowStockItems?.join(', ') || 'none'}, pending bills ₹${context.pendingBillsAmount}. Under 80 words. ${langStr}. Use ₹.`
  return generateText(prompt, undefined, language)
}

export async function extractUdhaarFromText(text: string): Promise<{ name: string; amount: number; note: string }> {
  if (isPlaceholder()) return mockExtract(text)
  const prompt = `Extract udhaar details from: "${text}"\nReturn JSON: { "name": "English name", "amount": number, "note": "English note" }\nOnly JSON, nothing else.`
  const result = await generateText(prompt)
  try {
    const m = result.match(/\{[\s\S]*\}/)
    if (m) return JSON.parse(m[0])
  } catch {}
  return { name: 'Unknown Customer', amount: 0, note: text }
}

export async function generateReminder(
  customerName: string, amount: number, daysOverdue: number,
  businessName: string, language = 'en',
): Promise<string> {
  if (isPlaceholder()) return mockReminder(customerName, amount, daysOverdue, businessName, language)
  const langStr = language === 'hi' ? 'Hindi' : language === 'mr' ? 'Marathi' : 'English'
  const prompt = `Polite WhatsApp reminder. Business: ${businessName}. Customer: ${customerName}. Due: ₹${amount}. Overdue: ${daysOverdue} days. Language: ${langStr}. 2-3 lines, friendly.`
  return generateText(prompt, undefined, language)
}
