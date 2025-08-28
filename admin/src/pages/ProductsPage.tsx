import React from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

interface ProductForm {
  id?: number
  name: string
  in_stock: boolean
  stock: number
  price?: number
  image?: string
  category?: string
  description?: string
}

export function ProductsPage() {
  const navigate = useNavigate()
  const [products, setProducts] = React.useState<any[]>([])
  const [form, setForm] = React.useState<ProductForm>({ name: '', in_stock: true, stock: 0, price: undefined, image: '', category: '', description: '' })
  const [loading, setLoading] = React.useState(false)

  function goBack() { navigate('/') }

  async function load() {
    const r = await fetch('/api/admin?action=products.list', { credentials: 'include' })
    if (!r.ok) return setProducts([])
    const j = await r.json()
    setProducts(j.products || [])
  }

  React.useEffect(() => { load() }, [])
  React.useEffect(() => {
    if (!supabase) return
    const channel = supabase
      .channel('admin-products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'product_meta' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory' }, () => load())
      .subscribe()
    return () => { supabase?.removeChannel(channel) }
  }, [])

  function toMetaPayload() {
    return {
      price: form.price,
      image: form.image,
      category: form.category,
      description: form.description,
    }
  }

  async function saveProduct(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      let productId = form.id
      if (form.id) {
        const r = await fetch('/api/admin?action=products.update', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
          body: JSON.stringify({ id: form.id, name: form.name, in_stock: form.in_stock, meta: toMetaPayload() })
        })
        if (!r.ok) return
        const jr = await r.json().catch(() => ({}))
        productId = jr?.product?.id || form.id
      } else {
        const r = await fetch('/api/admin?action=products.create', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
          body: JSON.stringify({ name: form.name, in_stock: form.in_stock, meta: toMetaPayload() })
        })
        if (!r.ok) return
        const jr = await r.json().catch(() => ({}))
        productId = jr?.product?.id
      }
      if (productId && form.stock >= 0) {
        await fetch('/api/admin?action=inventory.set', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
          body: JSON.stringify({ product_id: productId, stock: form.stock })
        }).catch(() => {})
      }
      setForm({ name: '', in_stock: true, stock: 0, price: undefined, image: '', category: '', description: '' })
      load()
    } finally { setLoading(false) }
  }

  async function editProduct(p: any) {
    const inv = await fetch('/api/admin?action=inventory.list', { credentials: 'include' }).then(r => r.ok ? r.json() : { inventory: [] })
    const stockRow = (inv.inventory || []).find((x: any) => x.product_id === p.id)
    setForm({
      id: p.id,
      name: p.name || '',
      in_stock: !!p.in_stock,
      stock: Number(stockRow?.stock || 0),
      price: p.meta?.price !== undefined ? Number(p.meta.price) : undefined,
      image: p.meta?.image || '',
      category: p.meta?.category || '',
      description: p.meta?.description || '',
    })
  }

  async function deleteProduct(id: number) {
    const r = await fetch('/api/admin?action=products.delete', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ id })
    })
    if (r.ok) load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={goBack} className="px-3 h-9 inline-flex items-center rounded-md border hover:bg-accent/10">Back</button>
          <h2 className="text-xl font-semibold">Products</h2>
        </div>
      </div>

      <form onSubmit={saveProduct} className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-card border rounded-lg p-4">
        <input placeholder="Name" className="rounded-md border px-3 py-2" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
        <div className="flex items-center gap-2">
          <input id="in_stock" type="checkbox" checked={form.in_stock} onChange={e => setForm({ ...form, in_stock: e.target.checked })} />
          <label htmlFor="in_stock" className="text-sm">In stock</label>
        </div>
        <input placeholder="Stock quantity" type="number" className="rounded-md border px-3 py-2" value={form.stock} onChange={e => setForm({ ...form, stock: parseInt(e.target.value || '0', 10) })} />
        <input placeholder="Price" type="number" className="rounded-md border px-3 py-2" value={form.price ?? ''} onChange={e => setForm({ ...form, price: e.target.value === '' ? undefined : parseFloat(e.target.value) })} />
        <input placeholder="Image URL" className="rounded-md border px-3 py-2" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} />
        <input placeholder="Category" className="rounded-md border px-3 py-2" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
        <textarea placeholder="Description" className="rounded-md border px-3 py-2 md:col-span-2" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        <div className="md:col-span-2 flex gap-2">
          <button type="submit" disabled={loading} className="px-4 h-9 rounded-md bg-primary text-primary-foreground">{form.id ? 'Update' : 'Create'} product</button>
          <button type="button" disabled={loading} onClick={() => setForm({ name: '', in_stock: true, stock: 0, price: undefined, image: '', category: '', description: '' })} className="px-4 h-9 rounded-md border">Clear</button>
        </div>
      </form>

      <ul className="space-y-2">
        {products.map(p => (
          <li key={p.id} className="flex items-center justify-between gap-3 bg-card border rounded-lg p-3">
            <div className="flex items-center gap-3">
              {p.meta?.image ? <img src={p.meta.image} alt={p.name} className="w-10 h-10 rounded object-cover" /> : <div className="w-10 h-10 rounded bg-muted" />}
              <div>
                <div className="font-medium">{p.name}</div>
                <div className="text-sm text-muted-foreground">{p.in_stock ? 'In stock' : 'Out of stock'}{p.meta?.price ? ` • ₹${Number(p.meta.price)}` : ''}{p.meta?.category ? ` • ${p.meta.category}` : ''}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => editProduct(p)} className="px-3 h-8 rounded-md border">Edit</button>
              <button onClick={() => deleteProduct(p.id)} className="px-3 h-8 rounded-md border text-destructive">Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}