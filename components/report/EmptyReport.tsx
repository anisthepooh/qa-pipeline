'use client'

import Link from 'next/link'
import { BarChart2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function EmptyReport() {
  return (
    <div className="p-7 max-w-xl fade-in">
      <div className="border border-gray-200 bg-gray-50 rounded-lg px-6 py-8 text-center">
        <BarChart2 className="w-10 h-10 mx-auto mb-3 text-gray-400" />
        <h3 className="text-sm font-semibold text-gray-700 mb-1.5">No report yet</h3>
        <p className="text-sm text-gray-500 mb-4">
          Generate a report from the Run page by pasting Claude&apos;s JSON output.
        </p>
        <Button asChild>
          <Link href="/setup">Go to Setup <ArrowRight className="w-4 h-4" /></Link>
        </Button>
      </div>
    </div>
  )
}
