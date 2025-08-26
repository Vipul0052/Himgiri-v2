import React from 'react'
import { Link } from 'react-router-dom'

export function DashboardPage() {
  function goBack() {
    if (window.history.length > 1) {
      window.history.back()
    } else {
      window.location.href = '/'
    }
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={goBack} className="px-3 h-9 inline-flex items-center rounded-md border">Back</button>
          <div>
            <h1 className="text-2xl font-semibold">Himgiri Admin</h1>
            <p className="text-sm text-muted-foreground">Manage products, orders, users and inventory</p>
          </div>
        </div>
        <nav className="flex gap-2">
          <Link to="/products" className="px-3 h-9 inline-flex items-center rounded-md border">Products</Link>
          <Link to="/orders" className="px-3 h-9 inline-flex items-center rounded-md border">Orders</Link>
          <Link to="/inventory" className="px-3 h-9 inline-flex items-center rounded-md border">Inventory</Link>
          <Link to="/users" className="px-3 h-9 inline-flex items-center rounded-md border">Users</Link>
        </nav>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Total Sales</div>
          <div className="text-2xl font-semibold mt-1">₹ —</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Orders</div>
          <div className="text-2xl font-semibold mt-1">—</div>
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
        <div className="text-sm text-muted-foreground">Coming soon</div>
      </div>
    </div>
  )
}