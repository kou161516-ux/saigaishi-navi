'use client'

const AMAZON_TAG = process.env.NEXT_PUBLIC_AMAZON_TAG

interface Product {
  name: string
  description: string
  searchQuery: string
}

const productsByCategory: Record<string, Product[]> = {
  water: [
    {
      name: '非常用トイレ（50回分）',
      description: '断水時に必須。凝固剤で処理できる携帯トイレ。',
      searchQuery: '非常用トイレ 携帯トイレ 防災',
    },
    {
      name: '保存水（2L×6本）',
      description: '5年保存対応の飲料水。1人1日3L×7日分が目安。',
      searchQuery: '保存水 防災 長期保存',
    },
    {
      name: '給水タンク（折りたたみ式）',
      description: '給水車からの受け取りに便利。断水時の必需品。',
      searchQuery: '給水タンク 折りたたみ 防災 断水',
    },
  ],
  power: [
    {
      name: 'ポータブル電源',
      description: '停電時の電力確保に。スマホ・ライト・医療機器に対応。',
      searchQuery: 'ポータブル電源 防災 蓄電池',
    },
    {
      name: 'LEDランタン・ヘッドライト',
      description: '停電時の灯り確保。電池式・充電式の両対応が安心。',
      searchQuery: 'LEDランタン 防災 ヘッドライト',
    },
    {
      name: 'カセットコンロ・ガスボンベセット',
      description: '停電・都市ガス停止時に調理を可能にする熱源。',
      searchQuery: 'カセットコンロ ガスボンベ 防災 備蓄',
    },
  ],
  evacuation: [
    {
      name: '防災リュック（基本セット）',
      description: '避難時に持ち出す72時間分の生活必需品をまとめたセット。',
      searchQuery: '防災リュック 非常持出袋 セット',
    },
    {
      name: 'レインウェア・防水グッズ',
      description: '雨天の避難にも対応。軽量・コンパクトな防水ポンチョ。',
      searchQuery: '防水 レインウェア 防災',
    },
    {
      name: '防災ヘルメット・防災頭巾',
      description: '地震・倒壊時の頭部保護に。子ども用も対応。',
      searchQuery: '防災ヘルメット 防災頭巾 地震対策',
    },
  ],
  indoor: [
    {
      name: '非常食セット（5日分）',
      description: '長期保存対応の主食・おかずセット。加熱不要タイプも。',
      searchQuery: '非常食 セット 長期保存 防災',
    },
    {
      name: '携帯トイレ・簡易トイレ',
      description: '在宅避難中の断水トイレ問題を解決する必須アイテム。',
      searchQuery: '携帯トイレ 簡易トイレ 防災 断水',
    },
    {
      name: '家具固定器具セット',
      description: '棚・冷蔵庫・テレビの転倒を防ぐ耐震固定グッズ。',
      searchQuery: '家具固定 耐震 転倒防止 防災',
    },
  ],
  general: [
    {
      name: '防災リュック（基本セット）',
      description: 'まず揃えたい基本の防災用品をセットに。',
      searchQuery: '防災リュック 非常持出袋 セット',
    },
    {
      name: 'ポータブル電源',
      description: '停電・断水時の心強い味方。家族の安心を支える蓄電池。',
      searchQuery: 'ポータブル電源 防災 蓄電池',
    },
    {
      name: '保存食・飲料水セット',
      description: '7日分の備蓄を目標に。ローリングストックで鮮度管理。',
      searchQuery: '保存食 非常食 保存水 防災 セット',
    },
  ],
}

export default function AffiliateBox({ category }: { category: string }) {
  const products = productsByCategory[category] || productsByCategory.general

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-5 my-8">
      <p className="text-xs text-gray-500 mb-3">
        ※ 当サイトはAmazonアソシエイトプログラムに参加しています
      </p>
      <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span className="text-amber-600">🛡️</span>
        この災害から学ぶ「今すぐ揃えたい備え」
      </h3>
      <div className="grid gap-3">
        {products.map((p, i) => (
          <div key={i} className="bg-white rounded p-3 border border-amber-100">
            <p className="font-medium text-sm text-gray-800">{p.name}</p>
            <p className="text-xs text-gray-600 mt-1">{p.description}</p>
            {AMAZON_TAG && (
              <a
                href={`https://www.amazon.co.jp/s?k=${encodeURIComponent(p.searchQuery)}&tag=${AMAZON_TAG}`}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="inline-block mt-2 text-xs bg-amber-400 hover:bg-amber-500 text-white px-3 py-1 rounded transition"
              >
                Amazonで確認する →
              </a>
            )}
            {!AMAZON_TAG && (
              <a
                href={`https://www.amazon.co.jp/s?k=${encodeURIComponent(p.searchQuery)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2 text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded transition"
              >
                Amazonで検索する →
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
