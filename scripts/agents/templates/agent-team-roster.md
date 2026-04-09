# AIエージェントチーム名刺リスト（全13体）

> 最終更新: 2026-04-09
> プロジェクト: saigaishi-navi

---

## 基盤エージェント（品質保証）

### 1. ファクトチェッカー（Fact Checker）
| 項目 | 内容 |
|------|------|
| スクリプト | `scripts/fact-check.js` |
| 役割 | 全記事のJSONバリデーション・必須フィールド欠損チェック・slug整合性確認 |
| コマンド | `npm run fact-check` / `npm run fact-check:verbose` |
| 実行頻度 | 毎週（月曜）/ CI/CDパイプライン |
| 担当領域 | データ品質・整合性保証 |

### 2. リンクチェッカー（Link Checker）
| 項目 | 内容 |
|------|------|
| スクリプト | `scripts/link-check.js` |
| 役割 | 内部リンク（relatedSlugs）の存在確認・外部URLの死活チェック |
| コマンド | `npm run link-check` |
| 実行頻度 | 毎週（月曜） |
| 担当領域 | リンク健全性・404防止 |

### 3. 週次チェックシェル（Weekly Check Shell）
| 項目 | 内容 |
|------|------|
| スクリプト | `scripts/weekly-check.sh` |
| 役割 | fact-check + link-checkの週次一括実行シェルラッパー |
| コマンド | `bash scripts/weekly-check.sh` |
| 実行頻度 | 毎週（月曜 09:00 / macOS launchd自動） |
| 担当領域 | 週次品質確認の自動化 |

---

## 分析エージェント（成長支援）

### 4. 自動更新検出（Auto Update Detector）
| 項目 | 内容 |
|------|------|
| スクリプト | `scripts/auto-update.js` |
| 役割 | updatedAtが90日以上古い記事を検出し更新候補リストを出力 |
| コマンド | `npm run auto-update` |
| 実行頻度 | 毎月1日 |
| 担当領域 | コンテンツ鮮度管理・E-E-A-T維持 |

### 5. 検索意図アナライザー（Search Intent Analyzer）
| 項目 | 内容 |
|------|------|
| スクリプト | `scripts/search-intent-agent.js` |
| 役割 | KW入力から検索意図（問題解決型/情報収集型/比較型）を分類し記事戦略を提案 |
| コマンド | `npm run search-intent -- --kw "キーワード"` |
| 実行頻度 | 随時（記事作成前） |
| 担当領域 | SEO・記事企画・KW分析 |

### 6. 自動改善エージェント（Auto Improve Agent）
| 項目 | 内容 |
|------|------|
| スクリプト | `scripts/auto-improve-agent.js` |
| 役割 | 全記事をスコアリング（100点満点）して改善提案を出力。`--fix`オプションでrelatedSlugs自動補完 |
| コマンド | `npm run auto-improve` / `npm run auto-improve -- --fix` |
| 実行頻度 | 毎月1日 |
| 担当領域 | 記事品質スコアリング・自動改善 |

---

## 戦略エージェント（収益・構造最適化）　🆕

### 7. 内部リンク戦略エージェント（Internal Linking Strategy Agent）🆕
| 項目 | 内容 |
|------|------|
| スクリプト | `scripts/internal-link-agent.js` |
| 役割 | 全記事のrelatedSlugs分析・孤立記事検出・クラスター構造把握・防災ブログ連携提案 |
| コマンド | `npm run internal-link` / `npm run internal-link:fix` |
| 実行頻度 | 毎月1日 |
| 担当領域 | 内部リンク構造・SEO・サイト回遊率 |
| プロンプト | `scripts/agents/prompts/internal-link-prompt.txt` |

### 8. 収益最適化エージェント（Revenue Optimization Agent）🆕
| 項目 | 内容 |
|------|------|
| スクリプト | `scripts/revenue-agent.js` |
| 役割 | 記事タイプ・タグからアフィリエイト商品適合スコアを算出・収益改善提案を出力 |
| コマンド | `npm run revenue` / `npm run revenue -- --category earthquake` |
| 実行頻度 | 毎月1日 |
| 担当領域 | アフィリエイト収益・AdSense最適化 |
| プロンプト | `scripts/agents/prompts/revenue-prompt.txt` |

### 9. DB拡張エージェント（Database Expansion Agent）🆕
| 項目 | 内容 |
|------|------|
| スクリプト | `scripts/db-expansion-agent.js` |
| 役割 | カバレッジ分析・不足記事特定・優先追加候補TOP15・多言語展開ロードマップ出力 |
| コマンド | `npm run db-expansion` / `npm run db-expansion -- --save` |
| 実行頻度 | 四半期（1月・4月・7月・10月） |
| 担当領域 | コンテンツ拡張計画・多言語対応・採用サイト連携 |
| プロンプト | `scripts/agents/prompts/db-expansion-prompt.txt` |

---

## 司令塔・管理エージェント

### 10. エージェントランナー（Agent Runner）
| 項目 | 内容 |
|------|------|
| スクリプト | `scripts/agent-runner.js` |
| 役割 | 全エージェントの統合実行・スケジューリング・レポート保存を一括管理する司令塔 |
| コマンド | `npm run agent:all` / `npm run agent:schedule` |
| 実行頻度 | 随時 / 定期実行（launchd管理） |
| 担当領域 | オーケストレーション・ログ管理 |

---

## 将来拡張予定エージェント（計画中）

### 11. 多言語翻訳エージェント（Multilingual Agent）
| 項目 | 内容 |
|------|------|
| スクリプト | `scripts/multilingual-agent.js`（未作成） |
| 役割 | 日本語記事から英語・中国語・韓国語・スペイン語等への翻訳・品質確認 |
| コマンド | `npm run multilingual -- --target en` |
| 実行頻度 | 記事追加時（随時） |
| 担当領域 | 多言語SEO・グローバル展開（目標: 60歳6言語体制） |

### 12. SNS連携エージェント（SNS Integration Agent）
| 項目 | 内容 |
|------|------|
| スクリプト | `scripts/sns-agent.js`（未作成） |
| 役割 | 新規記事・更新記事からX(Twitter)投稿文・YouTube台本素材を自動生成 |
| コマンド | `npm run sns -- --slug {slug}` |
| 実行頻度 | 記事追加・更新時 |
| 担当領域 | X投稿・YouTube素材・拡散支援 |

### 13. 採用連携エージェント（Recruitment Linkage Agent）
| 項目 | 内容 |
|------|------|
| スクリプト | `scripts/recruitment-agent.js`（未作成） |
| 役割 | 消防・警察・自衛隊採用サイトとの記事連携提案・採用コンテンツ拡張計画 |
| コマンド | `npm run recruitment -- --category firefighter` |
| 実行頻度 | 四半期 |
| 担当領域 | 採用サイト連携・公的情報活用 |

---

## エージェント実行優先マトリクス

| 頻度 | エージェント |
|------|-------------|
| 毎週（月曜自動） | ファクトチェッカー・リンクチェッカー・週次チェックシェル |
| 毎月1日 | 自動更新検出・自動改善・内部リンク戦略・収益最適化 |
| 随時（記事作成時） | 検索意図アナライザー・エージェントランナー |
| 四半期 | DB拡張・採用連携（予定） |
