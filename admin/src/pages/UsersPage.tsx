import React from 'react'
import { useNavigate } from 'react-router-dom'

export function UsersPage() {
  const navigate = useNavigate()
  const [users, setUsers] = React.useState<any[]>([])

  function goBack() { navigate('/') }

  async function load() {
    const r = await fetch('/api/admin?action=users.list', { credentials: 'include' })
    if (!r.ok) return setUsers([])
    const j = await r.json()
    setUsers(j.users || [])
  }

  React.useEffect(() => { load() }, [])

  async function setRole(user_id: number, role: string) {
    const r = await fetch('/api/admin?action=users.set-role', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ user_id, role })
    })
    if (r.ok) load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={goBack} className="px-3 h-9 inline-flex items-center rounded-md border hover:bg-gray-50">Back</button>
        <h2 className="text-xl font-semibold">Users</h2>
      </div>
      <ul className="space-y-2">
        {users.map(u => (
          <li key={u.id} className="flex items-center justify-between gap-3 bg-card border rounded-lg p-3">
            <div>
              <div className="font-medium">{u.email}</div>
              <div className="text-sm text-muted-foreground">{u.name || '—'}</div>
            </div>
            <select value={u.role} onChange={e => setRole(u.id, e.target.value)} className="rounded-md border px-2 h-9">
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
          </li>
        ))}
      </ul>
    </div>
  )
}