import React from 'react'

export function InventoryPage() {
  const [items, setItems] = React.useState<any[]>([])
  const [productId, setProductId] = React.useState<number>(0)
  const [stock, setStock] = React.useState<number>(0)

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
    <div style={{ padding: 20 }}>
      <h2>Inventory</h2>

      <form onSubmit={setInventory} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16 }}>
        <input placeholder="Product ID" type="number" value={productId} onChange={e => setProductId(parseInt(e.target.value || '0', 10))} required />
        <input placeholder="Stock" type="number" value={stock} onChange={e => setStock(parseInt(e.target.value || '0', 10))} required />
        <button type="submit">Set</button>
      </form>

      <ul>
        {items.map(i => (
          <li key={i.product_id}>Product #{i.product_id} - Stock: {i.stock}</li>
        ))}
      </ul>
    </div>
  )
}