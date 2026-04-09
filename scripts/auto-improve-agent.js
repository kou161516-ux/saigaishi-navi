#!/usr/bin/env node
/**
 * 自動改善エージェント
 * src/data/disasters/ の全記事を分析してスコアリングし、改善提案を出力する
 *
 * 使い方:
 *   node scripts/auto-improve-agent.js           # レポートのみ
 *   node scripts/auto-improve-agent.js --fix     # 自動修正も実行
 */

'use strict';

const fs = require('fs');
const path = require('path');

// =====================================================================
// 設定
// =====================================================================

const DISASTERS_DIR = path.join(__dirname, '..', 'src', 'data', 'disasters');
const NOW = new Date();
const FIX_MODE = process.argv.includes('--fix');

// =====================================================================
// スコア算出ロジック
// =====================================================================

/**
 * 1記事のスコアを算出し、問題点リストを返す
 * @param {object} article
 * @returns {{ score: number, issues: string[], fixes: object }}
 */
function scoreArticle(article) {
  let score = 100;
  const issues = [];
  const fixes = {}; // --fix で自動修正できる内容

  // relatedSlugs 件数
  const relatedCount = Array.isArray(article.relatedSlugs) ? article.relatedSlugs.length : 0;
  if (relatedCount < 3) {
    score -= 10;
    issues.push(`relatedSlugs が ${relatedCount} 件（3件未満 -10点）`);
    fixes.relatedSlugs = true;
  }

  // lessons 件数
  const lessonsCount = Array.isArray(article.lessons) ? article.lessons.length : 0;
  if (lessonsCount < 3) {
    score -= 10;
    issues.push(`lessons が ${lessonsCount} 件（3件未満 -10点）`);
  }

  // preparedness 件数
  const prepCount = Array.isArray(article.preparedness) ? article.preparedness.length : 0;
  if (prepCount < 3) {
    score -= 10;
    issues.push(`preparedness が ${prepCount} 件（3件未満 -10点）`);
  }

  // summary 文字数
  const summaryLen = typeof article.summary === 'string' ? article.summary.length : 0;
  if (summaryLen < 100) {
    score -= 20;
    issues.push(`summary が ${summaryLen} 文字（100文字未満 -20点）`);
  }

  // metaDescription 文字数（50〜160文字で+10点、範囲外で-10点）
  const metaLen = typeof article.metaDescription === 'string' ? article.metaDescription.length : 0;
  if (metaLen >= 50 && metaLen <= 160) {
    score += 10;
  } else {
    score -= 10;
    if (metaLen === 0) {
      issues.push('metaDescription が未設定（50〜160文字必要 -10点）');
    } else if (metaLen < 50) {
      issues.push(`metaDescription が ${metaLen} 文字（短すぎる、50文字未満 -10点）`);
    } else {
      issues.push(`metaDescription が ${metaLen} 文字（長すぎる、160文字超 -10点）`);
    }
  }

  // sources 件数
  const sourcesCount = Array.isArray(article.sources) ? article.sources.length : 0;
  if (sourcesCount < 2) {
    score -= 15;
    issues.push(`sources が ${sourcesCount} 件（2件未満 -15点）`);
  }

  // tags 件数
  const tagsCount = Array.isArray(article.tags) ? article.tags.length : 0;
  if (tagsCount < 3) {
    score -= 10;
    issues.push(`tags が ${tagsCount} 件（3件未満 -10点）`);
    fixes.tags = true;
  }

  // updatedAt（90日以内で+10点）
  if (typeof article.updatedAt === 'string') {
    const updatedDate = new Date(article.updatedAt);
    const diffDays = (NOW - updatedDate) / (1000 * 60 * 60 * 24);
    if (diffDays <= 90) {
      score += 10;
    } else {
      issues.push(`updatedAt が ${Math.floor(diffDays)} 日前（90日超、更新推奨）`);
    }
  } else {
    issues.push('updatedAt が未設定');
  }

  // スコアは0〜100にクランプ
  score = Math.max(0, Math.min(100, score));

  return { score, issues, fixes };
}

// =====================================================================
// 改善提案生成
// =====================================================================

/**
 * 問題点から具体的な改善提案を生成する
 */
