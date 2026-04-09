import type { Metadata } from 'next'
import Link from 'next/link'
import policeSchoolsData from '@/data/schools/police-schools.json'

export const revalidate = 86400

export const metadata: Metadata = {
  title: '警察学校ナビ 全国一覧 | 災害ナビ',
  description:
    '全国の警察大学校・都道府県警察学校の公式URL・所在地・電話番号を一覧で確認。国立機関から47都道府県の警察学校まで網羅。',
}

type NationalSchool = {
  id: string
  name: string
  nameKana: string
  location: string
  prefecture: string
  tel: string
  url: string
  urlVerified: boolean
  description: string
  established: string
}

type PrefecturalSchool = {
  id: string
  prefecture: string
  name: string
  nameKana: string
  location: string
  tel: string
  url: string
  urlVerified: boolean
  note: string
}

const nationalSchools: NationalSchool[] = policeSchoolsData.national as NationalSchool[]
const prefecturalSchools: PrefecturalSchool[] = policeSchoolsData.prefectural as PrefecturalSchool[]

// 都道府県を地方ブロックでグループ化
const regionGroups: { region: string; prefectures: string[] }[] = [
  {
    region: '北海道・東北',
    prefectures: ['北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県'],
  },
  {
    region: '関東',
    prefectures: [
      '茨城県',
      '栃木県',
      '群馬県',
      '埼玉県',
      '千葉県',
      '東京都',
      '神奈川県',
    ],
  },
  {
    region: '中部',
    prefectures: [
      '新潟県',
      '富山県',
      '石川県',
      '福井県',
      '山梨県',
      '長野県',
      '岐阜県',
      '静岡県',
      '愛知県',
    ],
  },
  {
    region: '近畿',
    prefectures: [
      '三重県',
      '滋賀県',
      '京都府',
      '大阪府',
      '兵庫県',
      '奈良県',
      '和歌山県',
    ],
  },
  {
    region: '中国・四国',
    prefectures: [
      '鳥取県',
      '島根県',
      '岡山県',
      '広島県',
      '山口県',
      '徳島県',
      '香川県',
      '愛媛県',
      '高知県',
    ],
  },
  {
    region: '九州・沖縄',
    prefectures: [
      '福岡県',
      '佐賀県',
      '長崎県',
      '熊本県',
      '大分県',
      '宮崎県',
      '鹿児島県',
      '沖縄県',
    ],
  },
]

export default function PoliceSchoolNaviPage() {
  const verifiedCount = prefecturalSchools.filter((s) => s.urlVerified).length
  const unverifiedCount = prefecturalSchools.filter((s) => !s.urlVerified).length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-blue-900 text-white py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <nav className="text-sm text-blue-200 mb-4">
            <Link href="/" className="hover:text-white transition">
              ホーム
            </Link>
            <span className="mx-2">/</span>
            <span>警察学校ナビ</span>
          </nav>
          <h1 className="text-3xl font-bold">警察学校ナビ 全国一覧</h1>
          <p className="text-blue-200 mt-2">
            国立機関 {nationalSchools.length}校 + 都道府県警察学校 {prefecturalSchools.length}校
          </p>
          <div className="flex flex-wrap gap-4 mt-4 text-sm">
            <span className="bg-blue-700 rounded px-3 py-1">
              URL確認済み: {verifiedCount + nationalSchools.length}校
            </span>
            <span className="bg-gray-600 rounded px-3 py-1">
              公式サイト調査中: {unverifiedCount}校
            </span>
            <span className="text-blue-300">最終更新: {policeSchoolsData.updatedAt}</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 国立機関セクション */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="w-1 h-7 bg-blue-700 rounded inline-block"></span>
            国立機関
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {nationalSchools.map((school) => (
              <div
                key={school.id}
                className="bg-white rounded-xl border border-blue-100 shadow-sm p-5 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{school.name}</h3>
                    <p className="text-xs text-gray-400">{school.nameKana}</p>
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-800 rounded px-2 py-0.5 whitespace-nowrap">
                    {school.established}設立
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{school.description}</p>
                <div className="space-y-1 text-sm text-gray-500">
                  <p>
                    <span className="font-medium text-gray-700">所在地</span> {school.location}
                  </p>
                  <p>
                    <span className="font-medium text-gray-700">電話</span>{' '}
                    <a href={`tel:${school.tel}`} className="hover:text-blue-600 transition">
                      {school.tel}
                    </a>
                  </p>
                </div>
                <div className="mt-3">
                  <a
                    href={school.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium transition"
                  >
                    公式サイトを見る
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 都道府県別セクション */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="w-1 h-7 bg-blue-700 rounded inline-block"></span>
            都道府県警察学校（47校）
          </h2>

          <div className="space-y-10">
            {regionGroups.map((group) => {
              const schools = group.prefectures
                .map((pref) => prefecturalSchools.find((s) => s.prefecture === pref))
                .filter((s): s is PrefecturalSchool => s !== undefined)

              return (
                <div key={group.region}>
                  <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-3">
                    {group.region}
                  </h3>
                  <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                    <table className="w-full text-sm bg-white">
                      <thead>
                        <tr className="bg-gray-50 text-gray-600 text-left">
                          <th className="px-4 py-3 font-medium w-20">都道府県</th>
                          <th className="px-4 py-3 font-medium">学校名</th>
                          <th className="px-4 py-3 font-medium hidden md:table-cell">所在地</th>
                          <th className="px-4 py-3 font-medium hidden lg:table-cell">電話番号</th>
                          <th className="px-4 py-3 font-medium w-36">公式サイト</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {schools.map((school) => (
                          <tr
                            key={school.id}
                            className="hover:bg-blue-50 transition"
                          >
                            <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                              {school.prefecture}
                            </td>
                            <td className="px-4 py-3 font-medium text-gray-900">
                              {school.name}
                            </td>
                            <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                              {school.location}
                            </td>
                            <td className="px-4 py-3 text-gray-500 hidden lg:table-cell whitespace-nowrap">
                              <a
                                href={`tel:${school.tel}`}
                                className="hover:text-blue-600 transition"
                              >
                                {school.tel}
                              </a>
                            </td>
                            <td className="px-4 py-3">
                              {school.urlVerified ? (
                                <a
                                  href={school.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium transition text-xs"
                                >
                                  公式サイト
                                  <svg
                                    className="w-3 h-3"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                    />
                                  </svg>
                                </a>
                              ) : (
                                <span className="inline-block text-xs bg-gray-100 text-gray-500 rounded px-2 py-0.5">
                                  調査中
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* 注意書き */}
        <div className="mt-12 bg-yellow-50 border border-yellow-200 rounded-lg p-5 text-sm text-yellow-800">
          <h4 className="font-bold mb-2">ご利用上の注意</h4>
          <ul className="space-y-1 list-disc list-inside text-yellow-700">
            <li>掲載情報は {policeSchoolsData.updatedAt} 時点での調査結果です</li>
            <li>都道府県警察のサイト改修により、URLが変更される場合があります</li>
            <li>電話番号は警察本部代表番号を掲載している場合があります</li>
            <li>
              最新情報は各警察学校・警察本部の公式サイトでご確認ください
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
