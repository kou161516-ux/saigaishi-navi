export const dynamic = 'force-dynamic'

interface ChecklistItem {
  label: string
  description?: string
}

interface ChecklistSection {
  title: string
  items: ChecklistItem[]
}

const checklists: ChecklistSection[] = [
  {
    title: 'YMYLコンテンツ品質チェックリスト',
    items: [
      {
        label: '全記事に公式ソース2件以上',
        description: '気象庁・消防庁・内閣府防災など政府機関・学術機関の出典を必ず含める',
      },
      {
        label: '死者数・被害額は「確定値」または「推計」を明記',
        description: '出典とともに確定値か推計かを必ず記載し、数字の信頼性を担保する',
      },
      {
        label: '誇張表現・センセーショナルな見出しなし',
        description: '「衝撃」「驚愕」「必見」などの煽り表現を使わず、事実に基づいた中立的な表現を使用',
      },
      {
        label: '各記事に教訓4件以上・備え4件以上',
        description: '読者が具体的な行動に移せる実践的な教訓と備えを箇条書きで記載',
      },
      {
        label: 'relatedSlugs 3件以上（内部リンク）',
        description: '関連する災害記事へのリンクを3件以上設定し、サイト内回遊を促進する',
      },
      {
        label: 'metaDescription 50〜160文字',
        description: '検索結果スニペットとして表示されるmetaDescriptionを50〜160文字で設定',
      },
    ],
  },
  {
    title: 'Googleコアアップデート対策チェックリスト',
    items: [
      {
        label: 'JSON-LD構造化データ実装済み',
        description: 'Article・BreadcrumbList・FAQPageなど適切なschema.orgの構造化データを設定',
      },
      {
        label: 'OGP画像・Twitterカード設定済み',
        description: 'og:image・twitter:cardを全ページに設定し、SNSシェア時の見栄えを最適化',
      },
      {
        label: 'E-E-A-T要素の明示（経験・専門性・権威性・信頼性）',
        description: '著者プロフィール・資格・経験年数などE-E-A-T要素をコンテンツに組み込む',
      },
      {
        label: 'コンテンツ更新日・確認日の明記',
        description: 'publishedAt・updatedAtを明示し、情報の新鮮さをGoogleに伝える',
      },
      {
        label: 'ページ速度最適化（Core Web Vitals）',
        description: 'LCP・FID・CLSをGoogleサーチコンソールで定期確認し、問題があれば改善',
      },
      {
        label: 'モバイルフレンドリー対応',
        description: 'スマートフォンで全コンテンツが正しく表示・操作できることを確認',
      },
    ],
  },
  {
    title: '内部リンク最適化チェックリスト',
    items: [
      {
        label: '全記事のrelatedSlugsに3件以上の関連記事を設定',
        description: '同じ災害タイプ・地域・時代の関連記事を優先的に設定する',
      },
      {
        label: 'タグページ・カテゴリページとの連携',
        description: '各記事のタグが4件以上あり、タグページからの流入経路を確保する',
      },
      {
        label: 'トップページから主要記事へのリンク確認',
        description: 'featuredフラグが設定された記事がトップページに適切に表示されているか確認',
      },
      {
        label: '孤立ページ（リンク0件）の排除',
        description: '他記事からリンクされていない孤立ページをスキャンして内部リンクを追加',
      },
      {
        label: 'アンカーテキストの自然さ',
        description: '内部リンクのアンカーテキストがキーワードを含みつつ自然な文章になっているか確認',
      },
      {
        label: 'パンくずリスト実装確認',
        description: '全ページにBreadcrumbListの構造化データが実装され正しく表示されているか確認',
      },
    ],
  },
]

function ChecklistSectionComponent({ section }: { section: ChecklistSection }) {
  return (
    <section className="mb-8 rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="bg-blue-600 px-5 py-3">
        <h2 className="text-base font-semibold text-white">{section.title}</h2>
      </div>
      <ul className="divide-y divide-gray-100">
        {section.items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-3 px-5 py-4">
            <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 border-gray-300 bg-white">
              <span className="text-xs text-gray-400">☐</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">{item.label}</p>
              {item.description && (
                <p className="mt-0.5 text-xs text-gray-500">{item.description}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default function SeoChecklistPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6">
          <a
            href="/admin"
            className="text-sm text-blue-600 hover:underline"
          >
            ← 管理者ダッシュボードへ戻る
          </a>
        </div>
        <h1 className="mb-2 text-2xl font-bold text-gray-900">SEO改善チェックリスト</h1>
        <p className="mb-6 text-sm text-gray-500">
          YMYLコンテンツ品質・Googleコアアップデート対策・内部リンク最適化の確認項目一覧です。
          定期的にチェックしてコンテンツ品質を維持してください。
        </p>

        {checklists.map((section, idx) => (
          <ChecklistSectionComponent key={idx} section={section} />
        ))}

        <div className="mt-6 rounded-lg bg-yellow-50 border border-yellow-200 p-4">
          <h3 className="mb-1 text-sm font-semibold text-yellow-800">定期確認推奨</h3>
          <p className="text-xs text-yellow-700">
            Googleコアアップデートは年3〜4回実施されます。アップデート後はサーチコンソールで
            順位変動を確認し、このチェックリストで品質評価を実施することを推奨します。
          </p>
        </div>
      </div>
    </div>
  )
}
