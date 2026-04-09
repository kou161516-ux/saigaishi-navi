#!/usr/bin/env node
/**
 * 収益最適化エージェント
 * 全49記事のtype・tags・summaryを分析し、
 * アフィリエイト商品との相性スコアを計算して収益改善提案を出力する
 *
 * 使い方:
 *   node scripts/revenue-agent.js                        # 全記事レポート
 *   node scripts/revenue-agent.js --category earthquake  # typeでフィルタ
 */

'use strict';

const fs = require('fs');
const path = require('path');

// =====================================================================
// 商品マッピングテーブル
// =====================================================================

const PRODUCT_MAP = {
  // typeベース
  earthquake: ['防災リュック', 'ポータブル電源', 'LEDライト', '保存水', '非常食', '家具固定グッズ'],
  tsunami:    ['防災リュック', '保存水', '防水バッグ', 'LEDライト'],
  typhoon:    ['ポータブル電源', 'LEDライト', '保存水', '非常食', '養生テープ'],
  flood:      ['非常用トイレ', '保存水', 'ポータブル電源', '防水バッグ', 'ウェーダー'],
  volcano:    ['防塵マスク', 'ゴーグル', 'LEDライト', '防災リュック'],
  fire:       ['消火器', '防煙マスク', 'LEDライト', '防災リュック'],
  heatwave:   ['保存水', '経口補水液', 'クーラーボックス', '日よけグッズ'],
  snowstorm:  ['防寒具', '保存水', '非常食', '除雪道具'],
  landslide:  ['防災リュック', 'LEDライト', '保存水'],
  // countryベース
  japan:  ['Amazon防災グッズまとめ', '楽天防災セット'],
  world:  ['海外旅行保険', '防災リュック'],
};

// =====================================================================
// アフィリエイトカテゴリ定義
// =====================================================================

const AFFILIATE_CATEGORY = {
  '防災リュック':     { amazon: '非常持出袋', rakuten: '防災/非常持出袋', priority: 'high' },
  'ポータブル電源':   { amazon: 'ポータブル電源', rakuten: 'ポータブル電源', priority: 'high' },
  '非常用トイレ':     { amazon: '非常用トイレ', rakuten: '簡易トイレ', priority: 'high' },
  '保存水':           { amazon: '保存水', rakuten: '防災 水', priority: 'high' },
  '非常食':           { amazon: '非常食 セット', rakuten: '非常食 防災', priority: 'high' },
  'LEDライト':        { amazon: 'ヘッドライト 防災', rakuten: 'LED懐中電灯', priority: 'medium' },
  '家具固定グッズ':   { amazon: '家具転倒防止', rakuten: '地震対策 家具', priority: 'medium' },
  '防水バッグ':       { amazon: '防水バッグ 防災', rakuten: '防水バッグ 非常用', priority: 'medium' },
  '養生テープ':       { amazon: '養生テープ 台風', rakuten: '養生テープ', priority: 'low' },
  'ウェーダー':       { amazon: 'ウェーダー 防水', rakuten: 'ウェーダー', priority: 'low' },
  '防塵マスク':       { amazon: 'N95 防塵マスク', rakuten: '防塵マスク 火山', priority: 'medium' },
  'ゴーグル':         { amazon: '防護ゴーグル', rakuten: '保護ゴーグル', priority: 'low' },
  '消火器':           { amazon: '住宅用消火器', rakuten: '消火器 家庭用', priority: 'high' },
  '防煙マスク':       { amazon: '防煙マスク 火災', rakuten: '防煙マスク', priority: 'high' },
  '経口補水液':       { amazon: '経口補水液', rakuten: '経口補水液 防災', priority: 'medium' },
  'クーラーボックス': { amazon: 'クーラーボックス 保冷', rakuten: 'クーラーボックス', priority: 'low' },
  '日よけグッズ':     { amazon: '日よけ 熱中症対策', rakuten: '日よけグッズ', priority: 'low' },
  '防寒具':           { amazon: '防寒 アウトドア', rakuten: '防寒具 雪害', priority: 'medium' },
  '除雪道具':         { amazon: '除雪スコップ', rakuten: '除雪 道具', priority: 'low' },
  'Amazon防災グッズまとめ': { amazon: '防災グッズ セット', rakuten: '防災セット', priority: 'high' },
  '楽天防災セット':   { amazon: '防災セット', rakuten: '防災 まとめ買い', priority: 'high' },
  '海外旅行保険':     { amazon: '海外旅行保険', rakuten: '海外旅行保険', priority: 'medium' },
};

