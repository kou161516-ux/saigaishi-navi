# saigaishi-navi AIエージェント仕様書

> バージョン: 1.0.0
> 最終更新: 2026-04-09
> 対象プロジェクト: `/Users/yoshinokouichi/projects/saigaishi-navi/`

---

## エージェント体制（全13体）

### 既存エージェント（10体）

| # | スクリプト | 役割 | 実行タイミング |
|---|-----------|------|--------------|
| 1 | `scripts/fact-check.js` | 全記事のJSONバリデーション・必須フィールド欠損チェック・slug整合性確認 | 毎週 / CI/CD |
| 2 | `scripts/link-check.js` | 内部リンク（relatedSlugs）の存在確認・外部URLの死活チェック | 毎週 |
| 3 | `scripts/auto-update.js` | updatedAt が90日以上古い記事を検出し更新候補リストを出力 | 毎月 |
| 4 | `scripts/search-intent-agent.js` | キーワード入力から検索意図（問題解決型/情報収集型/比較型）を分類し記事戦略を提案 | 随時（記事作成時） |
| 5 | `scripts/auto-improve-agent.js` | 全記事をスコアリング（100点満点）して改善提案を出力。`--fix` オプションでrelatedSlugs自動補完 | 毎月 |
| 6 | `scripts/internal-link-agent.js` | 全49記事のrelatedSlugs分析・孤立記事検出・クラスター構造把握・防災ブログ連携提案 | 毎月 |
| 7 | `scripts/revenue-agent.js` | 記事タイプ・タグからアフィリエイト商品適合スコアを算出・収益改善提案を出力 | 毎月 |
| 8 | `scripts/db-expansion-agent.js` | カバレッジ分析・不足記事特定・優先追加候補TOP15・多言語展開ロードマップの出力 | 四半期 |
| 9 | `scripts/agent-runner.js` | 全エージェントの統合実行・スケジューリング・レポート保存を一括管理する司令塔 | 随時 / 定期実行 |
| 10 | `scripts/weekly-check.sh` | 週次チェック（fact-check + link-check）のシェルラッパー | 毎週 |

### 新規エージェント（3体）

#### エージェント A: `scripts/internal-link-agent.js`（内部リンク戦略エージェント）

**目的:** 記事間のリンク構造を最適化し、サイト全体の巡回効率とSEO評価を高める。

| 項目 | 仕様 |
|------|------|
| 入力 | `src/data/disasters/*.json` 全件 |
| 主要分析 | 孤立記事検出（relatedSlugs 2件以下）・ハブ記事特定・クラスター分析 |
| 出力 | コンソールレポート（--fix時はJSONファイルも自動更新） |
| オプション | `--fix` : 孤立記事のrelatedSlugsを同type/country/tagから自動補完 |
| 判断軸 | 同disaster type → 同country → 同decade の順で関連記事を優先選択 |

**主要チェック項目:**
- relatedSlugs に存在しないslugが含まれていないか
- 双方向リンク（AがBを参照 ↔ BがAを参照）が成立しているか
- タイプ別クラスターの連結度（earthquake クラスター等）

---

#### エージェント B: `scripts/revenue-agent.js`（収益最適化エージェント）

**目的:** 各記事のアフィリエイト適合度を定量化し、収益最大化の優先順位を可視化する。

| 項目 | 仕様 |
|------|------|
| 入力 | `src/data/disasters/*.json` 全件 |
| 主要分析 | type・tags・summaryキーワードからアフィ商品との適合スコア算出 |
| 出力 | 記事別スコアランキング・商品カテゴリ別推奨リスト |
| オプション | `--category <type>` : 特定disasterタイプでフィルタ |
| 収益基準 | 防災リュック/ポータブル電源/保存水/非常食 等の高単価商品への導線強度 |

**商品マッピング概要:**
```
earthquake → 防災リュック・ポータブル電源・家具固定グッズ
tsunami    → 防水バッグ・防災リュック・保存水
typhoon    → ポータブル電源・養生テープ・非常食
flood      → 防水グッズ・長靴・携帯ラジオ
heatwave   → 経口補水液・遮光グッズ・ポータブル扇風機
```

---

#### エージェント C: `scripts/db-expansion-agent.js`（データベース拡張エージェント）

**目的:** 49記事のカバレッジを多角的に分析し、追加すべき記事の優先順位とロードマップを提供する。

| 項目 | 仕様 |
|------|------|
| 入力 | `src/data/disasters/*.json` 全件 |
| 分析軸 | 国別・disaster種別・年代別・死者規模別の4軸カバレッジ |
| 不足チェック | japan_missing(10件) / world_missing(12件) / theme_missing(7件) の計29候補 |
| 出力 | TOP15優先追加候補・DBフィールド拡張提案・多言語ロードマップ・月別スケジュール |
| オプション | `--save` : logs/db-expansion-YYYY-MM-DD.txt に保存 |

---

## エージェント連携フロー

