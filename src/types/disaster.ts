export type DisasterType =
  | 'earthquake'
  | 'tsunami'
  | 'typhoon'
  | 'flood'
  | 'landslide'
  | 'volcano'
  | 'fire'
  | 'snowstorm'
  | 'heatwave'
  | 'other'

export type CountryCode = 'japan' | 'world' | string

export interface DisasterData {
  slug: string
  title: string
  titleEn?: string
  date: string         // YYYY-MM-DD
  country: CountryCode
  region: string       // 発生地域
  type: DisasterType
  magnitude?: string   // 地震規模等
  deaths?: number
  missing?: number
  injured?: number
  buildings?: string   // 建物被害
  economicLoss?: string // 被害額
  summary: string      // 概要（200字程度）
  background: string   // 原因・背景
  socialContext?: string // 当時の社会状況
  damage: string       // 被害詳細
  lifeline?: string    // ライフライン影響
  lessons: string[]    // 教訓（箇条書き）
  preparedness: string[] // 今に活かす備え（箇条書き）
  affiliateCategory: 'water' | 'power' | 'evacuation' | 'indoor' | 'general'
  relatedSlugs?: string[]
  tags: string[]
  sources: { title: string; url?: string }[]
  featured: boolean
  publishedAt: string  // ISO date
  updatedAt?: string
  metaDescription?: string
}

export interface AffiliateProduct {
  id: string
  name: string
  description: string
  category: string
  amazonTag: string
  rakutenUrl?: string
  imageUrl?: string
  price?: string
}
