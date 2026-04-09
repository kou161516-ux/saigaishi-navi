#!/usr/bin/env node
/**
 * 気象庁自動ファクトチェックスクリプト
 * 使い方:
 *   node scripts/jma-factcheck.js           # 照合のみ
 *   node scripts/jma-factcheck.js --save    # ログファイルに保存
 *
 * 注意: 気象庁APIは最近の地震リスト（通常直近数ヶ月〜1年程度）のみ取得可能。
 *       2016年以前の地震はAPIにデータが存在しない可能性があります。
 */

'use strict'

const https = require('https')
const fs = require('fs')
const path = require('path')
const url = require('url')

const DISASTERS_DIR = path.join(__dirname, '../src/data/disasters')
const LOGS_DIR = path.join(__dirname, '../logs')
const SAVE_MODE = process.argv.includes('--save')

// 気象庁地震情報API
const JMA_QUAKE_LIST = 'https://www.jma.go.jp/bosai/quake/data/list.json'

// 日本記事の照合対象
const JMA_CHECK_SLUGS = [
  'noto-earthquake-2024',         // 2024年は気象庁DBに存在
  'hokkaido-earthquake-2018',     // 2018年 存在可能性あり（APIの保持期間次第）
  'kumamoto-earthquake-2016',     // 2016年 古い可能性あり
  'tottori-earthquake-2000',      // 古すぎてAPIにない → スキップ処理
]

/**
 * HTTPSでGETリクエストを送信しJSON文字列を返す
 * @param {string} requestUrl
 * @param {number} timeoutMs
 * @returns {Promise<string>}
 */
function httpsGet(requestUrl, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new url.URL(requestUrl)
    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
      headers: {
        'User-Agent': 'saigaishi-navi-factcheck/1.0',
        'Accept': 'application/json'
      }
    }

    const req = https.request(options, (res) => {
      let body = ''
      res.setEncoding('utf8')
      res.on('data', (chunk) => { body += chunk })
      res.on('end', () => { resolve(body) })
    })

    req.setTimeout(timeoutMs, () => {
      req.destroy()
      reject(new Error('タイムアウト（' + timeoutMs + 'ms）'))
    })

    req.on('error', (err) => { reject(err) })
    req.end()
  })
}

/**
 * 記事のmagnitudeフィールドから数値を抽出
 * "M7.6", "M7.3（本震）" などに対応
 * @param {string} magnitudeStr
 * @returns {number|null}
 */
function parseMagnitude(magnitudeStr) {
  if (!magnitudeStr || typeof magnitudeStr !== 'string') return null
  const match = magnitudeStr.match(/M(?:w|s|l|b)?(\d+(?:\.\d+)?)/)
  if (!match) return null
  return parseFloat(match[1])
}

/**
 * 気象庁APIレスポンスのマグニチュード文字列から数値を抽出
 * @param {string} magStr - 例: "7.6", "6.7"
 * @returns {number|null}
 */
function parseJMAMagnitude(magStr) {
  if (!magStr) return null
  const num = parseFloat(magStr)
  return isNaN(num) ? null : num
}

/**
 * 気象庁APIから地震リストを取得し、指定記事との照合を行う
 * @param {Array<{event_id: string, date: string, mag: number, place: string}>} jmaList
 * @param {string} slug
 * @param {object} articleData
 * @returns {{status: 'match'|'mismatch'|'not_found'|'skip', detail: string}}
 */
function matchJMAData(jmaList, slug, articleData) {
  const articleMag = parseMagnitude(articleData.magnitude)
  const articleDate = articleData.date // "YYYY-MM-DD"

  if (!articleDate) {
    return { status: 'not_found', detail: '記事にdateフィールドがない' }
  }

  // 記事の日付から±2日の範囲で照合
  const articleDateObj = new Date(articleDate)
  const twoDay = 2 * 24 * 60 * 60 * 1000

  const candidates = jmaList.filter((item) => {
    if (!item.at) return false
    const itemDate = new Date(item.at)
    return Math.abs(itemDate.getTime() - articleDateObj.getTime()) <= twoDay
  })

  if (candidates.length === 0) {
    return { status: 'not_found', detail: `気象庁APIに該当日（${articleDate}）の地震データなし（APIの保持期間外の可能性あり）` }
  }

  // マグニチュード最大のものを選択
  const best = candidates.reduce((a, b) => {
    const ma = parseJMAMagnitude(a.mag) ?? 0
    const mb = parseJMAMagnitude(b.mag) ?? 0
    return ma >= mb ? a : b
  })

  const jmaMag = parseJMAMagnitude(best.mag)

  if (jmaMag === null) {
    return { status: 'not_found', detail: `気象庁データのマグニチュード不明: "${best.mag}"` }
  }

  if (articleMag === null) {
    return {
      status: 'mismatch',
      detail: `気象庁 M${jmaMag} / 記事 magnitudeパース不可（"${articleData.magnitude}"）`
    }
  }

  const diff = Math.abs(jmaMag - articleMag)
  if (diff < 0.2) {
    return {
      status: 'match',
      detail: `気象庁 M${jmaMag} / 記事 M${articleMag} → 一致`
    }
  } else {
    return {
      status: 'mismatch',
      detail: `気象庁 M${jmaMag} / 記事 M${articleMag} → 要確認（差異${diff.toFixed(1)}以上）`
    }
  }
}

