#!/usr/bin/env node
/**
 * 検索意図エージェント
 * 防災ジャンル特化のキーワード分析ツール（オフライン動作・YMYL準拠）
 *
 * 使い方: node scripts/search-intent-agent.js "停電 対策"
 */

'use strict';

// =====================================================================
// 意図分類マッピングテーブル
// =====================================================================

/** 問題解決型キーワードパターン */
const PROBLEM_SOLVING_PATTERNS = [
  /対策$/,
  /対処$/,
  /予防$/,
  /防ぐ/,
  /止める/,
  /減らす/,
  /対応/,
  /対処法/,
  /解決/,
  /回避/,
  /防止/,
  /対策方法/,
  /どうすれば/,
  /どうやって/,
  /方法$/,
  /した場合/,
  /になったら/,
  /が来たら/,
  /が起きたら/,
  /になったとき/,
  /の時/,
  /の際/,
];

/** 情報型キーワードパターン */
const INFORMATIONAL_PATTERNS = [
  /歴史/,
  /死者/,
  /被害/,
  /原因/,
  /メカニズム/,
  /仕組み/,
  /とは$/,
  /とは\s/,
  /種類/,
  /分類/,
  /一覧/,
  /リスト/,
  /統計/,
  /データ/,
  /記録/,
  /実態/,
  /現状/,
  /事例/,
  /年/,
  /規模/,
  /頻度/,
  /確率/,
  /なぜ/,
  /理由/,
];

/** 行動型キーワードパターン */
const ACTION_PATTERNS = [
  /避難\s*(方法|の仕方|の手順|手順)/,
  /備蓄/,
  /何が必要/,
  /必要なもの/,
  /リュック/,
  /非常袋/,
  /持ち出し袋/,
  /緊急連絡先/,
  /登録/,
  /申請/,
  /手続き/,
  /確認方法/,
  /チェックリスト/,
  /準備/,
  /手順/,
  /やり方/,
  /作り方/,
  /設置/,
  /購入/,
  /選び方/,
];

/** 比較型キーワードパターン */
const COMPARISON_PATTERNS = [
  /vs/i,
  /versus/i,
  /どちらが(いい|よい|おすすめ)/,
  /比較/,
  /違い/,
  /差/,
  /ランキング/,
  /おすすめ/,
  /最良/,
  /最善/,
  /どれがいい/,
  /どれを選ぶ/,
];

// =====================================================================
// 緊急度判定キーワード
// =====================================================================

const HIGH_URGENCY_KEYWORDS = [
  '今すぐ', 'いますぐ', '緊急', '災害発生', '避難', '逃げる', '危険',
  '地震', '津波', '洪水', '台風', '竜巻', '火山', '土砂崩れ',
  '停電中', '断水中', '行方不明', '救助', '119', '110',
];

const LOW_URGENCY_KEYWORDS = [
  '歴史', '昔', '過去', '統計', '研究', '記録', '年間',
  '死者', '被害額', '規模', '分類', 'メカニズム', '仕組み',
];

// =====================================================================
// 防災カテゴリ別 H2見出しテンプレート
// =====================================================================

const ARTICLE_TEMPLATES = {
  problem_solving: {
    introDirection: 'ユーザーが直面している具体的な問題を共感的に明示し、「この記事で解決できる」と示す。誇張・煽りなし。',
    headings: [
      '{キーワード}のリスクをまず正確に理解する',
      '{キーワード}が起きたときの基本行動',
      '事前にできる{キーワード}対策【チェックリスト付き】',
      '家族・地域でできる対策',
      '専門機関・公的支援の活用方法',
      'よくある疑問と正しい答え（Q&A）',
      'まとめ：今日からできるアクション',
    ],
  },
  informational: {
    introDirection: '読者の知的好奇心に応える導入。「なぜ重要か」を正確な数値とともに示す。センセーショナルな表現を避ける。',
    headings: [
      '{キーワード}の概要と基本知識',
      '{キーワード}の発生メカニズム',
      '主要な被害事例と統計データ',
      '日本での発生状況・頻度',
      '過去の教訓から学んだこと',
      '現在の防災体制への影響',
      '知識を防災行動につなげる方法',
    ],
  },
  action: {
    introDirection: '「何をすればいいかわからない」という不安に答え、具体的なステップを提示することを予告する。',
    headings: [
      'まず確認：{キーワード}の基本',
      'ステップ1：今日中にできる準備',
      'ステップ2：1週間以内にやること',
      'ステップ3：定期的に見直すこと',
      '家族で共有すべき情報・連絡方法',
      '公的支援・地域の資源の活用',
      '実践チェックリスト',
    ],
  },
  comparison: {
    introDirection: '比較の前提となる条件・用途・家族構成などを先に整理し、読者が自分に合った選択ができるよう導く。',
    headings: [
      '比較の前に：選ぶ際の重要なポイント',
      '{キーワード}の基本スペック・特徴',
      '状況別おすすめの選び方',
      '費用・コスパの比較',
      '専門家・防災士の見解',
      '実際の利用者の声（メリット・デメリット）',
      '総合まとめ：あなたに合った選択',
    ],
  },
};

