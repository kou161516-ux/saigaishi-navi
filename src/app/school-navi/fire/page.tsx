import type { Metadata } from 'next'
import Link from 'next/link'
import Breadcrumb from '@/components/ui/Breadcrumb'
import InsWebAffiliateBox from '@/components/affiliate/InsWebAffiliateBox'
import fireSchoolsData from '@/data/schools/fire-schools.json'

export const revalidate = 86400

export const metadata: Metadata = {
  title: '消防学校ナビ 全国一覧 | 消防大学校・都道府県消防学校・政令指定都市消防局',
  description:
    '全国47都道府県の消防学校・消防大学校・政令指定都市20市の消防局（訓練センター）の公式情報一覧。所在地・電話番号・公式サイトURLを掲載。消防職員・消防団員の教育訓練機関ガイド。',
}

interface NationalSchool {
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

interface PrefecturalSchool {
  id: string
  prefecture: string
  name: string
  location: string
  tel: string
  url: string
  urlVerified: boolean
  note: string
}

interface DesignatedCitySchool {
  id: string
  city: string
  prefecture: string
  name: string
  trainingFacility: string
  location: string
  tel: string
  url: string
  urlVerified: boolean
  note: string
}

const REGION_MAP: Record<string, string[]> = {
  北海道: ['北海道'],
  東北: ['青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県'],
  関東: ['茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県'],
  中部: ['新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県', '静岡県', '愛知県'],
  近畿: ['三重県', '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県'],
  中国: ['鳥取県', '島根県', '岡山県', '広島県', '山口県'],
  四国: ['徳島県', '香川県', '愛媛県', '高知県'],
  九州沖縄: ['福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'],
}

export default function FireSchoolNaviPage() {
  const { national, prefectural, designatedCities, updatedAt } = fireSchoolsData as {
    updatedAt: string
    national: NationalSchool[]
    prefectural: PrefecturalSchool[]
    designatedCities: DesignatedCitySchool[]
  }

  const verifiedCount =
    national.filter((s) => s.urlVerified).length +
    prefectural.filter((s) => s.urlVerified).length +
    designatedCities.filter((s) => s.urlVerified).length

  const totalCount = national.length + prefectural.length + designatedCities.length

  const getSchoolByPref = (pref: string): PrefecturalSchool | undefined =>
    prefectural.find((s) => s.prefecture === pref)

  return (
    <div>
      {/* ヘッダー */}
      <div className="text-white py-10 px-4" style={{ backgroundColor: '#7f1d1d' }}>
        <div className="max-w-6xl mx-auto">
          <Breadcrumb
            items={[
              { label: 'ホーム', href: '/' },
              { label: '学校ナビ', href: '/school-navi' },
              { label: '消防学校ナビ' },
            ]}
          />
          <h1 className="text-3xl font-bold">消防学校ナビ 全国一覧</h1>
          <p className="mt-2" style={{ color: '#fca5a5' }}>
            消防大学校・消防研究センター・全国47都道府県消防学校・政令指定都市20市消防局の公式情報
          </p>
          <p className="text-sm mt-2" style={{ color: '#fca5a5', opacity: 0.8 }}>
            URL確認済み: {verifiedCount} / {totalCount}件　最終更新: {updatedAt}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 概要 */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-5 mb-8">
          <h2 className="text-lg font-bold text-red-900 mb-2">消防学校について</h2>
          <p className="text-sm text-red-800 leading-relaxed">
            消防学校は消防組織法第51条に基づき、都道府県が設置する消防職員・消防団員の教育訓練機関です。
            国の機関として<strong>消防大学校</strong>（総務省消防庁・東京都調布市）が幹部消防吏員等の研修を担い、
            各都道府県消防学校では初任教育・専科教育・幹部教育等を実施しています。
          </p>
        </div>

        {/* 国立機関カード */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-5 border-b-2 border-red-600 pb-2">
            国立消防機関
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {national.map((school) => (
              <div
                key={school.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
              >
                <div className="text-white px-6 py-4" style={{ backgroundColor: '#b91c1c' }}>
                  <p className="text-xs mb-1" style={{ color: '#fca5a5' }}>{school.nameKana}</p>
                  <h3 className="text-xl font-bold">{school.name}</h3>
                  <p className="text-sm mt-0.5" style={{ color: '#fecaca' }}>設立: {school.established}</p>
                </div>
                <div className="p-6 space-y-4">
                  <p className="text-sm text-gray-700 leading-relaxed">{school.description}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="text-gray-500 flex-shrink-0 w-16">所在地</span>
                      <span className="text-gray-800">{school.location}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-gray-500 flex-shrink-0 w-16">電話</span>
                      <span className="text-gray-800">{school.tel}</span>
                    </div>
                  </div>
                  {school.urlVerified ? (
                    <Link
                      href={school.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-white px-4 py-2 rounded-lg text-sm font-medium transition hover:opacity-90"
                      style={{ backgroundColor: '#dc2626' }}
                    >
                      公式サイトへ
                      <span className="text-xs">↗</span>
                    </Link>
                  ) : (
                    <span className="inline-flex items-center bg-gray-100 text-gray-500 px-4 py-2 rounded-lg text-sm">
                      公式サイト調査中
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 都道府県別テーブル */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-5 border-b-2 border-red-600 pb-2">
            都道府県消防学校 一覧
          </h2>

          {Object.entries(REGION_MAP).map(([region, prefs]) => (
            <div key={region} className="mb-8">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span
                  className="text-white text-xs px-2 py-1 rounded"
                  style={{ backgroundColor: '#dc2626' }}
                >
                  {region}
                </span>
                <span className="text-sm font-normal text-gray-500">
                  ({prefs.length}校)
                </span>
              </h3>
              <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100 text-left">
                      <th className="px-4 py-3 font-semibold text-gray-700 whitespace-nowrap">都道府県</th>
                      <th className="px-4 py-3 font-semibold text-gray-700">学校名</th>
                      <th className="px-4 py-3 font-semibold text-gray-700 hidden lg:table-cell">所在地</th>
                      <th className="px-4 py-3 font-semibold text-gray-700 hidden md:table-cell whitespace-nowrap">電話番号</th>
                      <th className="px-4 py-3 font-semibold text-gray-700 whitespace-nowrap">公式サイト</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prefs.map((pref, index) => {
                      const school = getSchoolByPref(pref)
                      if (!school) return null
                      return (
                        <tr
                          key={school.id}
                          className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                        >
                          <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                            {pref}
                          </td>
                          <td className="px-4 py-3 text-gray-800">
                            {school.name}
                            {school.note && (
                              <p className="text-xs text-gray-400 mt-0.5">{school.note}</p>
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-600 hidden lg:table-cell text-xs">
                            {school.location}
                          </td>
                          <td className="px-4 py-3 text-gray-600 hidden md:table-cell whitespace-nowrap">
                            {school.tel}
                          </td>
                          <td className="px-4 py-3">
                            {school.urlVerified ? (
                              <Link
                                href={school.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 font-medium transition hover:opacity-80"
                                style={{ color: '#dc2626' }}
                              >
                                公式サイト
                                <span className="text-xs">↗</span>
                              </Link>
                            ) : (
                              <span className="inline-flex items-center bg-gray-100 text-gray-400 px-2 py-1 rounded text-xs">
                                調査中
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </section>

        {/* 政令指定都市消防局 */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 border-b-2 border-red-600 pb-2">
            政令指定都市消防局 一覧
          </h2>
          <p className="text-sm text-gray-600 mb-5">
            政令指定都市20市は独自の消防局を設置しており、消防学校・訓練センター等の教育訓練施設を運営しています。
          </p>
          <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="px-4 py-3 font-semibold text-gray-700 whitespace-nowrap">都市</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">消防局・訓練施設</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 hidden lg:table-cell">所在地</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 hidden md:table-cell whitespace-nowrap">電話番号</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 whitespace-nowrap">公式サイト</th>
                </tr>
              </thead>
              <tbody>
                {designatedCities.map((city, index) => (
                  <tr
                    key={city.id}
                    className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                      {city.city}
                    </td>
                    <td className="px-4 py-3 text-gray-800">
                      {city.name}
                      {city.trainingFacility && (
                        <p className="text-xs text-red-600 mt-0.5 font-medium">{city.trainingFacility}</p>
                      )}
                      {city.note && (
                        <p className="text-xs text-gray-400 mt-0.5">{city.note}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden lg:table-cell text-xs">
                      {city.location}
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell whitespace-nowrap">
                      {city.tel}
                    </td>
                    <td className="px-4 py-3">
                      {city.urlVerified ? (
                        <Link
                          href={city.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-medium transition hover:opacity-80"
                          style={{ color: '#dc2626' }}
                        >
                          公式サイト
                          <span className="text-xs">↗</span>
                        </Link>
                      ) : (
                        <span className="inline-flex items-center bg-gray-100 text-gray-400 px-2 py-1 rounded text-xs">
                          調査中
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-xs text-orange-800">
            <p className="font-semibold mb-1">📌 政令指定都市消防局について</p>
            <p>政令指定都市は消防組織法に基づき独自の消防本部（消防局）を設置。各消防局は消防職員・消防団員の初任・専科・幹部教育を実施しています。独自の消防学校を持たない市は、都道府県立消防学校と連携して教育訓練を行っています。</p>
          </div>
        </section>

        {/* 関連リンク */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-5 border-b-2 border-red-600 pb-2">
            関連機関リンク
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-bold text-gray-900 mb-3">総務省消防庁</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex gap-2">
                  <span className="flex-shrink-0" style={{ color: '#dc2626' }}>▸</span>
                  消防庁は消防行政・防災行政の中央官庁
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0" style={{ color: '#dc2626' }}>▸</span>
                  消防大学校・消防研究センターを所管
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0" style={{ color: '#dc2626' }}>▸</span>
                  消防統計・防災情報を提供
                </li>
              </ul>
              <div className="mt-4">
                <Link
                  href="https://www.fdma.go.jp/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:underline"
                  style={{ color: '#dc2626' }}
                >
                  総務省消防庁 公式サイト →
                </Link>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-bold text-gray-900 mb-3">消防大学校 関連機関リンク</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex gap-2">
                  <span className="flex-shrink-0" style={{ color: '#dc2626' }}>▸</span>
                  全国の消防学校リンク集を掲載
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0" style={{ color: '#dc2626' }}>▸</span>
                  各都道府県消防学校へのリンク網羅
                </li>
              </ul>
              <div className="mt-4">
                <Link
                  href="https://fdmc.fdma.go.jp/related/index.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:underline"
                  style={{ color: '#dc2626' }}
                >
                  消防大学校 関連機関リンク →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* インズウェブ火災保険アフィリエイト */}
        <InsWebAffiliateBox />

        {/* 免責・更新情報 */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 text-xs text-gray-500">
          <p>
            掲載情報は {updatedAt} 時点の調査に基づきます。公式サイトの移転・変更により情報が古くなる場合があります。
            最新の教育訓練計画・入校要件は必ず各都道府県消防学校の公式サイトでご確認ください。
          </p>
          <p className="mt-1">
            総務省消防庁：
            <Link
              href="https://www.fdma.go.jp/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline ml-1"
            >
              https://www.fdma.go.jp/
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
