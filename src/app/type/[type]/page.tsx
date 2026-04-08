import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAllDisasters, getDisastersByType } from '@/lib/disasters'
import { DisasterType } from '@/types/disaster'
import DisasterCard from '@/components/disaster/DisasterCard'
import Breadcrumb from '@/components/ui/Breadcrumb'

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

const typeDescriptions: Record<string, string> = {
  earthquake: '日本・世界で発生した大規模地震の記録。直下型・プレート型など様々な地震の被害と教訓。',
  tsunami: '地震に伴う大規模津波の記録。遠地津波を含む歴史的な津波被害と避難の教訓。',
  typhoon: '日本を襲った大型台風の記録。高潮・強風・豪雨による複合的な被害と備えを解説。',
  flood: '記録的な豪雨・洪水の記録。線状降水帯・河川氾濫による被害と早期避難の重要性。',
  landslide: '大規模な土砂崩れ・土石流の記録。斜面崩壊が集落を直撃した歴史的事例と教訓。',
  volcano: '火山噴火による被害の記録。',
  fire: '大規模火災の記録。',
  other: 'その他の自然災害の記録。',
}

export async function generateStaticParams() {
  const disasters = getAllDisasters()
  const types = Array.from(new Set(disasters.map((d) => d.type)))
  return types.map((type) => ({ type }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string }>
}): Promise<Metadata> {
  const { type } = await params
  const label = typeLabels[type] || type
  return {
    title: `${label}の災害一覧`,
    description: typeDescriptions[type] || `${label}に関する重大災害の記録一覧。`,
  }
}

export default async function TypePage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params
  const disasters = getDisastersByType(type as DisasterType)
  if (disasters.length === 0) notFound()

  const label = typeLabels[type] || type

  return (
    <div>
      <div className="bg-navy-900 text-white py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <Breadcrumb
            items={[
              { label: 'ホーム', href: '/' },
              { label: `${label}の災害` },
            ]}
          />
          <h1 className="text-3xl font-bold">{label}の災害一覧</h1>
          <p className="text-gray-300 mt-2">
            {typeDescriptions[type] || ''} {disasters.length}件
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {disasters.map((disaster) => (
            <DisasterCard key={disaster.slug} disaster={disaster} />
          ))}
        </div>
      </div>
    </div>
  )
}
