import React from 'react'
import { Routes, Route, Navigate, Link } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { ProductsPage } from './pages/ProductsPage'
import { OrdersPage } from './pages/OrdersPage'
import { UsersPage } from './pages/UsersPage'
import { InventoryPage } from './pages/InventoryPage'

function useAuth() {
  const [isAdmin, setIsAdmin] = React.useState<boolean>(false)
  React.useEffect(() => {
    // Ping admin session
    fetch('/api/admin?action=session', { credentials: 'include' })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => setIsAdmin(!!data?.admin))
      .catch(() => setIsAdmin(false))
  }, [])
  return { isAdmin, setIsAdmin }
}

function Protected({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useAuth()
  if (!isAdmin) return <Navigate to="/login" replace />
  return <>{children}</>
}

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Protected><DashboardPage /></Protected>} />
      <Route path="/products" element={<Protected><ProductsPage /></Protected>} />
      <Route path="/orders" element={<Protected><OrdersPage /></Protected>} />
      <Route path="/users" element={<Protected><UsersPage /></Protected>} />
      <Route path="/inventory" element={<Protected><InventoryPage /></Protected>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}