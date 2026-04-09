'use client'

const AMAZON_TAG = process.env.NEXT_PUBLIC_AMAZON_TAG || 'kouminsaiyo-22'

interface Product {
  name: string
  description: string
  reason: string      // 「なぜ必要か」のワンフレーズ
  searchQuery: string
  emoji: string
}

const productsByCategory: Record<string, Product[]> = {
  water: [
    {
      name: '保存水（2L×6本）長期保存5年',
      description: '1人1日3L×7日分が目安。飲料・調理・衛生用途に対応。',
      reason: '断水は数日〜数週間続くことも。今すぐ備蓄を。',
      searchQuery: '保存水 2L 5年保存 防災 備蓄',
      emoji: '💧',
    },
    {
      name: '非常用トイレ（50回分セット）',
      description: '凝固剤で処理できる携帯トイレ。マンションの断水時に特に重要。',
      reason: '水道が止まるとトイレが使えない。最も見落としやすい備え。',
      searchQuery: '非常用トイレ 携帯トイレ 50回 防災',
      emoji: '🚽',
    },
    {
      name: '折りたたみ給水タンク（10L）',
      description: '給水車からの受け取りや風呂水の備蓄に。未使用時はコンパクト収納。',
      reason: '給水拠点まで何往復もする必要がなくなる。',
      searchQuery: '給水タンク 折りたたみ 10L 防災 断水',
      emoji: '🪣',
    },
  ],
  power: [
    {
      name: 'ポータブル電源（大容量）',
      description: 'スマホ・照明・医療機器・小型家電まで対応。停電が長引いても安心。',
      reason: '東日本大震災では停電が最長1週間以上続いた地域も。',
      searchQuery: 'ポータブル電源 大容量 防災 停電対策',
      emoji: '🔋',
    },
    {
      name: 'LEDランタン（充電式・電池式兼用）',
      description: '手持ち・吊り下げ・置き型の3way。家族全員分を用意したい。',
      reason: '停電の夜は想像以上に暗い。家に最低2個は必要。',
      searchQuery: 'LEDランタン 充電式 防災 停電',
      emoji: '🔦',
    },
    {
      name: 'カセットコンロ＋ガスボンベ（24本）',
      description: '都市ガス停止時の調理・湯沸かしに必須。ガスボンベは多めに備蓄。',
      reason: '阪神大震災ではガス復旧に最長83日かかった。',
      searchQuery: 'カセットコンロ ガスボンベ 防災 備蓄',
      emoji: '🔥',
    },
  ],
  evacuation: [
    {
      name: '防災リュック（セット済み）',
      description: '食料・水・救急用品・ライト・ラジオなど72時間分がセット済み。',
      reason: '避難時は「まず持って逃げる」だけで命が助かる。',
      searchQuery: '防災リュック セット済み 非常持出袋',
      emoji: '🎒',
    },
    {
      name: '防災ヘルメット（折りたたみ式）',
      description: '地震発生直後の落下物・倒壊から頭部を守る。子ども用もあり。',
      reason: '死因の約8割が建物倒壊による圧死・窒息。頭の保護が最優先。',
      searchQuery: '防災ヘルメット 折りたたみ 地震対策',
      emoji: '⛑️',
    },
    {
      name: 'レインポンチョ（防水・軽量）',
      description: '雨天の避難に対応。コンパクトで防災袋に入れておける。',
      reason: '台風・豪雨での避難は濡れたまま長時間移動が必要になることも。',
      searchQuery: 'レインポンチョ 防水 防災 避難',
      emoji: '🌧️',
    },
  ],
  indoor: [
    {
      name: '非常食セット（5日分〜）',
      description: 'アルファ米・レトルト・缶詰など長期保存対応。加熱不要タイプも。',
      reason: '在宅避難では自宅で数日〜数週間生活することになる。',
      searchQuery: '非常食 セット 5日分 長期保存 防災',
      emoji: '🍱',
    },
    {
      name: '簡易トイレ（凝固剤タイプ 50回）',
      description: '下水管破損時でも衛生的に処理できる。マンション在宅避難の必需品。',
      reason: '在宅避難で最も困るのが「トイレ問題」。早めに備えて。',
      searchQuery: '簡易トイレ 凝固剤 50回 在宅避難',
      emoji: '🚻',
    },
    {
      name: '家具転倒防止グッズ（つっぱり棒式）',
      description: '本棚・タンス・冷蔵庫の転倒を防ぐ。設置は30分以内でできる。',
      reason: '室内での死傷の多くは家具の転倒が原因。今すぐ固定を。',
      searchQuery: '家具転倒防止 つっぱり棒 耐震 防災',
      emoji: '🪑',
    },
  ],
  general: [
    {
      name: '防災リュック（基本セット）',
      description: 'まず一つ揃えたい基本の防災用品セット。家族分を用意したい。',
      reason: '「いつか揃えよう」が命取りに。今日が一番早い。',
      searchQuery: '防災リュック セット 非常持出袋 おすすめ',
      emoji: '🎒',
    },
    {
      name: '保存水＋非常食セット',
      description: '7日分の食料・飲料水の備蓄が推奨されている。',
      reason: '大規模災害では支援物資が届くまで数日〜1週間かかる。',
      searchQuery: '保存水 非常食 セット 7日分 防災',
      emoji: '🍶',
    },
    {
      name: 'ポータブル電源（中容量）',
      description: 'スマホ・ライト・ラジオの電源確保に。停電が長引いても安心。',
      reason: '情報収集手段を失うと避難判断が遅れる。充電は命綱。',
      searchQuery: 'ポータブル電源 防災 停電対策 おすすめ',
      emoji: '🔋',
    },
  ],
  tsunami: [
    {
      name: '防災ラジオ（手回し・太陽光充電）',
      description: '停電でも使えるマルチ充電対応ラジオ。津波警報をリアルタイムで確認。',
      reason: '津波警報は数分で出る。スマホが使えなくてもラジオで受信できる。',
      searchQuery: '防災ラジオ 手回し 太陽光 津波 警報',
      emoji: '📻',
    },
    {
      name: '防災ホイッスル（救助用）',
      description: '津波に巻き込まれた際に声を出し続けるのは体力を消耗する。',
      reason: '大声を出し続けられないときに笛一つが命を救う。',
      searchQuery: '防災ホイッスル 救助 防水 非常用',
      emoji: '📯',
    },
    {
      name: '防水バッグ・ドライバッグ',
      description: '水没・浸水時でも重要書類・スマホ・電池を守る。',
      reason: '津波・洪水時に防水袋があれば情報収集手段を守れる。',
      searchQuery: '防水バッグ ドライバッグ 防災 避難 水没',
      emoji: '🧳',
    },
  ],
  typhoon: [
    {
      name: '養生テープ＋窓ガラス飛散防止フィルム',
      description: '台風前に窓ガラスに貼るだけ。飛散による怪我を防ぐ。',
      reason: '台風による死因の多くは飛散物・窓ガラス破損が原因。',
      searchQuery: '窓ガラス 飛散防止 フィルム 台風対策',
      emoji: '🌀',
    },
    {
      name: '土のう袋（水のう代用可）',
      description: '浸水対策の基本。玄関・ガレージの水流入を防ぐ。',
      reason: '床上浸水は床材・家財の全損につながる。事前準備が必須。',
      searchQuery: '土のう袋 浸水対策 洪水 防水 台風',
      emoji: '🏠',
    },
    {
      name: 'ポータブル電源（大容量）',
      description: '台風による長時間停電に対応。スマホ・照明・扇風機も使える。',
      reason: '夏の台風後の停電は熱中症リスクも高い。換気・冷却手段を確保。',
      searchQuery: 'ポータブル電源 大容量 台風 停電対策',
      emoji: '🔋',
    },
  ],
  flood: [
    {
      name: '防水防汚ウェーダー（胴付き長靴）',
      description: '浸水した道路・自宅内の片付けに必須。膝上まで水に入れる。',
      reason: '水害後の泥除去・片付けでは防水装備がないと感染リスクがある。',
      searchQuery: '防水 ウェーダー 長靴 浸水 水害 片付け',
      emoji: '🥾',
    },
    {
      name: '水害対策セット（土のう・ポンプ）',
      description: '玄関・窓枠からの浸水を防ぐ。電動ポンプで排水も可能。',
      reason: '豪雨は数十分で床上浸水になる。準備は晴れている日に。',
      searchQuery: '浸水対策 土のう 水中ポンプ 排水 防災',
      emoji: '🌊',
    },
    {
      name: '簡易トイレ（50回セット）',
      description: '水害後は下水管が破損し水洗トイレが使えなくなる。',
      reason: '避難所でも自宅でもトイレ問題は最優先課題。',
      searchQuery: '簡易トイレ 携帯トイレ 50回 断水 防災',
      emoji: '🚽',
    },
  ],
}

