'use client'

import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { usePipeline } from '@/context/PipelineContext'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const PAGE_TITLES: Record<string, string> = {
  '/setup': 'New run',
  '/report': 'Report',
  '/findings': 'Findings',
  '/jira': 'Jira tickets',
  '/past-runs': 'Past runs',
}

export default function Topbar() {
  const pathname = usePathname()
  const { state } = usePipeline()
  const { config, activeRun, isRunning } = state
  const [modelLabel, setModelLabel] = useState('gemini-2.5-flash')

  useEffect(() => {
    const p = localStorage.getItem('ai_provider') ?? 'gemini'
    if (p === 'openrouter') {
      const m = localStorage.getItem('openrouter_model') ?? 'google/gemini-2.5-flash'
      setModelLabel(m.split('/').pop() ?? m)
    } else {
      setModelLabel('gemini-2.5-flash')
    }
  }, [])

  const title = PAGE_TITLES[pathname] || 'QA Pipeline'
  const isComplete = !!activeRun && !isRunning

  return (
    <header className="h-12 bg-white border-b border-gray-200 flex items-center gap-3 px-6 sticky top-0 z-10">
      <h2 className="text-[14px] font-semibold text-gray-900">{title}</h2>

      {config.url && (
        <span className="text-xs text-gray-400 bg-gray-100 border border-gray-200 rounded-md px-2.5 py-1 font-mono truncate max-w-[260px]">
          {config.url}
        </span>
      )}

      <div className="flex-1" />

      <span className="inline-flex items-center gap-1.5 text-[11px] text-gray-400 bg-gray-100 border border-gray-200 rounded-md px-2.5 py-1">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 text-blue-400">
          <path d="M12 2L9 9H2L7.5 13.5L5.5 21L12 16.5L18.5 21L16.5 13.5L22 9H15L12 2Z" fill="currentColor" />
        </svg>
        {modelLabel}
      </span>

      <div className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium',
        isRunning
          ? 'bg-blue-50 text-blue-600 border border-blue-200'
          : isComplete
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-gray-100 text-gray-400 border border-gray-200'
      )}>
        {isRunning && <Loader2 className="w-3 h-3 animate-spin" />}
        {isComplete && !isRunning && <span className="w-1.5 h-1.5 rounded-full bg-green-500" />}
        {isRunning ? 'Running…' : isComplete ? 'Complete' : 'Idle'}
      </div>
    </header>
  )
}
