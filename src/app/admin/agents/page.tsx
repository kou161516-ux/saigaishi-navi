import Link from 'next/link'

export const revalidate = 86400

interface AgentCard {
  id: number
  name: string
  nameEn: string
  script: string
  role: string
  command: string
  frequency: string
  domain: string
  isNew: boolean
  color: 'blue' | 'yellow' | 'teal' | 'green' | 'purple' | 'orange' | 'red' | 'gray'
}

const agents: AgentCard[] = [
  {
    id: 1,
    name: 'ファクトチェッカー',
    nameEn: 'Fact Checker',
    script: 'scripts/fact-check.js',
    role: '全記事のJSONバリデーション・必須フィールド欠損チェック・slug整合性確認',
    command: 'npm run fact-check',
    frequency: '毎週（月曜）/ CI/CD',
    domain: 'データ品質・整合性保証',
    isNew: false,
    color: 'green',
  },
  {
    id: 2,
    name: 'リンクチェッカー',
    nameEn: 'Link Checker',
    script: 'scripts/link-check.js',
    role: '内部リンク（relatedSlugs）の存在確認・外部URLの死活チェック',
    command: 'npm run link-check',
    frequency: '毎週（月曜）',
    domain: 'リンク健全性・404防止',
    isNew: false,
    color: 'green',
  },
  {
    id: 3,
    name: '週次チェックシェル',
    nameEn: 'Weekly Check Shell',
    script: 'scripts/weekly-check.sh',
    role: 'fact-check + link-checkの週次一括実行シェルラッパー',
    command: 'bash scripts/weekly-check.sh',
    frequency: '毎週（月曜 09:00 / launchd自動）',
    domain: '週次品質確認の自動化',
    isNew: false,
    color: 'green',
  },
  {
    id: 4,
    name: '自動更新検出',
    nameEn: 'Auto Update Detector',
    script: 'scripts/auto-update.js',
    role: 'updatedAtが90日以上古い記事を検出し更新候補リストを出力',
    command: 'npm run auto-update',
    frequency: '毎月1日',
    domain: 'コンテンツ鮮度管理・E-E-A-T維持',
    isNew: false,
    color: 'blue',
  },
  {
    id: 5,
    name: '検索意図アナライザー',
    nameEn: 'Search Intent Analyzer',
    script: 'scripts/search-intent-agent.js',
    role: 'KW入力から検索意図（問題解決型/情報収集型/比較型）を分類し記事戦略を提案',
    command: 'npm run search-intent -- --kw "キーワード"',
    frequency: '随時（記事作成前）',
    domain: 'SEO・記事企画・KW分析',
    isNew: false,
    color: 'purple',
  },
  {
    id: 6,
    name: '自動改善エージェント',
    nameEn: 'Auto Improve Agent',
    script: 'scripts/auto-improve-agent.js',
    role: '全記事をスコアリング（100点満点）して改善提案を出力。--fixオプションでrelatedSlugs自動補完',
    command: 'npm run auto-improve',
    frequency: '毎月1日',
    domain: '記事品質スコアリング・自動改善',
    isNew: false,
    color: 'blue',
  },
  {
    id: 7,
    name: '内部リンク戦略エージェント',
    nameEn: 'Internal Linking Strategy Agent',
    script: 'scripts/internal-link-agent.js',
    role: '全記事のrelatedSlugs分析・孤立記事検出・クラスター構造把握・防災ブログ連携提案',
    command: 'npm run internal-link',
    frequency: '毎月1日',
    domain: '内部リンク構造・SEO・サイト回遊率',
    isNew: true,
    color: 'blue',
  },
  {
    id: 8,
    name: '収益最適化エージェント',
    nameEn: 'Revenue Optimization Agent',
    script: 'scripts/revenue-agent.js',
    role: '記事タイプ・タグからアフィリエイト商品適合スコアを算出・収益改善提案を出力',
    command: 'npm run revenue',
    frequency: '毎月1日',
    domain: 'アフィリエイト収益・AdSense最適化',
    isNew: true,
    color: 'yellow',
  },
  {
    id: 9,
    name: 'DB拡張エージェント',
    nameEn: 'Database Expansion Agent',
    script: 'scripts/db-expansion-agent.js',
    role: 'カバレッジ分析・不足記事特定・優先追加候補TOP15・多言語展開ロードマップ出力',
    command: 'npm run db-expansion',
    frequency: '四半期（1月・4月・7月・10月）',
    domain: 'コンテンツ拡張計画・多言語対応・採用サイト連携',
    isNew: true,
    color: 'teal',
  },
  {
    id: 10,
    name: 'エージェントランナー',
    nameEn: 'Agent Runner',
    script: 'scripts/agent-runner.js',
    role: '全エージェントの統合実行・スケジューリング・レポート保存を一括管理する司令塔',
    command: 'npm run agent:all',
    frequency: '随時 / 定期実行（launchd管理）',
    domain: 'オーケストレーション・ログ管理',
    isNew: false,
    color: 'orange',
  },
  {
    id: 11,
    name: '多言語翻訳エージェント',
    nameEn: 'Multilingual Agent',
    script: 'scripts/multilingual-agent.js（計画中）',
    role: '日本語記事から英語・中国語・韓国語・スペイン語等への翻訳・品質確認',
    command: 'npm run multilingual -- --target en',
    frequency: '記事追加時（随時）',
    domain: '多言語SEO・グローバル展開',
    isNew: false,
    color: 'gray',
  },
  {
    id: 12,
    name: 'SNS連携エージェント',
    nameEn: 'SNS Integration Agent',
    script: 'scripts/sns-agent.js（計画中）',
    role: '新規記事・更新記事からX(Twitter)投稿文・YouTube台本素材を自動生成',
    command: 'npm run sns -- --slug {slug}',
    frequency: '記事追加・更新時',
    domain: 'X投稿・YouTube素材・拡散支援',
    isNew: false,
    color: 'gray',
  },
  {
    id: 13,
    name: '採用連携エージェント',
    nameEn: 'Recruitment Linkage Agent',
    script: 'scripts/recruitment-agent.js（計画中）',
    role: '消防・警察・自衛隊採用サイトとの記事連携提案・採用コンテンツ拡張計画',
    command: 'npm run recruitment -- --category firefighter',
    frequency: '四半期',
    domain: '採用サイト連携・公的情報活用',
    isNew: false,
    color: 'gray',
  },
]

