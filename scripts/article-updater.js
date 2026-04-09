#!/usr/bin/env node
/**
 * article-updater.js
 * 記事の更新状況をチェックし、更新が必要な記事を特定するスクリプト
 */

'use strict'

const fs = require('fs')
const path = require('path')

// ============================
// 更新判断ルール定義
// ============================
const UPDATE_RULES = {
  // 進行中の災害（updatedAtが古い + 現在も被害継続の可能性）
  ongoing_disasters: [
    'noto-earthquake-2024',        // 関連死が今も増加中
    'turkey-syria-earthquake-2023', // 復興状況が変化
  ],

  // 毎年更新が必要な記事（震災関連死など年次更新）
  annual_update: [
    'tohoku-earthquake-2011',   // 関連死・行方不明者数が毎年更新
    'fukushima-nuclear-2011',   // 関連死が毎年更新
    'noto-earthquake-2024',     // 死者数更新
  ],

  // 10年節目で更新推奨
  anniversary_update: {
    2025: ['hanshin-awaji-earthquake-1995'], // 30周年
    2026: [],
    2033: ['tohoku-earthquake-2011'],        // 22周年
  },
}

// 周年チェック対象（5年・10年単位）
const ANNIVERSARY_MILESTONES = [5, 10, 15, 20, 25, 30, 35, 40, 50, 75, 100]

// 警告しきい値
const ONGOING_THRESHOLD_DAYS = 30
const ANNUAL_THRESHOLD_DAYS = 365

// データディレクトリ
const DATA_DIR = path.join(__dirname, '..', 'src', 'data', 'disasters')
const LOGS_DIR = path.join(__dirname, '..', 'logs')

// コマンドライン引数
const SAVE_REPORT = process.argv.includes('--report')

// ============================
// ユーティリティ関数
// ============================

/**
 * 2つの日付の差を日数で返す
 * @param {Date} dateA
 * @param {Date} dateB
 * @returns {number}
 */
function diffDays(dateA, dateB) {
  const msPerDay = 1000 * 60 * 60 * 24
  return Math.floor((dateA.getTime() - dateB.getTime()) / msPerDay)
}

/**
 * 日付を YYYY-MM-DD 形式にフォーマット
 * @param {Date} date
 * @returns {string}
 */
function formatDate(date) {
  return date.toISOString().split('T')[0]
}

/**
 * 全記事データを読み込む
 * @returns {Array<{slug: string, title: string, date: string, updatedAt: string | undefined, publishedAt: string}>}
 */
function loadAllArticles() {
  const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith('.json'))
  return files.map((f) => {
    const raw = fs.readFileSync(path.join(DATA_DIR, f), 'utf-8')
    return JSON.parse(raw)
  })
}

/**
 * 災害の発生年から、現在年時点での周年を計算する
 * @param {number} disasterYear
 * @param {number} currentYear
 * @returns {number | null} 周年数（節目の場合のみ）、該当なしはnull
 */
function getMilestoneAnniversary(disasterYear, currentYear) {
  const age = currentYear - disasterYear
  if (ANNIVERSARY_MILESTONES.includes(age)) return age
  return null
}

// ============================
// チェック関数
// ============================

/**
 * 進行中災害の更新チェック
 * @param {Array} articles
 * @param {Date} now
 * @returns {Array}
 */
function checkOngoingDisasters(articles, now) {
  const alerts = []
  for (const slug of UPDATE_RULES.ongoing_disasters) {
    const article = articles.find((a) => a.slug === slug)
    if (!article) continue

    const updatedStr = article.updatedAt || article.publishedAt
    const updatedDate = new Date(updatedStr)
    const daysSinceUpdate = diffDays(now, updatedDate)

    if (daysSinceUpdate >= ONGOING_THRESHOLD_DAYS) {
      alerts.push({
        slug,
        title: article.title,
        updatedAt: updatedStr,
        daysSinceUpdate,
        type: 'ongoing',
        reason: getOngoingReason(slug),
        sourceUrl: getSourceUrl(slug),
        updateFields: getUpdateFields(slug),
      })
    }
  }
  return alerts
}

/**
 * 年次更新チェック
 * @param {Array} articles
 * @param {Date} now
 * @returns {Array}
 */
