import React from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

interface ProductForm {
  id?: number
  name: string
  in_stock: boolean
  stock: number
  price?: number
  mrp?: number
  discountPct?: number
  image?: string
  category?: string
  description?: string
}

export function ProductsPage() {
  const navigate = useNavigate()
  const [products, setProducts] = React.useState<any[]>([])
  const [form, setForm] = React.useState<ProductForm>({ name: '', in_stock: true, stock: 0, price: undefined, mrp: undefined, discountPct: undefined, image: '', category: '', description: '' })
  const [loading, setLoading] = React.useState(false)

  function goBack() { navigate('/') }

  async function load() {
    const r = await fetch('/api/admin?action=products.list', { credentials: 'include' })
    if (!r.ok) return setProducts([])
    const j = await r.json()
    console.log('Products data loaded:', j.products)
    setProducts(j.products || [])
  }

  React.useEffect(() => {
    load()
    // Realtime subscriptions for all relevant tables
    if (!supabase) return
    const channel = supabase.channel('products_page_changes')
    channel
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'product_meta' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory' }, () => load())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  function toMetaPayload() {
    let price = form.price
    if (form.mrp && form.discountPct != null) {
      const p = Math.round(form.mrp * (1 - form.discountPct / 100))
      price = p
    }
    return {
      price,
      image: form.image,
      category: form.category,
      description: form.description,
    }
  }

  async function editProduct(p: any) {
    const inv = await fetch('/api/admin?action=inventory.list', { credentials: 'include' }).then(r => r.ok ? r.json() : { inventory: [] })
    const stockRow = (inv.inventory || []).find((x: any) => x.product_id === p.id)
    const currentStock = Number(stockRow?.stock || 0)
    
    console.log('Editing product:', p.id, 'current stock:', currentStock, 'meta:', p.meta)
    
    // Calculate MRP and discount from existing price if available
    let mrp = undefined
    let discountPct = undefined
    if (p.meta?.price) {
      // For now, set MRP to price and discount to 0, user can adjust
      mrp = Number(p.meta.price)
      discountPct = 0
    }
    
    setForm({
      id: p.id,
      name: p.name || '',
      in_stock: !!p.in_stock,
      stock: currentStock,
      price: typeof p.meta?.price === 'number' ? Number(p.meta.price) : undefined,
      mrp: mrp,
      discountPct: discountPct,
      image: p.meta?.image || '',
      category: p.meta?.category || '',
      description: p.meta?.description || '',
    })
  }

  async function saveProduct(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    
    console.log('Saving product with form data:', form)
    
    try {
      let productId = form.id
      if (form.id) {
        console.log('Updating existing product:', form.id)
        const r = await fetch('/api/admin?action=products.update', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
          body: JSON.stringify({ id: form.id, name: form.name, in_stock: form.in_stock, meta: toMetaPayload() })
        })
        if (!r.ok) {
          console.error('Product update failed:', r.status)
          return
        }
        const jr = await r.json().catch(() => ({}))
        productId = jr?.product?.id || form.id
        console.log('Product updated successfully, ID:', productId)
      } else {
        console.log('Creating new product')
        const r = await fetch('/api/admin?action=products.create', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
          body: JSON.stringify({ name: form.name, in_stock: form.in_stock, meta: toMetaPayload() })
        })
        if (!r.ok) {
          console.error('Product creation failed:', r.status)
          return
        }
        const jr = await r.json().catch(() => ({}))
        productId = jr?.product?.id
        console.log('Product created successfully, ID:', productId)
      }
      
      // Always update inventory after product save
      if (productId && form.stock >= 0) {
        console.log('Setting inventory for product:', productId, 'stock:', form.stock)
        const inventoryResponse = await fetch('/api/admin?action=inventory.set', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
          body: JSON.stringify({ 
            product_id: productId, 
            stock: form.stock,
            low_stock_threshold: 10
          })
        })
        
        if (inventoryResponse.ok) {
          console.log('Inventory updated successfully')
          const inventoryData = await inventoryResponse.json()
          console.log('Inventory response:', inventoryData)
        } else {
          console.error('Failed to update inventory:', inventoryResponse.status)
          const errorText = await inventoryResponse.text()
          console.error('Inventory error details:', errorText)
        }
      } else {
        console.log('Skipping inventory update - productId:', productId, 'stock:', form.stock)
      }
      
      setForm({ name: '', in_stock: true, stock: 0, price: undefined, mrp: undefined, discountPct: undefined, image: '', category: '', description: '' })
      // Reload to get fresh data including updated stock
      console.log('Reloading products list...')
      await load()
    } finally { setLoading(false) }
  }

  async function deleteProduct(id: number) {
    const r = await fetch('/api/admin?action=products.delete', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ id })
    })
    if (r.ok) load()
  }

  async function adjustStock(p: any, delta: number) {
    const currentStock = Number(p.stock || 0)
    const newStock = Math.max(0, currentStock + delta)
    
    console.log('Adjusting stock for product:', p.id, 'from', currentStock, 'to', newStock)
    
    try {
      const response = await fetch('/api/admin?action=inventory.set', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        credentials: 'include',
        body: JSON.stringify({ 
          product_id: p.id, 
          stock: newStock,
          low_stock_threshold: 10 // Set a default threshold
        })
      })
      
      if (response.ok) {
        console.log('Stock updated successfully, updating local state')
        // Update local state immediately for better UX
        setProducts(prev => prev.map(product => 
          product.id === p.id 
            ? { ...product, stock: newStock, in_stock: newStock > 0 }
            : product
        ))
        // Also reload to ensure consistency
        setTimeout(() => load(), 500)
      } else {
        const errorText = await response.text()
        console.error('Failed to update stock:', response.status, errorText)
      }
    } catch (error) {
      console.error('Error updating stock:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={goBack} className="px-3 h-9 inline-flex items-center rounded-md border hover:bg-gray-50">Back</button>
          <h2 className="text-xl font-semibold">Products</h2>
        </div>
      </div>

      <form onSubmit={saveProduct} className="space-y-4 bg-card border rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">Product Name *</label>
            <input placeholder="Enter product name" className="w-full rounded-md border px-3 py-2" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">Category</label>
            <input placeholder="e.g., nuts, fruits, seeds" className="w-full rounded-md border px-3 py-2" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">Price (₹)</label>
            <input placeholder="0.00" type="number" step="0.01" className="w-full rounded-md border px-3 py-2" value={form.price ?? ''} onChange={e => setForm({ ...form, price: e.target.value === '' ? undefined : parseFloat(e.target.value) })} />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">MRP (₹)</label>
            <input placeholder="0.00" type="number" step="0.01" className="w-full rounded-md border px-3 py-2" value={form.mrp ?? ''} onChange={e => setForm({ ...form, mrp: e.target.value === '' ? undefined : parseFloat(e.target.value) })} />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">Discount %</label>
            <input placeholder="0" type="number" min="0" max="100" step="0.01" className="w-full rounded-md border px-3 py-2" value={form.discountPct ?? ''} onChange={e => setForm({ ...form, discountPct: e.target.value === '' ? undefined : parseFloat(e.target.value) })} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">Stock Quantity</label>
            <input placeholder="0" type="number" min="0" className="w-full rounded-md border px-3 py-2" value={form.stock} onChange={e => setForm({ ...form, stock: parseInt(e.target.value || '0', 10) })} />
          </div>
          <div className="flex items-center gap-2">
            <input id="in_stock" type="checkbox" checked={form.in_stock} onChange={e => setForm({ ...form, in_stock: e.target.checked })} />
            <label htmlFor="in_stock" className="text-sm">In stock</label>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground mb-1 block">Image URL</label>
          <input placeholder="https://example.com/image.jpg" className="w-full rounded-md border px-3 py-2" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} />
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground mb-1 block">Description</label>
          <textarea placeholder="Enter detailed product description..." className="w-full rounded-md border px-3 py-2" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        </div>

        <div className="flex gap-2">
          <button type="submit" disabled={loading} className="px-4 h-9 rounded-md bg-primary text-primary-foreground">{form.id ? 'Update' : 'Create'} product</button>
          <button type="button" disabled={loading} onClick={() => setForm({ name: '', in_stock: true, stock: 0, price: undefined, mrp: undefined, discountPct: undefined, image: '', category: '', description: '' })} className="px-4 h-9 rounded-md border">Clear</button>
        </div>
      </form>

      <ul className="space-y-2">
        {products.map(p => (
          <li key={p.id} className="flex items-center justify-between gap-3 bg-card border rounded-lg p-3">
            <div className="flex items-center gap-3 flex-1">
              {p.meta?.image ? <img src={p.meta.image} alt={p.name} className="w-16 h-16 rounded object-cover" /> : <div className="w-16 h-16 rounded bg-muted" />}
              <div className="flex-1">
                <div className="font-medium">{p.name}</div>
                <div className="text-sm text-muted-foreground">
                  {p.in_stock ? 'In stock' : 'Out of stock'} 
                  {typeof p.meta?.price === 'number' ? ` • ₹${p.meta.price}` : ''}
                  {p.meta?.category ? ` • ${p.meta.category}` : ''}
                </div>
                {p.in_stock && typeof p.stock === 'number' && p.stock < 10 && p.stock > 0 && (
                  <div className="text-xs text-orange-600 font-medium mt-1">⚠️ Only {p.stock} left!</div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => adjustStock(p, -1)} 
                  className="w-8 h-8 rounded-md border flex items-center justify-center hover:bg-gray-50"
                  disabled={!p.in_stock}
                >
                  -
                </button>
                <span className="text-sm w-12 text-center font-medium">{p.stock ?? 0}</span>
                <button 
                  onClick={() => adjustStock(p, +1)} 
                  className="w-8 h-8 rounded-md border flex items-center justify-center hover:bg-gray-50"
                >
                  +
                </button>
              </div>
              <button onClick={() => editProduct(p)} className="px-3 h-8 rounded-md border hover:bg-gray-50">Edit</button>
              <button onClick={() => deleteProduct(p.id)} className="px-3 h-8 rounded-md border text-destructive hover:bg-destructive/10">Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}