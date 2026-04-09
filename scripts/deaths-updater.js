#!/usr/bin/env node
/**
 * deaths-updater.js
 * 死者数・関連死の最新値を照合するチェックスクリプト
 */

'use strict'

const fs = require('fs')
const path = require('path')

// ============================
// 照合対象データ定義
// ============================

/** @typedef {{ source: string, url: string, current_deaths: number, check_fields: string[], note: string, confirmed?: boolean }} DeathsCheckEntry */

/** @type {Record<string, DeathsCheckEntry>} */
const DEATHS_CHECK_SOURCES = {
  'noto-earthquake-2024': {
    source: '内閣府 令和6年能登半島地震',
    url: 'https://www.bousai.go.jp/updates/r60101notojishin/',
    current_deaths: 594,
    check_fields: ['deaths', 'missing'],
    note: '関連死が継続増加中。内閣府サイトで最新値を確認',
    confirmed: false,
  },
  'tohoku-earthquake-2011': {
    source: '警察庁 東日本大震災',
    url: 'https://www.npa.go.jp/news/latest/202403jishin.pdf',
    current_deaths: 15900,
    check_fields: ['deaths', 'missing'],
    note: '毎年3月11日前後に警察庁が確定値を更新',
    confirmed: false,
  },
  'fukushima-nuclear-2011': {
    source: '復興庁 関連死',
    url: 'https://www.reconstruction.go.jp/topics/main-cat2/sub-cat2-6/20140526131634.html',
    current_deaths: 2348,
    check_fields: ['deaths'],
    note: '毎年6月頃に復興庁が集計値を更新',
    confirmed: false,
  },
  'kumamoto-earthquake-2016': {
    source: '熊本県 最終報',
    url: 'https://www.pref.kumamoto.jp/soshiki/11/2206.html',
    current_deaths: 273,
    check_fields: ['deaths'],
    note: '2019年以降は変動なし（確定）',
    confirmed: true,
  },
  'turkey-syria-earthquake-2023': {
    source: 'AFAD / WHO 報告',
    url: 'https://reliefweb.int/disaster/eq-2023-000015-tur',
    current_deaths: 59259,
    check_fields: ['deaths', 'missing'],
    note: '復興フェーズのため変動は少ないが、関連死の集計が続く可能性がある',
    confirmed: false,
  },
  'hanshin-awaji-earthquake-1995': {
    source: '消防庁 確定報',
    url: 'https://www.fdma.go.jp/disaster/info/items/hanshin_awaji.pdf',
    current_deaths: 6434,
    check_fields: ['deaths'],
    note: '確定値。変動なし',
    confirmed: true,
  },
  'haiti-earthquake-2010': {
    source: 'USGS / Haiti Government',
    url: 'https://earthquake.usgs.gov/earthquakes/eventpage/usp000h60h/executive',
    current_deaths: 316000,
    check_fields: ['deaths'],
    note: '推計値に幅あり（100,000〜316,000）。公式集計が複数存在',
    confirmed: false,
  },
  'india-ocean-tsunami-2004': {
    source: 'USGS / UN Report',
    url: 'https://www.usgs.gov/faqs/how-many-people-died-2004-indian-ocean-tsunami',
    current_deaths: 227898,
    check_fields: ['deaths', 'missing'],
    note: '複数国にまたがるため集計値に差がある',
    confirmed: false,
  },
}

// データディレクトリ
const DATA_DIR = path.join(__dirname, '..', 'src', 'data', 'disasters')
const LOGS_DIR = path.join(__dirname, '..', 'logs')

// コマンドライン引数
const SAVE_REPORT = process.argv.includes('--report')

// ============================
// ユーティリティ関数
// ============================

/**
 * 全記事データを読み込む
 * @returns {Array}
 */
function loadAllArticles() {
  const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith('.json'))
  return files.map((f) => {
    const raw = fs.readFileSync(path.join(DATA_DIR, f), 'utf-8')
    return JSON.parse(raw)
  })
}

/**
 * 数値を3桁区切りでフォーマット
 * @param {number} n
 * @returns {string}
 */
function formatNumber(n) {
  return n.toLocaleString('ja-JP')
}

/**
 * 差異の程度をラベルで返す
 * @param {number} dbValue
 * @param {number} refValue
 * @returns {{ label: string, icon: string }}
 */
function getDiffStatus(dbValue, refValue) {
  if (dbValue === refValue) return { label: '一致', icon: '✅' }
  const diff = dbValue - refValue
  const pct = Math.abs(diff / refValue) * 100
  if (pct < 1) return { label: `微差 (${diff > 0 ? '+' : ''}${diff})`, icon: '🔶' }
  if (pct < 5) return { label: `要確認 (差${Math.abs(diff).toLocaleString()})`, icon: '⚠️' }
  return { label: `要更新 (差${Math.abs(diff).toLocaleString()}、${pct.toFixed(1)}%)`, icon: '🚨' }
}

// ============================
// チェック処理
// ============================

/**
 * 記事のDBデータとリファレンス値を照合する
 * @param {Array} articles
 * @returns {Array}
 */
