'use client'

import { useState, useEffect } from 'react'
import { Check } from 'lucide-react'

type Provider = 'gemini' | 'openrouter'

const OPENROUTER_MODELS = [
  { value: 'google/gemini-2.5-flash',          label: 'Gemini 2.5 Flash' },
  { value: 'google/gemini-2.5-pro',             label: 'Gemini 2.5 Pro' },
  { value: 'anthropic/claude-sonnet-4-5',       label: 'Claude Sonnet 4.5' },
  { value: 'anthropic/claude-opus-4',           label: 'Claude Opus 4' },
]

export default function SettingsPage() {
  const [provider, setProvider] = useState<Provider>('gemini')
  const [geminiKey, setGeminiKey] = useState('')
  const [openrouterKey, setOpenrouterKey] = useState('')
  const [openrouterModel, setOpenrouterModel] = useState('google/gemini-2.5-flash')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setProvider((localStorage.getItem('ai_provider') as Provider) || 'gemini')
    setGeminiKey(localStorage.getItem('gemini_api_key') || '')
    setOpenrouterKey(localStorage.getItem('openrouter_api_key') || '')
    setOpenrouterModel(localStorage.getItem('openrouter_model') || 'google/gemini-2.5-flash')
  }, [])

  const handleSave = () => {
    localStorage.setItem('ai_provider', provider)

    if (geminiKey.trim()) {
      localStorage.setItem('gemini_api_key', geminiKey.trim())
    } else {
      localStorage.removeItem('gemini_api_key')
    }

    if (openrouterKey.trim()) {
      localStorage.setItem('openrouter_api_key', openrouterKey.trim())
    } else {
      localStorage.removeItem('openrouter_api_key')
    }

    localStorage.setItem('openrouter_model', openrouterModel)

    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-xl mx-auto py-12 px-6">
      <h1 className="text-[15px] font-semibold text-gray-900 mb-1">Settings</h1>
      <p className="text-[13px] text-gray-500 mb-8">Configure API keys and preferences.</p>

      <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-3">AI Provider</div>

          {/* Provider tab selector */}
          <div className="inline-flex gap-1 bg-gray-100 rounded-md p-1 mb-4">
            <button
              onClick={() => setProvider('gemini')}
              className={`px-3 py-1.5 text-[13px] rounded-md transition-colors ${
                provider === 'gemini'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-500 hover:bg-gray-200'
              }`}
            >
              Gemini (direct)
            </button>
            <button
              onClick={() => setProvider('openrouter')}
              className={`px-3 py-1.5 text-[13px] rounded-md transition-colors ${
                provider === 'openrouter'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-500 hover:bg-gray-200'
              }`}
            >
              OpenRouter
            </button>
          </div>

          {/* Gemini section */}
          {provider === 'gemini' && (
            <div className="space-y-2">
              <label className="block text-[13px] font-medium text-gray-700">
                Gemini API Key
              </label>
              <p className="text-[12px] text-gray-400">
                Used to analyse screenshots during test runs. If set here, overrides the server-side env variable.
              </p>
              <input
                type="password"
                value={geminiKey}
                onChange={e => setGeminiKey(e.target.value)}
                placeholder="AIza..."
                className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 font-mono"
              />
            </div>
          )}

          {/* OpenRouter section */}
          {provider === 'openrouter' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-[13px] font-medium text-gray-700">
                  OpenRouter API Key
                </label>
                <p className="text-[12px] text-gray-400">
                  A single key to access Gemini and Claude models. Get one at openrouter.ai.
                </p>
                <input
                  type="password"
                  value={openrouterKey}
                  onChange={e => setOpenrouterKey(e.target.value)}
                  placeholder="sk-or-..."
                  className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 font-mono"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[13px] font-medium text-gray-700">
                  Model
                </label>
                <select
                  value={openrouterModel}
                  onChange={e => setOpenrouterModel(e.target.value)}
                  className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 bg-white"
                >
                  {OPENROUTER_MODELS.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={handleSave}
            className="px-4 py-1.5 text-[13px] font-medium bg-gray-900 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Save
          </button>
          {saved && (
            <span className="flex items-center gap-1 text-[12px] text-green-600">
              <Check className="w-3 h-3" /> Saved
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
