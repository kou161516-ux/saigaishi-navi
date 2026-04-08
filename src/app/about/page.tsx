import type { Metadata } from 'next'
import Breadcrumb from '@/components/ui/Breadcrumb'

export const metadata: Metadata = {
  title: 'サイトについて',
  description: '災害史ナビのサイト概要・運営方針・情報の取り扱いについて説明しています。',
}

export default function AboutPage() {
  return (
    <div>
      <div className="bg-navy-900 text-white py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <Breadcrumb items={[{ label: 'ホーム', href: '/' }, { label: 'サイトについて' }]} />
          <h1 className="text-3xl font-bold">災害史ナビについて</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10 prose prose-gray">
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">このサイトの目的</h2>
          <p className="text-gray-700 leading-relaxed">
            「災害史ナビ」は、日本および世界の重大災害の歴史を整理し、
            過去の教訓を現代の備えに活かすことを目的とした情報メディアです。
          </p>
          <p className="text-gray-700 leading-relaxed mt-3">
            関東大震災（1923年）から令和6年能登半島地震（2024年）まで、
            100年にわたる災害の歴史が示す教訓は、「備えていれば助かった命があった」という
            繰り返しの事実に集約されます。
            本サイトはその教訓を次の世代へつなぐために設けられています。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">運営について</h2>
          <p className="text-gray-700 leading-relaxed">
            本サイトは、防災・危機管理分野に関心を持つ有志チームが運営しています。
            情報の正確性向上に努めていますが、内容の完全性・最新性は保証できません。
            防災対策については、各自治体や公的機関（内閣府・消防庁・気象庁等）の情報を
            合わせてご確認ください。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">収録情報について</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>収録する災害は、社会的影響・人的被害・防災上の教訓の観点から選定しています</li>
            <li>被害数値は発表時点の政府・自治体公表値を基に記載しています</li>
            <li>出典は各記事の末尾に明記しています</li>
            <li>情報に誤りや更新がある場合はお問い合わせください</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">広告・アフィリエイトについて</h2>
          <p className="text-gray-700 leading-relaxed">
            本サイトでは、Google AdSenseによる広告を掲載しています。
            また、Amazon アソシエイトプログラムに参加しており、
            一部のリンクからご購入いただいた場合に紹介料が発生する場合があります。
            いずれも記事内容の独立性に影響するものではありません。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">お問い合わせ</h2>
          <p className="text-gray-700 leading-relaxed">
            情報の誤り・更新のご連絡、掲載内容に関するお問い合わせは、
            <a href="/contact" className="text-amber-600 hover:underline">お問い合わせフォーム</a>
            からお送りください。
          </p>
        </section>
      </div>
    </div>
  )
}
