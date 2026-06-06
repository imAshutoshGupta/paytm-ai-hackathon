import type { Metadata } from 'next'
import { Inter, Noto_Sans_Devanagari } from 'next/font/google'
import './globals.css'
import { AppProvider } from '@/context/AppContext'
import Navbar from '@/components/Navbar'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const noto = Noto_Sans_Devanagari({
  subsets: ['devanagari'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Hisaab — AI Business Assistant',
  description:
    'AI-powered business assistant for Indian small businesses. Track dues, scan bills, manage stock.',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${noto.variable}`}>
      <body className="bg-background text-ink antialiased">
        <AppProvider>
          <Navbar />
          <main className="page-content min-h-screen">{children}</main>
        </AppProvider>
      </body>
    </html>
  )
}
