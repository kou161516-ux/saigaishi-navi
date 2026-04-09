import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

interface SourceItem {
  title: string
  url?: string
}

interface DisasterData {
  slug?: string
  sources?: SourceItem[]
  [key: string]: unknown
}

interface LinkCheckResult {
  file: string
  slug: string
  url: string
  title: string
  status: number | null
  ok: boolean
  error: string | null
  checkedAt: string
}

async function checkUrl(url: string): Promise<{ status: number | null; ok: boolean; error: string | null }> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10秒タイムアウト
    const res = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'saigaishi-navi/1.0 (link-checker)',
      },
      redirect: 'follow',
    })
    clearTimeout(timeoutId)
    return { status: res.status, ok: res.ok, error: null }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    // HEADが拒否された場合はGETで再試行
    if (errorMessage.includes('405') || errorMessage.includes('Method Not Allowed')) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000)
        const res = await fetch(url, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'User-Agent': 'saigaishi-navi/1.0 (link-checker)',
          },
          redirect: 'follow',
        })
        clearTimeout(timeoutId)
        return { status: res.status, ok: res.ok, error: null }
      } catch (retryErr) {
        const retryMessage = retryErr instanceof Error ? retryErr.message : 'Unknown error'
        return { status: null, ok: false, error: retryMessage }
      }
    }
    return { status: null, ok: false, error: errorMessage }
  }
}

export async function GET() {
  try {
    const dataDir = path.join(process.cwd(), 'src', 'data', 'disasters')

    if (!fs.existsSync(dataDir)) {
      return NextResponse.json(
        { success: false, error: 'disasters data directory not found' },
        { status: 404 },
      )
    }

    const files = fs.readdirSync(dataDir).filter((f) => f.endsWith('.json'))
    const allResults: LinkCheckResult[] = []
    const checkedAt = new Date().toISOString()

    for (const file of files) {
      const filePath = path.join(dataDir, file)
      let data: DisasterData
      try {
        const raw = fs.readFileSync(filePath, 'utf-8')
        data = JSON.parse(raw)
      } catch {
        continue
      }

      const slug = data.slug ?? file.replace('.json', '')
      const sources = data.sources ?? []

      for (const source of sources) {
        if (!source.url) continue

        const checkResult = await checkUrl(source.url)
        allResults.push({
          file,
          slug,
          url: source.url,
          title: source.title ?? '',
          status: checkResult.status,
          ok: checkResult.ok,
          error: checkResult.error,
          checkedAt,
        })
      }
    }

    const brokenLinks = allResults.filter((r) => !r.ok)
    const okLinks = allResults.filter((r) => r.ok)

    return NextResponse.json(
      {
        success: true,
        summary: {
          total: allResults.length,
          ok: okLinks.length,
          broken: brokenLinks.length,
          checkedAt,
        },
        brokenLinks,
        okLinks,
      },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      },
    )
  } catch (err) {
    console.error('link-check API error:', err)
    return NextResponse.json(
      { success: false, error: 'Failed to check links' },
      { status: 500 },
    )
  }
}
