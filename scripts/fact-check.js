#!/usr/bin/env node
/**
 * Enhanced Fact Check Script v2.0
 * 使い方: node scripts/fact-check.js [--verbose] [--json]
 */

const fs = require('fs');
const path = require('path');

const DISASTERS_DIR = path.join(__dirname, '../src/data/disasters');
const VALID_TYPES = ['earthquake','tsunami','typhoon','flood','landslide','volcano','fire','snowstorm','heatwave','other'];
const VALID_AFFILIATE_CATS = ['water','power','evacuation','indoor','general','tsunami','typhoon','flood','volcano','snowstorm','heatwave'];
const REQUIRED_FIELDS = ['slug','title','date','country','region','type','summary','background','damage','lessons','preparedness','affiliateCategory','tags','sources','featured','publishedAt'];
const VERBOSE = process.argv.includes('--verbose');
const JSON_OUTPUT = process.argv.includes('--json');

let errors = 0, warnings = 0;
const report = { files: [], errors: [], warnings: [], summary: {} };

const files = fs.readdirSync(DISASTERS_DIR).filter(f => f.endsWith('.json')).sort();

for (const file of files) {
  const filePath = path.join(DISASTERS_DIR, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const slug = file.replace('.json', '');
  const fileErrors = [], fileWarnings = [];

  // slug一致
  if (data.slug !== slug) { fileErrors.push(`slug不一致: "${data.slug}" ≠ "${slug}"`); errors++; }

  // 必須フィールド
  for (const field of REQUIRED_FIELDS) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      fileWarnings.push(`必須フィールド欠損: ${field}`); warnings++;
    }
  }

  // 型チェック
  if (data.type && !VALID_TYPES.includes(data.type)) { fileErrors.push(`無効なtype: ${data.type}`); errors++; }
  if (data.affiliateCategory && !VALID_AFFILIATE_CATS.includes(data.affiliateCategory)) { fileErrors.push(`無効なaffiliateCategory: ${data.affiliateCategory}`); errors++; }

  // 日付フォーマット
  if (data.date && !/^\d{4}-\d{2}-\d{2}$/.test(data.date)) { fileErrors.push(`日付フォーマット不正: ${data.date}`); errors++; }

  // 数値チェック
  for (const field of ['deaths','missing','injured']) {
    if (data[field] !== undefined && typeof data[field] !== 'number') { fileErrors.push(`${field}が数値でない: ${data[field]}`); errors++; }
  }

  // 配列の最低件数
  if (Array.isArray(data.lessons) && data.lessons.length < 4) { fileWarnings.push(`lessons少なすぎ: ${data.lessons.length}件`); warnings++; }
  if (Array.isArray(data.preparedness) && data.preparedness.length < 4) { fileWarnings.push(`preparedness少なすぎ: ${data.preparedness.length}件`); warnings++; }
  if (Array.isArray(data.tags) && data.tags.length < 3) { fileWarnings.push(`tags少なすぎ: ${data.tags.length}件`); warnings++; }
  if (Array.isArray(data.sources) && data.sources.length < 1) { fileWarnings.push('sources空'); warnings++; }

  // metaDescription長さ
  const md = data.metaDescription || '';
  if (md.length > 160) { fileWarnings.push(`metaDescription長すぎ: ${md.length}文字`); warnings++; }
  if (md.length < 50 && md.length > 0) { fileWarnings.push(`metaDescription短すぎ: ${md.length}文字`); warnings++; }

  // URLフォーマット
  for (const source of (data.sources || [])) {
    if (source.url && !source.url.startsWith('http')) { fileErrors.push(`URL不正: ${source.url}`); errors++; }
  }

  // relatedSlugsの検証（後で全体チェック）

  const status = fileErrors.length > 0 ? '❌' : fileWarnings.length > 0 ? '⚠️ ' : '✅';
  if (VERBOSE || fileErrors.length > 0 || fileWarnings.length > 0) {
    console.log(`${status} [${file}]`);
    fileErrors.forEach(e => console.log(`   ❌ ${e}`));
    fileWarnings.forEach(w => console.log(`   ⚠️  ${w}`));
  } else {
    console.log(`✅ [${file}] OK`);
  }

  report.files.push({ file, errors: fileErrors, warnings: fileWarnings });
}

// relatedSlugs クロスチェック
const allSlugs = new Set(files.map(f => f.replace('.json','')));
for (const file of files) {
  const data = JSON.parse(fs.readFileSync(path.join(DISASTERS_DIR, file), 'utf8'));
  for (const rs of (data.relatedSlugs || [])) {
    if (!allSlugs.has(rs)) {
      console.warn(`⚠️  [${file}] relatedSlug存在しない: ${rs}`); warnings++;
    }
  }
}

report.summary = { files: files.length, errors, warnings };

console.log(`\n📊 ${files.length}ファイルチェック完了: ❌${errors}エラー ⚠️${warnings}警告\n`);

if (JSON_OUTPUT) console.log('\n' + JSON.stringify(report, null, 2));
if (errors > 0) process.exit(1);
