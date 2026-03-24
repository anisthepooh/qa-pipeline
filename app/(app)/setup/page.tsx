'use client'

import { useState, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { usePipeline } from '@/context/PipelineContext'
import { buildPrompt } from '@/lib/promptBuilder'
import { DEMO_RUN } from '@/lib/demoData'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import StoryItem from '@/components/StoryItem'
import StatCard from '@/components/StatCard'
import { cn } from '@/lib/utils'
import { Config, Story, RunResult } from '@/types'
import {
  Settings, Tag, BookOpen, ClipboardList, Play, Copy, Check,
  Zap, ChevronDown, ChevronUp, AlertCircle, ArrowRight, ArrowLeft,
  Loader2, X, CheckCircle2, XCircle, MinusCircle,
} from 'lucide-react'

const STEPS = [
  { label: 'Configuration', description: 'Target URL and settings' },
  { label: 'User Stories', description: 'Define test scenarios' },
  { label: 'Run', description: 'Generate prompt and results' },
]

const CATEGORIES = [
  { id: 'flow', label: 'User flow validity' },
  { id: 'deadend', label: 'Dead-ends & navigation' },
  { id: 'bugs', label: 'Bugs & failures' },
  { id: 'ux', label: 'UX best practices' },
  { id: 'design', label: 'Design cohesion' },
  { id: 'a11y', label: 'Accessibility (basic)' },
]

function Stepper({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-start px-7 py-5 bg-white border-b border-gray-200">
      {STEPS.map((step, i) => (
        <div key={i} className="flex items-start flex-1">
          <div className="flex flex-col items-center gap-1.5 shrink-0">
            <div className={cn(
              'w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors',
              i < currentStep
                ? 'bg-gray-900 text-white'
                : i === currentStep
                  ? 'bg-gray-900 text-white ring-4 ring-gray-100'
                  : 'bg-gray-100 text-gray-400'
            )}>
              {i < currentStep ? <Check className="w-3.5 h-3.5" /> : i + 1}
            </div>
            <div className="text-center">
              <div className={cn('text-[12px] font-semibold whitespace-nowrap', i <= currentStep ? 'text-gray-900' : 'text-gray-400')}>
                {step.label}
              </div>
              <div className={cn('text-[10px] whitespace-nowrap', i <= currentStep ? 'text-gray-500' : 'text-gray-300')}>
                {step.description}
              </div>
            </div>
          </div>
          {i < STEPS.length - 1 && (
            <div className={cn('flex-1 h-px mt-3.5 mx-3 transition-colors', i < currentStep ? 'bg-gray-900' : 'bg-gray-200')} />
          )}
        </div>
      ))}
    </div>
  )
}

function StepConfig({ config, dispatch }: { config: Config; dispatch: React.Dispatch<{ type: 'SET_CONFIG'; payload: Partial<Config> }> }) {
  const set = (key: keyof Config, val: unknown) => dispatch({ type: 'SET_CONFIG', payload: { [key]: val } as Partial<Config> })

  const toggleCategory = (id: string) => {
    const cats = config.categories.includes(id)
      ? config.categories.filter(c => c !== id)
      : [...config.categories, id]
    set('categories', cats)
  }

  return (
    <div className="space-y-5">
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-3">
          <div className="w-7 h-7 rounded-md bg-gray-100 text-gray-500 flex items-center justify-center flex-shrink-0">
            <Settings className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">Test target</div>
            <div className="text-xs text-gray-500">URL and session info for this test run</div>
          </div>
        </div>
        <div className="px-5 py-5 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="url">Application URL</Label>
            <Input id="url" type="url" placeholder="https://app.yourproduct.com" value={config.url} onChange={e => set('url', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="runName">Test run name</Label>
              <Input id="runName" placeholder="Sprint 42 — Checkout flow" value={config.runName} onChange={e => set('runName', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tester">Tester</Label>
              <Input id="tester" placeholder="Your name or team" value={config.tester} onChange={e => set('tester', e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-3">
          <div className="w-7 h-7 rounded-md bg-gray-100 text-gray-500 flex items-center justify-center flex-shrink-0">
            <Tag className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">Test categories</div>
            <div className="text-xs text-gray-500">What Claude will evaluate on each user flow</div>
          </div>
        </div>
        <div className="px-5 py-5">
          <div className="grid grid-cols-2 gap-2.5">
            {CATEGORIES.map(cat => {
              const checked = config.categories.includes(cat.id)
              return (
                <label key={cat.id} className={cn(
                  'flex items-center gap-2.5 px-3 py-2.5 rounded-md border cursor-pointer text-sm font-medium transition-all duration-150',
                  checked ? 'border-gray-900 bg-gray-50 text-gray-900' : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                )}>
                  <input type="checkbox" className="rounded" checked={checked} onChange={() => toggleCategory(cat.id)} />
                  {cat.label}
                </label>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

type AnyDispatch = React.Dispatch<{ type: string; payload: unknown }>

function StepStories({ stories, dispatch }: { stories: Story[]; dispatch: AnyDispatch }) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')

  const addStory = () => {
    if (!title.trim() && !body.trim()) return
    dispatch({ type: 'ADD_STORY', payload: { title: title.trim() || 'Untitled story', body: body.trim() } })
    setTitle('')
    setBody('')
  }

  const removeStory = (i: number) => dispatch({ type: 'REMOVE_STORY', payload: i })

  return (
    <div className="space-y-5">
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-3">
          <div className="w-7 h-7 rounded-md bg-gray-100 text-gray-500 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">Add user stories</div>
            <div className="text-xs text-gray-500">Plain prose, bullet points, or Gherkin — any format works</div>
          </div>
        </div>
        <div className="px-5 py-5 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="story-title">Story title</Label>
            <Input
              id="story-title"
              placeholder="e.g. User completes checkout with saved card"
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addStory()}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="story-body">Steps / description</Label>
            <Textarea
              id="story-body"
              rows={5}
              placeholder={`As a logged-in user, I want to add a product to cart and complete checkout.\n\n1. Navigate to /products\n2. Click 'Add to cart' on any product\n3. Click the cart icon\n4. Click 'Proceed to checkout'\n5. Click 'Place order'\n6. Expect: order confirmation screen`}
              value={body}
              onChange={e => setBody(e.target.value)}
            />
          </div>
          <Button size="sm" onClick={addStory}>+ Add story</Button>
        </div>
      </div>

      {stories.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <ClipboardList className="w-9 h-9 mx-auto mb-3 opacity-25" />
          <p className="text-sm">No stories added yet. Add at least one to continue.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {stories.map((s, i) => (
            <StoryItem key={i} story={s} index={i} onRemove={removeStory} />
          ))}
        </div>
      )}
    </div>
  )
}

interface ProgressItem {
  tcId: string
  title: string
  status: string
  findingsCount?: number
  errorMsg?: string
}

const STATUS_ICON: Record<string, React.ReactNode> = {
  running: <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />,
  PASS: <CheckCircle2 className="w-4 h-4 text-green-500" />,
  FAIL: <XCircle className="w-4 h-4 text-red-500" />,
  PARTIAL: <MinusCircle className="w-4 h-4 text-amber-500" />,
  error: <XCircle className="w-4 h-4 text-red-400" />,
}

function StepRun({ config, stories, dispatch, router }: {
  config: Config
  stories: Story[]
  dispatch: AnyDispatch
  router: ReturnType<typeof useRouter>
}) {
  const [runStatus, setRunStatus] = useState<'idle' | 'running' | 'error'>('idle')
  const [progress, setProgress] = useState<ProgressItem[]>([])
  const [runError, setRunError] = useState('')
  const xhrRef = useRef<AbortController | null>(null)

  const [showManual, setShowManual] = useState(false)
  const [jsonInput, setJsonInput] = useState('')
  const [parseError, setParseError] = useState('')
  const [promptCopied, setPromptCopied] = useState(false)
  const [promptExpanded, setPromptExpanded] = useState(false)

  const prompt = useMemo(() => {
    if (!config.url || stories.length === 0) return null
    return buildPrompt(config, stories)
  }, [config, stories])

  const startRun = () => {
    setRunStatus('running')
    dispatch({ type: 'SET_RUNNING', payload: true })
    setProgress(stories.map((s, i) => ({
      tcId: `TC-${String(i + 1).padStart(2, '0')}`,
      title: s.title,
      status: 'pending',
    })))
    setRunError('')

    const ctrl = new AbortController()
    xhrRef.current = ctrl

    fetch('/api/run-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ config, stories, geminiApiKey: localStorage.getItem('gemini_api_key') || undefined }),
      signal: ctrl.signal,
    }).then(async res => {
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

          if (evt.type === 'test_start') {
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
    }).catch(err => {
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

  const copyPrompt = () => {
    if (!prompt) return
    navigator.clipboard.writeText(prompt).then(() => {
      setPromptCopied(true)
      setTimeout(() => setPromptCopied(false), 2000)
    })
  }

  const loadDemo = () => {
    setJsonInput(JSON.stringify(DEMO_RUN, null, 2))
    setParseError('')
  }

  const generateReport = async () => {
    setParseError('')
    const raw = jsonInput.trim()
    if (!raw) { setParseError('Paste Claude results JSON first.'); return }
    let data: Record<string, unknown>
    try { data = JSON.parse(raw) } catch (e: unknown) { setParseError(`Invalid JSON: ${e instanceof Error ? e.message : e}`); return }
    try {
      const res = await fetch('/api/runs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      const { id } = await res.json()
      data.id = id
    } catch { /* non-blocking */ }
    dispatch({ type: 'SET_ACTIVE_RUN', payload: data })
    router.push('/report')
  }

  const canRun = config.url && stories.length > 0

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-4 gap-3">
        <StatCard value={stories.length} label="Test cases" />
        <StatCard value={config.categories.length} label="Categories" />
        <StatCard value={config.url ? '✓' : '—'} label="Target URL" color={config.url ? 'green' : 'default'} />
        <StatCard value="~2m" label="Est. per story" />
      </div>

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
              {!canRun && <span className="text-xs text-gray-400">Add a URL and at least one story first</span>}
            </div>
          )}

          {runStatus === 'running' && (
            <div className="space-y-3">
              <div className="space-y-2">
                {progress.map(p => (
                  <div key={p.tcId} className="flex items-center gap-3 py-1">
                    <span className="flex-shrink-0">
                      {STATUS_ICON[p.status] || <div className="w-4 h-4 rounded-full border-2 border-gray-200" />}
                    </span>
                    <span className="text-sm text-gray-700 flex-1">{p.tcId} — {p.title}</span>
                    {p.status === 'running' && <span className="text-[11px] text-gray-400">Analysing…</span>}
                    {(p.status === 'PASS' || p.status === 'FAIL' || p.status === 'PARTIAL') && (
                      <span className="text-[11px] text-gray-400">{p.findingsCount ?? 0} finding{p.findingsCount !== 1 ? 's' : ''}</span>
                    )}
                    {p.status === 'error' && <span className="text-[11px] text-red-400 truncate max-w-[160px]">{p.errorMsg}</span>}
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={cancelRun}>
                <X className="w-3.5 h-3.5" />
                Cancel
              </Button>
            </div>
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

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <button
          className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-gray-50 transition-colors"
          onClick={() => setShowManual(v => !v)}
        >
          <span className="text-sm font-medium text-gray-500">Manual mode (copy-paste)</span>
          {showManual ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>

        {showManual && (
          <div className="border-t border-gray-200 space-y-5 p-5">
            <div>
              <div className="text-xs font-medium text-gray-500 mb-2">Generated prompt</div>
              {prompt ? (
                <>
                  <pre className={`prompt-scroll bg-gray-50 border border-gray-200 rounded-md p-3.5 text-xs font-mono text-gray-600 leading-relaxed whitespace-pre-wrap overflow-auto ${promptExpanded ? 'max-h-none' : 'max-h-40'}`}>
                    {prompt}
                  </pre>
                  <div className="flex items-center gap-2 mt-2">
                    <Button onClick={copyPrompt} size="sm">
                      {promptCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {promptCopied ? 'Copied!' : 'Copy prompt'}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setPromptExpanded(v => !v)}>
                      {promptExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      {promptExpanded ? 'Collapse' : 'Expand'}
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-400">Add a URL and story first.</p>
              )}
            </div>

            <div>
              <div className="text-xs font-medium text-gray-500 mb-2">Paste Claude&apos;s JSON output</div>
              <Textarea
                rows={8}
                placeholder={`{\n  "run": { "name": "...", "url": "..." },\n  "summary": { ... },\n  "findings": [...]\n}`}
                value={jsonInput}
                onChange={e => { setJsonInput(e.target.value); setParseError('') }}
                className="font-mono text-xs"
              />
              {parseError && (
                <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 mt-2">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  {parseError}
                </div>
              )}
              <div className="flex items-center gap-2 mt-2">
                <Button onClick={generateReport}>Generate report →</Button>
                <Button variant="outline" size="sm" onClick={loadDemo}>Load demo</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SetupPage() {
  const [step, setStep] = useState(0)
  const { state, dispatch } = usePipeline()
  const { config, stories } = state
  const router = useRouter()

  const canAdvance = [
    true,
    stories.length > 0,
    true,
  ]

  return (
    <div className="fade-in">
      <Stepper currentStep={step} />

      <div className="p-7 max-w-2xl space-y-5">
        {step === 0 && <StepConfig config={config} dispatch={dispatch} />}
        {step === 1 && <StepStories stories={stories} dispatch={dispatch as AnyDispatch} />}
        {step === 2 && <StepRun config={config} stories={stories} dispatch={dispatch as AnyDispatch} router={router} />}

        <div className="flex items-center gap-3 pt-1">
          {step > 0 && (
            <Button variant="outline" onClick={() => setStep(s => s - 1)}>
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          )}
          {step < STEPS.length - 1 && (
            <Button onClick={() => setStep(s => s + 1)} disabled={!canAdvance[step]}>
              Continue
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
