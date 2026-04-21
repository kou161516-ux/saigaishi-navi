// インズウェブ火災保険一括見積もりサービス アフィリエイトコンポーネント
// A8.net / ファンコミュニケーションズ株式会社 [s00000000352014]
// 成果報酬：新規見積もり1,400円 / 確定率90.76%

export default function InsWebAffiliateBox() {
  return (
    <div className="my-8 rounded-xl overflow-hidden border border-orange-200 shadow-sm">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 px-5 py-4">
        <h3 className="font-bold text-white text-base flex items-center gap-2">
          <span className="text-xl">🏠</span>
          地震・火災・台風への備え：火災保険の見直しも「防災対策」
        </h3>
        <p className="text-orange-100 text-xs mt-1">
          最大10社の火災保険を一括比較・無料見積もり（ファンコミュニケーションズ運営）
        </p>
      </div>

      {/* コンテンツ */}
      <div className="bg-orange-50 p-5">
        <div className="flex flex-col sm:flex-row gap-5 items-start">
          {/* PC用：テキストバナー（バナー画像廃止のためテキストCTAに変更） */}
          <div className="flex-shrink-0 hidden sm:block w-[220px]">
            <a
              href="https://px.a8.net/svt/ejp?a8mat=4B1G9O+AQZRZM+2PS+2BDJK1"
              rel="nofollow sponsored"
              target="_blank"
              className="block rounded-xl bg-gradient-to-b from-orange-500 to-red-600 text-white text-center p-5 shadow hover:opacity-90 transition"
            >
              <div className="text-3xl mb-2">🏠</div>
              <div className="font-bold text-sm leading-snug">火災保険を<br/>一括比較・無料見積もり</div>
              <div className="text-xs mt-2 opacity-90">最大10社比較 ／ 3分で完了</div>
              <div className="mt-3 bg-white text-orange-600 font-bold rounded-lg py-2 text-xs">今すぐ無料で試す →</div>
            </a>
          </div>

          {/* テキストエリア */}
          <div className="flex-1">
            <p className="text-sm text-gray-800 leading-relaxed font-medium">
              住宅火災・自然災害による建物被害への備えは、防災グッズだけではありません。
              <strong>火災保険の見直し</strong>は、もっとも現実的な「経済的防災対策」です。
            </p>

            <ul className="mt-3 space-y-1.5 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <span className="text-green-500 font-bold">✓</span>
                最大10社から一括見積もり（完全無料・3分で完了）
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500 font-bold">✓</span>
                ファンコミュニケーションズ株式会社運営の安心サービス
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500 font-bold">✓</span>
                地震保険・水災補償・建物・家財を一括比較
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500 font-bold">✓</span>
                保険料を見直すだけで年間数万円の節約事例も
              </li>
            </ul>

            {/* スマホ用：テキストバナー（バナー画像廃止のためテキストCTAに変更） */}
            <div className="mt-4 sm:hidden">
              <a
                href="https://px.a8.net/svt/ejp?a8mat=4B1G9O+AQZRZM+2PS+2BF1KH"
                rel="nofollow sponsored"
                target="_blank"
                className="flex items-center justify-between bg-orange-500 text-white rounded-lg px-4 py-3 text-sm font-bold hover:opacity-90 transition"
              >
                <span>🏠 火災保険を無料一括比較</span>
                <span className="text-xs opacity-80">→</span>
              </a>
            </div>

            {/* CTAボタン（素材ID015 テキスト EPC38.83） */}
            <div className="mt-4">
              <a
                href="https://px.a8.net/svt/ejp?a8mat=4B1G9O+AQZRZM+2PS+2BFWFM"
                rel="nofollow sponsored"
                target="_blank"
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold rounded-lg px-6 py-3 text-sm transition shadow-sm"
              >
                🔍 火災保険を比較する（無料）
                <span className="text-xs opacity-80">↗</span>
              </a>
              {/* トラッキングピクセル */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                style={{ border: 0, width: 1, height: 1 }}
                src="https://www11.a8.net/0.gif?a8mat=4B1G9O+AQZRZM+2PS+2BFWFM"
                alt=""
              />
            </div>
          </div>
        </div>
      </div>

      {/* フッター免責 */}
      <div className="bg-gray-50 border-t border-orange-100 px-5 py-2">
        <p className="text-xs text-gray-400">
          ※ 当サイトはアフィリエイト広告（A8.net / ファンコミュニケーションズ株式会社）を掲載しています。掲載内容は編集部が独自に選定しています。
        </p>
      </div>
    </div>
  )
}
