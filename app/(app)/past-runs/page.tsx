'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePipeline } from '@/context/PipelineContext'
import { RunMeta } from '@/types'
import { RunsEmptyState } from '@/components/past-runs/RunsEmptyState'
import { RunsTable } from '@/components/past-runs/RunsTable'

export default function PastRunsPage() {
  const { state, dispatch } = usePipeline()
  const { savedRuns } = state
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/runs')
      .then(r => r.json())
      .then((data: RunMeta[]) => {
        dispatch({ type: 'SET_SAVED_RUNS', payload: Array.isArray(data) ? data : [] })
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [dispatch])

  const deleteRun = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setDeletingId(id)
    try {
      await fetch(`/api/runs/${id}`, { method: 'DELETE' })
      dispatch({ type: 'SET_SAVED_RUNS', payload: savedRuns.filter(r => r.id !== id) })
    } catch (e) {
      console.error('Failed to delete run', e)
    }
    setDeletingId(null)
  }

  if (loading) {
    return (
      <div className="p-7">
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (savedRuns.length === 0) return <RunsEmptyState />

  return (
    <div className="p-7 max-w-3xl fade-in">
      <RunsTable
        runs={savedRuns}
        deletingId={deletingId}
        onLoad={id => router.push(`/past-runs/${id}`)}
        onDelete={deleteRun}
      />
    </div>
  )
}