// =====================================================================
// CTA文テンプレート
// =====================================================================

const CTA_TEMPLATES = {
  earthquake: '地震に備えた防災リュックとポータブル電源を今すぐチェック',
  tsunami:    '津波避難に必要な防災リュック・防水グッズを確認する',
  typhoon:    '台風シーズン前にポータブル電源・LEDライトを準備しよう',
  flood:      '水害・浸水に備えた非常用トイレ・防水バッグを今すぐ確認',
  volcano:    '火山噴火に備えた防塵マスク・防災グッズを確認する',
  fire:       '火災から命を守る消火器・防煙マスクを今すぐ準備',
  heatwave:   '熱中症対策に経口補水液・保存水を備蓄しよう',
  snowstorm:  '豪雪・大雪に備えた防寒具・非常食の備蓄を確認する',
  landslide:  '土砂災害に備えた防災リュックと避難グッズを確認',
  general:    'この災害から学んで今日から防災グッズを準備しよう',
};

// =====================================================================
// データ読み込み
// =====================================================================

const DISASTERS_DIR = path.join(__dirname, '../src/data/disasters');

function loadArticles() {
  const files = fs.readdirSync(DISASTERS_DIR).filter((f) => f.endsWith('.json'));
  return files.map((f) => {
    const raw = fs.readFileSync(path.join(DISASTERS_DIR, f), 'utf8');
    return JSON.parse(raw);
  });
}

// =====================================================================
// 収益ポテンシャルスコア計算
// =====================================================================

function calcRevenueScore(article) {
  let score = 0;

  // typeベースの商品マッチング
  const typeProducts = PRODUCT_MAP[article.type] || [];
  score += typeProducts.length * 2;

  // countryベースのボーナス
  if (article.country === 'japan') score += 3;  // 国内ユーザー向け訴求力
  else if (article.country === 'world') score += 1;

  // 高優先度商品が多いほど高評価
  const highPriorityCount = typeProducts.filter((p) => {
    const af = AFFILIATE_CATEGORY[p];
    return af && af.priority === 'high';
  }).length;
  score += highPriorityCount * 2;

  // タグに「備え」「備蓄」等があればボーナス
  const actionTags = ['備え', '備蓄', '防災', '非常用', '対策', '準備'];
  const tags = Array.isArray(article.tags) ? article.tags : [];
  const actionTagCount = tags.filter((t) =>
    actionTags.some((at) => t.includes(at))
  ).length;
  score += actionTagCount;

  // summaryの文字数（情報量が多い = AdSense収益にも有利）
  if (article.summary) {
    if (article.summary.length > 200) score += 2;
    else if (article.summary.length > 100) score += 1;
  }

  return score;
}

// =====================================================================
// 優先度判定
// =====================================================================

function getPriority(score) {
  if (score >= 15) return '高';
  if (score >= 8)  return '中';
  return '低';
}

// =====================================================================
// 推奨商品リスト（重複除去・優先度順）
// =====================================================================

function getRecommendedProducts(article) {
  const products = new Set();

  // typeベース
  const typeProducts = PRODUCT_MAP[article.type] || [];
  typeProducts.forEach((p) => products.add(p));

  // countryベース
  const countryProducts = PRODUCT_MAP[article.country] || [];
  countryProducts.forEach((p) => products.add(p));

  // 優先度でソート
  return [...products].sort((a, b) => {
    const pa = (AFFILIATE_CATEGORY[a] || {}).priority || 'low';
    const pb = (AFFILIATE_CATEGORY[b] || {}).priority || 'low';
    const order = { high: 0, medium: 1, low: 2 };
    return (order[pa] || 2) - (order[pb] || 2);
  });
}

// =====================================================================
// CTA文生成
// =====================================================================

function generateCTA(article) {
  return CTA_TEMPLATES[article.type] || CTA_TEMPLATES.general;
}

// =====================================================================
// 改善ポイント生成
// =====================================================================

function generateImprovementNote(article) {
  const products = getRecommendedProducts(article);
  const highPriority = products.filter((p) => {
    const af = AFFILIATE_CATEGORY[p];
    return af && af.priority === 'high';
  });

  const notes = [];

  if (!article.affiliateCategory || article.affiliateCategory === 'general') {
    notes.push('affiliateCategoryをtypeに合わせて更新すると訴求精度が上がる');
  }

  if (highPriority.length >= 3) {
    notes.push(`「${highPriority.slice(0, 2).join('」「')}」は高CVR商品のため記事本文中に早めに配置推奨`);
  }

  const summaryLen = article.summary ? article.summary.length : 0;
  if (summaryLen < 100) {
    notes.push('summary文字数が少ない（AdSense的にも本文充実化を検討）');
  }

  if (notes.length === 0) {
    notes.push('商品マッチング良好。CTA文の定期的な見直しと季節性を加味した訴求を推奨');
  }

  return notes.join(' / ');
}

