import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Logo } from '../../../components/Logo'

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
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
        <div className="flex items-center gap-2 mb-6">
          <Logo size="md" showText className="select-none" />
          <h1 className="text-lg font-semibold">Admin Login</h1>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm" htmlFor="email">Email</label>
            <input id="email" className="w-full rounded-md border bg-input-background px-3 py-2 outline-none focus:ring-2 ring-ring"
              value={email} onChange={e => setEmail(e.target.value)} type="email" required />
          </div>
          <div className="space-y-2">
            <label className="text-sm" htmlFor="password">Password</label>
            <input id="password" className="w-full rounded-md border bg-input-background px-3 py-2 outline-none focus:ring-2 ring-ring"
              value={password} onChange={e => setPassword(e.target.value)} type="password" required />
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