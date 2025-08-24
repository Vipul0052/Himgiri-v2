import React from 'react'
import { Link } from 'react-router-dom'

export function DashboardPage() {
  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h1>Himgiri Admin</h1>
      <nav style={{ display: 'flex', gap: 12, margin: '12px 0' }}>
        <Link to="/products">Products</Link>
        <Link to="/orders">Orders</Link>
        <Link to="/inventory">Inventory</Link>
        <Link to="/users">Users</Link>
      </nav>
      <section>
        <h2>Analytics</h2>
        <div>Sales, revenue, orders coming soon.</div>
      </section>
    </div>
  )
}