// =====================================================================
// 意図分析関数
// =====================================================================

/**
 * キーワードから意図タイプを判定する
 * @param {string} keyword
 * @returns {'problem_solving'|'informational'|'action'|'comparison'}
 */
function classifyIntent(keyword) {
  const scores = {
    problem_solving: 0,
    informational: 0,
    action: 0,
    comparison: 0,
  };

  for (const pattern of COMPARISON_PATTERNS) {
    if (pattern.test(keyword)) scores.comparison += 3;
  }
  for (const pattern of ACTION_PATTERNS) {
    if (pattern.test(keyword)) scores.action += 3;
  }
  for (const pattern of PROBLEM_SOLVING_PATTERNS) {
    if (pattern.test(keyword)) scores.problem_solving += 2;
  }
  for (const pattern of INFORMATIONAL_PATTERNS) {
    if (pattern.test(keyword)) scores.informational += 2;
  }

  // スコアが同点の場合は問題解決型を優先（防災ジャンルの特性）
  const maxScore = Math.max(...Object.values(scores));
  if (maxScore === 0) {
    // デフォルト判定：ジャンルキーワードで推定
    if (/備え|準備|持ち出し|非常|緊急/.test(keyword)) return 'action';
    if (/歴史|記録|被害|統計/.test(keyword)) return 'informational';
    return 'problem_solving';
  }

  // 最高スコアの意図を返す（同点時は順序優先）
  const order = ['comparison', 'action', 'problem_solving', 'informational'];
  return order.find((k) => scores[k] === maxScore);
}

/**
 * 緊急度を判定する
 * @param {string} keyword
 * @returns {'高'|'中'|'低'}
 */
function classifyUrgency(keyword) {
  for (const kw of HIGH_URGENCY_KEYWORDS) {
    if (keyword.includes(kw)) return '高';
  }
  for (const kw of LOW_URGENCY_KEYWORDS) {
    if (keyword.includes(kw)) return '低';
  }
  return '中';
}

/**
 * 意図タイプに対応した日本語ラベルを返す
 */
function intentLabel(intentType) {
  const labels = {
    problem_solving: '問題解決型',
    informational: '情報型',
    action: '行動型',
    comparison: '比較型',
  };
  return labels[intentType] || '不明';
}

/**
 * 意図タイプに対応したユーザー状況説明を生成する
 */
function describeUserSituation(keyword, intentType, urgency) {
  const descriptions = {
    problem_solving: `「${keyword}」と検索したユーザーは、すでに問題・リスクを認識しており、具体的な対処法や手順を求めている段階。災害の脅威は理解済みで「何をすれば防げるか」「被害を小さくできるか」を知りたい。`,
    informational: `「${keyword}」と検索したユーザーは、該当する災害・現象について正確な知識・データを求めている。防災意識向上のきっかけとなる段階で、実用的な備えへつなぐ橋渡しが重要。`,
    action: `「${keyword}」と検索したユーザーは、今まさに行動に移そうとしている段階。「何を・いつ・どうやって」という具体的ステップが必要。複雑な説明より明快なTo-Doリストが有効。`,
    comparison: `「${keyword}」と検索したユーザーは、複数の選択肢を検討中で決断を迷っている段階。自分の家族・状況・予算に合った最適解を見つけたい。中立的で根拠ある情報提供が重要。`,
  };

  let base = descriptions[intentType] || '';
  if (urgency === '高') {
    base += '\n【緊急性】現在進行形または直近の災害リスクに対応する緊急度の高い検索。即座に役立つ情報を最優先で提供する。';
  }
  return base;
}

