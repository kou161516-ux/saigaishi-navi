import Link from 'next/link'
import DisasterCard from '@/components/disaster/DisasterCard'
import AdSense from '@/components/ads/AdSense'
import AffiliateBox from '@/components/affiliate/AffiliateBox'
import InsWebAffiliateBox from '@/components/affiliate/InsWebAffiliateBox'
import LatestEarthquakeWidget from '@/components/news/LatestEarthquakeWidget'
import DisasterPreventionDayBanner from '@/components/special/DisasterPreventionDayBanner'
import {
  getFeaturedDisasters,
  getAllDisasters,
  getTotalDeaths,
  getTotalLessons,
} from '@/lib/disasters'

// 月ごとの特集スラッグ（その月に因んだ災害）
const monthlyFeatured: Record<number, string[]> = {
  1:  ['noto-earthquake-2024', 'hanshin-awaji-earthquake-1995'],
  2:  ['hokkaido-earthquake-2018', 'nihonkai-chubu-earthquake-1983'],
  3:  ['tohoku-earthquake-2011', 'miyagi-earthquake-1978'],
  4:  ['kumamoto-earthquake-2016', 'fukui-earthquake-1948'],
  5:  ['ontake-eruption-2014', 'pinatubo-eruption-1991'],
  6:  ['fukui-earthquake-1948', 'niigata-earthquake-1964'],
  7:  ['western-japan-flood-2018', 'northern-kyushu-flood-2017'],
  8:  ['nagasaki-flood-1982', 'atami-landslide-2021'],
  9:  ['kanto-earthquake-1923', 'isewan-typhoon-1959'],
  10: ['ringo-typhoon-1991', 'okushiri-tsunami-1993'],
  11: ['niigata-chuetsu-earthquake-2004', 'izmit-earthquake-1999'],
  12: ['india-ocean-tsunami-2004', 'armero-volcano-1985'],
}

const monthNames: Record<number, string> = {
  1: '1月', 2: '2月', 3: '3月', 4: '4月',
  5: '5月', 6: '6月', 7: '7月', 8: '8月',
  9: '9月', 10: '10月', 11: '11月', 12: '12月',
}

