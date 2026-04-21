import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getAllTags, getDisastersByTag } from '@/lib/disasters'
import DisasterCard from '@/components/disaster/DisasterCard'

export const dynamic = 'force-static'

export async function generateStaticParams() {
  const tags = getAllTags()
  return tags.map((tag) => ({ tag }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>
}): Promise<Metadata> {
  const { tag } = await params
  const decodedTag = decodeURIComponent(tag)
  const disasters = getDisastersByTag(decodedTag)
  if (disasters.length === 0) return {}
  return {
    title: `#${decodedTag} の災害一覧`,
    description: `「${decodedTag}」タグが付いた災害記事 ${disasters.length}件を一覧表示。過去の災害から防災の知識を学ぼう。`,
  }
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>
}) {
  const { tag } = await params
  const decodedTag = decodeURIComponent(tag)
  const disasters = getDisastersByTag(decodedTag)

  if (disasters.length === 0) notFound()

  return (
    <div>
      {/* Hero */}
      <div className="bg-navy-900 text-white py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <nav className="text-sm text-gray-400 mb-3">
            <Link href="/" className="hover:text-amber-400">ホーム</Link>
            <span className="mx-2">/</span>
            <Link href="/tags" className="hover:text-amber-400">タグ一覧</Link>
            <span className="mx-2">/</span>
            <span className="text-white">#{decodedTag}</span>
          </nav>
          <h1 className="text-3xl font-bold mb-2">
            <span className="text-amber-400">#</span>{decodedTag}
          </h1>
          <p className="text-gray-300">
            このタグの災害記事 {disasters.length}件
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {disasters.map((disaster) => (
            <DisasterCard key={disaster.slug} disaster={disaster} />
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/tags"
            className="inline-block border border-navy-900 text-navy-900 px-6 py-3 rounded-lg hover:bg-gray-100 transition font-medium text-sm mr-4"
          >
            タグ一覧に戻る
          </Link>
          <Link
            href="/disasters"
            className="inline-block bg-navy-900 text-white px-6 py-3 rounded-lg hover:bg-amber-500 transition font-medium text-sm"
          >
            全災害一覧を見る
          </Link>
        </div>
      </div>
    </div>
  )
}
