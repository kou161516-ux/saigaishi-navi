import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

// Vercel Cron: 毎時00分実行
// /news ページのISRキャッシュを強制再生成する

export const dynamic = 'force-dynamic'
export const maxDuration = 30

export async function GET(request: Request) {
  // セキュリティ: Vercel Cronからのリクエストのみ許可
  const cronSecret = process.env.CRON_SECRET
  const authHeader = request.headers.get('authorization')
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    revalidatePath('/news')

    return NextResponse.json({
      ok: true,
      revalidated: '/news',
      timestamp: new Date().toISOString(),
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
