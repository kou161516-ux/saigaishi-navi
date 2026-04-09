import { NextResponse } from 'next/server'
import { getAllDisasters } from '@/lib/disasters'

// Vercel Cron: 毎日 0:30 UTC に実行
// vercel.json で設定: "0 0/30 * * * *" → "30 0 * * *"
// 以下をチェックして結果を返す:
// 1. 進行中災害記事の更新状況（30日以上未更新）
// 2. 今日が周年記念日の記事（5年・10年節目）
// 3. updatedAt が 90日以上経過した記事リスト

export const dynamic = 'force-dynamic'
export const maxDuration = 30

// ============================
// 型定義
// ============================

interface OngoingAlert {
  slug: string
  title: string
  updatedAt: string
  daysSinceUpdate: number
  reason: string
  sourceUrl: string | null
}

interface AnniversaryNotice {
  slug: string
  title: string
  disasterYear: number
  currentYear: number
  milestone: number
}

interface StaleArticle {
  slug: string
  title: string
  updatedAt: string
  daysSinceUpdate: number
}

interface ArticleCheckResult {
  ok: boolean
  timestamp: string
  totalArticles: number
  ongoingAlerts: OngoingAlert[]
  anniversaryNotices: AnniversaryNotice[]
  staleArticles: StaleArticle[]
  summary: {
    ongoingCount: number
    anniversaryCount: number
    staleCount: number
  }
}

// ============================
// 設定定数
// ============================

const ONGOING_THRESHOLD_DAYS = 30
const STALE_THRESHOLD_DAYS = 90
const ANNIVERSARY_MILESTONES = [5, 10, 15, 20, 25, 30, 50, 75, 100]

/** 進行中の災害スラッグと理由 */
const ONGOING_DISASTERS: Record<string, { reason: string; sourceUrl: string }> = {
  'noto-earthquake-2024': {
    reason: '関連死・復興状況が継続変化中',
    sourceUrl: 'https://www.bousai.go.jp/updates/r60101notojishin/',
  },
  'turkey-syria-earthquake-2023': {
    reason: '復興状況・死者数が変化中',
    sourceUrl: 'https://reliefweb.int/disaster/eq-2023-000015-tur',
  },
}

// ============================
// ユーティリティ
// ============================

function diffDays(dateA: Date, dateB: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24
  return Math.floor((dateA.getTime() - dateB.getTime()) / msPerDay)
}

function getMilestoneAnniversary(disasterYear: number, currentYear: number): number | null {
  const age = currentYear - disasterYear
  return ANNIVERSARY_MILESTONES.includes(age) ? age : null
}

// ============================
// チェックロジック
// ============================

function checkOngoingDisasters(
  articles: ReturnType<typeof getAllDisasters>,
  now: Date,
): OngoingAlert[] {
  const alerts: OngoingAlert[] = []

  for (const [slug, meta] of Object.entries(ONGOING_DISASTERS)) {
    const article = articles.find((a) => a.slug === slug)
    if (!article) continue

    const updatedStr = article.updatedAt ?? article.publishedAt
    const updatedDate = new Date(updatedStr)
    const daysSinceUpdate = diffDays(now, updatedDate)

    if (daysSinceUpdate >= ONGOING_THRESHOLD_DAYS) {
      alerts.push({
        slug,
        title: article.title,
        updatedAt: updatedStr,
        daysSinceUpdate,
        reason: meta.reason,
        sourceUrl: meta.sourceUrl,
      })
    }
  }

  return alerts
}

function checkAnniversaries(
  articles: ReturnType<typeof getAllDisasters>,
  now: Date,
): AnniversaryNotice[] {
  const currentYear = now.getFullYear()
  const notices: AnniversaryNotice[] = []

  for (const article of articles) {
    const disasterYear = new Date(article.date).getFullYear()
    const milestone = getMilestoneAnniversary(disasterYear, currentYear)
    if (!milestone) continue

    notices.push({
      slug: article.slug,
      title: article.title,
      disasterYear,
      currentYear,
      milestone,
    })
  }

  return notices
}

function checkStaleArticles(
  articles: ReturnType<typeof getAllDisasters>,
  now: Date,
): StaleArticle[] {
  const stale: StaleArticle[] = []

  for (const article of articles) {
    const updatedStr = article.updatedAt ?? article.publishedAt
    const updatedDate = new Date(updatedStr)
    const daysSinceUpdate = diffDays(now, updatedDate)

    if (daysSinceUpdate >= STALE_THRESHOLD_DAYS) {
      stale.push({
        slug: article.slug,
        title: article.title,
        updatedAt: updatedStr,
        daysSinceUpdate,
      })
    }
  }

  // 古い順にソート
  return stale.sort((a, b) => b.daysSinceUpdate - a.daysSinceUpdate)
}

// ============================
// ルートハンドラー
// ============================

export async function GET(request: Request): Promise<NextResponse<ArticleCheckResult | { error: string }>> {
  // CRON_SECRET 認証
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()

  try {
    // 全記事読み込み
    const articles = getAllDisasters()

    // 各チェック実行
    const ongoingAlerts = checkOngoingDisasters(articles, now)
    const anniversaryNotices = checkAnniversaries(articles, now)
    const staleArticles = checkStaleArticles(articles, now)

    const result: ArticleCheckResult = {
      ok: true,
      timestamp: now.toISOString(),
      totalArticles: articles.length,
      ongoingAlerts,
      anniversaryNotices,
      staleArticles,
      summary: {
        ongoingCount: ongoingAlerts.length,
        anniversaryCount: anniversaryNotices.length,
        staleCount: staleArticles.length,
      },
    }

    return NextResponse.json(result)
  } catch (err) {
    console.error('article-check cron error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
