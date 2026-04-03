import type { Metadata } from 'next'
import './globals.css'
import { LanguageProvider } from '@/lib/i18n'
import { ThemeProvider } from '@/components/theme-provider'

export const metadata: Metadata = {
  title: 'TrueRange — Real-World Range Calculator',
  description:
    'Calculates real world EV range based on physics parameters. Account for temperature, speed, terrain, load, and more.',
  keywords: 'EV range calculator, electric vehicle, range anxiety, battery range, EV calculator',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark">
          <LanguageProvider>{children}</LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
