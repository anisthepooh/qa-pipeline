'use client'

import { redirect } from 'next/navigation'
import { usePipeline } from '@/context/PipelineContext'
import FindingCard from '@/components/FindingCard'
import { Search } from 'lucide-react'

const SEV_ORDER: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 }

export default function FindingsPage() {
  const { state } = usePipeline()
  const { activeRun } = state

  if (!activeRun) {
    redirect('/setup')
  }

  const findings = [...(activeRun.findings || [])].sort(
    (a, b) => (SEV_ORDER[a.severity] ?? 4) - (SEV_ORDER[b.severity] ?? 4)
  )

  if (findings.length === 0) {
    return (
      <div className="p-7 text-center">
        <Search className="w-10 h-10 mx-auto mb-3 text-gray-300" />
        <p className="text-sm text-gray-400">No findings in this run.</p>
      </div>
    )
  }

  return (
    <div className="p-7 max-w-3xl fade-in">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-4">
        {findings.length} finding{findings.length !== 1 ? 's' : ''} · sorted by severity
      </div>
      {findings.map(f => <FindingCard key={f.id} finding={f} />)}
    </div>
  )
}
