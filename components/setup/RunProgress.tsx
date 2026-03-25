'use client'

import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProgressItem, STATUS_ICON } from '../../app/constants/constants'

interface Props {
  progress: ProgressItem[]
  onCancel: () => void
}

export default function RunProgress({ progress, onCancel }: Props) {
  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {progress.map(p => (
          <div key={p.tcId} className="flex items-center gap-3 py-1">
            <span className="flex-shrink-0">
              {STATUS_ICON[p.status] ?? <div className="w-4 h-4 rounded-full border-2 border-gray-200" />}
            </span>
            <span className="text-sm text-gray-700 flex-1">{p.tcId} — {p.title}</span>
            {p.status === 'running' && (
              <span className="text-[11px] text-gray-400">Analysing…</span>
            )}
            {(p.status === 'PASS' || p.status === 'FAIL' || p.status === 'PARTIAL') && (
              <span className="text-[11px] text-gray-400">
                {p.findingsCount ?? 0} finding{p.findingsCount !== 1 ? 's' : ''}
              </span>
            )}
            {p.status === 'error' && (
              <span className="text-[11px] text-red-400 truncate max-w-[160px]">{p.errorMsg}</span>
            )}
          </div>
        ))}
      </div>
      <Button variant="outline" size="sm" onClick={onCancel}>
        <X className="w-3.5 h-3.5" />
        Cancel
      </Button>
    </div>
  )
}
