import Link from 'next/link'
import DisasterCard from '@/components/disaster/DisasterCard'
import AdSense from '@/components/ads/AdSense'
import AffiliateBox from '@/components/affiliate/AffiliateBox'
import {
  getFeaturedDisasters,
  getAllDisasters,
  getTotalDeaths,
  getTotalLessons,
} from '@/lib/disasters'

export default function HomePage() {
  const featured = getFeaturedDisasters()
  const allDisasters = getAllDisasters()
  const totalDeaths = getTotalDeaths()
  const totalLessons = getTotalLessons()

  const categories = [
    { href: '/country/japan', icon: '🇯🇵', label: '日本の災害', count: allDisasters.filter((d) => d.country === 'japan').length },
    { href: '/country/world', icon: '🌍', label: '世界の災害', count: allDisasters.filter((d) => d.country === 'world').length },
    { href: '/type/earthquake', icon: '🏔', label: '地震', count: allDisasters.filter((d) => d.type === 'earthquake').length },
    { href: '/type/tsunami', icon: '🌊', label: '津波', count: allDisasters.filter((d) => d.type === 'tsunami').length },
    { href: '/type/typhoon', icon: '🌀', label: '台風', count: allDisasters.filter((d) => d.type === 'typhoon').length },
    { href: '/type/flood', icon: '🌧', label: '洪水・豪雨', count: allDisasters.filter((d) => d.type === 'flood').length },
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

      {/* Category Grid */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            カテゴリから探す
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                className="bg-white rounded-lg border border-gray-200 p-4 text-center hover:shadow-md hover:border-amber-300 transition group"
              >
                <div className="text-3xl mb-2">{cat.icon}</div>
                <p className="font-medium text-gray-800 group-hover:text-amber-600 text-sm">
                  {cat.label}
                </p>
                <p className="text-xs text-gray-400 mt-1">{cat.count}件</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* AdSense - 記事上部 */}
      <div className="max-w-6xl mx-auto px-4">
        {/* 本番前にスロットIDを差し替えてください（例: 1234567890） */}
        <AdSense slot="1234567890" format="auto" className="my-4" />
      </div>

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
