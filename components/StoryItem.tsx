import { X } from 'lucide-react'
import { Button } from './ui/button'
import { Story } from '@/types'

export default function StoryItem({
  story,
  index,
  onRemove,
}: {
  story: Story
  index: number
  onRemove: (i: number) => void
}) {
  const id = `TC-${String(index + 1).padStart(2, '0')}`
  return (
    <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
      <div className="flex items-start gap-3 px-4 py-3">
        <span className="flex-shrink-0 mt-0.5 w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-[10px] font-bold flex items-center justify-center">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-mono text-gray-400">{id}</span>
            <span className="text-sm font-medium text-gray-900 truncate">{story.title}</span>
          </div>
          {story.body && (
            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed whitespace-pre-wrap">{story.body}</p>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="flex-shrink-0 h-6 w-6 text-gray-400 hover:text-red-500 hover:bg-red-50"
          onClick={() => onRemove(index)}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}