function runDeathsCheck(articles) {
  const results = []

  for (const [slug, refData] of Object.entries(DEATHS_CHECK_SOURCES)) {
    const article = articles.find((a) => a.slug === slug)

    if (!article) {
      results.push({
        slug,
        title: slug,
        status: 'not_found',
        ref: refData,
        dbDeaths: null,
        dbMissing: null,
      })
      continue
    }

    const dbDeaths = typeof article.deaths === 'number' ? article.deaths : null
    const dbMissing = typeof article.missing === 'number' ? article.missing : null

    // 死者数の差異チェック
    const deathsDiff =
      dbDeaths !== null ? getDiffStatus(dbDeaths, refData.current_deaths) : null

    results.push({
      slug,
      title: article.title,
      status: 'found',
      confirmed: refData.confirmed,
      ref: refData,
      dbDeaths,
      dbMissing,
      deathsDiff,
      updatedAt: article.updatedAt || article.publishedAt,
    })
  }

  return results
}

// ============================
// 出力フォーマット
// ============================

/**
 * チェック結果をテキストにフォーマット
 * @param {Array} results
 * @param {Date} now
 * @returns {string}
 */
function formatDeathsReport(results, now) {
  const lines = []
  const dateStr = now.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })

  lines.push('=== 死者数・関連死 照合レポート ===')
  lines.push(`実行日時: ${dateStr}`)
  lines.push(`照合対象: ${results.length}件`)
  lines.push('')

  // 要確認・要更新を先に表示
  const urgent = results.filter(
    (r) =>
      r.status === 'found' &&
      !r.confirmed &&
      r.deathsDiff &&
      r.deathsDiff.icon !== '✅',
  )
  const confirmed = results.filter((r) => r.confirmed)
  const ok = results.filter(
    (r) => r.status === 'found' && r.deathsDiff && r.deathsDiff.icon === '✅',
  )
  const notFound = results.filter((r) => r.status === 'not_found')

  // 要確認セクション
  if (urgent.length > 0) {
    lines.push('【要確認・要更新 記事】')
    for (const r of urgent) {
      lines.push(`  ${r.deathsDiff.icon} ${r.title} (${r.slug})`)
      lines.push(`     DB値: ${r.dbDeaths !== null ? formatNumber(r.dbDeaths) : '未設定'}人`)
      lines.push(`     参照値: ${formatNumber(r.ref.current_deaths)}人 (${r.ref.source})`)
      lines.push(`     差異: ${r.deathsDiff.label}`)
      lines.push(`     最終更新: ${r.updatedAt}`)
      lines.push(`     確認URL: ${r.ref.url}`)
      lines.push(`     備考: ${r.ref.note}`)
      if (r.ref.check_fields.includes('missing') && r.dbMissing !== null) {
        lines.push(`     行方不明者（DB）: ${formatNumber(r.dbMissing)}人`)
      }
      lines.push('')
    }
  }

  // 値が一致しているセクション
  if (ok.length > 0) {
    lines.push('【✅ DB値と参照値が一致】')
    for (const r of ok) {
      lines.push(
        `  ${r.title} — ${formatNumber(r.dbDeaths)}人 (${r.ref.source})`,
      )
    }
    lines.push('')
  }

  // 確定値セクション
  if (confirmed.length > 0) {
    lines.push('【🔒 確定値（変動なし）】')
    for (const r of confirmed) {
      lines.push(
        `  ${r.title} — ${r.dbDeaths !== null ? formatNumber(r.dbDeaths) : '未設定'}人 / 参照: ${formatNumber(r.ref.current_deaths)}人`,
      )
      lines.push(`     備考: ${r.ref.note}`)
    }
    lines.push('')
  }

  // 記事なし
  if (notFound.length > 0) {
    lines.push('【⚠️ 記事データが見つからなかったスラッグ】')
    for (const r of notFound) {
      lines.push(`  - ${r.slug}`)
    }
    lines.push('')
  }

  lines.push('--- 更新スケジュール目安 ---')
  lines.push('  能登地震 (2024): 内閣府発表のたびに随時確認')
  lines.push('  東日本大震災 (2011): 毎年3月11日前後')
  lines.push('  福島原発 (2011): 毎年6月頃（復興庁集計）')
  lines.push('  その他未確定: 重大発表時に随時確認')

  return lines.join('\n')
}

// ============================
// メイン処理
// ============================

function main() {
  const envDate = process.env.CHECK_DATE
  const now = envDate ? new Date(envDate) : new Date('2026-04-09')

  // 全記事読み込み
  const articles = loadAllArticles()

  // 死者数照合
  const results = runDeathsCheck(articles)

  // レポート生成・出力
  const report = formatDeathsReport(results, now)
  console.log(report)

  // --report オプション時はファイル保存
  if (SAVE_REPORT) {
    if (!fs.existsSync(LOGS_DIR)) {
      fs.mkdirSync(LOGS_DIR, { recursive: true })
    }
    const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19)
    const reportPath = path.join(LOGS_DIR, `deaths-update-${timestamp}.txt`)
    fs.writeFileSync(reportPath, report, 'utf-8')
    console.log(`\nレポートを保存しました: ${reportPath}`)
  }
}

main()
