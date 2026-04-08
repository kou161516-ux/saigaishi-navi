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
  if (!disaster || !disaster.relatedSlugs) return []
  return disaster.relatedSlugs
    .slice(0, limit)
    .map((s) => getDisasterBySlug(s))
    .filter((d): d is DisasterData => d !== undefined)
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
