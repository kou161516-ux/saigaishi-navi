/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://saigaishi-navi.vercel.app',
  generateRobotsTxt: true,
  sitemapSize: 5000,
  changefreq: 'weekly',
  priority: 0.7,
  exclude: ['/contact/success'],
  transform: async (config, path) => {
    // トップページは優先度 1.0
    if (path === '/') {
      return {
        loc: path,
        changefreq: 'daily',
        priority: 1.0,
        lastmod: new Date().toISOString(),
      }
    }
    // 災害詳細ページは優先度 0.8
    if (path.startsWith('/disasters/')) {
      return {
        loc: path,
        changefreq: 'monthly',
        priority: 0.8,
        lastmod: new Date().toISOString(),
      }
    }
    // 災害一覧ページは優先度 0.9
    if (path === '/disasters') {
      return {
        loc: path,
        changefreq: 'weekly',
        priority: 0.9,
        lastmod: new Date().toISOString(),
      }
    }
    // その他のページはデフォルト設定
    return {
      loc: path,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: new Date().toISOString(),
    }
  },
  robotsTxtOptions: {
    additionalSitemaps: [],
    policies: [
      { userAgent: '*', allow: '/' },
      { userAgent: '*', disallow: ['/api/'] },
    ],
  },
}
