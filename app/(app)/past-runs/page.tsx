'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePipeline } from '@/context/PipelineContext'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import { Trash2, History } from 'lucide-react'
import { RunMeta } from '@/types'

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

  const loadRun = async (id: string) => {
    try {
      const res = await fetch(`/api/runs/${id}`)
      const data = await res.json()
      dispatch({ type: 'SET_ACTIVE_RUN', payload: data })
      router.push('/report')
    } catch (e) {
      console.error('Failed to load run', e)
    }
  }

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

  if (savedRuns.length === 0) {
    return (
      <div className="p-7 text-center">
        <History className="w-10 h-10 mx-auto mb-3 text-gray-300" />
        <p className="text-sm text-gray-400">No saved runs yet. Generate and save a report to see it here.</p>
      </div>
    )
  }

  return (
    <div className="p-7 max-w-3xl fade-in">
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Run name</th>
              <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Date</th>
              <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400 hidden md:table-cell">URL</th>
              <th className="text-center px-3 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Pass</th>
              <th className="text-center px-3 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Fail</th>
              <th className="text-center px-3 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Findings</th>
              <th className="px-3 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {savedRuns.map((run, i) => (
              <tr
                key={run.id}
                className={`cursor-pointer hover:bg-gray-50 transition-colors ${i !== savedRuns.length - 1 ? 'border-b border-gray-200' : ''}`}
                onClick={() => loadRun(run.id)}
              >
                <td className="px-4 py-3">
                  <span className="font-medium text-gray-900 truncate max-w-[160px] block">{run.name}</span>
                </td>
                <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{formatDate(run.date)}</td>
                <td className="px-4 py-3 text-gray-400 font-mono text-xs truncate max-w-[160px] hidden md:table-cell">{run.url || '—'}</td>
                <td className="px-3 py-3 text-center">
                  <span className="text-green-600 font-semibold tabular-nums">{run.summary?.passed ?? 0}</span>
                </td>
                <td className="px-3 py-3 text-center">
                  <span className="text-red-500 font-semibold tabular-nums">{run.summary?.failed ?? 0}</span>
                </td>
                <td className="px-3 py-3 text-center">
                  <span className="text-gray-700 font-semibold tabular-nums">{run.summary?.total_findings ?? 0}</span>
                </td>
                <td className="px-3 py-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-gray-400 hover:text-red-500 hover:bg-red-50"
                    disabled={deletingId === run.id}
                    onClick={e => deleteRun(e, run.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
