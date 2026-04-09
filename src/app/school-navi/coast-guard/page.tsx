import type { Metadata } from 'next'
import Link from 'next/link'
import Breadcrumb from '@/components/ui/Breadcrumb'
import coastGuardData from '@/data/schools/coast-guard-schools.json'

export const revalidate = 86400

export const metadata: Metadata = {
  title: '海上保安学校ナビ 全国一覧 | 海上保安大学校・海上保安学校・各管区本部',
  description:
    '海上保安庁の教育機関（海上保安大学校・海上保安学校・門司分校・宮城分校）の公式情報と全国11管区本部一覧。入校案内・採用試験・所在地・連絡先を掲載。',
}

interface MainSchool {
  id: string
  name: string
  nameEn: string
  nameKana: string
  location: string
  prefecture: string
  tel: string
  url: string
  urlVerified: boolean
  description: string
  established: string
  admissionInfo: string
  courses: string[]
  branches?: string[]
  notes?: string
}

interface Branch {
  id: string
  name: string
  nameKana: string
  location: string
  prefecture: string
  tel: string
  fax?: string
  url: string
  urlVerified: boolean
  description: string
  parentSchool: string
}

interface District {
  id: string
  name: string
  location: string
  jurisdiction: string
  url: string
  urlVerified: boolean
}

