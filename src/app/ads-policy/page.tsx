import type { Metadata } from 'next'
import Breadcrumb from '@/components/ui/Breadcrumb'

export const metadata: Metadata = {
  title: '広告掲載ポリシー',
  description: '災害史ナビの広告掲載ポリシー。Google AdSense・Amazonアソシエイトの利用方針について説明します。',
}

export default function AdsPolicyPage() {
  return (
    <div>
      <div className="bg-navy-900 text-white py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <Breadcrumb items={[{ label: 'ホーム', href: '/' }, { label: '広告掲載ポリシー' }]} />
          <h1 className="text-3xl font-bold">広告掲載ポリシー</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Google AdSense</h2>
          <p className="text-gray-700 leading-relaxed">
            当サイトではGoogle AdSenseによる広告を掲載しています。
            広告の内容はGoogleのシステムにより自動的に選定されるため、
            当サイトが個別の広告内容を管理・保証するものではありません。
            広告に関するお問い合わせはGoogleまでお願いします。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Amazonアソシエイト</h2>
          <p className="text-gray-700 leading-relaxed">
            当サイトはAmazon.co.jpのアソシエイトプログラムに参加しており、
            適格販売により紹介料を得る場合があります。
            紹介する商品は防災に関連するものを中心に選定しており、
            収益を目的として誇大な表現や虚偽の推奨は行いません。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">商品選定の基準</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>防災・備蓄に実際に役立つと判断されるもの</li>
            <li>各災害の教訓に関連した備えとして推奨できるもの</li>
            <li>一般的に入手しやすいもの</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">記事内容と広告の独立性</h2>
          <p className="text-gray-700 leading-relaxed">
            当サイトの記事内容（災害の記録・教訓）は、広告収益とは独立して作成されています。
            広告掲載の有無や広告主からの指示によって記事内容を変更することはありません。
          </p>
        </section>
      </div>
    </div>
  )
}
