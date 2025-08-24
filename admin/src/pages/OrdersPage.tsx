import React from 'react'

export function OrdersPage() {
  const [orders, setOrders] = React.useState<any[]>([])

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
    <div style={{ padding: 20 }}>
      <h2>Orders</h2>
      <ul>
        {orders.map(o => (
          <li key={o.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span>#{o.id} - {o.status} - ₹{o.amount}</span>
            <select value={o.status} onChange={e => updateStatus(o.id, e.target.value)}>
              <option value="pending">pending</option>
              <option value="processing">processing</option>
              <option value="shipped">shipped</option>
              <option value="delivered">delivered</option>
              <option value="cancelled">cancelled</option>
            </select>
          </li>
        ))}
      </ul>
    </div>
  )
}