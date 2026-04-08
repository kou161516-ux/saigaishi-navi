'use client'
import { useEffect, useState } from 'react'

interface TocItem {
  id: string
  label: string
}

interface Props {
  items: TocItem[]
}

export default function TableOfContents({ items }: Props) {
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: '0px 0px -70% 0px' }
    )

    items.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [items])

  return (
    <nav className="bg-gray-50 border border-gray-200 rounded-lg p-4 my-6">
      <p className="font-bold text-gray-700 mb-3 text-sm">目次</p>
      <ol className="space-y-2">
        {items.map((item, i) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={`text-sm transition flex items-center gap-2 ${
                activeId === item.id
                  ? 'text-amber-600 font-semibold'
                  : 'text-gray-600 hover:text-amber-600'
              }`}
            >
              <span className="text-xs text-gray-400">{i + 1}.</span>
              {item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
