import { Search } from 'lucide-react'
import FindingCard from '@/components/FindingCard'
import { Finding } from '@/types'

interface FindingsSectionProps {
  findings: Finding[]
}

const SEV_ORDER: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 }

export function FindingsSection({ findings }: FindingsSectionProps) {
  const sorted = [...findings].sort(
    (a, b) => (SEV_ORDER[a.severity] ?? 4) - (SEV_ORDER[b.severity] ?? 4)
  )

  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-4">
        {sorted.length > 0
          ? `${sorted.length} finding${sorted.length !== 1 ? 's' : ''} · sorted by severity`
          : 'Findings'}
      </div>
      {sorted.length === 0 ? (
        <div className="text-center py-8">
          <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm text-gray-400">No findings in this run.</p>
        </div>
      ) : (
        sorted.map(f => <FindingCard key={f.id} finding={f} />)
      )}
    </div>
  )
}
