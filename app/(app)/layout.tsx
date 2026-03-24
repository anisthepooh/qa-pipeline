import { PipelineProvider } from '@/context/PipelineContext'
import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <PipelineProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </PipelineProvider>
  )
}
