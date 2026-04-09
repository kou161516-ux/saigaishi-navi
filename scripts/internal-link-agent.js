#!/usr/bin/env node
/**
 * 内部リンク戦略エージェント
 * 全49記事のrelatedSlugs・type・tags・countryを分析し、
 * 孤立記事・クラスター構造・ハブ記事・防災ブログ連携を提案する
 *
 * 使い方:
 *   node scripts/internal-link-agent.js          # レポート表示
 *   node scripts/internal-link-agent.js --fix    # 孤立記事のrelatedSlugsを自動補完
 */

'use strict';

const fs = require('fs');
const path = require('path');

// =====================================================================
// 設定
// =====================================================================

const DISASTERS_DIR = path.join(__dirname, '../src/data/disasters');
const ISOLATED_THRESHOLD = 2; // relatedSlugs がこの件数以下を孤立リスクとみなす
const MIN_RELATED_SLUGS = 3;  // --fix 時に補完する最低件数

// =====================================================================
// データ読み込み
// =====================================================================

function loadArticles() {
  const files = fs.readdirSync(DISASTERS_DIR).filter((f) => f.endsWith('.json'));
  return files.map((f) => {
    const raw = fs.readFileSync(path.join(DISASTERS_DIR, f), 'utf8');
    return JSON.parse(raw);
  });
}

// =====================================================================
// 年度抽出
// =====================================================================

function extractYear(article) {
  if (!article.date) return null;
  return parseInt(article.date.split('-')[0], 10);
}

// =====================================================================
// 類似度スコア計算（0〜10）
// =====================================================================

function calcSimilarity(a, b) {
  let score = 0;

  // 同じtype → 強く推奨
  if (a.type === b.type) score += 5;

  // 同じcountry → 中程度推奨
  if (a.country && b.country && a.country === b.country) score += 3;

  // tagsに共通語 → 推奨
  const aTags = Array.isArray(a.tags) ? a.tags : [];
  const bTags = Array.isArray(b.tags) ? b.tags : [];
  const commonTags = aTags.filter((t) => bTags.includes(t));
  score += Math.min(commonTags.length, 3);

  // 時代が近い（±20年以内） → 補足推奨
  const aYear = extractYear(a);
  const bYear = extractYear(b);
  if (aYear !== null && bYear !== null) {
    if (Math.abs(aYear - bYear) <= 20) score += 1;
  }

  return score;
}

// =====================================================================
// 孤立記事の検出
// =====================================================================

function detectIsolated(articles) {
  return articles
    .filter((a) => {
      const cnt = Array.isArray(a.relatedSlugs) ? a.relatedSlugs.length : 0;
      return cnt <= ISOLATED_THRESHOLD;
    })
    .sort((a, b) => {
      const ca = Array.isArray(a.relatedSlugs) ? a.relatedSlugs.length : 0;
      const cb = Array.isArray(b.relatedSlugs) ? b.relatedSlugs.length : 0;
      return ca - cb;
    });
}

// =====================================================================
// 推奨追加リンク（既存を除外）
// =====================================================================

