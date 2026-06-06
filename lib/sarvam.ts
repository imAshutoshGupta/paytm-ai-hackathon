import FormData from 'form-data'
import axios from 'axios'

function getBase(): string {
  return (process.env.SARVAM_API_URL || 'https://api.sarvam.ai').replace(/\/$/, '')
}

function getKey(): string {
  return process.env.SARVAM_API_KEY!
}

export async function speechToText(
  audioBuffer: Buffer,
  mimeType = 'audio/webm',
): Promise<string> {
  const base = getBase()
  const key = getKey()
  const form = new FormData()
  form.append('file', audioBuffer, {
    filename: 'audio.webm',
    contentType: mimeType,
  })
  form.append('model', 'saaras:v3')
  form.append('mode', 'transcribe')
  form.append('language_code', 'hi-IN')

  const res = await axios.post(`${base}/speech-to-text`, form, {
    headers: {
      ...form.getHeaders(),
      'api-subscription-key': key,
    },
    timeout: 30000,
  })
  return res.data?.transcript ?? res.data?.text ?? ''
}

export async function textToSpeech(
  text: string,
  languageCode = 'hi-IN',
): Promise<Buffer> {
  const base = getBase()
  const key = getKey()

  const res = await axios.post(
    `${base}/text-to-speech`,
    {
      inputs: [text.slice(0, 2500)],
      target_language_code: languageCode,
      speaker: 'anushka',
      model: 'bulbul:v3',
      pace: 1.0,
      enable_preprocessing: true,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': key,
      },
      timeout: 30000,
    },
  )

  const b64: string = res.data?.audios?.[0] ?? ''
  return Buffer.from(b64, 'base64')
}
