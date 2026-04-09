import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllTags, getTagCounts } from '@/lib/disasters'

export const metadata: Metadata = {
  title: 'タグ一覧',
  description: '災害史ナビに収録された全タグの一覧。地震・津波・台風などテーマ別に災害記事を探せます。',
}

export default function TagsPage() {
  const tags = getAllTags()
  const tagCounts = getTagCounts()

  // タグを件数降順でソート
  const sortedTags = [...tags].sort(
    (a, b) => (tagCounts[b] || 0) - (tagCounts[a] || 0)
  )

  const maxCount = Math.max(...Object.values(tagCounts))

  return (
    <div>
      {/* Hero */}
      <div className="bg-navy-900 text-white py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <nav className="text-sm text-gray-400 mb-3">
            <Link href="/" className="hover:text-amber-400">ホーム</Link>
            <span className="mx-2">/</span>
            <span className="text-white">タグ一覧</span>
          </nav>
          <h1 className="text-3xl font-bold mb-2">タグ一覧</h1>
          <p className="text-gray-300">
            全 {tags.length} タグ収録
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* タグクラウド */}
        <section className="mb-10">
          <h2 className="text-lg font-bold text-gray-800 mb-4">タグクラウド</h2>
          <div className="flex flex-wrap gap-3">
            {sortedTags.map((tag) => {
              const count = tagCounts[tag] || 0
              // 件数に応じてフォントサイズを変える（12px〜20px）
              const fontSize = Math.round(12 + (count / maxCount) * 8)
              return (
                <Link
                  key={tag}
                  href={`/tags/${encodeURIComponent(tag)}`}
                  className="inline-flex items-center gap-1 bg-gray-100 hover:bg-amber-100 hover:text-amber-800 text-gray-700 px-3 py-1.5 rounded-full transition-colors"
                  style={{ fontSize: `${fontSize}px` }}
                >
                  <span className="text-amber-500">#</span>
                  {tag}
                  <span className="text-xs text-gray-400 ml-1">({count})</span>
                </Link>
              )
            })}
          </div>
        </section>

        {/* タグ一覧テーブル */}
        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-4">件数順一覧</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {sortedTags.map((tag, i) => {
              const count = tagCounts[tag] || 0
              const barPct = Math.round((count / maxCount) * 100)
              return (
                <Link
                  key={tag}
                  href={`/tags/${encodeURIComponent(tag)}`}
                  className="group bg-white border border-gray-200 rounded-lg p-3 hover:border-amber-400 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-800 group-hover:text-amber-700">
                      <span className="text-amber-400 mr-0.5">#</span>{tag}
                    </span>
                    <span className="text-xs text-gray-500 font-bold">{count}件</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full group-hover:bg-amber-500 transition-colors"
                      style={{ width: `${barPct}%` }}
                    />
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        <div className="mt-10 text-center">
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
