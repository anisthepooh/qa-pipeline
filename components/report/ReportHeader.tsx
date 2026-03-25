'use client'

import { formatDate } from '@/lib/utils'
import { RunResult } from '@/types'

type Run = RunResult['run']

interface Props {
  run: Run
}

export default function ReportHeader({ run }: Props) {
  const url = run?.url || (run as unknown as Record<string, string>)?.target_url || '—'

  return (
    <div className="bg-white border-b border-gray-200 px-7 py-5">
      <h1 className="text-base font-semibold text-gray-900 mb-1">{run?.name || 'QA Report'}</h1>
      <div className="flex flex-wrap gap-4 text-xs text-gray-400">
        <span>{formatDate(run?.date)}</span>
        <span className="font-mono">{url}</span>
        {run?.tester && <span>{run.tester}</span>}
        {run?.app_name && <span>{run.app_name}</span>}
        {run?.locale_detected && <span className="text-amber-500">{run.locale_detected}</span>}
      </div>
    </div>
  )
}