function checkAnnualUpdates(articles, now) {
  const alerts = []
  // annual_update の slug のうち、ongoing_disasters に含まれないもの
  const annualOnly = UPDATE_RULES.annual_update.filter(
    (slug) => !UPDATE_RULES.ongoing_disasters.includes(slug),
  )
  for (const slug of annualOnly) {
    const article = articles.find((a) => a.slug === slug)
    if (!article) continue

    const updatedStr = article.updatedAt || article.publishedAt
    const updatedDate = new Date(updatedStr)
    const daysSinceUpdate = diffDays(now, updatedDate)

    if (daysSinceUpdate >= ANNUAL_THRESHOLD_DAYS) {
      alerts.push({
        slug,
        title: article.title,
        updatedAt: updatedStr,
        daysSinceUpdate,
        type: 'annual',
        reason: getAnnualReason(slug),
        sourceUrl: getSourceUrl(slug),
        updateFields: getUpdateFields(slug),
      })
    }
  }
  return alerts
}

/**
 * 周年記念チェック（5年・10年節目）
 * @param {Array} articles
 * @param {Date} now
 * @returns {Array}
 */
function checkAnniversaries(articles, now) {
  const currentYear = now.getFullYear()
  const notices = []

  for (const article of articles) {
    const disasterYear = new Date(article.date).getFullYear()
    const milestone = getMilestoneAnniversary(disasterYear, currentYear)
    if (!milestone) continue

    notices.push({
      slug: article.slug,
      title: article.title,
      disasterYear,
      currentYear,
      milestone,
      type: 'anniversary',
      suggestion: `summaryに${milestone}周年の節目の言及を追加`,
    })
  }

  // anniversary_update で明示されたスラッグも追加（重複除外）
  const existingSlugs = new Set(notices.map((n) => n.slug))
  const explicitList = UPDATE_RULES.anniversary_update[currentYear] || []
  for (const slug of explicitList) {
    if (existingSlugs.has(slug)) continue
    const article = articles.find((a) => a.slug === slug)
    if (!article) continue
    const disasterYear = new Date(article.date).getFullYear()
    const age = currentYear - disasterYear
    notices.push({
      slug,
      title: article.title,
      disasterYear,
      currentYear,
      milestone: age,
      type: 'anniversary',
      suggestion: `summaryに${age}周年の節目の言及を追加（設定ファイルで明示指定）`,
    })
  }

  return notices
}

// ============================
// スラッグ別補足情報
// ============================

function getOngoingReason(slug) {
  const reasons = {
    'noto-earthquake-2024': '関連死・復興状況が継続変化中',
    'turkey-syria-earthquake-2023': '復興状況・死者数が変化中',
  }
  return reasons[slug] || '進行中の災害'
}

function getAnnualReason(slug) {
  const reasons = {
    'tohoku-earthquake-2011': '毎年3月11日前後に警察庁が確定値を更新',
    'fukushima-nuclear-2011': '毎年6月頃に復興庁が集計値を更新',
    'noto-earthquake-2024': '死者数・関連死が継続更新',
  }
  return reasons[slug] || '年次更新が推奨される記事'
}

function getSourceUrl(slug) {
  const urls = {
    'noto-earthquake-2024': 'https://www.bousai.go.jp/updates/r60101notojishin/',
    'tohoku-earthquake-2011': 'https://www.npa.go.jp/news/latest/',
    'fukushima-nuclear-2011':
      'https://www.reconstruction.go.jp/topics/main-cat2/sub-cat2-6/20140526131634.html',
    'turkey-syria-earthquake-2023':
      'https://reliefweb.int/disaster/eq-2023-000015-tur',
  }
  return urls[slug] || null
}

function getUpdateFields(slug) {
  const fields = {
    'noto-earthquake-2024': ['deaths', 'missing', 'summary', 'damage'],
    'tohoku-earthquake-2011': ['deaths', 'missing', 'summary'],
    'fukushima-nuclear-2011': ['deaths', 'summary'],
    'turkey-syria-earthquake-2023': ['deaths', 'missing', 'summary'],
  }
  return fields[slug] || ['deaths', 'summary']
}

// ============================
// 出力フォーマット
// ============================

/**
 * 日数を「N日前」「今日」などの文字列に変換
 * @param {number} days
 * @returns {string}
 */
function formatDaysAgo(days) {
  if (days === 0) return '今日'
  if (days < 0) return `${Math.abs(days)}日後`
  return `${days}日前`
}

/**
 * チェック結果をターミナル出力用にフォーマット
 * @param {Array} ongoingAlerts
 * @param {Array} annualAlerts
 * @param {Array} anniversaryNotices
 * @param {number} totalArticles
 * @param {Date} now
 * @returns {string}
 */
