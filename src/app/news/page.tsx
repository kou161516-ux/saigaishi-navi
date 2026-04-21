import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '最新災害情報 | 災害史ナビ',
  description: '気象庁・USGSのリアルタイムデータを基に、最新の地震・台風・洪水情報をお届けします。',
}

export const revalidate = 3600 // 1時間キャッシュ

async function getLatestQuakes() {
  try {
    const [jmaRes, usgsRes] = await Promise.all([
      fetch('https://www.jma.go.jp/bosai/quake/data/list.json', { next: { revalidate: 3600 } }),
      fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_week.geojson', { next: { revalidate: 3600 } })
    ])

    const jmaData = await jmaRes.json()
    const usgsData = await usgsRes.json()

    interface JmaRaw { at: string; anm?: string; mag: string; maxi?: string }
    interface UsgsFeature { properties: { time: number; place: string; mag: number } }

    const jmaQuakes = (jmaData as JmaRaw[])
      .filter((q) => parseFloat(q.mag || '0') >= 4.0)
      .slice(0, 10)
      .map((q) => ({
        time: q.at,
        place: q.anm || '不明',
        magnitude: q.mag,
        maxInt: q.maxi || '-',
        source: 'JMA'
      }))

    const usgsQuakes = ((usgsData.features || []) as UsgsFeature[])
      .slice(0, 5)
      .map((f) => ({
        time: new Date(f.properties.time).toISOString(),
        place: f.properties.place,
        magnitude: String(f.properties.mag),
        maxInt: '-',
        source: 'USGS'
      }))

    return { jmaQuakes, usgsQuakes, updated: new Date().toISOString() }
  } catch {
    return { jmaQuakes: [], usgsQuakes: [], updated: new Date().toISOString() }
  }
}

export default async function NewsPage() {
  const { jmaQuakes, usgsQuakes, updated } = await getLatestQuakes()

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">🔴 最新災害情報</h1>
      <p className="text-gray-500 text-sm mb-8">
        更新: {new Date(updated).toLocaleString('ja-JP')} ／ 1時間ごと自動更新
      </p>

      <section className="mb-10">
        <h2 className="text-xl font-bold mb-4 border-b-2 border-red-500 pb-2">
          🗾 国内最新地震情報（気象庁）
        </h2>
        {jmaQuakes.length === 0 ? (
          <p className="text-gray-500">データ取得中...</p>
        ) : (
          <div className="space-y-3">
            {jmaQuakes.map((q, i: number) => (
              <div key={i} className="flex items-center gap-4 p-3 bg-white border rounded-lg shadow-sm">
                <span className={`text-2xl font-bold min-w-[3rem] text-center ${
                  parseFloat(q.magnitude) >= 6 ? 'text-red-600' :
                  parseFloat(q.magnitude) >= 5 ? 'text-orange-500' : 'text-yellow-600'
                }`}>M{q.magnitude}</span>
                <div className="flex-1">
                  <p className="font-medium">{q.place}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(q.time).toLocaleString('ja-JP')}
                    {q.maxInt !== '-' && ` ／ 最大震度${q.maxInt}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-gray-400 mt-2">
          ※ M4.0以上の地震を表示。データは気象庁APIより取得。
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold mb-4 border-b-2 border-blue-500 pb-2">
          🌍 世界の重要地震情報（USGS）
        </h2>
        {usgsQuakes.length === 0 ? (
          <p className="text-gray-500">今週の重要地震情報なし</p>
        ) : (
          <div className="space-y-3">
            {usgsQuakes.map((q, i: number) => (
              <div key={i} className="flex items-center gap-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <span className="text-2xl font-bold min-w-[3rem] text-center text-blue-700">M{q.magnitude}</span>
                <div className="flex-1">
                  <p className="font-medium">{q.place}</p>
                  <p className="text-sm text-gray-500">{new Date(q.time).toLocaleString('ja-JP')}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-gray-400 mt-2">
          ※ 過去7日間の重要地震。データはUSGSより取得。
        </p>
      </section>

      <section className="bg-amber-50 border border-amber-200 rounded-xl p-6">
        <h2 className="text-lg font-bold mb-2">📚 過去の災害から学ぶ</h2>
        <p className="text-gray-700 mb-4">最新の地震情報を見て「備えが心配」と感じたら、過去の教訓を確認しましょう。</p>
        <div className="flex gap-3 flex-wrap">
          <Link href="/disasters" className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
            全70件の災害史を見る
          </Link>
          <Link href="/type/earthquake" className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors">
            地震の記録
          </Link>
          <Link href="/stats" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            統計・グラフ
          </Link>
        </div>
      </section>
    </main>
  )
}
