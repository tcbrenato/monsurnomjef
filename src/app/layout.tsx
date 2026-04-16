import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Mon Surnom JEF 2026',
  description: 'Génère ton badge personnalisé pour la JEF 2026 — FLLAC UAC',
  openGraph: {
    title: 'Mon Surnom JEF 2026',
    description: 'Génère ton badge personnalisé pour la JEF 2026',
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}