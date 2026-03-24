import { Config, Story } from '@/types'

const categoryLabels: Record<string, string> = {
  flow: 'User flow validity (can the user complete the intended action?)',
  deadend: 'Dead-ends (pages with no forward path, error states with no recovery)',
  bugs: 'Bugs & failures (console errors, broken elements, network failures)',
  ux: 'UX best practices (feedback after actions, clear CTAs, friction points)',
  design: 'Design cohesion (typography, color, spacing, iconography consistency)',
  a11y: 'Accessibility (alt text, labels, contrast, focus states, heading hierarchy)',
}

export function buildPrompt(config: Config, stories: Story[]): string {
  const { url, runName, tester, categories } = config
  const date = new Date().toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  const storyText = stories
    .map((s, i) => {
      const id = `TC-${String(i + 1).padStart(2, '0')}`
      return `### ${id}: ${s.title}\n${s.body}`
    })
    .join('\n\n')

  const catText = categories
    .map(c => `- ${categoryLabels[c] || c}`)
    .join('\n')

  return `You are running a structured frontend QA pipeline.

Run name: ${runName}
Target URL: ${url}
Tester: ${tester}
Date: ${date}

Read and follow the instructions in the skill file at:
skills/frontend-test-pipeline.md

## USER STORIES

${storyText}

## CATEGORIES TO EVALUATE
${catText}

Return ONLY raw JSON. No markdown, no prose.`
}
