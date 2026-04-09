#!/usr/bin/env node
/**
 * データベース拡張エージェント
 * src/data/disasters/ の全49記事を読み込み、カバレッジ分析・拡張提案を出力する
 *
 * 使い方:
 *   node scripts/db-expansion-agent.js
 *   node scripts/db-expansion-agent.js --save   # logs/にレポートを保存
 */

'use strict';

const fs = require('fs');
const path = require('path');

// =====================================================================
// 設定
// =====================================================================

const DISASTERS_DIR = path.join(__dirname, '..', 'src', 'data', 'disasters');
const LOGS_DIR = path.join(__dirname, '..', 'logs');
const SAVE_MODE = process.argv.includes('--save');

// =====================================================================
// 不足領域チェックリスト
// =====================================================================

const MISSING_CHECK = {
  // 日本の主要災害（未収録候補）
  japan_missing: [
    { name: '十勝沖地震（1952年）', slug: 'tokachi-oki-earthquake-1952', priority: 'medium', revenue: 'medium' },
    { name: '福岡県西方沖地震（2005年）', slug: 'fukuoka-earthquake-2005', priority: 'medium', revenue: 'medium' },
    { name: '岩手宮城内陸地震（2008年）', slug: 'iwate-miyagi-earthquake-2008', priority: 'medium', revenue: 'medium' },
    { name: '平成16年新潟・福島豪雨', slug: 'niigata-fukushima-flood-2004', priority: 'low', revenue: 'low' },
    { name: '昭和南海地震（1946年）単独記事', slug: 'showa-nankai-earthquake-1946', priority: 'high', revenue: 'high' },
    { name: '昭和東南海地震（1944年）単独記事', slug: 'showa-tonankai-earthquake-1944', priority: 'high', revenue: 'high' },
    { name: '雲仙岳の歴史（1792年島原大変）', slug: 'shimabara-disaster-1792', priority: 'medium', revenue: 'medium' },
    { name: '三陸地震津波（1933年）', slug: 'sanriku-tsunami-1933', priority: 'high', revenue: 'high' },
    { name: '関東大震災の教訓詳細記事', slug: 'kanto-earthquake-1923-lessons', priority: 'high', revenue: 'high' },
    { name: '東京大空襲との比較（都市防災視点）', slug: 'tokyo-raid-urban-disaster-1945', priority: 'low', revenue: 'low' },
  ],
  // 世界の主要災害（未収録候補）
  world_missing: [
    { name: '1970年ペルー地震（死者66,000人）', slug: 'peru-earthquake-1970', priority: 'high', revenue: 'medium' },
    { name: '1999年台湾集集地震（死者2,415人）', slug: 'taiwan-earthquake-1999', priority: 'high', revenue: 'high' },
    { name: '2003年バム地震イラン（死者26,200人）', slug: 'bam-earthquake-2003', priority: 'medium', revenue: 'medium' },
    { name: '2005年カシミール地震（死者73,000人）', slug: 'kashmir-earthquake-2005', priority: 'high', revenue: 'medium' },
    { name: '2010年チリ地震M8.8', slug: 'chile-earthquake-2010', priority: 'high', revenue: 'high' },
    { name: '2011年ニュージーランドクライストチャーチ地震', slug: 'christchurch-earthquake-2011', priority: 'high', revenue: 'high' },
    { name: '2016年エクアドル地震', slug: 'ecuador-earthquake-2016', priority: 'low', revenue: 'low' },
    { name: '2021年ハイチ地震（死者2,200人）', slug: 'haiti-earthquake-2021', priority: 'medium', revenue: 'medium' },
    { name: '2023年アフガニスタン地震（死者1,000人）', slug: 'afghanistan-earthquake-2023', priority: 'medium', revenue: 'low' },
    { name: '1900年ガルベストン台風（米国最大被害）', slug: 'galveston-hurricane-1900', priority: 'medium', revenue: 'medium' },
    { name: '1931年中国洪水（死者85万〜400万人）', slug: 'china-flood-1931', priority: 'high', revenue: 'medium' },
    { name: '2020年ベイルート爆発', slug: 'beirut-explosion-2020', priority: 'medium', revenue: 'medium' },
  ],
  // テーマ別不足
  theme_missing: [
    { name: '在宅避難の具体的方法', slug: 'shelter-in-place-guide', priority: 'high', revenue: 'high' },
    { name: '車中泊避難の注意点', slug: 'car-evacuation-guide', priority: 'high', revenue: 'high' },
    { name: '子どもとの避難', slug: 'evacuation-with-children', priority: 'high', revenue: 'high' },
    { name: '高齢者・障害者の避難', slug: 'evacuation-elderly-disabled', priority: 'high', revenue: 'high' },
    { name: '津波てんでんこの教訓', slug: 'tsunami-tendenko-lesson', priority: 'high', revenue: 'high' },
    { name: '原子力災害の備え', slug: 'nuclear-disaster-preparedness', priority: 'medium', revenue: 'medium' },
    { name: '山火事（野火）への備え', slug: 'wildfire-preparedness', priority: 'medium', revenue: 'medium' },
  ]
};