```
[トリガー: 記事追加 / 定期実行]
         |
         v
[1] fact-check.js
  └─ JSON整合性OK? → NO → エラー出力・人間確認 → 修正
         |
         v (OK)
[2] auto-update.js
  └─ 古い記事リストアップ → 人間が内容を手動更新
         |
         v
[3] internal-link-agent.js
  └─ 孤立記事検出 → --fix で自動補完 or 人間確認
         |
         v
[4] revenue-agent.js
  └─ 収益スコア算出 → CTAテキスト改善提案 → 人間が判断
         |
         v
[5] db-expansion-agent.js
  └─ カバレッジ分析 → 追加記事候補リスト → 人間が次の記事テーマを決定
         |
         v
[6] auto-improve-agent.js
  └─ 全記事スコアリング → 低スコア記事リスト → 人間 or --fix で改善
         |
         v
[出力] logs/agent-report-YYYY-MM-DD.txt
```

---

## 人間確認が必要なポイント

チェックリスト（エージェント実行後に人間が判断する項目）:

### 品質確認
- [ ] fact-check.js でエラーが出た記事の内容修正
- [ ] auto-update.js で検出された「90日以上未更新」記事の内容を精査
- [ ] auto-improve-agent.js でスコア70点未満の記事を確認し修正方針を決定

### リンク・構造
- [ ] internal-link-agent.js の孤立記事リストを確認（--fix 自動補完内容の妥当性検証）
- [ ] 双方向リンク未成立の記事ペアを手動で確認

### 収益・SEO
- [ ] revenue-agent.js の収益スコア低記事に対しCTA文言の追加・改善
- [ ] 収益性「高」記事のアフィリエイトリンク設置状況を確認

### コンテンツ拡張
- [ ] db-expansion-agent.js のTOP15候補から次月の執筆テーマを1〜3件選択
- [ ] 多言語展開の優先記事について翻訳作業開始タイミングを決定

### 技術・運用
- [ ] `logs/` ディレクトリのレポートファイルが正常に生成されているか確認
- [ ] 新記事追加後に全エージェントを再実行（`npm run agent:all`）

---

## 運用カレンダー

| 頻度 | エージェント / タスク | 処理内容 | 実行コマンド |
|------|---------------------|---------|------------|
| 毎日 | （自動なし） | 手動で記事追加・更新 | — |
| 毎週 | fact-check.js | JSON整合性チェック | `npm run fact-check` |
| 毎週 | link-check.js | リンク死活確認 | `npm run link-check` |
| 毎週 | weekly-check.sh | 上記2つの一括実行 | `bash scripts/weekly-check.sh` |
| 毎月 | auto-update.js | 古い記事検出 | `npm run auto-update` |
| 毎月 | auto-improve-agent.js | 全記事スコアリング | `npm run auto-improve` |
| 毎月 | internal-link-agent.js | リンク構造分析 | `npm run internal-link` |
| 毎月 | revenue-agent.js | 収益スコア分析 | `npm run revenue` |
| 毎月 | agent-runner.js --monthly | 月次一括実行 | `npm run agent:weekly` |
| 四半期 | db-expansion-agent.js | カバレッジ分析・拡張提案 | `npm run db-expansion` |
| 四半期 | agent-runner.js --report | 全レポート生成・保存 | `npm run agent:report` |

---

## 実装コマンド一覧

### package.json scripts（全一覧）

```json
{
  "scripts": {
    "dev":               "next dev",
    "build":             "next build",
    "start":             "next start",
    "lint":              "next lint",
    "postbuild":         "next-sitemap",

    "fact-check":        "node scripts/fact-check.js",
    "fact-check:verbose":"node scripts/fact-check.js --verbose",
    "link-check":        "node scripts/link-check.js",
    "auto-update":       "node scripts/auto-update.js",
    "validate":          "npm run fact-check && npx tsc --noEmit",
    "validate:full":     "npm run fact-check:verbose && npm run link-check && npm run auto-update",

    "search-intent":     "node scripts/search-intent-agent.js",
    "auto-improve":      "node scripts/auto-improve-agent.js",
    "auto-improve:fix":  "node scripts/auto-improve-agent.js --fix",
    "internal-link":     "node scripts/internal-link-agent.js",
    "internal-link:fix": "node scripts/internal-link-agent.js --fix",
    "revenue":           "node scripts/revenue-agent.js",
    "db-expansion":      "node scripts/db-expansion-agent.js",

    "agent:all":         "node scripts/agent-runner.js --all",
    "agent:weekly":      "node scripts/agent-runner.js --weekly",
    "agent:monthly":     "node scripts/agent-runner.js --monthly",
    "agent:report":      "node scripts/agent-runner.js --report"
  }
}
```

### 各エージェントのオプション

```
node scripts/fact-check.js [--verbose]
node scripts/link-check.js
node scripts/auto-update.js
node scripts/search-intent-agent.js "<キーワード>"
node scripts/auto-improve-agent.js [--fix]
node scripts/internal-link-agent.js [--fix]
node scripts/revenue-agent.js [--category <type>]
node scripts/db-expansion-agent.js [--save]
node scripts/agent-runner.js [--all | --weekly | --monthly | --report]
```

