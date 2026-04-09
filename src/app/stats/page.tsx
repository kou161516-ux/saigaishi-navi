import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllDisasters, getDisasterCountByType } from '@/lib/disasters'

export const metadata: Metadata = {
  title: '災害統計ダッシュボード',
  description: '災害史ナビに収録されている全災害の統計情報。種別・国内外比率・被害規模ランキング・時代別件数を一覧表示。',
}

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
  earthquake: 'bg-red-500',
  tsunami: 'bg-blue-500',
  typhoon: 'bg-purple-500',
  flood: 'bg-blue-400',
  landslide: 'bg-yellow-500',
  volcano: 'bg-orange-500',
  fire: 'bg-red-400',
  snowstorm: 'bg-gray-400',
  heatwave: 'bg-amber-500',
  other: 'bg-gray-500',
}

export default function StatsPage() {
  const disasters = getAllDisasters()
  const countByType = getDisasterCountByType()

  // 国内/海外比率
  const japanCount = disasters.filter((d) => d.country === 'japan').length
  const worldCount = disasters.length - japanCount
  const japanPct = Math.round((japanCount / disasters.length) * 100)
  const worldPct = 100 - japanPct

  // 被害上位10件
  const top10 = [...disasters]
    .filter((d) => d.deaths !== undefined)
    .sort((a, b) => (b.deaths || 0) - (a.deaths || 0))
    .slice(0, 10)
  const maxDeaths = top10[0]?.deaths || 1

  // 時代別件数
  const eraCounts: Record<string, number> = {}
  disasters.forEach((d) => {
    const year = new Date(d.date).getFullYear()
    const decade = `${Math.floor(year / 10) * 10}s`
    eraCounts[decade] = (eraCounts[decade] || 0) + 1
  })
  const eras = Object.keys(eraCounts).sort()
  const maxEraCount = Math.max(...Object.values(eraCounts))

  // 種別最大件数（バー幅計算用）
  const maxTypeCount = Math.max(...Object.values(countByType))

  return (
    <div>
      {/* Hero */}
      <div className="bg-navy-900 text-white py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <nav className="text-sm text-gray-400 mb-3">
            <Link href="/" className="hover:text-amber-400">ホーム</Link>
            <span className="mx-2">/</span>
            <span className="text-white">統計ダッシュボード</span>
          </nav>
          <h1 className="text-3xl font-bold mb-2">災害統計ダッシュボード</h1>
          <p className="text-gray-300">
            収録全 {disasters.length} 件の災害データを可視化
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">

        {/* サマリーカード */}
        <section>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: '収録災害数', value: `${disasters.length}件`, color: 'bg-navy-900' },
              {
                label: '記録された死者数（合計）',
                value: `${disasters.reduce((s, d) => s + (d.deaths || 0), 0).toLocaleString()}人`,
                color: 'bg-red-700',
              },
              {
                label: '収録教訓数',
                value: `${disasters.reduce((s, d) => s + d.lessons.length, 0)}件`,
                color: 'bg-amber-600',
              },
              {
                label: '対象国・地域数',
                value: `${new Set(disasters.map((d) => d.country)).size}地域`,
                color: 'bg-blue-700',
              },
            ].map((card) => (
              <div key={card.label} className={`${card.color} text-white rounded-xl p-5`}>
                <p className="text-xs opacity-80 mb-1">{card.label}</p>
                <p className="text-2xl font-bold">{card.value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 災害タイプ別件数バーグラフ */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
            災害タイプ別件数
          </h2>
          <div className="space-y-3">
            {Object.entries(countByType)
              .sort(([, a], [, b]) => b - a)
              .map(([type, count]) => {
                const widthPct = Math.round((count / maxTypeCount) * 100)
                return (
                  <div key={type} className="flex items-center gap-3">
                    <span className="w-24 text-sm text-gray-600 text-right shrink-0">
                      {typeLabels[type] || type}
                    </span>
                    <div className="flex-1 bg-gray-100 rounded-full h-7 relative">
                      <div
                        className={`${typeColors[type] || 'bg-gray-500'} h-7 rounded-full transition-all flex items-center justify-end pr-2`}
                        style={{ width: `${widthPct}%` }}
                      >
                        <span className="text-white text-xs font-bold">{count}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
          </div>
        </section>

        {/* 国内/海外比率 */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
            国内 / 海外の比率
          </h2>
          <div className="flex gap-6 items-center flex-wrap">
            <div className="flex-1 min-w-48">
              <div className="h-8 rounded-full overflow-hidden flex">
                <div
                  className="bg-red-500 h-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ width: `${japanPct}%` }}
                >
                  日本 {japanPct}%
                </div>
                <div
                  className="bg-blue-500 h-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ width: `${worldPct}%` }}
                >
                  海外 {worldPct}%
                </div>
              </div>
            </div>
            <div className="flex gap-6 text-sm">
              <div>
                <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-1" />
                日本: <strong>{japanCount}件</strong>
              </div>
              <div>
                <span className="inline-block w-3 h-3 rounded-full bg-blue-500 mr-1" />
                海外: <strong>{worldCount}件</strong>
              </div>
            </div>
          </div>
        </section>

        {/* 被害の大きかった上位10災害ランキング */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
            死者数ランキング TOP 10
          </h2>
          <div className="space-y-3">
            {top10.map((d, i) => {
              const barPct = Math.round(((d.deaths || 0) / maxDeaths) * 100)
              return (
                <div key={d.slug} className="flex items-center gap-3">
                  <span className="w-6 text-center text-sm font-bold text-gray-500 shrink-0">
                    {i + 1}
                  </span>
                  <Link
                    href={`/disasters/${d.slug}`}
                    className="w-48 text-sm text-gray-800 hover:text-amber-600 font-medium shrink-0 truncate"
                    title={d.title}
                  >
                    {d.title}
                  </Link>
                  <div className="flex-1 bg-gray-100 rounded-full h-6 relative">
                    <div
                      className="bg-red-500 h-6 rounded-full flex items-center justify-end pr-2"
                      style={{ width: `${barPct}%` }}
                    >
                      <span className="text-white text-xs font-bold">
                        {(d.deaths || 0).toLocaleString()}人
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* 時代別件数 */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
            時代別収録件数
          </h2>
          <div className="flex items-end gap-3 h-48">
            {eras.map((era) => {
              const count = eraCounts[era]
              const heightPct = Math.round((count / maxEraCount) * 100)
              return (
                <div key={era} className="flex flex-col items-center flex-1 min-w-0">
                  <span className="text-xs font-bold text-gray-700 mb-1">{count}</span>
                  <Link
                    href={`/era/${era}`}
                    className="w-full bg-navy-900 hover:bg-amber-500 transition-colors rounded-t"
                    style={{ height: `${heightPct}%`, minHeight: '8px' }}
                    title={`${era}: ${count}件`}
                  />
                  <span className="text-xs text-gray-500 mt-1 truncate w-full text-center">
                    {era}
                  </span>
                </div>
              )
            })}
          </div>
        </section>

        {/* リンク */}
        <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-200">
          <Link
            href="/disasters"
            className="inline-block bg-navy-900 text-white px-6 py-3 rounded-lg hover:bg-amber-500 transition font-medium text-sm"
          >
            全災害一覧を見る
          </Link>
          <Link
            href="/tags"
            className="inline-block border border-navy-900 text-navy-900 px-6 py-3 rounded-lg hover:bg-gray-100 transition font-medium text-sm"
          >
            タグ一覧を見る
          </Link>
        </div>
      </div>
    </div>
  )
}