// =====================================================================
// 多言語展開優先度
// =====================================================================

const MULTILANG_PRIORITY = {
  high: [
    { slug: 'india-ocean-tsunami-2004', reason: '世界共通テーマ、14カ国被害、英語圏検索需要大' },
    { slug: 'chile-earthquake-tsunami-1960', reason: '世界最大地震M9.5、チリ・ラテアメリカ市場' },
    { slug: 'tohoku-earthquake-2011', reason: '東日本大震災、世界的知名度、英語需要最大級' },
    { slug: 'turkey-syria-earthquake-2023', reason: '直近の大規模被害、国際的関心高い' },
    { slug: 'sichuan-earthquake-2008', reason: '中国語圏市場、四川省・中国ユーザー向け' },
  ],
  medium: [
    { slug: 'noto-earthquake-2024', reason: 'アジア共通テーマ、半島孤立教訓' },
    { slug: 'sichuan-earthquake-2008', reason: 'アジア共通・中国語化優先' },
    { slug: 'nepal-earthquake-2015', reason: 'アジア共通・英語・ネパール語需要' },
    { slug: 'haiti-earthquake-2010', reason: '英語・フランス語・スペイン語需要' },
    { slug: 'morocco-earthquake-2023', reason: 'アラビア語・フランス語市場' },
  ],
  low: [
    { slug: 'isewan-typhoon-1959', reason: '日本ローカル' },
    { slug: 'kinugawa-flood-2015', reason: '日本ローカル' },
    { slug: 'atami-landslide-2021', reason: '日本ローカル' },
    { slug: 'nagasaki-flood-1982', reason: '日本ローカル' },
    { slug: 'northern-kyushu-flood-2017', reason: '日本ローカル' },
  ]
};

// =====================================================================
// DB項目拡張提案
// =====================================================================

const DB_FIELD_PROPOSALS = [
  { field: 'region_detail', desc: '詳細地域（市区町村レベル）', priority: 'high', example: '輪島市・珠洲市・穴水町' },
  { field: 'affected_population', desc: '被災人口（被害を受けた総人口）', priority: 'high', example: '500000' },
  { field: 'reconstruction_years', desc: '復興完了年数（概算）', priority: 'medium', example: '5' },
  { field: 'lesson_categories', desc: '教訓のカテゴリ分類（配列）', priority: 'high', example: '["避難", "耐震化", "情報伝達"]' },
  { field: 'preparedness_level', desc: '備え実践の難易度', priority: 'medium', example: 'easy/medium/hard' },
  { field: 'related_disasters', desc: '類似パターンの他の災害スラッグ', priority: 'medium', example: '["noto-earthquake-2024"]' },
  { field: 'language_versions', desc: '翻訳済み言語コード（配列）', priority: 'high', example: '["en", "zh-TW"]' },
  { field: 'media_coverage', desc: 'メディア報道規模', priority: 'low', example: 'global/national/regional/local' },
];

// =====================================================================
// 採用サイト向け拡張提案
// =====================================================================

