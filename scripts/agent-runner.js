#!/usr/bin/env node
/**
 * エージェント統合実行スクリプト（司令塔）
 * 全エージェントを一括実行し、結果を logs/ に保存する
 *
 * 使い方:
 *   node scripts/agent-runner.js --all       全エージェント実行
 *   node scripts/agent-runner.js --weekly    週次エージェントのみ（fact-check / link-check）
 *   node scripts/agent-runner.js --monthly   月次エージェントのみ
 *   node scripts/agent-runner.js --report    全レポート生成（ログ保存）
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

// =====================================================================
// 設定
// =====================================================================

const SCRIPTS_DIR = path.join(__dirname);
const LOGS_DIR    = path.join(__dirname, '..', 'logs');

const MODE_ALL     = process.argv.includes('--all');
const MODE_WEEKLY  = process.argv.includes('--weekly');
const MODE_MONTHLY = process.argv.includes('--monthly');
const MODE_REPORT  = process.argv.includes('--report');

// デフォルト（引数なし）は --all と同等
const RUN_ALL = MODE_ALL || MODE_REPORT || (!MODE_WEEKLY && !MODE_MONTHLY && !MODE_REPORT && !MODE_ALL);

// =====================================================================
// エージェント定義
// =====================================================================

/**
 * @typedef {Object} AgentDef
 * @property {string}   name       - 表示名
 * @property {string}   script     - スクリプトファイル名
 * @property {string[]} args       - 追加引数
 * @property {string}   schedule   - 実行スケジュール（weekly/monthly/quarterly）
 * @property {string}   desc       - 処理内容の概要
 */

/** @type {AgentDef[]} */
const AGENTS = [
  {
    name:     'fact-check',
    script:   'fact-check.js',
    args:     [],
    schedule: 'weekly',
    desc:     '全記事のJSON整合性・必須フィールド確認',
  },
  {
    name:     'auto-update',
    script:   'auto-update.js',
    args:     [],
    schedule: 'monthly',
    desc:     '90日以上未更新の記事を検出',
  },
  {
    name:     'internal-link',
    script:   'internal-link-agent.js',
    args:     [],
    schedule: 'monthly',
    desc:     '内部リンク構造・孤立記事の分析',
  },
  {
    name:     'revenue',
    script:   'revenue-agent.js',
    args:     [],
    schedule: 'monthly',
    desc:     '収益スコア・アフィリエイト適合度の分析',
  },
  {
    name:     'db-expansion',
    script:   'db-expansion-agent.js',
    args:     [],
    schedule: 'quarterly',
    desc:     'カバレッジ分析・追加記事候補の提案',
  },
  {
    name:     'auto-improve',
    script:   'auto-improve-agent.js',
    args:     [],
    schedule: 'monthly',
    desc:     '全記事スコアリング・改善提案',
  },
];

// =====================================================================
// ユーティリティ
// =====================================================================

function ensureLogsDir() {
  if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
  }
}

function getDateTag() {
  return new Date().toISOString().substring(0, 10);
}

function getTimestamp() {
  return new Date().toISOString().replace('T', ' ').substring(0, 19);
}

function hr(char = '-', len = 60) {
  return char.repeat(len);
}

function selectAgents(agents) {
  if (MODE_WEEKLY) {
    return agents.filter(a => a.schedule === 'weekly');
  }
  if (MODE_MONTHLY) {
    return agents.filter(a => a.schedule === 'weekly' || a.schedule === 'monthly');
  }
  // --all / --report / デフォルト: 全て実行
  return agents;
}

// =====================================================================
// 実行エンジン
// =====================================================================

/**
 * 1エージェントを実行してstdout/stderrを返す
 * @param {AgentDef} agent
 * @returns {{ name: string, output: string, error: string | null, durationMs: number }}
 */
function runAgent(agent) {
  const scriptPath = path.join(SCRIPTS_DIR, agent.script);

  if (!fs.existsSync(scriptPath)) {
    return {
      name:       agent.name,
      output:     '',
      error:      `スクリプトが見つかりません: ${scriptPath}`,
      durationMs: 0,
    };
  }

  const args = agent.args.length > 0 ? ' ' + agent.args.join(' ') : '';
  const cmd  = `node "${scriptPath}"${args}`;

  const start = Date.now();
  let output = '';
  let error  = null;

  try {
    output = execSync(cmd, {
      encoding:    'utf8',
      maxBuffer:   10 * 1024 * 1024, // 10MB
      timeout:     60000,            // 60秒タイムアウト
      cwd:         path.join(__dirname, '..'),
    });
  } catch (e) {
    // execSync はノンゼロ終了時にthrowする
    output = e.stdout || '';
    error  = e.stderr || e.message || '不明なエラー';
  }

  const durationMs = Date.now() - start;
  return { name: agent.name, output, error, durationMs };
}

// =====================================================================
// レポート生成
// =====================================================================

