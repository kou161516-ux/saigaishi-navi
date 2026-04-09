import Link from 'next/link'
import { getAllDisasters } from '@/lib/disasters'

export const dynamic = 'force-dynamic'

type UpdateStatus = 'ongoing' | 'annual' | 'stable'

interface UpdatePriorityItem {
  slug: string
  title: string
  status: UpdateStatus
  lastUpdate: string
  checkUrl: string
  nextCheck: string
  note: string
}

const UPDATE_PRIORITY: UpdatePriorityItem[] = [
  {
    slug: 'noto-earthquake-2024',
    title: '能登半島地震（2024年）',
    status: 'ongoing',
    lastUpdate: '2026-04-09',
    checkUrl: 'https://www.bousai.go.jp/updates/r60101notojishin/',
    nextCheck: '毎月',
    note: '関連死が継続増加。内閣府で月次確認推奨',
  },
  {
    slug: 'tohoku-earthquake-2011',
    title: '東日本大震災（2011年）',
    status: 'annual',
    lastUpdate: '2026-04-09',
    checkUrl: 'https://www.npa.go.jp/news/latest/',
    nextCheck: '毎年3月',
    note: '警察庁が毎年3月11日前後に確定値を更新',
  },
  {
    slug: 'fukushima-nuclear-2011',
    title: '福島第一原発事故（2011年）',
    status: 'annual',
    lastUpdate: '2026-04-09',
    checkUrl: 'https://www.reconstruction.go.jp/',
    nextCheck: '毎年6月',
    note: '復興庁が年次集計を更新',
  },
  {
    slug: 'turkey-syria-earthquake-2023',
    title: 'トルコ・シリア地震（2023年）',
    status: 'stable',
    lastUpdate: '2026-04-09',
    checkUrl: 'https://en.wikipedia.org/wiki/2023_Turkey%E2%80%93Syria_earthquakes',
    nextCheck: '年1回',
    note: '復興状況を年1回確認',
  },
]

const CRON_JOBS = [
  {
    schedule: '毎日 0:00 UTC',
    endpoint: '/api/cron/update-disasters',
    description: '気象庁+USGS最新地震取得',
  },
  {
    schedule: '毎日 0:30 UTC',
    endpoint: '/api/cron/article-check',
    description: '記事更新チェック',
  },
  {
    schedule: '毎日 6:00 JST',
    endpoint: '/api/cron/revalidate-news',
    description: 'newsページキャッシュ更新',
  },
  {
    schedule: '毎週月 1:00 UTC',
    endpoint: '/api/cron/factcheck',
    description: 'ファクトチェック',
  },
  {
    schedule: '毎週日 2:00 UTC',
    endpoint: '/api/cron/link-check',
    description: 'リンク死活監視',
  },
  {
    schedule: 'macOS launchd 毎週月 9:00 JST',
    endpoint: '（ローカル）',
    description: 'ローカル週次チェック',
  },
]

function getStatusBadge(status: UpdateStatus) {
  switch (status) {
    case 'ongoing':
      return (
        <span className="inline-block rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800">
          継続中
        </span>
      )
    case 'annual':
      return (
        <span className="inline-block rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-800">
          年次更新
        </span>
      )
    case 'stable':
      return (
        <span className="inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">
          安定
        </span>
      )
  }
}

function getThisWeekMonday(today: Date): Date {
  const d = new Date(today)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d
}

