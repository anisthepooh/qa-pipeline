'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePipeline } from '@/context/PipelineContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Project } from '@/types'
import { FolderOpen, Plus, ArrowRight, Loader2, X, Globe } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'

const PROJECT_COLORS = [
  'bg-linear-to-br from-green-100 to-green-300',
  'bg-linear-to-br from-blue-100 to-blue-300',
  'bg-linear-to-br from-violet-100 to-violet-300',
  'bg-linear-to-br from-rose-100 to-rose-300',
  'bg-linear-to-br from-amber-100 to-amber-300',
  'bg-linear-to-br from-emerald-100 to-emerald-300',
] 

function ProjectScreenshot({ url, color }: { url: string; color?: number }) {
  const [errored, setErrored] = useState(false)
  const thumbUrl = `https://s.wordpress.com/mshots/v1/${encodeURIComponent(url)}?w=800&h=500`
  const bg = PROJECT_COLORS[color ?? 0] ?? PROJECT_COLORS[0]

  return (
    <div className="w-full h-36 overflow-hidden relative flex-shrink-0">
      <div className={cn("pt-3 px-3 w-full h-full", bg)}>
        {!errored ? (
          <img
            src={thumbUrl}
            alt=""
            className="w-full h-full object-cover object-top rounded-t-md "
            onError={() => setErrored(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-400">
            <Globe className="w-6 h-6" />
            <span className="text-[11px]">No preview</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ProjectsPage() {
  const { state, dispatch } = usePipeline()
  const { projects } = state
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    fetch('/api/projects')
      .then(r => r.json())
      .then((data: Project[]) => {
        dispatch({ type: 'SET_PROJECTS', payload: Array.isArray(data) ? data : [] })
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [dispatch])

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setSubmitting(true)
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, url, description }),
      })
      const data = await res.json()
      if (!res.ok) { setFormError(data.error || 'Failed to create project'); return }
      dispatch({ type: 'SET_PROJECTS', payload: [data, ...projects] })
      setShowForm(false)
      setName(''); setUrl(''); setDescription('')
      router.push(`/projects/${data.id}`)
    } catch {
      setFormError('Failed to create project')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="p-7 space-y-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="p-7 max-w-5xl fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Projects</h1>
          <p className="text-sm text-gray-400 mt-0.5">Each project tracks a web application and its test runs</p>
        </div>
        <Button size="sm" onClick={() => setShowForm(v => !v)}>
          {showForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          {showForm ? 'Cancel' : 'New project'}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={createProject} className="bg-white border border-gray-200 rounded-lg p-5 mb-5 space-y-4">
          <div className="text-sm font-semibold text-gray-900 mb-1">New project</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="proj-name">Project name</Label>
              <Input
                id="proj-name"
                placeholder="My App — Production"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="proj-url">Application URL</Label>
              <Input
                id="proj-url"
                type="url"
                placeholder="https://app.yourproduct.com"
                value={url}
                onChange={e => setUrl(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="proj-desc">Description <span className="text-gray-400 font-normal">(optional)</span></Label>
            <Textarea
              id="proj-desc"
              rows={2}
              placeholder="Short description of what this application does"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>
          {formError && (
            <p className="text-xs text-red-500">{formError}</p>
          )}
          <div className="flex items-center gap-2">
            <Button type="submit" size="sm" disabled={submitting}>
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Create project
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {projects.length === 0 ? (
        <div className="text-center py-16">
          <FolderOpen className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p className="text-sm text-gray-400 mb-4">No projects yet. Create one to get started.</p>
          {!showForm && (
            <Button size="sm" onClick={() => setShowForm(true)}>
              <Plus className="w-3.5 h-3.5" />
              New project
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(project => (
            <button
              key={project.id}
              className="text-left bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 hover:shadow-md transition-all group flex flex-col"
              onClick={() => router.push(`/projects/${project.id}`)}
            >
              <ProjectScreenshot url={project.url} color={project.color} />
              <div className="px-4 py-3 flex-1 flex flex-col gap-1">
                <div className="text-sm font-semibold text-gray-900 truncate">{project.name}</div>
                <div className="text-xs font-mono text-gray-400 truncate">{project.url}</div>
                {project.description && (
                  <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">{project.description}</div>
                )}
                <div className="flex items-center justify-between mt-auto pt-2">
                  <span className="text-[11px] text-gray-400">{formatDate(project.created)}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 transition-colors" />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
