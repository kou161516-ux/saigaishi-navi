# エージェント連携ガイド

saigaishi-navi の記事制作・品質改善を支援する2つのエージェントスクリプトの使い方と運用フローを説明します。

---

## エージェント一覧

| スクリプト | コマンド | 役割 |
|---|---|---|
| `scripts/search-intent-agent.js` | `npm run search-intent -- "キーワード"` | 検索意図分析・記事構成提案 |
| `scripts/auto-improve-agent.js` | `npm run auto-improve` | 全記事の品質スコアリングと改善レポート |

---

## 記事制作フロー

```
1. 検索意図分析
   npm run search-intent -- "地震 備え"
        ↓
2. 記事構成の確認
   出力された「推奨記事構造」を元に執筆計画を立てる
        ↓
3. 執筆
   src/data/disasters/ に JSON ファイルを作成
   必須フィールド: slug / title / summary / lessons / preparedness /
                  relatedSlugs / tags / sources / metaDescription / updatedAt
        ↓
4. 公開
   npm run validate  （ファクトチェック + 型検査）
   npm run build
        ↓
5. 自動改善
   npm run auto-improve        # レポート確認
   npm run auto-improve:fix    # 自動修正実行
```

---

## 各コマンドの使い方

### 検索意図エージェント

```bash
# 基本
node scripts/search-intent-agent.js "停電 対策"

# npm scripts 経由
npm run search-intent -- "洪水 避難 方法"
npm run search-intent -- "地震 vs 台風"
npm run search-intent -- "阪神大震災 歴史"
```

**出力内容:**
- 意図タイプ（情報型 / 問題解決型 / 行動型 / 比較型）
- ユーザー状況の説明
- 緊急度（高 / 中 / 低）
- SEO最適タイトル案
- 導入文の方向性
- H2見出し構成（7本）
- 最初に答えるべき内容

**意図分類の判定基準:**

| パターン例 | 分類 |
|---|---|
| `○○ 対策` / `○○ 方法` / `○○ が来たら` | 問題解決型 |
| `○○ 歴史` / `○○ 死者` / `○○ とは` | 情報型 |
| `避難 方法` / `備蓄` / `チェックリスト` | 行動型 |
| `○○ vs ○○` / `どちらがいい` / `比較` | 比較型 |

---

### 自動改善エージェント

```bash
# レポートのみ（ファイル変更なし）
node scripts/auto-improve-agent.js
npm run auto-improve

# 自動修正も実行
node scripts/auto-improve-agent.js --fix
npm run auto-improve:fix
```

**スコア算出基準（100点満点）:**

| 項目 | 条件 | 点数 |
|---|---|---|
| relatedSlugs | 3件未満 | -10点 |
| lessons | 3件未満 | -10点 |
| preparedness | 3件未満 | -10点 |
| summary | 100文字未満 | -20点 |
| metaDescription | 50〜160文字 | +10点 |
| metaDescription | 範囲外 | -10点 |
| sources | 2件未満 | -15点 |
| tags | 3件未満 | -10点 |
| updatedAt | 90日以内 | +10点 |

**`--fix` で自動修正できる項目:**
- `relatedSlugs` が少ない場合: 同じ `type` の記事スラッグを自動追加
- `tags` が少ない場合: `type` と `region` から自動生成

**手動対応が必要な項目:**
- `lessons` / `preparedness` の内容追加
- `summary` の文章拡充
- `sources` の URL追加
- `metaDescription` の文章修正

---

## YMYLルール遵守事項

saigaishi-navi は防災・安全情報を扱う **YMYL（Your Money or Your Life）ジャンル** のサイトです。
検索エンジンはこのジャンルに対して特に高い品質基準（E-E-A-T）を求めます。

### 必須ルール

1. **誇張表現の禁止**
   - NG: 「これをしないと命の危険がある」「絶対に助かる方法」
   - OK: 「○○のリスクを軽減できる可能性がある」「専門家が推奨する対策」

2. **不安を煽らない**
   - NG: 「もう時間がない」「あなたの家は危険かもしれない」
   - OK: 「事前の備えがあれば被害を最小限にできる」

3. **根拠の明示**
   - `sources` には内閣府・気象庁・消防庁・総務省などの公的機関ページを必ず含める
   - 統計数値には出典を明記する

4. **正確性の優先**
   - 不確かな情報は「〜とされている」「〜の可能性がある」と表現する
   - 記事公開後も `updatedAt` を管理し、古い情報は定期的に更新する

5. **専門性の担保**
   - `lessons` は実際の災害事例から導かれた教訓に限定する
   - 医療・救急に関する記述は専門家の見解を引用する

---

## 記事 JSON 必須フィールド

```json
{
  "slug": "example-disaster-2024",
  "title": "記事タイトル",
  "date": "2024-01-01",
  "country": "japan",
  "region": "地域名",
  "type": "earthquake",
  "summary": "100文字以上の概要文",
  "lessons": ["教訓1", "教訓2", "教訓3"],
  "preparedness": ["対策1", "対策2", "対策3"],
  "relatedSlugs": ["関連slug1", "関連slug2", "関連slug3"],
  "tags": ["タグ1", "タグ2", "タグ3"],
  "sources": [
    { "title": "出典タイトル", "url": "https://..." },
    { "title": "出典タイトル2" }
  ],
  "metaDescription": "50〜160文字のメタ説明文",
  "publishedAt": "2024-01-01",
  "updatedAt": "2024-01-01"
}
```

---

## 推奨運用スケジュール

| 頻度 | 作業 |
|---|---|
| 記事作成前 | `npm run search-intent -- "キーワード"` で意図分析 |
| 記事作成後 | `npm run validate` でファクトチェック |
| 月1回 | `npm run auto-improve` でスコアレポート確認 |
| 四半期ごと | `npm run auto-improve:fix` で自動修正 + 手動改善 |
