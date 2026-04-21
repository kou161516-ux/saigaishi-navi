import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics'
import AdSenseScript from '@/components/ads/AdSenseScript'

const inter = Inter({ subsets: ['latin'] })

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://saigaishi-navi.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: '災害史ナビ | 日本と世界の災害から学ぶ防災サイト',
    template: '%s | 災害史ナビ',
  },
  description: '東日本大震災・阪神淡路大震災・伊勢湾台風など日本と世界の70件の重大災害史を収録。各災害の教訓と今日からできる備えを分かりやすく解説します。',
  keywords: ['防災', '災害', '地震', '津波', '台風', '洪水', '東日本大震災', '阪神淡路大震災', '能登半島地震', '備え'],
  verification: {
    google: process.env.NEXT_PUBLIC_SC_VERIFICATION,
  },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: siteUrl,
    siteName: '災害史ナビ',
    title: '災害史ナビ | 日本と世界の災害から学ぶ防災サイト',
    description: '70件の重大災害史から学ぶ防災サイト。教訓と備えを分かりやすく解説。',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@saigaishinavi',
    title: '災害史ナビ',
    description: '70件の重大災害史から学ぶ防災サイト',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={`${inter.className} bg-gray-50`}>
        <AdSenseScript />
        <GoogleAnalytics />
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
