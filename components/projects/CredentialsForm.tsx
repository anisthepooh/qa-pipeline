'use client'

import { useEffect, useState } from 'react'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UserCredential } from '@/types'

interface CredentialsFormProps {
  projectId: string
  onSuccess: (credential: UserCredential) => void
  onCancel: () => void
}

export function CredentialsForm({ projectId, onSuccess, onCancel }: CredentialsFormProps) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/projects/${projectId}/credentials`)
      .then(r => r.json())
      .then(data => {
        if (data) {
          setUsername(data.username || '')
          setEmail(data.email || '')
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [projectId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/credentials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to save credentials'); return }
      onSuccess(data)
    } catch {
      setError('Failed to save credentials')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="h-32 flex items-center justify-center">
        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-xs text-gray-500">
        These credentials will be used by Playwright to log in before running test stories.
      </p>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="cred-username">
            Username <span className="text-gray-400 font-normal">(optional)</span>
          </Label>
          <Input
            id="cred-username"
            placeholder="testuser"
            value={username}
            onChange={e => setUsername(e.target.value)}
            autoComplete="off"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cred-email">
            Email <span className="text-gray-400 font-normal">(optional)</span>
          </Label>
          <Input
            id="cred-email"
            type="email"
            placeholder="test@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="off"
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="cred-password">Password</Label>
        <div className="relative">
          <Input
            id="cred-password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Leave blank to keep existing"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="new-password"
            className="pr-9"
          />
          <button
            type="button"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            onClick={() => setShowPassword(v => !v)}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <div className="flex items-center justify-end gap-2 pt-1">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={submitting}>
          {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          Save credentials
        </Button>
      </div>
    </form>
  )
}
