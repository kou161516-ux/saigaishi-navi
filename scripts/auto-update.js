#!/usr/bin/env node
/**
 * Auto-Update Script - disaster JSONのupdatedAt自動更新
 * 使い方: node scripts/auto-update.js
 *
 * 処理内容:
 * 1. 全disaster JSONを読む
 * 2. updatedAt が90日以上前のファイルをリストアップ
 * 3. 対象ファイルの一覧を出力（実際の更新は手動で行う）
 */

const fs = require('fs');
const path = require('path');

const DISASTERS_DIR = path.join(__dirname, '../src/data/disasters');
const TODAY = new Date();
const STALE_DAYS = 90;

const files = fs.readdirSync(DISASTERS_DIR).filter(f => f.endsWith('.json'));
const stale = [];
const recentlyUpdated = [];

for (const file of files) {
  const data = JSON.parse(fs.readFileSync(path.join(DISASTERS_DIR, file), 'utf8'));
  const updatedAt = data.updatedAt || data.publishedAt || '2024-01-01';
  const daysSince = Math.floor((TODAY - new Date(updatedAt)) / 86400000);

  if (daysSince > STALE_DAYS) {
    stale.push({ file, updatedAt, daysSince, title: data.title });
  } else {
    recentlyUpdated.push({ file, updatedAt, daysSince });
  }
}

console.log(`\n📊 更新状況レポート (${TODAY.toISOString().split('T')[0]})\n`);
console.log(`✅ 最近更新済み: ${recentlyUpdated.length}件`);
console.log(`⚠️  要更新確認 (${STALE_DAYS}日以上未更新): ${stale.length}件\n`);

if (stale.length > 0) {
  console.log('更新が必要な記事:');
  stale.sort((a,b) => b.daysSince - a.daysSince).forEach(s => {
    console.log(`  📅 ${s.updatedAt} (${s.daysSince}日前) [${s.file}] ${s.title}`);
  });
}
