import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Script from 'next/script'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Cosmoxis - AI-Powered Receipt Scanning',
  description: 'Transform receipts into structured data instantly',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en' className={inter.variable}>
      <head>
        <Script
          defer
          src='https://static.cloudflareinsights.com/beacon.min.js'
          data-cf-beacon='{"token": "65ba5e9dd901442ba108ca4f1439711e"}'
        />
      </head>
      <body className='font-sans bg-background text-foreground antialiased min-h-screen'>
        {children}
      </body>
    </html>
  )
}