const CAREER_SITE_PROPOSALS = {
  fire_department: [
    '消防士の現場活動事例（災害対応レポート）',
    '消防採用試験の出題傾向ページ（過去の大規模災害）',
    '消防団員向け地域防災ページ',
    '女性消防士の活躍事例（多様性訴求）',
    '消防学校の訓練内容解説',
  ],
  police: [
    '警察の災害時活動事例（治安維持・行方不明者捜索）',
    '警察採用と防災の関連解説ページ',
    '災害時の交通規制・避難誘導事例',
    '警察犬・特殊部隊の救助活動事例',
  ],
};

// =====================================================================
// メイン処理
// =====================================================================

function loadArticles() {
  const files = fs.readdirSync(DISASTERS_DIR).filter(f => f.endsWith('.json'));
  return files.map(f => {
    try {
      return JSON.parse(fs.readFileSync(path.join(DISASTERS_DIR, f), 'utf8'));
    } catch (e) {
      console.error(`読み込みエラー: ${f}`, e.message);
      return null;
    }
  }).filter(Boolean);
}

function analyzeCountry(articles) {
  const counts = {};
  articles.forEach(a => {
    const c = a.country || 'unknown';
    counts[c] = (counts[c] || 0) + 1;
  });
  return counts;
}

function analyzeType(articles) {
  const counts = {};
  articles.forEach(a => {
    const t = a.type || 'unknown';
    counts[t] = (counts[t] || 0) + 1;
  });
  return counts;
}

function analyzeDecade(articles) {
  const bands = {
    '〜1960年': 0,
    '1960-1990年': 0,
    '1990-2000年': 0,
    '2000年代': 0,
    '2010年代': 0,
    '2020年代': 0,
  };
  articles.forEach(a => {
    const year = parseInt((a.date || '0000').substring(0, 4), 10);
    if (year <= 1960) bands['〜1960年']++;
    else if (year <= 1990) bands['1960-1990年']++;
    else if (year <= 2000) bands['1990-2000年']++;
    else if (year <= 2009) bands['2000年代']++;
    else if (year <= 2019) bands['2010年代']++;
    else bands['2020年代']++;
  });
  return bands;
}

function analyzeDeaths(articles) {
  const bands = {
    '1万人以上': 0,
    '1000〜9999人': 0,
    '100〜999人': 0,
    '100人未満': 0,
    '不明': 0,
  };
  articles.forEach(a => {
    const d = a.deaths;
    if (d === null || d === undefined || d === '') {
      bands['不明']++;
    } else if (d >= 10000) {
      bands['1万人以上']++;
    } else if (d >= 1000) {
      bands['1000〜9999人']++;
    } else if (d >= 100) {
      bands['100〜999人']++;
    } else {
      bands['100人未満']++;
    }
  });
  return bands;
}

function checkExistingSlugs(articles) {
  return new Set(articles.map(a => a.slug));
}

function buildTop15Candidates(existingSlugs) {
  const candidates = [];

  // 優先度HIGH候補をまず追加
  const allMissing = [
    ...MISSING_CHECK.japan_missing,
    ...MISSING_CHECK.world_missing,
    ...MISSING_CHECK.theme_missing,
  ];

  allMissing.forEach(item => {
    if (!existingSlugs.has(item.slug)) {
      candidates.push(item);
    }
  });

  // 優先度でソート: high > medium > low
  const order = { high: 0, medium: 1, low: 2 };
  candidates.sort((a, b) => {
    const pa = order[a.priority] ?? 3;
    const pb = order[b.priority] ?? 3;
    if (pa !== pb) return pa - pb;
    const ra = order[a.revenue] ?? 3;
    const rb = order[b.revenue] ?? 3;
    return ra - rb;
  });

  return candidates.slice(0, 15);
}

function formatMonthlySchedule(top15) {
  const schedule = {};
  top15.forEach((item, idx) => {
    const month = Math.floor(idx / 3) + 1;
    if (!schedule[month]) schedule[month] = [];
    schedule[month].push(item);
  });
  return schedule;
}

