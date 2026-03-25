'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import FindingCard from '@/components/FindingCard'
import StatCard from '@/components/StatCard'
import { formatDate } from '@/lib/utils'
import { RunResult } from '@/types'
import { ArrowLeft, Search } from 'lucide-react'

const SEV_ORDER: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 }

export default function PastRunDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [run, setRun] = useState<RunResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    fetch(`/api/runs/${id}`)
      .then(r => {
        if (!r.ok) { setNotFound(true); setLoading(false); return null }
        return r.json()
      })
      .then((data: RunResult | null) => {
        if (data) setRun(data)
        setLoading(false)
      })
      .catch(() => { setNotFound(true); setLoading(false) })
  }, [id])

  if (loading) {
    return (
      <div className="p-7 space-y-3">
        <div className="h-5 w-32 bg-gray-100 rounded animate-pulse" />
        <div className="h-8 w-64 bg-gray-100 rounded animate-pulse" />
        <div className="grid grid-cols-4 gap-3 mt-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />)}
        </div>
        <div className="space-y-3 mt-4">
          {[1, 2, 3].map(i => <div key={i} className="h-28 bg-gray-100 rounded-lg animate-pulse" />)}
        </div>
      </div>
    )
  }

  if (notFound || !run) {
    return (
      <div className="p-7 text-center">
        <p className="text-sm text-gray-400 mb-3">Run not found.</p>
        <Link href="/past-runs" className="text-xs text-blue-500 hover:underline">← Back to runs</Link>
      </div>
    )
  }

  const { summary = {} as typeof run.summary, findings = [] } = run
  const passed = summary.passed ?? 0
  const failed = summary.failed ?? 0
  const partial = summary.partial ?? 0
  const totalFindings = summary.total_findings ?? findings.length

  const bySeverity = summary.by_severity || {}
  const critCount = bySeverity.critical ?? findings.filter(f => f.severity === 'critical').length
  const highCount = bySeverity.high ?? findings.filter(f => f.severity === 'high').length
  const medCount = bySeverity.medium ?? findings.filter(f => f.severity === 'medium').length
  const lowCount = bySeverity.low ?? findings.filter(f => f.severity === 'low').length

  const sorted = [...findings].sort(
    (a, b) => (SEV_ORDER[a.severity] ?? 4) - (SEV_ORDER[b.severity] ?? 4)
  )

  const runUrl = run.run?.url || (run.run as unknown as Record<string, string>)?.target_url || '—'

  return (
    <div className="fade-in">
      <div className="bg-white border-b border-gray-200 px-7 py-5">
        <button
          onClick={() => router.push('/past-runs')}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 mb-3 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to runs
        </button>
        <h1 className="text-base font-semibold text-gray-900 mb-1">{run.run?.name || 'QA Report'}</h1>
        <div className="flex flex-wrap gap-4 text-xs text-gray-400">
          <span>{formatDate(run.run?.date)}</span>
          <span className="font-mono">{runUrl}</span>
          {run.run?.tester && <span>{run.run.tester}</span>}
        </div>
      </div>

      <div className="p-7 max-w-3xl space-y-6">
        <div className="grid grid-cols-4 gap-3">
          <StatCard value={passed} label="Passed" color="green" />
          <StatCard value={failed} label="Failed" color="red" />
          <StatCard value={partial} label="Partial" color="amber" />
          <StatCard value={totalFindings} label="Findings" color="default" />
        </div>

        {findings.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Critical', count: critCount, classes: 'bg-red-50 text-red-600 border-red-200' },
              { label: 'High', count: highCount, classes: 'bg-amber-50 text-amber-600 border-amber-200' },
              { label: 'Medium', count: medCount, classes: 'bg-blue-50 text-blue-600 border-blue-200' },
              { label: 'Low', count: lowCount, classes: 'bg-gray-100 text-gray-500 border-gray-200' },
            ].filter(s => s.count > 0).map(({ label, count, classes }) => (
              <span key={label} className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium border ${classes}`}>
                <span className="font-bold tabular-nums">{count}</span> {label}
              </span>
            ))}
          </div>
        )}

        {summary.user_flow_validity && (
          <div className="border border-gray-200 rounded-lg px-4 py-3 bg-gray-50 text-sm text-gray-600">
            {summary.user_flow_validity}
          </div>
        )}

        <div>
          <div className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-4">
            {sorted.length > 0
              ? `${sorted.length} finding${sorted.length !== 1 ? 's' : ''} · sorted by severity`
              : 'Findings'}
          </div>
          {sorted.length === 0 ? (
            <div className="text-center py-8">
              <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm text-gray-400">No findings in this run.</p>
            </div>
          ) : (
            sorted.map(f => <FindingCard key={f.id} finding={f} />)
          )}
        </div>
      </div>
    </div>
  )
}
