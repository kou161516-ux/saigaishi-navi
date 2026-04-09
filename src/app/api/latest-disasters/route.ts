import { NextResponse } from 'next/server'

// 気象庁地震情報の型定義
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
  foreignTsunami: string
}

// USGS地震情報の型定義
interface USGSFeature {
  id: string
  properties: {
    mag: number
    place: string
    time: number
    updated: number
    url: string
    title: string
    sig: number
    type: string
  }
  geometry: {
    coordinates: [number, number, number]
  }
}

interface USGSResponse {
  features: USGSFeature[]
}

// 正規化した地震情報の型
export interface EarthquakeInfo {
  id: string
  source: 'JMA' | 'USGS'
  time: string
  location: string
  latitude: number | null
  longitude: number | null
  depth: number | null
  magnitude: number
  maxIntensity: string | null
  tsunami: boolean
  url: string | null
}

// 気象庁の震度スケールを文字列に変換
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

async function fetchJMAEarthquakes(): Promise<EarthquakeInfo[]> {
  try {
    const res = await fetch('https://www.jma.go.jp/bosai/quake/data/list.json', {
      next: { revalidate: 3600 },
      headers: {
        'User-Agent': 'saigaishi-navi/1.0 (disaster-info-site)',
      },
    })
    if (!res.ok) {
      console.error(`JMA API error: ${res.status}`)
      return []
    }
    const data: JMAQuakeItem[] = await res.json()

    return data
      .filter(
        (item) =>
          item.hypocenter?.magnitude >= 5.0 &&
          item.hypocenter?.lat !== undefined &&
          item.hypocenter?.lon !== undefined,
      )
      .slice(0, 10)
      .map((item) => ({
        id: item.eid,
        source: 'JMA' as const,
        time: item.time,
        location: item.hypocenter.name ?? '不明',
        latitude: item.hypocenter.lat,
        longitude: item.hypocenter.lon,
        depth: item.hypocenter.depth,
        magnitude: item.hypocenter.magnitude,
        maxIntensity: scaleToIntensity(item.maxScale),
        tsunami: item.domesticTsunami !== 'None' && item.domesticTsunami !== 'Unknown',
        url: null,
      }))
  } catch (err) {
    console.error('Failed to fetch JMA earthquake data:', err)
    return []
  }
}

async function fetchUSGSEarthquakes(): Promise<EarthquakeInfo[]> {
  try {
    const res = await fetch(
      'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_week.geojson',
      {
        next: { revalidate: 3600 },
        headers: {
          'User-Agent': 'saigaishi-navi/1.0 (disaster-info-site)',
        },
      },
    )
    if (!res.ok) {
      console.error(`USGS API error: ${res.status}`)
      return []
    }
    const data: USGSResponse = await res.json()

    return data.features.slice(0, 10).map((feature) => ({
      id: feature.id,
      source: 'USGS' as const,
      time: new Date(feature.properties.time).toISOString(),
      location: feature.properties.place ?? 'Unknown',
      latitude: feature.geometry.coordinates[1],
      longitude: feature.geometry.coordinates[0],
      depth: feature.geometry.coordinates[2],
      magnitude: feature.properties.mag,
      maxIntensity: null,
      tsunami: false,
      url: feature.properties.url,
    }))
  } catch (err) {
    console.error('Failed to fetch USGS earthquake data:', err)
    return []
  }
}

export async function GET() {
  try {
    const [jmaData, usgsData] = await Promise.allSettled([
      fetchJMAEarthquakes(),
      fetchUSGSEarthquakes(),
    ])

    const jmaEarthquakes = jmaData.status === 'fulfilled' ? jmaData.value : []
    const usgsEarthquakes = usgsData.status === 'fulfilled' ? usgsData.value : []

    // 統合してtimeでソート（新しい順）、最大10件
    const combined = [...jmaEarthquakes, ...usgsEarthquakes]
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 10)

    return NextResponse.json(
      {
        success: true,
        count: combined.length,
        updatedAt: new Date().toISOString(),
        earthquakes: combined,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
        },
      },
    )
  } catch (err) {
    console.error('latest-disasters API error:', err)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch disaster data', earthquakes: [] },
      { status: 500 },
    )
  }
}
