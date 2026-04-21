import type { Metadata } from 'next'
import Link from 'next/link'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'ページが見つかりません',
  description: 'お探しのページは存在しないか、移動した可能性があります。',
}

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <h1 className="text-6xl font-bold text-gray-200 mb-4">404</h1>
      <h2 className="text-2xl font-bold text-gray-800 mb-3">お探しのページは見つかりません</h2>
      <p className="text-gray-600 mb-8">
        お探しのページは存在しないか、移動した可能性があります。
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/"
          className="bg-navy-900 text-white px-8 py-3 rounded-lg hover:bg-navy-800 transition font-medium"
        >
          トップページへ戻る
        </Link>
        <Link
          href="/disasters"
          className="bg-amber-500 text-white px-8 py-3 rounded-lg hover:bg-amber-600 transition font-medium"
        >
          過去の災害一覧を見る
        </Link>
      </div>
    </div>
  )
}
