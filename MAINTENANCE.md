# saigaishi-navi 運用マニュアル

## 定期メンテナンス手順

### 毎週確認（月曜日）
```bash
npm run fact-check:verbose    # 構造チェック
npm run auto-update           # 更新要確認ファイルのリスト
```

### 月次確認
```bash
npm run link-check            # URLリンク死活確認（所要: 3〜5分）
```

### 記事更新手順
1. 対象JSONファイルを編集
2. updatedAt を今日の日付（YYYY-MM-DD）に更新
3. `npm run validate` でチェック
4. git commit & push
5. `vercel deploy --prod` でデプロイ

## デプロイコマンド
```bash
export PATH="/opt/homebrew/bin:$PATH"
VERCEL_TOKEN="${VERCEL_TOKEN}"  # .env.localまたはkeychain参照
vercel deploy --prod --token "$VERCEL_TOKEN"
```

## GitHub Actions有効化手順
1. GitHubで Personal access token に `workflow` スコープを追加
2. .gitignore から `.github/workflows/` の行を削除
3. git push

## Vercel Cron（自動実行）
- 毎日 00:00 UTC: /api/cron/update-disasters （最新地震情報取得）
- 毎週日曜 02:00 UTC: /api/cron/link-check （リンク死活確認）
- CRON_SECRET環境変数をVercelダッシュボードに設定すること
