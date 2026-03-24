'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { login } from '@/lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      router.push('/setup')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed'
      setError(msg.includes('400') ? 'Invalid email or password.' : msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="white">
              <path d="M8 1L10.5 6H14L10.5 9.5L12 14L8 11L4 14L5.5 9.5L2 6H5.5L8 1Z"/>
            </svg>
          </div>
          <span className="text-base font-semibold text-gray-900 tracking-tight">QA Pipeline</span>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
          <h1 className="text-lg font-semibold text-gray-900 mb-1">Sign in</h1>
          <p className="text-sm text-gray-500 mb-6">Enter your credentials to continue</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-medium text-gray-600">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                className="flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:border-gray-400 transition-colors"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-medium text-gray-600">Password</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                className="flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:border-gray-400 transition-colors"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-9 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          {"Don't have an account? "}
          <Link href="/register" className="text-gray-900 font-medium hover:underline">Register</Link>
        </p>
      </div>
    </div>
  )
}
