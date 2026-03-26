import { RunMeta } from '@/types'
import { RunRow } from './RunRow'

interface RunsTableProps {
  runs: RunMeta[]
  deletingId: string | null
  onLoad: (id: string) => void
  onDelete: (e: React.MouseEvent, id: string) => void
}

export function RunsTable({ runs, deletingId, onLoad, onDelete }: RunsTableProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Run name</th>
            <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Date</th>
            <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400 hidden md:table-cell">URL</th>
            <th className="text-center px-3 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Pass</th>
            <th className="text-center px-3 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Fail</th>
            <th className="text-center px-3 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Findings</th>
            <th className="px-3 py-3" />
          </tr>
        </thead>
        <tbody>
          {runs.map((run, i) => (
            <RunRow
              key={run.id}
              run={run}
              isLast={i === runs.length - 1}
              isDeleting={deletingId === run.id}
              onLoad={() => onLoad(run.id)}
              onDelete={e => onDelete(e, run.id)}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}
