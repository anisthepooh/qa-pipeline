'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePipeline } from '@/context/PipelineContext'
import Stepper from '@/components/setup/Stepper'
import StepConfig from '@/components/setup/StepConfig'
import StepStories from '@/components/setup/StepStories'
import StepRun from '@/components/setup/StepRun'
import { STEPS } from '@/app/constants/constants'

export default function SetupPage() {
  const [step, setStep] = useState(0)
  const { state, dispatch } = usePipeline()
  const { config, stories, projects, activeProject } = state
  const router = useRouter()

  useEffect(() => {
    if (projects.length === 0) {
      fetch('/api/projects')
        .then(r => r.json())
        .then(data => { if (Array.isArray(data)) dispatch({ type: 'SET_PROJECTS', payload: data }) })
        .catch(() => {})
    }
  }, [projects.length, dispatch])

  const canAdvance = [true, stories.length > 0, true]

  return (
    <div className="fade-in">
      <Stepper currentStep={step} />

      <div className="p-7 max-w-2xl space-y-5">
        {step === 0 && (
          <StepConfig
            config={config}
            dispatch={dispatch}
            projects={projects}
            activeProject={activeProject}
          />
        )}
        {step === 1 && (
          <StepStories
            stories={stories}
            dispatch={dispatch as React.Dispatch<{ type: string; payload: unknown }>}
          />
        )}
        {step === 2 && (
          <StepRun
            config={config}
            stories={stories}
            dispatch={dispatch as React.Dispatch<{ type: string; payload: unknown }>}
            router={router}
          />
        )}

        <div className="flex items-center gap-3 pt-1">
          {step > 0 && (
            <Button variant="outline" onClick={() => setStep(s => s - 1)}>
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          )}
          {step < STEPS.length - 1 && (
            <Button onClick={() => setStep(s => s + 1)} disabled={!canAdvance[step]}>
              Continue
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
