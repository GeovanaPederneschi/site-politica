import type { Metadata } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
})

const BASE_URL = 'https://atlantisul.vercel.app'
const SITE_DESCRIPTION =
  'Portal de ensaios e reflexões sobre política, economia, história, filosofia, direito e geopolítica.'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Atlantis Sul — Ensaios de Política, Filosofia e Direito',
    template: '%s | Atlantis Sul',
  },
  description: SITE_DESCRIPTION,
  keywords: ['política', 'filosofia', 'direito', 'economia', 'geopolítica', 'ensaios', 'Brasil'],
  authors: [{ name: 'João Arthur Mendes Castro' }],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: '/',
    siteName: 'Atlantis Sul',
    title: 'Atlantis Sul — Ensaios de Política, Filosofia e Direito',
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Atlantis Sul',
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
    },
  },
  verification: {
    google: 'FrFTxgTjyxyP-KIxmjRTvLXCMep-RqjxNfbczpskKXk',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Atlantis Sul',
  url: BASE_URL,
  description: SITE_DESCRIPTION,
  publisher: {
    '@type': 'Organization',
    name: 'Atlantis Sul',
    founder: {
      '@type': 'Person',
      name: 'João Arthur Mendes Castro',
    },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${playfair.variable} ${inter.variable}`}>
      <body className="bg-paper text-ink min-h-screen flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
