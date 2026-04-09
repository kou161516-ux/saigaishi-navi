#!/bin/bash
# saigaishi-navi 週次チェックスクリプト
# 毎週月曜日に実行推奨

cd "$(dirname "$0")/.."
export PATH="/opt/homebrew/bin:/opt/homebrew/Cellar/node/25.9.0_1/bin:$PATH"

echo "=== 週次メンテナンスチェック: $(date '+%Y-%m-%d') ==="

echo ""
echo "【1. 構造チェック】"
node scripts/fact-check.js --verbose

echo ""
echo "【2. 更新要否確認】"
node scripts/auto-update.js

echo ""
echo "【3. リンクチェック（時間がかかります...）】"
node scripts/link-check.js

echo ""
echo "【4. USGS自動ファクトチェック】"
node scripts/usgs-factcheck.js --save

echo ""
echo "【5. 記事更新チェック】"
node scripts/article-updater.js

echo ""
echo "【6. 死者数確認推奨リスト】"
node scripts/deaths-updater.js

echo ""
echo "【7. 全エージェント実行】"
npm run agent:all

echo ""
echo "=== チェック完了 ==="
echo "問題があれば修正してから: bash scripts/deploy.sh"