/**
 * SEOタイトルを生成する
 */
function generateTitle(keyword, intentType, urgency) {
  const titleTemplates = {
    problem_solving: [
      `${keyword}の完全ガイド｜今日から実践できる対策と手順`,
      `【専門家監修】${keyword}を正しく理解して備える方法`,
    ],
    informational: [
      `${keyword}とは？発生メカニズムと過去の被害データを解説`,
      `${keyword}の歴史と教訓｜データで見る防災の重要性`,
    ],
    action: [
      `${keyword}の準備リスト｜今すぐ始める防災行動ガイド`,
      `【実践版】${keyword}を始める手順とチェックリスト`,
    ],
    comparison: [
      `${keyword}を比較｜防災士が教える正しい選び方`,
      `${keyword}の違いを解説｜あなたに合った選択肢とは`,
    ],
  };

  const templates = titleTemplates[intentType] || titleTemplates.problem_solving;
  // 緊急度高の場合は最初のテンプレートを優先
  return urgency === '高' ? templates[0] : templates[Math.floor(Math.random() * templates.length)];
}

/**
 * 見出し構成を生成する（キーワードを埋め込む）
 */
function generateHeadings(keyword, intentType) {
  const template = ARTICLE_TEMPLATES[intentType] || ARTICLE_TEMPLATES.problem_solving;
  return template.headings.map((h) => h.replace('{キーワード}', keyword));
}

/**
 * 最初に答えるべき内容を生成する（YMYL準拠）
 */
function generatePriorityContent(keyword, intentType, urgency) {
  if (urgency === '高') {
    return `「${keyword}」に関して今すぐ取れる安全行動を最初に簡潔に示す。避難情報の確認先（気象庁・自治体）、緊急連絡先（119/110）、ハザードマップの確認手順を優先。`;
  }

  const priorities = {
    problem_solving: `「${keyword}」のリスクを数値・事実ベースで正確に提示する。不安を煽る表現を避け、「実際に起きる可能性と影響」を客観的に示してから対策に移る。`,
    informational: `「${keyword}」の定義・基本データ（発生頻度・被害規模など）を最初に提示する。信頼できる公的機関（気象庁・内閣府・消防庁）の統計を根拠として引用する。`,
    action: `「${keyword}」で最優先に準備すべきアイテム・行動TOP3を冒頭に示す。「まず何をすればいいか」に答えてから詳細ステップに進む。`,
    comparison: `「${keyword}」を比較する前に「比較の前提条件（家族構成・住居・予算）」を整理するよう読者に促す。条件によって最適解が異なることを最初に明示する。`,
  };

  return priorities[intentType] || priorities.problem_solving;
}

// =====================================================================
// メイン処理
// =====================================================================

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log('使い方: node scripts/search-intent-agent.js "キーワード"');
    console.log('例:     node scripts/search-intent-agent.js "地震 備え"');
    process.exit(0);
  }

  const keyword = args.join(' ').trim();

  const intentType = classifyIntent(keyword);
  const urgency = classifyUrgency(keyword);
  const userSituation = describeUserSituation(keyword, intentType, urgency);
  const title = generateTitle(keyword, intentType, urgency);
  const introDirection = (ARTICLE_TEMPLATES[intentType] || ARTICLE_TEMPLATES.problem_solving).introDirection;
  const headings = generateHeadings(keyword, intentType);
  const priorityContent = generatePriorityContent(keyword, intentType, urgency);

  // =====================================================================
  // 出力
  // =====================================================================

  console.log('\n=== 検索意図分析 ===');
  console.log(`キーワード: ${keyword}`);
  console.log(`意図タイプ: ${intentLabel(intentType)}`);
  console.log(`ユーザー状況: ${userSituation}`);
  console.log(`緊急度: ${urgency}`);

  console.log('\n=== 推奨記事構造 ===');
  console.log(`タイトル: ${title}`);
  console.log(`導入文方向性: ${introDirection}`);
  console.log('\n見出し構成:');
  headings.forEach((h) => console.log(`H2: ${h}`));

  console.log('\n=== 防災優先情報 ===');
  console.log(`最初に答えるべき内容: ${priorityContent}`);

  console.log('\n---');
  console.log('[YMYLルール遵守] 医療・安全ジャンルにつき誇張表現・不安煽り禁止。公的機関データを根拠として使用すること。');
  console.log('');
}

main();
