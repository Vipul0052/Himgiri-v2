import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' })
  try {
    const { name = '', email, password } = req.body as { name?: string; email?: string; password?: string }
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' })

    const supabaseUrl = process.env.SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE
    if (!supabaseUrl || !serviceRoleKey) return res.status(500).json({ message: 'Server not configured' })
    const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })

    const passwordHash = await bcrypt.hash(password, 10)
    const { error } = await supabase.from('users').insert([{ email, password_hash: passwordHash, name }])
    if (error) {
      if ((error as any).code === '23505') return res.status(409).json({ message: 'Email already exists' })
      return res.status(500).json({ message: 'Signup failed' })
    }
    res.status(200).json({ ok: true })
  } catch (e) {
    console.error('Signup error:', e)
    res.status(500).json({ message: 'Signup failed' })
  }
}