function generateSuggestions(article, issues) {
  const suggestions = [];

  for (const issue of issues) {
    if (issue.includes('relatedSlugs')) {
      suggestions.push('同じ type の記事スラッグを relatedSlugs に追加（--fix で自動実行可能）');
    }
    if (issue.includes('lessons')) {
      suggestions.push('lessons を3件以上に増やす（例：「早期警戒システムの重要性」「自助・共助の必要性」「建築基準の強化」）');
    }
    if (issue.includes('preparedness')) {
      suggestions.push('preparedness を3件以上に増やす（例：「ハザードマップで自宅のリスク確認」「非常持ち出し袋の準備」「家族での避難計画策定」）');
    }
    if (issue.includes('summary') && issue.includes('未満')) {
      suggestions.push('summary を100文字以上に拡充（発生状況・被害規模・教訓の3点を盛り込む）');
    }
    if (issue.includes('metaDescription')) {
      if (issue.includes('未設定')) {
        suggestions.push('metaDescription を50〜160文字で新規作成（タイトル・主要数値・教訓を含める）');
      } else if (issue.includes('短すぎ')) {
        suggestions.push('metaDescription を50文字以上に拡充（検索結果での訴求力向上）');
      } else if (issue.includes('長すぎ')) {
        suggestions.push('metaDescription を160文字以内に短縮（検索結果での表示切れ防止）');
      }
    }
    if (issue.includes('sources')) {
      suggestions.push('sources を2件以上に増やす（内閣府・気象庁・消防庁など公的機関ページを推奨）');
    }
    if (issue.includes('tags') && issue.includes('件')) {
      suggestions.push('tags を3件以上に増やす（--fix で type・region から自動生成可能）');
    }
    if (issue.includes('updatedAt') && issue.includes('日前')) {
      suggestions.push('updatedAt を現在日付に更新し、最新データ・リンク切れを点検する');
    }
    if (issue.includes('updatedAt が未設定')) {
      suggestions.push('updatedAt フィールドを追加する（ISO 8601形式: YYYY-MM-DD）');
    }
  }

  return [...new Set(suggestions)]; // 重複除去
}

// =====================================================================
// --fix: 自動修正ロジック
// =====================================================================

/**
 * 全スラッグをタイプ別にインデックス化する
 */
function buildTypeIndex(articles) {
  const index = {}; // type -> slug[]
  for (const { article } of articles) {
    const type = article.type || 'unknown';
    if (!index[type]) index[type] = [];
    index[type].push(article.slug);
  }
  return index;
}

/**
 * タイプ別タグ自動生成
 */
const TYPE_TAG_MAP = {
  earthquake: ['地震', '揺れ', '建物被害'],
  tsunami: ['津波', '海岸', '避難'],
  flood: ['洪水', '河川', '浸水'],
  typhoon: ['台風', '強風', '暴雨'],
  landslide: ['土砂災害', '崩落', '急傾斜地'],
  volcano: ['火山', '噴火', '噴煙'],
  nuclear: ['原子力', '放射線', '避難'],
  heatwave: ['熱中症', '猛暑', '高温'],
  blizzard: ['大雪', '吹雪', '低温'],
  cyclone: ['サイクロン', '熱帯低気圧', '暴風'],
};

/**
 * 1記事を自動修正する（relatedSlugs, tags）
 */
function applyFix(article, fixes, typeIndex) {
  let modified = false;
  const updated = { ...article };

  // relatedSlugs の自動追加
  if (fixes.relatedSlugs) {
    const type = article.type || 'unknown';
    const sameTypeSlugs = (typeIndex[type] || []).filter(
      (s) => s !== article.slug && !(updated.relatedSlugs || []).includes(s)
    );
    const current = Array.isArray(updated.relatedSlugs) ? updated.relatedSlugs : [];
    const toAdd = sameTypeSlugs.slice(0, 3 - current.length);
    if (toAdd.length > 0) {
      updated.relatedSlugs = [...current, ...toAdd];
      modified = true;
    }
  }

  // tags の自動生成
  if (fixes.tags) {
    const type = article.type || 'unknown';
    const typeTags = TYPE_TAG_MAP[type] || [];
    const regionTag = typeof article.region === 'string' ? article.region.split('・')[0] : null;
    const current = Array.isArray(updated.tags) ? updated.tags : [];
    const candidates = regionTag ? [...typeTags, regionTag] : typeTags;
    const toAdd = candidates.filter((t) => !current.includes(t)).slice(0, 3 - current.length);
    if (toAdd.length > 0) {
      updated.tags = [...current, ...toAdd];
      modified = true;
    }
  }

  return { updated, modified };
}

