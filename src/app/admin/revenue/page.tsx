import Link from 'next/link'
import { getAllDisasters } from '@/lib/disasters'
import { DisasterData } from '@/types/disaster'

export const revalidate = 3600

type AffiliateCategory = DisasterData['affiliateCategory']

interface CategoryStat {
  category: AffiliateCategory
  count: number
  recommendedProducts: string[]
}

interface HighPotentialArticle {
  slug: string
  title: string
  affiliateCategory: AffiliateCategory
  deaths: number
  country: string
  recommendedProducts: string[]
  ctaExample: string
}

const CATEGORY_PRODUCTS: Record<AffiliateCategory, string[]> = {
  tsunami: ['防災リュック', '保存水', 'ポータブル電源'],
  water: ['保存水', '非常食', '防災リュック'],
  power: ['ポータブル電源', 'LEDライト', '防災リュック'],
  evacuation: ['防災リュック', '保存水', '非常用トイレ'],
  indoor: ['家具固定グッズ', '防災リュック', 'ポータブル電源'],
  flood: ['非常用トイレ', '保存水', '防水バッグ'],
  typhoon: ['ポータブル電源', 'LEDライト', '養生テープ'],
  general: ['防災リュック', '保存水', '非常食'],
}

// affiliateCategoryをdisasterTypeごとのマッピングで補完
const CTA_EXAMPLES: Record<AffiliateCategory, string> = {
  tsunami: '津波発生時の備えとして、防災リュックと保存水を今すぐ確認してみてください。',
  water: '水害への備えとして、保存水・浄水グッズを参考にどうぞ。',
  power: '停電対策として、ポータブル電源の導入を検討してみてください。',
  evacuation: '避難準備として、防災リュックの中身を今一度見直してみましょう。',
  indoor: '室内の安全確保として、家具固定グッズを備えとして揃えておきましょう。',
  flood: '洪水・水害に備えて、非常用トイレや防水バッグを準備しておくと安心です。',
  typhoon: '台風シーズン前に、ポータブル電源とLEDライトを備えとして用意しておきましょう。',
  general: '防災の第一歩として、防災リュックと保存水の準備から始めてみてください。',
}

export default function RevenuePage() {
  const disasters = getAllDisasters()

  // セクション1: 収益カテゴリ分布
  const categoryMap = new Map<AffiliateCategory, number>()
  for (const d of disasters) {
    categoryMap.set(d.affiliateCategory, (categoryMap.get(d.affiliateCategory) ?? 0) + 1)
  }

  const maxCount = Math.max(...Array.from(categoryMap.values()), 1)

  const categoryStats: CategoryStat[] = Array.from(categoryMap.entries())
    .map(([category, count]) => ({
      category,
      count,
      recommendedProducts: CATEGORY_PRODUCTS[category] ?? [],
    }))
    .sort((a, b) => b.count - a.count)

  // セクション2: 高収益ポテンシャル記事TOP10
  const highPotential: HighPotentialArticle[] = disasters
    .filter((d) => (d.deaths ?? 0) > 1000 && d.country === 'japan')
    .sort((a, b) => (b.deaths ?? 0) - (a.deaths ?? 0))
    .slice(0, 10)
    .map((d) => ({
      slug: d.slug,
      title: d.title,
      affiliateCategory: d.affiliateCategory,
      deaths: d.deaths ?? 0,
      country: d.country,
      recommendedProducts: CATEGORY_PRODUCTS[d.affiliateCategory] ?? [],
      ctaExample: CTA_EXAMPLES[d.affiliateCategory],
    }))

  // 日本記事でTOP10に満たない場合は世界記事で補完
  if (highPotential.length < 10) {
    const worldTop = disasters
      .filter(
        (d) =>
          (d.deaths ?? 0) > 1000 &&
          d.country !== 'japan' &&
          !highPotential.some((h) => h.slug === d.slug),
      )
      .sort((a, b) => (b.deaths ?? 0) - (a.deaths ?? 0))
      .slice(0, 10 - highPotential.length)
      .map((d) => ({
        slug: d.slug,
        title: d.title,
        affiliateCategory: d.affiliateCategory,
        deaths: d.deaths ?? 0,
        country: d.country,
        recommendedProducts: CATEGORY_PRODUCTS[d.affiliateCategory] ?? [],
        ctaExample: CTA_EXAMPLES[d.affiliateCategory],
      }))
    highPotential.push(...worldTop)
  }

  const checklistItems = [
    { label: '全記事にaffiliateCategory設定済み' },
    { label: '高PV記事（地震・台風）にポータブル電源導線あり' },
    { label: '津波・洪水記事に非常用トイレ導線あり' },
    { label: 'Amazon/楽天両方に対応した商品紹介あり' },
    { label: 'CTAは「備えとして」「参考として」などの自然な表現' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6 flex items-center gap-3">
          <Link href="/admin" className="text-sm text-blue-600 hover:text-blue-800">
            ← 管理ダッシュボード
          </Link>
        </div>
        <h1 className="mb-2 text-2xl font-bold text-gray-900">収益最適化ダッシュボード</h1>
        <p className="mb-8 text-sm text-gray-500">
          全{disasters.length}記事のアフィリエイト収益ポテンシャルを分析
        </p>

        {/* セクション1: 収益カテゴリ分布 */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            セクション1: 収益カテゴリ分布
          </h2>
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left font-medium text-gray-600">カテゴリ</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">記事数</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">分布</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">推奨商品</th>
                </tr>
              </thead>
              <tbody>
                {categoryStats.map((stat, idx) => (
                  <tr
                    key={stat.category}
                    className={`border-b border-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-800">
                        {stat.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-700">{stat.count}件</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-40 rounded-full bg-gray-200">
                          <div
                            className="h-3 rounded-full bg-indigo-400"
                            style={{ width: `${Math.round((stat.count / maxCount) * 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">
                          {Math.round((stat.count / disasters.length) * 100)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {stat.recommendedProducts.map((p) => (
                          <span
                            key={p}
                            className="rounded bg-yellow-50 px-1.5 py-0.5 text-xs text-yellow-800 border border-yellow-200"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* セクション2: 高収益ポテンシャル記事TOP10 */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            セクション2: 高収益ポテンシャル記事 TOP10
          </h2>
          {highPotential.length === 0 ? (
            <p className="rounded-lg border border-gray-200 bg-white px-4 py-6 text-center text-gray-500">
              該当する記事がありません
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {highPotential.map((article) => (
                <div
                  key={article.slug}
                  className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-gray-900">{article.title}</p>
                      <p className="text-xs text-gray-400">{article.slug}</p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                        article.country === 'japan'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {article.country === 'japan' ? '日本' : '世界'}
                    </span>
                  </div>
                  <div className="mb-2 flex flex-wrap gap-1">
                    {article.recommendedProducts.map((p) => (
                      <span
                        key={p}
                        className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                  <p className="mb-1 text-xs text-gray-500">
                    死者数:{' '}
                    <span className="font-semibold text-gray-700">
                      {article.deaths.toLocaleString()}人
                    </span>
                  </p>
                  <p className="mt-2 rounded bg-gray-50 px-2 py-1.5 text-xs text-gray-600 border border-gray-100">
                    CTA例: {article.ctaExample}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* セクション3: 収益改善チェックリスト */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            セクション3: 収益改善チェックリスト
          </h2>
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <ul className="space-y-3">
              {checklistItems.map((item) => (
                <li key={item.label} className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-blue-600"
                    readOnly
                  />
                  <span className="text-sm text-gray-700">{item.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  )
}
