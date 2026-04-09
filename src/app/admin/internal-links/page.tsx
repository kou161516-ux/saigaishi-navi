import Link from 'next/link'
import { getAllDisasters } from '@/lib/disasters'
import { DisasterData, DisasterType } from '@/types/disaster'

export const revalidate = 3600

interface ClusterStat {
  type: DisasterType
  count: number
  avgLinks: number
  hubCount: number
}

interface IsolatedArticle {
  slug: string
  title: string
  type: DisasterType
  linkCount: number
  suggestions: { slug: string; title: string }[]
}

interface HubArticle {
  slug: string
  title: string
  type: DisasterType
  referenceCount: number
}

function buildReferenceMap(disasters: DisasterData[]): Map<string, number> {
  const refMap = new Map<string, number>()
  for (const d of disasters) {
    for (const related of d.relatedSlugs ?? []) {
      refMap.set(related, (refMap.get(related) ?? 0) + 1)
    }
  }
  return refMap
}

export default function InternalLinksPage() {
  const disasters = getAllDisasters()

  // セクション1: サイト全体の健全性
  const totalLinks = disasters.reduce((sum, d) => sum + (d.relatedSlugs?.length ?? 0), 0)
  const avgLinks = disasters.length > 0 ? totalLinks / disasters.length : 0
  const isolatedCount = disasters.filter((d) => (d.relatedSlugs?.length ?? 0) <= 2).length
  const hubCandidateCount = disasters.filter((d) => (d.relatedSlugs?.length ?? 0) >= 5).length

  // セクション2: クラスター別統計
  const typeMap = new Map<DisasterType, DisasterData[]>()
  for (const d of disasters) {
    const arr = typeMap.get(d.type) ?? []
    arr.push(d)
    typeMap.set(d.type, arr)
  }

  const clusterStats: ClusterStat[] = Array.from(typeMap.entries()).map(([type, items]) => {
    const total = items.reduce((s, d) => s + (d.relatedSlugs?.length ?? 0), 0)
    const avg = items.length > 0 ? total / items.length : 0
    const hubs = items.filter((d) => (d.relatedSlugs?.length ?? 0) >= 5).length
    return { type, count: items.length, avgLinks: avg, hubCount: hubs }
  })
  clusterStats.sort((a, b) => b.count - a.count)

  // セクション3: 孤立記事一覧
  const isolatedArticles: IsolatedArticle[] = disasters
    .filter((d) => (d.relatedSlugs?.length ?? 0) <= 2)
    .map((d) => {
      const sameType = disasters
        .filter((other) => other.type === d.type && other.slug !== d.slug)
        .slice(0, 3)
        .map((other) => ({ slug: other.slug, title: other.title }))
      return {
        slug: d.slug,
        title: d.title,
        type: d.type,
        linkCount: d.relatedSlugs?.length ?? 0,
        suggestions: sameType,
      }
    })

  // セクション4: ハブ記事ランキング
  const refMap = buildReferenceMap(disasters)
  const hubRanking: HubArticle[] = disasters
    .map((d) => ({
      slug: d.slug,
      title: d.title,
      type: d.type,
      referenceCount: refMap.get(d.slug) ?? 0,
    }))
    .sort((a, b) => b.referenceCount - a.referenceCount)
    .slice(0, 10)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6 flex items-center gap-3">
          <Link
            href="/admin"
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            ← 管理ダッシュボード
          </Link>
        </div>
        <h1 className="mb-2 text-2xl font-bold text-gray-900">内部リンク戦略ダッシュボード</h1>
        <p className="mb-8 text-sm text-gray-500">全{disasters.length}記事の内部リンク健全性を分析</p>

        {/* セクション1: サイト全体の健全性 */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            セクション1: サイト全体の内部リンク健全性
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">平均relatedSlugs件数</p>
              <p className="mt-1 text-3xl font-bold text-gray-900">
                {avgLinks.toFixed(1)}
                <span className="ml-1 text-base font-normal text-gray-500">件</span>
              </p>
            </div>
            <div className="rounded-lg border border-red-200 bg-red-50 p-5 shadow-sm">
              <p className="text-sm text-red-700">孤立リスク記事（2件以下）</p>
              <p className="mt-1 text-3xl font-bold text-red-700">
                {isolatedCount}
                <span className="ml-1 text-base font-normal">件</span>
              </p>
            </div>
            <div className="rounded-lg border border-green-200 bg-green-50 p-5 shadow-sm">
              <p className="text-sm text-green-700">ハブ候補記事（5件以上）</p>
              <p className="mt-1 text-3xl font-bold text-green-700">
                {hubCandidateCount}
                <span className="ml-1 text-base font-normal">件</span>
              </p>
            </div>
          </div>
        </section>

        {/* セクション2: クラスター別内部リンク密度 */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            セクション2: クラスター別内部リンク密度
          </h2>
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left font-medium text-gray-600">災害タイプ</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">記事数</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">平均リンク数</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">ハブ候補</th>
                </tr>
              </thead>
              <tbody>
                {clusterStats.map((stat, idx) => (
                  <tr
                    key={stat.type}
                    className={`border-b border-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                        {stat.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700">{stat.count}</td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`font-semibold ${
                          stat.avgLinks >= 3
                            ? 'text-green-700'
                            : stat.avgLinks >= 1
                              ? 'text-orange-600'
                              : 'text-red-600'
                        }`}
                      >
                        {stat.avgLinks.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700">{stat.hubCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* セクション3: 孤立記事一覧 */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            セクション3: 孤立記事一覧（要改善）
            <span className="ml-2 text-sm font-normal text-red-600">
              {isolatedArticles.length}件
            </span>
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {isolatedArticles.map((article) => (
              <div
                key={article.slug}
                className="rounded-lg border border-red-200 bg-white p-4 shadow-sm"
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-gray-900">{article.title}</p>
                    <p className="text-xs text-gray-400">{article.slug}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                    {article.linkCount}件
                  </span>
                </div>
                {article.suggestions.length > 0 && (
                  <div>
                    <p className="mb-1 text-xs font-medium text-gray-500">推奨追加リンク候補：</p>
                    <ul className="space-y-1">
                      {article.suggestions.map((s) => (
                        <li key={s.slug} className="text-xs text-blue-700">
                          → {s.title}
                          <span className="ml-1 text-gray-400">({s.slug})</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
            {isolatedArticles.length === 0 && (
              <p className="col-span-2 rounded-lg border border-gray-200 bg-white px-4 py-6 text-center text-gray-500">
                孤立リスクの記事はありません
              </p>
            )}
          </div>
        </section>

        {/* セクション4: ハブ記事ランキング */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            セクション4: ハブ記事ランキング TOP10
          </h2>
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left font-medium text-gray-600">順位</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">記事タイトル</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">タイプ</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">参照数</th>
                </tr>
              </thead>
              <tbody>
                {hubRanking.map((article, idx) => (
                  <tr
                    key={article.slug}
                    className={`border-b border-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <td className="px-4 py-3 text-center font-bold text-gray-500">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{article.title}</p>
                      <p className="text-xs text-gray-400">{article.slug}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                        {article.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-bold text-purple-700">{article.referenceCount}</span>
                      <span className="ml-1 text-xs text-gray-500">件から参照</span>
                    </td>
                  </tr>
                ))}
                {hubRanking.every((a) => a.referenceCount === 0) && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
                      まだ相互参照データがありません
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}
