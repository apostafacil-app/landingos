'use client'

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

interface Props {
  pageId: string
  children: React.ReactNode
}

export function ClickableRow({ pageId, children }: Props) {
  const router = useRouter()

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLTableRowElement>) => {
      // Ignore clicks on interactive elements (buttons, links, inputs) inside the row
      const target = e.target as HTMLElement
      if (target.closest('a, button, input, [role="menuitem"], [role="dialog"]')) return
      router.push(`/paginas/${pageId}`)
    },
    [router, pageId],
  )

  return (
    <tr
      onClick={handleClick}
      className="hover:bg-[#f0f4ff] transition-colors cursor-pointer"
    >
      {children}
    </tr>
  )
}
