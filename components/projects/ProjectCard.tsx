'use client'

import { ArrowRight } from 'lucide-react'
import { Project } from '@/types'
import { formatDate } from '@/lib/utils'
import { ProjectScreenshot } from './ProjectScreenshot'

interface ProjectCardProps {
  project: Project
  onClick: () => void
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  return (
    <button
      className="text-left bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 hover:shadow-md transition-all group flex flex-col"
      onClick={onClick}
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
  )
}
