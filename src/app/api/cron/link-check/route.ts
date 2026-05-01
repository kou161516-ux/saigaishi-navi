import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// Vercel Cron: 毎週日曜02:00 UTC実行
// 全disaster JSONのsources URLをチェックして壊れたリンクを記録

interface SourceItem {
  title?: string
  url?: string
}

interface DisasterData {
  slug?: string
  sources?: SourceItem[]
  [key: string]: unknown
}

interface LinkCheckResult {
  file: string
  url: string
  status: number | string
}

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET
  const authHeader = request.headers.get('authorization')
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const disastersDir = path.join(process.cwd(), 'src/data/disasters')

  let files: string[]
  try {
    files = await fs.readdir(disastersDir)
  } catch {
    return NextResponse.json(
      { error: 'disasters directory not found', ok: false },
      { status: 404 },
    )
  }

  const results: LinkCheckResult[] = []

  for (const file of files.filter((f) => f.endsWith('.json'))) {
    let data: DisasterData
    try {
      const raw = await fs.readFile(path.join(disastersDir, file), 'utf-8')
      data = JSON.parse(raw) as DisasterData
    } catch {
      continue
    }

    const sources = data.sources ?? []

    for (const source of sources.filter((s) => s.url)) {
      const url = source.url as string
      try {
        const res = await fetch(url, {
          method: 'HEAD',
          headers: { 'User-Agent': 'saigaishi-navi-linkchecker/1.0' },
          signal: AbortSignal.timeout(8000),
          redirect: 'follow',
        })
        if (!res.ok && res.status !== 301 && res.status !== 302) {
          results.push({ file, url, status: res.status })
        }
      } catch {
        results.push({ file, url, status: 'error' })
      }
    }
  }

  return NextResponse.json({
    ok: true,
    timestamp: new Date().toISOString(),
    broken: results,
    brokenCount: results.length,
  })
}
