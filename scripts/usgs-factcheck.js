#!/usr/bin/env node
/**
 * USGS自動ファクトチェックスクリプト
 * 使い方:
 *   node scripts/usgs-factcheck.js           # 照合のみ
 *   node scripts/usgs-factcheck.js --fix     # 不一致をUSGS値で自動修正
 *   node scripts/usgs-factcheck.js --save    # ログファイルに保存
 */

'use strict'

const https = require('https')
const fs = require('fs')
const path = require('path')
const url = require('url')

const DISASTERS_DIR = path.join(__dirname, '../src/data/disasters')
const LOGS_DIR = path.join(__dirname, '../logs')
const FIX_MODE = process.argv.includes('--fix')
const SAVE_MODE = process.argv.includes('--save')

const USGS_API = 'https://earthquake.usgs.gov/fdsnws/event/1/query'

// 各記事のUSGS検索クエリマッピング
const USGS_QUERY_MAP = {
  'chile-earthquake-tsunami-1960': {
    starttime: '1960-05-20', endtime: '1960-05-25',
    minmagnitude: 9.0, latitude: -37.0, longitude: -73.0, maxradiuskm: 500
  },
  'tangshan-earthquake-1976': {
    starttime: '1976-07-26', endtime: '1976-07-29',
    minmagnitude: 7.0, latitude: 39.6, longitude: 118.0, maxradiuskm: 200
  },
  'india-ocean-tsunami-2004': {
    starttime: '2004-12-25', endtime: '2004-12-27',
    minmagnitude: 9.0, latitude: 3.3, longitude: 95.9, maxradiuskm: 500
  },
  'izmit-earthquake-1999': {
    starttime: '1999-08-16', endtime: '1999-08-19',
    minmagnitude: 7.0, latitude: 40.7, longitude: 30.0, maxradiuskm: 200
  },
  'nepal-earthquake-2015': {
    starttime: '2015-04-24', endtime: '2015-04-26',
    minmagnitude: 7.5, latitude: 28.1, longitude: 84.7, maxradiuskm: 300
  },
  'turkey-syria-earthquake-2023': {
    starttime: '2023-02-05', endtime: '2023-02-07',
    minmagnitude: 7.5, latitude: 37.2, longitude: 37.0, maxradiuskm: 300
  },
  'morocco-earthquake-2023': {
    starttime: '2023-09-07', endtime: '2023-09-09',
    minmagnitude: 6.5, latitude: 31.1, longitude: -8.4, maxradiuskm: 200
  },
  'hokkaido-earthquake-2018': {
    starttime: '2018-09-05', endtime: '2018-09-07',
    minmagnitude: 6.5, latitude: 42.7, longitude: 142.0, maxradiuskm: 200
  },
  'kumamoto-earthquake-2016': {
    starttime: '2016-04-15', endtime: '2016-04-17',
    minmagnitude: 7.0, latitude: 32.8, longitude: 130.8, maxradiuskm: 200
  },
  'noto-earthquake-2024': {
    starttime: '2024-01-01', endtime: '2024-01-02',
    minmagnitude: 7.0, latitude: 37.5, longitude: 137.2, maxradiuskm: 200
  },
  'sichuan-earthquake-2008': {
    starttime: '2008-05-11', endtime: '2008-05-13',
    minmagnitude: 7.5, latitude: 31.0, longitude: 103.3, maxradiuskm: 300
  },
  'haiti-earthquake-2010': {
    starttime: '2010-01-11', endtime: '2010-01-13',
    minmagnitude: 7.0, latitude: 18.5, longitude: -72.5, maxradiuskm: 200
  }
}

/**
 * HTTPSでGETリクエストを送信しJSON文字列を返す
 * @param {string} requestUrl
 * @param {number} timeoutMs
 * @returns {Promise<string>}
 */
