import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'EV Range Hero — Real-World Range Calculator',
  description:
    'Calculate your electric vehicle range under real-world conditions. Account for temperature, speed, terrain, load, and more.',
  keywords: 'EV range calculator, electric vehicle, range anxiety, battery range, EV calculator',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-grid antialiased">{children}</body>
    </html>
  )
}
