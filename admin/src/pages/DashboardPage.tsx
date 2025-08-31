import React from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export function DashboardPage() {
  const [totals, setTotals] = React.useState<{ totalRevenue: number; totalOrders: number }>({ totalRevenue: 0, totalOrders: 0 })
  const [recent, setRecent] = React.useState<any[]>([])

  async function load() {
    try {
      const a = await fetch('/api/admin?action=analytics.overview', { credentials: 'include' })
      if (a.ok) {
        const j = await a.json()
        setTotals({ totalRevenue: j.totalRevenue || 0, totalOrders: j.totalOrders || 0 })
      }
      const o = await fetch('/api/admin?action=orders.list', { credentials: 'include' })
      if (o.ok) {
        const j = await o.json()
        setRecent((j.orders || []).slice(0, 5))
      }
    } catch {}
  }

  React.useEffect(() => { load() }, [])
  React.useEffect(() => {
    const t = setInterval(load, 10000)
    let channel: any
    if (supabase) {
      channel = supabase
        .channel('admin-dashboard-orders')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => load())
        .subscribe()
    }
    return () => { clearInterval(t); if (channel && supabase) supabase.removeChannel(channel) }
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="ml-1">
          <h1 className="text-2xl font-semibold">Himgiri Admin</h1>
          <p className="text-sm text-muted-foreground">Manage products, orders, users and inventory</p>
        </div>
        <nav className="flex gap-2">
          <Link to="/products" className="px-3 h-9 inline-flex items-center rounded-md border hover:bg-gray-50">Products</Link>
          <Link to="/orders" className="px-3 h-9 inline-flex items-center rounded-md border hover:bg-gray-50">Orders</Link>
          <Link to="/inventory" className="px-3 h-9 inline-flex items-center rounded-md border hover:bg-gray-50">Inventory</Link>
          <Link to="/users" className="px-3 h-9 inline-flex items-center rounded-md border hover:bg-gray-50">Users</Link>
        </nav>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Total Sales</div>
          <div className="text-2xl font-semibold mt-1">₹ {totals.totalRevenue.toLocaleString()}</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Orders</div>
          <div className="text-2xl font-semibold mt-1">{totals.totalOrders}</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Products</div>
          <div className="text-2xl font-semibold mt-1">—</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Low Stock</div>
          <div className="text-2xl font-semibold mt-1">—</div>
        </div>
      </div>

      <div className="bg-card border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-3">Recent Orders</h2>
        <ul className="space-y-2">
          {recent.map(r => (
            <li key={r.id} className="flex items-center justify-between">
              <div className="text-sm">#{r.id} • {r.email || '—'} • ₹{r.amount}</div>
              <div className="text-xs text-muted-foreground">{r.status}</div>
            </li>
          ))}
          {recent.length === 0 && (
            <div className="text-sm text-muted-foreground">No orders yet</div>
          )}
        </ul>
      </div>
    </div>
  )
}