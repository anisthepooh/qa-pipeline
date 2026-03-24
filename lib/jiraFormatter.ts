import { Finding } from '@/types'

const priorityMap: Record<string, string> = {
  critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low',
}
const typeMap: Record<string, string> = {
  Bug: 'Bug', UX: 'Story', Design: 'Story',
  Accessibility: 'Story', Flow: 'Story', 'Dead-end': 'Story',
}

export function formatJiraTicket(finding: Finding): string {
  const steps = (finding.steps || []).map((s, i) => `${i + 1}. ${s}`).join('\n')
  const ac = (finding.acceptance || []).map(a => `- [ ] ${a}`).join('\n')

  return `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
JIRA TICKET — ${finding.id}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Title:      ${finding.title}
Type:       ${typeMap[finding.category] || 'Bug'}
Priority:   ${priorityMap[finding.severity] || 'Medium'}
Labels:     frontend-qa, ${(finding.category || '').toLowerCase().replace(/[^a-z0-9]/g, '-')}
Component:  ${finding.tc_id || 'Frontend'}

Summary:
${finding.description}

Steps to Reproduce:
${steps || '(See description)'}

Expected:   ${finding.expected}
Actual:     ${finding.actual}

Acceptance Criteria:
${ac || '- [ ] Issue resolved and verified'}

Screenshot: Embedded in QA report — ${finding.id}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
}