// =====================================================================
// メイン処理
// =====================================================================

function main() {
  // 1. 全記事を読み込む
  const files = fs.readdirSync(DISASTERS_DIR).filter((f) => f.endsWith('.json'));
  const articles = [];

  for (const file of files) {
    const filePath = path.join(DISASTERS_DIR, file);
    try {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const article = JSON.parse(raw);
      const { score, issues, fixes } = scoreArticle(article);
      const suggestions = generateSuggestions(article, issues);
      articles.push({ file, filePath, article, score, issues, suggestions, fixes });
    } catch (err) {
      console.error(`[ERROR] ${file} の読み込みに失敗: ${err.message}`);
    }
  }

  // 2. スコア昇順にソート
  articles.sort((a, b) => a.score - b.score);

  // 3. --fix モードの処理
  let fixedCount = 0;
  if (FIX_MODE) {
    const typeIndex = buildTypeIndex(articles);
    for (const item of articles) {
      if (Object.keys(item.fixes).length === 0) continue;
      const { updated, modified } = applyFix(item.article, item.fixes, typeIndex);
      if (modified) {
        fs.writeFileSync(item.filePath, JSON.stringify(updated, null, 2) + '\n', 'utf-8');
        fixedCount++;
        // スコアを再計算
        const { score: newScore, issues: newIssues } = scoreArticle(updated);
        item.article = updated;
        item.score = newScore;
        item.issues = newIssues;
        item.suggestions = generateSuggestions(updated, newIssues);
      }
    }
    // 修正後に再ソート
    articles.sort((a, b) => a.score - b.score);
  }

  // =====================================================================
  // 出力
  // =====================================================================

  const now = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });

  console.log('\n=== 自動改善レポート ===');
  console.log(`生成日時: ${now}`);
  if (FIX_MODE) {
    console.log(`[--fix モード] ${fixedCount} 件のファイルを自動修正しました`);
  }

  // TOP10 要改善記事
  console.log('\n【要改善記事 TOP10】');
  const top10 = articles.slice(0, 10);
  top10.forEach((item, idx) => {
    const title = item.article.title || item.article.slug || item.file;
    console.log(`${idx + 1}. ${title} (スコア: ${item.score}/100)`);
    if (item.issues.length > 0) {
      console.log(`   問題: ${item.issues.join(' / ')}`);
    } else {
      console.log('   問題: なし（優良記事）');
    }
    if (item.suggestions.length > 0) {
      console.log('   改善提案:');
      item.suggestions.forEach((s) => console.log(`   - ${s}`));
    }
  });

  // 全記事スコア一覧
  console.log('\n【全記事スコア一覧】');
  console.log('slug | スコア | 問題点サマリー');
  console.log('--- | --- | ---');
  for (const item of articles) {
    const slug = item.article.slug || path.basename(item.file, '.json');
    const issueSummary = item.issues.length > 0 ? item.issues[0] : '問題なし';
    console.log(`${slug} | ${item.score}/100 | ${issueSummary}`);
  }

  // 統計サマリー
  const avg = Math.round(articles.reduce((s, a) => s + a.score, 0) / articles.length);
  const perfect = articles.filter((a) => a.score >= 100).length;
  const needsWork = articles.filter((a) => a.score < 70).length;

  console.log('\n【統計サマリー】');
  console.log(`総記事数: ${articles.length}`);
  console.log(`平均スコア: ${avg}/100`);
  console.log(`満点記事（100点）: ${perfect} 件`);
  console.log(`要改善記事（70点未満）: ${needsWork} 件`);
  if (!FIX_MODE && needsWork > 0) {
    console.log('\n自動修正を実行するには: npm run auto-improve:fix');
  }
  console.log('');
}

main();
