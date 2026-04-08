import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getDisastersByEra } from '@/lib/disasters'
import DisasterCard from '@/components/disaster/DisasterCard'
import Breadcrumb from '@/components/ui/Breadcrumb'

const validEras = ['1920s', '1930s', '1940s', '1950s', '1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s']

export function generateStaticParams() {
  return validEras.map((era) => ({ era }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ era: string }>
}): Promise<Metadata> {
  const { era } = await params
  return {
    title: `${era}の災害一覧`,
    description: `${era}代に発生した重大災害の記録。`,
  }
}

export default async function EraPage({ params }: { params: Promise<{ era: string }> }) {
  const { era } = await params
  const disasters = getDisastersByEra(era)
  if (disasters.length === 0) notFound()

  return (
    <div>
      <div className="bg-navy-900 text-white py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <Breadcrumb
            items={[
              { label: 'ホーム', href: '/' },
              { label: `${era}の災害` },
            ]}
          />
          <h1 className="text-3xl font-bold">{era}代の災害一覧</h1>
          <p className="text-gray-300 mt-2">{disasters.length}件の記録</p>
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
