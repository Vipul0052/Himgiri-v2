import React from 'react'

export function UsersPage() {
  const [users, setUsers] = React.useState<any[]>([])

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
    <div style={{ padding: 20 }}>
      <h2>Users</h2>
      <ul>
        {users.map(u => (
          <li key={u.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span>{u.email} - {u.role}</span>
            <select value={u.role} onChange={e => setRole(u.id, e.target.value)}>
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
          </li>
        ))}
      </ul>
    </div>
  )
}