import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { DisasterData } from '@/types/disaster'

interface ArticleIssue {
  slug: string
  title: string
  score: number
  issues: string[]
  suggestions: string[]
}

interface ArticleScore {
  slug: string
  score: number
  title: string
}

interface ImproveResponse {
  generated: string
  totalArticles: number
  averageScore: number
  needsImprovement: ArticleIssue[]
  scores: ArticleScore[]
}

function calculateScore(disaster: DisasterData): {
  score: number
  issues: string[]
  suggestions: string[]
} {
  let score = 0
  const issues: string[] = []
  const suggestions: string[] = []

  // relatedSlugs >= 3件: +15点
  const relatedCount = disaster.relatedSlugs?.length ?? 0
  if (relatedCount >= 3) {
    score += 15
  } else {
    issues.push('relatedSlugs不足')
    suggestions.push('関連記事を3件以上追加')
  }

  // lessons >= 4件: +15点
  if (disaster.lessons.length >= 4) {
    score += 15
  } else {
    issues.push('lessons不足')
    suggestions.push('教訓を4件以上追加')
  }

  // preparedness >= 4件: +15点
  if (disaster.preparedness.length >= 4) {
    score += 15
  } else {
    issues.push('preparedness不足')
    suggestions.push('備えを4件以上追加')
  }

  // sources >= 3件: +15点
  const sourcesCount = disaster.sources?.length ?? 0
  if (sourcesCount >= 3) {
    score += 15
  } else {
    issues.push('sources少ない')
    suggestions.push('出典を3件以上追加')
  }

  // tags >= 4件: +10点
  if (disaster.tags.length >= 4) {
    score += 10
  } else {
    issues.push('tags不足')
    suggestions.push('タグを4件以上追加')
  }

  // summary >= 150文字: +15点
  if (disaster.summary.length >= 150) {
    score += 15
  } else {
    issues.push('summary短すぎる')
    suggestions.push('概要を150文字以上に拡充')
  }

  // metaDescription 50〜160文字: +15点
  const metaLen = disaster.metaDescription?.length ?? 0
  if (metaLen >= 50 && metaLen <= 160) {
    score += 15
  } else if (metaLen === 0) {
    issues.push('metaDescription未設定')
    suggestions.push('metaDescriptionを50〜160文字で設定')
  } else if (metaLen < 50) {
    issues.push('metaDescription短すぎる')
    suggestions.push('metaDescriptionを50文字以上に拡充')
  } else {
    issues.push('metaDescription長すぎる')
    suggestions.push('metaDescriptionを160文字以内に短縮')
  }

  return { score, issues, suggestions }
}

export async function GET(): Promise<NextResponse<ImproveResponse | { error: string }>> {
  try {
    const dataDir = path.join(process.cwd(), 'src', 'data', 'disasters')

    if (!fs.existsSync(dataDir)) {
      return NextResponse.json(
        { error: 'disasters data directory not found' },
        { status: 404 },
      )
    }

    const files = fs.readdirSync(dataDir).filter((f) => f.endsWith('.json'))
    const allScores: ArticleScore[] = []
    const needsImprovement: ArticleIssue[] = []

    for (const file of files) {
      const filePath = path.join(dataDir, file)
      let disaster: DisasterData
      try {
        const raw = fs.readFileSync(filePath, 'utf-8')
        disaster = JSON.parse(raw) as DisasterData
      } catch {
        continue
      }

      const slug = disaster.slug ?? file.replace('.json', '')
      const { score, issues, suggestions } = calculateScore(disaster)

      allScores.push({ slug, score, title: disaster.title })

      if (score < 85 || issues.length > 0) {
        needsImprovement.push({
          slug,
          title: disaster.title,
          score,
          issues,
          suggestions,
        })
      }
    }

    // スコアの低い順にソート
    needsImprovement.sort((a, b) => a.score - b.score)

    // スコアの高い順にソート
    allScores.sort((a, b) => b.score - a.score)

    const totalArticles = allScores.length
    const averageScore =
      totalArticles > 0
        ? Math.round(allScores.reduce((sum, s) => sum + s.score, 0) / totalArticles)
        : 0

    const response: ImproveResponse = {
      generated: new Date().toISOString(),
      totalArticles,
      averageScore,
      needsImprovement,
      scores: allScores,
    }

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    console.error('improve API error:', err)
    return NextResponse.json(
      { error: 'Failed to calculate improvement scores' },
      { status: 500 },
    )
  }
}
