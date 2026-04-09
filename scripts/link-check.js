#!/usr/bin/env node
/**
 * Link Checker - 全disaster JSONファイルのsources URLをチェック
 * 使い方: node scripts/link-check.js
 *
 * 結果:
 * ✅ 200 OK
 * ⚠️  301/302 リダイレクト（URLを更新推奨）
 * ❌ 404/5xx エラー（要修正）
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const DISASTERS_DIR = path.join(__dirname, '../src/data/disasters');
const TIMEOUT = 10000;

function checkUrl(url) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    try {
      const req = protocol.get(url, {
        timeout: TIMEOUT,
        headers: { 'User-Agent': 'Mozilla/5.0 saigaishi-navi link-checker' }
      }, (res) => {
        resolve({ url, status: res.statusCode, ok: res.statusCode < 400 });
        res.destroy();
      });
      req.on('error', () => resolve({ url, status: 0, ok: false, error: 'connection error' }));
      req.on('timeout', () => { req.destroy(); resolve({ url, status: 0, ok: false, error: 'timeout' }); });
    } catch (e) {
      resolve({ url, status: 0, ok: false, error: e.message });
    }
  });
}

async function main() {
  const files = fs.readdirSync(DISASTERS_DIR).filter(f => f.endsWith('.json'));
  const allUrls = [];

  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(path.join(DISASTERS_DIR, file), 'utf8'));
    const urls = (data.sources || []).filter(s => s.url).map(s => ({ file, url: s.url, title: s.title }));
    allUrls.push(...urls);
  }

  console.log(`\n🔍 ${allUrls.length}件のURLをチェック中...\n`);

  let ok = 0, warn = 0, error = 0;
  for (const item of allUrls) {
    const result = await checkUrl(item.url);
    if (result.ok) {
      console.log(`✅ ${result.status} ${item.url}`);
      ok++;
    } else if (result.status >= 300 && result.status < 400) {
      console.log(`⚠️  ${result.status} ${item.url} [${item.file}]`);
      warn++;
    } else {
      console.log(`❌ ${result.status || result.error} ${item.url} [${item.file}]`);
      error++;
    }
  }

  console.log(`\n📊 結果: ✅${ok} ⚠️${warn} ❌${error}\n`);
  if (error > 0) process.exit(1);
}

main().catch(console.error);
