'use client'

import { usePipeline } from '@/context/PipelineContext'
import StatCard from '@/components/StatCard'
import EmptyReport from '@/components/report/EmptyReport'
import ReportHeader from '@/components/report/ReportHeader'
import SeverityBreakdown from '@/components/report/SeverityBreakdown'
import TestCaseCard from '@/components/report/TestCaseCard'

export default function ReportPage() {
  const { state } = usePipeline()
  const { activeRun } = state

  if (!activeRun) return <EmptyReport />

  const { run, summary = {} as typeof activeRun.summary, test_cases = [], findings = [] } = activeRun

  const passed  = summary.passed  ?? 0
  const failed  = summary.failed  ?? 0
  const partial = summary.partial ?? 0
  const totalFindings = summary.total_findings ?? findings.length

  return (
    <div className="fade-in">
      <ReportHeader run={run} />

      <div className="p-7 max-w-3xl space-y-6">
        <div className="grid grid-cols-4 gap-3">
          <StatCard value={passed}        label="Passed"   color="green"   />
          <StatCard value={failed}        label="Failed"   color="red"     />
          <StatCard value={partial}       label="Partial"  color="amber"   />
          <StatCard value={totalFindings} label="Findings" color="default" />
        </div>

        <SeverityBreakdown bySeverity={summary.by_severity || {}} findings={findings} />

        {summary.user_flow_validity && (
          <div className="border border-gray-200 rounded-lg px-4 py-3 bg-gray-50 text-sm text-gray-600">
            {summary.user_flow_validity}
          </div>
        )}

        {test_cases.length > 0 && (
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-3">
              Test case results
            </div>
            <div className="space-y-3">
              {test_cases.map(tc => <TestCaseCard key={tc.id} tc={tc} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
