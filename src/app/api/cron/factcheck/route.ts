import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

// Vercel Cron: 毎週月曜日 1:00 UTC に実行
// 全disaster JSONの基本品質チェック + USGS APIでマグニチュード照合

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// ---- 型定義 ----

interface SourceItem {
  title?: string
  url?: string
}

interface DisasterData {
  slug: string
  title: string
  date: string
  country: string
  type: string
  magnitude?: string
  deaths?: number
  missing?: number
  injured?: number
  affiliateCategory?: string
  tags?: string[]
  sources?: SourceItem[]
  lessons?: string[]
  preparedness?: string[]
  summary?: string
  featured?: boolean
  publishedAt?: string
  metaDescription?: string
  [key: string]: unknown
}

interface USGSQueryParams {
  starttime: string
  endtime: string
  minmagnitude: number
  latitude: number
  longitude: number
  maxradiuskm: number
}

interface USGSGeoJSONFeature {
  id: string
  properties: {
    mag: number
    place: string
    time: number
  }
}

interface USGSGeoJSON {
  features: USGSGeoJSONFeature[]
}

interface QualityIssue {
  slug: string
  field: string
  issue: string
}

interface USGSCheckResult {
  slug: string
  usgsMag: number
  articleMag: number | null
  diff: number
  matched: boolean
  place: string
}

// ---- USGS クエリマッピング（主要地震のみ5件に絞る） ----

const USGS_QUERY_MAP: Record<string, USGSQueryParams> = {
  'chile-earthquake-tsunami-1960': {
    starttime: '1960-05-20', endtime: '1960-05-25',
    minmagnitude: 9.0, latitude: -37.0, longitude: -73.0, maxradiuskm: 500
  },
  'india-ocean-tsunami-2004': {
    starttime: '2004-12-25', endtime: '2004-12-27',
    minmagnitude: 9.0, latitude: 3.3, longitude: 95.9, maxradiuskm: 500
  },
  'noto-earthquake-2024': {
    starttime: '2024-01-01', endtime: '2024-01-02',
    minmagnitude: 7.0, latitude: 37.5, longitude: 137.2, maxradiuskm: 200
  },
  'turkey-syria-earthquake-2023': {
    starttime: '2023-02-05', endtime: '2023-02-07',
    minmagnitude: 7.5, latitude: 37.2, longitude: 37.0, maxradiuskm: 300
  },
  'nepal-earthquake-2015': {
    starttime: '2015-04-24', endtime: '2015-04-26',
    minmagnitude: 7.5, latitude: 28.1, longitude: 84.7, maxradiuskm: 300
  },
}

const USGS_API = 'https://earthquake.usgs.gov/fdsnws/event/1/query'

const VALID_TYPES = [
  'earthquake', 'tsunami', 'typhoon', 'flood', 'landslide',
  'volcano', 'fire', 'snowstorm', 'heatwave', 'other'
] as const

const VALID_AFFILIATE_CATS = [
  'water', 'power', 'evacuation', 'indoor', 'general',
  'tsunami', 'typhoon', 'flood', 'volcano', 'snowstorm', 'heatwave'
] as const

const REQUIRED_FIELDS: (keyof DisasterData)[] = [
  'slug', 'title', 'date', 'country', 'type',
  'summary', 'lessons', 'preparedness', 'tags', 'sources', 'publishedAt'
]

// ---- ユーティリティ ----

/**
 * magnitudeフィールドの文字列から数値を抽出
 * "M7.6", "Mw9.5", "M7.3（本震）" に対応
 */
function parseMagnitude(magnitudeStr: string | undefined): number | null {
  if (!magnitudeStr) return null
  const match = magnitudeStr.match(/M(?:w|s|l|b)?(\d+(?:\.\d+)?)/)
  if (!match) return null
  return parseFloat(match[1])
}

/**
 * USGS APIからGeoJSONを取得（fetch + AbortSignal）
 */
