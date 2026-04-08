import type { Metadata } from 'next'
import Breadcrumb from '@/components/ui/Breadcrumb'

export const metadata: Metadata = {
  title: 'プライバシーポリシー',
  description: '災害史ナビのプライバシーポリシー。個人情報の取り扱い、Cookieの使用、アクセス解析について説明します。',
}

export default function PrivacyPage() {
  return (
    <div>
      <div className="bg-navy-900 text-white py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <Breadcrumb items={[{ label: 'ホーム', href: '/' }, { label: 'プライバシーポリシー' }]} />
          <h1 className="text-3xl font-bold">プライバシーポリシー</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">1. 個人情報の収集</h2>
          <p className="text-gray-700 leading-relaxed">
            当サイト（災害史ナビ）は、お問い合わせフォームを通じてお名前・メールアドレス等の情報をお預かりする場合があります。
            収集した個人情報は、お問い合わせへの回答以外の目的には使用せず、第三者に提供することはありません。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">2. Google Analytics（アクセス解析）</h2>
          <p className="text-gray-700 leading-relaxed">
            当サイトでは、サイトの利用状況を把握するためにGoogle Analytics（GA4）を使用しています。
            Google AnalyticsはCookieを使用してデータを収集しますが、個人を特定する情報は含まれません。
            収集されたデータはGoogleのプライバシーポリシーに従って管理されます。
            Cookieの使用を無効にするには、ブラウザの設定からCookieを無効にしてください。
          </p>
          <p className="text-gray-700 leading-relaxed mt-3">
            Googleのプライバシーポリシー：
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline ml-1">
              https://policies.google.com/privacy
            </a>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">3. Google AdSense（広告）</h2>
          <p className="text-gray-700 leading-relaxed">
            当サイトでは、Google AdSenseによる広告を掲載しています。
            Google AdSenseは、ユーザーの興味・関心に基づいた広告を表示するためにCookieを使用する場合があります。
            Cookieを無効にする方法や、Googleが使用するCookieの詳細については、
            Googleの広告に関するポリシーをご参照ください。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">4. Amazonアソシエイト</h2>
          <p className="text-gray-700 leading-relaxed">
            当サイトはAmazon.co.jpのアソシエイトとして、適格販売により収入を得ることがあります。
            商品紹介リンクからご購入いただいた場合、当サイトに紹介料が支払われますが、
            商品の価格や内容に影響はありません。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">5. Cookieの無効化</h2>
          <p className="text-gray-700 leading-relaxed">
            ブラウザの設定によりCookieを無効にすることができますが、
            一部の機能が正常に動作しない場合があります。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">6. プライバシーポリシーの変更</h2>
          <p className="text-gray-700 leading-relaxed">
            本ポリシーの内容は、法令の変更や運営上の必要に応じて予告なく変更する場合があります。
            変更後のポリシーは、当ページへの掲載をもって効力を持つものとします。
          </p>
        </section>

        <p className="text-sm text-gray-500">最終更新: 2024年1月</p>
      </div>
    </div>
  )
}
