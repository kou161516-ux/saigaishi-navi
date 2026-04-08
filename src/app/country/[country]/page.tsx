import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAllDisasters, getDisastersByCountry } from '@/lib/disasters'
import DisasterCard from '@/components/disaster/DisasterCard'
import Breadcrumb from '@/components/ui/Breadcrumb'

const countryLabels: Record<string, string> = {
  japan: '日本',
  world: '世界',
}

const countryDescriptions: Record<string, string> = {
  japan: '日本で発生した重大災害の記録。地震・津波・台風・豪雨など多様な自然災害の歴史を学べます。',
  world: '世界各地で発生した重大災害の記録。日本にも影響を与えた遠地津波なども収録しています。',
}

export async function generateStaticParams() {
  const disasters = getAllDisasters()
  const countries = Array.from(new Set(disasters.map((d) => d.country)))
  return countries.map((country) => ({ country }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string }>
}): Promise<Metadata> {
  const { country } = await params
  const label = countryLabels[country] || country
  return {
    title: `${label}の災害一覧`,
    description: countryDescriptions[country] || `${label}で発生した重大災害の記録一覧。`,
  }
}

export default async function CountryPage({ params }: { params: Promise<{ country: string }> }) {
  const { country } = await params
  const disasters = getDisastersByCountry(country)
  if (disasters.length === 0) notFound()

  const label = countryLabels[country] || country

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
            {countryDescriptions[country] || ''} {disasters.length}件
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
