#!/bin/bash
# saigaishi-navi 手動デプロイスクリプト
# 使い方: bash scripts/deploy.sh

set -e

cd "$(dirname "$0")/.."

echo "=== saigaishi-navi デプロイ開始 ==="
echo "日時: $(date '+%Y-%m-%d %H:%M:%S')"

# PATH設定
export PATH="/opt/homebrew/bin:/opt/homebrew/Cellar/node/25.9.0_1/bin:$PATH"

# ファクトチェック
echo ""
echo "1. ファクトチェック..."
node scripts/fact-check.js
if [ $? -ne 0 ]; then
  echo "❌ ファクトチェックでエラーが発生しました。デプロイを中止します。"
  exit 1
fi

# TypeScript型チェック
echo ""
echo "2. TypeScript型チェック..."
npx tsc --noEmit 2>/dev/null && echo "✅ 型チェックOK" || echo "⚠️  型警告あり（継続）"

# ビルド
echo ""
echo "3. ビルド..."
npm run build
if [ $? -ne 0 ]; then
  echo "❌ ビルドエラー。デプロイを中止します。"
  exit 1
fi

# デプロイ
echo ""
echo "4. Vercelデプロイ..."
# VERCEL_TOKEN は事前に環境変数として設定してください
# export VERCEL_TOKEN="your-token-here"  または .env.local から読み込み
if [ -z "$VERCEL_TOKEN" ]; then
  echo "❌ VERCEL_TOKEN が設定されていません"
  echo "   export VERCEL_TOKEN=\"your-token\" を実行してください"
  exit 1
fi
vercel deploy --prod --token "$VERCEL_TOKEN"

echo ""
echo "=== デプロイ完了 ==="
echo "URL: https://saigaishi-navi.vercel.app"
