'use client'

import { useState } from 'react'
import { Globe } from 'lucide-react'
import { cn } from '@/lib/utils'

export const PROJECT_COLORS = [
  'bg-linear-to-br from-green-100 to-green-300',
  'bg-linear-to-br from-blue-100 to-blue-300',
  'bg-linear-to-br from-violet-100 to-violet-300',
  'bg-linear-to-br from-rose-100 to-rose-300',
  'bg-linear-to-br from-amber-100 to-amber-300',
  'bg-linear-to-br from-emerald-100 to-emerald-300',
]

export function ProjectScreenshot({ url, color }: { url: string; color?: number }) {
  const [errored, setErrored] = useState(false)
  const thumbUrl = `https://s.wordpress.com/mshots/v1/${encodeURIComponent(url)}?w=800&h=500`
  const bg = PROJECT_COLORS[color ?? 0] ?? PROJECT_COLORS[0]

  return (
    <div className="w-full h-36 overflow-hidden relative flex-shrink-0">
      <div className={cn('pt-3 px-3 w-full h-full', bg)}>
        {!errored ? (
          <img
            src={thumbUrl}
            alt=""
            className="w-full h-full object-cover object-top rounded-t-md"
            onError={() => setErrored(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-400">
            <Globe className="w-6 h-6" />
            <span className="text-[11px]">No preview</span>
          </div>
        )}
      </div>
    </div>
  )
}
