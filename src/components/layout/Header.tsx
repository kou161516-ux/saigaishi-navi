'use client'
import Link from 'next/link'
import { useState } from 'react'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="bg-navy-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-amber-400 text-2xl font-bold">⚡</span>
            <div>
              <span className="text-xl font-bold text-white">災害史ナビ</span>
              <span className="hidden sm:block text-xs text-gray-400 leading-none">
                過去の災害から学ぶ今日の備え
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/disasters"
              className="text-gray-300 hover:text-amber-400 transition text-sm font-medium"
            >
              災害一覧
            </Link>
            <div className="relative group">
              <button className="text-gray-300 hover:text-amber-400 transition text-sm font-medium">
                国別 ▾
              </button>
              <div className="absolute top-full left-0 mt-1 w-32 bg-navy-800 rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity z-50">
                <Link
                  href="/country/japan"
                  className="block px-4 py-2 text-sm text-gray-300 hover:bg-navy-700 hover:text-amber-400"
                >
                  日本
                </Link>
                <Link
                  href="/country/world"
                  className="block px-4 py-2 text-sm text-gray-300 hover:bg-navy-700 hover:text-amber-400"
                >
                  世界
                </Link>
              </div>
            </div>
            <div className="relative group">
              <button className="text-gray-300 hover:text-amber-400 transition text-sm font-medium">
                種別 ▾
              </button>
              <div className="absolute top-full left-0 mt-1 w-36 bg-navy-800 rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity z-50">
                {[
                  { href: '/type/earthquake', label: '地震' },
                  { href: '/type/tsunami', label: '津波' },
                  { href: '/type/typhoon', label: '台風' },
                  { href: '/type/flood', label: '洪水・豪雨' },
                  { href: '/type/landslide', label: '土砂崩れ' },
                  { href: '/type/volcano', label: '火山' },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-navy-700 hover:text-amber-400"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="relative group">
              <button className="text-gray-300 hover:text-amber-400 transition text-sm font-medium">
                年代別 ▾
              </button>
              <div className="absolute top-full left-0 mt-1 w-32 bg-navy-800 rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity z-50">
                {['1920s', '1950s', '1990s', '2000s', '2010s', '2020s'].map(
                  (era) => (
                    <Link
                      key={era}
                      href={`/era/${era}`}
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-navy-700 hover:text-amber-400"
                    >
                      {era}
                    </Link>
                  )
                )}
              </div>
            </div>
            <Link
              href="/lessons"
              className="text-gray-300 hover:text-amber-400 transition text-sm font-medium"
            >
              教訓一覧
            </Link>
            <Link
              href="/tags"
              className="text-gray-300 hover:text-amber-400 transition text-sm font-medium"
            >
              タグ一覧
            </Link>
            <Link
              href="/stats"
              className="text-gray-300 hover:text-amber-400 transition text-sm font-medium"
            >
              統計
            </Link>
            <Link
              href="/about"
              className="text-gray-300 hover:text-amber-400 transition text-sm font-medium"
            >
              サイトについて
            </Link>
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-gray-300 hover:text-white"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="メニュー"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-navy-700">
            <div className="flex flex-col gap-2 pt-4">
              {[
                { href: '/disasters', label: '災害一覧' },
                { href: '/country/japan', label: '日本の災害' },
                { href: '/country/world', label: '世界の災害' },
                { href: '/type/earthquake', label: '地震' },
                { href: '/type/tsunami', label: '津波' },
                { href: '/type/typhoon', label: '台風' },
                { href: '/type/flood', label: '洪水・豪雨' },
                { href: '/era/2020s', label: '2020年代' },
                { href: '/era/2010s', label: '2010年代' },
                { href: '/era/2000s', label: '2000年代' },
                { href: '/era/1990s', label: '1990年代' },
                { href: '/lessons', label: '教訓一覧' },
                { href: '/tags', label: 'タグ一覧' },
                { href: '/stats', label: '統計ダッシュボード' },
                { href: '/about', label: 'サイトについて' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-gray-300 hover:text-amber-400 px-2 py-1 text-sm"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
