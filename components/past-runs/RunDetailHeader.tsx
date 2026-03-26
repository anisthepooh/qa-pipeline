import { ArrowLeft } from 'lucide-react'
import { RunResult } from '@/types'
import { formatDate } from '@/lib/utils'

interface RunDetailHeaderProps {
  run: RunResult
  onBack: () => void
}

export function RunDetailHeader({ run, onBack }: RunDetailHeaderProps) {
  const runUrl = run.run?.url || (run.run as unknown as Record<string, string>)?.target_url || '—'

  return (
    <div className="bg-white border-b border-gray-200 px-7 py-5">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 mb-3 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to runs
      </button>
      <h1 className="text-base font-semibold text-gray-900 mb-1">{run.run?.name || 'QA Report'}</h1>
      <div className="flex flex-wrap gap-4 text-xs text-gray-400">
        <span>{formatDate(run.run?.date)}</span>
        <span className="font-mono">{runUrl}</span>
        {run.run?.tester && <span>{run.run.tester}</span>}
      </div>
    </div>
  )
}
