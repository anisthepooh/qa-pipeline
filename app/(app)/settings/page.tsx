'use client'

import { useState, useEffect } from 'react'
import { Check } from 'lucide-react'

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setApiKey(localStorage.getItem('gemini_api_key') || '')
  }, [])

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem('gemini_api_key', apiKey.trim())
    } else {
      localStorage.removeItem('gemini_api_key')
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-xl mx-auto py-12 px-6">
      <h1 className="text-[15px] font-semibold text-gray-900 mb-1">Settings</h1>
      <p className="text-[13px] text-gray-500 mb-8">Configure API keys and preferences.</p>

      <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-3">AI</div>
          <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
            Gemini API Key
          </label>
          <p className="text-[12px] text-gray-400 mb-2">
            Used to analyse screenshots during test runs. If set here, overrides the server-side env variable.
          </p>
          <input
            type="password"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder="AIza..."
            className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 font-mono"
          />
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