async function fetchUSGSEvent(slug: string, params: USGSQueryParams): Promise<USGSGeoJSONFeature | null> {
  const searchParams = new URLSearchParams({
    format: 'geojson',
    orderby: 'magnitude',
    limit: '1',
    starttime: params.starttime,
    endtime: params.endtime,
    minmagnitude: String(params.minmagnitude),
    latitude: String(params.latitude),
    longitude: String(params.longitude),
    maxradiuskm: String(params.maxradiuskm),
  })

  const reqUrl = `${USGS_API}?${searchParams.toString()}`

  const res = await fetch(reqUrl, {
    headers: { 'User-Agent': 'saigaishi-navi-cron/1.0' },
    signal: AbortSignal.timeout(10000),
    next: { revalidate: 0 },
  })

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${slug}`)
  }

  const data: USGSGeoJSON = await res.json() as USGSGeoJSON

  if (!data.features || data.features.length === 0) {
    return null
  }

  return data.features[0]
}

// ---- メインハンドラ ----

export async function GET(request: Request) {
  // CRON_SECRET 認証
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const disastersDir = path.join(process.cwd(), 'src/data/disasters')

  // ---- 1. 全JSONファイル読み込み ----
  let files: string[]
  try {
    files = (await fs.readdir(disastersDir)).filter((f) => f.endsWith('.json')).sort()
  } catch {
    return NextResponse.json({ error: 'disasters directory not found', ok: false }, { status: 404 })
  }

  const allData: DisasterData[] = []
  const readErrors: string[] = []

  for (const file of files) {
    try {
      const raw = await fs.readFile(path.join(disastersDir, file), 'utf-8')
      allData.push(JSON.parse(raw) as DisasterData)
    } catch {
      readErrors.push(file)
    }
  }

  // ---- 2. 基本品質チェック ----
  const qualityIssues: QualityIssue[] = []

  for (const data of allData) {
    const slug = data.slug ?? '(unknown)'

    // 必須フィールド存在チェック
    for (const field of REQUIRED_FIELDS) {
      const val = data[field]
      if (val === undefined || val === null || val === '') {
        qualityIssues.push({ slug, field: String(field), issue: '必須フィールド欠損' })
      }
    }

    // 型チェック
    if (data.type && !(VALID_TYPES as readonly string[]).includes(data.type)) {
      qualityIssues.push({ slug, field: 'type', issue: `無効な値: "${data.type}"` })
    }
    if (data.affiliateCategory && !(VALID_AFFILIATE_CATS as readonly string[]).includes(data.affiliateCategory)) {
      qualityIssues.push({ slug, field: 'affiliateCategory', issue: `無効な値: "${data.affiliateCategory}"` })
    }

    // 日付フォーマット
    if (data.date && !/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
      qualityIssues.push({ slug, field: 'date', issue: `フォーマット不正: "${data.date}"` })
    }

    // 数値フィールド
    for (const numField of ['deaths', 'missing', 'injured'] as const) {
      if (data[numField] !== undefined && typeof data[numField] !== 'number') {
        qualityIssues.push({ slug, field: numField, issue: `数値でない: ${data[numField]}` })
      }
    }

    // 配列最低件数
    if (Array.isArray(data.lessons) && data.lessons.length < 4) {
      qualityIssues.push({ slug, field: 'lessons', issue: `件数不足: ${data.lessons.length}件` })
    }
    if (Array.isArray(data.preparedness) && data.preparedness.length < 4) {
      qualityIssues.push({ slug, field: 'preparedness', issue: `件数不足: ${data.preparedness.length}件` })
    }

    // metaDescription 文字数
    if (data.metaDescription) {
      if (data.metaDescription.length > 160) {
        qualityIssues.push({ slug, field: 'metaDescription', issue: `長すぎ: ${data.metaDescription.length}文字` })
      }
      if (data.metaDescription.length < 50) {
        qualityIssues.push({ slug, field: 'metaDescription', issue: `短すぎ: ${data.metaDescription.length}文字` })
      }
    }
  }

  // ---- 3. USGS API照合（最大5件、タイムアウト10秒） ----
  const usgsResults: USGSCheckResult[] = []
  const usgsErrors: { slug: string; error: string }[] = []

  const slugToData = new Map(allData.map((d) => [d.slug, d]))

  for (const [slug, params] of Object.entries(USGS_QUERY_MAP)) {
    const articleData = slugToData.get(slug)
    const articleMag = articleData ? parseMagnitude(articleData.magnitude) : null

    try {
      const feature = await fetchUSGSEvent(slug, params)
      if (!feature) {
        usgsErrors.push({ slug, error: 'USGSにデータなし' })
        continue
      }

      const usgsMag = Math.round(feature.properties.mag * 10) / 10
      const diff = articleMag !== null ? Math.abs(usgsMag - articleMag) : 99

      usgsResults.push({
        slug,
        usgsMag,
        articleMag,
        diff: Math.round(diff * 10) / 10,
        matched: diff < 0.2,
        place: feature.properties.place,
      })
    } catch (err) {
      usgsErrors.push({ slug, error: String(err) })
    }
  }

  // ---- 4. レスポンス組み立て ----
  const usgsMismatches = usgsResults.filter((r) => !r.matched)

  return NextResponse.json({
    ok: true,
    timestamp: new Date().toISOString(),
    summary: {
      totalFiles: files.length,
      readErrors: readErrors.length,
      qualityIssues: qualityIssues.length,
      usgsChecked: usgsResults.length,
      usgsMismatches: usgsMismatches.length,
      usgsErrors: usgsErrors.length,
    },
    qualityIssues,
    usgs: {
      results: usgsResults,
      mismatches: usgsMismatches,
      errors: usgsErrors,
    },
    readErrors,
  })
}
