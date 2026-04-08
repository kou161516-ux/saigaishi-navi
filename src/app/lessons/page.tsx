import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllDisasters } from '@/lib/disasters'
import Breadcrumb from '@/components/ui/Breadcrumb'

export const metadata: Metadata = {
  title: '教訓一覧',
  description: '日本・世界の重大災害から学ぶ教訓を一覧で確認。地震・津波・台風・豪雨など各種災害の教訓をまとめました。',
}

export default function LessonsPage() {
  const disasters = getAllDisasters()

  return (
    <div>
      <div className="bg-navy-900 text-white py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <Breadcrumb items={[{ label: 'ホーム', href: '/' }, { label: '教訓一覧' }]} />
          <h1 className="text-3xl font-bold">災害の教訓一覧</h1>
          <p className="text-gray-300 mt-2">
            {disasters.length}件の災害から学ぶ{' '}
            {disasters.reduce((acc, d) => acc + d.lessons.length, 0)} の教訓
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-gray-600 mb-8 leading-relaxed">
          過去の災害は「繰り返さないための教科書」です。
          各災害の教訓を読み、今日の防災行動に活かしてください。
        </p>

        <div className="space-y-10">
          {disasters.map((disaster) => (
            <section key={disaster.slug} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  <Link
                    href={`/disasters/${disaster.slug}`}
                    className="hover:text-amber-600 transition"
                  >
                    {disaster.title}
                  </Link>
                </h2>
                <span className="text-sm text-gray-400 ml-4 flex-shrink-0">
                  {disaster.date.slice(0, 4)}年
                </span>
              </div>
              <ul className="space-y-2">
                {disaster.lessons.map((lesson, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-gray-700 leading-relaxed">{lesson}</p>
                  </li>
                ))}
              </ul>
              <div className="mt-4">
                <Link
                  href={`/disasters/${disaster.slug}`}
                  className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                >
                  詳細を読む →
                </Link>
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
