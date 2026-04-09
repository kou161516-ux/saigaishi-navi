'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { DisasterData } from '@/types/disaster'
import DisasterCard from '@/components/disaster/DisasterCard'

interface Props {
  disasters: DisasterData[]
}

const PREPAREDNESS_TIPS = [
  '非常用持ち出し袋に3日分の食料・水を備えましょう',
  '家族との連絡方法・避難場所を事前に話し合いましょう',
  'ハザードマップで自宅周辺のリスクを確認しましょう',
  '家具の転倒防止対策を行いましょう',
  '備蓄水は1人1日3リットルを目安に確保しましょう',
  '携帯ラジオ・懐中電灯の電池を定期的に交換しましょう',
]

export default function SearchBox({ disasters }: Props) {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [results, setResults] = useState<DisasterData[]>([])
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const resultRefs = useRef<(HTMLAnchorElement | null)[]>([])

  // デバウンス 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
      setFocusedIndex(-1)
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  // 検索実行
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([])
      return
    }
    const q = debouncedQuery.toLowerCase()
    const filtered = disasters.filter((d) => {
      return (
        d.title.toLowerCase().includes(q) ||
        d.region.toLowerCase().includes(q) ||
        d.summary.toLowerCase().includes(q) ||
        d.tags.some((t) => t.toLowerCase().includes(q)) ||
        (d.titleEn && d.titleEn.toLowerCase().includes(q))
      )
    })
    setResults(filtered)
  }, [debouncedQuery, disasters])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (results.length === 0) return
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        const next = Math.min(focusedIndex + 1, results.length - 1)
        setFocusedIndex(next)
        resultRefs.current[next]?.focus()
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        if (focusedIndex <= 0) {
          setFocusedIndex(-1)
          inputRef.current?.focus()
        } else {
          const prev = focusedIndex - 1
          setFocusedIndex(prev)
          resultRefs.current[prev]?.focus()
        }
      } else if (e.key === 'Escape') {
        setQuery('')
        setDebouncedQuery('')
        setResults([])
      }
    },
    [focusedIndex, results.length]
  )

  const showResults = debouncedQuery.trim().length > 0

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-8">
      <div className="p-4">
        <label htmlFor="disaster-search" className="sr-only">
          災害を検索
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
              />
            </svg>
          </span>
          <input
            id="disaster-search"
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="災害名・地域・タグで検索（例: 地震、東北、津波）"
            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
            aria-label="災害を検索"
            aria-controls="search-results"
            aria-expanded={showResults}
            role="combobox"
            autoComplete="off"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('')
                setDebouncedQuery('')
                setResults([])
                inputRef.current?.focus()
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="検索をクリア"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* 検索結果 */}
      {showResults && (
        <div id="search-results" role="listbox" aria-label="検索結果">
          {results.length > 0 ? (
            <div className="border-t border-gray-100 p-4">
              <p className="text-xs text-gray-500 mb-4">
                「{debouncedQuery}」の検索結果: {results.length}件
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.map((disaster, i) => (
                  <div
                    key={disaster.slug}
                    role="option"
                    aria-selected={focusedIndex === i}
                  >
                    <DisasterCard disaster={disaster} />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="border-t border-gray-100 p-6">
              <p className="text-sm text-gray-500 mb-4 text-center">
                「{debouncedQuery}」に一致する災害は見つかりませんでした
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm font-bold text-amber-800 mb-3">関連する備えのポイント</p>
                <ul className="space-y-2">
                  {PREPAREDNESS_TIPS.map((tip, i) => (
                    <li key={i} className="text-sm text-amber-900 flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5 shrink-0">✓</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