---

## 30日間テスト計画

### 第1週（Day 1-7）: 基盤確認フェーズ

| Day | 作業 | 確認内容 |
|-----|------|---------|
| 1 | `npm run fact-check` | 全49記事のJSON整合性が正常であることを確認 |
| 2 | `npm run link-check` | relatedSlugs に無効なslugがないことを確認 |
| 3 | `npm run auto-update` | 90日以上未更新の記事リストを作成 |
| 4 | `npm run search-intent` | キーワード分析機能の動作確認（例: "地震 備え"） |
| 5 | `npm run auto-improve` | 全記事スコアリング実行・低スコア記事リスト作成 |
| 6 | `npm run internal-link` | リンク構造分析・孤立記事リスト確認 |
| 7 | `npm run revenue` | 収益スコア分析・高収益記事TOP10確認 |

### 第2週（Day 8-14）: 改善実行フェーズ

| Day | 作業 | 確認内容 |
|-----|------|---------|
| 8 | `npm run auto-improve:fix` | 自動補完の適用・修正内容の妥当性確認 |
| 9 | `npm run internal-link:fix` | 孤立記事への自動リンク補完確認 |
| 10 | 低スコア記事（70点未満）の手動修正 | summary/lessons/preparedness の充実 |
| 11 | 収益スコア低記事のCTA改善 | affiliateCategory の見直し |
| 12 | `npm run db-expansion` | カバレッジ分析実行・TOP15候補リスト確認 |
| 13 | TOP15候補から執筆テーマ3件を選定 | 人間による意思決定 |
| 14 | 第1週・第2週の総合レビュー | 全エージェント出力を横断的に確認 |

### 第3週（Day 15-21）: 統合運用フェーズ

| Day | 作業 | 確認内容 |
|-----|------|---------|
| 15 | `npm run agent:all` | 全エージェント一括実行テスト |
| 16 | logs/ ディレクトリの出力確認 | レポートファイルの内容・フォーマット確認 |
| 17 | 新記事1件追加（Day 13選定テーマ） | fact-check / link-check を即時実行 |
| 18 | 新記事追加後の全エージェント再実行 | スコア変化・リンク変化を確認 |
| 19 | `npm run agent:weekly` | 週次自動実行のシミュレーション |
| 20 | 多言語展開優先記事の英語化着手 | titleEn・メタ情報の英語品質確認 |
| 21 | 第3週総合レビュー・問題点リスト作成 | 人間確認ポイントの見直し |

### 第4週（Day 22-30）: 安定稼動フェーズ

| Day | 作業 | 確認内容 |
|-----|------|---------|
| 22 | 新記事2件目追加 | 追加後の全体スコア変化を確認 |
| 23 | `npm run agent:monthly` | 月次エージェント一括実行 |
| 24 | 収益改善施策の効果測定 | アフィリエイトCTR・PV変化を確認（Google Analytics等） |
| 25 | agent-runner.js のログ出力品質確認 | logs/agent-report-YYYY-MM-DD.txt の可読性 |
| 26 | `npm run agent:report` | 全レポート生成・保存 |
| 27 | 30日間のエージェント実行ログ横断レビュー | 改善効果・課題の棚卸し |
| 28 | AGENT_SPECS.md の更新（実運用を踏まえた修正） | 仕様と実装の乖離を解消 |
| 29 | 次の四半期に向けたDB拡張優先記事の確定 | db-expansion レポートを参照して決定 |
| 30 | 全体総括レポート作成・次月計画策定 | 人間によるレビューと意思決定 |

---

## エージェントの入出力サマリ

```
入力: src/data/disasters/*.json (49件)
        |
        +---> [fact-check]       ---> コンソール出力（エラーリスト）
        |
        +---> [link-check]       ---> コンソール出力（死リンクリスト）
        |
        +---> [auto-update]      ---> コンソール出力（更新候補リスト）
        |
        +---> [search-intent]    ---> コンソール出力（意図分類・記事戦略）
        |
        +---> [auto-improve]     ---> コンソール出力 / JSON自動修正(--fix)
        |
        +---> [internal-link]    ---> コンソール出力 / JSON自動補完(--fix)
        |
        +---> [revenue]          ---> コンソール出力（収益スコアランキング）
        |
        +---> [db-expansion]     ---> コンソール出力 / logs/db-expansion-*.txt(--save)
        |
        +---> [agent-runner]     ---> logs/agent-report-YYYY-MM-DD.txt（統合レポート）
```

---

## 注意事項・制約

- **Node.js標準モジュールのみ使用**（fs / path / os / http など）。外部npmパッケージは使用しない。
- **YMYL準拠**: 防災・安全情報はE-E-A-T基準で品質を担保。自動修正は補助的な役割に限定し、最終判断は人間が行う。
- **git commit は人間が実施**: エージェントはファイル変更のみ行い、コミットはしない。
- **APIキー不要**: 全エージェントはオフライン動作。外部APIへの通信は行わない。
- **実行時間目安**: 各エージェント単体は49記事で概ね3秒以内に完了する設計。
