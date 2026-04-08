import type { Metadata } from 'next'
import { getAllDisasters } from '@/lib/disasters'
import DisastersClient from './_client'

export const metadata: Metadata = {
  title: '災害一覧',
  description: '日本・世界の重大災害の記録を一覧で確認。地震・津波・台風・洪水など種別・国別・年代別に絞り込みが可能。',
}

export default function DisastersPage() {
  const disasters = getAllDisasters()
  return (
    <div>
      <div className="bg-navy-900 text-white py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold">災害一覧</h1>
          <p className="text-gray-300 mt-2">
            日本・世界の重大災害 {disasters.length}件を収録
          </p>
        </div>
      </div>
      <DisastersClient disasters={disasters} />
    </div>
  )
}
