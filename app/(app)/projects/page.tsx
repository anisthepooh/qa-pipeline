'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePipeline } from '@/context/PipelineContext'
import { Button } from '@/components/ui/button'
import { Plus, X } from 'lucide-react'
import { Project } from '@/types'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { ProjectForm } from '@/components/projects/ProjectForm'
import { ProjectsEmptyState } from '@/components/projects/ProjectsEmptyState'

export default function ProjectsPage() {
  const { state, dispatch } = usePipeline()
  const { projects } = state
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetch('/api/projects')
      .then(r => r.json())
      .then((data: Project[]) => {
        dispatch({ type: 'SET_PROJECTS', payload: Array.isArray(data) ? data : [] })
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [dispatch])

  const handleCreated = (project: Project) => {
    dispatch({ type: 'SET_PROJECTS', payload: [project, ...projects] })
    setShowForm(false)
    router.push(`/projects/${project.id}`)
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
        <ProjectForm onSuccess={handleCreated} onCancel={() => setShowForm(false)} />
      )}

      {projects.length === 0 ? (
        <ProjectsEmptyState showForm={showForm} onNew={() => setShowForm(true)} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => router.push(`/projects/${project.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
