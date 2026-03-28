'use client'

import { useState, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Play, Zap, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import StatCard from '@/components/StatCard'
import { buildPrompt } from '@/lib/promptBuilder'
import { DEMO_RUN } from '@/lib/demoData'
import { Config, Story } from '@/types'
import { ProgressItem } from '../../app/constants/constants'
import RunProgress from './RunProgress'
import ManualMode from './ManualMode'

type AnyDispatch = React.Dispatch<{ type: string; payload: unknown }>

interface Props {
  config: Config
  stories: Story[]
  dispatch: AnyDispatch
  router: ReturnType<typeof useRouter>
}

export default function StepRun({ config, stories, dispatch, router }: Props) {
  const [runStatus, setRunStatus] = useState<'idle' | 'running' | 'error'>('idle')
  const [progress, setProgress] = useState<ProgressItem[]>([])
  const [runError, setRunError] = useState('')
  const [showManual, setShowManual] = useState(false)
const xhrRef = useRef<AbortController | null>(null)

  const canRun = Boolean(config.url && stories.length > 0)

  const prompt = useMemo(
    () => (config.url && stories.length > 0 ? buildPrompt(config, stories) : null),
    [config, stories]
  )

  const startRun = () => {
    setRunStatus('running')
    dispatch({ type: 'SET_RUNNING', payload: true })
    setProgress(stories.map((s, i) => ({
      tcId: `TC-${String(i + 1).padStart(2, '00')}`,
      title: s.title,
      status: 'pending',
    })))
    setRunError('')

    const ctrl = new AbortController()
    xhrRef.current = ctrl

    fetch('/api/run-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        config,
        stories,
        aiProvider:       localStorage.getItem('ai_provider') ?? 'gemini',
        geminiApiKey:     localStorage.getItem('gemini_api_key') ?? undefined,
        openrouterApiKey: localStorage.getItem('openrouter_api_key') ?? undefined,
        openrouterModel:  localStorage.getItem('openrouter_model') ?? undefined,
      }),
      signal: ctrl.signal,
    })
      .then(async res => {
        if (!res.ok) {
          const { error } = await res.json().catch(() => ({ error: res.statusText }))
          setRunError(error || 'Server error')
          setRunStatus('error')
          dispatch({ type: 'SET_RUNNING', payload: false })
          return
        }

        const reader = res.body!.getReader()
        const decoder = new TextDecoder()
        let buf = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buf += decoder.decode(value, { stream: true })
          const lines = buf.split('\n')
          buf = lines.pop()!

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            let evt: Record<string, unknown>
            try { evt = JSON.parse(line.slice(6)) } catch { continue }

            if (evt.type === 'step') {
              setProgress(prev => prev.map(p => p.tcId === evt.tcId ? { ...p, currentStep: evt.reason as string } : p))
            } else if (evt.type === 'test_start') {
              setProgress(prev => prev.map(p => p.tcId === evt.tcId ? { ...p, status: 'running' } : p))
            } else if (evt.type === 'test_done') {
              setProgress(prev => prev.map(p => p.tcId === evt.tcId ? { ...p, status: evt.status as string, findingsCount: evt.findingsCount as number } : p))
            } else if (evt.type === 'test_error') {
              setProgress(prev => prev.map(p => p.tcId === evt.tcId ? { ...p, status: 'error', errorMsg: evt.message as string } : p))
            } else if (evt.type === 'complete') {
              dispatch({ type: 'SET_RUNNING', payload: false })
              dispatch({ type: 'SET_ACTIVE_RUN', payload: evt.result })
              router.push('/report')
            } else if (evt.type === 'error') {
              dispatch({ type: 'SET_RUNNING', payload: false })
              setRunError(evt.message as string)
              setRunStatus('error')
            }
          }
        }
      })
      .catch(err => {
        dispatch({ type: 'SET_RUNNING', payload: false })
        if (err.name !== 'AbortError') {
          setRunError(err.message)
          setRunStatus('error')
        }
      })
  }

  const cancelRun = () => {
    xhrRef.current?.abort()
    dispatch({ type: 'SET_RUNNING', payload: false })
    setRunStatus('idle')
    setProgress([])
  }

  const generateReport = async (raw: string) => {
    let data: Record<string, unknown> = JSON.parse(raw)
    try {
      const res = await fetch('/api/runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const { id } = await res.json()
      data.id = id
    } catch { /* non-blocking */ }
    dispatch({ type: 'SET_ACTIVE_RUN', payload: data })
    router.push('/report')
  }

  return (
    <div className="space-y-5">
      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-3">
        <StatCard value={stories.length} label="Test cases" />
        <StatCard value={config.categories.length} label="Categories" />
        <StatCard value={config.url ? '✓' : '—'} label="Target URL" color={config.url ? 'green' : 'default'} />
        <StatCard value="~2m" label="Est. per story" />
      </div>

      {/* Automated run */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-3">
          <div className="w-7 h-7 rounded-md bg-gray-100 text-gray-500 flex items-center justify-center flex-shrink-0">
            <Zap className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-gray-900">Run with Claude</div>
            <div className="text-xs text-gray-500">Playwright opens the app, Claude analyses each screen</div>
          </div>
        </div>

        <div className="px-5 py-5 space-y-4">
          {runStatus === 'idle' && (
            <div className="flex items-center gap-3">
              <Button onClick={startRun} disabled={!canRun}>
                <Play className="w-4 h-4" />
                Start automated run
              </Button>
              {!canRun && (
                <span className="text-xs text-gray-400">Add a URL and at least one story first</span>
              )}
            </div>
          )}

          {runStatus === 'running' && (
            <RunProgress progress={progress} onCancel={cancelRun} />
          )}

          {runStatus === 'error' && (
            <div className="space-y-3">
              <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                {runError}
              </div>
              <Button variant="outline" size="sm" onClick={() => { setRunStatus('idle'); setProgress([]) }}>
                Try again
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Manual / copy-paste mode */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <button
          className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-gray-50 transition-colors"
          onClick={() => setShowManual(v => !v)}
        >
          <span className="text-sm font-medium text-gray-500">Manual mode (copy-paste)</span>
          {showManual
            ? <ChevronUp className="w-4 h-4 text-gray-400" />
            : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>

        {showManual && (
          <div className="border-t border-gray-200 p-5">
            <ManualMode
              prompt={prompt}
              onGenerateReport={generateReport}
              onLoadDemo={() => JSON.stringify(DEMO_RUN, null, 2)}
            />
          </div>
        )}
      </div>
    </div>
  )
}
