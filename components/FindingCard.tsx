import SeverityBadge from './SeverityBadge'
import ScreenshotOrPlaceholder from './ScreenshotOrPlaceholder'
import { Finding, StepObject } from '@/types'

const CATEGORY_META: Record<string, { label: string; classes: string }> = {
  bugs_and_failures: { label: 'Bug', classes: 'bg-red-50 text-red-600' },
  bug: { label: 'Bug', classes: 'bg-red-50 text-red-600' },
  accessibility: { label: 'Accessibility', classes: 'bg-purple-50 text-purple-600' },
  ux_best_practices: { label: 'UX', classes: 'bg-amber-50 text-amber-600' },
  ux: { label: 'UX', classes: 'bg-amber-50 text-amber-600' },
  design_cohesion: { label: 'Design', classes: 'bg-blue-50 text-blue-600' },
  design: { label: 'Design', classes: 'bg-blue-50 text-blue-600' },
  dead_ends: { label: 'Dead-end', classes: 'bg-amber-50 text-amber-600' },
  'dead-end': { label: 'Dead-end', classes: 'bg-amber-50 text-amber-600' },
  user_flow_validity: { label: 'Flow', classes: 'bg-green-50 text-green-700' },
  flow: { label: 'Flow', classes: 'bg-green-50 text-green-700' },
}

function getCategoryMeta(raw?: string) {
  if (!raw) return { label: 'Other', classes: 'bg-gray-100 text-gray-500' }
  const key = raw.toLowerCase().replace(/\s+/g, '_')
  return CATEGORY_META[key] || CATEGORY_META[raw.toLowerCase()] || { label: raw, classes: 'bg-gray-100 text-gray-500' }
}

function renderStep(step: string | StepObject, i: number) {
  if (typeof step === 'string') {
    return (
      <li key={i} className="text-xs text-gray-700 flex gap-2">
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

export default function FindingCard({ finding }: { finding: Finding }) {
  const cat = getCategoryMeta(finding.category)

  return (
    <div className="border border-gray-200 rounded-lg bg-white overflow-hidden mb-4 fade-in">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-start gap-3">
        <span className="font-mono text-[10px] text-gray-400 mt-0.5 flex-shrink-0">{finding.id}</span>
        <span className="text-sm font-semibold text-gray-900 flex-1">{finding.title}</span>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <SeverityBadge severity={finding.severity} />
          <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${cat.classes}`}>
            {cat.label}
          </span>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        <p className="text-sm text-gray-600 leading-relaxed">{finding.description}</p>

        {(finding.location || finding.evidence) && (
          <div className="grid grid-cols-2 gap-4">
            {finding.location && (
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Location</div>
                <p className="text-xs text-gray-600 font-mono">{finding.location}</p>
              </div>
            )}
            {finding.evidence && (
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Evidence</div>
                <p className="text-xs text-gray-600">{finding.evidence}</p>
              </div>
            )}
          </div>
        )}

        {(finding.steps || []).length > 0 && (
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Steps to Reproduce</div>
            <ol className="space-y-1.5">
              {(finding.steps || []).map((step, i) => renderStep(step, i))}
            </ol>
          </div>
        )}

        {(finding.expected || finding.actual) && (
          <div className="grid grid-cols-2 gap-4">
            {finding.expected && (
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Expected</div>
                <p className="text-xs text-gray-700">{finding.expected}</p>
              </div>
            )}
            {finding.actual && (
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Actual</div>
                <p className="text-xs text-gray-700">{finding.actual}</p>
              </div>
            )}
          </div>
        )}

        {(finding.acceptance || []).length > 0 && (
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Acceptance Criteria</div>
            <ul className="space-y-1">
              {(finding.acceptance || []).map((a, i) => (
                <li key={i} className="text-xs text-gray-700 flex gap-2 items-start">
                  <span className="text-gray-400 mt-0.5">☐</span>
                  {a}
                </li>
              ))}
            </ul>
          </div>
        )}

        <ScreenshotOrPlaceholder base64={finding.screenshot_base64} alt={`Screenshot for ${finding.id}`} />
      </div>
    </div>
  )
}
