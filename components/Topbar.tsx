'use client'

import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { usePipeline } from '@/context/PipelineContext'
import { Loader2, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const PAGE_TITLES: Record<string, string> = {
  '/setup': 'New run',
  '/report': 'Report',
  '/findings': 'Findings',
  '/jira': 'Jira tickets',
  '/past-runs': 'Past runs',
}

const OPENROUTER_MODELS = [
  { value: 'google/gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
  { value: 'google/gemini-2.5-pro',   label: 'Gemini 2.5 Pro' },
  { value: 'anthropic/claude-sonnet-4-5', label: 'Claude Sonnet 4.5' },
  { value: 'anthropic/claude-opus-4',     label: 'Claude Opus 4' },
]

interface ProviderOption {
  provider: 'gemini' | 'openrouter'
  model: string
  label: string
}

function getProviderOptions(geminiKey: string | null, openrouterKey: string | null): ProviderOption[] {
  const opts: ProviderOption[] = []
  if (geminiKey) {
    opts.push({ provider: 'gemini', model: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' })
  }
  if (openrouterKey) {
    for (const m of OPENROUTER_MODELS) {
      opts.push({ provider: 'openrouter', model: m.value, label: m.label })
    }
  }
  // Always show Gemini as fallback (uses server key)
  if (opts.length === 0) {
    opts.push({ provider: 'gemini', model: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' })
  }
  return opts
}

export default function Topbar() {
  const pathname = usePathname()
  const { state } = usePipeline()
  const { config, activeRun, isRunning } = state

  const [options, setOptions] = useState<ProviderOption[]>([])
  const [selected, setSelected] = useState<ProviderOption | null>(null)

  useEffect(() => {
    const geminiKey = localStorage.getItem('gemini_api_key')
    const openrouterKey = localStorage.getItem('openrouter_api_key')
    const savedProvider = localStorage.getItem('ai_provider') ?? 'gemini'
    const savedModel = localStorage.getItem('openrouter_model') ?? 'google/gemini-2.5-flash'

    const opts = getProviderOptions(geminiKey, openrouterKey)
    setOptions(opts)

    const match = opts.find(o =>
      o.provider === savedProvider &&
      (savedProvider === 'gemini' || o.model === savedModel)
    ) ?? opts[0]
    setSelected(match)
  }, [])

  const handleSelect = (value: string) => {
    const opt = options.find(o => `${o.provider}:${o.model}` === value)
    if (!opt) return
    setSelected(opt)
    localStorage.setItem('ai_provider', opt.provider)
    if (opt.provider === 'openrouter') {
      localStorage.setItem('openrouter_model', opt.model)
    }
  }

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

      {selected && (
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex items-center gap-1.5 text-[11px] text-gray-500 bg-gray-100 border border-gray-200 rounded-md px-2.5 py-1 hover:bg-gray-200 transition-colors focus:outline-none cursor-pointer">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 text-blue-400">
              <path d="M12 2L9 9H2L7.5 13.5L5.5 21L12 16.5L18.5 21L16.5 13.5L22 9H15L12 2Z" fill="currentColor" />
            </svg>
            {selected.label}
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            {options.some(o => o.provider === 'gemini') && (
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Gemini (direct)</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={`${selected.provider}:${selected.model}`} onValueChange={handleSelect}>
                  {options.filter(o => o.provider === 'gemini').map(o => (
                    <DropdownMenuRadioItem key={`${o.provider}:${o.model}`} value={`${o.provider}:${o.model}`}>
                      {o.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuGroup>
            )}
            {options.some(o => o.provider === 'gemini') && options.some(o => o.provider === 'openrouter') && (
              <DropdownMenuSeparator />
            )}
            {options.some(o => o.provider === 'openrouter') && (
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">OpenRouter</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={`${selected.provider}:${selected.model}`} onValueChange={handleSelect}>
                  {options.filter(o => o.provider === 'openrouter').map(o => (
                    <DropdownMenuRadioItem key={`${o.provider}:${o.model}`} value={`${o.provider}:${o.model}`}>
                      {o.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuGroup>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

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