function getThisWeekSunday(today: Date): Date {
  const monday = getThisWeekMonday(today)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  return sunday
}

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export default function UpdateMonitorPage() {
  const disasters = getAllDisasters()
  const totalArticles = disasters.length

  const today = new Date('2026-04-09')
  const thisMonday = getThisWeekMonday(today)
  const thisSunday = getThisWeekSunday(today)

  const ongoingArticles = UPDATE_PRIORITY.filter((a) => a.status === 'ongoing')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">自動更新モニタリング</h1>
        <p className="mb-6 text-sm text-gray-500">
          自動更新システムの稼働状況・記事更新優先度を確認 — 全{totalArticles}記事管理中
        </p>

        {/* セクション1: 自動更新システム稼働状況 */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            自動更新システム稼働状況
          </h2>
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left font-medium text-gray-600">ステータス</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">スケジュール</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">エンドポイント</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">内容</th>
                </tr>
              </thead>
              <tbody>
                {CRON_JOBS.map((job, idx) => (
                  <tr
                    key={job.endpoint}
                    className={`border-b border-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <td className="px-4 py-3">
                      <span className="text-green-600 font-bold">✅</span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-700 whitespace-nowrap">
                      {job.schedule}
                    </td>
                    <td className="px-4 py-3">
                      <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-700 font-mono">
                        {job.endpoint}
                      </code>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{job.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* セクション2: 記事更新優先度 */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">記事更新優先度</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {UPDATE_PRIORITY.map((item) => (
              <div
                key={item.slug}
                className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-400">{item.slug}</p>
                  </div>
                  {getStatusBadge(item.status)}
                </div>
                <dl className="mt-3 space-y-1 text-xs">
                  <div className="flex gap-2">
                    <dt className="w-24 shrink-0 text-gray-500">最終更新日</dt>
                    <dd className="text-gray-700">{item.lastUpdate}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="w-24 shrink-0 text-gray-500">次回確認</dt>
                    <dd className="text-gray-700">{item.nextCheck}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="w-24 shrink-0 text-gray-500">確認先</dt>
                    <dd>
                      <a
                        href={item.checkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline hover:text-blue-800 break-all"
                      >
                        {item.checkUrl}
                      </a>
                    </dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="w-24 shrink-0 text-gray-500">備考</dt>
                    <dd className="text-gray-600 leading-relaxed">{item.note}</dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>
        </section>

        {/* セクション3: 今週のファクトチェック予定 */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">今週のファクトチェック予定</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-5">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-blue-500">
                今週月曜日
              </p>
              <p className="mb-2 text-base font-bold text-blue-900">{formatDate(thisMonday)}</p>
              <p className="text-xs text-blue-700">USGS自動ファクトチェック</p>
              <p className="mt-1 text-xs text-blue-600">
                <code className="rounded bg-blue-100 px-1 font-mono">npm run usgs-check</code>
              </p>
            </div>
            <div className="rounded-lg border border-purple-200 bg-purple-50 p-5">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-purple-500">
                今週日曜日
              </p>
              <p className="mb-2 text-base font-bold text-purple-900">{formatDate(thisSunday)}</p>
              <p className="text-xs text-purple-700">リンク死活チェック</p>
              <p className="mt-1 text-xs text-purple-600">
                <code className="rounded bg-purple-100 px-1 font-mono">npm run link-check</code>
              </p>
            </div>
            <div className="rounded-lg border border-red-200 bg-red-50 p-5">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-red-500">
                今月のマニュアル確認推奨
              </p>
              <ul className="mt-2 space-y-1 text-xs text-red-700">
                {ongoingArticles.map((a) => (
                  <li key={a.slug} className="flex items-start gap-1">
                    <span className="mt-0.5 shrink-0">•</span>
                    <span>{a.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* セクション4: コマンドリファレンス */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">コマンドリファレンス</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                即時実行
              </p>
              <pre className="text-xs font-mono text-gray-700 leading-6 whitespace-pre-wrap">{`npm run factcheck:all
npm run usgs-check
npm run jma-check
npm run article-check
npm run deaths-check`}</pre>
              <div className="mt-2 space-y-1 text-xs text-gray-400">
                <p>全ファクトチェック</p>
                <p>USGS照合</p>
                <p>気象庁照合</p>
                <p>更新状況確認</p>
                <p>死者数確認推奨ソース</p>
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                修正
              </p>
              <pre className="text-xs font-mono text-gray-700 leading-6 whitespace-pre-wrap">{`npm run usgs-check:fix
npm run internal-link:fix`}</pre>
              <div className="mt-2 space-y-1 text-xs text-gray-400">
                <p>USGS値で自動修正</p>
                <p>リンク自動補完</p>
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                一括実行
              </p>
              <pre className="text-xs font-mono text-gray-700 leading-6 whitespace-pre-wrap">{`npm run agent:all
npm run update:all`}</pre>
              <div className="mt-2 space-y-1 text-xs text-gray-400">
                <p>全エージェント実行</p>
                <p>全更新チェック</p>
              </div>
            </div>
          </div>
        </section>

        {/* ナビゲーション */}
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/admin"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            管理ダッシュボードへ
          </Link>
          <Link
            href="/admin/agents"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            エージェント一覧
          </Link>
          <Link
            href="/"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            サイトトップへ
          </Link>
        </div>
      </div>
    </div>
  )
}
