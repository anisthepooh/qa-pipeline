'use client'

import StatusBadge from '@/components/StatusBadge'
import ScreenshotOrPlaceholder from '@/components/ScreenshotOrPlaceholder'
import { TestCase, StepObject } from '@/types'

function renderStep(step: string | StepObject, i: number) {
  if (typeof step === 'string') {
    return (
      <li key={i} className="text-xs text-gray-600 flex gap-2">
        <span className="text-gray-400 font-mono flex-shrink-0">{i + 1}.</span>
        {step}
      </li>
    )
  }
  return (
    <li key={i} className="text-xs flex gap-2">
      <span className="text-gray-400 font-mono flex-shrink-0">{step.step ?? i + 1}.</span>
      <span className="flex-1">
        <span className="text-gray-700">{step.action}</span>
        {step.result && <span className="block text-gray-400 mt-0.5 italic">{step.result}</span>}
      </span>
    </li>
  )
}

export default function TestCaseCard({ tc }: { tc: TestCase }) {
  const stepCount = Array.isArray(tc.steps) ? tc.steps.length : (tc.steps_executed ?? '?')

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-3">
        <StatusBadge status={tc.status} />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-gray-900">{tc.title || tc.id}</div>
          <div className="text-xs text-gray-400">{tc.id} · {stepCount} steps</div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {(tc.expected_outcome || tc.actual_outcome) && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Expected</div>
              <p className="text-sm text-gray-500">{tc.expected_outcome || '—'}</p>
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Actual</div>
              <p className="text-sm text-gray-500">{tc.actual_outcome || '—'}</p>
            </div>
          </div>
        )}

        {Array.isArray(tc.steps) && tc.steps.length > 0 && (
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Steps</div>
            <ol className="space-y-1.5">
              {tc.steps.map((step, i) => renderStep(step, i))}
            </ol>
          </div>
        )}

        <ScreenshotOrPlaceholder base64={tc.screenshot_base64} alt={`Screenshot for ${tc.id}`} />
      </div>
    </div>
  )
}
