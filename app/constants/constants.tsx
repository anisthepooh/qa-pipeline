import { Loader2, CheckCircle2, XCircle, MinusCircle } from 'lucide-react'

export const STEPS = [
  { label: 'Configuration', description: 'Target URL and settings' },
  { label: 'User Stories', description: 'Define test scenarios' },
  { label: 'Run', description: 'Generate prompt and results' },
]

export const CATEGORIES = [
  { id: 'flow', label: 'User flow validity' },
  { id: 'deadend', label: 'Dead-ends & navigation' },
  { id: 'bugs', label: 'Bugs & failures' },
  { id: 'ux', label: 'UX best practices' },
  { id: 'design', label: 'Design cohesion' },
  { id: 'a11y', label: 'Accessibility (basic)' },
]

export interface ProgressItem {
  tcId: string
  title: string
  status: string
  findingsCount?: number
  errorMsg?: string
}

export const STATUS_ICON: Record<string, React.ReactNode> = {
  running: <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />,
  PASS:    <CheckCircle2 className="w-4 h-4 text-green-500" />,
  FAIL:    <XCircle className="w-4 h-4 text-red-500" />,
  PARTIAL: <MinusCircle className="w-4 h-4 text-amber-500" />,
  error:   <XCircle className="w-4 h-4 text-red-400" />,
}
