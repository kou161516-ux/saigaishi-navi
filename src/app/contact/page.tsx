import type { Metadata } from 'next'
import Breadcrumb from '@/components/ui/Breadcrumb'

export const metadata: Metadata = {
  title: 'お問い合わせ',
  description: '災害史ナビへのお問い合わせ。情報の誤り・掲載内容に関するご連絡はこちらからお願いします。',
}

export default function ContactPage() {
  return (
    <div>
      <div className="bg-navy-900 text-white py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <Breadcrumb items={[{ label: 'ホーム', href: '/' }, { label: 'お問い合わせ' }]} />
          <h1 className="text-3xl font-bold">お問い合わせ</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <p className="text-gray-600 mb-6 leading-relaxed">
          情報の誤り・更新のご連絡、掲載内容に関するご意見・ご要望は
          下記フォームからお送りください。
          お返事にお時間をいただく場合がございます。
        </p>

        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <h2 className="font-bold text-gray-800 mb-4">お問い合わせフォーム</h2>
          {/* Google フォームをここに埋め込んでください */}
          {/* 例: <iframe src="https://docs.google.com/forms/d/e/REPLACE_WITH_FORM_ID/viewform?embedded=true" width="100%" height="800" frameBorder="0" marginHeight={0} marginWidth={0}>読み込んでいます…</iframe> */}
          <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500">
            <p className="text-sm">
              お問い合わせフォームを準備中です。
            </p>
            <p className="text-sm mt-2">
              Google フォームのURLを取得後、このページに埋め込んでください。
            </p>
            <p className="text-xs mt-4 text-gray-400">
              （管理者向け: src/app/contact/page.tsx の iframe 部分にフォームURLを設定してください）
            </p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-bold text-blue-800 mb-2 text-sm">よくあるお問い合わせ</h3>
          <ul className="space-y-2 text-sm text-blue-700">
            <li>・被害数値の誤りについて → 出典を含めてご連絡ください</li>
            <li>・掲載を希望する災害について → 概要・出典をご記入ください</li>
            <li>・リンク切れについて → URLをご連絡ください</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
