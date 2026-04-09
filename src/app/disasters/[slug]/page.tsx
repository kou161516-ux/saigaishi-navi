import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import {
  getAllSlugs,
  getDisasterBySlug,
  getRelatedDisasters,
} from '@/lib/disasters'
import Breadcrumb from '@/components/ui/Breadcrumb'
import TableOfContents from '@/components/ui/TableOfContents'
import LessonBox from '@/components/disaster/LessonBox'
import PreparednessBox from '@/components/disaster/PreparednessBox'
import AffiliateBox from '@/components/affiliate/AffiliateBox'
import AdSense from '@/components/ads/AdSense'
import DisasterCard from '@/components/disaster/DisasterCard'

const typeLabels: Record<string, string> = {
  earthquake: '地震',
  tsunami: '津波',
  typhoon: '台風',
  flood: '洪水・豪雨',
  landslide: '土砂崩れ',
  volcano: '火山',
  fire: '火災',
  snowstorm: '大雪',
  heatwave: '熱波',
  other: 'その他',
}

const typeColors: Record<string, string> = {
  earthquake: 'bg-red-100 text-red-800',
  tsunami: 'bg-blue-100 text-blue-800',
  typhoon: 'bg-purple-100 text-purple-800',
  flood: 'bg-blue-100 text-blue-800',
  landslide: 'bg-yellow-100 text-yellow-800',
  volcano: 'bg-orange-100 text-orange-800',
  fire: 'bg-red-100 text-red-800',
  snowstorm: 'bg-gray-100 text-gray-800',
  heatwave: 'bg-yellow-100 text-yellow-800',
  other: 'bg-gray-100 text-gray-800',
}

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const disaster = getDisasterBySlug(slug)
  if (!disaster) return {}
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || 'https://saigaishi-navi.vercel.app'
  return {
    title: disaster.title,
    description:
      disaster.metaDescription ||
      disaster.summary.slice(0, 160),
    openGraph: {
      title: `${disaster.title} | 災害史ナビ`,
      description: disaster.metaDescription || disaster.summary.slice(0, 160),
      url: `${siteUrl}/disasters/${disaster.slug}`,
      type: 'article',
      locale: 'ja_JP',
    },
    twitter: {
      card: 'summary_large_image',
      title: disaster.title,
      description: disaster.metaDescription || disaster.summary.slice(0, 160),
    },
    alternates: {
      canonical: `${siteUrl}/disasters/${disaster.slug}`,
    },
  }
}

const tocItems = [
  { id: 'summary', label: '概要' },
  { id: 'damage', label: '被害の状況' },
  { id: 'background', label: '原因・背景' },
  { id: 'lessons', label: 'この災害が残した教訓' },
  { id: 'preparedness', label: '今日からできる備え' },
  { id: 'sources', label: '出典・参考' },
]

