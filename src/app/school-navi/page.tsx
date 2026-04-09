import type { Metadata } from 'next'
import Link from 'next/link'

export const revalidate = 86400

export const metadata: Metadata = {
  title: '学校ナビ（消防・警察・海上保安・自衛隊）| 全国教育機関一覧',
  description:
    '全国の消防学校・警察学校・海上保安学校・自衛隊教育機関の公式情報を一覧。所在地・電話番号・公式サイトURL（ファクトチェック済み）を掲載。',
}

const categories = [
  {
    href: '/school-navi/fire',
    icon: '🚒',
    title: '消防学校ナビ',
    subtitle: '全国消防学校 一覧',
    description: '消防大学校（総務省消防庁）と全国47都道府県消防学校の公式情報。所在地・電話番号・公式URL掲載。',
    count: '49機関',
    color: 'red',
    borderColor: 'border-red-200',
    hoverColor: 'hover:border-red-400',
    titleColor: 'text-red-700',
    badgeColor: 'bg-red-50 text-red-700',
  },
  {
    href: '/school-navi/police',
    icon: '👮',
    title: '警察学校ナビ',
    subtitle: '全国警察学校 一覧',
    description: '警察大学校（警察庁）・管区警察学校・都道府県警察学校の公式情報。採用・教育課程情報も掲載。',
    count: '51機関',
    color: 'blue',
    borderColor: 'border-blue-200',
    hoverColor: 'hover:border-blue-400',
    titleColor: 'text-blue-700',
    badgeColor: 'bg-blue-50 text-blue-700',
  },
  {
    href: '/school-navi/coast-guard',
    icon: '⚓',
    title: '海上保安学校ナビ',
    subtitle: '海上保安庁 教育機関 一覧',
    description: '海上保安大学校・海上保安学校（舞鶴・門司分校・宮城分校）・全国11管区本部の公式情報。',
    count: '15機関',
    color: 'cyan',
    borderColor: 'border-cyan-200',
    hoverColor: 'hover:border-cyan-400',
    titleColor: 'text-cyan-700',
    badgeColor: 'bg-cyan-50 text-cyan-700',
  },
  {
    href: '/school-navi/sdf',
    icon: '🎖️',
    title: '自衛隊教育ナビ',
    subtitle: '防衛省・自衛隊 教育機関 一覧',
    description: '防衛大学校・防衛医科大学校・陸上/海上/航空自衛隊の各学校・幹部候補生学校の公式情報。',
    count: '25機関',
    color: 'green',
    borderColor: 'border-green-200',
    hoverColor: 'hover:border-green-400',
    titleColor: 'text-green-700',
    badgeColor: 'bg-green-50 text-green-700',
  },
]

export default function SchoolNaviTopPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-10">
        {/* ヘッダー */}
        <div className="mb-8 text-center">
          <h1 className="mb-3 text-3xl font-bold text-gray-900">
            学校ナビ
          </h1>
          <p className="text-base text-gray-600">
            消防・警察・海上保安・自衛隊の全国教育機関 公式情報一覧
          </p>
          <p className="mt-2 text-xs text-gray-400">
            ※ 掲載URLはHTTPアクセス確認済み（2026年4月時点）。URLが変更された場合はお知らせください。
          </p>
        </div>

        {/* カテゴリカード */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {categories.map((cat) => (
            <Link
              key={cat.href}
              href={cat.href}
              className={`group rounded-xl border-2 bg-white p-6 shadow-sm transition-all ${cat.borderColor} ${cat.hoverColor} hover:shadow-md`}
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{cat.icon}</span>
                  <div>
                    <p className={`font-bold text-lg ${cat.titleColor}`}>{cat.title}</p>
                    <p className="text-xs text-gray-500">{cat.subtitle}</p>
                  </div>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${cat.badgeColor}`}>
                  {cat.count}
                </span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{cat.description}</p>
              <div className="mt-3 flex items-center gap-1 text-xs text-gray-400">
                <span>詳細を見る</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>
          ))}
        </div>

        {/* 注意書き */}
        <div className="mt-10 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <h2 className="mb-2 text-sm font-semibold text-yellow-800">📋 掲載情報について</h2>
          <ul className="space-y-1 text-xs text-yellow-700">
            <li>・ 掲載URLはHTTPアクセス確認（ファクトチェック2回実施）済みです。</li>
            <li>・ 政府・自治体サイトはURLが変更される場合があります。リンク切れの場合は各機関の公式トップページからご確認ください。</li>
            <li>・ 公式サイトが確認できなかった機関は住所・電話番号のみ掲載しています。</li>
            <li>・ 消防学校の作者は現職消防学校教官（防災士）です。情報の正確性に最大限配慮しています。</li>
          </ul>
        </div>

        {/* リンク */}
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            ← サイトトップへ
          </Link>
          <Link
            href="/admin"
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50"
          >
            管理ダッシュボード
          </Link>
        </div>
      </div>
    </div>
  )
}
