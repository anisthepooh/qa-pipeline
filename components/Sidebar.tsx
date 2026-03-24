'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { usePipeline } from '@/context/PipelineContext'
import { cn } from '@/lib/utils'
import { Workflow, BarChart2, Search, Ticket, History, Loader2, Settings } from 'lucide-react'
import { logout } from '@/lib/auth'
import { useRouter } from 'next/navigation'

function NavItem({
  href,
  icon: Icon,
  label,
  badge,
  badgeCritical,
}: {
  href: string
  icon: React.ElementType
  label: string
  badge?: number | null
  badgeCritical?: boolean
}) {
  const pathname = usePathname()
  const isActive = pathname.startsWith(href)

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium transition-all duration-150',
        isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
      )}
    >
      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
      <span className="flex-1">{label}</span>
      {badge != null && (
        <span className={cn(
          'text-[10px] px-1.5 py-0.5 rounded-full font-semibold',
          badgeCritical ? 'bg-red-100 text-red-600' : 'bg-gray-200 text-gray-500'
        )}>
          {badge}
        </span>
      )}
    </Link>
  )
}

export default function Sidebar() {
  const { state } = usePipeline()
  const { activeRun, isRunning } = state
  const router = useRouter()

  const findingsCount = activeRun?.findings?.length ?? null
  const hasCritical = activeRun?.findings?.some(f => f.severity === 'critical') ?? false

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <aside className="w-56 bg-white border-r border-gray-200 flex flex-col min-h-screen sticky top-0 h-screen">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-gray-900 rounded-md flex items-center justify-center flex-shrink-0">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="white">
              <path d="M8 1L10.5 6H14L10.5 9.5L12 14L8 11L4 14L5.5 9.5L2 6H5.5L8 1Z"/>
            </svg>
          </div>
          <div>
            <div className="text-[13px] font-semibold text-gray-900 tracking-tight">QA Pipeline</div>
            <div className="text-[11px] text-gray-400">Test Runner</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-5 sidebar-scroll overflow-y-auto">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 px-3 mb-1.5">Setup</div>
          <div className="space-y-0.5">
            <NavItem href="/setup" icon={Workflow} label="New run" />
          </div>
        </div>

        <div>
          <div className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 px-3 mb-1.5">Results</div>
          <div className="space-y-0.5">
            <NavItem href="/report" icon={BarChart2} label="Report" />
            <NavItem href="/findings" icon={Search} label="Findings" badge={findingsCount} badgeCritical={hasCritical} />
            <NavItem href="/jira" icon={Ticket} label="Jira tickets" />
          </div>
        </div>

        <div>
          <div className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 px-3 mb-1.5">History</div>
          <div className="space-y-0.5">
            <NavItem href="/past-runs" icon={History} label="Past runs" />
          </div>
        </div>

        <div>
          <div className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 px-3 mb-1.5">Config</div>
          <div className="space-y-0.5">
            <NavItem href="/settings" icon={Settings} label="Settings" />
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-gray-200 space-y-2">
        <div className="flex items-center gap-2">
          {isRunning
            ? <Loader2 className="w-3 h-3 text-blue-500 animate-spin flex-shrink-0" />
            : <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', activeRun ? 'bg-green-500' : 'bg-gray-300')} />
          }
          <span className={cn('text-[11px] truncate', isRunning ? 'text-blue-500' : 'text-gray-400')}>
            {isRunning ? 'Running tests…' : activeRun ? (activeRun.run?.name || 'Active run') : 'No active run'}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}