export default async function DisasterDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const disaster = getDisasterBySlug(slug)
  if (!disaster) notFound()

  const related = getRelatedDisasters(disaster.slug, 3)
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || 'https://saigaishi-navi.vercel.app'

  const formattedDate = format(new Date(disaster.date), 'yyyy年M月d日（EEE）', {
    locale: ja,
  })

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: disaster.title,
    datePublished: disaster.publishedAt,
    dateModified: disaster.updatedAt || disaster.publishedAt,
    description: disaster.metaDescription || disaster.summary,
    publisher: {
      '@type': 'Organization',
      name: '災害史ナビ',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/disasters/${disaster.slug}`,
    },
    about: {
      '@type': 'Event',
      name: disaster.title,
      startDate: disaster.date,
      location: {
        '@type': 'Place',
        name: disaster.region,
      },
    },
    keywords: disaster.tags.join(', '),
    articleSection: '防災',
    inLanguage: 'ja',
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'ホーム',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: '災害一覧',
        item: `${siteUrl}/disasters`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: disaster.title,
        item: `${siteUrl}/disasters/${disaster.slug}`,
      },
    ],
  }

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Hero */}
      <div className="bg-navy-900 text-white py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <Breadcrumb
            items={[
              { label: 'ホーム', href: '/' },
              { label: '災害一覧', href: '/disasters' },
              { label: disaster.title },
            ]}
          />
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span
              className={`text-sm font-medium px-3 py-1 rounded-full ${typeColors[disaster.type] || typeColors.other}`}
            >
              {typeLabels[disaster.type] || disaster.type}
            </span>
            {disaster.magnitude && (
              <span className="text-sm bg-white/10 px-3 py-1 rounded-full">
                {disaster.magnitude}
              </span>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">{disaster.title}</h1>
          {disaster.titleEn && (
            <p className="text-gray-400 text-sm mb-3">{disaster.titleEn}</p>
          )}
          <div className="flex flex-wrap gap-4 text-sm text-gray-300">
            <span>📅 {formattedDate}</span>
            <span>📍 {disaster.region}</span>
            {disaster.deaths !== undefined && (
              <span>
                👥 死者 {disaster.deaths.toLocaleString()}人
                {disaster.missing ? ` / 行方不明 ${disaster.missing.toLocaleString()}人` : ''}
              </span>
            )}
          </div>
          {disaster.economicLoss && (
            <p className="text-sm text-gray-300 mt-2">
              💰 経済的損失: {disaster.economicLoss}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* AdSense - 記事上部 */}
        {/* 本番前にスロットIDを差し替えてください */}
        <AdSense slot="1111111111" format="auto" className="mb-6" />

        {/* Summary */}
        <section id="summary" className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-3 pb-2 border-b border-gray-200">
            概要
          </h2>
          <p className="text-gray-700 leading-relaxed">{disaster.summary}</p>
        </section>

        {/* Table of Contents */}
        <TableOfContents items={tocItems} />

        {/* Damage */}
        <section id="damage" className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
            被害の状況
          </h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            {disaster.deaths !== undefined && (
              <div className="bg-red-50 rounded-lg p-4">
                <p className="text-xs text-red-600 font-medium mb-1">死者・行方不明</p>
                <p className="text-2xl font-bold text-red-800">
                  {(disaster.deaths + (disaster.missing || 0)).toLocaleString()}人
                </p>
                <p className="text-xs text-red-600 mt-1">
                  死者 {disaster.deaths.toLocaleString()}人
                  {disaster.missing ? ` / 行方不明 ${disaster.missing.toLocaleString()}人` : ''}
                </p>
              </div>
            )}
            {disaster.buildings && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-600 font-medium mb-1">建物被害</p>
                <p className="text-sm font-bold text-gray-800">{disaster.buildings}</p>
              </div>
            )}
          </div>
          <p className="text-gray-700 leading-relaxed">{disaster.damage}</p>
          {disaster.lifeline && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
              <p className="font-bold text-yellow-800 text-sm mb-2">ライフライン被害</p>
              <p className="text-sm text-yellow-900">{disaster.lifeline}</p>
            </div>
          )}
        </section>

        {/* Background */}
        <section id="background" className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
            原因・背景
          </h2>
          <p className="text-gray-700 leading-relaxed">{disaster.background}</p>
          {disaster.socialContext && (
            <>
              <h3 className="font-bold text-gray-800 mt-4 mb-2">当時の社会状況</h3>
              <p className="text-gray-700 leading-relaxed">{disaster.socialContext}</p>
            </>
          )}
        </section>

        {/* Lessons */}
        <section id="lessons" className="mb-8">
          <LessonBox lessons={disaster.lessons} />
        </section>

        {/* Preparedness */}
        <section id="preparedness" className="mb-8">
          <PreparednessBox preparedness={disaster.preparedness} />
        </section>

        {/* Affiliate */}
        <AffiliateBox category={disaster.affiliateCategory} />

        {/* AdSense - 記事下部 */}
        {/* 本番前にスロットIDを差し替えてください */}
        <AdSense slot="2222222222" format="auto" className="my-6" />

        {/* Tags */}
        {disaster.tags.length > 0 && (
          <div className="mb-8">
            <p className="text-sm font-medium text-gray-600 mb-2">タグ:</p>
            <div className="flex flex-wrap gap-2">
              {disaster.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/tags/${encodeURIComponent(tag)}`}
                  className="bg-gray-100 hover:bg-amber-100 hover:text-amber-800 text-gray-600 text-xs px-3 py-1 rounded-full transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Sources */}
        <section id="sources" className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
            出典・参考資料
          </h2>
          <ul className="space-y-2">
            {disaster.sources.map((source, i) => (
              <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                <span className="text-gray-400 mt-0.5">▶</span>
                {source.url ? (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {source.title}
                  </a>
                ) : (
                  <span>{source.title}</span>
                )}
              </li>
            ))}
          </ul>
        </section>

        {/* Related */}
        {related.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                関連する災害
              </h2>
              <Link
                href={`/type/${disaster.type}`}
                className="text-sm text-amber-600 hover:text-amber-700 font-medium"
              >
                同じタイプの災害をもっと見る →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {related.map((d) => (
                <DisasterCard key={d.slug} disaster={d} />
              ))}
            </div>
          </section>
        )}

        {/* Back link */}
        <div className="text-center mt-8">
          <Link
            href="/disasters"
            className="inline-block bg-navy-900 text-white px-8 py-3 rounded-lg hover:bg-navy-800 transition font-medium"
          >
            ← 災害一覧に戻る
          </Link>
        </div>
      </div>
    </div>
  )
}