const colorMap: Record<AgentCard['color'], { border: string; bg: string; badge: string; text: string; label: string }> = {
  blue: {
    border: 'border-blue-200',
    bg: 'bg-blue-50',
    badge: 'bg-blue-100 text-blue-800',
    text: 'text-blue-700',
    label: 'bg-blue-600',
  },
  yellow: {
    border: 'border-yellow-200',
    bg: 'bg-yellow-50',
    badge: 'bg-yellow-100 text-yellow-800',
    text: 'text-yellow-700',
    label: 'bg-yellow-600',
  },
  teal: {
    border: 'border-teal-200',
    bg: 'bg-teal-50',
    badge: 'bg-teal-100 text-teal-800',
    text: 'text-teal-700',
    label: 'bg-teal-600',
  },
  green: {
    border: 'border-green-200',
    bg: 'bg-green-50',
    badge: 'bg-green-100 text-green-800',
    text: 'text-green-700',
    label: 'bg-green-600',
  },
  purple: {
    border: 'border-purple-200',
    bg: 'bg-purple-50',
    badge: 'bg-purple-100 text-purple-800',
    text: 'text-purple-700',
    label: 'bg-purple-600',
  },
  orange: {
    border: 'border-orange-200',
    bg: 'bg-orange-50',
    badge: 'bg-orange-100 text-orange-800',
    text: 'text-orange-700',
    label: 'bg-orange-600',
  },
  red: {
    border: 'border-red-200',
    bg: 'bg-red-50',
    badge: 'bg-red-100 text-red-800',
    text: 'text-red-700',
    label: 'bg-red-600',
  },
  gray: {
    border: 'border-gray-200',
    bg: 'bg-gray-50',
    badge: 'bg-gray-100 text-gray-600',
    text: 'text-gray-500',
    label: 'bg-gray-400',
  },
}