export default function HomePage() {
  const featured = getFeaturedDisasters()
  const allDisasters = getAllDisasters()
  const totalDeaths = getTotalDeaths()
  const totalLessons = getTotalLessons()

  // 今月の特集
  const currentMonth = new Date().getMonth() + 1
  const monthlySlugs = monthlyFeatured[currentMonth] ?? []
  const monthlyDisasters = monthlySlugs
    .map((slug) => allDisasters.find((d) => d.slug === slug))
    .filter((d): d is NonNullable<typeof d> => d !== undefined)

  // 被害 TOP10（deaths + missing の降順）
  const top10 = [...allDisasters]
    .sort((a, b) => {
      const totalA = (a.deaths ?? 0) + (a.missing ?? 0)
      const totalB = (b.deaths ?? 0) + (b.missing ?? 0)
      return totalB - totalA
    })
    .slice(0, 10)

  const categories = [
    { href: '/country/japan', icon: '🇯🇵', label: '日本の災害', count: allDisasters.filter((d) => d.country === 'japan').length },
    { href: '/country/world', icon: '🌍', label: '世界の災害', count: allDisasters.filter((d) => d.country === 'world').length },
    { href: '/type/earthquake', icon: '🏔', label: '地震', count: allDisasters.filter((d) => d.type === 'earthquake').length },
    { href: '/type/tsunami', icon: '🌊', label: '津波', count: allDisasters.filter((d) => d.type === 'tsunami').length },
    { href: '/type/typhoon', icon: '🌀', label: '台風', count: allDisasters.filter((d) => d.type === 'typhoon').length },
    { href: '/type/flood', icon: '🌧', label: '洪水・豪雨', count: allDisasters.filter((d) => d.type === 'flood').length },
    { href: '/type/volcano', icon: '🌋', label: '火山', count: allDisasters.filter((d) => d.type === 'volcano').length },
    { href: '/type/landslide', icon: '⛰', label: '土砂崩れ', count: allDisasters.filter((d) => d.type === 'landslide').length },
  ]

  const eras = ['1920s', '1950s', '1990s', '2000s', '2010s', '2020s']

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-navy-900 to-navy-800 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-5xl font-bold mb-4 leading-tight">
            過去の災害を知り、
            <br className="sm:hidden" />
            <span className="text-amber-400">今日の備えに変える。</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            関東大震災から能登半島地震まで。日本・世界の重大災害の歴史と教訓を学び、
            あなたと大切な人を守る備えにつなげましょう。
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Link
              href="/disasters"
              className="bg-amber-400 hover:bg-amber-500 text-navy-900 font-bold px-8 py-3 rounded-lg transition text-lg"
            >
              災害一覧を見る
            </Link>
            <Link
              href="/lessons"
              className="border border-white text-white hover:bg-white hover:text-navy-900 font-bold px-8 py-3 rounded-lg transition text-lg"
            >
              教訓一覧
            </Link>
          </div>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto">
            <div>
              <p className="text-3xl font-bold text-amber-400">{allDisasters.length}</p>
              <p className="text-sm text-gray-400">収録災害</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-amber-400">{totalLessons}</p>
              <p className="text-sm text-gray-400">学べる教訓</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-amber-400">
                {(totalDeaths / 10000).toFixed(1)}万
              </p>
              <p className="text-sm text-gray-400">犠牲者数（累計）</p>
            </div>
          </div>
        </div>
      </section>

      {/* 最新地震情報バナー */}
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="animate-pulse text-red-500">🔴</span>
            <span className="text-sm font-medium">最新の地震・災害情報（気象庁・USGS連携）</span>
          </div>
          <a href="/news" className="text-sm text-red-600 hover:underline font-medium">確認する →</a>
        </div>
      </div>

      {/* 防災の日バナー（Server Component） */}
      <DisasterPreventionDayBanner />

      {/* Latest Earthquake Widget */}
      <LatestEarthquakeWidget />

      {/* タイプ別に探す（改善版） */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
            タイプ別に探す
          </h2>
          <p className="text-sm text-gray-500 text-center mb-6">
            災害の種類でカテゴリを選んで一覧を確認できます
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                className="bg-white rounded-xl border border-gray-200 p-4 text-center hover:shadow-md hover:border-amber-300 hover:bg-amber-50 transition group"
              >
                <div className="text-3xl mb-2">{cat.icon}</div>
                <p className="font-medium text-gray-800 group-hover:text-amber-700 text-xs leading-tight">
                  {cat.label}
                </p>
                <p className="text-xs text-gray-400 mt-1">{cat.count}件</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* インズウェブ火災保険アフィリエイト */}
      <div className="max-w-4xl mx-auto px-4">
        <InsWebAffiliateBox />
      </div>

      {/* AdSense - 記事上部 */}
      <div className="max-w-6xl mx-auto px-4">
        {/* 本番前にスロットIDを差し替えてください（例: 1234567890） */}
        <AdSense slot="1234567890" format="auto" className="my-4" />
      </div>

      {/* 今月の防災チェック */}
      {monthlyDisasters.length > 0 && (
        <section className="py-12 px-4 bg-amber-50 border-y border-amber-100">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-wrap items-center justify-between mb-6 gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-amber-400 text-white text-xs font-bold px-2 py-0.5 rounded">
                    {monthNames[currentMonth]}の防災チェック
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  今月に因んだ災害を振り返る
                </h2>
              </div>
              <Link href="/disasters" className="text-amber-600 hover:text-amber-700 text-sm font-medium">
                全記事を見る →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {monthlyDisasters.map((disaster) => (
                <DisasterCard key={disaster.slug} disaster={disaster} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Disasters */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">注目の災害記事</h2>
            <Link href="/disasters" className="text-amber-600 hover:text-amber-700 text-sm font-medium">
              全記事を見る →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((disaster) => (
              <DisasterCard key={disaster.slug} disaster={disaster} />
            ))}
          </div>
        </div>
      </section>

      {/* 被害の大きかった災害 TOP10 */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap items-center justify-between mb-6 gap-3">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">被害の大きかった災害 TOP10</h2>
              <p className="text-sm text-gray-500 mt-1">死者・行方不明者数の合計で集計</p>
            </div>
            <Link href="/disasters" className="text-amber-600 hover:text-amber-700 text-sm font-medium">
              全災害を見る →
            </Link>
          </div>
          <ol className="space-y-3">
            {top10.map((disaster, index) => {
              const total = (disaster.deaths ?? 0) + (disaster.missing ?? 0)
              const isTop3 = index < 3
              return (
                <li key={disaster.slug}>
                  <Link
                    href={`/disasters/${disaster.slug}`}
                    className="flex items-center gap-4 bg-white rounded-lg border border-gray-200 px-5 py-4 hover:shadow-md hover:border-amber-300 transition group"
                  >
                    {/* Rank */}
                    <span
                      className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${
                        index === 0
                          ? 'bg-yellow-400 text-white'
                          : index === 1
                          ? 'bg-gray-400 text-white'
                          : index === 2
                          ? 'bg-amber-700 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {index + 1}
                    </span>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 group-hover:text-amber-700 transition truncate">
                        {disaster.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {disaster.date.slice(0, 4)}年 · {disaster.region}
                      </p>
                    </div>
                    {/* Deaths */}
                    <div className="flex-shrink-0 text-right">
                      <p className={`font-bold text-sm ${isTop3 ? 'text-red-700' : 'text-gray-700'}`}>
                        {total.toLocaleString()}人
                      </p>
                      <p className="text-xs text-gray-400">死者・行不明</p>
                    </div>
                    <span className="flex-shrink-0 text-gray-400 group-hover:text-amber-500 transition text-lg">›</span>
                  </Link>
                </li>
              )
            })}
          </ol>
        </div>
      </section>

      {/* Era Timeline */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">年代別に探す</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {eras.map((era) => (
              <Link
                key={era}
                href={`/era/${era}`}
                className="bg-white border border-gray-200 hover:border-amber-400 hover:bg-amber-50 rounded-lg px-6 py-3 font-bold text-gray-700 hover:text-amber-700 transition"
              >
                {era}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Affiliate */}
      <section className="py-8 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <AffiliateBox category="general" />
        </div>
      </section>

      {/* Preparedness CTA */}
      <section className="py-12 px-4 bg-navy-900 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">
            まず今日から始められる備え
          </h2>
          <p className="text-gray-300 mb-6">
            過去の災害の教訓は、すべて「備えていれば助かった命があった」という事実に集約されます。
            今日、1つだけでも備えを見直しましょう。
          </p>
          <div className="grid sm:grid-cols-3 gap-4 text-left">
            {[
              { icon: '💧', title: '水の備蓄', text: '1人1日3L×7日分 = 21L。今すぐ確認しましょう。' },
              { icon: '🔦', title: '停電対策', text: 'ポータブル電源・懐中電灯・電池式ラジオの準備を。' },
              { icon: '🎒', title: '非常持出袋', text: '家族全員分の72時間セットを玄関近くに置く。' },
            ].map((item) => (
              <div key={item.title} className="bg-navy-800 rounded-lg p-4">
                <div className="text-2xl mb-2">{item.icon}</div>
                <p className="font-bold text-amber-400 mb-1">{item.title}</p>
                <p className="text-sm text-gray-300">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AdSense - 下部 */}
      <div className="max-w-6xl mx-auto px-4">
        {/* 本番前にスロットIDを差し替えてください */}
        <AdSense slot="0987654321" format="auto" className="my-4" />
      </div>
    </>
  )
}
