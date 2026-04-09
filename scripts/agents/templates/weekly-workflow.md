# 週次AIエージェント運用ワークフロー

## 毎週月曜日 09:00（自動実行 - macOS launchd）

### STEP 1: 品質確認（自動）
npm run fact-check:verbose → エラー0件を確認

### STEP 2: 内部リンク分析（自動）
npm run internal-link > logs/internal-link-YYYYMMDD.txt
→ 孤立記事があれば: npm run internal-link:fix

### STEP 3: 収益分析（自動）
npm run revenue > logs/revenue-YYYYMMDD.txt
→ 高優先度記事を確認してメモ

### STEP 4: DB拡張確認（自動）
npm run db-expansion > logs/db-YYYYMMDD.txt
→ 優先追加候補TOP3を確認

### STEP 5: 全体レポート（自動）
npm run agent:all
→ logs/agent-report-YYYY-MM-DD.txt を確認

## 人間が確認するポイント（月曜日中）
- [ ] 孤立記事は自動修正されたか
- [ ] 収益高優先度記事の導線は適切か
- [ ] DB拡張候補で今月追加すべき記事はあるか
- [ ] 新しいファクトチェックが必要な情報はあるか

## 毎月1日 追加作業
- [ ] npm run auto-improve → スコア95点未満の記事を確認
- [ ] DB拡張候補から1〜2記事を実際に作成
- [ ] 検索意図エージェントで新規記事のKWを分析
