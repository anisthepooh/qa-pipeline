import { cn } from '@/lib/utils'

const statusConfig: Record<string, string> = {
  PASS: 'bg-green-50 text-green-700 border border-green-200',
  FAIL: 'bg-red-50 text-red-600 border border-red-200',
  PARTIAL: 'bg-amber-50 text-amber-600 border border-amber-200',
}

export default function StatusBadge({ status }: { status: string }) {
  const s = (status || '').toUpperCase()
  return (
    <span className={cn(
      'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
      statusConfig[s] || 'bg-zinc-100 text-zinc-500 border border-zinc-200'
    )}>
      {s || '?'}
    </span>
  )
}
