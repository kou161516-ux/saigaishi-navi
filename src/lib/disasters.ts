import fs from 'fs'
import path from 'path'
import { DisasterData, DisasterType } from '@/types/disaster'

const DATA_DIR = path.join(process.cwd(), 'src/data/disasters')

export function getAllDisasters(): DisasterData[] {
  const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith('.json'))
  const disasters = files.map((f) => {
    const content = fs.readFileSync(path.join(DATA_DIR, f), 'utf-8')
    return JSON.parse(content) as DisasterData
  })
  return disasters.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
}

export function getDisasterBySlug(slug: string): DisasterData | undefined {
  const filePath = path.join(DATA_DIR, `${slug}.json`)
  if (!fs.existsSync(filePath)) return undefined
  const content = fs.readFileSync(filePath, 'utf-8')
  return JSON.parse(content) as DisasterData
}

export function getDisastersByCountry(country: string): DisasterData[] {
  return getAllDisasters().filter((d) => d.country === country)
}

export function getDisastersByType(type: DisasterType): DisasterData[] {
  return getAllDisasters().filter((d) => d.type === type)
}

export function getDisastersByEra(era: string): DisasterData[] {
  const decade = parseInt(era.replace('s', ''), 10)
  return getAllDisasters().filter((d) => {
    const year = new Date(d.date).getFullYear()
    return year >= decade && year < decade + 10
  })
}

export function getFeaturedDisasters(): DisasterData[] {
  return getAllDisasters().filter((d) => d.featured)
}

export function getRelatedDisasters(
  slug: string,
  limit: number = 3
): DisasterData[] {
  const disaster = getDisasterBySlug(slug)
  if (!disaster) return []

  // 1. relatedSlugs に明示されたものを優先
  const explicitSlugs = disaster.relatedSlugs ?? []
  const explicit = explicitSlugs
    .slice(0, limit)
    .map((s) => getDisasterBySlug(s))
    .filter((d): d is DisasterData => d !== undefined)

  if (explicit.length >= limit) return explicit

  // 2. 不足分を同タイプの災害から自動補完（自分自身・既取得を除く）
  const excludeSlugs = new Set([slug, ...explicit.map((d) => d.slug)])
  const sameType = getAllDisasters()
    .filter((d) => d.type === disaster.type && !excludeSlugs.has(d.slug))
    .slice(0, limit - explicit.length)

  return [...explicit, ...sameType]
}

export function getAllSlugs(): string[] {
  return fs
    .readdirSync(DATA_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace('.json', ''))
}

export function getAllCountries(): string[] {
  const disasters = getAllDisasters()
  return Array.from(new Set(disasters.map((d) => d.country)))
}

export function getAllTypes(): DisasterType[] {
  const disasters = getAllDisasters()
  return Array.from(new Set(disasters.map((d) => d.type))) as DisasterType[]
}

export function getDisasterCountByType(): Record<string, number> {
  const disasters = getAllDisasters()
  return disasters.reduce(
    (acc, d) => {
      acc[d.type] = (acc[d.type] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )
}

export function getTotalDeaths(): number {
  return getAllDisasters().reduce((acc, d) => acc + (d.deaths || 0), 0)
}

export function getTotalLessons(): number {
  return getAllDisasters().reduce((acc, d) => acc + d.lessons.length, 0)
}

export function getAllTags(): string[] {
  const disasters = getAllDisasters()
  const tagSet = new Set<string>()
  disasters.forEach((d) => d.tags.forEach((t) => tagSet.add(t)))
  return Array.from(tagSet).sort()
}

export function getDisastersByTag(tag: string): DisasterData[] {
  return getAllDisasters().filter((d) => d.tags.includes(tag))
}

export function getTagCounts(): Record<string, number> {
  const disasters = getAllDisasters()
  return disasters.reduce((acc, d) => {
    d.tags.forEach((t) => {
      acc[t] = (acc[t] || 0) + 1
    })
    return acc
  }, {} as Record<string, number>)
}

// 直近30日以内に updatedAt または publishedAt が更新された記事を取得
export function getRecentlyUpdatedDisasters(): DisasterData[] {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  return getAllDisasters().filter((d) => {
    const updated = new Date(d.updatedAt || d.publishedAt)
    return updated >= thirtyDaysAgo
  })
}

// カテゴリ別統計（総件数・タイプ別件数・国別件数・総死者数）
export function getDisasterStats(): {
  totalCount: number
  byType: Record<string, number>
  byCountry: Record<string, number>
  totalDeaths: number
} {
  const disasters = getAllDisasters()
  const byType: Record<string, number> = {}
  const byCountry: Record<string, number> = {}
  let totalDeaths = 0

  disasters.forEach((d) => {
    byType[d.type] = (byType[d.type] || 0) + 1
    byCountry[d.country] = (byCountry[d.country] || 0) + 1
    totalDeaths += d.deaths || 0
  })

  return {
    totalCount: disasters.length,
    byType,
    byCountry,
    totalDeaths,
  }
}