function generateReport(articles) {
  const now = new Date();
  const dateStr = now.toISOString().replace('T', ' ').substring(0, 19);

  const countryCounts = analyzeCountry(articles);
  const typeCounts = analyzeType(articles);
  const decadeCounts = analyzeDecade(articles);
  const deathCounts = analyzeDeaths(articles);
  const existingSlugs = checkExistingSlugs(articles);
  const top15 = buildTop15Candidates(existingSlugs);
  const monthlySchedule = formatMonthlySchedule(top15);

  const lines = [];

  lines.push('=== データベース拡張レポート ===');
  lines.push(`生成日時: ${dateStr}`);
  lines.push(`対象記事数: ${articles.length}件`);
  lines.push('');

  // ===========================
  // 現在のカバレッジ分析
  // ===========================
  lines.push('【現在のカバレッジ分析】');
  lines.push('');

  lines.push('■ 国別');
  Object.entries(countryCounts).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => {
    lines.push(`  ${k}: ${v}件`);
  });
  lines.push('');

  lines.push('■ 災害種別');
  const typeOrder = ['earthquake', 'tsunami', 'typhoon', 'flood', 'volcano', 'fire', 'heatwave', 'snowstorm', 'landslide', 'nuclear', 'cyclone'];
  const sortedTypes = Object.entries(typeCounts).sort((a, b) => {
    const ia = typeOrder.indexOf(a[0]);
    const ib = typeOrder.indexOf(b[0]);
    if (ia === -1 && ib === -1) return b[1] - a[1];
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
  sortedTypes.forEach(([k, v]) => {
    lines.push(`  ${k}: ${v}件`);
  });
  lines.push('');

  lines.push('■ 年代別');
  Object.entries(decadeCounts).forEach(([k, v]) => {
    lines.push(`  ${k}: ${v}件`);
  });
  lines.push('');

  lines.push('■ 死者規模別');
  Object.entries(deathCounts).forEach(([k, v]) => {
    lines.push(`  ${k}: ${v}件`);
  });
  lines.push('');

  // ===========================
  // 全記事一覧
  // ===========================
  lines.push('■ 全記事一覧（slug / タイトル / 国 / 種別 / 年 / 死者数）');
  articles
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''))
    .forEach(a => {
      const year = (a.date || '????').substring(0, 4);
      const deaths = a.deaths !== undefined ? String(a.deaths) + '人' : '不明';
      lines.push(`  ${a.slug} | ${a.title} | ${a.country} | ${a.type} | ${year} | ${deaths}`);
    });
  lines.push('');

  // ===========================
  // 優先追加記事候補 TOP15
  // ===========================
  lines.push('【優先追加記事候補 TOP15】');
  lines.push('');
  top15.forEach((item, idx) => {
    const category = MISSING_CHECK.japan_missing.find(m => m.slug === item.slug)
      ? '日本'
      : MISSING_CHECK.world_missing.find(m => m.slug === item.slug)
        ? '世界'
        : 'テーマ';
    lines.push(`${idx + 1}. ${item.name}`);
    lines.push(`   スラッグ候補: ${item.slug}`);
    lines.push(`   カテゴリ: ${category} | 優先度: ${item.priority} | 収益性: ${item.revenue}`);
    const reasons = {
      '昭和南海地震（1946年）単独記事': '南海トラフ対策の検索需要が高く、過去の被害事例として教育的価値大',
      '昭和東南海地震（1944年）単独記事': '東南海地震の歴史的事例、南海トラフ関連の内部リンク強化に有効',
      '三陸地震津波（1933年）': '東日本大震災との比較コンテンツとして需要あり、津波教育の観点でも重要',
      '関東大震災の教訓詳細記事': '既存kanto-earthquake-1923の補完、首都直下型地震への関心が高い',
      '1931年中国洪水（死者85万〜400万人）': '史上最大規模の水害、世界規模の教訓として英語需要も高い',
      '2005年カシミール地震（死者73,000人）': 'M7.6・7万3千人の大被害、南アジア地震帯の代表事例',
      '1970年ペルー地震（死者66,000人）': '南米最大級地震の一つ、スペイン語圏の多言語展開に有効',
      '2010年チリ地震M8.8': 'M8.8の超巨大地震、津波警報システム改善の契機として教育的価値大',
      '2011年ニュージーランドクライストチャーチ地震': '先進国での都市型被害、耐震化・BCPの観点で収益性高い',
      '1999年台湾集集地震（死者2,415人）': '台湾語・中国語市場向け需要大、日本との比較教育にも有効',
      '在宅避難の具体的方法': 'コロナ以降の検索需要増大、アフィリエイト収益性最高クラス',
      '車中泊避難の注意点': '車中泊グッズへのアフィリエイト導線、エコノミー症候群予防等需要高い',
      '子どもとの避難': '子育て世代の防災意識向上、育児グッズ系アフィ導線',
      '高齢者・障害者の避難': '社会的弱者支援の観点、自治体・消防との親和性高い',
      '津波てんでんこの教訓': '東日本大震災の教訓コンテンツ、学校教育との連携需要あり',
    };
    const reason = reasons[item.name] || '防災知識の空白領域を補完する重要コンテンツ';
    const sources = {
      '昭和南海地震（1946年）単独記事': 'https://www.bousai.go.jp/ / 内閣府中央防災会議報告書',
      '昭和東南海地震（1944年）単独記事': 'https://www.bousai.go.jp/ / 内閣府中央防災会議報告書',
      '三陸地震津波（1933年）': 'https://www.jma.go.jp/ / 気象庁地震・津波履歴',
      '関東大震災の教訓詳細記事': 'https://www.bousai.go.jp/kyoiku/kirokushu/kantodaishinsai/ / 内閣府',
      '1931年中国洪水（死者85万〜400万人）': 'Wikipedia: 1931 China floods / NOAA NCEI',
      '2005年カシミール地震（死者73,000人）': 'USGS Earthquake Hazards / Wikipedia: 2005 Kashmir earthquake',
      '1970年ペルー地震（死者66,000人）': 'USGS / Wikipedia: 1970 Ancash earthquake',
      '2010年チリ地震M8.8': 'USGS / CSN Chile / Wikipedia: 2010 Chile earthquake',
      '2011年ニュージーランドクライストチャーチ地震': 'GNS Science NZ / Wikipedia: 2011 Christchurch earthquake',
      '1999年台湾集集地震（死者2,415人）': '中央気象局（台湾）/ Wikipedia: 1999 Jiji earthquake',
      '在宅避難の具体的方法': '内閣府「在宅避難のすすめ」/ 各自治体避難マニュアル',
      '車中泊避難の注意点': '厚生労働省 エコノミークラス症候群予防指針 / 内閣府',
      '子どもとの避難': '内閣府「子ども・子育て支援」防災ページ / こども家庭庁',
      '高齢者・障害者の避難': '内閣府「避難行動要支援者避難行動支援に関する取組指針」',
      '津波てんでんこの教訓': '岩手県防災教育資料 / 田老町津波伝承記録',
    };
    const source = sources[item.name] || '内閣府防災情報 / USGS / Wikipedia';
    lines.push(`   理由: ${reason}`);
    lines.push(`   推奨ソース: ${source}`);
    lines.push('');
  });

  // ===========================
  // DB項目拡張提案
  // ===========================
  lines.push('【DB項目拡張提案】');
  lines.push('');
  DB_FIELD_PROPOSALS.forEach(p => {
    lines.push(`  追加フィールド: ${p.field} - ${p.desc} - 優先度: ${p.priority}`);
    lines.push(`    例: "${p.field}": "${p.example}"`);
  });
  lines.push('');

  // ===========================
  // 多言語展開ロードマップ
  // ===========================
  lines.push('【多言語展開ロードマップ】');
  lines.push('');

  lines.push('  ■ 英語化優先 TOP5');
  MULTILANG_PRIORITY.high.slice(0, 5).forEach((item, idx) => {
    const article = articles.find(a => a.slug === item.slug);
    const title = article ? article.title : item.slug;
    lines.push(`    ${idx + 1}. ${title} (${item.slug})`);
    lines.push(`       理由: ${item.reason}`);
  });
  lines.push('');

  lines.push('  ■ 台湾・中国語化優先 TOP5');
  const zhPriority = [
    { slug: 'sichuan-earthquake-2008', reason: '四川省・中国ユーザー向け、中国語検索需要最大' },
    { slug: 'india-ocean-tsunami-2004', reason: '台湾・タイなどアジア被災国向け' },
    { slug: 'tohoku-earthquake-2011', reason: '台湾から多くの支援、関心度高い' },
    { slug: 'turkey-syria-earthquake-2023', reason: '国際的関心、中国語メディアでも報道' },
    { slug: 'noto-earthquake-2024', reason: '台湾からの支援あり、関心度高い' },
  ];
  zhPriority.forEach((item, idx) => {
    const article = articles.find(a => a.slug === item.slug);
    const title = article ? article.title : item.slug;
    lines.push(`    ${idx + 1}. ${title} (${item.slug})`);
    lines.push(`       理由: ${item.reason}`);
  });
  lines.push('');

  // ===========================
  // 採用サイト向け拡張提案
  // ===========================
  lines.push('【採用サイト向け拡張提案】');
  lines.push('');
  lines.push('  ■ 消防採用サイト連携 不足ページ候補');
  CAREER_SITE_PROPOSALS.fire_department.forEach((p, idx) => {
    lines.push(`    ${idx + 1}. ${p}`);
  });
  lines.push('');
  lines.push('  ■ 警察採用サイト連携 不足ページ候補');
  CAREER_SITE_PROPOSALS.police.forEach((p, idx) => {
    lines.push(`    ${idx + 1}. ${p}`);
  });
  lines.push('');

  // ===========================
  // 月別拡張スケジュール案
  // ===========================
  lines.push('【月別拡張スケジュール案】');
  lines.push('');
  const maxMonth = Math.max(...Object.keys(monthlySchedule).map(Number));
  for (let m = 1; m <= maxMonth; m++) {
    const items = monthlySchedule[m] || [];
    lines.push(`  ${m}ヶ月目:`);
    items.forEach(item => {
      lines.push(`    - ${item.name} (優先度: ${item.priority} / 収益性: ${item.revenue})`);
    });
    if (items.length === 0) {
      lines.push('    - （バッファ）');
    }
    lines.push('');
  }

  // ===========================
  // 現状サマリ統計
  // ===========================
  lines.push('【現状サマリ】');
  lines.push(`  総記事数: ${articles.length}件`);
  lines.push(`  日本記事: ${countryCounts['japan'] || 0}件 / 世界記事: ${countryCounts['world'] || 0}件`);
  lines.push(`  最も多い災害種別: ${Object.entries(typeCounts).sort((a,b) => b[1]-a[1])[0][0]} (${Object.entries(typeCounts).sort((a,b) => b[1]-a[1])[0][1]}件)`);
  const totalMissing = MISSING_CHECK.japan_missing.length + MISSING_CHECK.world_missing.length + MISSING_CHECK.theme_missing.length;
  lines.push(`  未収録候補（チェックリスト）: ${totalMissing}件`);
  lines.push(`  TOP15追加で総記事数: ${articles.length + 15}件（予測）`);
  lines.push('');
  lines.push('=== レポート終了 ===');

  return lines.join('\n');
}

// =====================================================================
// エントリーポイント
// =====================================================================

function main() {
  console.log('[db-expansion-agent] 起動中...');

  if (!fs.existsSync(DISASTERS_DIR)) {
    console.error(`エラー: ディレクトリが見つかりません: ${DISASTERS_DIR}`);
    process.exit(1);
  }

  const articles = loadArticles();
  console.log(`[db-expansion-agent] ${articles.length} 件の記事を読み込みました`);

  const report = generateReport(articles);
  console.log('\n' + report);

  if (SAVE_MODE || process.argv.includes('--all')) {
    if (!fs.existsSync(LOGS_DIR)) {
      fs.mkdirSync(LOGS_DIR, { recursive: true });
    }
    const dateTag = new Date().toISOString().substring(0, 10);
    const outPath = path.join(LOGS_DIR, `db-expansion-${dateTag}.txt`);
    fs.writeFileSync(outPath, report, 'utf8');
    console.log(`\n[db-expansion-agent] レポートを保存しました: ${outPath}`);
  }
}

main();
