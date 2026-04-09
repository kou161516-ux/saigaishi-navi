#!/usr/bin/env node
/**
 * Fact Check Script - disaster JSONの品質チェック
 * 使い方: node scripts/fact-check.js
 */

const fs = require('fs');
const path = require('path');

const DISASTERS_DIR = path.join(__dirname, '../src/data/disasters');

const VALID_TYPES = ['earthquake','tsunami','typhoon','flood','landslide','volcano','fire','snowstorm','heatwave','other'];
const VALID_AFFILIATE_CATS = ['water','power','evacuation','indoor','general','tsunami','typhoon','flood','volcano','snowstorm','heatwave'];
const REQUIRED_FIELDS = ['slug','title','date','country','region','type','summary','background','damage','lessons','preparedness','affiliateCategory','tags','sources','featured','publishedAt'];

let errors = 0, warnings = 0;

const files = fs.readdirSync(DISASTERS_DIR).filter(f => f.endsWith('.json'));

for (const file of files) {
  const data = JSON.parse(fs.readFileSync(path.join(DISASTERS_DIR, file), 'utf8'));
  const slug = file.replace('.json', '');

  // slug一致チェック
  if (data.slug !== slug) {
    console.error(`❌ [${file}] slug不一致: ${data.slug} ≠ ${slug}`); errors++;
  }

  // 必須フィールドチェック
  for (const field of REQUIRED_FIELDS) {
    if (!data[field] && data[field] !== 0 && data[field] !== false) {
      console.warn(`⚠️  [${file}] 必須フィールド欠損: ${field}`); warnings++;
    }
  }

  // 型チェック
  if (data.type && !VALID_TYPES.includes(data.type)) {
    console.error(`❌ [${file}] 無効なtype: ${data.type}`); errors++;
  }
  if (data.affiliateCategory && !VALID_AFFILIATE_CATS.includes(data.affiliateCategory)) {
    console.error(`❌ [${file}] 無効なaffiliateCategory: ${data.affiliateCategory}`); errors++;
  }

  // 日付フォーマット
  if (data.date && !/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
    console.error(`❌ [${file}] 日付フォーマット不正: ${data.date}`); errors++;
  }

  // 数値チェック
  if (data.deaths !== undefined && typeof data.deaths !== 'number') {
    console.error(`❌ [${file}] deaths が数値でない: ${data.deaths}`); errors++;
  }

  // lessons/preparedness最低件数
  if (!Array.isArray(data.lessons) || data.lessons.length < 3) {
    console.warn(`⚠️  [${file}] lessons が少なすぎる (${data.lessons?.length || 0}件)`); warnings++;
  }

  console.log(`✅ [${file}] OK`);
}

console.log(`\n📊 ${files.length}ファイルチェック完了: ❌${errors}エラー ⚠️${warnings}警告\n`);
if (errors > 0) process.exit(1);
