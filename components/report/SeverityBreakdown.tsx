'use client'

import { Finding } from '@/types'

interface BySeverity {
  critical?: number
  high?: number
  medium?: number
  low?: number
}

interface Props {
  bySeverity: BySeverity
  findings: Finding[]
}

const SEVERITY_STYLES = [
  { key: 'critical', label: 'Critical', classes: 'bg-red-50 text-red-600 border-red-200' },
  { key: 'high',     label: 'High',     classes: 'bg-amber-50 text-amber-600 border-amber-200' },
  { key: 'medium',   label: 'Medium',   classes: 'bg-blue-50 text-blue-600 border-blue-200' },
  { key: 'low',      label: 'Low',      classes: 'bg-gray-100 text-gray-500 border-gray-200' },
] as const

export default function SeverityBreakdown({ bySeverity, findings }: Props) {
  const counts = SEVERITY_STYLES.map(({ key, label, classes }) => ({
    label,
    classes,
    count: bySeverity[key] ?? findings.filter(f => f.severity === key).length,
  })).filter(s => s.count > 0)

  if (counts.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {counts.map(({ label, count, classes }) => (
        <span
          key={label}
          className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium border ${classes}`}
        >
          <span className="font-bold tabular-nums">{count}</span> {label}
        </span>
      ))}
    </div>
  )
}