const calendarData = [
  {
    cycle: '毎日',
    description: 'CI/CDパイプライン',
    agents: ['ファクトチェッカー（コミット時）'],
    color: 'bg-green-100 border-green-300',
  },
  {
    cycle: '毎週（月曜 09:00）',
    description: 'macOS launchd 自動実行',
    agents: ['ファクトチェッカー', 'リンクチェッカー', '週次チェックシェル'],
    color: 'bg-blue-100 border-blue-300',
  },
  {
    cycle: '毎月1日',
    description: '月次品質・改善サイクル',
    agents: ['自動更新検出', '自動改善エージェント', '内部リンク戦略エージェント', '収益最適化エージェント'],
    color: 'bg-yellow-100 border-yellow-300',
  },
  {
    cycle: '四半期（1・4・7・10月）',
    description: '戦略的拡張サイクル',
    agents: ['DB拡張エージェント'],
    color: 'bg-purple-100 border-purple-300',
  },
  {
    cycle: '随時',
    description: '記事作成・更新時',
    agents: ['検索意図アナライザー', 'エージェントランナー'],
    color: 'bg-orange-100 border-orange-300',
  },
]

export default function AgentsPage() {
  const activeAgents = agents.filter((a) => !a.color.includes('gray'))
  const plannedAgents = agents.filter((a) => a.color === 'gray')
  const newAgents = agents.filter((a) => a.isNew)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* ヘッダー */}
        <div className="mb-2 flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">AIエージェント管理センター</h1>
        </div>
        <p className="mb-8 text-sm text-gray-500">
          全13体のAIエージェント一覧・実行ガイド・運用カレンダー
        </p>

        {/* サマリーカード */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs text-gray-500">総エージェント数</p>
            <p className="mt-1 text-3xl font-bold text-gray-900">{agents.length}</p>
          </div>
          <div className="rounded-lg border border-green-200 bg-white p-4 shadow-sm">
            <p className="text-xs text-gray-500">稼働中</p>
            <p className="mt-1 text-3xl font-bold text-green-600">{activeAgents.length}</p>
          </div>
          <div className="rounded-lg border border-blue-200 bg-white p-4 shadow-sm">
            <p className="text-xs text-gray-500">新規追加</p>
            <p className="mt-1 text-3xl font-bold text-blue-600">{newAgents.length}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs text-gray-500">計画中</p>
            <p className="mt-1 text-3xl font-bold text-gray-400">{plannedAgents.length}</p>
          </div>
        </div>

        {/* エージェント連携フロー */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">エージェント連携フロー</h2>
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="overflow-x-auto">
              <pre className="text-xs text-gray-700 leading-6 font-mono whitespace-pre">{`
  [週次自動] ─────────────────────────────────────────────────────
  │
  ├── ファクトチェッカー ──────────── JSONバリデーション・必須フィールド確認
  ├── リンクチェッカー ────────────── relatedSlugs整合性・外部URL死活確認
  └── 週次チェックシェル ──────────── 上記2体を一括ラップ実行
                                               │
                                               v
  [月次自動] ─────────────────────────────────────────────────────
  │
  ├── 自動更新検出 ──────────────── 90日超未更新記事をリストアップ
  ├── 自動改善エージェント ──────── スコア100点採点 → --fix で自動補完
  ├── 内部リンク戦略エージェント [NEW] ── 孤立記事検出 → クラスター最適化
  └── 収益最適化エージェント [NEW] ─── アフィ適合スコア → CTA提案
                                               │
                                               v
  [四半期] ───────────────────────────────────────────────────────
  │
  └── DB拡張エージェント [NEW] ──── カバレッジ分析 → 優先追加候補TOP15
                                               │
                                               v
  [随時] ─────────────────────────────────────────────────────────
  │
  ├── 検索意図アナライザー ──────── KW → 検索意図分類 → 記事戦略
  └── エージェントランナー ──────── 全エージェント統合実行・ログ保存
              `}</pre>
            </div>
          </div>
        </section>

        {/* 稼働中エージェント */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            稼働中エージェント（{activeAgents.length}体）
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeAgents.map((agent) => {
              const c = colorMap[agent.color]
              return (
                <div
                  key={agent.id}
                  className={`rounded-lg border ${c.border} bg-white p-5 shadow-sm`}
                >
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${c.text}`}>
                          #{agent.id} {agent.name}
                        </span>
                        {agent.isNew && (
                          <span className="inline-block rounded-full bg-blue-500 px-2 py-0.5 text-xs font-bold text-white">
                            NEW
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-gray-400">{agent.nameEn}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${c.badge}`}>
                      {agent.frequency.includes('毎週')
                        ? '毎週'
                        : agent.frequency.includes('毎月')
                          ? '毎月'
                          : agent.frequency.includes('四半期')
                            ? '四半期'
                            : '随時'}
                    </span>
                  </div>

                  <p className="mb-3 text-xs text-gray-600 leading-relaxed">{agent.role}</p>

                  <div className={`rounded p-2 ${c.bg} mb-3`}>
                    <p className="text-xs text-gray-500 mb-0.5">コマンド</p>
                    <code className={`text-xs font-mono ${c.text} break-all`}>{agent.command}</code>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                      {agent.domain}
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-gray-400 italic">{agent.script}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* 計画中エージェント */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            計画中エージェント（{plannedAgents.length}体）
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {plannedAgents.map((agent) => (
              <div
                key={agent.id}
                className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm opacity-60"
              >
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-500">
                    #{agent.id} {agent.name}
                  </span>
                  <span className="inline-block rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-500">
                    計画中
                  </span>
                </div>
                <p className="mb-2 text-xs text-gray-400">{agent.nameEn}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{agent.role}</p>
                <p className="mt-2 text-xs text-gray-400">担当: {agent.domain}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 運用カレンダー */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">運用カレンダー</h2>
          <div className="space-y-3">
            {calendarData.map((item) => (
              <div
                key={item.cycle}
                className={`rounded-lg border p-4 ${item.color}`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-40 shrink-0">
                    <p className="font-semibold text-sm text-gray-800">{item.cycle}</p>
                    <p className="text-xs text-gray-500">{item.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {item.agents.map((agent) => (
                      <span
                        key={agent}
                        className="rounded-full bg-white bg-opacity-80 border border-gray-200 px-3 py-1 text-xs text-gray-700"
                      >
                        {agent}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* クイックアクセス */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">エージェント別ダッシュボード</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Link
              href="/admin/internal-links"
              className="group rounded-lg border border-blue-200 bg-white p-5 shadow-sm hover:border-blue-400 hover:shadow-md transition-all"
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="font-semibold text-blue-700 group-hover:text-blue-900">
                  内部リンク戦略
                </span>
                <span className="inline-block rounded-full bg-blue-500 px-2 py-0.5 text-xs font-bold text-white">
                  NEW
                </span>
              </div>
              <p className="text-xs text-gray-500">孤立記事・ハブ候補・クラスター別リンク密度を分析</p>
            </Link>
            <Link
              href="/admin/revenue"
              className="group rounded-lg border border-yellow-200 bg-white p-5 shadow-sm hover:border-yellow-400 hover:shadow-md transition-all"
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="font-semibold text-yellow-700 group-hover:text-yellow-900">
                  収益最適化
                </span>
                <span className="inline-block rounded-full bg-blue-500 px-2 py-0.5 text-xs font-bold text-white">
                  NEW
                </span>
              </div>
              <p className="text-xs text-gray-500">アフィリエイトカテゴリ分布・高収益ポテンシャル記事を分析</p>
            </Link>
            <Link
              href="/admin/db-expansion"
              className="group rounded-lg border border-teal-200 bg-white p-5 shadow-sm hover:border-teal-400 hover:shadow-md transition-all"
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="font-semibold text-teal-700 group-hover:text-teal-900">
                  DB拡張計画
                </span>
                <span className="inline-block rounded-full bg-blue-500 px-2 py-0.5 text-xs font-bold text-white">
                  NEW
                </span>
              </div>
              <p className="text-xs text-gray-500">DBカバレッジ・優先追加候補・多言語展開ロードマップ</p>
            </Link>
          </div>
        </section>

        {/* ナビゲーション */}
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            管理ダッシュボードへ
          </Link>
          <Link
            href="/admin/seo-checklist"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            SEO改善チェックリスト
          </Link>
          <Link
            href="/"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            サイトトップへ
          </Link>
        </div>
      </div>
    </div>
  )
}
