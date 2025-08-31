import React from 'react'
import { useNavigate } from 'react-router-dom'

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [showPassword, setShowPassword] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [submitting, setSubmitting] = React.useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const r = await fetch('/api/admin?action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      })
      if (!r.ok) {
        const j = await r.json().catch(() => ({}))
        setError(j?.message || 'Login failed')
        return
      }
      navigate('/')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-card border rounded-lg p-6 shadow-sm">
        <h1 className="text-lg font-semibold mb-6">Welcome to Himgiri Naturals admin</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm" htmlFor="email">Email</label>
            <input id="email" className="w-full rounded-md border bg-input-background px-3 py-2 outline-none focus:ring-2 ring-ring"
              value={email} onChange={e => setEmail(e.target.value)} type="email" required />
          </div>
          <div className="space-y-2">
            <label className="text-sm" htmlFor="password">Password</label>
            <div className="relative">
              <input id="password" className="w-full rounded-md border bg-input-background px-3 py-2 pr-10 outline-none focus:ring-2 ring-ring"
                value={password} onChange={e => setPassword(e.target.value)} type={showPassword ? 'text' : 'password'} required />
              <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute inset-y-0 right-2 my-auto h-8 px-2 rounded-md text-sm border bg-background">
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={submitting || !email || !password}
            className="w-full inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground h-10 disabled:opacity-60">
            {submitting ? 'Logging in…' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}