import type { Metadata } from 'next'
import Link from 'next/link'
import sdfSchools from '@/data/schools/sdf-schools.json'

export const revalidate = 86400

export const metadata: Metadata = {
  title: '自衛隊教育ナビ 全機関一覧 | 防衛省・陸海空自衛隊の教育機関',
  description:
    '防衛省直轄大学校から陸上・海上・航空自衛隊の各教育機関まで、公式URL付きで一覧掲載。防衛大学校・防衛医科大学校・各幹部学校・術科学校の所在地・連絡先情報。',
}

type School = {
  id: string
  name: string
  nameEn?: string
  nameKana?: string
  location: string
  prefecture: string
  tel: string
  url: string
  urlVerified: boolean
  description: string
  established?: string
  branches?: string
}

type SectionId = 'ministerial' | 'ground' | 'maritime' | 'air'

const sectionConfig: {
  id: SectionId
  label: string
  colorClass: string
  bgClass: string
  borderClass: string
  badgeClass: string
}[] = [
  {
    id: 'ministerial',
    label: '防衛省直轄',
    colorClass: 'text-purple-800',
    bgClass: 'bg-purple-50',
    borderClass: 'border-purple-200',
    badgeClass: 'bg-purple-100 text-purple-800',
  },
  {
    id: 'ground',
    label: '陸上自衛隊',
    colorClass: 'text-green-800',
    bgClass: 'bg-green-50',
    borderClass: 'border-green-200',
    badgeClass: 'bg-green-100 text-green-800',
  },
  {
    id: 'maritime',
    label: '海上自衛隊',
    colorClass: 'text-blue-800',
    bgClass: 'bg-blue-50',
    borderClass: 'border-blue-200',
    badgeClass: 'bg-blue-100 text-blue-800',
  },
  {
    id: 'air',
    label: '航空自衛隊',
    colorClass: 'text-sky-800',
    bgClass: 'bg-sky-50',
    borderClass: 'border-sky-200',
    badgeClass: 'bg-sky-100 text-sky-800',
  },
]

function SchoolCard({
  school,
  badgeClass,
  borderClass,
}: {
  school: School
  badgeClass: string
  borderClass: string
}) {
  return (
    <div
      className={`bg-white rounded-lg border ${borderClass} p-4 shadow-sm hover:shadow-md transition-shadow`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-base font-bold text-gray-900 leading-snug">{school.name}</h3>
        {school.urlVerified ? (
          <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${badgeClass}`}>
            URL確認済
          </span>
        ) : (
          <span className="flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-500">
            調査中
          </span>
        )}
      </div>

      {school.nameEn && (
        <p className="text-xs text-gray-400 mb-2">{school.nameEn}</p>
      )}

      <p className="text-sm text-gray-600 mb-3 leading-relaxed">{school.description}</p>

      <div className="space-y-1 text-xs text-gray-500">
        <div className="flex items-start gap-1.5">
          <span className="flex-shrink-0 font-medium text-gray-600">所在地</span>
          <span>{school.location}</span>
        </div>
        {school.tel && (
          <div className="flex items-start gap-1.5">
            <span className="flex-shrink-0 font-medium text-gray-600">電話</span>
            <span>{school.tel}</span>
          </div>
        )}
        {school.established && (
          <div className="flex items-start gap-1.5">
            <span className="flex-shrink-0 font-medium text-gray-600">設立</span>
            <span>{school.established}</span>
          </div>
        )}
      </div>

      <div className="mt-3">
        {school.urlVerified ? (
          <a
            href={school.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            公式サイトを開く
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-3 h-3"
            >
              <path
                fillRule="evenodd"
                d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z"
                clipRule="evenodd"
              />
              <path
                fillRule="evenodd"
                d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z"
                clipRule="evenodd"
              />
            </svg>
          </a>
        ) : (
          <span className="text-xs text-gray-400 italic">公式サイト調査中</span>
        )}
      </div>
    </div>
  )
}

export default function SdfSchoolNaviPage() {
  const allSchools: Record<SectionId, School[]> = {
    ministerial: sdfSchools.ministerial as School[],
    ground: sdfSchools.ground as School[],
    maritime: sdfSchools.maritime as School[],
    air: sdfSchools.air as School[],
  }

  const verifiedCount = Object.values(allSchools)
    .flat()
    .filter((s) => s.urlVerified).length
  const totalCount = Object.values(allSchools).flat().length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-gray-900 text-white py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <nav className="text-sm text-gray-400 mb-4">
            <Link href="/" className="hover:text-white transition-colors">
              ホーム
            </Link>
            <span className="mx-2">/</span>
            <span>自衛隊教育ナビ</span>
          </nav>
          <h1 className="text-3xl font-bold mb-2">自衛隊教育ナビ 全機関一覧</h1>
          <p className="text-gray-300 text-sm">
            防衛省・陸上・海上・航空自衛隊の教育機関を公式URLとともに掲載
          </p>
          <div className="flex gap-4 mt-4 text-xs text-gray-400">
            <span>全 {totalCount} 機関</span>
            <span>URL確認済 {verifiedCount} 機関</span>
            <span>更新日: {sdfSchools.updatedAt}</span>
          </div>
        </div>
      </div>

      {/* タブナビゲーション */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-0 overflow-x-auto">
            {sectionConfig.map((sec) => (
              <a
                key={sec.id}
                href={`#${sec.id}`}
                className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 border-transparent hover:border-gray-400 hover:text-gray-700 transition-colors text-gray-500`}
              >
                {sec.label}
                <span className="ml-1.5 text-xs text-gray-400">
                  ({allSchools[sec.id].length})
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-12">
        {/* 注意書き */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
          <strong>ご注意：</strong>
          記載の情報は公式サイトを参照していますが、組織改編等により変更されることがあります。
          最新情報は各機関の公式サイトまたは防衛省（mod.go.jp）でご確認ください。
        </div>

        {sectionConfig.map((sec) => (
          <section key={sec.id} id={sec.id}>
            <div className={`rounded-xl ${sec.bgClass} border ${sec.borderClass} p-6`}>
              <div className="flex items-center gap-3 mb-5">
                <h2 className={`text-xl font-bold ${sec.colorClass}`}>{sec.label}</h2>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${sec.badgeClass}`}
                >
                  {allSchools[sec.id].length} 機関
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {allSchools[sec.id].map((school) => (
                  <SchoolCard
                    key={school.id}
                    school={school}
                    badgeClass={sec.badgeClass}
                    borderClass={sec.borderClass}
                  />
                ))}
              </div>
            </div>
          </section>
        ))}

        {/* フッター注記 */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 text-xs text-gray-500 space-y-1">
          <p>
            本ページの情報は防衛省公式サイト（mod.go.jp）を参照し作成しました。
          </p>
          <p>
            組織改編・移転等により情報が変更となる場合があります。受験・入隊等の手続きには必ず公式サイトをご確認ください。
          </p>
          <p>
            情報の誤りに気づかれた場合は
            <Link href="/contact" className="underline hover:text-gray-700 mx-1">
              お問い合わせ
            </Link>
            からご連絡ください。
          </p>
        </div>
      </div>
    </div>
  )
}
