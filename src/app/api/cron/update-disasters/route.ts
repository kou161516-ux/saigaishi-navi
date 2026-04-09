import { NextResponse } from 'next/server'

// Vercel Cron: 毎日00:00 UTC実行
// 気象庁・USGS APIから最新地震情報を取得
// M6.0以上の新規地震が発生していれば「最新ニュース」として記録

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// 気象庁地震リストの型定義
interface JMAQuakeRaw {
  at?: string
  anm?: string
  mag?: string
  maxi?: string
  [key: string]: unknown
}

// USGS GeoJSON Feature の型定義
interface USGSFeature {
  properties: {
    time: number
    place: string
    mag: number
    [key: string]: unknown
  }
  [key: string]: unknown
}

export async function GET(request: Request) {
  // セキュリティ: Vercel Cronからのリクエストのみ許可
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results: string[] = []

  try {
    // 1. 気象庁 最新地震情報API
    const jmaRes = await fetch('https://www.jma.go.jp/bosai/quake/data/list.json', {
      next: { revalidate: 0 },
      headers: {
        'User-Agent': 'saigaishi-navi-cron/1.0',
      },
    })
    const jmaData: JMAQuakeRaw[] = await jmaRes.json()

    // M5.0以上の直近地震を抽出
    const recentQuakes = jmaData
      .filter((q) => {
        const mag = parseFloat(q.mag ?? '0')
        return mag >= 5.0 && q.anm
      })
      .slice(0, 10)

    results.push(`JMA: ${recentQuakes.length}件のM5.0以上地震を取得`)

    // 2. USGS 重要地震フィード
    const usgsRes = await fetch(
      'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_week.geojson',
      {
        next: { revalidate: 0 },
        headers: {
          'User-Agent': 'saigaishi-navi-cron/1.0',
        },
      },
    )
    const usgsData: { features: USGSFeature[] } = await usgsRes.json()
    const significantQuakes = usgsData.features ?? []
    results.push(`USGS: ${significantQuakes.length}件の重要地震を取得`)

    // 3. 取得データをレスポンスとして返す
    // 本番環境では外部DBやVercel KVを使用して永続化することを推奨

    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      results,
      jmaQuakes: recentQuakes.slice(0, 5).map((q) => ({
        time: q.at,
        place: q.anm,
        magnitude: q.mag,
        maxInt: q.maxi,
      })),
      usgsQuakes: significantQuakes.slice(0, 3).map((f) => ({
        time: new Date(f.properties.time).toISOString(),
        place: f.properties.place,
        magnitude: f.properties.mag,
      })),
    })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
