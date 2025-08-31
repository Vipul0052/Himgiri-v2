import React from 'react'
import { useNavigate } from 'react-router-dom'

interface CategoryForm { id?: number; name: string; description?: string; image?: string; sort?: number }

export function CategoriesPage() {
  const navigate = useNavigate()
  const [categories, setCategories] = React.useState<any[]>([])
  const [form, setForm] = React.useState<CategoryForm>({ name: '', description: '', image: '', sort: 0 })
  const [loading, setLoading] = React.useState(false)

  function goBack() { navigate('/') }

  async function load() {
    const r = await fetch('/api/admin?action=categories.list', { credentials: 'include' })
    const j = r.ok ? await r.json() : { categories: [] }
    setCategories(j.categories || [])
  }

  React.useEffect(() => { load() }, [])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      if (form.id) {
        await fetch('/api/admin?action=categories.update', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(form) })
      } else {
        await fetch('/api/admin?action=categories.create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(form) })
      }
      setForm({ name: '', description: '', image: '', sort: 0 })
      load()
    } finally { setLoading(false) }
  }

  async function edit(c: any) { setForm({ id: c.id, name: c.name || '', description: c.description || '', image: c.image || '', sort: c.sort || 0 }) }
  async function del(id: number) { await fetch('/api/admin?action=categories.delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ id }) }); load() }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={goBack} className="px-3 h-9 inline-flex items-center rounded-md border hover:bg-gray-50">Back</button>
          <h2 className="text-xl font-semibold">Categories</h2>
        </div>
      </div>

      <form onSubmit={save} className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-card border rounded-lg p-4">
        <input placeholder="Name" className="rounded-md border px-3 py-2" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
        <input placeholder="Sort" type="number" className="rounded-md border px-3 py-2" value={form.sort ?? 0} onChange={e => setForm({ ...form, sort: parseInt(e.target.value || '0', 10) })} />
        <input placeholder="Image URL" className="rounded-md border px-3 py-2 md:col-span-2" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} />
        <textarea placeholder="Description" className="rounded-md border px-3 py-2 md:col-span-2" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        <div className="md:col-span-2 flex gap-2">
          <button type="submit" disabled={loading} className="px-4 h-9 rounded-md bg-primary text-primary-foreground">{form.id ? 'Update' : 'Create'} category</button>
          <button type="button" disabled={loading} onClick={() => setForm({ name: '', description: '', image: '', sort: 0 })} className="px-4 h-9 rounded-md border">Clear</button>
        </div>
      </form>

      <ul className="space-y-2">
        {categories.map(c => (
          <li key={c.id} className="flex items-center justify-between gap-3 bg-card border rounded-lg p-3">
            <div className="flex items-center gap-3">
              {c.image ? <img src={c.image} alt={c.name} className="w-10 h-10 rounded object-cover" /> : <div className="w-10 h-10 rounded bg-muted" />}
              <div>
                <div className="font-medium">{c.name}</div>
                <div className="text-sm text-muted-foreground">{c.description}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => edit(c)} className="px-3 h-8 rounded-md border">Edit</button>
              <button onClick={() => del(c.id)} className="px-3 h-8 rounded-md border text-destructive">Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}