/**
 * 実行結果を1つのテキストレポートにまとめる
 * @param {ReturnType<runAgent>[]} results
 * @param {string} mode
 * @returns {string}
 */
function buildReport(results, mode) {
  const lines = [];
  const startAt = getTimestamp();

  lines.push(hr('='));
  lines.push('saigaishi-navi エージェント統合レポート');
  lines.push(`生成日時  : ${startAt}`);
  lines.push(`実行モード: ${mode}`);
  lines.push(`実行環境  : ${os.platform()} / Node.js ${process.version}`);
  lines.push(`実行エージェント数: ${results.length}体`);
  lines.push(hr('='));
  lines.push('');

  // サマリテーブル
  lines.push('【実行サマリ】');
  lines.push('');
  lines.push('  エージェント名      | 結果   | 実行時間');
  lines.push('  -------------------|--------|----------');
  results.forEach(r => {
    const status = r.error ? '  ERROR ' : '  OK    ';
    const ms = String(r.durationMs).padStart(5) + 'ms';
    const name = r.name.padEnd(20);
    lines.push(`  ${name}|${status}| ${ms}`);
  });
  lines.push('');

  const errorCount = results.filter(r => r.error).length;
  lines.push(`  合計: ${results.length}体実行 / エラー: ${errorCount}体 / 成功: ${results.length - errorCount}体`);
  lines.push('');

  // 各エージェントの詳細出力
  results.forEach(r => {
    lines.push(hr('-'));
    lines.push(`[エージェント: ${r.name}]`);
    lines.push(`実行時間: ${r.durationMs}ms`);
    if (r.error) {
      lines.push(`ステータス: ERROR`);
      lines.push('--- エラー出力 ---');
      lines.push(r.error.trim());
    } else {
      lines.push(`ステータス: OK`);
    }
    if (r.output && r.output.trim()) {
      lines.push('--- 出力 ---');
      lines.push(r.output.trim());
    }
    lines.push('');
  });

  lines.push(hr('='));
  lines.push('レポート終了');
  lines.push(hr('='));

  return lines.join('\n');
}

// =====================================================================
// メイン処理
// =====================================================================

function main() {
  const mode = MODE_WEEKLY  ? '--weekly'
             : MODE_MONTHLY ? '--monthly'
             : MODE_REPORT  ? '--report'
             : '--all';

  console.log(`[agent-runner] 起動 (モード: ${mode})`);
  console.log(`[agent-runner] 開始時刻: ${getTimestamp()}`);
  console.log('');

  ensureLogsDir();

  const targetAgents = selectAgents(AGENTS);
  if (targetAgents.length === 0) {
    console.log('[agent-runner] 実行対象エージェントがありません。');
    process.exit(0);
  }

  console.log(`[agent-runner] 実行対象: ${targetAgents.map(a => a.name).join(', ')}`);
  console.log('');

  /** @type {ReturnType<runAgent>[]} */
  const results = [];

  targetAgents.forEach((agent, idx) => {
    console.log(`[${idx + 1}/${targetAgents.length}] ${agent.name} を実行中...`);
    console.log(`  スクリプト: ${agent.script}`);
    console.log(`  処理内容: ${agent.desc}`);

    const result = runAgent(agent);
    results.push(result);

    if (result.error) {
      console.log(`  結果: ERROR (${result.durationMs}ms)`);
      console.log(`  エラー: ${result.error.split('\n')[0]}`);
    } else {
      console.log(`  結果: OK (${result.durationMs}ms)`);
    }
    console.log('');
  });

  // レポート生成
  const report = buildReport(results, mode);

  // ログ保存（--report, --all, または全実行時は常に保存）
  const shouldSave = MODE_REPORT || MODE_ALL || RUN_ALL;
  if (shouldSave) {
    const dateTag  = getDateTag();
    const logPath  = path.join(LOGS_DIR, `agent-report-${dateTag}.txt`);
    fs.writeFileSync(logPath, report, 'utf8');
    console.log(`[agent-runner] レポートを保存しました: ${logPath}`);
  }

  // コンソールにも出力（--report 時は詳細表示）
  if (MODE_REPORT) {
    console.log('\n' + report);
  } else {
    // サマリだけ表示
    const errorCount = results.filter(r => r.error).length;
    console.log(hr('='));
    console.log(`実行完了: ${results.length}体 / エラー: ${errorCount}体 / 成功: ${results.length - errorCount}体`);
    if (errorCount > 0) {
      console.log('エラーが発生したエージェント:');
      results.filter(r => r.error).forEach(r => {
        console.log(`  - ${r.name}: ${r.error.split('\n')[0]}`);
      });
    }
    console.log(hr('='));
  }

  // エラーがあればノンゼロ終了
  const errorCount = results.filter(r => r.error).length;
  if (errorCount > 0) {
    process.exit(1);
  }
}

main();
