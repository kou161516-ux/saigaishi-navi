import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-navy-900 text-gray-400 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-amber-400 text-xl">⚡</span>
              <span className="text-white font-bold text-lg">災害史ナビ</span>
            </div>
            <p className="text-sm leading-relaxed">
              日本・世界の重大災害の歴史を学び、
              今日の備えにつなげる防災情報データベース。
            </p>
          </div>

          {/* Links */}
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

          {/* Info */}
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

        <div className="border-t border-gray-700 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
          <p>© 2024 災害史ナビ All rights reserved.</p>
          <p className="text-xs">
            本サイトの情報は参考情報です。防災対策は各自治体・公的機関の情報もご確認ください。
          </p>
        </div>
      </div>
    </footer>
  )
}
