'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { RefreshCw } from 'lucide-react'
import StatCard from '@/components/StatCard'
import SeverityBreakdown from '@/components/report/SeverityBreakdown'
import { RunDetailHeader } from '@/components/past-runs/RunDetailHeader'
import { FindingsSection } from '@/components/past-runs/FindingsSection'
import { Button } from '@/components/ui/button'
import { usePipeline } from '@/context/PipelineContext'
import { RunResult } from '@/types'

export default function PastRunDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { dispatch } = usePipeline()
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

  function handleRerun() {
    if (!run) return
    dispatch({
      type: 'SET_CONFIG',
      payload: {
        url: run.run.url,
        runName: run.run.name,
        tester: run.run.tester,
        categories: run.categories || [],
        projectId: run.projectId,
      },
    })
    dispatch({ type: 'REORDER_STORIES', payload: run.stories || [] })
    router.push('/setup?step=2')
  }

  const { summary = {} as typeof run.summary, findings = [] } = run
  const bySeverity = summary.by_severity || {}

  return (
    <div className="fade-in">
      <RunDetailHeader run={run} onBack={() => router.push('/past-runs')} />
      <div className="px-7 pt-4">
        <Button onClick={handleRerun} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-1.5" />
          Rerun
        </Button>
      </div>
      <div className="p-7 max-w-3xl space-y-6">
        <div className="grid grid-cols-4 gap-3">
          <StatCard value={summary.passed ?? 0} label="Passed" color="green" />
          <StatCard value={summary.failed ?? 0} label="Failed" color="red" />
          <StatCard value={summary.partial ?? 0} label="Partial" color="amber" />
          <StatCard value={summary.total_findings ?? findings.length} label="Findings" color="default" />
        </div>
        <SeverityBreakdown bySeverity={bySeverity} findings={findings} />
        {summary.user_flow_validity && (
          <div className="border border-gray-200 rounded-lg px-4 py-3 bg-gray-50 text-sm text-gray-600">
            {summary.user_flow_validity}
          </div>
        )}
        <FindingsSection findings={findings} />
      </div>
    </div>
  )
}
