import React from 'react'
import { useNavigate } from 'react-router-dom'

export function OrdersPage() {
  const navigate = useNavigate()
  const [orders, setOrders] = React.useState<any[]>([])

  function goBack() { navigate('/') }

  async function load() {
    const r = await fetch('/api/admin?action=orders.list', { credentials: 'include' })
    if (!r.ok) return setOrders([])
    const j = await r.json()
    setOrders(j.orders || [])
  }

  React.useEffect(() => { load() }, [])

  async function updateStatus(id: number, status: string) {
    const r = await fetch('/api/admin?action=orders.update-status', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ id, status })
    })
    if (r.ok) load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={goBack} className="px-3 h-9 inline-flex items-center rounded-md border hover:bg-accent/10">Back</button>
        <h2 className="text-xl font-semibold">Orders</h2>
      </div>

      <ul className="space-y-2">
        {orders.map(o => (
          <li key={o.id} className="bg-card border rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Order #{o.id} • ₹{o.amount}</div>
                <div className="text-sm text-muted-foreground">{o.email || '—'} {o.name ? `• ${o.name}` : ''}</div>
              </div>
              <select value={o.status} onChange={e => updateStatus(o.id, e.target.value)} className="rounded-md border px-2 h-9">
                <option value="pending">pending</option>
                <option value="processing">processing</option>
                <option value="shipped">shipped</option>
                <option value="delivered">delivered</option>
                <option value="cancelled">cancelled</option>
              </select>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}