'use client'
import { useEffect } from 'react'

const ADSENSE_ID = process.env.NEXT_PUBLIC_ADSENSE_ID

interface AdSenseProps {
  slot: string
  format?: 'auto' | 'fluid' | 'rectangle'
  className?: string
}

export default function AdSense({ slot, format = 'auto', className }: AdSenseProps) {
  useEffect(() => {
    try {
      // @ts-expect-error adsbygoogle is not typed
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {}
  }, [])

  if (!ADSENSE_ID) return null

  return (
    <div className={`adsense-container ${className || ''}`}>
      {/* 本番前に slot ID を差し替えてください */}
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={ADSENSE_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  )
}
