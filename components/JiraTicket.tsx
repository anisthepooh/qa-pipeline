'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { formatJiraTicket } from '@/lib/jiraFormatter'
import SeverityBadge from './SeverityBadge'
import { Finding } from '@/types'

export default function JiraTicket({ finding }: { finding: Finding }) {
  const [copied, setCopied] = useState(false)
  const ticket = formatJiraTicket(finding)

  const handleCopy = () => {
    navigator.clipboard.writeText(ticket).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="border border-gray-200 rounded-lg bg-white overflow-hidden mb-4 fade-in">
      <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-3">
        <SeverityBadge severity={finding.severity} />
        <span className="text-sm font-medium text-gray-900 flex-1">{finding.id} — {finding.title}</span>
      </div>
      <div className="relative">
        <div className="bg-gray-50 rounded-b-lg">
          <button
            onClick={handleCopy}
            className={`absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-medium transition-all duration-150 border ${
              copied
                ? 'bg-green-50 text-green-600 border-green-200'
                : 'bg-white text-gray-500 border-gray-200 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <pre className="font-mono text-xs text-gray-600 leading-relaxed p-4 pr-20 overflow-x-auto whitespace-pre-wrap break-words">
            {ticket}
          </pre>
        </div>
      </div>
    </div>
  )
}
