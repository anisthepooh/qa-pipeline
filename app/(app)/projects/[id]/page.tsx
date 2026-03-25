'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { usePipeline } from '@/context/PipelineContext'
import { Button } from '@/components/ui/button'
import { RunMeta, Project } from '@/types'
import { formatDate } from '@/lib/utils'
import { ArrowLeft, Play, Trash2, ExternalLink, History } from 'lucide-react'

interface ProjectWithRuns extends Project {
  runs: RunMeta[]
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { dispatch } = usePipeline()
  const [project, setProject] = useState<ProjectWithRuns | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [deletingRunId, setDeletingRunId] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then(r => {
        if (r.status === 404) { setNotFound(true); return null }
        return r.json()
      })
      .then(data => {
        if (data) setProject(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  const startNewRun = () => {
    if (!project) return
    dispatch({
      type: 'SET_ACTIVE_PROJECT',
      payload: {
        id: project.id,
        name: project.name,
        url: project.url,
        description: project.description,
        created: project.created,
        updated: project.updated,
      },
    })
    router.push('/setup')
  }

  const deleteRun = async (e: React.MouseEvent, runId: string) => {
    e.stopPropagation()
    setDeletingRunId(runId)
    try {
      await fetch(`/api/runs/${runId}`, { method: 'DELETE' })
      setProject(p => p ? { ...p, runs: p.runs.filter(r => r.id !== runId) } : p)
    } catch {
      // ignore
    }
    setDeletingRunId(null)
  }

  if (loading) {
    return (
      <div className="p-7 space-y-2">
        <div className="h-24 bg-gray-100 rounded-lg animate-pulse" />
        <div className="h-14 bg-gray-100 rounded-lg animate-pulse" />
        <div className="h-14 bg-gray-100 rounded-lg animate-pulse" />
      </div>
    )
  }

  if (notFound || !project) {
    return (
      <div className="p-7 text-center">
        <p className="text-sm text-gray-400">Project not found.</p>
        <Button variant="outline" size="sm" className="mt-3" onClick={() => router.push('/projects')}>
          Back to projects
        </Button>
      </div>
    )
  }

  return (
    <div className="p-7 max-w-3xl fade-in">
      <button
        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 mb-5 transition-colors"
        onClick={() => router.push('/projects')}
      >
        <ArrowLeft className="w-3 h-3" />
        All projects
      </button>

      {/* Project header */}
      <div className="bg-white border border-gray-200 rounded-lg px-5 py-4 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-base font-semibold text-gray-900">{project.name}</h1>
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-mono text-gray-400 hover:text-gray-600 mt-0.5 transition-colors"
              onClick={e => e.stopPropagation()}
            >
              {project.url}
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
            {project.description && (
              <p className="text-sm text-gray-500 mt-2">{project.description}</p>
            )}
          </div>
          <Button size="sm" onClick={startNewRun} className="flex-shrink-0">
            <Play className="w-3.5 h-3.5" />
            New run
          </Button>
        </div>
      </div>

      {/* Runs list */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-700">Test runs</h2>
        <span className="text-xs text-gray-400">{project.runs.length} run{project.runs.length !== 1 ? 's' : ''}</span>
      </div>

      {project.runs.length === 0 ? (
        <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
          <History className="w-8 h-8 mx-auto mb-3 text-gray-300" />
          <p className="text-sm text-gray-400 mb-3">No runs yet for this project.</p>
          <Button size="sm" onClick={startNewRun}>
            <Play className="w-3.5 h-3.5" />
            Start first run
          </Button>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Run name</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Date</th>
                <th className="text-center px-3 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Pass</th>
                <th className="text-center px-3 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Fail</th>
                <th className="text-center px-3 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Findings</th>
                <th className="px-3 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {project.runs.map((run, i) => (
                <tr
                  key={run.id}
                  className={`cursor-pointer hover:bg-gray-50 transition-colors ${i !== project.runs.length - 1 ? 'border-b border-gray-200' : ''}`}
                  onClick={() => router.push(`/past-runs/${run.id}`)}
                >
                  <td className="px-4 py-3">
                    <span className="font-medium text-gray-900 truncate max-w-[200px] block">{run.name}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{formatDate(run.date)}</td>
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
                      disabled={deletingRunId === run.id}
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
      )}
    </div>
  )
}
