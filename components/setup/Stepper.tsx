'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { STEPS } from '../../app/constants/constants'

export default function Stepper({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-start px-7 py-5 bg-white border-b border-gray-200">
      {STEPS.map((step, i) => (
        <div key={i} className="flex items-start flex-1">
          <div className="flex flex-col items-center gap-1.5 shrink-0">
            <div className={cn(
              'w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors',
              i < currentStep
                ? 'bg-gray-900 text-white'
                : i === currentStep
                  ? 'bg-gray-900 text-white ring-4 ring-gray-100'
                  : 'bg-gray-100 text-gray-400'
            )}>
              {i < currentStep ? <Check className="w-3.5 h-3.5" /> : i + 1}
            </div>
            <div className="text-center">
              <div className={cn('text-[12px] font-semibold whitespace-nowrap', i <= currentStep ? 'text-gray-900' : 'text-gray-400')}>
                {step.label}
              </div>
              <div className={cn('text-[10px] whitespace-nowrap', i <= currentStep ? 'text-gray-500' : 'text-gray-300')}>
                {step.description}
              </div>
            </div>
          </div>
          {i < STEPS.length - 1 && (
            <div className={cn('flex-1 h-px mt-3.5 mx-3 transition-colors', i < currentStep ? 'bg-gray-900' : 'bg-gray-200')} />
          )}
        </div>
      ))}
    </div>
  )
}
