import { cn } from '@/lib/utils'

const severityConfig: Record<string, string> = {
  critical: 'bg-red-50 text-red-600 border border-red-200',
  high: 'bg-amber-50 text-amber-600 border border-amber-200',
  medium: 'bg-blue-50 text-blue-600 border border-blue-200',
  low: 'bg-zinc-100 text-zinc-500 border border-zinc-200',
}

export default function SeverityBadge({ severity }: { severity: string }) {
  const s = (severity || 'low').toLowerCase()
  return (
    <span className={cn(
      'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
      severityConfig[s] || severityConfig.low
    )}>
      {s}
    </span>
  )
}
