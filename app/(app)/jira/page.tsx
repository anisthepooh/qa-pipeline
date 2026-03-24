'use client'

import { useState } from 'react'
import { redirect } from 'next/navigation'
import { usePipeline } from '@/context/PipelineContext'
import JiraTicket from '@/components/JiraTicket'
import { formatJiraTicket } from '@/lib/jiraFormatter'
import { Button } from '@/components/ui/button'
import { Copy, Check, Ticket } from 'lucide-react'

const SEV_ORDER: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 }

export default function JiraPage() {
  const { state } = usePipeline()
  const { activeRun } = state
  const [allCopied, setAllCopied] = useState(false)

  if (!activeRun) {
    redirect('/setup')
  }

  const findings = [...(activeRun.findings || [])].sort(
    (a, b) => (SEV_ORDER[a.severity] ?? 4) - (SEV_ORDER[b.severity] ?? 4)
  )

  if (findings.length === 0) {
    return (
      <div className="p-7 text-center">
        <Ticket className="w-10 h-10 mx-auto mb-3 text-gray-300 opacity-30" />
        <p className="text-sm text-gray-400">No tickets to show. Generate a report with findings first.</p>
      </div>
    )
  }

  const copyAll = () => {
    const all = findings.map(formatJiraTicket).join('\n\n')
    navigator.clipboard.writeText(all).then(() => {
      setAllCopied(true)
      setTimeout(() => setAllCopied(false), 2000)
    })
  }

  return (
    <div className="p-7 max-w-3xl fade-in">
      <div className="flex items-center justify-between mb-5">
        <div className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
          {findings.length} ticket{findings.length !== 1 ? 's' : ''}
        </div>
        <Button variant="outline" size="sm" onClick={copyAll}>
          {allCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {allCopied ? 'Copied all!' : 'Copy all tickets'}
        </Button>
      </div>
      {findings.map(f => <JiraTicket key={f.id} finding={f} />)}
    </div>
  )
}
