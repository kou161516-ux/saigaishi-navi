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

type SortKey = 'date_desc' | 'date_asc' | 'damage_desc' | 'title_asc'

const sortOptions: { value: SortKey; label: string }[] = [
  { value: 'date_desc', label: '新しい順' },
  { value: 'date_asc',  label: '古い順' },
  { value: 'damage_desc', label: '被害規模順' },
  { value: 'title_asc',  label: 'タイトル順' },
]

// 1900年代〜2020年代（10年ごと）のうち実際にデータがある年代のみ表示
const ERA_DECADES = [1900, 1910, 1920, 1930, 1940, 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020]

interface Props {
  disasters: DisasterData[]
}

export default function DisastersClient({ disasters }: Props) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedCountry, setSelectedCountry] = useState<string>('all')
  const [selectedDecade, setSelectedDecade] = useState<number | null>(null)
  const [sortKey, setSortKey] = useState<SortKey>('date_desc')
  const [page, setPage] = useState(1)
  const perPage = 9

  // 実際にデータがある年代のみ
  const availableDecades = useMemo(() => {
    return ERA_DECADES.filter((decade) =>
      disasters.some((d) => {
        const y = new Date(d.date).getFullYear()
        return y >= decade && y < decade + 10
      })
    )
  }, [disasters])

  const filtered = useMemo(() => {
    let result = disasters.filter((d) => {
      const matchSearch =
        searchQuery === '' ||
        d.title.includes(searchQuery) ||
        d.region.includes(searchQuery) ||
        d.tags.some((t) => t.includes(searchQuery))
      const matchType = selectedType === 'all' || d.type === selectedType
      const matchCountry =
        selectedCountry === 'all' || d.country === selectedCountry
      const matchDecade =
        selectedDecade === null ||
        (() => {
          const y = new Date(d.date).getFullYear()
          return y >= selectedDecade && y < selectedDecade + 10
        })()
      return matchSearch && matchType && matchCountry && matchDecade
    })

    // ソート
    result = [...result].sort((a, b) => {
      if (sortKey === 'date_desc') return new Date(b.date).getTime() - new Date(a.date).getTime()
      if (sortKey === 'date_asc')  return new Date(a.date).getTime() - new Date(b.date).getTime()
      if (sortKey === 'damage_desc') {
        const ta = (a.deaths ?? 0) + (a.missing ?? 0)
        const tb = (b.deaths ?? 0) + (b.missing ?? 0)
        return tb - ta
      }
      if (sortKey === 'title_asc') return a.title.localeCompare(b.title, 'ja')
      return 0
    })

    return result
  }, [disasters, searchQuery, selectedType, selectedCountry, selectedDecade, sortKey])

  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  const types = Array.from(new Set(disasters.map((d) => d.type)))

  const resetPage = () => setPage(1)

  return (
    <div>
      {/* Filters */}
      <div className="bg-white border-b sticky top-0 z-10 py-3 px-4 shadow-sm">
        <div className="max-w-6xl mx-auto space-y-3">
          {/* 検索＋種別＋地域＋ソート */}
          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              placeholder="災害名・地域・タグで検索..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); resetPage() }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 min-w-48 focus:outline-none focus:border-amber-400"
            />
            <select
              value={selectedType}
              onChange={(e) => { setSelectedType(e.target.value); resetPage() }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
            >
              <option value="all">全種別</option>
              {types.map((t) => (
                <option key={t} value={t}>{typeLabels[t] || t}</option>
              ))}
            </select>
            {/* 国別タブ */}
            <div className="flex rounded-lg border border-gray-300 overflow-hidden text-sm">
              {[
                { value: 'all', label: 'すべて' },
                { value: 'japan', label: '🇯🇵 日本' },
                { value: 'world', label: '🌍 世界' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setSelectedCountry(opt.value); resetPage() }}
                  className={`px-4 py-2 transition ${
                    selectedCountry === opt.value
                      ? 'bg-amber-400 text-white font-bold'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <select
              value={sortKey}
              onChange={(e) => { setSortKey(e.target.value as SortKey); resetPage() }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
            >
              {sortOptions.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* 年代フィルター */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-gray-500 font-medium">年代:</span>
            <button
              onClick={() => { setSelectedDecade(null); resetPage() }}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
                selectedDecade === null
                  ? 'bg-amber-400 text-white border-amber-400'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-amber-300'
              }`}
            >
              すべて
            </button>
            {availableDecades.map((decade) => (
              <button
                key={decade}
                onClick={() => { setSelectedDecade(decade); resetPage() }}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
                  selectedDecade === decade
                    ? 'bg-amber-400 text-white border-amber-400'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-amber-300'
                }`}
              >
                {decade}年代
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 件数表示 */}
        <p className="text-sm text-gray-500 mb-4">
          全{disasters.length}件中 <span className="font-semibold text-gray-700">{filtered.length}件</span> 表示
          {filtered.length !== paginated.length && (
            <span className="ml-1">（{(page - 1) * perPage + 1}〜{Math.min(page * perPage, filtered.length)}件目）</span>
          )}
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
