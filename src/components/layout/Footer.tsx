import Link from 'next/link'

export default function Footer() {
  // ビルド時の日時（Server Component なのでビルド時に評価される）
  const buildTime = new Date().toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <footer className="bg-navy-900 text-gray-400 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-amber-400 text-xl">⚡</span>
              <span className="text-white font-bold text-lg">災害史ナビ</span>
            </div>
            <p className="text-sm leading-relaxed mb-4">
              日本・世界の重大災害の歴史を学び、
              今日の備えにつなげる防災情報データベース。
            </p>
            {/* SNSシェアボタン */}
            <div className="flex gap-3">
              <a
                href="https://twitter.com/intent/tweet?url=https%3A%2F%2Fsaigaishi-navi.vercel.app&text=%E7%81%BD%E5%AE%B3%E5%8F%B2%E3%83%8A%E3%83%93%E3%80%9C%E9%81%8E%E5%8E%BB%E3%81%AE%E7%81%BD%E5%AE%B3%E3%82%92%E7%9F%A5%E3%82%8A%E3%80%81%E4%BB%8A%E6%97%A5%E3%81%AE%E5%82%99%E3%81%88%E3%81%AB%E5%A4%89%E3%81%88%E3%82%8B%E3%80%82"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-black hover:bg-gray-800 text-white text-xs font-medium px-3 py-2 rounded-lg transition"
                aria-label="X（Twitter）でシェア"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.213 5.567 5.951-5.567Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                X でシェア
              </a>
              <a
                href="https://social-plugins.line.me/lineit/share?url=https%3A%2F%2Fsaigaishi-navi.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-[#06C755] hover:bg-[#05a845] text-white text-xs font-medium px-3 py-2 rounded-lg transition"
                aria-label="LINEでシェア"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M19.365 9.89c.50 0 .906.41.906.91s-.406.91-.906.91H17.28v1.305h2.085c.5 0 .906.41.906.91s-.406.91-.906.91H16.37a.908.908 0 0 1-.906-.91V8.98c0-.5.406-.91.906-.91h3c.5 0 .906.41.906.91s-.406.91-.906.91H17.28V9.89h2.085ZM13.54 14.93a.912.912 0 0 1-.574-.204l-2.933-2.93v2.224a.908.908 0 0 1-.906.91.908.908 0 0 1-.906-.91V8.98c0-.39.245-.733.612-.867a.905.905 0 0 1 .998.258l2.933 2.93V8.98c0-.5.406-.91.906-.91.5 0 .906.41.906.91v5.04c0 .39-.245.734-.612.867a.893.893 0 0 1-.324.043ZM8.13 14.93a.908.908 0 0 1-.906-.91V8.98c0-.5.406-.91.906-.91.5 0 .906.41.906.91v5.04c0 .5-.406.91-.906.91ZM4.5 14.03h2.085c.5 0 .906.41.906.91s-.406.91-.906.91H3.594a.908.908 0 0 1-.906-.91V8.98c0-.5.406-.91.906-.91.5 0 .906.41.906.91v5.05ZM24 10.31C24 4.746 18.617.25 12 .25S0 4.746 0 10.31c0 4.994 4.43 9.178 10.41 9.965.406.088.959.268 1.099.616.125.316.082.813.04 1.13l-.177 1.065c-.054.316-.247 1.237 1.083.674 1.33-.563 7.18-4.228 9.8-7.24C23.214 14.365 24 12.435 24 10.31Z" />
                </svg>
                LINEでシェア
              </a>
            </div>
          </div>

          {/* コンテンツリンク */}
          <div>
            <h3 className="text-white font-semibold mb-3">コンテンツ</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/disasters" className="hover:text-amber-400 transition">
                  災害一覧
                </Link>
              </li>
              <li>
                <Link href="/country/japan" className="hover:text-amber-400 transition">
                  日本の災害
                </Link>
              </li>
              <li>
                <Link href="/country/world" className="hover:text-amber-400 transition">
                  世界の災害
                </Link>
              </li>
              <li>
                <Link href="/lessons" className="hover:text-amber-400 transition">
                  教訓一覧
                </Link>
              </li>
            </ul>
          </div>

          {/* サイトマップ */}
          <div>
            <h3 className="text-white font-semibold mb-3">タイプ別</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/type/earthquake" className="hover:text-amber-400 transition">
                  地震
                </Link>
              </li>
              <li>
                <Link href="/type/tsunami" className="hover:text-amber-400 transition">
                  津波
                </Link>
              </li>
              <li>
                <Link href="/type/typhoon" className="hover:text-amber-400 transition">
                  台風
                </Link>
              </li>
              <li>
                <Link href="/type/flood" className="hover:text-amber-400 transition">
                  洪水・豪雨
                </Link>
              </li>
              <li>
                <Link href="/type/volcano" className="hover:text-amber-400 transition">
                  火山
                </Link>
              </li>
              <li>
                <Link href="/sitemap.xml" className="hover:text-amber-400 transition">
                  サイトマップ
                </Link>
              </li>
            </ul>
          </div>

          {/* サイト情報 */}
          <div>
            <h3 className="text-white font-semibold mb-3">サイト情報</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-amber-400 transition">
                  サイトについて
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-amber-400 transition">
                  プライバシーポリシー
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className="hover:text-amber-400 transition">
                  免責事項
                </Link>
              </li>
              <li>
                <Link href="/ads-policy" className="hover:text-amber-400 transition">
                  広告掲載ポリシー
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-amber-400 transition">
                  お問い合わせ
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Amazonアソシエイト免責表示 */}
        <div className="border-t border-gray-700 mt-8 pt-6">
          <p className="text-xs text-gray-500 leading-relaxed mb-4">
            【広告・アフィリエイト開示】本サイトは Amazon.co.jp アソシエイト・プログラムおよび
            楽天アフィリエイトに参加しています。紹介リンクを経由してご購入いただいた場合、
            サイト運営者に一定の報酬が発生しますが、読者の方への価格や評価には一切影響しません。
            防災グッズの選定は独自の基準で行っており、メーカーや販売店から対価を受け取っての
            掲載ではありません。
          </p>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-sm">
            <p className="text-xs text-gray-500 mb-1">※ 掲載している各サービス・リンク先は、当サイトとは独立した別の運営者によるサービスです。</p>
            <p>© 2026 災害史ナビ All rights reserved.</p>
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center text-xs">
              <p className="text-gray-500">
                最終更新: {buildTime}
              </p>
              <p className="text-gray-500">
                本サイトの情報は参考情報です。防災対策は各自治体・公的機関の情報もご確認ください。
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
