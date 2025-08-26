import React from 'react'
import { Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { ProductsPage } from './pages/ProductsPage'
import { OrdersPage } from './pages/OrdersPage'
import { UsersPage } from './pages/UsersPage'
import { InventoryPage } from './pages/InventoryPage'
import { Logo } from '../../components/Logo'

function useAuth() {
  const [isAdmin, setIsAdmin] = React.useState<boolean>(false)
  const [loading, setLoading] = React.useState<boolean>(true)
  React.useEffect(() => {
    let cancelled = false
    async function run() {
      try {
        const r = await fetch('/api/admin?action=session', { credentials: 'include' })
        const j = r.ok ? await r.json() : { admin: false }
        if (!cancelled) setIsAdmin(!!j?.admin)
      } catch {
        if (!cancelled) setIsAdmin(false)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => { cancelled = true }
  }, [])
  return { isAdmin, loading }
}

function Protected({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useAuth()
  if (loading) return null
  if (!isAdmin) return <Navigate to="/login" replace />
  return <>{children}</>
}

export function App() {
  const [dark, setDark] = React.useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  async function handleLogout() {
    try {
      await fetch('/api/admin?action=logout', { method: 'POST', credentials: 'include' })
    } catch {}
    navigate('/login', { replace: true })
  }

  const tabs = [
    { to: '/', label: 'Dashboard' },
    { to: '/products', label: 'Products' },
    { to: '/orders', label: 'Orders' },
    { to: '/inventory', label: 'Inventory' },
    { to: '/users', label: 'Users' },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex items-center justify-between px-6 py-4 border-b">
        <div className="flex items-center gap-4">
          <Logo size="md" showText className="select-none" onClick={() => navigate('/')} />
          <nav className="hidden md:flex items-center gap-1">
            {tabs.map(t => (
              <Link key={t.to} to={t.to} className={`px-3 h-9 inline-flex items-center rounded-md border ${location.pathname === t.to ? 'bg-accent/20' : ''}`}>
                {t.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setDark(v => !v)} className="text-sm px-3 h-9 rounded-md border">
            {dark ? 'Light' : 'Dark'} mode
          </button>
          <button onClick={handleLogout} className="text-sm px-3 h-9 rounded-md border">
            Logout
          </button>
        </div>
      </header>
      <main className="max-w-6xl mx-auto p-6">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Protected><DashboardPage /></Protected>} />
          <Route path="/products" element={<Protected><ProductsPage /></Protected>} />
          <Route path="/orders" element={<Protected><OrdersPage /></Protected>} />
          <Route path="/users" element={<Protected><UsersPage /></Protected>} />
          <Route path="/inventory" element={<Protected><InventoryPage /></Protected>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}