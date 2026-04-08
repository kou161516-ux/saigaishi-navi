'use client'
import { useState, useMemo } from 'react'
import DisasterCard from '@/components/disaster/DisasterCard'
import { DisasterData } from '@/types/disaster'

const typeLabels: Record<string, string> = {
  earthquake: '地震',
  tsunami: '津波',
  typhoon: '台風',
  flood: '洪水・豪雨',
  landslide: '土砂崩れ',
  volcano: '火山',
  fire: '火災',
  snowstorm: '大雪',
  heatwave: '熱波',
  other: 'その他',
}

interface Props {
  disasters: DisasterData[]
}

export default function DisastersClient({ disasters }: Props) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedCountry, setSelectedCountry] = useState<string>('all')
  const [page, setPage] = useState(1)
  const perPage = 9

  const filtered = useMemo(() => {
    return disasters.filter((d) => {
      const matchSearch =
        searchQuery === '' ||
        d.title.includes(searchQuery) ||
        d.region.includes(searchQuery) ||
        d.tags.some((t) => t.includes(searchQuery))
      const matchType = selectedType === 'all' || d.type === selectedType
      const matchCountry =
        selectedCountry === 'all' || d.country === selectedCountry
      return matchSearch && matchType && matchCountry
    })
  }, [disasters, searchQuery, selectedType, selectedCountry])

  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  const types = Array.from(new Set(disasters.map((d) => d.type)))

  return (
    <div>
      {/* Filters */}
      <div className="bg-white border-b sticky top-0 z-10 py-3 px-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="災害名・地域・タグで検索..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setPage(1)
            }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 min-w-48 focus:outline-none focus:border-amber-400"
          />
          <select
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value)
              setPage(1)
            }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
          >
            <option value="all">全種別</option>
            {types.map((t) => (
              <option key={t} value={t}>
                {typeLabels[t] || t}
              </option>
            ))}
          </select>
          <select
            value={selectedCountry}
            onChange={(e) => {
              setSelectedCountry(e.target.value)
              setPage(1)
            }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
          >
            <option value="all">全地域</option>
            <option value="japan">日本</option>
            <option value="world">世界</option>
          </select>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <p className="text-sm text-gray-500 mb-4">
          {filtered.length}件の災害記事が見つかりました
        </p>

        {paginated.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-lg">検索結果がありません</p>
            <p className="text-sm mt-2">検索条件を変更してみてください</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginated.map((disaster) => (
              <DisasterCard key={disaster.slug} disaster={disaster} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50"
            >
              前へ
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-4 py-2 rounded-lg text-sm ${
                  page === p
                    ? 'bg-amber-400 text-white font-bold'
                    : 'border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50"
            >
              次へ
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
