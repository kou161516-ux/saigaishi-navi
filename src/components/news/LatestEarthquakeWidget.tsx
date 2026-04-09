import type { EarthquakeInfo } from '@/app/api/latest-disasters/route'

// 気象庁APIから直接取得する最軽量型定義
interface JMAQuakeItem {
  eid: string
  time: string
  hypocenter: {
    name: string
    lat: number
    lon: number
    depth: number
    magnitude: number
  }
  maxScale: number
  domesticTsunami: string
}

function scaleToIntensity(scale: number): string | null {
  const map: Record<number, string> = {
    10: '1',
    20: '2',
    30: '3',
    40: '4',
    45: '5弱',
    50: '5強',
    55: '6弱',
    60: '6強',
    70: '7',
  }
  return map[scale] ?? null
}

async function getLatestEarthquakes(): Promise<EarthquakeInfo[]> {
  try {
    const res = await fetch('https://www.jma.go.jp/bosai/quake/data/list.json', {
      next: { revalidate: 3600 },
      headers: {
        'User-Agent': 'saigaishi-navi/1.0',
      },
    })
    if (!res.ok) return []

    const data: JMAQuakeItem[] = await res.json()

    const filtered = data
      .filter(
        (item) =>
          item.hypocenter?.magnitude >= 4.0 &&
          item.hypocenter?.name,
      )
      .slice(0, 3)
      .map((item) => ({
        id: item.eid,
        source: 'JMA' as const,
        time: item.time,
        location: item.hypocenter.name,
        latitude: item.hypocenter.lat,
        longitude: item.hypocenter.lon,
        depth: item.hypocenter.depth,
        magnitude: item.hypocenter.magnitude,
        maxIntensity: scaleToIntensity(item.maxScale),
        tsunami: item.domesticTsunami !== 'None' && item.domesticTsunami !== 'Unknown',
        url: null,
      }))

    return filtered
  } catch {
    return []
  }
}

function formatDateTime(timeStr: string): string {
  try {
    const date = new Date(timeStr)
    if (isNaN(date.getTime())) return timeStr
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Tokyo',
    })
  } catch {
    return timeStr
  }
}

function getMagnitudeColor(mag: number): string {
  if (mag >= 7.0) return 'text-red-600 font-bold'
  if (mag >= 6.0) return 'text-orange-600 font-bold'
  if (mag >= 5.0) return 'text-yellow-600 font-semibold'
  return 'text-blue-600'
}

// スケルトン表示コンポーネント（エラー時・データなし時）
function EarthquakeWidgetSkeleton({ message }: { message?: string }) {
  return (
    <section className="py-8 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">🔴</span>
          <h2 className="text-xl font-bold text-gray-800">最新地震情報（気象庁）</h2>
          <span className="text-xs text-gray-400 ml-auto">毎時更新</span>
        </div>
        {message ? (
          <p className="text-sm text-gray-500 bg-white rounded-lg p-4 border border-gray-200">
            {message}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2 w-3/4" />
                <div className="h-6 bg-gray-200 rounded mb-2 w-1/2" />
                <div className="h-3 bg-gray-100 rounded w-full" />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

// Server Component（revalidate: 3600で1時間キャッシュ）
export default async function LatestEarthquakeWidget() {
  const earthquakes = await getLatestEarthquakes()

  if (earthquakes.length === 0) {
    return (
      <EarthquakeWidgetSkeleton message="現在、M4.0以上の最新地震情報はありません。（気象庁APIより取得）" />
    )
  }

  return (
    <section className="py-8 px-4 bg-gray-50 border-b border-gray-100">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl" role="img" aria-label="alert">🔴</span>
          <h2 className="text-xl font-bold text-gray-800">最新地震情報（気象庁）</h2>
          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium ml-1">
            LIVE
          </span>
          <span className="text-xs text-gray-400 ml-auto">毎時更新 / M4.0以上</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {earthquakes.map((eq) => (
            <div
              key={eq.id}
              className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* ヘッダー：震源地名 + 津波マーク */}
              <div className="flex items-start justify-between mb-2">
                <p className="text-sm font-semibold text-gray-800 leading-tight flex-1">
                  {eq.location}
                </p>
                {eq.tsunami && (
                  <span className="ml-2 flex-shrink-0 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">
                    津波
                  </span>
                )}
              </div>

              {/* マグニチュード */}
              <p className={`text-2xl ${getMagnitudeColor(eq.magnitude)} mb-1`}>
                M{eq.magnitude.toFixed(1)}
              </p>

              {/* 最大震度 */}
              {eq.maxIntensity && (
                <p className="text-sm text-gray-600 mb-1">
                  最大震度 <span className="font-bold text-gray-800">{eq.maxIntensity}</span>
                </p>
              )}

              {/* 深さ */}
              {eq.depth !== null && eq.depth !== undefined && (
                <p className="text-xs text-gray-500 mb-1">
                  深さ {eq.depth === 0 ? 'ごく浅い' : `約${eq.depth}km`}
                </p>
              )}

              {/* 発生日時 */}
              <p className="text-xs text-gray-400 mt-2 border-t border-gray-50 pt-2">
                {formatDateTime(eq.time)}
              </p>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-400 mt-3 text-right">
          出典：{' '}
          <a
            href="https://www.jma.go.jp/bosai/quake/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-600"
          >
            気象庁 地震情報
          </a>
        </p>
      </div>
    </section>
  )
}
