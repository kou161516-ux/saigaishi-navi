import Link from 'next/link'
import { getAllDisasters } from '@/lib/disasters'
import { DisasterType } from '@/types/disaster'

export const revalidate = 3600

type PriorityLevel = 'high' | 'medium' | 'low'

interface ExpansionCandidate {
  title: string
  type: DisasterType
  country: string
  deaths: number
  priority: PriorityLevel
  reason: string
}

const EXPANSION_CANDIDATES: ExpansionCandidate[] = [
  {
    title: '1970年ペルー地震',
    type: 'earthquake',
    country: 'world',
    deaths: 66000,
    priority: 'high',
    reason: '南米最大規模・世界DB強化',
  },
  {
    title: '三陸沖地震津波（1933年）',
    type: 'tsunami',
    country: 'japan',
    deaths: 3068,
    priority: 'high',
    reason: '東北津波史の補完',
  },
  {
    title: '1931年中国洪水',
    type: 'flood',
    country: 'world',
    deaths: 850000,
    priority: 'high',
    reason: '史上最大の洪水被害',
  },
  {
    title: '2021年ハイチ地震',
    type: 'earthquake',
    country: 'world',
    deaths: 2200,
    priority: 'medium',
    reason: '近年被害国の補完',
  },
  {
    title: '2010年チリ地震M8.8',
    type: 'earthquake',
    country: 'world',
    deaths: 525,
    priority: 'medium',
    reason: '巨大地震シリーズ補完',
  },
  {
    title: '在宅避難の全知識',
    type: 'other',
    country: 'japan',
    deaths: 0,
    priority: 'high',
    reason: '検索需要最大・収益高',
  },
  {
    title: '車中泊避難の注意点',
    type: 'other',
    country: 'japan',
    deaths: 0,
    priority: 'high',
    reason: '能登地震後に検索急増',
  },
  {
    title: '子どもとの避難計画',
    type: 'other',
    country: 'japan',
    deaths: 0,
    priority: 'high',
    reason: 'ファミリー層狙い・収益高',
  },
  {
    title: '1999年台湾集集地震',
    type: 'earthquake',
    country: 'world',
    deaths: 2415,
    priority: 'medium',
    reason: '台湾版サイト展開の核',
  },
  {
    title: '2003年バム地震（イラン）',
    type: 'earthquake',
    country: 'world',
    deaths: 26200,
    priority: 'medium',
    reason: '中東地震DBの強化',
  },
]

const MULTILINGUAL_TOP5 = [
  { title: '2011年東日本大震災', slug: 'great-east-japan-earthquake-2011', reason: '世界的知名度が最高' },
  { title: '1995年阪神・淡路大震災', slug: 'kobe-earthquake-1995', reason: '都市直下型・建物倒壊教訓' },
  { title: '2024年能登半島地震', slug: 'noto-peninsula-earthquake-2024', reason: '最新事例・検索需要大' },
  { title: '1923年関東大震災', slug: 'great-kanto-earthquake-1923', reason: '歴史的意義・100周年話題' },
  { title: '2011年津波映像記録', slug: 'tsunami-2011-records', reason: '映像で世界に発信しやすい' },
]

function PriorityBadge({ priority }: { priority: PriorityLevel }) {
  if (priority === 'high') {
    return (
      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
        高
      </span>
    )
  }
  if (priority === 'medium') {
    return (
      <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700">
        中
      </span>
    )
  }
  return (
    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
      低
    </span>
  )
}

