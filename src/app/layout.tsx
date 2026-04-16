import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Mon Surnom JEF 2026',
  description: 'Génère ton badge personnalisé pour la JEF 2026 — FLLAC UAC',
  openGraph: {
    title: 'Mon Surnom JEF 2026 🎓',
    description: 'Le jeu viral de la JEF 2026 · Génère ton surnom et découvre ton duo mystère ! · FLLAC · UAC',
    images: [
  {
    url: '/renato.png?v=2',   // ← ajoute ?v=2
    width: 1200,
    height: 630,
    alt: 'JEF 2026 — Mon Surnom',
  }
],
    type: 'website',
    locale: 'fr_FR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mon Surnom JEF 2026 🎓',
    description: 'Le jeu viral de la JEF 2026 · FLLAC · UAC',
    images: ['/renato.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}