export default function AffiliateBox({ category }: { category: string }) {
  const products = productsByCategory[category] || productsByCategory.general

  return (
    <div className="my-10">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-t-xl px-5 py-4">
        <h3 className="font-bold text-white text-base flex items-center gap-2">
          <span className="text-xl">🛡️</span>
          この災害の教訓から「今すぐ備えたいもの」
        </h3>
        <p className="text-amber-100 text-xs mt-1">
          過去の被災者が「あれがあれば…」と後悔した防災グッズを厳選
        </p>
      </div>

      {/* 商品リスト */}
      <div className="border border-amber-200 rounded-b-xl overflow-hidden">
        {products.map((p, i) => (
          <div
            key={i}
            className={`flex items-start gap-4 p-4 ${i < products.length - 1 ? 'border-b border-amber-100' : ''} ${i % 2 === 0 ? 'bg-white' : 'bg-amber-50/30'} hover:bg-amber-50 transition`}
          >
            {/* emoji icon */}
            <div className="text-3xl flex-shrink-0 w-12 text-center pt-1">{p.emoji}</div>

            {/* 商品情報 */}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-gray-900">{p.name}</p>
              <p className="text-xs text-orange-700 font-medium mt-0.5 flex items-center gap-1">
                <span>⚠️</span> {p.reason}
              </p>
              <p className="text-xs text-gray-500 mt-1">{p.description}</p>
            </div>

            {/* CTAボタン */}
            <div className="flex-shrink-0">
              <a
                href={`https://www.amazon.co.jp/s?k=${encodeURIComponent(p.searchQuery)}&tag=${AMAZON_TAG}`}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="flex flex-col items-center gap-1 bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-white rounded-lg px-3 py-2 transition text-center min-w-[72px]"
              >
                <span className="text-lg">🛒</span>
                <span className="text-xs font-bold leading-tight">Amazonで<br/>見る</span>
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* フッター免責 */}
      <p className="text-xs text-gray-400 mt-2 px-1">
        ※ 当サイトはAmazonアソシエイト・プログラムの参加者です。商品の選定・紹介は編集部が独自に行っています。
      </p>
    </div>
  )
}
