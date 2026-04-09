import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics'
import AdSenseScript from '@/components/ads/AdSenseScript'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    template: '%s | 災害史ナビ',
    default: '災害史ナビ｜過去の災害から学ぶ、今日の備え',
  },
  description:
    '日本・世界の重大災害の歴史を学び、今日の備えにつなげる。防災・災害史の知識データベース。地震・津波・台風・豪雨など12の重大災害の教訓を収録。',
  verification: {
    google: process.env.NEXT_PUBLIC_SC_VERIFICATION,
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL || 'https://saigaishi-navi.vercel.app',
  },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://saigaishi-navi.vercel.app',
    siteName: '災害史ナビ',
    title: '災害史ナビ｜過去の災害から学ぶ、今日の備え',
    description:
      '日本・世界の重大災害の歴史を学び、今日の備えにつなげる。防災・災害史の知識データベース。',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@saigaishinavi',
    title: '災害史ナビ｜過去の災害から学ぶ、今日の備え',
    description:
      '日本・世界の重大災害の歴史を学び、今日の備えにつなげる。防災・災害史の知識データベース。',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <head>
        <AdSenseScript />
      </head>
      <body className={`${inter.className} bg-gray-50`}>
        <GoogleAnalytics />
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
