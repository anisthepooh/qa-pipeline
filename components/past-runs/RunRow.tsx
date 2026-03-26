import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RunMeta } from '@/types'
import { formatDate } from '@/lib/utils'

interface RunRowProps {
  run: RunMeta
  isLast: boolean
  isDeleting: boolean
  onLoad: () => void
  onDelete: (e: React.MouseEvent) => void
}

export function RunRow({ run, isLast, isDeleting, onLoad, onDelete }: RunRowProps) {
  return (
    <tr
      className={`cursor-pointer hover:bg-gray-50 transition-colors ${!isLast ? 'border-b border-gray-200' : ''}`}
      onClick={onLoad}
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
          disabled={isDeleting}
          onClick={onDelete}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </td>
    </tr>
  )
}
