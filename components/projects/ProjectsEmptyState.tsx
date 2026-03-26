import { FolderOpen, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ProjectsEmptyStateProps {
  showForm: boolean
  onNew: () => void
}

export function ProjectsEmptyState({ showForm, onNew }: ProjectsEmptyStateProps) {
  return (
    <div className="text-center py-16">
      <FolderOpen className="w-10 h-10 mx-auto mb-3 text-gray-300" />
      <p className="text-sm text-gray-400 mb-4">No projects yet. Create one to get started.</p>
      {!showForm && (
        <Button size="sm" onClick={onNew}>
          <Plus className="w-3.5 h-3.5" />
          New project
        </Button>
      )}
    </div>
  )
}
