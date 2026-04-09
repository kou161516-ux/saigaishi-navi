import Link from 'next/link'

export const dynamic = 'force-dynamic'

interface ArticleIssue {
  slug: string
  title: string
  score: number
  issues: string[]
  suggestions: string[]
}

interface ArticleScore {
  slug: string
  score: number
  title: string
}

interface ImproveData {
  generated: string
  totalArticles: number
  averageScore: number
  needsImprovement: ArticleIssue[]
  scores: ArticleScore[]
}

function ScoreBadge({ score }: { score: number }) {
  if (score >= 85) {
    return (
      <span className="inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">
        {score}点
      </span>
    )
  }
  if (score >= 60) {
    return (
      <span className="inline-block rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-800">
        {score}点
      </span>
    )
  }
  return (
    <span className="inline-block rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800">
      {score}点
    </span>
  )
}

function IssueBadge({ issue }: { issue: string }) {
  return (
    <span className="mr-1 mb-1 inline-block rounded bg-red-50 px-2 py-0.5 text-xs text-red-700 border border-red-200">
      {issue}
    </span>
  )
}

async function fetchImproveData(): Promise<ImproveData | null> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/improve`, {
      cache: 'no-store',
    })
    if (!res.ok) return null
    return (await res.json()) as ImproveData
  } catch {
    return null
  }
}

export default async function AdminPage() {
  const data = await fetchImproveData()

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-5xl">
          <h1 className="mb-6 text-2xl font-bold text-gray-800">管理者ダッシュボード</h1>
          <div className="rounded-lg bg-red-50 p-6 text-red-700">
            データの取得に失敗しました。APIが正常に動作しているか確認してください。
          </div>
        </div>
      </div>
    )
  }

  const top10 = data.scores.slice(0, 10)
  const bottom10 = [...data.scores].sort((a, b) => a.score - b.score).slice(0, 10)
  const gaugePercent = Math.min(100, data.averageScore)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">管理者ダッシュボード</h1>
        <p className="mb-6 text-sm text-gray-500">
          生成日時: {new Date(data.generated).toLocaleString('ja-JP')}
        </p>

        {/* サマリーカード */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-white p-5 shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500">総記事数</p>
            <p className="mt-1 text-3xl font-bold text-gray-900">{data.totalArticles}</p>
          </div>
          <div className="rounded-lg bg-white p-5 shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500">改善が必要な記事</p>
            <p className="mt-1 text-3xl font-bold text-orange-600">
              {data.needsImprovement.length}
            </p>
          </div>
          <div className="rounded-lg bg-white p-5 shadow-sm border border-gray-200">
            <p className="mb-2 text-sm text-gray-500">平均スコア</p>
            <p className="mb-2 text-3xl font-bold text-gray-900">{data.averageScore}点</p>
            <div className="h-3 w-full rounded-full bg-gray-200">
              <div
                className={`h-3 rounded-full transition-all ${
                  gaugePercent >= 85
                    ? 'bg-green-500'
                    : gaugePercent >= 60
                      ? 'bg-orange-400'
                      : 'bg-red-500'
                }`}
                style={{ width: `${gaugePercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* 要改善記事一覧 */}
        <section className="mb-8">
          <h2 className="mb-3 text-lg font-semibold text-gray-800">
            改善が必要な記事 ({data.needsImprovement.length}件)
          </h2>
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left font-medium text-gray-600">記事タイトル</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">スコア</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">問題点</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">改善提案</th>
                </tr>
              </thead>
              <tbody>
                {data.needsImprovement.map((article, idx) => (
                  <tr
                    key={article.slug}
                    className={`border-b border-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{article.title}</p>
                      <p className="text-xs text-gray-400">{article.slug}</p>
                    </td>
                    <td className="px-4 py-3">
                      <ScoreBadge score={article.score} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap">
                        {article.issues.map((issue) => (
                          <IssueBadge key={issue} issue={issue} />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <ul className="space-y-0.5 text-xs text-gray-600">
                        {article.suggestions.map((s) => (
                          <li key={s} className="before:mr-1 before:content-['→']">
                            {s}
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                ))}
                {data.needsImprovement.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                      改善が必要な記事はありません
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* スコア上位・下位 */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* 上位10件 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-800">スコア上位10記事</h2>
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-3 py-2 text-left font-medium text-gray-600">記事</th>
                    <th className="px-3 py-2 text-right font-medium text-gray-600">スコア</th>
                  </tr>
                </thead>
                <tbody>
                  {top10.map((article, idx) => (
                    <tr
                      key={article.slug}
                      className={`border-b border-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                    >
                      <td className="px-3 py-2">
                        <p className="truncate max-w-[200px] font-medium text-gray-800">
                          {article.title}
                        </p>
                        <p className="text-xs text-gray-400">{article.slug}</p>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <ScoreBadge score={article.score} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 下位10件 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-800">スコア下位10記事</h2>
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-3 py-2 text-left font-medium text-gray-600">記事</th>
                    <th className="px-3 py-2 text-right font-medium text-gray-600">スコア</th>
                  </tr>
                </thead>
                <tbody>
                  {bottom10.map((article, idx) => (
                    <tr
                      key={article.slug}
                      className={`border-b border-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                    >
                      <td className="px-3 py-2">
                        <p className="truncate max-w-[200px] font-medium text-gray-800">
                          {article.title}
                        </p>
                        <p className="text-xs text-gray-400">{article.slug}</p>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <ScoreBadge score={article.score} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* ナビゲーション */}
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/admin/seo-checklist"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            SEO改善チェックリスト
          </Link>
          <Link
            href="/"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            サイトトップへ
          </Link>
        </div>
      </div>
    </div>
  )
}
