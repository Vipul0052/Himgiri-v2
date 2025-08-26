import React from 'react'
import { useNavigate } from 'react-router-dom'

export function InventoryPage() {
  const navigate = useNavigate()
  const [items, setItems] = React.useState<any[]>([])
  const [productId, setProductId] = React.useState<number>(0)
  const [stock, setStock] = React.useState<number>(0)

  function goBack() { navigate('/') }

  async function load() {
    const r = await fetch('/api/admin?action=inventory.list', { credentials: 'include' })
    if (!r.ok) return setItems([])
    const j = await r.json()
    setItems(j.inventory || [])
  }

  React.useEffect(() => { load() }, [])

  async function setInventory(e: React.FormEvent) {
    e.preventDefault()
    const r = await fetch('/api/admin?action=inventory.set', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ product_id: productId, stock })
    })
    if (r.ok) { setProductId(0); setStock(0); load() }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={goBack} className="px-3 h-9 inline-flex items-center rounded-md border hover:bg-accent/10">Back</button>
        <h2 className="text-xl font-semibold">Inventory</h2>
      </div>

      <form onSubmit={setInventory} className="flex flex-wrap gap-3 items-center bg-card border rounded-lg p-4">
        <input placeholder="Product ID" type="number" className="rounded-md border px-3 py-2" value={productId} onChange={e => setProductId(parseInt(e.target.value || '0', 10))} required />
        <input placeholder="Stock" type="number" className="rounded-md border px-3 py-2" value={stock} onChange={e => setStock(parseInt(e.target.value || '0', 10))} required />
        <button type="submit" className="px-4 h-9 rounded-md bg-primary text-primary-foreground">Set</button>
      </form>

      <ul className="space-y-2">
        {items.map(i => (
          <li key={i.product_id} className="bg-card border rounded-lg p-3">Product #{i.product_id} - Stock: {i.stock}</li>
        ))}
      </ul>
    </div>
  )
}