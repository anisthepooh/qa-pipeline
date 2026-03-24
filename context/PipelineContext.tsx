'use client'

import { createContext, useContext, useReducer, ReactNode } from 'react'
import { Config, Story, RunResult, RunMeta } from '@/types'

interface PipelineState {
  config: Config
  stories: Story[]
  activeRun: RunResult | null
  savedRuns: RunMeta[]
  isRunning: boolean
}

type Action =
  | { type: 'SET_CONFIG'; payload: Partial<Config> }
  | { type: 'ADD_STORY'; payload: Story }
  | { type: 'REMOVE_STORY'; payload: number }
  | { type: 'REORDER_STORIES'; payload: Story[] }
  | { type: 'SET_ACTIVE_RUN'; payload: RunResult | null }
  | { type: 'SET_SAVED_RUNS'; payload: RunMeta[] }
  | { type: 'SET_RUNNING'; payload: boolean }

const initialState: PipelineState = {
  config: {
    url: '',
    runName: 'QA Run',
    tester: 'Claude (automated)',
    categories: ['flow', 'deadend', 'bugs', 'ux', 'design', 'a11y'],
  },
  stories: [],
  activeRun: null,
  savedRuns: [],
  isRunning: false,
}

function reducer(state: PipelineState, action: Action): PipelineState {
  switch (action.type) {
    case 'SET_CONFIG':
      return { ...state, config: { ...state.config, ...action.payload } }
    case 'ADD_STORY': {
      const stories = [...state.stories, action.payload]
      return { ...state, stories }
    }
    case 'REMOVE_STORY': {
      const stories = state.stories.filter((_, i) => i !== action.payload)
      return { ...state, stories }
    }
    case 'REORDER_STORIES':
      return { ...state, stories: action.payload }
    case 'SET_ACTIVE_RUN':
      return { ...state, activeRun: action.payload }
    case 'SET_SAVED_RUNS':
      return { ...state, savedRuns: action.payload }
    case 'SET_RUNNING':
      return { ...state, isRunning: action.payload }
    default:
      return state
  }
}

const PipelineContext = createContext<{ state: PipelineState; dispatch: React.Dispatch<Action> } | null>(null)

export function PipelineProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  return (
    <PipelineContext.Provider value={{ state, dispatch }}>
      {children}
    </PipelineContext.Provider>
  )
}

export function usePipeline() {
  const ctx = useContext(PipelineContext)
  if (!ctx) throw new Error('usePipeline must be used within PipelineProvider')
  return ctx
}
