import React from 'react'

export function ProductsPage() {
  const [products, setProducts] = React.useState<any[]>([])
  const [name, setName] = React.useState('')
  const [price, setPrice] = React.useState<number>(0)

  async function load() {
    const r = await fetch('/api/admin?action=products.list', { credentials: 'include' })
    if (!r.ok) return setProducts([])
    const j = await r.json()
    setProducts(j.products || [])
  }

  React.useEffect(() => { load() }, [])

  async function createProduct(e: React.FormEvent) {
    e.preventDefault()
    const r = await fetch('/api/admin?action=products.create', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ name, price })
    })
    if (r.ok) { setName(''); setPrice(0); load() }
  }

  async function deleteProduct(id: number) {
    const r = await fetch('/api/admin?action=products.delete', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ id })
    })
    if (r.ok) load()
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Products</h2>

      <form onSubmit={createProduct} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16 }}>
        <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} required />
        <input placeholder="Price" type="number" value={price} onChange={e => setPrice(parseFloat(e.target.value))} required />
        <button type="submit">Add</button>
      </form>

      <ul>
        {products.map(p => (
          <li key={p.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span>{p.name} - ₹{p.price}</span>
            <button onClick={() => deleteProduct(p.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}