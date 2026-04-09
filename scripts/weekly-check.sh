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
echo "=== チェック完了 ==="
echo "問題があれば修正してから: bash scripts/deploy.sh"
