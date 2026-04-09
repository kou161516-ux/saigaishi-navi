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

## 自動ファクトチェック・更新システム

### Vercel Cron（自動実行）
| スケジュール | エンドポイント | 内容 |
|---|---|---|
| 毎日 0:00 UTC | /api/cron/update-disasters | JMA+USGS最新地震 |
| 毎日 0:30 UTC | /api/cron/article-check | 記事更新状況チェック |
| 毎日 6:00 JST | /api/cron/revalidate-news | newsページ更新 |
| 毎週月 1:00 UTC | /api/cron/factcheck | USGS照合ファクトチェック |
| 毎週日 2:00 UTC | /api/cron/link-check | リンク死活監視 |

### 手動確認推奨タイミング
- 毎月1日: npm run deaths-check で能登・東日本の死者数確認
- 毎年3月: 東日本大震災の警察庁確定値を確認・更新
- 毎年6月: 福島原発関連死を復興庁で確認・更新
- 毎年1月: 能登半島地震の最新死者数を内閣府で確認・更新

### 緊急時（大規模災害発生時）
1. npm run db-expansion で新記事候補を確認
2. 新しいJSONファイルを作成（既存記事を参考に）
3. npm run fact-check で品質確認
4. git push → Vercel自動デプロイ
