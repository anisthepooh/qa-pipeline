'use client'

import { useState } from 'react'
import { Check, Copy, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface Props {
  prompt: string | null
  onGenerateReport: (json: string) => void
  onLoadDemo: () => string
}

export default function ManualMode({ prompt, onGenerateReport, onLoadDemo }: Props) {
  const [jsonInput, setJsonInput] = useState('')
  const [parseError, setParseError] = useState('')
  const [promptCopied, setPromptCopied] = useState(false)
  const [promptExpanded, setPromptExpanded] = useState(false)

  const copyPrompt = () => {
    if (!prompt) return
    navigator.clipboard.writeText(prompt).then(() => {
      setPromptCopied(true)
      setTimeout(() => setPromptCopied(false), 2000)
    })
  }

  const loadDemo = () => {
    setJsonInput(onLoadDemo())
    setParseError('')
  }

  const handleGenerate = () => {
    setParseError('')
    const raw = jsonInput.trim()
    if (!raw) {
      setParseError('Paste Claude results JSON first.')
      return
    }
    try {
      JSON.parse(raw) // validate before passing up
    } catch (e: unknown) {
      setParseError(`Invalid JSON: ${e instanceof Error ? e.message : e}`)
      return
    }
    onGenerateReport(raw)
  }

  return (
    <div className="space-y-5">
      {/* Generated prompt */}
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

      {/* JSON input */}
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
          <Button onClick={handleGenerate}>Generate report →</Button>
          <Button variant="outline" size="sm" onClick={loadDemo}>Load demo</Button>
        </div>
      </div>
    </div>
  )
}
