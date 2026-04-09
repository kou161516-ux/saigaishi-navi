import Link from 'next/link'

/**
 * 防災の日（9月1日）関連バナー — Server Component
 *
 * 表示ルール:
 *  - 9月1日のみ: 「防災の日」バナー（最優先）
 *  - 8月30日〜9月5日: 「防災週間」バナー
 *  - それ以外: 次の防災の日（翌年9月1日）までのカウントダウン
 */

function getCountdownDays(from: Date): number {
  const currentYear = from.getFullYear()
  let nextDay = new Date(currentYear, 8, 1) // 今年の9月1日（月は0始まり）
  if (from >= nextDay) {
    nextDay = new Date(currentYear + 1, 8, 1) // 来年の9月1日
  }
  const diff = nextDay.getTime() - from.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export default function DisasterPreventionDayBanner() {
  const now = new Date()
  const month = now.getMonth() + 1 // 1-12
  const day = now.getDate()

  // 9月1日: 防災の日
  const isDisasterPreventionDay = month === 9 && day === 1

  // 8月30日〜9月5日: 防災週間
  const isDisasterPreventionWeek =
    (month === 8 && day >= 30) || (month === 9 && day >= 2 && day <= 5)

  if (isDisasterPreventionDay) {
    return (
      <section className="bg-red-600 text-white py-5 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl" role="img" aria-label="alarm">🚨</span>
            <div>
              <p className="font-bold text-xl">本日は防災の日（9月1日）</p>
              <p className="text-red-100 text-sm mt-0.5">
                1923年関東大震災の教訓を受け制定。今日、防災を見直しましょう。
              </p>
            </div>
          </div>
          <Link
            href="/disasters/kanto-earthquake-1923"
            className="flex-shrink-0 bg-white text-red-700 font-bold px-5 py-2.5 rounded-lg hover:bg-red-50 transition text-sm"
          >
            関東大震災を振り返る →
          </Link>
        </div>
      </section>
    )
  }

  if (isDisasterPreventionWeek) {
    return (
      <section className="bg-orange-500 text-white py-5 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl" role="img" aria-label="warning">⚠️</span>
            <div>
              <p className="font-bold text-xl">防災週間（8月30日〜9月5日）</p>
              <p className="text-orange-100 text-sm mt-0.5">
                防災週間期間中です。家族で防災計画を確認しましょう。
              </p>
            </div>
          </div>
          <Link
            href="/disasters"
            className="flex-shrink-0 bg-white text-orange-700 font-bold px-5 py-2.5 rounded-lg hover:bg-orange-50 transition text-sm"
          >
            防災記事を見る →
          </Link>
        </div>
      </section>
    )
  }

  // カウントダウン表示
  const daysLeft = getCountdownDays(now)

  return (
    <section className="bg-navy-800 text-white py-4 px-4">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl" role="img" aria-label="calendar">📅</span>
          <p className="text-sm text-gray-300">
            次の防災の日（9月1日）まで
            <span className="text-amber-400 font-bold text-xl mx-2">{daysLeft}</span>
            日
          </p>
        </div>
        <Link
          href="/disasters"
          className="flex-shrink-0 border border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-navy-900 font-medium px-4 py-1.5 rounded-lg transition text-xs"
        >
          今から備えを始める →
        </Link>
      </div>
    </section>
  )
}
