import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from '@/components/ui/toaster'

export const metadata: Metadata = {
  title: 'MediVault — Personal Health Records',
  description: 'Securely manage your health records, appointments, medications and documents — with AI-powered insights.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=DM+Mono:wght@400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased bg-stone-50 text-stone-900">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
