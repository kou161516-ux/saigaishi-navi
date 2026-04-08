import Link from 'next/link'
import { DisasterData } from '@/types/disaster'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

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

const typeColors: Record<string, string> = {
  earthquake: 'bg-red-100 text-red-800',
  tsunami: 'bg-blue-100 text-blue-800',
  typhoon: 'bg-purple-100 text-purple-800',
  flood: 'bg-blue-100 text-blue-800',
  landslide: 'bg-yellow-100 text-yellow-800',
  volcano: 'bg-orange-100 text-orange-800',
  fire: 'bg-red-100 text-red-800',
  snowstorm: 'bg-gray-100 text-gray-800',
  heatwave: 'bg-yellow-100 text-yellow-800',
  other: 'bg-gray-100 text-gray-800',
}

interface Props {
  disaster: DisasterData
}

export default function DisasterCard({ disaster }: Props) {
  const formattedDate = format(new Date(disaster.date), 'yyyy年M月d日', {
    locale: ja,
  })
  const shortSummary =
    disaster.summary.length > 80
      ? disaster.summary.slice(0, 80) + '…'
      : disaster.summary

  return (
    <Link href={`/disasters/${disaster.slug}`} className="block group">
      <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow h-full flex flex-col">
        {/* Type badge */}
        <div className="flex items-center justify-between mb-3">
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full ${typeColors[disaster.type] || typeColors.other}`}
          >
            {typeLabels[disaster.type] || disaster.type}
          </span>
          {disaster.country === 'japan' ? (
            <span className="text-xs text-gray-400">🇯🇵 日本</span>
          ) : (
            <span className="text-xs text-gray-400">🌍 世界</span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-bold text-gray-900 group-hover:text-amber-600 transition mb-2 flex-grow">
          {disaster.title}
        </h3>

        {/* Date & Region */}
        <p className="text-sm text-gray-500 mb-1">{formattedDate}</p>
        <p className="text-sm text-gray-500 mb-3">{disaster.region}</p>

        {/* Summary */}
        <p className="text-sm text-gray-600 leading-relaxed mb-4">{shortSummary}</p>

        {/* Deaths */}
        {disaster.deaths !== undefined && (
          <div className="border-t border-gray-100 pt-3 mt-auto">
            <span className="text-xs text-gray-500">
              死者数:{' '}
              <span className="font-semibold text-gray-700">
                {disaster.deaths.toLocaleString()}人
              </span>
              {disaster.missing ? (
                <span className="ml-2 text-gray-500">
                  行方不明: {disaster.missing.toLocaleString()}人
                </span>
              ) : null}
            </span>
          </div>
        )}

        {/* Magnitude */}
        {disaster.magnitude && (
          <p className="text-xs text-gray-500 mt-1">規模: {disaster.magnitude}</p>
        )}
      </div>
    </Link>
  )
}