function formatReport(ongoingAlerts, annualAlerts, anniversaryNotices, totalArticles, now) {
  const lines = []
  const dateStr = now.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })

  lines.push('=== 記事更新状況チェック ===')
  lines.push(`実行日時: ${dateStr}`)
  lines.push('')

  // 緊急更新推奨
  lines.push(`【🚨 緊急更新推奨（${ONGOING_THRESHOLD_DAYS}日以上未更新の進行中災害）】`)
  if (ongoingAlerts.length === 0) {
    lines.push('  （該当なし）')
  } else {
    ongoingAlerts.forEach((alert, i) => {
      lines.push(`${i + 1}. ${alert.title}`)
      lines.push(`   最終更新: ${alert.updatedAt} (${formatDaysAgo(alert.daysSinceUpdate)})`)
      lines.push(`   理由: ${alert.reason}`)
      if (alert.sourceUrl) {
        lines.push(`   確認先: ${alert.sourceUrl}`)
      }
      lines.push(`   更新すべき項目: ${alert.updateFields.join('・')}`)
    })
  }
  lines.push('')

  // 年次更新推奨
  lines.push(`【📅 年次更新推奨（${ANNUAL_THRESHOLD_DAYS}日以上）】`)
  if (annualAlerts.length === 0) {
    lines.push('  （該当なし）')
  } else {
    annualAlerts.forEach((alert, i) => {
      const num = ongoingAlerts.length + i + 1
      lines.push(`${num}. ${alert.title}`)
      lines.push(`   最終更新: ${alert.updatedAt} (${formatDaysAgo(alert.daysSinceUpdate)})`)
      lines.push(`   理由: ${alert.reason}`)
      if (alert.sourceUrl) {
        lines.push(`   確認先: ${alert.sourceUrl}`)
      }
      lines.push(`   更新すべき項目: ${alert.updateFields.join('・')}`)
    })
  }
  lines.push('')

  // 周年記念
  lines.push('【🎂 周年記念（5年・10年節目）】')
  if (anniversaryNotices.length === 0) {
    lines.push('  （今年は該当なし）')
  } else {
    anniversaryNotices.forEach((notice, i) => {
      const num = ongoingAlerts.length + annualAlerts.length + i + 1
      lines.push(`${num}. ${notice.title}`)
      lines.push(`   ${notice.currentYear}年 → ${notice.milestone}周年（${notice.disasterYear}年発生）`)
      lines.push(`   推奨: ${notice.suggestion}`)
    })
  }
  lines.push('')

  // 更新不要
  const alertCount = ongoingAlerts.length + annualAlerts.length + anniversaryNotices.length
  const okCount = totalArticles - alertCount
  lines.push('【✅ 更新不要】')
  lines.push(`残り ${okCount > 0 ? okCount : 0}件は最新状態`)
  lines.push('')
  lines.push(`--- 合計: ${totalArticles}記事中 ${alertCount}件が要確認 ---`)

  return lines.join('\n')
}

// ============================
// メイン処理
// ============================

function main() {
  const now = new Date('2026-04-09') // 現在日付（環境変数でオーバーライド可）
  const envDate = process.env.CHECK_DATE
  const checkDate = envDate ? new Date(envDate) : now

  // 全記事読み込み
  const articles = loadAllArticles()

  // 各チェック実行
  const ongoingAlerts = checkOngoingDisasters(articles, checkDate)
  const annualAlerts = checkAnnualUpdates(articles, checkDate)
  const anniversaryNotices = checkAnniversaries(articles, checkDate)

  // レポート生成
  const report = formatReport(
    ongoingAlerts,
    annualAlerts,
    anniversaryNotices,
    articles.length,
    checkDate,
  )

  // ターミナル出力
  console.log(report)

  // --report オプション時はファイル保存
  if (SAVE_REPORT) {
    if (!fs.existsSync(LOGS_DIR)) {
      fs.mkdirSync(LOGS_DIR, { recursive: true })
    }
    const timestamp = checkDate.toISOString().replace(/[:.]/g, '-').slice(0, 19)
    const reportPath = path.join(LOGS_DIR, `article-update-${timestamp}.txt`)
    fs.writeFileSync(reportPath, report, 'utf-8')
    console.log(`\nレポートを保存しました: ${reportPath}`)
  }
}

main()
