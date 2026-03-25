'use client'

import { Settings, Tag, FolderOpen } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { Config, Project } from '@/types'
import { Action } from '@/context/PipelineContext'
import { CATEGORIES } from '../../app/constants/constants'

interface Props {
  config: Config
  dispatch: React.Dispatch<Action>
  projects: Project[]
  activeProject: Project | null
}

export default function StepConfig({ config, dispatch, projects, activeProject }: Props) {
  const set = (key: keyof Config, val: unknown) =>
    dispatch({ type: 'SET_CONFIG', payload: { [key]: val } as Partial<Config> })

  const toggleCategory = (id: string) => {
    const next = config.categories.includes(id)
      ? config.categories.filter(c => c !== id)
      : [...config.categories, id]
    set('categories', next)
  }

  const selectProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId) ?? null
    dispatch({ type: 'SET_ACTIVE_PROJECT', payload: project })
  }

  return (
    <div className="space-y-5">
      {/* Project selector */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <SectionHeader icon={<FolderOpen className="w-3.5 h-3.5" />} title="Project" description="Link this run to a project (optional)" />
        <div className="px-5 py-5">
          {projects.length === 0 ? (
            <p className="text-xs text-gray-400">
              No projects yet.{' '}
              <a href="/projects" className="underline hover:text-gray-600 transition-colors">Create one</a>
              {' '}to organise your runs.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              <ProjectChip
                label="No project"
                active={!activeProject}
                onClick={() => dispatch({ type: 'SET_ACTIVE_PROJECT', payload: null })}
              />
              {projects.map(p => (
                <ProjectChip
                  key={p.id}
                  label={p.name}
                  active={activeProject?.id === p.id}
                  onClick={() => selectProject(p.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Test target */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <SectionHeader icon={<Settings className="w-3.5 h-3.5" />} title="Test target" description="URL and session info for this test run" />
        <div className="px-5 py-5 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="url">Application URL</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://app.yourproduct.com"
              value={config.url}
              onChange={e => set('url', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="runName">Test run name</Label>
              <Input
                id="runName"
                placeholder="Sprint 42 — Checkout flow"
                value={config.runName}
                onChange={e => set('runName', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tester">Tester</Label>
              <Input
                id="tester"
                placeholder="Your name or team"
                value={config.tester}
                onChange={e => set('tester', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Test categories */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <SectionHeader icon={<Tag className="w-3.5 h-3.5" />} title="Test categories" description="What Claude will evaluate on each user flow" />
        <div className="px-5 py-5">
          <div className="grid grid-cols-2 gap-2.5">
            {CATEGORIES.map(cat => {
              const checked = config.categories.includes(cat.id)
              return (
                <label
                  key={cat.id}
                  className={cn(
                    'flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-md border cursor-pointer text-sm font-medium transition-all duration-150',
                    checked
                      ? 'border-gray-900 bg-gray-50 text-gray-900'
                      : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                  )}
                >
                  {cat.label}
                  <Switch checked={checked} onCheckedChange={() => toggleCategory(cat.id)} />
                </label>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function SectionHeader({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-3">
      <div className="w-7 h-7 rounded-md bg-gray-100 text-gray-500 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <div className="text-sm font-semibold text-gray-900">{title}</div>
        <div className="text-xs text-gray-500">{description}</div>
      </div>
    </div>
  )
}

function ProjectChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'px-3 py-1.5 rounded-md border text-xs font-medium transition-all',
        active
          ? 'border-gray-900 bg-gray-900 text-white'
          : 'border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-700'
      )}
    >
      {label}
    </button>
  )
}