/**
 * メイン処理
 */
async function main() {
  const lines = []
  const push = (line) => {
    console.log(line)
    lines.push(line)
  }

  push('=== 気象庁自動ファクトチェック ===')
  push('実行日時: ' + new Date().toLocaleString('ja-JP'))
  push('')

  // 気象庁APIから地震リストを取得
  push('気象庁地震リストAPIを取得中...')
  let jmaList = []
  let jmaFetchFailed = false

  try {
    const body = await httpsGet(JMA_QUAKE_LIST, 15000)
    jmaList = JSON.parse(body)
    push(`取得成功: ${jmaList.length}件の地震データ`)
  } catch (err) {
    push(`❌ 気象庁API取得失敗: ${err.message}`)
    jmaFetchFailed = true
  }

  push('')
  push('【照合結果】')

  let successCount = 0
  let mismatchCount = 0
  let failCount = 0
  let skipCount = 0

  for (const slug of JMA_CHECK_SLUGS) {
    const filePath = path.join(DISASTERS_DIR, slug + '.json')

    if (!fs.existsSync(filePath)) {
      push(`❌ ${slug}: JSONファイルが存在しない`)
      failCount++
      continue
    }

    const articleData = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    const articleDate = articleData.date

    // 2000年以前の地震はAPIにないためスキップ
    if (articleDate) {
      const year = parseInt(articleDate.split('-')[0], 10)
      if (year < 2015) {
        push(`⏭  ${slug}: ${year}年の地震は気象庁APIの保持期間外 → スキップ`)
        skipCount++
        continue
      }
    }

    if (jmaFetchFailed) {
      push(`❌ ${slug}: 気象庁API取得失敗のためスキップ`)
      failCount++
      continue
    }

    const result = matchJMAData(jmaList, slug, articleData)

    switch (result.status) {
      case 'match':
        push(`✅ ${slug}: ${result.detail}`)
        successCount++
        break
      case 'mismatch':
        push(`⚠️  ${slug}: ${result.detail}`)
        mismatchCount++
        break
      case 'not_found':
        push(`⚠️  ${slug}: ${result.detail}`)
        // APIに存在しないのはデータ古い等の理由が多いため失敗扱いにしない
        skipCount++
        break
      case 'skip':
        push(`⏭  ${slug}: ${result.detail}`)
        skipCount++
        break
    }
  }

  push('')
  push('【サマリー】')
  push(`照合成功: ${successCount}件 / 不一致: ${mismatchCount}件 / 取得失敗: ${failCount}件 / スキップ: ${skipCount}件`)
  push('')
  push('【補足メモ】')
  push('・能登半島地震（2024年）の最新死者数については気象庁ではなく内閣府のページを参照してください。')
  push('  内閣府防災情報: https://www.bousai.go.jp/updates/r60101notojishin/index.html')
  push('・気象庁APIは直近の地震情報（保持期間は概ね数ヶ月）のみ取得可能。')
  push('  2016年以前の地震については気象庁震度データベース検索をご利用ください。')
  push('  https://www.data.jma.go.jp/svd/eqdb/data/shindo/index.html')

  if (SAVE_MODE) {
    if (!fs.existsSync(LOGS_DIR)) {
      fs.mkdirSync(LOGS_DIR, { recursive: true })
    }
    const dateStr = new Date().toISOString().split('T')[0]
    const logPath = path.join(LOGS_DIR, `jma-factcheck-${dateStr}.txt`)
    fs.writeFileSync(logPath, lines.join('\n') + '\n', 'utf8')
    console.log(`\nログ保存: ${logPath}`)
  }

  process.exit(0)
}

main().catch((err) => {
  console.error('予期しないエラー:', err)
  process.exit(1)
})