// =====================================================================
// AdSense最適記事（長文・情報型上位）
// =====================================================================

function getAdSenseTopArticles(articles, topN = 5) {
  return articles
    .filter((a) => a.summary && a.summary.length > 150)
    .sort((a, b) => (b.summary || '').length - (a.summary || '').length)
    .slice(0, topN);
}

// =====================================================================
// レポート出力
// =====================================================================

function printReport(articles, categoryFilter) {
  const now = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });

  // カテゴリフィルタ
  const filtered = categoryFilter
    ? articles.filter((a) => a.type === categoryFilter)
    : articles;

  if (filtered.length === 0) {
    console.log(`[警告] type="${categoryFilter}" の記事が見つかりませんでした。`);
    process.exit(1);
  }

  // スコア計算・ソート
  const scored = filtered
    .map((a) => ({ ...a, revenueScore: calcRevenueScore(a) }))
    .sort((a, b) => b.revenueScore - a.revenueScore);

  const priorityCounts = { 高: 0, 中: 0, 低: 0 };
  for (const a of scored) {
    priorityCounts[getPriority(a.revenueScore)]++;
  }

  console.log('\n=== 収益最適化レポート ===');
  console.log(`生成日時: ${now}`);
  if (categoryFilter) console.log(`フィルタ: type=${categoryFilter}`);
  console.log(`対象記事数: ${filtered.length}件`);

  // ----------------------------------------------------------------
  // 高収益ポテンシャル記事 TOP10
  // ----------------------------------------------------------------
  console.log('\n【高収益ポテンシャル記事 TOP10】');
  scored.slice(0, 10).forEach((a, i) => {
    const products = getRecommendedProducts(a);
    const cta = generateCTA(a);
    const priority = getPriority(a.revenueScore);
    console.log(`\n${i + 1}. ${a.title} (${a.slug})`);
    console.log(`   収益スコア: ${a.revenueScore}  優先度: ${priority}`);
    console.log(`   推奨商品: ${products.slice(0, 4).join(', ')}`);
    console.log(`   推奨CTA: 「${cta}」`);
    console.log(`   配置: 本文中（第2〜3段落後）・記事末`);
  });

  // ----------------------------------------------------------------
  // 記事別収益改善提案
  // ----------------------------------------------------------------
  console.log('\n【記事別収益改善提案】');
  for (const a of scored) {
    const products = getRecommendedProducts(a);
    const cta = generateCTA(a);
    const note = generateImprovementNote(a);
    console.log(`\n${a.slug}:`);
    console.log(`  現在のaffiliateCategory: ${a.affiliateCategory || '未設定'}`);
    console.log(`  推奨商品: ${products.join(', ')}`);
    console.log(`  CTA案: ${cta}`);
    console.log(`  改善ポイント: ${note}`);
  }

  // ----------------------------------------------------------------
  // 全体収益改善サマリー
  // ----------------------------------------------------------------
  const adSenseTop = getAdSenseTopArticles(articles, 5);

  console.log('\n【全体収益改善サマリー】');
  console.log(`- 高優先度: ${priorityCounts['高']}件`);
  console.log(`- 中優先度: ${priorityCounts['中']}件`);
  console.log(`- 低優先度: ${priorityCounts['低']}件`);
  console.log(`\nAdSense最適記事（長文・情報型上位）:`);
  adSenseTop.forEach((a, i) => {
    console.log(`  ${i + 1}. ${a.title}  (${a.summary ? a.summary.length : 0}文字)`);
  });

  console.log('\n---');
  console.log('[完了] 収益最適化レポートを出力しました。');
  console.log('  --category [type] でフィルタリングできます（例: --category earthquake）');
  console.log('');
}

// =====================================================================
// エントリポイント
// =====================================================================

function main() {
  const args = process.argv.slice(2);

  const catIndex = args.indexOf('--category');
  const categoryFilter = catIndex !== -1 ? args[catIndex + 1] : null;

  const articles = loadArticles();
  printReport(articles, categoryFilter);
}

main();