export default function DbExpansionPage() {
  const disasters = getAllDisasters()

  // セクション1: 現在のDBカバレッジ
  const japanCount = disasters.filter((d) => d.country === 'japan').length
  const worldCount = disasters.filter((d) => d.country !== 'japan').length

  // 災害種別カウント
  const typeCountMap = new Map<DisasterType, number>()
  for (const d of disasters) {
    typeCountMap.set(d.type, (typeCountMap.get(d.type) ?? 0) + 1)
  }
  const typeCounts = Array.from(typeCountMap.entries()).sort((a, b) => b[1] - a[1])

  // 年代別カウント
  const decadeMap = new Map<number, number>()
  for (const d of disasters) {
    const year = new Date(d.date).getFullYear()
    const decade = Math.floor(year / 10) * 10
    decadeMap.set(decade, (decadeMap.get(decade) ?? 0) + 1)
  }
  const decadeCounts = Array.from(decadeMap.entries()).sort((a, b) => a[0] - b[0])
  const maxDecadeCount = Math.max(...decadeCounts.map(([, c]) => c), 1)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6 flex items-center gap-3">
          <Link href="/admin" className="text-sm text-blue-600 hover:text-blue-800">
            ← 管理ダッシュボード
          </Link>
        </div>
        <h1 className="mb-2 text-2xl font-bold text-gray-900">データベース拡張計画ダッシュボード</h1>
        <p className="mb-8 text-sm text-gray-500">
          現在{disasters.length}記事 — 拡張候補と多言語展開ロードマップ
        </p>

        {/* セクション1: 現在のDBカバレッジ */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            セクション1: 現在のDBカバレッジ
          </h2>

          {/* 国別 */}
          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <p className="mb-3 font-medium text-gray-700">国別分布</p>
              <div className="flex gap-6">
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {japanCount}
                    <span className="ml-1 text-sm font-normal text-gray-500">件</span>
                  </p>
                  <p className="text-sm text-gray-500">日本</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {worldCount}
                    <span className="ml-1 text-sm font-normal text-gray-500">件</span>
                  </p>
                  <p className="text-sm text-gray-500">世界</p>
                </div>
              </div>
            </div>

            {/* 災害種別バッジ */}
            <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <p className="mb-3 font-medium text-gray-700">災害種別</p>
              <div className="flex flex-wrap gap-2">
                {typeCounts.map(([type, count]) => (
                  <span
                    key={type}
                    className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800"
                  >
                    {type}: {count}件
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 年代別グラフ */}
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <p className="mb-4 font-medium text-gray-700">年代別記事数</p>
            <div className="space-y-2">
              {decadeCounts.map(([decade, count]) => (
                <div key={decade} className="flex items-center gap-3">
                  <span className="w-16 shrink-0 text-right text-xs text-gray-500">
                    {decade}年代
                  </span>
                  <div className="flex-1">
                    <div className="h-5 rounded bg-gray-100">
                      <div
                        className="h-5 rounded bg-teal-400 transition-all"
                        style={{ width: `${Math.round((count / maxDecadeCount) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <span className="w-8 shrink-0 text-xs font-semibold text-gray-700">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* セクション2: 優先追加候補記事 TOP10 */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            セクション2: 優先追加候補記事 TOP10
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {EXPANSION_CANDIDATES.map((candidate) => (
              <div
                key={candidate.title}
                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <p className="font-medium text-gray-900">{candidate.title}</p>
                  <PriorityBadge priority={candidate.priority} />
                </div>
                <div className="mb-2 flex flex-wrap gap-1.5">
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800">
                    {candidate.type}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      candidate.country === 'japan'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {candidate.country === 'japan' ? '日本' : '世界'}
                  </span>
                  {candidate.deaths > 0 && (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                      死者 {candidate.deaths.toLocaleString()}人
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">{candidate.reason}</p>
              </div>
            ))}
          </div>
        </section>

        {/* セクション4（仕様準拠）: 多言語展開ロードマップ */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            セクション4: 多言語展開ロードマップ — 英語化推奨記事 TOP5
          </h2>
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
            <ul className="divide-y divide-gray-100">
              {MULTILINGUAL_TOP5.map((item, idx) => (
                <li key={item.slug} className="flex items-center gap-4 px-5 py-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-400">{item.slug}</p>
                  </div>
                  <p className="shrink-0 text-xs text-gray-500">{item.reason}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  )
}
