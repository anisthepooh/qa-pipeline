export interface Project {
  id: string
  name: string
  url: string
  description?: string
  color?: number
  created: string
  updated: string
}

export interface Config {
  projectId?: string
  url: string
  runName: string
  tester: string
  categories: string[]
}

export interface Story {
  title: string
  body: string
}

export interface TestCase {
  id: string
  title: string
  status: 'PASS' | 'FAIL' | 'PARTIAL'
  steps_executed: number
  expected_outcome?: string
  actual_outcome?: string
  steps?: string[] | StepObject[]
  screenshot_base64: string
}

export interface StepObject {
  step?: number
  action: string
  result?: string
}

export interface Finding {
  id: string
  title: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  category: string
  tc_id: string
  description: string
  location?: string
  evidence?: string
  expected: string
  actual: string
  steps?: string[] | StepObject[]
  acceptance?: string[]
  screenshot_base64: string
}

export interface RunMeta {
  id: string
  projectId?: string
  name: string
  url: string
  date: string
  summary: RunSummary
}

export interface RunSummary {
  passed: number
  failed: number
  partial: number
  total_findings: number
  by_severity: {
    critical: number
    high: number
    medium: number
    low: number
  }
}

export interface RunResult {
  id?: string
  projectId?: string
  run: {
    name: string
    url: string
    tester: string
    date: string
    app_name?: string
    target_url?: string
    locale_detected?: string
  }
  summary: RunSummary & { user_flow_validity?: string }
  test_cases: TestCase[]
  findings: Finding[]
}