function suggestLinks(target, allArticles, topN = 3) {
  const existing = new Set(Array.isArray(target.relatedSlugs) ? target.relatedSlugs : []);
  existing.add(target.slug); // 自己リンク除外

  return allArticles
    .filter((a) => !existing.has(a.slug))
    .map((a) => ({ slug: a.slug, score: calcSimilarity(target, a), title: a.title }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
}

// =====================================================================
// クラスター構造の構築
// =====================================================================

const CLUSTER_TYPES = ['earthquake', 'tsunami', 'typhoon', 'flood', 'volcano'];

// ハブ候補（代表的なslug）
const HUB_CANDIDATES = {
  earthquake: 'tohoku-earthquake-2011',
  tsunami:    'india-ocean-tsunami-2004',
  typhoon:    'isewan-typhoon-1959',
  flood:      'western-japan-flood-2018',
  volcano:    'unzen-eruption-1991',
};

function buildClusters(articles) {
  const clusters = {};
  for (const type of CLUSTER_TYPES) {
    const members = articles.filter((a) => a.type === type);
    const hub = members.find((a) => a.slug === HUB_CANDIDATES[type]) || members[0];
    const children = members.filter((a) => a.slug !== (hub ? hub.slug : null));
    clusters[type] = { hub, children };
  }
  return clusters;
}

// =====================================================================
// 被リンク数カウント（ハブ記事特定）
// =====================================================================

function countInboundLinks(articles) {
  const counts = {};
  for (const a of articles) {
    const slugs = Array.isArray(a.relatedSlugs) ? a.relatedSlugs : [];
    for (const s of slugs) {
      counts[s] = (counts[s] || 0) + 1;
    }
  }
  return counts;
}

// =====================================================================
// 防災ブログ連携推奨記事
// =====================================================================

const BLOG_PRIORITY_TYPES = ['tsunami', 'earthquake', 'flood'];

function getBlogLinkArticles(articles, topN = 10) {
  const typeScore = { tsunami: 3, earthquake: 3, flood: 2, typhoon: 1, volcano: 1 };

  return articles
    .map((a) => ({
      ...a,
      blogScore: (typeScore[a.type] || 0) + (Array.isArray(a.relatedSlugs) ? a.relatedSlugs.length * 0.1 : 0),
    }))
    .sort((a, b) => b.blogScore - a.blogScore)
    .slice(0, topN);
}

// リンクテキスト自動生成
function suggestLinkText(article) {
  const typeLabels = {
    earthquake: '地震の教訓',
    tsunami:    '津波の記録',
    typhoon:    '台風の被害',
    flood:      '洪水・水害の歴史',
    volcano:    '火山噴火の記録',
    snowstorm:  '雪害の歴史',
    landslide:  '土砂災害の事例',
    fire:       '大規模火災の記録',
    heatwave:   '熱波・猛暑の記録',
  };
  const label = typeLabels[article.type] || '災害の記録';
  return `${article.title}から学ぶ${label}`;
}

// =====================================================================
// --fix: 孤立記事のrelatedSlugsを自動補完
// =====================================================================

function fixIsolatedArticles(articles, isolated) {
  let fixedCount = 0;
  for (const article of isolated) {
    const current = Array.isArray(article.relatedSlugs) ? [...article.relatedSlugs] : [];
    const needed = MIN_RELATED_SLUGS - current.length;
    if (needed <= 0) continue;

    const suggestions = suggestLinks(article, articles, needed);
    const newSlugs = suggestions.map((s) => s.slug);

    article.relatedSlugs = [...current, ...newSlugs];

    // ファイルに書き戻す
    const filePath = path.join(DISASTERS_DIR, `${article.slug}.json`);
    fs.writeFileSync(filePath, JSON.stringify(article, null, 2) + '\n', 'utf8');
    console.log(`[FIX] ${article.slug}: +${newSlugs.length}件追加 → ${article.relatedSlugs.length}件`);
    fixedCount++;
  }
  return fixedCount;
}

// =====================================================================
// レポート出力
// =====================================================================

function printReport(articles, fixMode) {
  const now = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
  const isolated = detectIsolated(articles);
  const clusters = buildClusters(articles);
  const inbound = countInboundLinks(articles);
  const blogArticles = getBlogLinkArticles(articles);

  console.log('\n=== 内部リンク戦略レポート ===');
  console.log(`生成日時: ${now}`);
  console.log(`対象記事数: ${articles.length}件`);

  // ----------------------------------------------------------------
  // 孤立記事
  // ----------------------------------------------------------------
  console.log('\n【孤立記事（relatedSlugs 2件以下）】');
  if (isolated.length === 0) {
    console.log('  孤立記事なし');
  } else {
    isolated.forEach((a, i) => {
      const cnt = Array.isArray(a.relatedSlugs) ? a.relatedSlugs.length : 0;
      const suggestions = suggestLinks(a, articles, 3);
      console.log(`${i + 1}. ${a.title}`);
      console.log(`   slug: ${a.slug}  (現在: ${cnt}件)`);
      console.log(`   推奨追加: ${suggestions.map((s) => s.slug).join(', ')}`);
    });
  }

  // ----------------------------------------------------------------
  // --fix 実行
  // ----------------------------------------------------------------
  if (fixMode) {
    console.log('\n【--fix モード: 孤立記事のrelatedSlugsを自動補完】');
    const fixedCount = fixIsolatedArticles(articles, isolated);
    console.log(`完了: ${fixedCount}件のファイルを更新しました`);
  }

  // ----------------------------------------------------------------
  // クラスター構造
  // ----------------------------------------------------------------
  const typeLabels = {
    earthquake: '地震',
    tsunami:    '津波',
    typhoon:    '台風',
    flood:      '洪水',
    volcano:    '火山',
  };

  console.log('\n【クラスター構造】');
  for (const [type, cluster] of Object.entries(clusters)) {
    const label = typeLabels[type] || type;
    const hubSlug = cluster.hub ? cluster.hub.slug : '（なし）';
    const children = cluster.children.map((c) => c.slug);
    console.log(`\n▼ ${label}クラスター（ハブ: ${hubSlug}）`);
    if (children.length === 0) {
      console.log('  子記事: なし');
    } else {
      console.log(`  子記事[${children.length}件]: ${children.join(', ')}`);
    }
  }

  // ----------------------------------------------------------------
  // 内部リンク提案（記事別）
  // ----------------------------------------------------------------
  console.log('\n【内部リンク提案（記事別）】');
  for (const article of articles) {
    const suggestions = suggestLinks(article, articles, 3);
    if (suggestions.length > 0) {
      console.log(`\n${article.slug}:`);
      suggestions.forEach((s) => {
        console.log(`  + ${s.slug}  (スコア: ${s.score})`);
      });
    }
  }

  // ----------------------------------------------------------------
  // ハブ記事ランキング TOP10
  // ----------------------------------------------------------------
  const hubRanking = Object.entries(inbound)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  console.log('\n【ハブ記事ランキング TOP10】');
  hubRanking.forEach(([slug, cnt], i) => {
    const article = articles.find((a) => a.slug === slug);
    const title = article ? article.title : '（不明）';
    console.log(`${i + 1}. ${slug} - 被参照数: ${cnt}件  「${title}」`);
  });

  // ----------------------------------------------------------------
  // 防災ブログ連携推奨記事 TOP10
  // ----------------------------------------------------------------
  console.log('\n【防災ブログ連携推奨記事 TOP10】');
  console.log('記事タイトル | 推奨リンクテキスト | 対象カテゴリ');
  console.log('-'.repeat(80));
  blogArticles.forEach((a) => {
    const linkText = suggestLinkText(a);
    const category = typeLabels[a.type] || a.type;
    console.log(`${a.title} | ${linkText} | ${category}`);
  });

  console.log('\n---');
  console.log('[完了] 内部リンク戦略レポートを出力しました。');
  console.log('  --fix オプションで孤立記事のrelatedSlugsを自動補完できます。');
  console.log('');
}

// =====================================================================
// エントリポイント
// =====================================================================

function main() {
  const args = process.argv.slice(2);
  const fixMode = args.includes('--fix');

  const articles = loadArticles();
  printReport(articles, fixMode);
}

main();