export default function CoastGuardSchoolNaviPage() {
  const { mainSchools, branches, districts, updatedAt } = coastGuardData as {
    updatedAt: string
    mainSchools: MainSchool[]
    branches: Branch[]
    districts: District[]
  }

  const verifiedCount =
    mainSchools.filter((s) => s.urlVerified).length +
    branches.filter((b) => b.urlVerified).length +
    districts.filter((d) => d.urlVerified).length

  const totalCount = mainSchools.length + branches.length + districts.length

  return (
    <div>
      {/* ヘッダー */}
      <div className="bg-navy-900 text-white py-10 px-4" style={{ backgroundColor: '#1a2744' }}>
        <div className="max-w-6xl mx-auto">
          <Breadcrumb
            items={[
              { label: 'ホーム', href: '/' },
              { label: '学校ナビ', href: '/school-navi' },
              { label: '海上保安学校ナビ' },
            ]}
          />
          <h1 className="text-3xl font-bold">海上保安学校ナビ 全国一覧</h1>
          <p className="text-gray-300 mt-2">
            海上保安庁の教育機関は全国2校（大学校・学校）と分校2か所。各管区本部11か所の情報も掲載。
          </p>
          <p className="text-gray-400 text-sm mt-2">
            URL確認済み: {verifiedCount} / {totalCount}件　最終更新: {updatedAt}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 概要 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 mb-8">
          <h2 className="text-lg font-bold text-blue-900 mb-2">海上保安庁の教育機関について</h2>
          <p className="text-sm text-blue-800 leading-relaxed">
            海上保安庁では、幹部職員を養成する<strong>海上保安大学校</strong>（広島県呉市）と、
            一般職員を養成する<strong>海上保安学校</strong>（京都府舞鶴市）の2校が中核教育機関です。
            海上保安学校には<strong>門司分校</strong>（福岡県北九州市）と
            <strong>宮城分校</strong>（宮城県岩沼市）の2分校があります。
            採用試験は人事院・海上保安庁が共同実施します。
          </p>
        </div>

        {/* メイン教育機関カード */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-5 border-b-2 border-blue-600 pb-2">
            主要教育機関
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {mainSchools.map((school) => (
              <div
                key={school.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
              >
                <div className="bg-blue-700 text-white px-6 py-4">
                  <p className="text-xs text-blue-200 mb-1">{school.nameKana}</p>
                  <h3 className="text-xl font-bold">{school.name}</h3>
                  <p className="text-sm text-blue-100">{school.nameEn}</p>
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
                    <div className="flex items-start gap-2">
                      <span className="text-gray-500 flex-shrink-0 w-16">設立</span>
                      <span className="text-gray-800">{school.established}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">教育課程</h4>
                    <ul className="space-y-1">
                      {school.courses.map((course, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-blue-500 mt-0.5">▸</span>
                          {course}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">入校・採用案内</h4>
                    <p className="text-sm text-gray-600">{school.admissionInfo}</p>
                  </div>

                  {school.branches && school.branches.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">分校</h4>
                      <ul className="space-y-1">
                        {school.branches.map((branch, i) => (
                          <li key={i} className="text-sm text-gray-600">
                            ・{branch}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {school.notes && (
                    <div className="bg-amber-50 border border-amber-200 rounded p-3">
                      <p className="text-xs text-amber-800">{school.notes}</p>
                    </div>
                  )}

                  {school.urlVerified ? (
                    <Link
                      href={school.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                    >
                      公式サイトへ
                      <span className="text-xs">↗</span>
                    </Link>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-500 px-4 py-2 rounded-lg text-sm">
                      URL未確認
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 分校 */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-5 border-b-2 border-blue-600 pb-2">
            海上保安学校 分校
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            {branches.map((branch) => (
              <div
                key={branch.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
              >
                <div className="bg-teal-700 text-white px-5 py-3">
                  <p className="text-xs text-teal-200 mb-0.5">{branch.nameKana}</p>
                  <h3 className="text-lg font-bold">{branch.name}</h3>
                </div>
                <div className="p-5 space-y-3">
                  <p className="text-sm text-gray-700">{branch.description}</p>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="text-gray-500 flex-shrink-0 w-16">所在地</span>
                      <span className="text-gray-800">{branch.location}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-gray-500 flex-shrink-0 w-16">電話</span>
                      <span className="text-gray-800">{branch.tel}</span>
                    </div>
                    {branch.fax && (
                      <div className="flex items-start gap-2">
                        <span className="text-gray-500 flex-shrink-0 w-16">FAX</span>
                        <span className="text-gray-800">{branch.fax}</span>
                      </div>
                    )}
                    <div className="flex items-start gap-2">
                      <span className="text-gray-500 flex-shrink-0 w-16">親校</span>
                      <span className="text-gray-800">{branch.parentSchool}</span>
                    </div>
                  </div>
                  {branch.urlVerified ? (
                    <Link
                      href={branch.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition"
                    >
                      分校紹介ページへ
                      <span className="text-xs">↗</span>
                    </Link>
                  ) : (
                    <span className="inline-flex items-center bg-gray-100 text-gray-500 px-4 py-2 rounded-lg text-sm">
                      URL未確認
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 各管区本部 */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 border-b-2 border-blue-600 pb-2">
            全国 管区海上保安本部一覧
          </h2>
          <p className="text-sm text-gray-600 mb-5">
            全国11管区の海上保安本部。各本部は独自の教育・研修を行うとともに、管轄海域の安全を担う。
          </p>
          <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="px-4 py-3 font-semibold text-gray-700">管区名</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">本部所在地</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 hidden md:table-cell">
                    管轄エリア（主要地域）
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-700">公式サイト</th>
                </tr>
              </thead>
              <tbody>
                {districts.map((district, index) => (
                  <tr
                    key={district.id}
                    className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                      {district.name}
                    </td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      {district.location}
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell text-xs">
                      {district.jurisdiction}
                    </td>
                    <td className="px-4 py-3">
                      {district.urlVerified ? (
                        <Link
                          href={district.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium transition"
                        >
                          公式サイト
                          <span className="text-xs">↗</span>
                        </Link>
                      ) : (
                        <span className="text-gray-400 text-xs">未確認</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 採用試験情報 */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-5 border-b-2 border-blue-600 pb-2">
            採用試験・受験案内
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-bold text-gray-900 mb-3">海上保安大学校 学生採用試験</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex gap-2">
                  <span className="text-blue-500 flex-shrink-0">▸</span>
                  実施主体：人事院・海上保安庁
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-500 flex-shrink-0">▸</span>
                  受験資格：高卒後2年以内または卒業見込み
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-500 flex-shrink-0">▸</span>
                  1次試験：小論文・総合問題
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-500 flex-shrink-0">▸</span>
                  2次試験：面接・身体検査・体力検査
                </li>
              </ul>
              <div className="mt-4">
                <Link
                  href="https://www.academy.kaiho.mlit.go.jp/admission/boshu_1.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  令和8年度本科・初任科入試情報 →
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-bold text-gray-900 mb-3">海上保安学校 学生採用試験</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex gap-2">
                  <span className="text-teal-500 flex-shrink-0">▸</span>
                  実施主体：人事院・海上保安庁
                </li>
                <li className="flex gap-2">
                  <span className="text-teal-500 flex-shrink-0">▸</span>
                  課程：一般・海洋科学・情報システム・航空・主計等
                </li>
                <li className="flex gap-2">
                  <span className="text-teal-500 flex-shrink-0">▸</span>
                  受験資格：課程により異なる（詳細は公式サイト参照）
                </li>
              </ul>
              <div className="mt-4">
                <Link
                  href="https://www.kaiho.mlit.go.jp/recruitment/enter/admission/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-teal-600 hover:underline"
                >
                  試験要綱・実施結果（海上保安庁） →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 免責・更新情報 */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 text-xs text-gray-500">
          <p>
            掲載情報は {updatedAt} 時点の調査に基づきます。公式サイトの移転・変更により情報が古くなる場合があります。
            最新の採用試験日程・出願要件は必ず各校公式サイトまたは海上保安庁ホームページでご確認ください。
          </p>
          <p className="mt-1">
            海上保安庁公式：
            <Link
              href="https://www.kaiho.mlit.go.jp/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline ml-1"
            >
              https://www.kaiho.mlit.go.jp/
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
