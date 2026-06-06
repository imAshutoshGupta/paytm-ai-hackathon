import type { Metadata } from 'next'
import { DM_Sans, Noto_Sans_Devanagari } from 'next/font/google'
import './globals.css'
import { AppProvider } from '@/context/AppContext'
import { ChurnProvider } from '@/context/ChurnContext'
import { ToastProvider } from '@/components/Toast'
import AppShell from '@/components/AppShell'
import { APP_NAME, APP_TAGLINE } from '@/lib/brand'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const noto = Noto_Sans_Devanagari({
  subsets: ['devanagari'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto',
  display: 'swap',
})

export const metadata: Metadata = {
  title: `${APP_NAME} — ${APP_TAGLINE}`,
  description:
    'Predict customer churn from Paytm QR transaction data and win customers back with AI-generated messages.',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${noto.variable}`}>
      <body className="bg-canvas text-slate antialiased">
        <AppProvider>
          <ToastProvider>
            <ChurnProvider>
              <AppShell>{children}</AppShell>
            </ChurnProvider>
          </ToastProvider>
        </AppProvider>
      </body>
    </html>
  )
}
