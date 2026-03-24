import { cn } from '@/lib/utils'

const colorMap: Record<string, string> = {
  green: 'text-green-600',
  red: 'text-red-500',
  amber: 'text-amber-500',
  blue: 'text-blue-600',
  default: 'text-gray-900',
}

export default function StatCard({
  value,
  label,
  color = 'default',
}: {
  value: number | string | null | undefined
  label: string
  color?: string
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 text-center">
      <div className={cn('text-3xl font-bold leading-none mb-1.5 tabular-nums', colorMap[color] || colorMap.default)}>
        {value ?? 0}
      </div>
      <div className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">{label}</div>
    </div>
  )
}
