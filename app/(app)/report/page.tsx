'use client'

import Link from 'next/link'
import { usePipeline } from '@/context/PipelineContext'
import StatCard from '@/components/StatCard'
import StatusBadge from '@/components/StatusBadge'
import ScreenshotOrPlaceholder from '@/components/ScreenshotOrPlaceholder'
import { formatDate } from '@/lib/utils'
import { ArrowRight, BarChart2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StepObject } from '@/types'

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

export default function ReportPage() {
  const { state } = usePipeline()
  const { activeRun } = state

  if (!activeRun) {
    return (
      <div className="p-7 max-w-xl fade-in">
        <div className="border border-gray-200 bg-gray-50 rounded-lg px-6 py-8 text-center">
          <BarChart2 className="w-10 h-10 mx-auto mb-3 text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-700 mb-1.5">No report yet</h3>
          <p className="text-sm text-gray-500 mb-4">Generate a report from the Run page by pasting Claude&apos;s JSON output.</p>
          <Button asChild>
            <Link href="/setup">Go to Setup <ArrowRight className="w-4 h-4" /></Link>
          </Button>
        </div>
      </div>
    )
  }

  const { run, summary = {} as typeof activeRun.summary, test_cases = [], findings = [] } = activeRun

  const passed = summary.passed ?? 0
  const failed = summary.failed ?? 0
  const partial = summary.partial ?? 0
  const totalFindings = summary.total_findings ?? findings.length

  const bySeverity = summary.by_severity || {}
  const critCount = bySeverity.critical ?? findings.filter(f => f.severity === 'critical').length
  const highCount = bySeverity.high ?? findings.filter(f => f.severity === 'high').length
  const medCount = bySeverity.medium ?? findings.filter(f => f.severity === 'medium').length
  const lowCount = bySeverity.low ?? findings.filter(f => f.severity === 'low').length

  const runUrl = run?.url || (run as unknown as Record<string, string>)?.target_url || '—'

  return (
    <div className="fade-in">
      <div className="bg-white border-b border-gray-200 px-7 py-5">
        <h1 className="text-base font-semibold text-gray-900 mb-1">{run?.name || 'QA Report'}</h1>
        <div className="flex flex-wrap gap-4 text-xs text-gray-400">
          <span>{formatDate(run?.date)}</span>
          <span className="font-mono">{runUrl}</span>
          {run?.tester && <span>{run.tester}</span>}
          {run?.app_name && <span>{run.app_name}</span>}
          {run?.locale_detected && <span className="text-amber-500">{run.locale_detected}</span>}
        </div>
      </div>

      <div className="p-7 max-w-3xl space-y-6">
        <div className="grid grid-cols-4 gap-3">
          <StatCard value={passed} label="Passed" color="green" />
          <StatCard value={failed} label="Failed" color="red" />
          <StatCard value={partial} label="Partial" color="amber" />
          <StatCard value={totalFindings} label="Findings" color="default" />
        </div>

        {findings.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Critical', count: critCount, classes: 'bg-red-50 text-red-600 border-red-200' },
              { label: 'High', count: highCount, classes: 'bg-amber-50 text-amber-600 border-amber-200' },
              { label: 'Medium', count: medCount, classes: 'bg-blue-50 text-blue-600 border-blue-200' },
              { label: 'Low', count: lowCount, classes: 'bg-gray-100 text-gray-500 border-gray-200' },
            ].filter(s => s.count > 0).map(({ label, count, classes }) => (
              <span key={label} className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium border ${classes}`}>
                <span className="font-bold tabular-nums">{count}</span> {label}
              </span>
            ))}
          </div>
        )}

        {summary.user_flow_validity && (
          <div className="border border-gray-200 rounded-lg px-4 py-3 bg-gray-50 text-sm text-gray-600">
            {summary.user_flow_validity}
          </div>
        )}

        {test_cases.length > 0 && (
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-3">Test case results</div>
            <div className="space-y-3">
              {test_cases.map(tc => {
                const stepCount = Array.isArray(tc.steps) ? tc.steps.length : (tc.steps_executed ?? '?')
                return (
                  <div key={tc.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
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
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