function httpsGet(requestUrl, timeoutMs = 10000) {
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
 * "M7.6", "Mw9.5", "M7.3（本震）" などに対応
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
 * USGSクエリを実行し、最大マグニチュードの地震を返す
 * @param {string} slug
 * @param {object} queryParams
 * @returns {Promise<{mag: number, id: string, place: string}|null>}
 */
async function fetchUSGSData(slug, queryParams) {
  const params = new url.URLSearchParams({
    format: 'geojson',
    orderby: 'magnitude',
    limit: '1',
    ...Object.fromEntries(
      Object.entries(queryParams).map(([k, v]) => [k, String(v)])
    )
  })

  const requestUrl = USGS_API + '?' + params.toString()

  const body = await httpsGet(requestUrl, 12000)
  const data = JSON.parse(body)

  if (!data.features || data.features.length === 0) {
    return null
  }

  const feature = data.features[0]
  return {
    mag: feature.properties.mag,
    id: feature.id,
    place: feature.properties.place
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

  push('=== USGS自動ファクトチェック ===')
  push('実行日時: ' + new Date().toLocaleString('ja-JP'))
  push('')
  push('【照合結果】')

  let successCount = 0
  let mismatchCount = 0
  let failCount = 0
  const fixedSlugs = []

  for (const [slug, queryParams] of Object.entries(USGS_QUERY_MAP)) {
    const filePath = path.join(DISASTERS_DIR, slug + '.json')

    if (!fs.existsSync(filePath)) {
      push(`❌ ${slug}: JSONファイルが存在しない`)
      failCount++
      continue
    }

    const articleData = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    const articleMag = parseMagnitude(articleData.magnitude)

    let usgsResult
    try {
      usgsResult = await fetchUSGSData(slug, queryParams)
    } catch (err) {
      push(`❌ ${slug}: USGSデータ取得失敗（${err.message}）`)
      failCount++
      continue
    }

    if (!usgsResult) {
      push(`❌ ${slug}: USGSにデータなし（クエリ条件に合致する地震が見つからない）`)
      failCount++
      continue
    }

    const usgsMag = Math.round(usgsResult.mag * 10) / 10

    if (articleMag === null) {
      push(`⚠️  ${slug}: USGS M${usgsMag} / 記事 magnitudeパース不可（"${articleData.magnitude}"）`)
      mismatchCount++
      continue
    }

    const diff = Math.abs(usgsMag - articleMag)

    if (diff < 0.2) {
      push(`✅ ${slug}: USGS M${usgsMag} / 記事 M${articleMag} → 一致`)
      successCount++
    } else {
      push(`⚠️  ${slug}: USGS M${usgsMag} / 記事 M${articleMag} → 要確認（差異${diff.toFixed(1)}以上）`)
      mismatchCount++

      if (FIX_MODE) {
        // USGSの値で記事を更新
        const originalMag = articleData.magnitude
        // magnitudeフィールドを更新（プレフィックスをMwに統一）
        articleData.magnitude = 'Mw' + usgsMag
        articleData.updatedAt = new Date().toISOString().split('T')[0]
        fs.writeFileSync(filePath, JSON.stringify(articleData, null, 2) + '\n', 'utf8')
        push(`   → 自動修正: "${originalMag}" → "Mw${usgsMag}"`)
        fixedSlugs.push(slug)
      }
    }

    // API負荷軽減のため間隔をあける
    await new Promise((resolve) => setTimeout(resolve, 300))
  }

  push('')
  push('【サマリー】')
  push(`照合成功: ${successCount}件 / 不一致: ${mismatchCount}件 / 取得失敗: ${failCount}件`)

  if (FIX_MODE && fixedSlugs.length > 0) {
    push('')
    push('【自動修正済みファイル】')
    fixedSlugs.forEach((s) => push(`  - ${s}.json`))
  }

  if (SAVE_MODE) {
    if (!fs.existsSync(LOGS_DIR)) {
      fs.mkdirSync(LOGS_DIR, { recursive: true })
    }
    const dateStr = new Date().toISOString().split('T')[0]
    const logPath = path.join(LOGS_DIR, `usgs-factcheck-${dateStr}.txt`)
    fs.writeFileSync(logPath, lines.join('\n') + '\n', 'utf8')
    console.log(`\nログ保存: ${logPath}`)
  }

  // 不一致があっても終了コード0（警告のみ）
  process.exit(0)
}

main().catch((err) => {
  console.error('予期しないエラー:', err)
  process.exit(1)
})
