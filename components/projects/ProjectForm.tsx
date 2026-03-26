'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Project } from '@/types'

interface ProjectFormProps {
  onSuccess: (project: Project) => void
  onCancel: () => void
}

export function ProjectForm({ onSuccess, onCancel }: ProjectFormProps) {
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, url, description }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to create project'); return }
      onSuccess(data)
    } catch {
      setError('Failed to create project')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-5 mb-5 space-y-4">
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
        <Label htmlFor="proj-desc">
          Description <span className="text-gray-400 font-normal">(optional)</span>
        </Label>
        <Textarea
          id="proj-desc"
          rows={2}
          placeholder="Short description of what this application does"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <div className="flex items-center gap-2">
        <Button type="submit" size="sm" disabled={submitting}>
          {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          Create project
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
