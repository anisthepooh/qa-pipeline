import { History } from 'lucide-react'

export function RunsEmptyState() {
  return (
    <div className="p-7 text-center">
      <History className="w-10 h-10 mx-auto mb-3 text-gray-300" />
      <p className="text-sm text-gray-400">No saved runs yet. Generate and save a report to see it here.</p>
    </div>
  )
}
