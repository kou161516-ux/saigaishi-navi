# 新規記事追加ワークフロー

## 概要
新規記事をデータベースに追加する際の標準手順書です。
品質・整合性・SEO・収益性を同時に担保します。

---

## STEP 1: 記事候補の選定（人間判断）

### 確認チェックリスト
- [ ] DB拡張エージェントの優先候補リストに含まれているか
- [ ] 既存49記事と重複していないか（slug・タイトル両方を確認）
- [ ] 出典となる信頼できる公的資料があるか
- [ ] 多言語展開の可能性があるか

### 優先基準
1. deaths > 10,000 の大規模災害
2. 日本の記事が不足しているtype（flood・landslide・heatwave等）
3. 世界の記事で教訓性が高いもの
4. 採用サイト（消防・警察・自衛隊）との連携可能なもの

---

## STEP 2: JSONファイル作成

### ファイルパス
`src/data/disasters/{slug}.json`

### 必須フィールド一覧
```json
{
  "slug": "kebab-case-英数字のみ",
  "title": "記事タイトル（日本語）",
  "titleEn": "Article Title in English",
  "type": "earthquake|tsunami|typhoon|flood|landslide|volcano|heatwave|fire|other",
  "country": "japan|usa|china|india|indonesia|other",
  "date": "YYYY-MM-DD",
  "deaths": 0,
  "description": "概要文（200〜400字）",
  "descriptionEn": "Summary in English",
  "tags": ["タグ1", "タグ2"],
  "relatedSlugs": [],
  "affiliateCategory": "earthquake-kit|water-storage|power-supply|flood-kit|other",
  "sources": [
    { "title": "出典タイトル", "url": "https://...", "publisher": "発行機関" }
  ],
  "lessons": ["教訓1", "教訓2"],
  "createdAt": "YYYY-MM-DD",
  "updatedAt": "YYYY-MM-DD"
}
```

---

## STEP 3: 自動検証（必須）

```bash
# ファクトチェック（JSON整合性確認）
npm run fact-check:verbose

# 内部リンク整合性確認
npm run internal-link

# エラーが出た場合は修正してから次へ進む
```

---

## STEP 4: 内部リンク設定

### 手順
1. `npm run internal-link` でクラスター分析結果を確認
2. 同typeの記事からrelatedSlugsを3〜5件選定
3. 双方向リンクを設定（相手記事のrelatedSlugsにもこの記事のslugを追加）
4. 最大8件を超えていないか確認

### 自動補完オプション
```bash
npm run internal-link:fix
# 孤立記事（relatedSlugs 2件以下）を自動補完
```

---

## STEP 5: 収益設定

### 確認事項
- affiliateCategoryが記事typeに適合しているか
- `npm run revenue` で収益スコアを確認
- 高スコア（70点以上）なら記事本文にCTA配置を検討

### 商品マッピング早見表
| type | 推奨affiliateCategory | 代表商品 |
|------|----------------------|---------|
| earthquake | earthquake-kit | 防災リュック・家具固定 |
| tsunami | water-storage | 保存水・防水バッグ |
| typhoon | power-supply | ポータブル電源・養生テープ |
| flood | flood-kit | 防水グッズ・長靴 |
| heatwave | water-storage | 経口補水液・遮光グッズ |

---

## STEP 6: 最終確認

```bash
# 全エージェント一括実行
npm run agent:all

# ビルドエラーがないか確認
npm run build
```

### 完了チェックリスト
- [ ] ファクトチェックエラー0件
- [ ] 内部リンク整合性OK（relatedSlugsの記事が全件存在する）
- [ ] 双方向リンクが設定されている
- [ ] 収益スコアを確認済み
- [ ] ビルドが正常に完了する
- [ ] logs/に今日のレポートが生成されている

---

## 注意事項
- 出典URLは必ずhttpsで記載すること
- deathsが不明な場合は0ではなく-1を入力（-1 = 不明）
- 「薄い記事」（lessons 1件・description 100字未満）は公開禁止
- YMYL観点から根拠のない数値・情報は絶対に記載しない
