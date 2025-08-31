import React from 'react'
import { useNavigate } from 'react-router-dom'

export function InventoryPage() {
  const navigate = useNavigate()
  const [items, setItems] = React.useState<any[]>([])
  const [products, setProducts] = React.useState<any[]>([])
  const [productId, setProductId] = React.useState<number>(0)
  const [stock, setStock] = React.useState<number>(0)

  function goBack() { navigate('/') }

  async function load() {
    const [inventoryRes, productsRes] = await Promise.all([
      fetch('/api/admin?action=inventory.list', { credentials: 'include' }),
      fetch('/api/admin?action=products.list', { credentials: 'include' })
    ])
    
    if (inventoryRes.ok) {
      const j = await inventoryRes.json()
      setItems(j.inventory || [])
    }
    
    if (productsRes.ok) {
      const j = await productsRes.json()
      setProducts(j.products || [])
    }
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

  function getProductName(productId: number) {
    const product = products.find(p => p.id === productId)
    return product?.name || `Product #${productId}`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={goBack} className="px-3 h-9 inline-flex items-center rounded-md border hover:bg-gray-50">Back</button>
        <h2 className="text-xl font-semibold">Inventory</h2>
      </div>

      <form onSubmit={setInventory} className="flex flex-wrap gap-3 items-center bg-card border rounded-lg p-4">
        <input placeholder="Product ID" type="number" className="rounded-md border px-3 py-2" value={productId} onChange={e => setProductId(parseInt(e.target.value || '0', 10))} required />
        <input placeholder="Stock" type="number" className="rounded-md border px-3 py-2" value={stock} onChange={e => setStock(parseInt(e.target.value || '0', 10))} required />
        <button type="submit" className="px-4 h-9 rounded-md bg-primary text-primary-foreground">Set</button>
      </form>

      <ul className="space-y-2">
        {items.map(i => {
          const isLowStock = i.stock < 10 && i.stock > 0
          const isOutOfStock = i.stock === 0
          return (
            <li key={i.product_id} className={`bg-card border rounded-lg p-3 ${isLowStock ? 'border-orange-200 bg-orange-50' : isOutOfStock ? 'border-red-200 bg-red-50' : ''}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{getProductName(i.product_id)}</div>
                  <div className="text-sm text-muted-foreground">Stock: {i.stock}</div>
                  {isLowStock && (
                    <div className="text-xs text-orange-600 font-medium mt-1">⚠️ Low stock warning</div>
                  )}
                  {isOutOfStock && (
                    <div className="text-xs text-red-600 font-medium mt-1">🚫 Out of stock</div>
                  )}
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${isLowStock ? 'text-orange-600' : isOutOfStock ? 'text-red-600' : 'text-green-600'}`}>
                    {i.stock}
                  </div>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}