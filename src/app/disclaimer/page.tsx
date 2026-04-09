import type { Metadata } from 'next'
import Breadcrumb from '@/components/ui/Breadcrumb'

export const metadata: Metadata = {
  title: '免責事項',
  description: '災害史ナビの免責事項。情報の正確性・最新性に関する注意事項をご確認ください。',
}

export default function DisclaimerPage() {
  return (
    <div>
      <div className="bg-navy-900 text-white py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <Breadcrumb items={[{ label: 'ホーム', href: '/' }, { label: '免責事項' }]} />
          <h1 className="text-3xl font-bold">免責事項</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">情報の正確性について</h2>
          <p className="text-gray-700 leading-relaxed">
            当サイト（災害史ナビ）に掲載している情報は、公的機関の発表・報告書等を参考に
            作成していますが、内容の正確性・完全性・最新性を保証するものではありません。
            掲載情報に基づいて行動された結果について、当サイトは一切の責任を負いません。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">防災行動について</h2>
          <p className="text-gray-700 leading-relaxed">
            実際の防災行動・避難計画については、お住まいの市区町村の防災情報や
            ハザードマップ、気象庁・消防庁・内閣府等の公的機関の最新情報を必ずご参照ください。
            当サイトの情報はあくまで参考情報であり、各地域の状況に合わせた判断が必要です。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">商品情報・Amazonアソシエイトについて</h2>
          <p className="text-gray-700 leading-relaxed">
            当サイトはAmazon.co.jpを宣伝しリンクすることによってサイトが紹介料を獲得できる手段を提供することを目的に設定されたアフィリエイトプログラムである、Amazonアソシエイト・プログラムの参加者です。
          </p>
          <p className="text-gray-700 leading-relaxed mt-3">
            当サイトで紹介している商品リンクからAmazonにてご購入いただいた場合、当サイトに紹介料が支払われることがあります。ただし、これによってお客様の購入価格や商品内容に影響は一切ありません。
          </p>
          <p className="text-gray-700 leading-relaxed mt-3">
            紹介している商品の価格・在庫・仕様は変動する場合があります。
            最新の情報はAmazonの各商品ページにてご確認ください。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">外部リンクについて</h2>
          <p className="text-gray-700 leading-relaxed">
            当サイトから外部サイトへのリンクを設けていますが、
            外部サイトの内容・運営について当サイトは責任を負いません。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">著作権について</h2>
          <p className="text-gray-700 leading-relaxed">
            当サイトのコンテンツの著作権は運営者に帰属します。
            無断転載・複製は禁じています。引用の際は出典を明記してください。
          </p>
        </section>
      </div>
    </div>
  )
}
